import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { Slice, MockUSDC } from "../types";
import { MaxUint256, parseUnits } from "ethers";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForIndex(checkFn: () => Promise<boolean>, errorMessage: string, maxRetries = 20, step = 2000) {
  process.stdout.write("    ⏳ Waiting for index...");
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (await checkFn()) {
        process.stdout.write(" Ready! 🚀\n");
        return;
      }
    } catch (e) {
      // Ignore transient errors
    }
    process.stdout.write(".");
    await sleep(step);
  }
  throw new Error(`\n❌ Timeout: ${errorMessage}`);
}

async function ensureFunds(ethers: any, usdc: MockUSDC, funder: any, recipient: any) {
  // 1. ETH Check
  const ethBal = await ethers.provider.getBalance(recipient.address);
  // Fund if less than 0.00001 ETH
  if (ethBal < parseUnits("0.00001", 18)) {
    console.log(`    ⛽ Funding ${recipient.address.slice(0, 6)} with ETH...`);
    await (await funder.sendTransaction({ to: recipient.address, value: parseUnits("0.00002", 18) })).wait();
  }

  // 2. USDC Check
  const usdcBal = await usdc.balanceOf(recipient.address);
  const REQUIRED_USDC = parseUnits("100", 6);

  if (usdcBal < REQUIRED_USDC) {
    console.log(`    💰 Funding ${recipient.address.slice(0, 6)} with USDC...`);
    // Try minting first (if funder is owner)
    try {
      await (await usdc.connect(funder).mint(recipient.address, parseUnits("1000", 6))).wait();
    } catch (e) {
      // Fallback: Transfer if minting fails (e.g. funder has tokens but isn't minter)
      await (await usdc.connect(funder).transfer(recipient.address, parseUnits("500", 6))).wait();
    }

    await waitForIndex(async () => (await usdc.balanceOf(recipient.address)) >= REQUIRED_USDC, "USDC Funding");
  }
}

async function ensureApproval(token: MockUSDC, owner: any, spender: any, amount: bigint) {
  let allowance = await token.allowance(owner.address, spender);
  if (allowance < amount) {
    console.log(`    🔓 Approving Slice for ${owner.address.slice(0, 6)}...`);
    const tx = await token.connect(owner).approve(spender, MaxUint256);
    await tx.wait();

    await waitForIndex(async () => {
      const newAllowance = await token.allowance(owner.address, spender);
      return newAllowance >= amount;
    }, `Approval for ${owner.address}`);
  }
}

// --- MAIN SCRIPT ---

const ADDRESSES = {
  base: {
    SLICE: "0x13e57fE57db978D0B8aE704181D95966930e869d",
    USDC: "0x6584C56bfE16b6F976c81a1Be25C5a29fD582519",
  },
  baseSepolia: {
    SLICE: "0x612AFD2715BA4b7Bb7C68573b7A3cEd489C0d53b",
    USDC: "0x672B6F3A85d697195eCe0ef318924D034122B2bb",
  },
};

async function main() {
  const { ethers, network } = hre;
  const networkName = network.name as keyof typeof ADDRESSES;

  console.log(`\n🥑 Seeding Slice disputes on network: ${networkName}`);

  const SLICE_ADDRESS = ADDRESSES[networkName]?.SLICE;
  let USDC_ADDRESS = ADDRESSES[networkName]?.USDC;

  if (!SLICE_ADDRESS) {
    throw new Error(`❌ Unsupported network or missing address for: "${networkName}"`);
  }

  const signers = await ethers.getSigners();
  const deployer = signers[0]; // Claimer
  const defenderWallet = signers[1]; // Defender

  const slice = (await ethers.getContractAt("Slice", SLICE_ADDRESS)) as unknown as Slice;

  // VERIFY TOKEN ADDRESS
  const onChainToken = await slice.stakingToken();
  if (onChainToken.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
    console.warn(`\n⚠️  MISMATCH DETECTED! Switching to Contract's USDC: ${onChainToken}`);
    USDC_ADDRESS = onChainToken;
  }

  const usdc = (await ethers.getContractAt("MockUSDC", USDC_ADDRESS)) as unknown as MockUSDC;

  // 1. FUNDING (ETH + USDC)
  console.log("\n💰 Checking Funds...");
  await ensureFunds(ethers, usdc, deployer, deployer); // Ensure deployer has USDC
  await ensureFunds(ethers, usdc, deployer, defenderWallet); // Ensure defender has ETH + USDC

  // 2. DEFINE DISPUTES (6 TOTAL)
  const ROOT_CID = "bafybeifa6gsnklvyvepp45ilf4ngc5o3ndydq7zxcdgrfybxs6flts6mdi";
  const ONE_WEEK = 604800n;

  // The 3 base templates
  const templates = [
    { title: "Freelance Dispute", category: "Freelance", ipfsHash: `${ROOT_CID}/freelance.json` },
    { title: "P2P Escrow", category: "P2P Trade", ipfsHash: `${ROOT_CID}/p2p.json` },
    { title: "Marketplace Issue", category: "Marketplace", ipfsHash: `${ROOT_CID}/marketplace.json` },
  ];

  // Duplicate to make 6
  const disputes = [...templates, ...templates];

  // 3. APPROVALS
  const TOTAL_STAKE_NEEDED = parseUnits("1", 6) * BigInt(disputes.length); // 1 USDC * 6
  console.log("\n🔓 Verifying Approvals...");
  await ensureApproval(usdc, deployer, slice.target, TOTAL_STAKE_NEEDED);
  await ensureApproval(usdc, defenderWallet, slice.target, TOTAL_STAKE_NEEDED);

  // 4. SEEDING LOOP
  for (let i = 0; i < disputes.length; i++) {
    const d = disputes[i];
    console.log(`\n🌱 [${i + 1}/6] Processing: "${d.title}"`);

    const createTx = await slice.connect(deployer).createDispute({
      claimer: deployer.address,
      defender: defenderWallet.address,
      category: d.category,
      ipfsHash: d.ipfsHash,
      jurorsRequired: 1n,
      paySeconds: ONE_WEEK,
      evidenceSeconds: ONE_WEEK,
      commitSeconds: ONE_WEEK,
      revealSeconds: ONE_WEEK,
    });
    const receipt = await createTx.wait();

    let disputeId = null;
    if (receipt) {
      for (const log of receipt.logs) {
        try {
          const parsed = slice.interface.parseLog(log as any);
          if (parsed?.name === "DisputeCreated") {
            disputeId = parsed.args[0];
            break;
          }
        } catch (e) {}
      }
    }

    if (!disputeId) {
      console.log("   ⚠️ ID not found. Skipping.");
      continue;
    }

    // Wait for indexing (critical for payDispute to not revert on 'Created' check)
    await waitForIndex(async () => {
      const data = await slice.disputes(disputeId);
      return data.payDeadline > 0n;
    }, `Dispute #${disputeId} Creation`);

    console.log(`   ✅ Created Dispute #${disputeId}`);

    console.log("   ... Claimer Paying");
    await (await slice.connect(deployer).payDispute(disputeId)).wait();

    console.log("   ... Defender Paying");
    await (await slice.connect(defenderWallet).payDispute(disputeId, { gasLimit: 300000 })).wait();

    console.log(`   ✨ Dispute #${disputeId} -> Status: COMMIT`);
  }

  console.log("\n🏁 Seeding Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

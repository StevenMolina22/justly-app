import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { Slice, MockUSDC } from "../types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  if (!ADDRESSES[networkName]) {
    throw new Error(`❌ Unsupported network: "${networkName}"`);
  }

  const SLICE_ADDRESS = ADDRESSES[networkName].SLICE;
  const USDC_ADDRESS = ADDRESSES[networkName].USDC;

  const signers = await ethers.getSigners();
  const deployer = signers[0]; // Claimer
  const defenderWallet = signers[1]; // Defender

  const slice = (await ethers.getContractAt("Slice", SLICE_ADDRESS)) as unknown as Slice;
  const usdc = (await ethers.getContractAt("MockUSDC", USDC_ADDRESS)) as unknown as MockUSDC;

  // ----------------------------------------------------
  // 1. BALANCES & MINTING (The Fix)
  // ----------------------------------------------------
  console.log("\n💰 Checking Balances...");

  // Only mint if on Testnet (Mainnet USDC cannot be minted)
  const isTestnet = networkName === "baseSepolia";
  const NEEDED_AMOUNT = ethers.parseUnits("100", 6); // 100 USDC

  const users = [deployer, defenderWallet];

  for (const user of users) {
    const bal = await usdc.balanceOf(user.address);
    if (bal < NEEDED_AMOUNT) {
      if (isTestnet) {
        console.log(`   -> Minting 1000 USDC for ${user.address.slice(0, 6)}...`);
        const tx = await usdc.connect(user).mint(user.address, ethers.parseUnits("1000", 6));
        await tx.wait();
      } else {
        console.warn(`   ⚠️ User ${user.address.slice(0, 6)} has low balance on Mainnet! Transaction may fail.`);
      }
    }
  }

  // ----------------------------------------------------
  // 2. APPROVALS
  // ----------------------------------------------------
  console.log("\n🔓 Checking Approvals...");

  for (const user of users) {
    const allowance = await usdc.allowance(user.address, slice.target);
    if (allowance < ethers.parseUnits("1000", 6)) {
      console.log(`   -> Approving Slice for ${user.address.slice(0, 6)}...`);
      const tx = await usdc.connect(user).approve(slice.target, ethers.MaxUint256);
      await tx.wait();
      await sleep(1000);
    }
  }

  // ----------------------------------------------------
  // 3. SEEDING LOOP
  // ----------------------------------------------------
  const ONE_WEEK = 604800;
  const ROOT_CID = "bafybeifa6gsnklvyvepp45ilf4ngc5o3ndydq7zxcdgrfybxs6flts6mdi";

  const disputes = [
    { title: "Freelance Dispute", category: "Freelance", ipfsHash: `${ROOT_CID}/freelance.json` },
    { title: "P2P Escrow", category: "P2P Trade", ipfsHash: `${ROOT_CID}/p2p.json` },
  ];

  for (const d of disputes) {
    console.log(`\n🌱 Processing: "${d.title}"`);

    const createTx = await slice.connect(deployer).createDispute({
      claimer: deployer.address,
      defender: defenderWallet.address,
      category: d.category,
      ipfsHash: d.ipfsHash,
      jurorsRequired: 1n,
      paySeconds: BigInt(ONE_WEEK),
      evidenceSeconds: BigInt(ONE_WEEK),
      commitSeconds: BigInt(ONE_WEEK),
      revealSeconds: BigInt(ONE_WEEK),
    });
    const receipt = await createTx.wait();

    // Find ID from logs
    let disputeId = null;
    if (receipt) {
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === slice.target.toString().toLowerCase()) {
          try {
            const parsed = slice.interface.parseLog(log);
            if (parsed?.name === "DisputeCreated") {
              disputeId = parsed.args[0];
              break;
            }
          } catch (e) {}
        }
      }
    }

    if (!disputeId) {
      console.log("   ⚠️ ID not found. Skipping.");
      continue;
    }
    console.log(`   ✅ Created Dispute #${disputeId}`);

    // Wait for indexing
    process.stdout.write("   ⏳ Waiting for RPC index...");
    let retries = 0;
    while (retries < 15) {
      try {
        const disputeData = await slice.disputes(disputeId);
        if (disputeData.payDeadline > 0n) {
          process.stdout.write(" Ready!\n");
          break;
        }
      } catch (e) {}
      await sleep(2000);
      process.stdout.write(".");
      retries++;
    }

    console.log("   ... Claimer Paying");
    await (await slice.connect(deployer).payDispute(disputeId)).wait();

    console.log("   ... Defender Paying");
    await (await slice.connect(defenderWallet).payDispute(disputeId)).wait();

    console.log(`   ✨ Dispute #${disputeId} -> Status: COMMIT`);
  }

  console.log("\n🏁 Seeding Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

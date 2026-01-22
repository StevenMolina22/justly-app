import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MaxUint256, parseUnits } from "ethers";
import { Slice, MockUSDC } from "../types";

/**
 * 🛠 UTILS: Robust Retry & Wait Logic
 */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function waitForIndex(checkFn: () => Promise<boolean>, errorMessage: string, maxRetries = 20, step = 2000) {
  process.stdout.write("    ⏳ Waiting for index...");
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (await checkFn()) {
        process.stdout.write(" Ready! 🚀\n");
        return;
      }
    } catch (e) {
      // Ignore transient errors during polling
    }
    process.stdout.write(".");
    await sleep(step);
  }
  throw new Error(`\n❌ Timeout: ${errorMessage}`);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  console.log(`\n⚔️  Deploying Slice to network: ${network.name}`);

  // --- 1. SETUP USDC ---
  const MOCK_USDC_ADDRESSES: Record<string, string> = {
    baseSepolia: "0x672B6F3A85d697195eCe0ef318924D034122B2bb",
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  };

  let usdcAddress = MOCK_USDC_ADDRESSES[network.name];

  if (!usdcAddress) {
    console.log("    📦 Deploying MockUSDC...");
    const mock = await deploy("MockUSDC", { from: deployer, args: [], log: true });
    usdcAddress = mock.address;
  }

  const usdc = (await ethers.getContractAt("MockUSDC", usdcAddress, signer)) as unknown as MockUSDC;

  // --- 2. CHECK & MINT FUNDS ---
  // Only mint if we are on a testnet/local network
  if (["hardhat", "localhost", "baseSepolia"].includes(network.name)) {
    const balance = await usdc.balanceOf(deployer);
    const required = parseUnits("10000", 6);

    if (balance < required) {
      console.log("    🔄 Minting 10,000 USDC to deployer...");
      try {
        const tx = await (usdc as any).mint(deployer, required);
        await tx.wait(1);
      } catch (e) {
        console.log("    ⚠️ Mint failed (might be a public faucet token). Ensure you have USDC.");
      }

      // Retry-wait until balance updates
      try {
        await waitForIndex(
          async () => (await usdc.balanceOf(deployer)) >= required,
          "Minting verification",
          5, // low retries, dont block if mint failed
        );
      } catch (e) {
        console.log("    ⚠️ Proceeding with current balance...");
      }
    }
  }

  // --- 3. DEPLOY SLICE ---
  const sliceDeploy = await deploy("Slice", {
    from: deployer,
    args: [usdcAddress],
    log: true,
    waitConfirmations: network.name === "base" ? 2 : 1,
  });

  const slice = (await ethers.getContractAt("Slice", sliceDeploy.address, signer)) as unknown as Slice;

  if (sliceDeploy.newlyDeployed) {
    await waitForIndex(async () => (await ethers.provider.getCode(slice.target)) !== "0x", "Slice Code Propagation");
  }

  // --- 4. SEED DISPUTES ---
  const shouldSeed = process.env.SEED_DISPUTES === "true" || ["hardhat", "baseSepolia"].includes(network.name);

  if (shouldSeed) {
    await seedDisputes(hre, slice, usdc, deployer);
  }

  // --- 5. VERIFY ---
  if (network.name !== "hardhat" && network.name !== "localhost" && process.env.BASESCAN_API_KEY) {
    console.log("    🔍 Verifying...");
    try {
      await hre.run("verify:verify", {
        address: sliceDeploy.address,
        constructorArguments: [usdcAddress],
      });
    } catch (e) {
      console.log("    ⚠️ Verification skipped.");
    }
  }
};

/**
 * 🥑 Helper: Clean Seeding Logic
 */
async function seedDisputes(hre: HardhatRuntimeEnvironment, slice: Slice, usdc: MockUSDC, deployerAddress: string) {
  const { ethers } = hre;
  console.log("\n🌱 Seeding initial disputes...");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const defenderWallet = signers[1];

  if (!defenderWallet) throw new Error("Defender account missing in hardhat config");

  // 1. Fund Defender
  await ensureFunds(ethers, usdc, deployer, defenderWallet);

  const ROOT_CID = "bafybeifa6gsnklvyvepp45ilf4ngc5o3ndydq7zxcdgrfybxs6flts6mdi";
  const disputes = [
    { title: "Freelance", category: "Freelance", ipfsHash: `${ROOT_CID}/freelance.json` },
    { title: "P2P Trade", category: "P2P Trade", ipfsHash: `${ROOT_CID}/p2p.json` },
    { title: "Marketplace", category: "Marketplace", ipfsHash: `${ROOT_CID}/marketplace.json` },
  ];

  const STAKE = parseUnits("1", 6); // 1 USDC
  const ONE_WEEK = 604800;

  // 2. Batch Approvals WITH VERIFICATION
  console.log("    🔓 Verifying Approvals...");
  await ensureApproval(usdc, deployer, slice.target, STAKE * BigInt(disputes.length));
  await ensureApproval(usdc, defenderWallet, slice.target, STAKE * BigInt(disputes.length));

  // 3. Create & Pay Loop
  for (const d of disputes) {
    console.log(`    Processing: "${d.title}"`);

    // A. Create
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
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return slice.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((p: any) => p?.name === "DisputeCreated");

    const id = event?.args?.[0];
    if (!id) {
      console.log("    ⚠️ Failed to retrieve ID. Skipping.");
      continue;
    }

    // B. Wait for Indexing
    await waitForIndex(async () => {
      const data = await slice.disputes(id);
      return data.payDeadline > 0n;
    }, `Dispute #${id} creation`);

    // C. Pay (Transactions)
    // We add a tiny delay to ensure nonce propagation
    await sleep(1000);
    await (await slice.connect(deployer).payDispute(id)).wait();

    await sleep(1000);
    await (await slice.connect(defenderWallet).payDispute(id)).wait();

    console.log(`       ✅ Dispute #${id} Active`);
  }
}

async function ensureFunds(ethers: any, usdc: MockUSDC, funder: any, recipient: any) {
  const ethBal = await ethers.provider.getBalance(recipient.address);
  if (ethBal < parseUnits("0.00001", 18)) {
    await (await funder.sendTransaction({ to: recipient.address, value: parseUnits("0.0001", 18) })).wait();
  }

  const usdcBal = await usdc.balanceOf(recipient.address);
  if (usdcBal < parseUnits("100", 6)) {
    await (await usdc.connect(funder).transfer(recipient.address, parseUnits("500", 6))).wait();
    await waitForIndex(
      async () => (await usdc.balanceOf(recipient.address)) >= parseUnits("100", 6),
      "Defender USDC funding",
    );
  }
}

/**
 * 🔐 Helper: Robust Approval
 * Ensures the allowance is actually reflected on-chain before returning
 */
async function ensureApproval(token: MockUSDC, owner: any, spender: any, amount: bigint) {
  // Check current allowance
  let allowance = await token.allowance(owner.address, spender);

  if (allowance < amount) {
    // Approve
    const tx = await token.connect(owner).approve(spender, MaxUint256);
    await tx.wait();

    // WAIT until the node actually sees the allowance
    await waitForIndex(async () => {
      const newAllowance = await token.allowance(owner.address, spender);
      return newAllowance >= amount;
    }, `Approval for ${owner.address}`);
  }
}

export default func;
func.tags = ["Slice"];
func.id = "deploy_slice_v1.1";

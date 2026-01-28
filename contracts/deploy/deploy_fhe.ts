import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MaxUint256, parseUnits } from "ethers";
import { SliceFHE, MockUSDC } from "../types";

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
      // Ignore transient errors
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

  console.log(`\n🛡️  Deploying SliceFHE to network: ${network.name}`);

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
  // Ensure deployer has funds for testing/seeding
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
    }
  }

  // --- 3. DEPLOY SLICE FHE ---
  const sliceDeploy = await deploy("SliceFHE", {
    from: deployer,
    args: [usdcAddress],
    log: true,
    waitConfirmations: network.name === "base" ? 2 : 1,
  });

  const sliceFHE = (await ethers.getContractAt("SliceFHE", sliceDeploy.address, signer)) as unknown as SliceFHE;

  if (sliceDeploy.newlyDeployed) {
    // Basic connectivity check
    await waitForIndex(async () => (await ethers.provider.getCode(sliceFHE.target)) !== "0x", "Code Propagation");

    // Initialize Stake Per Juror (Default is 0)
    // Setting to 1 USDC for testing
    console.log("    ⚙️  Initializing Stake Per Juror...");
    const stakeTx = await sliceFHE.setStakePerJuror(parseUnits("1", 6));
    await stakeTx.wait();
  }

  // --- 4. SEED DISPUTES ---
  const shouldSeed = process.env.SEED_DISPUTES === "true" || ["hardhat", "baseSepolia"].includes(network.name);

  if (shouldSeed) {
    await seedFHEDisputes(hre, sliceFHE, usdc, deployer);
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
      console.log("    ⚠️ Verification skipped/failed.");
    }
  }
};

/**
 * 🥑 Helper: Clean Seeding Logic for FHE
 */
async function seedFHEDisputes(
  hre: HardhatRuntimeEnvironment,
  slice: SliceFHE,
  usdc: MockUSDC,
  deployerAddress: string,
) {
  const { ethers } = hre;
  console.log("\n🌱 Seeding initial FHE disputes...");

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
  ];

  const JUROR_STAKE = parseUnits("1", 6); // 1 USDC
  const ONE_WEEK = 604800;

  // 2. Batch Approvals
  // In SliceFHE, the creator pays the stake upfront in createDispute
  console.log("    🔓 Verifying Approvals...");
  await ensureApproval(usdc, deployer, slice.target, JUROR_STAKE * BigInt(disputes.length * 5)); // Over-approve

  // 3. Create Loop
  for (const d of disputes) {
    console.log(`    Processing: "${d.title}"`);

    // A. Create Dispute (Note: struct differs from Slice.sol, no ipfsHash/category in config)
    const createTx = await slice.connect(deployer).createDispute({
      claimer: deployer.address,
      defender: defenderWallet.address,
      jurorsRequired: 1n,
      paySeconds: BigInt(ONE_WEEK),
      evidenceSeconds: BigInt(ONE_WEEK),
      commitSeconds: BigInt(ONE_WEEK),
      revealSeconds: BigInt(ONE_WEEK),
    });

    const receipt = await createTx.wait();

    // Find ID from logs
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

    // B. Submit Evidence (Since FHE config doesn't include it)
    console.log(`       Attaching Metadata...`);
    const submitTx = await slice.connect(deployer).submitEvidence(id, d.ipfsHash);
    await submitTx.wait();

    console.log(`       ✅ FHE Dispute #${id} Created`);
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
  }
}

async function ensureApproval(token: MockUSDC, owner: any, spender: any, amount: bigint) {
  const allowance = await token.allowance(owner.address, spender);
  if (allowance < amount) {
    const tx = await token.connect(owner).approve(spender, MaxUint256);
    await tx.wait();
  }
}

export default func;
func.tags = ["SliceFHE"];
func.id = "deploy_slice_fhe_v1";

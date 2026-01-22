import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { Slice, MockUSDC } from "../types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { ethers, network } = hre;
  console.log(`\n🥑 Seeding Slice disputes on network: ${network.name}`);

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const defenderWallet = signers[1];

  // ----------------------------------------------------
  // CONFIGURATION
  // ----------------------------------------------------
  const SLICE_ADDRESS = "0xB4E0d60920C5c22F28fed61647FF5dF8974A2497";
  const USDC_ADDRESS = "0x672B6F3A85d697195eCe0ef318924D034122B2bb";

  // 2. CAST TO SPECIFIC TYPES
  // We force TypeScript to treat these as the specific contracts, not generic ones.
  const slice = (await ethers.getContractAt("Slice", SLICE_ADDRESS)) as unknown as Slice;
  const usdc = (await ethers.getContractAt("MockUSDC", USDC_ADDRESS)) as unknown as MockUSDC;

  const ONE_WEEK = 604800;
  const ROOT_CID = "bafybeifa6gsnklvyvepp45ilf4ngc5o3ndydq7zxcdgrfybxs6flts6mdi";

  const disputes = [
    { title: "Freelance Dispute", category: "Freelance", ipfsHash: `${ROOT_CID}/freelance.json` },
    { title: "P2P Escrow", category: "P2P Trade", ipfsHash: `${ROOT_CID}/p2p.json` },
  ];

  // ----------------------------------------------------
  // 1. APPROVALS
  // ----------------------------------------------------
  console.log("\n🔓 Checking Approvals...");

  const currentAllowance = await usdc.allowance(deployer.address, slice.target);
  if (currentAllowance < ethers.parseUnits("1000", 6)) {
    console.log("   -> Approving Claimer...");
    await (await usdc.connect(deployer).approve(slice.target, ethers.MaxUint256)).wait();
    await sleep(2000);
  }

  const defAllowance = await usdc.allowance(defenderWallet.address, slice.target);
  if (defAllowance < ethers.parseUnits("1000", 6)) {
    console.log("   -> Approving Defender...");
    await (await usdc.connect(defenderWallet).approve(slice.target, ethers.MaxUint256)).wait();
    await sleep(2000);
  }

  // ----------------------------------------------------
  // 2. SEEDING LOOP
  // ----------------------------------------------------
  for (const d of disputes) {
    console.log(`\n🌱 Processing: "${d.title}"`);

    // Now 'createDispute' will be recognized correctly!
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

    process.stdout.write("   ⏳ Waiting for RPC index...");
    let retries = 0;
    while (retries < 10) {
      const disputeData = await slice.disputes(disputeId);
      if (disputeData.payDeadline > 0n) {
        process.stdout.write(" Ready!\n");
        break;
      }
      await sleep(2000);
      process.stdout.write(".");
      retries++;
    }

    if (retries >= 10) continue;

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

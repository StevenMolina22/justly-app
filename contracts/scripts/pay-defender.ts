import { ethers } from "hardhat";
import { Slice } from "../types";

// 1. CONFIGURATION
const SLICE_ADDRESS = "0x13e57fE57db978D0B8aE704181D95966930e869d"; // Base Mainnet
const DISPUTE_ID = 6; // The ID that failed

async function main() {
  const [deployer, defender] = await ethers.getSigners();

  console.log(`\n⚖️  Paying Dispute #${DISPUTE_ID} on Base...`);
  console.log(`   📝 Defender: ${defender.address}`);
  console.log(`   📍 Contract: ${SLICE_ADDRESS}`);

  // 2. Connect to Contract
  const slice = (await ethers.getContractAt("Slice", SLICE_ADDRESS)) as unknown as Slice;

  // 3. Execute Payment
  console.log("   💸 Sending transaction...");
  const tx = await slice.connect(defender).payDispute(DISPUTE_ID);

  console.log(`   ⏳ Tx Sent: ${tx.hash}`);
  await tx.wait();

  console.log("   ✅ Payment Successful!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

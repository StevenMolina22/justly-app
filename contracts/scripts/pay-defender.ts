import hre from "hardhat";
import { ethers } from "hardhat";
import { Slice } from "../types";

// 1. CONFIGURATION
const ADDRESSES = {
  base: {
    SLICE: "0x13e57fE57db978D0B8aE704181D95966930e869d",
  },
  baseSepolia: {
    SLICE: "0x612AFD2715BA4b7Bb7C68573b7A3cEd489C0d53b",
  },
};

// Set the ID of the dispute you want to pay
const DISPUTE_ID = 19;

async function main() {
  const { network } = hre;
  const networkName = network.name as keyof typeof ADDRESSES;

  console.log(`\n⚖️  Paying Dispute #${DISPUTE_ID} on network: ${networkName}`);

  if (!ADDRESSES[networkName]) {
    throw new Error(`❌ Unsupported network: "${networkName}"`);
  }

  const SLICE_ADDRESS = ADDRESSES[networkName].SLICE;

  // Get signers: [Claimer (Deployer), Defender]
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const defender = signers[1];

  console.log(`   📍 Contract: ${SLICE_ADDRESS}`);

  // 2. Connect to Contract
  const slice = (await ethers.getContractAt("Slice", SLICE_ADDRESS)) as unknown as Slice;

  // 3. Check Dispute Status & Role
  console.log("   🔍 Verifying Dispute Status...");
  const dispute = await slice.disputes(DISPUTE_ID);

  // Determine who needs to pay based on the dispute data
  let payerWallet;
  let roleLabel = "";

  // Check if the Defender (Signer 1) needs to pay
  if (dispute.defender.toLowerCase() === defender.address.toLowerCase() && !dispute.defenderPaid) {
    payerWallet = defender;
    roleLabel = "Defender";
  }
  // Check if the Claimer (Signer 0) needs to pay
  else if (dispute.claimer.toLowerCase() === deployer.address.toLowerCase() && !dispute.claimerPaid) {
    payerWallet = deployer;
    roleLabel = "Claimer";
  } else {
    console.log("   ⚠️  No payment needed or wallet mismatch.");
    console.log(`      Claimer Paid: ${dispute.claimerPaid}`);
    console.log(`      Defender Paid: ${dispute.defenderPaid}`);
    console.log(`      Dispute Status Index: ${dispute.status}`);
    return;
  }

  console.log(`   📝 Payer: ${roleLabel} (${payerWallet.address})`);

  // 4. Execute Payment
  console.log(`   💸 Sending payment transaction...`);
  try {
    const tx = await slice.connect(payerWallet).payDispute(DISPUTE_ID);
    console.log(`   ⏳ Tx Sent: ${tx.hash}`);

    await tx.wait();
    console.log("   ✅ Payment Successful!");
  } catch (error: any) {
    console.error(`   ❌ Payment Failed: ${error.message}`);
    if (error.message.includes("allowance")) {
      console.log("   💡 Hint: Check if the payer has approved the Slice contract to spend USDC.");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

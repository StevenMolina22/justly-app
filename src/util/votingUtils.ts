import { encodePacked, keccak256, toHex, fromHex, toBytes } from "viem";

/**
 * Generate a random identity secret for voting
 */
export function generateIdentitySecret(): bigint {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to bigint (taking first 31 bytes to fit in Field if using ZK, though here just random)
  let value = BigInt(0);
  for (let i = 0; i < 31; i++) {
    value = value * BigInt(256) + BigInt(array[i]);
  }
  return value;
}

/**
 * 1. STATIC MESSAGE GENERATOR
 * The message must be identical on every device to produce the same signature/salt.
 */
export function getSaltGenerationMessage(disputeId: string | number): string {
  return `Justly Protocol: Generate secure voting secret for Dispute #${disputeId}. \n\nSign this message to derive your voting salt. This does not cast a vote or cost gas.`;
}

/**
 * 2. DETERMINISTIC SALT DERIVATION
 * Hashes the signature (which is unique to the user + dispute) to create the salt.
 */
export function deriveSaltFromSignature(signature: string): bigint {
  const hash = keccak256(toBytes(signature));
  return BigInt(hash);
}

/**
 * 3. VOTE RECOVERY
 * Brute-force checks if Vote 0 or Vote 1 matches the commitment found on-chain.
 */
export function recoverVote(
  recoveredSalt: bigint,
  onChainCommitment: string, // The hash stored in the contract
): number {
  // Check against Vote 0 (Defender)
  const hash0 = calculateCommitment(0, recoveredSalt);
  if (hash0 === onChainCommitment) return 0;

  // Check against Vote 1 (Claimant)
  const hash1 = calculateCommitment(1, recoveredSalt);
  if (hash1 === onChainCommitment) return 1;

  throw new Error("Signature derived salt does not match on-chain commitment.");
}

/**
 * Calculate commitment: keccak256(vote || salt)
 * Equivalent to Solidity: keccak256(abi.encodePacked(vote, salt))
 */
export function calculateCommitment(vote: number, salt: bigint): string {
  // Viem: Encode packed arguments then hash
  return keccak256(encodePacked(["uint256", "uint256"], [BigInt(vote), salt]));
}

/**
 * Calculate nullifier: hash(identity_secret || salt || proposal_id)
 * Equivalent to Solidity: keccak256(abi.encodePacked(identitySecret, salt, uint64(proposalId)))
 * Returns the nullifier as a 32-byte array (Uint8Array)
 */
export function calculateNullifier(
  identitySecret: bigint,
  salt: bigint,
  proposalId: number,
): Uint8Array {
  // We use uint64 for proposalId based on the original logic (8 bytes)
  const hash = keccak256(
    encodePacked(
      ["uint256", "uint256", "uint64"],
      [identitySecret, salt, BigInt(proposalId)],
    ),
  );

  // Convert hex string back to Uint8Array
  return fromHex(hash, "bytes");
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return toHex(bytes);
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  return fromHex(hex as `0x${string}`, "bytes");
}

/**
 * Convert Uint8Array to Buffer (for Stellar SDK compatibility if needed)
 */
export function bytesToBuffer(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes);
}

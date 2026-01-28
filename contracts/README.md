# Slice Protocol ⚖️

**The Neutral, On-Chain Dispute Resolution Protocol.**

Slice is an oracle for justice. It produces reliable rulings for external contracts through a trustless mechanism of random juror selection, commit-reveal voting, and crypto-economic staking.

This repository contains the **Hardhat** development environment for the Slice smart contracts.

---

## Protocol Roadmap & Versioning

We are currently operating on **Slice V1.1**. While V1.5 and FHE files exist in the repository for development purposes, they are **not yet deployed to production**.

### Active: Slice V1.1 (`Slice.sol`)
* **Status:** **LIVE** on Base Mainnet & Sepolia.
* **Mechanism:** Active Drafting. Jurors manually "draw" disputes from an open queue.
* **Staking:** Per-dispute staking (Jurors lock funds only when they join a specific case).
* **Randomness:** `prevrandao` + Blockhash (Simple implementation).

### Development: Slice V1.5 (`SliceV1.5.sol`)
* **Status:** **DRAFT / EXPERIMENTAL**. Do not use in production yet.
* **Mechanism:** Passive Global Staking & Push Architecture.
* **Economic Security:** High Assurance Model. If selected, the juror's *entire* staked balance moves to the dispute.
* **Escrow Wrapper:** Includes `SliceEscrowV1.5.sol` for secure P2P payments.
* **Planned Rollout:** Phase 3/4.

### Long-Term: FHE Privacy (Zama Integration)
* **Goal:** Fully private voting and evidence handling using Fully Homomorphic Encryption (FHE).
* **Template:** This project is initialized using the **Zama FHEVM template** to ensure our foundation is ready for this future privacy layer when the time comes.

---

## Prerequisites

* **Node.js**: Version 20 or higher
* **pnpm**: Package manager

```bash
npm install -g pnpm
```

---

## Installation & Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file or set variables via the CLI:

```bash
pnpm hardhat vars set MNEMONIC
pnpm hardhat vars set INFURA_API_KEY
pnpm hardhat vars set ETHERSCAN_API_KEY # Optional: for verification
```

### 3. Compile Contracts

```bash
pnpm run compile
```

### 4. Run Tests

```bash
pnpm run test
```

---

## ⛓ Deployment

### Local Network (Hardhat Network)

```bash
# Start the node
pnpm hardhat node

# Deploy (in a separate terminal)
pnpm hardhat deploy --network localhost
```

### Testnet (Sepolia)

```bash
# Deploy
pnpm hardhat deploy --network sepolia

# Verify
pnpm hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 📁 Project Structure

```
contracts/
├── contracts/
│   ├── core/
│   │   ├── Slice.sol            # 🟢 LIVE: V1.1 Logic (Active Draft System)
│   │   ├── SliceV1.5.sol        # 🚧 BETA: V1.5 Logic (Passive Staking - DO NOT DEPLOY)
│   │   └── SliceEscrowV1.5.sol  # 🚧 BETA: Escrow Wrapper for V1.5
│   ├── fhe/                     # FHE Privacy Experiments (Future V2)
│   └── interfaces/              # Shared interfaces
├── deploy/                      # Hardhat deploy scripts
├── test/                        # Mocha/Chai tests
└── hardhat.config.ts            # Network & Compiler config
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm run compile` | Compiles Solidity contracts |
| `pnpm run test` | Runs the full test suite |
| `pnpm run coverage` | Generates code coverage report |
| `pnpm run lint` | Runs Solhint and ESLint |
| `pnpm run clean` | Removes artifacts and cache |

---

## 📄 License

This project is licensed under the MIT License.

**Built for Justice.**

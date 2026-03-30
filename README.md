<div align="center">
  <img src="assets/Slice-logo.png" alt="Slice Protocol" width="120" />
  <h1>⚖️ Slice Protocol</h1>
  <p><strong>Real-Time Decentralized Dispute Resolution — Built on Base</strong></p>

  <p>
    <a href="https://dev.slicehub.xyz"><img src="https://img.shields.io/badge/Testnet-dev.slicehub.xyz-orange?style=for-the-badge&logo=ethereum" alt="Testnet" /></a>
    <a href="https://app.slicehub.xyz"><img src="https://img.shields.io/badge/Mainnet-app.slicehub.xyz-blue?style=for-the-badge&logo=ethereum" alt="Mainnet" /></a>
  </p>

  <!-- Tech Stack -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Wagmi-1C1C1C?style=flat-square&logo=ethereum&logoColor=white" alt="Wagmi" />
    <img src="https://img.shields.io/badge/Viem-7C3AED?style=flat-square&logo=ethereum&logoColor=white" alt="Viem" />
    <img src="https://img.shields.io/badge/Privy-FF6B35?style=flat-square&logoColor=white" alt="Privy" />
    <img src="https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=coinbase&logoColor=white" alt="Base" />
    <img src="https://img.shields.io/badge/Hardhat-FFF100?style=flat-square&logo=hardhat&logoColor=black" alt="Hardhat" />
    <img src="https://img.shields.io/badge/IPFS-65C2CB?style=flat-square&logo=ipfs&logoColor=white" alt="IPFS" />
  </p>
</div>

---

## 🎬 Demo

<div align="center">
  <video src="assets/JustlyAnimation.mp4" autoplay loop muted playsinline width="100%"></video>
</div>

---

This project is the frontend implementation for **Slice**, a **Real-Time Dispute Resolution Protocol** built on Next.js. It features a **multi-tenant architecture** capable of running as a standalone PWA or as an embedded MiniApp across various wallet ecosystems (Base, Beexo).

---

## ⚡ What is Slice?

**Slice** is a **decentralized, real-time dispute resolution protocol**. It acts as a **neutral truth oracle** that resolves disputes quickly and trustlessly through **randomly selected jurors** and **economic incentives**.

We are building the **"Uber for Justice"**:
* **Decentralized & Trustless:** No central authority controls the outcome.
* **Fast & Scalable:** Designed for real-time applications, offering quick rulings compared to traditional courts.
* **Gamified Justice:** Jurors enter the Dispute Resolution Market via an **intuitive and entertaining App/MiniApp**.
* **Earn by Ruling:** Users stake tokens to become jurors and **earn money** by correctly reviewing evidence and voting on disputes.

---

## 🏗️ Architecture: Multi-Tenant & Strategy Pattern

This application uses a **Strategy Pattern** to manage wallet connections and SDK interactions. Instead of a single monolithic connection logic, we use an abstraction layer that selects the appropriate **Adapter** based on the runtime environment (detected via subdomains and SDK presence).

### 1. Connection Strategies

We support two active connection strategies (with Lemon planned):

| Strategy | Description | Used By |
|----------|-------------|---------|
| **Wagmi SW** | Uses Smart Wallets (Coinbase/Safe) via Privy & Wagmi. | **PWA**, **Base** |
| **Wagmi EOA** | Uses standard Injected (EOA) connectors. | **Beexo** |
| *(Planned)* Lemon SDK | Native `@lemoncash/mini-app-sdk`. | Lemon |

### 2. Supported MiniApps & Environments

The application behaves differently depending on the access point (Subdomain) and injected providers.

| Platform | Subdomain | Connection Strategy | Auth Type |
|----------|-----------|---------------------|-----------|
| **Standard PWA** | `app.` | **Wagmi SW** | Social / Email / Wallet |
| **Base MiniApp** | `base.` | **Wagmi SW** | Coinbase Smart Wallet |
| **Beexo** | `beexo.` | **Wagmi EOA** | Injected Provider (Beexo) |
| **Lemon (planned)** | `lemon.` | Lemon SDK | Native Lemon Auth |

---

## 🚀 Try Slice Now

Experience the future of decentralized justice on **Base**:

* **Testnet Demo**: [dev.slicehub.xyz](https://dev.slicehub.xyz) – (Base Sepolia)
* **Mainnet App**: [app.slicehub.xyz](https://app.slicehub.xyz) – (Base)

---

## ⚖️ How It Works (The Juror Flow)

1. **Enter the Market:** Users open the Slice App or MiniApp and **stake USDC** to join the juror pool.
2. **Get Drafted:** When a dispute arises, jurors are randomly selected (Drafted) to review the case.
3. **Review & Vote:** Jurors analyze the evidence provided by both parties and vote privately on the outcome.
4. **Earn Rewards:** If their vote aligns with the majority consensus, they **earn fees** from the losing party.
5. **Justice Served:** The protocol aggregates the votes and executes the ruling on-chain instantly.

---

## 🔌 Integration Guide (For Developers)

Integrating Slice V1.5 into your protocol follows an Arbitrable/Arbitrator flow:

### 1. Create a Dispute
From your arbitrable contract, call `slice.createDispute(CreateDisputeParams)` and store your local-case to `disputeId` mapping.

### 2. Fund and progress the dispute
Parties pay arbitration costs in `slice.stakingToken()` through `payDispute(disputeId)`. During the dispute, parties can submit evidence through `submitEvidence`.

### 3. Settle via callback
Slice calls `IArbitrable.rule(disputeId, ruling)` on your contract when finalized. In Slice V1.5, `ruling == 1` means claimer wins and `ruling == 0` means defender wins.

Reference implementation:
- `slice_sc/src/core/P2PTradeEscrow.sol`
- `slice_sc/test/integration/P2PTradeEscrow.integration.t.sol`

---

## 📍 Deployed Contracts

| Network | Slice Core | USDC Token |
|---------|------------|------------|
| **Base Sepolia** | `0xD8A10bD25e0E5dAD717372fA0C66d3a59a425e4D` | `0x5dEaC602762362FE5f135FA5904351916053cF70` |
| **Base Mainnet** | `0xD8A10bD25e0E5dAD717372fA0C66d3a59a425e4D` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

---

## 🚀 Getting Started

### 1. Configure Environment

Rename `.env.example` to `.env.local` and add your keys.

```bash
NEXT_PUBLIC_APP_ENV="development" # or 'production'

# Pinata / IPFS Config
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt"
NEXT_PUBLIC_PINATA_GATEWAY_URL="your_gateway_url"

# Privy Config (For PWA / Base)
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
NEXT_PUBLIC_PRIVY_CLIENT_ID="your_privy_client_id"

# Contracts
NEXT_PUBLIC_BASE_SLICE_CONTRACT="0x..."
NEXT_PUBLIC_BASE_USDC_CONTRACT="0x..."
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```

* **PWA Mode:** `http://localhost:3000`
* **MiniApp Mode:** Use the native testing environment provided by the wallet SDK.

---

## ⚙️ Application Configuration

The `src/config/` and `src/adapters/` directories manage the multi-environment logic.

### Abstraction Layer (`src/adapters/`)

We abstract wallet interactions behind a common interface:

* **`useWalletAdapter`** – Selects the active strategy based on environment.
* **`WagmiAdapter`** – Wraps Wagmi hooks (Smart Wallets or EOA).
* *(Planned)* **`LemonAdapter`** – Will wrap `@lemoncash/mini-app-sdk`.

### Chain Configuration (`src/config/chains.ts`)

* Exports `SUPPORTED_CHAINS` mapping Wagmi `Chain` objects to contract addresses.
* Defaults based on `NEXT_PUBLIC_APP_ENV`.

---

## 🔧 Smart Contract Development

Solidity contracts are in `slice_sc/` and use **Foundry**.

### Commands

```bash
cd slice_sc
forge build
forge test
```

For contract deployment and seeding scripts, see `slice_sc/README.md`.

---

## 🗺️ Roadmap

* [x] Phase 1 – Foundation (Core Protocol, Web UI)
* [x] Phase 2 – Architecture Overhaul (Strategy Pattern, Multi-Tenant SDKs)
* [ ] Phase 3 – MiniApp Expansion (Live integration with Lemon, Beexo)
* [ ] Phase 4 – Slice V1.5 Migration (Passive Global Staking)
* [ ] Phase 5 – Specialized Courts & DAO Governance

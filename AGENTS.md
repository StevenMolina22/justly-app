# Justly Protocol – Developer & Agent Guidelines

This document defines the architectural rules, development standards, and technical constraints for the Justly Protocol frontend and smart contract system.

---

## Architectural Principles

### 1. Multi-Tenant Strategy Pattern

This application runs across multiple environments (PWA, Beexo, Base MiniApp) using a single codebase.

> **Rule:** Do **not** use conditional logic inside UI components (e.g., `if (isBeexo)` or `if (isMiniApp)`).

#### Design Requirements

**Abstraction Layer**  
All wallet interactions must go through a dedicated adapter layer and a single unified provider component. UI components must never talk directly to wallet SDKs or RPC providers.

**Tenant Detection**  
Tenants are detected using request metadata (such as host, origin, or runtime signals) and resolved before any wallet or chain logic is initialized.

**Strategies**
- **Web / PWA** → `Privy + Wagmi` (Smart Wallets via ERC-4337)
- **Beexo** → `Wagmi` with injected `xo-connect` provider (EIP-1193)

---

### 2. State Management

**On-chain data**  
Use **Wagmi v2** hooks:
- `useReadContract`
- `useWriteContract`

Combined with **TanStack Query** for caching and synchronization.

**Local state**  
Use typed LocalStorage helpers for temporary client-side data (for example commit-reveal salts and voting metadata).

**Client / Server separation**
- `wagmi` hooks → **Client Components only** (`"use client"`)
- Server Components → layout, static data, or configuration only

---

## Tech Stack & Standards

- **Framework:** Next.js 16 (App Router)
- **Blockchain interaction:** Viem + Wagmi v2
  > Do **not** use Ethers.js.
- **Styling:** Tailwind CSS + shadcn/ui
  - **UI rule:** Avoid `text-sm` for body copy in embedded contexts (MiniApps)
  - Prefer `text-base` for readability
- **Authentication:**
  - Privy → Web / PWA / Base
  - Injected providers → Beexo

### Required Standards

- **ERC-4337** → Account Abstraction (PWA users)
- **EIP-1193** → Provider interface (Beexo integration)
- **EIP-712** → Typed data signing (when applicable)

---

## Development Workflows

### 1. Running the App

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

- **Standard mode:** http://localhost:3000
- **Beexo simulation:**
  - Inject a compatible provider in the browser, or
  - Mock the `Host` header to trigger Beexo tenant detection

---

### 2. Smart Contract Development

```bash
cd contracts

# Compile
pnpm hardhat compile

# Deploy to Base Sepolia
pnpm hardhat deploy --network baseSepolia
```

---

### 3. IPFS & Evidence Handling

Dispute metadata is stored on IPFS using **Pinata**.

**Rules:**
- Always use the shared IPFS utility module provided by the application to ensure consistent metadata formatting and error handling.
  ```
  src/util/ipfs.ts
  ```
- Evidence JSON must match the `DisputeUI` interface used by the frontend to guarantee correct decoding and rendering.
  ```
  src/util/disputeAdapter.ts
  ```

---

## Coding Conventions

### Component Rules

1. **Wallet-agnostic**  
   Components must consume `useAccount` or `useSliceAccount` and never depend on connection method.

2. **Strict typing**  
   Use `DisputeUI` for all frontend dispute representations.

3. **Error handling**  
   Use `sonner` for user-facing notifications:
   ```ts
   toast.error("Message")
   ```
4. **Tailwind Classes** 
   ALWAYS Use canonical classes, e.g. the class `min-w-[80px]` can be written as `min-w-20`

---

### Commit Messages

Follow **Conventional Commits**:

```text
feat(adapter): add lemon wallet support
fix(voting): resolve salt generation issue
style(ui): update font sizes for mobile
chore(contracts): recompile abis
```

---

## Environment Configuration

> **DO NOT COMMIT SECRETS**

The application requires several environment variables for:
- Runtime mode selection (development vs production)
- Authentication providers
- IPFS / storage backends
- Blockchain network configuration and contract addresses

These values must be provided via your local environment configuration mechanism and deployment platform secrets.

---

**This file is authoritative. Any architectural change must update this document.**

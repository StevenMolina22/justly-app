> ## Documentation Index
> Fetch the complete documentation index at: https://docs.base.org/llms.txt
> Use this file to discover all available pages before exploring further.

# Batch Transactions

> Send multiple onchain calls in a single transaction with Wagmi and Base Account

export const GithubRepoCard = ({title, githubUrl}) => {
  return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
      <div className="flex w-full items-center gap-3">
        <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>

        <div className="flex min-w-0 flex-grow flex-col">
          <span className="truncate text-base font-medium">{title}</span>
          <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
        </div>

        <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>;
};

Learn how to send multiple onchain calls in a single transaction with Wagmi and Base Account.

## Overview

[Wagmi](https://wagmi.sh/) is a collection of React hooks for Ethereum Virtual Machine (EVM) compatible networks that makes it easy to work with wallets, contracts, transactions, and signing. Base Account integrates perfectly with Wagmi, allowing you to use all your familiar hooks.

You can jump ahead and use the [Base Account Wagmi Template](https://github.com/base/demos/tree/master/base-account/base-account-wagmi-template) to get started.

<GithubRepoCard title="Base Account Wagmi Template" githubUrl="https://github.com/base/demos/tree/master/base-account/base-account-wagmi-template" />

## Setup

Make sure you have [set up Wagmi with Base Account](/base-account/framework-integrations/wagmi/setup) before following this guide.

## Basic Batch Transaction

Send multiple ETH transfers in a single transaction by creating a component that uses the `sendCalls` method and adding a button to trigger the transaction.

<CodeGroup>
  ```tsx components/BatchTransactions.tsx expandable theme={null}
  "use client";

  import { useState } from "react";
  import { useSendCalls } from "wagmi";
  import { encodeFunctionData, parseUnits } from "viem";
  import { baseSepolia } from "wagmi/chains";

  // USDC contract address on Base Sepolia
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // ERC20 ABI for the transfer function
  const erc20Abi = [
    {
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const;

  export function BatchTransactions() {
    const { sendCalls, data, isPending, isSuccess, error } = useSendCalls();
    const [amount1, setAmount1] = useState("1");
    const [amount2, setAmount2] = useState("1");
    const [usePaymaster, setUsePaymaster] = useState(false);

    async function handleBatchTransfer() {
      try {
        // Encode the first transfer call
        const call1Data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [
            "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
            parseUnits(amount1, 6), // USDC has 6 decimals
          ],
        });

        // Encode the second transfer call
        const call2Data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [
            "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            parseUnits(amount2, 6), // USDC has 6 decimals
          ],
        });

        // Prepare capabilities object if paymaster is enabled
        const capabilities = usePaymaster
          ? {
              paymasterService: {
                url: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://api.developer.coinbase.com/rpc/v1/base-sepolia",
              },
            }
          : undefined;

        // Send the batch of calls
        sendCalls({
          calls: [
            {
              to: USDC_ADDRESS,
              data: call1Data,
            },
            {
              to: USDC_ADDRESS,
              data: call2Data,
            },
          ],
          chainId: baseSepolia.id,
          capabilities,
        });
      } catch (err) {
        console.error("Error batching transactions:", err);
      }
    }

    return (
      <div>
        <h2>Batch USDC Transfers</h2>

        <div>
          <div>
            <label>Amount 1 (USDC):</label>
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              placeholder="1"
              step="0.000001"
              min="0"
            />
          </div>

          <div>
            <label>Amount 2 (USDC):</label>
            <input
              type="number"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              placeholder="1"
              step="0.000001"
              min="0"
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={usePaymaster}
                onChange={(e) => setUsePaymaster(e.target.checked)}
              />
              Use Paymaster (sponsor gas fees)
            </label>
          </div>

          <button onClick={handleBatchTransfer} disabled={isPending}>
            {isPending ? "Sending..." : "Send Batch Transfer"}
          </button>
        </div>

        {isPending && <div>Transaction pending...</div>}

        {isSuccess && data && (
          <div>
            <p>Batch sent successfully!</p>
            <p>Batch ID: {data.id}</p>
          </div>
        )}

        {error && <div>Error: {error.message}</div>}
      </div>
    );
  }
  ```

  ```tsx app/page.tsx expandable theme={null}
  "use client";

  import { useAccount, useConnect, useDisconnect } from "wagmi";
  import { SignInWithBase } from "../components/SignInWithBase";
  import { BatchTransactions } from "../components/BatchTransactions";

  function App() {
    const account = useAccount();
    const { connectors, connect, status, error } = useConnect();
    const { disconnect } = useDisconnect();

    return (
      <>
        <div>
          <h2>Account</h2>

          <div>
            status: {account.status}
            <br />
            addresses: {JSON.stringify(account.addresses)}
            <br />
            chainId: {account.chainId}
          </div>

          {account.status === "connected" && (
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          )}
        </div>

        <div>
          <h2>Connect</h2>
          {connectors.map((connector) => {
            if (connector.name === "Base Account") {
              return (
                <SignInWithBase key={connector.uid} connector={connector} />
              );
            } else {
              return (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                >
                  {connector.name}
                </button>
              );
            }
          })}
          <div>{status}</div>
          <div>{error?.message}</div>
        </div>

        {account.status === "connected" && <BatchTransactions />}
      </>
    );
  }

  export default App;
  ```
</CodeGroup>

<Tip>
  **You don't need to "Connect the wallet" first**

  Base Account allows you to prompt the user for sending the transaction using the `sendCalls` method without needing to "Connect the wallet" (ie. using `eth_requestAccounts`) first.
</Tip>

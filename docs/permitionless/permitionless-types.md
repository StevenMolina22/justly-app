# TypeScript Types & Documentation

## Smart Account Implementations

### Exported Account Types

#### Simple Smart Account
```typescript
export {
  type SimpleSmartAccountImplementation,
  type ToSimpleSmartAccountParameters,
  type ToSimpleSmartAccountReturnType,
  toSimpleSmartAccount,
} from "./simple/toSimpleSmartAccount.js";
```

#### 7702 Simple Smart Account
```typescript
export {
  type To7702SimpleSmartAccountImplementation,
  type To7702SimpleSmartAccountParameters,
  type To7702SimpleSmartAccountReturnType,
  to7702SimpleSmartAccount,
} from "./simple/to7702SimpleSmartAccount.js";
```

#### Light Smart Account
```typescript
export {
  type LightAccountVersion,
  type LightSmartAccountImplementation,
  type ToLightSmartAccountParameters,
  type ToLightSmartAccountReturnType,
  toLightSmartAccount,
} from "./light/toLightSmartAccount.js";
```

#### Trust Smart Account
```typescript
export {
  type ToTrustSmartAccountParameters,
  type ToTrustSmartAccountReturnType,
  type TrustSmartAccountImplementation,
  toTrustSmartAccount,
} from "./trust/toTrustSmartAccount.js";
```

#### Etherspot Smart Account
```typescript
export {
  type EtherspotSmartAccountImplementation,
  type ToEtherspotSmartAccountParameters,
  type ToEtherspotSmartAccountReturnType,
  toEtherspotSmartAccount,
} from "./etherspot/toEtherspotSmartAccount.js";
```

#### Safe Smart Account
```typescript
export {
  type SafeSmartAccountImplementation,
  type SafeVersion,
  type ToSafeSmartAccountParameters,
  type ToSafeSmartAccountReturnType,
  toSafeSmartAccount,
} from "./safe/toSafeSmartAccount.js";
```

#### ECDSA Kernel Smart Account
```typescript
export {
  type EcdsaKernelSmartAccountImplementation,
  type ToEcdsaKernelSmartAccountParameters,
  type ToEcdsaKernelSmartAccountReturnType,
  toEcdsaKernelSmartAccount,
} from "./kernel/toEcdsaKernelSmartAccount.js";
```

#### 7702 Kernel Smart Account
```typescript
export {
  type To7702KernelSmartAccountImplementation,
  type To7702KernelSmartAccountParameters,
  type To7702KernelSmartAccountReturnType,
  to7702KernelSmartAccount,
} from "./kernel/to7702KernelSmartAccount.js";
```

#### Kernel Smart Account
```typescript
export {
  type KernelSmartAccountImplementation,
  type KernelVersion,
  type ToKernelSmartAccountParameters,
  type ToKernelSmartAccountReturnType,
  toKernelSmartAccount,
} from "./kernel/toKernelSmartAccount.js";
```

#### Biconomy Smart Account
```typescript
export {
  type BiconomySmartAccountImplementation,
  type ToBiconomySmartAccountParameters,
  type ToBiconomySmartAccountReturnType,
  toBiconomySmartAccount,
} from "./biconomy/toBiconomySmartAccount.js";
```

#### Nexus Smart Account
```typescript
export {
  type NexusSmartAccountImplementation,
  type ToNexusSmartAccountParameters,
  type ToNexusSmartAccountReturnType,
  toNexusSmartAccount,
} from "./nexus/toNexusSmartAccount.js";
```

#### Thirdweb Smart Account
```typescript
export {
  type ThirdwebSmartAccountImplementation,
  type ToThirdwebSmartAccountParameters,
  type ToThirdwebSmartAccountReturnType,
  toThirdwebSmartAccount,
} from "./thirdweb/toThirdwebSmartAccount.js";
```

---

## Utility Functions

### General Utilities
```typescript
export { deepHexlify, transactionReceiptStatus } from "./deepHexlify.js";
export { getAddressFromInitCodeOrPaymasterAndData } from "./getAddressFromInitCodeOrPaymasterAndData.js";
export {
  type GetRequiredPrefundReturnType,
  getRequiredPrefund,
} from "./getRequiredPrefund.js";
export { isSmartAccountDeployed } from "./isSmartAccountDeployed.js";
export { toOwner } from "./toOwner.js";
```

### Nonce Management
```typescript
export { decodeNonce } from "./decodeNonce.js";
export { encodeNonce } from "./encodeNonce.js";
```

### Module Management
```typescript
export {
  type EncodeInstallModuleParameters,
  encodeInstallModule,
} from "./encodeInstallModule.js";

export {
  type EncodeUninstallModuleParameters,
  encodeUninstallModule,
} from "./encodeUninstallModule.js";
```

### User Operation Utilities
```typescript
export { getPackedUserOperation } from "./getPackedUserOperation.js";

export {
  type EncodeCallDataParams,
  encode7579Calls,
} from "./encode7579Calls.js";

export {
  type DecodeCallDataReturnType,
  decode7579Calls,
} from "./decode7579Calls.js";
```

### ERC20 Override Utilities
```typescript
export {
  type Erc20AllowanceOverrideParameters,
  erc20AllowanceOverride,
} from "./erc20AllowanceOverride.js";

export {
  type Erc20BalanceOverrideParameters,
  erc20BalanceOverride,
} from "./erc20BalanceOverride.js";
```

### Ox Module Utilities
```typescript
export { getOxExports, hasOxModule } from "./ox.js";
```

---

## Error Types

### AccountNotFoundError
```typescript
export class AccountNotFoundError extends BaseError {
  constructor({ docsPath }: { docsPath?: string | undefined } = {}) {
    super(
      [
        "Could not find an Account to execute with this Action.",
        "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.",
      ].join("\n"),
      {
        docsPath,
        docsSlug: "account",
        name: "AccountNotFoundError",
      },
    );
  }
}
```

---

## Smart Account Client

### Type Definitions

#### SmartAccountClient
```typescript
export type SmartAccountClient
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify
  Client
    transport,
    chain extends Chain
      ? chain
      : client extends Client<any, infer chain>
        ? chain
        : undefined,
    account,
    rpcSchema extends RpcSchema
      ? [...BundlerRpcSchema, ...rpcSchema]
      : BundlerRpcSchema,
    BundlerActions<account> & SmartAccountActions<chain, account>
  >
> & {
  client: client;
  paymaster: BundlerClientConfig["paymaster"] | undefined;
  paymasterContext: BundlerClientConfig["paymasterContext"] | undefined;
  userOperation: BundlerClientConfig["userOperation"] | undefined;
};
```

#### SmartAccountClientConfig
```typescript
export type SmartAccountClientConfig
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify
  Pick
    ClientConfig<transport, chain, account, rpcSchema>,
    | "account"
    | "cacheTime"
    | "chain"
    | "key"
    | "name"
    | "pollingInterval"
    | "rpcSchema"
  >
> & {
  /** Transport for bundler communication */
  bundlerTransport: transport;

  /** Client that points to an Execution RPC URL */
  client?: client | Client | undefined;

  /** Paymaster configuration */
  paymaster?:
    | true
    | {
        /** Retrieves paymaster-related User Operation properties for sending */
        getPaymasterData?: PaymasterActions["getPaymasterData"] | undefined;
        /** Retrieves paymaster-related User Operation properties for gas estimation */
        getPaymasterStubData?: PaymasterActions["getPaymasterStubData"] | undefined;
      }
    | undefined;

  /** Paymaster context to pass to getPaymasterData and getPaymasterStubData calls */
  paymasterContext?: unknown;

  /** User Operation configuration */
  userOperation?:
    | {
        /** Prepares fee properties for the User Operation request */
        estimateFeesPerGas?: ((parameters: {
          account: account | SmartAccount;
          bundlerClient: Client;
          userOperation: UserOperationRequest;
        }) => Promise<EstimateFeesPerGasReturnType<"eip1559">>) | undefined;
        /** Prepare User Operation configuration */
        prepareUserOperation?: typeof viemPrepareUserOperation | undefined;
      }
    | undefined;
};
```

### createSmartAccountClient Function
```typescript
export function createSmartAccountClient
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: SmartAccountClientConfig<transport, chain, account, client, rpcSchema>,
): SmartAccountClient<transport, chain, account, client, rpcSchema>;
```

---

## Smart Account Actions

### SmartAccountActions Type
```typescript
export type SmartAccountActions
  TChain extends Chain | undefined = Chain | undefined,
  TSmartAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  sendTransaction: /* ... */;
  signMessage: /* ... */;
  signTypedData: /* ... */;
  writeContract: /* ... */;
  sendCalls: /* ... */;
  getCallsStatus: /* ... */;
};
```

### sendTransaction
Creates, signs, and sends a new transaction to the network. This function also allows you to sponsor this transaction if sender is a smart account.

**Docs:** https://viem.sh/docs/actions/wallet/sendTransaction.html

**JSON-RPC Methods:**
- JSON-RPC Accounts: `eth_sendTransaction`
- Local Accounts: `eth_sendRawTransaction`

**Example:**
```typescript
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
})

const hash = await client.sendTransaction({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
})
```

### signMessage
Calculates an Ethereum-specific signature in EIP-191 format: `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

**Docs:** https://viem.sh/docs/actions/wallet/signMessage.html

**JSON-RPC Methods:**
- JSON-RPC Accounts: `personal_sign`
- Local Accounts: Signs locally. No JSON-RPC request.

With the calculated signature, you can:
- Use `verifyMessage` to verify the signature
- Use `recoverMessageAddress` to recover the signing address from a signature

**Example:**
```typescript
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
})

const signature = await client.signMessage({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  message: 'hello world',
})
```

### signTypedData
Signs typed data and calculates an Ethereum-specific signature in EIP-191 format.

**Docs:** https://viem.sh/docs/actions/wallet/signTypedData.html

**JSON-RPC Methods:**
- JSON-RPC Accounts: `eth_signTypedData_v4`
- Local Accounts: Signs locally. No JSON-RPC request.

### writeContract
Executes a write function on a contract. This function also allows you to sponsor this transaction if sender is a smart account.

**Docs:** https://viem.sh/docs/contract/writeContract.html

A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a Transaction is needed to be broadcast in order to change the state.

Internally, uses a Wallet Client to call the `sendTransaction` action with ABI-encoded `data`.

**Warning:** The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to simulate the contract write with `contract.simulate` before you execute it.

**Example:**
```typescript
import { createWalletClient, custom, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
})

const hash = await client.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
  functionName: 'mint',
  args: [69420],
})
```

### sendCalls
Sends multiple calls in a single transaction.

### getCallsStatus
Retrieves the status of previously sent calls.

---

## Pimlico Actions

### PimlicoActions Type
```typescript
export type PimlicoActions
  TChain extends Chain | undefined,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  getUserOperationGasPrice: () => Promise<Prettify<GetUserOperationGasPriceReturnType>>;
  getUserOperationStatus: (args: Prettify<GetUserOperationStatusParameters>) => Promise<Prettify<GetUserOperationStatusReturnType>>;
  sendCompressedUserOperation: (args: Prettify<Omit<SendCompressedUserOperationParameters, "entryPointAddress">>) => Promise<Hash>;
  sponsorUserOperation: (args: Omit<PimlicoSponsorUserOperationParameters<entryPointVersion>, "entryPoint">) => Promise<Prettify<SponsorUserOperationReturnType<entryPointVersion>>>;
  validateSponsorshipPolicies: (args: Prettify<Omit<ValidateSponsorshipPoliciesParameters, "entryPointAddress">>) => Promise<Prettify<ValidateSponsorshipPolicies>[]>;
  getTokenQuotes: <TChainOverride extends Chain | undefined = Chain | undefined>(args: Prettify<Omit<GetTokenQuotesParameters<TChain, TChainOverride>, "entryPointAddress">>) => Promise<Prettify<GetTokenQuotesReturnType>>;
  estimateErc20PaymasterCost: <TChainOverride extends Chain | undefined = Chain | undefined>(args: Omit<EstimateErc20PaymasterCostParameters<entryPointVersion, TChain, TChainOverride>, "entryPoint">) => Promise<Prettify<EstimateErc20PaymasterCostReturnType>>;
};
```

### getUserOperationGasPrice
Returns the live gas prices that you can use to send a user operation.

**Docs:** https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/getUserOperationGasPrice

**Returns:** slow, standard & fast values for maxFeePerGas & maxPriorityFeePerGas

**Example:**
```typescript
import { createClient } from "viem"
import { pimlicoBundlerActions } from "permissionless/actions/pimlico"

const bundlerClient = createClient({
  chain: goerli,
  transport: http("https://api.pimlico.io/v2/goerli/rpc?apikey=YOUR_API_KEY_HERE")
}).extend(pimlicoBundlerActions)

await bundlerClient.getUserOperationGasPrice()
```

### getUserOperationStatus
Returns the status of the userOperation that is pending in the mempool.

**Docs:** https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/getUserOperationStatus

**Parameters:**
- `hash`: UserOpHash that you must have received from sendUserOperation

**Returns:** status & transaction hash if included

**Example:**
```typescript
import { createClient } from "viem"
import { pimlicoBundlerActions } from "permissionless/actions/pimlico"

const bundlerClient = createClient({
  chain: goerli,
  transport: http("https://api.pimlico.io/v2/goerli/rpc?apikey=YOUR_API_KEY_HERE")
}).extend(pimlicoBundlerActions)

await bundlerClient.getUserOperationStatus({ hash: userOpHash })
```

### sendCompressedUserOperation
**⚠️ DEPRECATED:** `pimlico_sendCompressedUserOperation` has been deprecated due to EIP-4844 blobs. Please use `sendUserOperation` instead.

Sends a compressed user operation to the bundler.

**Docs:** https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/sendCompressedUserOperation

### sponsorUserOperation
Sponsors a user operation using Pimlico's paymaster service.

### validateSponsorshipPolicies
Validates sponsorship policies for a user operation.

### getTokenQuotes
Retrieves token quotes for ERC20 paymaster operations.

### estimateErc20PaymasterCost
Estimates the cost of using an ERC20 token as payment for gas.

---

## Sponsor User Operation

### PimlicoSponsorUserOperationParameters
```typescript
export type PimlicoSponsorUserOperationParameters
  entryPointVersion extends EntryPointVersion,
> = {
  userOperation: OneOf
    | (entryPointVersion extends "0.6"
        ? PartialBy<UserOperation<"0.6">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit">
        : never)
    | (entryPointVersion extends "0.7"
        ? PartialBy<UserOperation<"0.7">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit" | "paymasterVerificationGasLimit" | "paymasterPostOpGasLimit">
        : never)
  >;
  entryPoint: {
    address: Address;
    version: entryPointVersion;
  };
  sponsorshipPolicyId?: string;
  paymasterContext?: PaymasterContext | unknown;
};
```

### PaymasterContext
```typescript
type PaymasterContext = {
  sponsorshipPolicyId?: string;
  validForSeconds?: number;
  meta?: Record<string, string>;
  [key: string]: unknown;
};
```

### SponsorUserOperationReturnType
```typescript
export type SponsorUserOperationReturnType
  entryPointVersion extends EntryPointVersion = "0.7",
> = OneOf
  | (entryPointVersion extends "0.6"
      ? {
          callGasLimit: bigint;
          verificationGasLimit: bigint;
          preVerificationGas: bigint;
          paymasterAndData: Hex;
        }
      : never)
  | (entryPointVersion extends "0.7"
      ? {
          callGasLimit: bigint;
          verificationGasLimit: bigint;
          preVerificationGas: bigint;
          paymaster: Address;
          paymasterVerificationGasLimit: bigint;
          paymasterPostOpGasLimit: bigint;
          paymasterData: Hex;
        }
      : never)
>;
```

---

## Get Paymaster Stub Data

### getPaymasterStubData
Retrieves paymaster-related User Operation properties to be used for gas estimation.

**Docs:** https://viem.sh/account-abstraction/actions/paymaster/getPaymasterStubData

**Example:**
```typescript
import { http } from 'viem'
import { createPaymasterClient, getPaymasterStubData } from 'viem/account-abstraction'

const paymasterClient = createPaymasterClient({
  transport: http('https://...'),
})

const userOperation = { ... }

const values = await getPaymasterStubData(paymasterClient, {
  chainId: 1,
  entryPointAddress: '0x...',
  ...userOperation,
})
```

### GetPaymasterStubDataParameters
```typescript
export type GetPaymasterStubDataParameters = OneOf
  | PartialBy
      Pick
        UserOperation<"0.6">,
        | "callData"
        | "callGasLimit"
        | "initCode"
        | "maxFeePerGas"
        | "maxPriorityFeePerGas"
        | "nonce"
        | "sender"
        | "preVerificationGas"
        | "verificationGasLimit"
      >,
      | "callGasLimit"
      | "initCode"
      | "maxFeePerGas"
      | "maxPriorityFeePerGas"
      | "preVerificationGas"
      | "verificationGasLimit"
    >
  | PartialBy
      Pick
        UserOperation<"0.7">,
        | "callData"
        | "callGasLimit"
        | "factory"
        | "factoryData"
        | "maxFeePerGas"
        | "maxPriorityFeePerGas"
        | "nonce"
        | "sender"
        | "preVerificationGas"
        | "verificationGasLimit"
      >,
      | "callGasLimit"
      | "factory"
      | "factoryData"
      | "maxFeePerGas"
      | "maxPriorityFeePerGas"
      | "preVerificationGas"
      | "verificationGasLimit"
    >
> & {
  context?: unknown | undefined;
  chainId: number;
  entryPointAddress: Address;
};
```

### GetPaymasterStubDataReturnType
```typescript
export type GetPaymasterStubDataReturnType = Prettify
  OneOf
    | { paymasterAndData: Hex }
    | {
        paymaster: Address;
        paymasterData: Hex;
        paymasterVerificationGasLimit?: bigint | undefined;
        paymasterPostOpGasLimit: bigint;
      }
  > & {
    sponsor?: { name: string; icon?: string | undefined } | undefined;
    isFinal?: boolean | undefined;
  }
>;
```

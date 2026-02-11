# Migration Guide

## 0.2.0

:::warning
This migration guide is assuming you have already migrated to ^0.1.0 and are now migrating to 0.2.0.
:::

### Using viem 2.20.0

Viem released their own version of account abstraction primitives since version `2.18.0`.
Since permissionless.js has viem as a peer dependency and are heavily inspired by viem, we will be updating to use the native account abstraction primitives provided by viem.
For full documentation on viem's account abstraction primitives, please refer to the [viem documentation](https://viem.sh/account-abstraction).

### Deprecated `createBundlerClient`

Viem has default [createBundlerClient](https://viem.sh/account-abstraction/clients/bundler) so we have deprecated the permissionless.js bundler client.
This means we have also deprecated the following bundler actions:

1. `chainId`
2. `estimateUserOperationGas`
3. `getUserOperationByHash`
4. `getUserOperationReceipt`
5. `sendUserOperation`
6. `supportedEntryPoints`
7. `waitForUserOperationReceipt`

### Deprecated `getEntryPointVersion`

This is no more needed as all the permissionless versions now accepts entryPoint version explicitly.

### Deprecated `getUserOperationHash`

This is part of `viem/account-abstraction` and now can be directly imported from `viem`.

### Deprecated `signUserOperationHashWithECDSA`

### Deprecated `experimental 7677`

### Changed `signerToBiconomySmartAccount` to `toBiconomySmartAccount`

```ts
import { toBiconomySmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint06Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const biconomyAccount = await signerToBiconomySmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V06, // [!code --]
    ...rest
}) // [!code --]
const biconomyAccount = await toBiconomySmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owners: [privateKeyToAccount(generatePrivateKey())],// [!code ++]
    entryPoint: { // [!code ++] 
        address: entryPoint06Address, // [!code ++]
        version: "0.6", // [!code ++]
    } // [!code ++]
    ...rest
})    
```

:::warning
Note, Biconomy's account doesn't work with entryPoint 0.7.
:::

### Changed `signerToEcdsaKernelSmartAccount` to `toEcdsaKernelSmartAccount`

```ts
import { toEcdsaKernelSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint07Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const kernelAccount = await signerToEcdsaKernelSmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V06, // [!code --]
    ...rest
}) // [!code --]
const kernelAccount = await toEcdsaKernelSmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owners: [privateKeyToAccount(generatePrivateKey())],// [!code ++]
    entryPoint: { // optional, defaults to 0.7 // [!code ++]
        address: entryPoint07Address, // [!code ++]
        version: "0.7", // [!code ++]
    }, // [!code ++]
    ...rest
})    
```

### Changed `signerToLightSmartAccount` to `toLightSmartAccount`

```ts
import { toLightSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint06Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const kernelAccount = await signerToLightSmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V06, // [!code --]
    lightAccountVersion: "1.1.0" // [!code --]
    ...rest
}) // [!code --]
const kernelAccount = await toLightSmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owners: [privateKeyToAccount(generatePrivateKey())],// [!code ++]
    entryPoint: { // optional, defaults to 0.7 // [!code ++] 
        address: entryPoint06Address, // [!code ++]
        version: "0.6", // [!code ++]
    }, // [!code ++]
    version: "1.1.0" // optional, defaults to "2.0.0" // [!code ++]
    ...rest
})    
```

:::info
We have also added support for `2.0.0` Light Account.
:::

:::warning
The Light Account version `1.1.0` works only with EntryPoint version `0.6` while `2.0.0` works only with EntryPoint version `0.7`.
:::

### Changed `signerToSafeSmartAccount` to `toSafeSmartAccount`

```ts
import { toSafeSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint07Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const safeAccount = await signerToSafeSmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V07, // [!code --]
    safeVersion: "1.4.1" // [!code --]
    ...rest
}) // [!code --]
const safeAccount = await toSafeSmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owners: [privateKeyToAccount(generatePrivateKey())],// [!code ++]
    entryPoint: { // optional, defaults to 0.7 // [!code ++]
        address: entryPoint07Address, // [!code ++]
        version: "0.7", // [!code ++]
    }, // [!code ++]
    version: "1.4.1" // [!code ++]
    ...rest
})
```

### Changed `signerToSimpleSmartAccount` to `toSimpleSmartAccount`

```ts
import { toSimpleSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint07Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const simpleAccount = await signerToSimpleSmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V06, // [!code --]
    ...rest
}) // [!code --]
const simpleAccount = await toSimpleSmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owner: privateKeyToAccount(generatePrivateKey()),// [!code ++]
    entryPoint: { // optional, defaults to 0.7 // [!code ++]
        address: entryPoint07Address, // [!code ++]
        version: "0.7", // [!code ++]
    }, // [!code ++]
    ...rest
})
```

### Changed `signerToTrustSmartAccount` to `toTrustSmartAccount`

```ts
import { toTrustSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint06Address } from "viem/account-abstraction"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const trustAccount = await signerToTrustSmartAccount(client { // [!code --]
    signer: privateKeyToAccount(generatePrivateKey()), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V06, // [!code --]
    ...rest
}) // [!code --]
const trustAccount = await toTrustSmartAccount({ // [!code ++]
    client: publicClient, // [!code ++]
    owner: privateKeyToAccount(generatePrivateKey()),// [!code ++]
    entryPoint: { // [!code ++]
        address: entryPoint06Address, // [!code ++]
        version: "0.6", // [!code ++]
    }, // [!code ++]
    ...rest
})
```

:::warning
Note, trust wallet's account doesn't work with entryPoint 0.7.
:::

### Deprecated `privateKeyTo\<account-name\>SmartAccount

All the private key to account conversion functions are now deprecated. You can use `to<account-name>SmartAccount` to create a smart account instead.

Example: 

```ts
import { toSafeSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { entryPoint07Address } from "viem/account-abstraction"
import { privateKeyToAccount } from "viem/accounts"

const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [privateKeyToAccount(privateKey)],
    entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
    }, // global entrypoint
    version: "1.4.1",
})
```

### Merged `createPimlicoPaymasterClient` and `createPimlicoBundlerClient` to `createPimlicoClient`

```ts
import { http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction"
import { createPimlicoClient } from "permissionless/clients/pimlico"

const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=<PIMLICO_API_KEY>`


const pimlicoPaymasterClient = createPimlicoPaymasterClient({ // [!code --]
    chain: foundry, // [!code --]
    transport: http(paymasterRpc), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V07 // [!code --]
}) // [!code --]

const pimlicoPaymasterClient = createPimlicoPaymasterClient({ // [!code --]
    chain: foundry, // [!code --]
    transport: http(paymasterRpc), // [!code --]
    entryPoint: ENTRYPOINT_ADDRESS_V07 // [!code --]
}) // [!code --]

const pimlicoClient = createPimlicoClient({ // [!code ++]
    transport: http(pimlicoUrl), // [!code ++]
    entryPoint: { // Optional, defaults to 0.7 // [!code ++]
        address: entryPoint07Address, // [!code ++]
        version: "0.7", // [!code ++]
    } // [!code ++]
}) // [!code ++]
```

All the previous actions that were part of `createPimlicoBundlerClient` and `createPimlicoPaymasterClient` are now part of `createPimlicoClient` and can also be accessed individually.

Pimlico client also extends actions of Paymaster client by viem. It uses ERC-7677 as the default standard to communicate with Pimlico paymasters.

### Deprecated `smartAccountClient.deployContract`

### Changed `smartAccountClient.prepareUserOperationRequest` to `smartAccountClient.prepareUserOperation`

```ts
import { smartAccountClient } from './config'

const userOperation = await smartAccountClient.prepareUserOperationRequest({ // [!code --]
    userOperation: { // [!code --]
        callData: await smartAccountClient.account.encodeCallData({ // [!code --]
            to: CONTRACT_ADDRESS, // [!code --]
            data: "0x", // [!code --]
            value: parseEther('1') // [!code --]
        }), // [!code --]
    } // [!code --]
}) // [!code --]

const userOperation = await smartAccountClient.prepareUserOperation({ // [!code ++]
    calls: [{ // [!code ++]
        to: CONTRACT_ADDRESS, // [!code ++]
        data: "0x", // [!code ++]
        value: parseEther('1') // [!code ++]
    }] // [!code ++]
}) // [!code ++]
```

### Changed `smartAccountClient.sendUserOperation`

```ts
import { smartAccountClient } from './config'

const userOperationHash = await smartAccountClient.sendUserOperation({
    userOperation: { // [!code --]
        sender: "0x6152348912fb1e78c9037D83f9d4524D4a2988Ed",
        nonce: "0x8104e3ad430ea6d354d013a6789fdfc71e671c4300000000000000000000",
        factory: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5",
        factoryData: "0xc5265d5d0000000000000000000000006723b44abeec4e71ebe3232bd5b455805badd22f0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e412af322c018104e3ad430ea6d354d013a6789fdfc71e671c4300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000014ec787ae5c34157ce61e751e54dff3612d4117663000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        callData: "0xe9ae5c530100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000594bc666500faed35dc741f45a35c571399560d80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e4e688a440000000000000000000000000c67e4838d4e6682e3a5f9ec27f133e76cb3855f30000000000000000000000006152348912fb1e78c9037d83f9d4524d4a2988ed00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041aebdfb90adba067d9304980a300636506c3c9081b01f64b04f108407a890602377625ef9096946cc028743123646881c7e31a1c8d6698132c188cb4c33a3f9151b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        maxFeePerGas: 99985502n,
        maxPriorityFeePerGas: 1221000n,
        preVerificationGas: 66875n,
        verificationGasLimit: 373705n,
        callGasLimit: 170447n,
        paymaster: "0x9d0021A869f1Ed3a661Ffe8C9B41Ec6244261d98",
        paymasterData: "0x000000000000000000000000000000000000000000000000000000006638ab470000000000000000000000000000000000000000000000000000000000000000e9311d1945317dc6a1c750e8e6d0641a598beb59edc5652ed3807ca57338a7a107123e1a479386b2c91f242d2dff367c18e0ad9d1021acfe47afc890e252644e1c",
        paymasterVerificationGasLimit: 20274n,
        paymasterPostOpGasLimit: 1n,
        signature: "0xa58d445f26b126fcd644975f0c66bd45f3e6e5b9c1acec2eeee490aa9341cfc312988231c228f84e12eac2d90ed9cd8825546d70d73b2e0fabdd6c8089ab29581b",
    } // [!code --]
})
```

It also allows you to submit user operations with using `calls` object like with `sendTransaction`. You can read more about it [here](https://viem.sh/account-abstraction/actions/bundler/sendUserOperation).

### Deprecated `smartAccountClient.sendTransactions`

Use `smartAccountClient.sendTransaction` instead. It now accepts an array of transactions. Read more about it [here](/references/permissionless/reference/smart-account-actions/sendTransaction#usage).

Example:

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{ // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('1') // [!code focus]
  }, { // [!code focus]
    abi: wagmiAbi, // [!code focus]
    functionName: 'mint', // [!code focus]
    to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  }] // [!code focus]
})
```

### Error handling

We have deprecated permissionless.js error handling and now use viem's error handling.

---

# Pimlico Client

A Pimlico Bundler Client is an interface to official ERC-4337 & ERC-7677 JSON-RPC API methods that include sending user operations, estimation user operation gas limits, getting user operation receipts, supporting paymaster rpc methods and more as well as the Pimlico-specific bundler methods [pimlico_getUserOperationStatus](/references/bundler/endpoints/pimlico_getUserOperationStatus) and [pimlico_getUserOperationGasPrice](/references/bundler/endpoints/pimlico_getUserOperationGasPrice).

To create a Pimlico Client, you can use the `createPimlicoClient` method.

## Import

```ts twoslash
import { createPimlicoClient } from 'permissionless/clients/pimlico'
```

## Usage

Initialize th client with your desired Chain (e.g. mainnet) and Transport (e.g. http) from viem. Pimlico client will by default have bundler actions, paymaster actions and custom pimlico actions.

```ts twoslash
import { http } from 'viem'
import { sepolia } from 'viem/chains'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { entryPoint07Address } from "viem/account-abstraction"

const pimlicoClient = createPimlicoClient({ 
  transport: http("https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_API_KEY_HERE"),
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  }
})
```

Then you can consume Pimlico Bundler Actions:

```ts
const userOperationGasPrice = await pimlicoClient.getUserOperationGasPrice()
```

Alternatively, you can create a barebon client and extend pimlico specific actions:

```ts twoslash
import { http, createClient } from 'viem'
import { sepolia } from 'viem/chains'
import { pimlicoActions } from "permissionless/actions/pimlico";
import { bundlerActions, paymasterActions, entryPoint07Address } from "viem/account-abstraction";

const client = createClient({
    chain: sepolia,
    transport: http("https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_API_KEY_HERE"),
})
    .extend(bundlerActions)
    .extend(paymasterActions)
    .extend(
        pimlicoActions({
            entryPoint: {
                address: entryPoint07Address,
                version: "0.7",
            }
        })
    )
```

---

# Smart Account Client

A Smart Account Client is an almost drop-in replacement for a standard viem [walletClient](https://viem.sh/docs/clients/wallet) but for managing smart accounts instead of EOA accounts. In addition, a Smart Account Client also contains, depending on the underlying smart account implementation used, a few extra actions that are specific to smart accounts.

To create a Smart Account Client, use the `createSmartAccountClient` function.

## Import

```ts twoslash
import { createSmartAccountClient } from 'permissionless'
```

## Usage

Initialize a Smart Account Client with your desired account (which can be created using a function like `toSimpleSmartAccount`), chain, bundler transport, and optionally a sponsorUserOperation middleware by using the `createSmartAccountClient` method:

```ts
import {  http } from "viem"
import { sepolia } from "viem/chains"
import { createSmartAccountClient } from "permissionless"
import { simpleSmartAccount } from "./simpleSmartAccount"; // created elsewhere
import { pimlicoClient } from "./pimlicoClient"; // created elsewhere

const pimlicoBundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=<PIMLICO_API_KEY>`

const smartAccountClient = createSmartAccountClient({
    account: simpleSmartAccount,
    chain: sepolia,
    bundlerTransport: http(pimlicoBundlerUrl),
    paymaster: pimlicoClient, // optional
    userOperation: {
        estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast // only when using pimlico bundler
        },
    }
})
```

Then you can consume Smart Account Actions and access properties:

```ts
const smartAccountAddress = await smartAccountClient.account.address
```

---

# toSimpleSmartAccount

Creates a SimpleAccount instance controlled by a `owner`.

## Usage

::::code-group

```ts [example.ts]
import { toSimpleSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { owner } from "./owner"

const simpleSmartAccount = await toSimpleSmartAccount({
  owner,
  client: publicClient,
  entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
    }
})
```

```ts [publicClient.ts]
// [!include ~/snippets/publicClient.ts:client]
```

```ts [owner.ts]
// [!include ~/snippets/owner.ts]
```

::::

## Returns

- **Type:** `SmartAccount<SimpleSmartAccountImplementation>`

The smart account instance.

## Parameters

### client
- **Type:** `Client`

A public client as smart account needs access to the Network to query for information about its state (e.g. nonce, address, etc).

### owner

- **Type:** `LocalAccount | EIP1193Provider | WalletClient`

The owner that will be used to sign messages and user operations.

### factoryAddress (optional)

- **Type:** `Address`

The address of the simple account factory that will be used to deploy the smart account.

:::info
The canonical simple account factory for v0.6 of the EntryPoint is `0x9406Cc6185a346906296840746125a0E44976454`
:::

### entryPoint (optional)

- **Type:** `{ address: Address, version: "0.6" | "0.7" }`

The address and the version of the EntryPoint contract. If not provided, entryPoint 0.7 will be used.

### index (optional)

- **Type:** `bigint`

It represents salt nonce that will be used to deploy the smart account. If not provided, `0` will be used.

### address (optional)

- **Type:** `Address`

:::warning
If you provide an address, the smart account can not be deployed. This should be used if you want to interact with an existing smart account.
:::

The address of the smart account. If not provided, the determinstic smart account address will be used.

---

# to7702SimpleSmartAccount

Creates a SimpleAccount instance by delegating `owner` using EIP-7702.

## Usage

::::code-group

```ts [example.ts]
import { to7702SimpleSmartAccount } from "permissionless/accounts"
import { publicClient } from "./publicClient"
import { owner } from "./owner"

const simpleSmartAccount = await to7702SimpleSmartAccount({
  client: publicClient,
  owner
})
```

```ts [publicClient.ts]
// [!include ~/snippets/publicClient.ts:client]
```

```ts [owner.ts]
// [!include ~/snippets/owner.ts]
```

::::

## Returns

-  **Type:** `SimpleSmartAccountImplementation<entryPointVersion, true>`

This represents the smart account instance.

## Parameters

### client
-  **Type:** `Client`

A public client is required as the smart account needs access to the network to query information about its state (e.g., nonce, address, etc.).

### owner

-  **Type:** `LocalAccount | EIP1193Provider | WalletClient`

The owner which will be delegated to simple smart account.

### accountLogicAddress (optional)

-  **Type:** `Address`

Ownership will be delegated to this account logic address.

:::info
The accountLogicAddress for v0.8 of the EntryPoint is `0xe6Cae83BdE06E4c305530e199D7217f42808555B`.
:::

### entryPoint (optional)

-  **Type:** `{ address: Address, version: "0.8" }`

This specifies the address and version of the EntryPoint contract. If not provided, entryPoint 0.8 will be used.

---

# toKernelSmartAccount

Creates a KernelAccount instance controlled by a `owners`.  Check out [this guide](/guides/how-to/accounts/use-kernel-account) for a complete tutorial.

## Usage

::::code-group

```ts [example.ts]
import { toKernelSmartAccount } from "permissionless/accounts"
import { entryPoint07Address } from "viem/account-abstraction"
import { publicClient } from "./publicClient"
import { owner } from "./owner"

const kernelAccount = await toKernelSmartAccount({
    client: publicClient,
    entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
    },
    owners: [owner],
    version: "0.3.1"
});
```

```ts [publicClient.ts]
// [!include ~/snippets/publicClient.ts:client]
```

```ts [owner.ts]
// [!include ~/snippets/owner.ts]
```

::::

## Returns

- **Type:** `SmartAccount<EcdsaKernelSmartAccountImplementation>`

The Kernel smart account instance.

## Parameters

### client
- **Type:** `Client`

A public client as smart account needs access to the Network to query for information about its state (e.g. nonce, address, etc).

### owners

- **Type:** `[LocalAccount | EIP1193Provider | WalletClient]`

The owners that will be used to sign messages and user operations.

### entryPoint (optional)

- **Type:** `{ address: Address, version: "0.6" | "0.7" }`

The address and the version of the EntryPoint contract. If not provided, entryPoint 0.7 will be used.

### index (optional)

- **Type:** `bigint`

The index (which is basically a salt) that will be used to deploy the smart account. If not provided, `0` will be used.

### address (optional)

- **Type:** `Address`

:::warning
If you provide an address, the smart account can not be deployed. This should be used if you want to interact with an existing smart account.
:::

The address of the smart account. If not provided, the deterministic smart account address will be used.

### version (optional)

- **Type:** `"0.2.1" | "0.2.2" | "0.2.3" | "0.2.4" | "0.3.0-beta" | "0.3.1"`

The version of the Kernel contract that will be used. `0.2.x` can only be used with entryPoint 0.6. `0.3.x` can only be used with entryPoint 0.7.

### factoryAddress (optional)

- **Type:** `Address`

The address of the Kernel factory that will be used to deploy the smart account. This is only used if the version is `0.2.x`.

### metaFactoryAddress (optional)

- **Type:** `Address`

The address of the Kernel meta factory that will be used to deploy the smart account. This is only used if the version is `0.3.x`.

### accountLogicAddress (optional)

- **Type:** `Address`

The address of the Kernel account logic that will be used to deploy the smart account.

### validatorAddress (optional)

- **Type:** `Address`

The address of the ECDSA validator that will be used to deploy the smart account.

---

# to7702KernelSmartAccount

Creates a KernelAccount instance by delegating `owner` using EIP-7702.  Check out [this guide](/guides/eip7702/demo) for a complete tutorial.

## Usage

::::code-group

```ts [example.ts]
import { to7702KernelSmartAccount } from "permissionless/accounts"
import { entryPoint07Address } from "viem/account-abstraction"
import { publicClient } from "./publicClient"
import { owner } from "./owner"

const kernelAccount = await to7702KernelSmartAccount({
    client: publicClient,
    version: "0.3.1"
    entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
    },
    owner
});
```

```ts [publicClient.ts]
// [!include ~/snippets/publicClient.ts:client]
```

```ts [owner.ts]
// [!include ~/snippets/owner.ts]
```

::::

## Returns

- **Type:** `SmartAccount<KernelSmartAccountImplementation<entryPointVersion, true>>`

The Kernel smart account instance.

## Parameters

### client
- **Type:** `Client`

A public client as smart account needs access to the Network to query for information about its state (e.g. nonce, address, etc).

### owner

- **Type:** `[LocalAccount | EIP1193Provider | WalletClient]`

The owner which will be delegated to kernel smart account.

### entryPoint (optional)

- **Type:** `{ address: Address, version: "0.6" | "0.7" }`

The address and the version of the EntryPoint contract. If not provided, entryPoint 0.7 will be used.

### accountLogicAddress (optional)

- **Type:** `Address`

The address of the Kernel account logic that will be used while delegating the owner.

---


# sendTransaction

Send a transaction from a smart account using the same `sendTransaction` interface as viem.

Internally, sendTransaction calls the smartAccount's `prepareUserOperation`, `sendUserOperation`, and `waitForUserOperationReceipt` actions.

## Usage

::::code-group

```ts [example.ts]
import { smartAccountClient, simpleSmartAccount } from "./smartAccountClient"
import { parseAbiItem, encodeFunctionData } from "viem"

const hash = await smartAccountClient.sendTransaction({
    to: "0x0488bEE1Ec682db0F0E74AB52faFdDdEf10Af123",
    data: encodeFunctionData({
        abi: [parseAbiItem('function mint()')]
    }),
    value: 0n
})
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/smartAccountClient.ts:client]
```

::::

You could also use the `sendTransaction` method to send multiple transactions in a single batch like so:

```ts
const hash = await smartAccountClient.sendTransaction({
    calls: [
        {
            to: "0x0488bEE1Ec682db0F0E74AB52faFdDdEf10Af123",
            data: encodeFunctionData({
                abi: [parseAbiItem('function mint()')]
            }),
            value: 0n
        },
        {
            to: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
            abi: [{"inputs":[],"name":"getLastGreeter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"greet","outputs":[],"stateMutability":"nonpayable","type":"function"}],
            functionName: "greet",
            args: [],
        }
    ]
})
```

## Returns

- **Type:** `Hash`

The transaction hash of the mined userOperation

## Parameters

### account

- **Type:** `SmartAccount`

The Account to use for User Operation execution.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account, // [!code focus]
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }]
})
```

### calls

- **Type:** `({ data?: Hex | undefined, to: Address, value?: bigint | undefined } | { abi: Abi, functionName: string, args: unknown[], to: Address, value?: bigint | undefined })[]`

The calls to execute in the User Operation.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{ // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('1') // [!code focus]
  }, { // [!code focus]
    abi: wagmiAbi, // [!code focus]
    functionName: 'mint', // [!code focus]
    to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  }] // [!code focus]
})
```

:::tip
You can also pass raw call data via the `callData` property:

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  callData: '0xdeadbeef', // [!code focus]
})
```
:::

### callGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate the main execution call.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  callGasLimit: 69420n, // [!code focus]
})
```

### factory (optional)

- **Type:** `Address`

Account Factory address. 

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890', // [!code focus]
  factoryData: '0xdeadbeef',
})
```

### factoryData (optional)

- **Type:** `Hex`

Call data to execute on the Account Factory to deploy a Smart Account.

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890',
  factoryData: '0xdeadbeef', // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Maximum fee per gas for User Operation execution.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxFeePerGas: 420n, // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Maximum priority fee per gas for User Operation execution.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxPriorityFeePerGas: 420n, 
  maxFeePerGas: 10n, // [!code focus]
})
```

### nonce (optional)

- **Type:** `bigint`

Nonce for the User Operation.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  nonce: 10n, // [!code focus]
})
```

### paymaster (optional)

- **Type:** `Address | true | PaymasterClient | PaymasterActions`

Sets Paymaster configuration for the User Operation.

- If `paymaster: Address`, it will use the provided Paymaster contract address for sponsorship.
- If `paymaster: PaymasterClient`, it will use the provided Paymaster Client eg [Pimlico Client](/references/permissionless/reference/clients/pimlicoClient) for sponsorship.
- If `paymaster: true`, it will be assumed that the Bundler Client also supports Paymaster RPC methods (e.g. `pm_getPaymasterData`), and use them for sponsorship.

#### Using a Paymaster Contract Address

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB', // [!code focus]
  paymasterData: '0xdeadbeef',
})
```

#### Using a Paymaster Client

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const paymasterClient = createPaymasterClient({ // [!code focus]
  transport: http('https://api.pimlico.io/v2/1/rpc?apikey={API_KEY}') // [!code focus]
}) // [!code focus]

const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: paymasterClient, // [!code focus]
})
```

#### Using the Bundler Client as Paymaster

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: true, // [!code focus]
})
```

### paymasterContext (optional)

- **Type:** `unknown`

Paymaster specific fields.

:::warning
This property is only available if **`paymaster` is a Paymaster Client**.
:::

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const paymasterClient = createPaymasterClient({
  transport: http('https://api.pimlico.io/v2/1/rpc?apikey={API_KEY}')
})

const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: paymasterClient,
  paymasterContext: { // [!code focus]
    policyId: 'abc123' // [!code focus]
  }, // [!code focus]
})
```

### paymasterData (optional)

- **Type:** `Address`

Call data to execute on the Paymaster contract.

:::warning
This property is only available if **`paymaster` is an address**.
:::

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef', // [!code focus]
})
```

### paymasterPostOpGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster post-operation code.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n, // [!code focus]
})
```

### paymasterVerificationGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster validation code.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef',
  paymasterVerificationGasLimit: 69420n, // [!code focus]
})
```

### preVerificationGas (optional)

- **Type:** `bigint`

Extra gas to pay the Bunder.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  preVerificationGas: 69420n, // [!code focus]
})
```

### signature (optional)

- **Type:** `Hex`

Signature for the User Operation.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  signature: '0x...', // [!code focus]
})
```

### verificationGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the verification step.

```ts
import { account, smartAccountClient } from './config'
import { parseEther } from 'viem'
const hash = await smartAccountClient.sendTransaction({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  verificationGasLimit: 69420n, // [!code focus]
})
```

### to (optional)

- **Type:** `0x${string}`

The transaction recipient or contract address.

### data (optional)

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction.

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to EIP-1559 Transactions.

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to EIP-1559 Transactions.

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

### account (optional)

- **Type:** `SmartAccount`

The Account to send the transaction from.

---

# writeContract

Uses a smart account to executes a write function on a contract.

A "write" function on a Solidity contract modifies the state of the blockchain.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient"
import { simpleAbi } from './abi'

const hash = await smartAccountClient.writeContract({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: simpleAbi,
    functionName: 'mint',
})
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/smartAccountClient.ts:client]
```

```ts [abi.ts]
export const simpleAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ...
] as const;
```

:::

## Return Value

- **Type:** `Hash`

The transaction hash of the associated write operation

## Parameters

### address

- **Type:** `Address`

The contract address.

### abi

- **Type:** `Abi`

The contract's ABI.

### functionName

- **Type:** `string`

A function to extract from the ABI.

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

### gas (optional)

- **Type:** `bigint`

The gas limit for the transaction. Note that passing a gas limit also skips the gas estimation step.

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

### value (optional)

- **Type:** `number`

Value in wei sent with this transaction.

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to Legacy Transactions

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to EIP-1559 Transactions

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to EIP-1559 Transactions

### dataSuffix (optional)

- **Type:** `Hex`

Data to append to the end of the calldata.

### account (optional)

- **Type:** `SmartAccount`

The Account to write to the contract from.

---

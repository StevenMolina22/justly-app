# Smart Wallets

Privy makes it easy to create **smart wallets** for your users. Smart wallets are **programmable, onchain accounts** that incorporate the features of [account abstraction](https://ethereum.org/en/roadmap/account-abstraction/). With just a few lines of code, you can create smart wallets for your users to sponsor gas payments, send batched transactions, and more.

<Tip>
  We recommend using our native gas sponsorship offering to sponsor transactions on EVM and Solana.
  [Learn more](/wallets/gas-and-asset-management/gas/overview)
</Tip>

<Info>
  Please note that this native smart wallet integration is only available in the React and React
  Native SDKs. To configure smart wallets with wallets created using server-side SDKs or APIs,
  follow [this guide](/wallets/gas-and-asset-management/gas/ethereum).
</Info>

<img src="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=af4dd0c0e048cb8fe71daf516ee1e85e" alt="Sample enable smart wallets" data-og-width="3686" width="3686" data-og-height="2633" height="2633" data-path="images/wallets/smart-wallets.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=280&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=d6f39a99d7265206c1f03df225c7632a 280w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=560&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=e393540f7fb8aa33022537e1e1de5c84 560w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=840&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=d08157333f7faffcf534818a60ec73d4 840w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=1100&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=1992e7c79d49c685b7405f25f053b1c8 1100w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=1650&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=46315712f250c0870ae829bdd26e6caf 1650w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/smart-wallets.png?w=2500&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=efbe6022bc7646202af09cb1379fd4d1 2500w" />

To set up with smart wallets, start by [enabling smart wallets in the Privy Dashboard](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard). This will configure your app to create smart wallets for your users controlled by Privy embedded signers.

### Native ERC-4337 support with embedded signers

Under the hood, a smart wallet is an [ERC-4337](https://www.erc4337.io/)-compatible smart contract deployed onchain. This smart contract can be programmed to support features like transaction batching, gas sponsorship, delegating permissions, and more.

When using a smart wallet, a user's assets are held by the smart contract itself. This smart contract is controlled by an **embedded signer** (an externally-owned account) secured by Privy's self-custodial wallet infrastructure. Privy automatically takes care of creating signers for users and generating smart contract wallets controlled by these signers.

Your app can customize which ERC-4337 account *implementation* powers your users' smart wallets, between Kernel (ZeroDev), Safe, LightAccount (Alchemy), Biconomy, Thirdweb, and the Coinbase Smart Wallet.

<Info>
  Privy partners with the ERC-4337 account providers above to ensure a smooth experience. If you'd
  like us to add support for another, please [reach out](https://privy.io/slack)!
</Info>

### Gas sponsorship with paymasters

With smart wallets, your app can pay for gas fees simply by registering a paymaster URL in the Privy Dashboard. Privy will automatically route gas payments from your registered paymaster instead of your users' wallets, allowing your users to transact on-chain *instantly* –– even if they don't have a balance in their smart wallet.

### Future-proofed for the latest standards

Privy works closely with the teams building the next generation of account abstraction standards on top of ERC-4337, such as permissions & session keys ([ERC-7715](https://ethereum-magicians.org/t/erc-7715-grant-permissions-from-wallets/20100)), smart wallet modules ([ERC-7579](https://erc7579.com/)), and smart account discovery ([ERC-7555](https://ethereum-magicians.org/t/erc-7555-single-sign-on-for-account-discovery/16536)) across different applications. As these standards become ratified, Privy will incorporate native support for these features.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.privy.io/llms.txt

---

# Configure smart wallets in the dashboard

<Tip>
  Enable smart wallets in the [Privy Dashboard](https://dashboard.privy.io/apps?page=smart-wallets)
  before implementing this feature.
</Tip>

## 1. Enable smart wallets

First, enable the smart wallets toggle and select a smart wallet type. Privy currently supports [Kernel](https://zerodev.app/), [Biconomy](https://www.biconomy.io/smart-accounts), [Light Account](https://www.alchemy.com/account-contracts), [Safe](https://safe.global/), [Thirdweb](https://thirdweb.com/contracts) and the [Coinbase Smart Wallet](https://github.com/coinbase/smart-wallet) as smart wallet types.

<img src="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=53ae6c45633e66dafc817bea19ea6ad4" alt="Sample enable smart wallets" data-og-width="3686" width="3686" data-og-height="2633" height="2633" data-path="images/wallets/configure-smart-wallets.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=280&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=5547a01691757237475ef0a1702769ef 280w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=560&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=6fe0676570a1e359b460d260c1958817 560w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=840&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=72ac1821c5b6ce3bade5b75ea24d7605 840w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=1100&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=2d005df361c5dc800ee8a26c2eeab83f 1100w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=1650&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=719ad71983b6ee708d06c6f02f5d7fd5 1650w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets.png?w=2500&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=a14bdcd98c06b1bcc994c417245232db 2500w" />

<Info>
  If you modify your smart wallet type after users have already created smart wallets, Privy will
  provision the original smart wallet type for existing users to ensure they can access the accounts
  they already use.
</Info>

## 2. Configure the supported networks

Next, configure the networks for your smart wallets. You should do this for *any* network that your app plans to use smart wallets on.

<img src="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=af3c0c9712235a26d2afa9fa3ee7c2d1" alt="Sample enable smart wallets" data-og-width="3686" width="3686" data-og-height="2633" height="2633" data-path="images/wallets/configure-smart-wallets-configure-chain.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=280&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=93b69f44673eec477978f0da39fcd9f3 280w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=560&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=90d793779ceb9951f4add2987bd1c041 560w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=840&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=c3fe83a10f6c5fd6c06c2972818e9ad3 840w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=1100&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=99a8cd9476e50f685efc5f0ea5d2517d 1100w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=1650&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=2615cbfb3699d5bae4d1c1c490c98452 1650w, https://mintcdn.com/privy-c2af3412/zeEEdrxSbmZQCA-7/images/wallets/configure-smart-wallets-configure-chain.png?w=2500&fit=max&auto=format&n=zeEEdrxSbmZQCA-7&q=85&s=d45ff0dc5ee5369de4faabc80add1622 2500w" />

For each configured network, you can optionally provide a bundler URL and/or a paymaster URL.

#### Bundler

The **bundler URL** specifies the node you want to use bundle operations from multiple users into a single transaction. If a bundler URL is not set for a network, Privy defaults to Pimlico's public bundler (`https://public.pimlico.io/v2/{chainId}/rpc`).

<Tip>
  **We strongly recommend setting your own bundler URL when taking smart wallets to production**, to
  give you more control over bundler rate limits. Privy's default bundler is heavily rate limited
  and is not suitable for production usage.
</Tip>

#### Paymaster

The **paymaster URL** specifies the paymaster used to sponsor gas fees for the smart wallets on the network. If a paymaster URL is set, Privy will use that paymaster to sponsor gas fees for your users' transactions. If a paymaster URL is not set, your users' smart wallets must have a balance of the network's native currency to pay for gas fees for transactions.

For additional security, we strongly recommend setting **Allowed domains** for your paymaster and/or bundler through your provider's dashboard, to restrict usage of these URLs to only your website.

#### Recommended providers

If you are looking to set up a paymaster or bundler for your app, we suggest the following providers:

| Provider | Get started                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pimlico  | [https://dashboard.pimlico.io](https://dashboard.pimlico.io)                                                                     |
| ZeroDev  | [https://dashboard.zerodev.app/](https://dashboard.zerodev.app/)                                                                 |
| Alchemy  | [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/)                                                                 |
| Biconomy | [https://dashboard.biconomy.io/](https://dashboard.biconomy.io/)                                                                 |
| Thirdweb | [https://thirdweb.com](https://thirdweb.com)                                                                                     |
| Coinbase | [https://www.coinbase.com/developer-platform/products/paymaster](https://www.coinbase.com/developer-platform/products/paymaster) |

<Tip>
  If using **Alchemy** for your paymaster, please provide your Alchemy gas policy ID. Each gas
  policy ID is tied to a specific chain and Alchemy project.
</Tip>

<Tip>
  If using **Biconomy** as a paymaster with `@privy-io/react-auth`, you can override our default
  paymaster context in the `SmartAccountsProvider`. View more in [our setup
  notes](/wallets/using-wallets/evm-smart-wallets/usage).
</Tip>

#### Custom chains

If you do not see the chain you wish to configure on the drop down, you can configure a custom chain. Before configuring a custom chain on the Privy dashboard, please ensure the chain is supported by your smart wallet provider. Custom chain configuration requires an EIP155 chain ID, chain name, paymaster URL, bundler URL, and RPC URL; none of these values can be defaulted as they are in supported chains.

---

# Configure smart wallets in the SDK

Once you have [configured](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard) smart wallets in the Privy Dashboard, you can use them in your application with just a few lines of code.

<Tabs>
  <Tab title="React">
    <Info>
      Looking to get started quickly? Check out our [Smart Wallets starter
      repo](https://github.com/privy-io/examples/tree/main/examples/privy-next-smart-wallets). You can
      see a deployed version of the starter app [here](https://smart-wallets-starter.privy.io/).
    </Info>

    ## Setup

    First install the necessary peer dependencies:

    ```bash  theme={"system"}
    npm install permissionless viem
    ```

    To set up your app with smart wallets, first import the `SmartWalletsProvider` component from `@privy-io/react-auth/smart-wallets` and wrap your app with it.

    The `SmartWalletsProvider` must wrap any component or page that will use smart wallets. We recommend rendering it as close to the root of your application as possible, nested *within* your `PrivyProvider`.

    ```tsx  theme={"system"}
    import {PrivyProvider} from '@privy-io/react-auth';
    import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

    export default function Providers({children}: {children: React.ReactNode}) {
      return (
        <PrivyProvider appId="your-privy-app-id">
          <SmartWalletsProvider>{children}</SmartWalletsProvider>
        </PrivyProvider>
      );
    }
    ```

    <Tip>
      Make sure that the networks you've configured for smart wallets in the Dashboard are also
      configured for your app's [`defaultChain` and
      `supportedChains`](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard).
    </Tip>

    ## Creating smart wallets

    Once the `SmartWalletsProvider` component is rendered and a smart wallet configuration has been set up for your app in the [Dashboard](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard), Privy will automatically generate smart wallets for your users once they have an embedded wallet. The embedded wallet is used as the primary **signer** controlling the smart wallet.

    You can configure your app to [create embedded wallets](/wallets/wallets/create/create-a-wallet) automatically on login or manually; smart wallets will be created following the same configuration.

    ## Overriding paymaster context

    Certain paymasters, like Alchemy and Biconomy, use an additional `paymasterContext` for gas sponsorship. Privy constructs this paymaster context based on either dashboard provided gas policy ID for Alchemy or a default set of values for Biconomy. However, you can override these defaults by passing a `paymasterContext` prop to the `SmartWalletsProvider`. See an example of how to set this below:

    ```tsx  theme={"system"}
    <SmartWalletsProvider
      config={{
        paymasterContext: {
          mode: 'SPONSORED',
          calculateGasLimits: true,
          expiryDuration: 300,
          sponsorshipInfo: {
            webhookData: {},
            smartAccountInfo: {
              name: 'BICONOMY',
              version: '2.0.0'
            }
          }
        }
      }}
    >
      {children}
    </SmartWalletsProvider>
    ```
  </Tab>

  <Tab title="React Native">
    ## Setup

    ### 0. Set up your build configuration (for old React native and Expo Versions)

    <Warning>
      If you are running an Expo version before SDK 53 (or a React Native version before 0.79.0) then **please make sure to follow this step.**

      Otherwise, skip to step #1 ("Install peer dependencies").
    </Warning>

    Ensure you've followed the steps in [custom build configuration](/basics/react-native/installation#metro-build-configuration).

    Additionally, add `permissionless` to the list of modules that require package exports in your `metro.config.js` file.

    ```js  theme={"system"}
    //...other config logic

    // Enable package exports for select libraries
    ...
    const resolveRequestWithPackageExports = (context, moduleName, platform) => {
      if (moduleName.startsWith('@privy-io/') || moduleName.startsWith('permissionless')) {
        const ctx = {
          ...context,
          unstable_enablePackageExports: true,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
      }

      if (
        moduleName.endsWith(".js") &&
        context.originModulePath.includes("node_modules/ox/")
      ) {
        const newModuleName = moduleName.replace(/\.js$/, "");
        return context.resolveRequest(context, newModuleName, platform);
      }

      return context.resolveRequest(context, moduleName, platform);
    };
    ```

    ### 1. Install peer dependencies

    ```sh  theme={"system"}
    npx expo install viem permissionless
    ```

    ### 2. Import and wrap your app with the `SmartWalletsProvider`

    The `SmartWalletsProvider` must wrap any component or page that will use smart wallets. We recommend rendering it as close to the root of your application as possible, nested *within* your `PrivyProvider`.

    ```tsx  theme={"system"}
    import {PrivyProvider} from '@privy-io/expo';
    import {SmartWalletsProvider} from '@privy-io/expo/smart-wallets';

    export default function Providers({children}: {children: React.ReactNode}) {
      return (
        <PrivyProvider
          appId={Constants.expoConfig?.extra?.privyAppId}
          clientId={Constants.expoConfig?.extra?.privyAppClientId}
        >
          <SmartWalletsProvider>{children}</SmartWalletsProvider>
        </PrivyProvider>
      );
    }
    ```

    ## Creating smart wallets

    Once the `SmartWalletsProvider` component is rendered and a smart wallet configuration has been set up for your app in the [Dashboard](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard), Privy will automatically generate smart wallets for your users once they have an embedded wallet. The embedded wallet is used as the primary **signer** controlling the smart wallet.

    You can configure your app to [create embedded wallets](/wallets/wallets/create/create-a-wallet) manually; smart wallets will be created following the same configuration.
  </Tab>
</Tabs>


---

# Using smart wallets

<Tabs>
  <Tab title="React">
    <Tip>
      Follow the [smart wallets setup guide](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard) to configure smart wallets for your application.
    </Tip>

    ## Get the smart wallet address

    Once a smart wallet has been created for a user, you can get the address for the smart wallet by finding the account of `type: 'smart_wallet'` from the user's `linkedAccounts` array.

    ```jsx  theme={"system"}
    const {user} = usePrivy();
    const smartWallet = user.linkedAccounts.find((account) => account.type === 'smart_wallet');
    console.log(smartWallet.address);
    // Logs the smart wallet's address
    console.log(smartWallet.type);
    // Logs the smart wallet type (e.g. 'safe', 'kernel', 'light_account', 'biconomy', 'thirdweb', 'coinbase_smart_wallet')
    ```

    ## Sign a message

    Use the `signMessage` function from the `client` returned by `useSmartWallets` hook in your React component to sign a message using the user's smart wallet.

    ```jsx  theme={"system"}
    signMessage: (input: {message: SignableMessage}, opts?: {uiOptions?: SignMessageModalUIOptions}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/react-auth/smart-wallets';
    const {client} = useSmartWallets();
    const uiOptions = {
        title: 'Sample title text',
        description: 'Sample description text',
        buttonText: 'Sample button text'
    };
    client.signMessage({message: 'Hello, world!'}, {uiOptions}).then((signature) => {
        console.log(signature);
    });
    ```

    ### Parameters

    The `signMessage` method accepts the following parameters:

    <ParamField path="input.message" type="string | {raw: Hex | ByteArray}" required>
      The message to sign by the smart account.
    </ParamField>

    <ParamField path="opts.uiOptions" type="SignMessageModalUIOptions">
      Optional UI customization options for the signature prompt.
    </ParamField>

    ### Returns

    <ResponseField name="signature" type="Hex">
      The signed message by the smart wallet.
    </ResponseField>

    ## Sign typed data

    Use the `signTypedData` function from the `client` returned by `useSmartWallets` hook in your React component to sign structured data using the user's smart wallet.

    ```jsx  theme={"system"}
    signTypedData: (input: SignTypedDataParameters, opts?: {uiOptions?: SignMessageModalUIOptions}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/react-auth/smart-wallets';
    const {client} = useSmartWallets();
    const uiOptions = {
        title: 'Sample title text',
        description: 'Sample description text',
        buttonText: 'Sample button text'
    };
    client.signTypedData(typedDataRequestParams, {uiOptions}).then((signature) => {
        console.log(signature);
    });
    ```

    ### Parameters

    The `signTypedData` method accepts the following parameters:

    <ParamField path="input" type="SignTypedDataParameters" required>
      The typed data to sign by the smart account.
    </ParamField>

    <ParamField path="opts.uiOptions" type="SignMessageModalUIOptions">
      Optional UI customization options for the signature prompt.
    </ParamField>

    ### Returns

    <ResponseField name="signature" type="Hex">
      The signed message by the smart wallet.
    </ResponseField>

    ## Send a transaction

    Use the `sendTransaction` function from the `client` returned by `useSmartWallets` hook in your React component to send a transaction using the user's smart wallet.

    ```jsx  theme={"system"}
    sendTransaction: (input: SendTransactionParameters, opts?: {uiOptions?: SendTransactionModalUIOptions}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/react-auth/smart-wallets';
    const {client} = useSmartWallets();
    const uiOptions = {
        title: 'Sample title text',
        description: 'Sample description text',
        buttonText: 'Sample button text'
    };
    client.sendTransaction({
        chain: base,
        to: 'insert-recipient-address',
        value: 0.1
    }, {uiOptions}).then((txHash) => {
        console.log(txHash);
    });
    ```

    ### Parameters

    The `sendTransaction` method accepts the following parameters:

    <ParamField path="input" type="SendTransactionParameters" required>
      The transaction to send by the smart account.
    </ParamField>

    <ParamField path="opts.uiOptions" type="SendTransactionModalUIOptions">
      Optional UI customization options for the transaction prompt.
    </ParamField>

    ### Returns

    <ResponseField name="txHash" type="Hex">
      The transaction hash of the sent transaction.
    </ResponseField>

    ## Batch transactions

    Smart wallets support sending a batch of transactions in a single, atomic submission to the network.

    ```jsx  theme={"system"}
    sendTransaction: (input: {calls: Array<{to: string, value?: bigint, data?: string}>}, opts?: {uiOptions?: SendTransactionModalUIOptions}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/react-auth/smart-wallets';
    const {client} = useSmartWallets();
    client.sendTransaction({
        calls: [
            // Approve transaction
            {
                to: USDC_ADDRESS,
                data: encodeFunctionData({
                    abi: USDC_ABI,
                    functionName: 'approve',
                    args: ['insert-spender-address', BigInt(1e6)]
                })
            },
            // Transfer transaction
            {
                to: USDC_ADDRESS,
                data: encodeFunctionData({
                    abi: USDC_ABI,
                    functionName: 'transfer',
                    args: ['insert-recipient-address', BigInt(1e6)]
                })
            }
        ]
    }).then((txHash) => {
        console.log(txHash);
    });
    ```

    ### Parameters

    The `sendTransaction` method for batching accepts the following parameters:

    <ParamField path="input.calls" type="Array<{to: string, value?: bigint, data?: string}>" required>
      Array of transactions to batch together.
    </ParamField>

    <ParamField path="opts.uiOptions" type="SendTransactionModalUIOptions">
      Optional UI customization options for the transaction prompt.
    </ParamField>

    ### Returns

    <ResponseField name="txHash" type="Hex">
      The transaction hash of the batched transaction.
    </ResponseField>

    ## Switch chains

    Use the `getClientForChain` method to create a new smart wallet client for a specific chain.

    ```jsx  theme={"system"}
    getClientForChain: ({id: number}) => Promise<SmartWalletClient>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {base} from 'viem/chains';
    const {getClientForChain} = useSmartWallets();
    const baseClient = await getClientForChain({
        id: base.id,
    });
    // Client will send transaction on Base
    baseClient.sendTransaction({
        ...
    });
    ```

    ### Parameters

    The `getClientForChain` method accepts the following parameters:

    <ParamField path="id" type="number" required>
      The chain ID to create a client for.
    </ParamField>

    ### Returns

    <ResponseField name="client" type="SmartWalletClient">
      A new smart wallet client configured for the specified chain.
    </ResponseField>

    <Tip>
      If configured `defaultChain` does not have a smart wallet network configuration, the smart wallet client will default to using the first configured chain that has a smart wallet network configuration.
    </Tip>
  </Tab>

  <Tab title="React Native">
    <Tip>
      Follow the [React Native setup guide](/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard) to configure smart wallets for your React Native application.
    </Tip>

    ## Get the smart wallet address

    Once a smart wallet has been created for a user, you can get the address for the smart wallet by finding the account of `type: 'smart_wallet'` from the user's `linked_accounts` array.

    ```jsx  theme={"system"}
    const {user} = usePrivy();
    const smartWallet = user.linked_accounts.find((account) => account.type === 'smart_wallet');
    console.log(smartWallet.address);
    // Logs the smart wallet's address
    console.log(smartWallet.type);
    // Logs the smart wallet type (e.g. 'safe', 'kernel', 'light_account', 'biconomy', 'thirdweb', 'coinbase_smart_wallet')
    ```

    ## Sign a message

    Use the `signMessage` function from the `client` returned by `useSmartWallets` hook in your React Native component to sign a message using the user's smart wallet.

    ```jsx  theme={"system"}
    signMessage: ({message: SignableMessage}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/expo/smart-wallets';
    const {client} = useSmartWallets();
    client.signMessage({message: 'Hello, world!'}).then((signature) => {
        console.log(signature);
    });
    ```

    ### Parameters

    The `signMessage` method accepts the following parameters:

    <ParamField path="input.message" type="string | {raw: Hex | ByteArray}" required>
      The message to sign by the smart account.
    </ParamField>

    ### Returns

    <ResponseField name="signature" type="Hex">
      The signed message by the smart wallet.
    </ResponseField>

    ## Sign typed data

    Use the `signTypedData` function from the `client` returned by `useSmartWallets` hook in your React Native component to sign structured data using the user's smart wallet.

    ```jsx  theme={"system"}
    signTypedData: (input: SignTypedDataParameters) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/expo/smart-wallets';
    const {client} = useSmartWallets();
    client.signTypedData(...).then((signature) => {
        console.log(signature);
    });
    ```

    ### Parameters

    The `signTypedData` method accepts the following parameters:

    <ParamField path="input" type="SignTypedDataParameters" required>
      The typed data to sign by the smart account.
    </ParamField>

    ### Returns

    <ResponseField name="signature" type="Hex">
      The signed message by the smart wallet.
    </ResponseField>

    ## Send a transaction

    Use the `sendTransaction` function from the `client` returned by `useSmartWallets` hook in your React Native component to send a transaction using the user's smart wallet.

    ```jsx  theme={"system"}
    sendTransaction: (input: SendTransactionParameters) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/expo/smart-wallets';
    const {client} = useSmartWallets();
    client.sendTransaction({
        account: client.account,
        chain: base,
        to: 'insert-recipient-address',
        value: 0.1
    }).then((txHash) => {
        console.log(txHash);
    });
    ```

    ### Parameters

    The `sendTransaction` method accepts the following parameters:

    <ParamField path="input" type="SendTransactionParameters" required>
      The transaction to send by the smart account.
    </ParamField>

    ### Returns

    <ResponseField name="txHash" type="Hex">
      The transaction hash of the sent transaction.
    </ResponseField>

    ## Batch transactions

    Smart wallets support sending a batch of transactions in a single, atomic submission to the network.

    ```jsx  theme={"system"}
    sendTransaction: (input: {calls: Array<{to: string, value?: bigint, data?: string}>}) => Promise<Hex>
    ```

    ### Usage

    ```jsx  theme={"system"}
    import {useSmartWallets} from '@privy-io/expo/smart-wallets';
    const {client} = useSmartWallets();
    client.sendTransaction({
        account: client.account,
        calls: [
            // Approve transaction
            {
                to: USDC_ADDRESS,
                data: encodeFunctionData({
                    abi: USDC_ABI,
                    functionName: 'approve',
                    args: ['insert-spender-address', BigInt(1e6)]
                })
            },
            // Transfer transaction
            {
                to: USDC_ADDRESS,
                data: encodeFunctionData({
                    abi: USDC_ABI,
                    functionName: 'transfer',
                    args: ['insert-recipient-address', BigInt(1e6)]
                })
            }
        ]
    }).then((txHash) => {
        console.log(txHash);
    });
    ```

    ### Parameters

    The `sendTransaction` method for batching accepts the following parameters:

    <ParamField path="input.calls" type="Array<{to: string, value?: bigint, data?: string}>" required>
      Array of transactions to batch together.
    </ParamField>

    ### Returns

    <ResponseField name="txHash" type="Hex">
      The transaction hash of the batched transaction.
    </ResponseField>

    <Tip>
      The smart wallet client will default to using the first configured chain that has a smart wallet network configuration.
    </Tip>
  </Tab>
</Tabs>

---

# Integrating with wagmi

[Wagmi](https://wagmi.sh/) is a set of React hooks for interfacing with Ethereum wallets, allowing you read wallet state, request signatures or transactions, and take read and write actions on the blockchain.

**Privy is fully compatible with [wagmi](https://wagmi.sh/), and you can use [wagmi](https://wagmi.sh/)'s React hooks to interface with external and embedded wallets from Privy.** Just follow the steps below!

## Integration steps

This guide assumes you have already integrated Privy into your app. If not, please begin with the Privy [Quickstart](/basics/react/quickstart).

### 1. Install dependencies

Install the latest versions of [**`wagmi`**](https://www.npmjs.com/package/wagmi), [**`@tanstack/react-query`**](https://www.npmjs.com/package/@tanstack/react-query), [**`@privy-io/react-auth`**](https://www.npmjs.com/package/@privy-io/react-auth), and [**`@privy-io/wagmi`**](https://www.npmjs.com/package/@privy-io/wagmi):

```sh  theme={"system"}
npm i wagmi @privy-io/react-auth @privy-io/wagmi @tanstack/react-query
```

### 2. Setup TanStack Query

To start, set up your app with the [TanStack Query's React Provider](https://tanstack.com/query/v5/docs/framework/react/overview). Wagmi uses TanStack Query under the hood to power its data fetching and caching of wallet and blockchain data.

To set up your app with TanStack Query, in the component where you render your **`PrivyProvider`**, import the [**`QueryClient`**](https://tanstack.com/query/v4/docs/reference/QueryClient) class and the [**`QueryClientProvider`**](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) component from [**`@tanstack/react-query`**](https://www.npmjs.com/package/@tanstack/react-query):

```tsx  theme={"system"}
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
```

Next, create a new instance of the [**`QueryClient`**](https://tanstack.com/query/v4/docs/reference/QueryClient):

```tsx  theme={"system"}
const queryClient = new QueryClient();
```

Then, like the **`PrivyProvider`**, wrap your app's components with the [**`QueryClientProvider`**](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider). This must be rendered *inside* the **`PrivyProvider`** component.

```tsx providers.tsx theme={"system"}
<PrivyProvider appId="your-privy-app-id" config={insertYourPrivyConfig}>
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
</PrivyProvider>
```

For the [**`client`**](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) property of the [**`QueryClientProvider`**](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider), pass the [**`queryClient`**](https://tanstack.com/query/v4/docs/reference/QueryClient) instance you created.

### 3. Setup wagmi

Next, setup wagmi. This involves creating your wagmi **`config`** and wrapping your app with the **`WagmiProvider`**.

<Warning>
  While completing the wagmi setup, make sure to import `createConfig` and `WagmiProvider` from
  `@privy-io/wagmi`. Do not import these from `wagmi` directly.
</Warning>

#### Build your wagmi config

To build your [**`wagmi`**](https://wagmi.sh) config, import the `createConfig` method from [**`@privy-io/wagmi`**](https://www.npmjs.com/package/@privy-io/wagmi):

```tsx wagmiConfig.ts theme={"system"}
import {createConfig} from '@privy-io/wagmi';
```

This is a drop-in replacement for [wagmi's native **`createConfig`**](https://wagmi.sh/react/getting-started#create-config), but ensures that the appropriate configuration options are set for the Privy integration. Specifically, it allows Privy to drive wagmi's connectors state, enabling the two libraries to stay in sync.

Next, import your app's required chains from [**`viem/chains`**](https://viem.sh/docs/chains/introduction.html) and the [**`http`**](https://wagmi.sh/core/api/transports/http#http) transport from [**`wagmi`**](https://www.npmjs.com/package/wagmi). Your app's required chains should match whatever you configure as [**`supportedChains`**](/basics/react/advanced/configuring-evm-networks#supported-chains) for Privy.

```tsx  theme={"system"}
import {mainnet, sepolia} from 'viem/chains';
import {http} from 'wagmi';

// Replace this with your app's required chains
```

Lastly, call `createConfig` with your imported chains and the [**`http`**](https://wagmi.sh/core/api/transports/http#http) transport like so:

```tsx wagmiConfig.ts theme={"system"}
// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import {createConfig} from '@privy-io/wagmi';
...
export const config = createConfig({
  chains: [mainnet, sepolia], // Pass your required chains as an array
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});
```

#### Wrap your app with the `WagmiProvider`

Once you've built your wagmi `config`, in the same component where you render your **`PrivyProvider`**, import the `WagmiProvider` component from [**`@privy-io/wagmi`**](https://www.npmjs.com/package/@privy-io/wagmi).

```tsx  theme={"system"}
import {WagmiProvider} from '@privy-io/wagmi';
```

This is a drop-in replacement for [wagmi's native **`WagmiProvider`**](https://wagmi.sh/react/api/WagmiProvider#wagmiprovider), but ensures the necessary configuration properties for Privy are set. Specifically, it ensures that the [**`reconnectOnMount`**](https://wagmi.sh/react/api/WagmiProvider#reconnectonmount) prop is set to false, which is required for handling the embedded wallet. Wallets will still be automatically reconnected on mount.

Then, like the **`PrivyProvider`**, wrap your app's components with the `WagmiProvider`. This must be rendered *inside* both the **`PrivyProvider`** and [**`QueryClientProvider`**](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) components.

```tsx providers.tsx theme={"system"}
import {PrivyProvider} from '@privy-io/react-auth';
// Make sure to import `WagmiProvider` from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider} from '@privy-io/wagmi';
import {QueryClientProvider} from '@tanstack/react-query';
...
<PrivyProvider appId='insert-your-privy-app-id' config={insertYourPrivyConfig}>
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  </QueryClientProvider>
</PrivyProvider>
```

For the `config` property of the `WagmiProvider`, pass the `config` you created earlier.

#### Complete example

Altogether, this should look like:

<Tabs>
  <Tab title="providers.tsx">
    ```tsx  theme={"system"}
    import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

    import {PrivyProvider} from '@privy-io/react-auth';
    // Make sure to import these from `@privy-io/wagmi`, not `wagmi`
    import {WagmiProvider, createConfig} from '@privy-io/wagmi';

    import {privyConfig} from './privyConfig';
    import {wagmiConfig} from './wagmiConfig';

    const queryClient = new QueryClient();

    export default function Providers({children}: {children: React.ReactNode}) {
      return (
        <PrivyProvider appId="insert-your-privy-app-id" config={privyConfig}>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      );
    }
    ```
  </Tab>

  <Tab title="wagmiConfig.ts">
    ```tsx  theme={"system"}
    import {mainnet, sepolia} from 'viem/chains';
    import {http} from 'wagmi';

    import {createConfig} from '@privy-io/wagmi';

    // Replace these with your app's chains

    export const config = createConfig({
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
    });
    ```
  </Tab>

  <Tab title="privyConfig.ts">
    ```tsx  theme={"system"}
    import type {PrivyClientConfig} from '@privy-io/react-auth';

    // Replace this with your Privy config
    export const privyConfig: PrivyClientConfig = {
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: true,
        showWalletUIs: true
      },
      loginMethods: ['wallet', 'email', 'sms'],
      appearance: {
        showWalletLoginFirst: true
      }
    };
    ```
  </Tab>
</Tabs>

**That's it! You've successfully integrated Privy alongside [`wagmi`](https://wagmi.sh) in your app! 🎉**

### 4. Use `wagmi` throughout your app

Once you've completed the setup above, you can use [**`wagmi`**](https://wagmi.sh)'s React hooks throughout your app to interface with wallets and take read and write actions on the blockchain.

#### Using `wagmi` hooks

To use [**`wagmi`**](https://wagmi.sh) hooks, like [**`useAccount`**](https://wagmi.sh/react/api/hooks/useAccount#useaccount), in your components, import the hook directly from [**`wagmi`**](https://wagmi.sh) and call it as usual:

```tsx  theme={"system"}
import {useAccount} from 'wagmi';

export default const WalletAddress = () => {
  const {address} = useAccount();
  return <p>Wallet address: {address}</p>;
}
```

<Info>
  Injected wallets, like the MetaMask browser extension, cannot be programmatically disconnected from your site; they can only be manually disconnected. In kind, Privy does not currently support programmatically disconnecting a wallet via wagmi's [`useDisconnect`](https://wagmi.sh/react/api/hooks/useDisconnect) hook. This hook "shims" a disconnection, which can create discrepancies between what wallets are connected to an app vs. wagmi.

  Instead of disconnecting a given wallet, you can always prompt a user to connect a different wallet via the [`connectWallet`](/wallets/connectors/usage/connecting-external-wallets) method.
</Info>

#### When to use Privy vs. `wagmi`

Both Privy's out-of-the-box interfaces and wagmi's React hooks enable you to interface with wallets and to request signatures and transactions.

If your app integrates Privy alongside wagmi, you should:

* use Privy to connect external wallets and create embedded wallets
* use [**`wagmi`**](https://wagmi.sh) to take read or write actions from a connected wallet

#### Updating the active wallet

With Privy, users may have multiple wallets connected to your app, but [**`wagmi`**](https://wagmi.sh)'s React hooks return information for only *one* connected wallet at a time. This is referred to as the **active wallet**.

To update [**`wagmi`**](https://wagmi.sh) to return information for a *different* connected wallet, first import the **`useWallets`** hook from [**`@privy-io/react-auth`**](https://www.npmjs.com/package/@privy-io/react-auth) and the `useSetActiveWallet` hook from [**`@privy-io/wagmi`**](https://www.npmjs.com/package/@privy-io/wagmi):

```tsx  theme={"system"}
import {useWallets} from '@privy-io/react-auth';
import {useSetActiveWallet} from '@privy-io/wagmi';
```

Then, find your desired active wallet from the **`wallets`** array returned by **`useWallets`**

```tsx  theme={"system"}
const {wallets} = useWallets();
// Replace this logic to find your desired wallet
const newActiveWallet = wallets.find((wallet) => wallet.address === 'insert-your-desired-address');
```

Lastly, pass your desired active wallet to the `setActiveWallet` method returned by the `useSetActiveWallet` hook:

```tsx  theme={"system"}
await setActiveWallet(newActiveWallet);
```

## Demo app

Check out our [wagmi demo app](https://wagmi-app.vercel.app) to see the hooks listed above in action.

Feel free to take a look at the [app's source code](https://github.com/privy-io/examples/tree/main/examples/privy-next-wagmi) to see an end-to-end implementation of Privy with wagmi.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.privy.io/llms.txt

---

# Privy Config Types

```typescript
interface PrivyProviderProps {
    /** Your Privy App ID, which can be retrieved from the Privy dashboard. */
    appId: string;
    /** Your Privy App Client ID, which can be retrieved from the Privy dashboard. */
    clientId?: string;
    /**
     * Client configuration options.
     * Values here will override their server-configuration counterparts.
     */
    config?: PrivyClientConfig;
    /**
     * @ignore
     * @class
     */
    children: React.ReactNode;
}

interface PrivyClientConfig {
    /** All UI and theme related configuration */
    appearance?: {
        /** Primary theme for the privy UI. This dictates the foreground and background colors within the UI.
         *
         *  'light' (default): The privy default light UI.
         *  'dark': The privy default dark UI.
         *  custom hex code (i.e. '#13152F'): A custom background. This will generate the remainder of the foreground and
         *  background colors for the UI by modulating the luminance of the passed color. This value should be _either_ dark
         *  or light (<20% or >80% luminance), for accessibility. */
        theme?: 'light' | 'dark' | HexColor;
        /** Accent color for the privy UI.
         *  Used for buttons, active borders, etc. This will generate light and dark variants.
         *  This overrides the server setting `accent_color`. */
        accentColor?: HexColor;
        /** Logo for the main privy modal screen.
         *  This can be a string (url) or an img / svg react element.
         *  If passing an element, Privy will overwrite the `style` props, to ensure proper rendering.
         *  This overrides the server setting `logo_url` */
        logo?: string | ReactElement;
        /**
         * Header text for the landing screen of the Privy login modal. We strongly recommend using a string
         *  of length 35 or less. Strings longer than the width of the login modal will be ellipsified.
         *
         * Defaults to 'Log in or sign up'.
         */
        landingHeader?: string;
        /**
         * Subtitle text for the landing screen of the Privy login modal.
         *
         * This text will renders below the logo and will be capped at 100 characters.
         *
         * Defaults to undefined.
         */
        loginMessage?: string;
        /** Determines the order of the login options in the privy modal. If true, the wallet login will render above
         *  social and email / sms login options.
         *  This overrides the server setting `show_wallet_login_first` */
        showWalletLoginFirst?: boolean;
        /**
         * An array of {@link WalletListEntry wallet names} to configure the wallet buttons shown within
         * the `login`, `connectWallet`, and `linkWallet` modals. Privy will show buttons for each option
         * present in the list, in the order in which they are configured.
         *
         * On 'detected_wallets':
         * - This option serves as a fallback to include all wallets that detected by Privy, that might not be
         *   individually configured in the `walletList`. Browser extension wallets that are not explicitly configured
         *   in the `walletList` will fall into this category.
         * - If Privy detects a wallet, _and_ that wallet is configured within the `walletList` (e.g. 'metamask'),
         *   the order of the wallet's explicit name (e.g. 'metamask') in the `walletList` will take priority
         *   over the order of 'detected_wallets'.
         *
         * Defaults to ['detected_wallets', 'metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect']
         *
         * @default ['detected_wallets', 'metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect']
         */
        walletList?: WalletListEntry[];
        /**
         * Determines which external wallet types to show in the modal. By default, only Ethereum external wallets
         * are shown. If you want to show Solana wallets, set this to 'solana-only' or 'ethereum-and-solana'.
         *
         * When 'ethereum-and-solana' is set, Solana wallets will have a badge indicating that they are Solana wallets.
         *
         * @defaults 'ethereum-only'
         */
        walletChainType?: 'ethereum-only' | 'solana-only' | 'ethereum-and-solana';
    };
    /**
     * Login methods for the privy modal.
     *
     * This parameter enables you to display a subset of the login methods specified in the developer dashboard. `loginMethods` cannot be an empty array if specified. The order of this array does not  dictate order of the login methods in the UI.
     *
     * Note that any login method included in this parameter must also be enabled as a login method in the developer dashboard.
     *
     * If both `loginMethodsAndOrder` and `loginMethods` are defined, `loginMethodsAndOrder` will take precedence.
     */
    loginMethods?: Array<'wallet' | 'email' | 'sms' | 'google' | 'twitter' | 'discord' | 'github' | 'linkedin' | 'spotify' | 'instagram' | 'tiktok' | 'line' | 'twitch' | 'apple' | 'farcaster' | 'telegram' | 'passkey' | `privy:${string}`>;
    /**
     * @deprecated Use `loginMethods` instead.
     *
     * Login methods for the Privy modal. _This will override carefully designed defaults and should be used with caution._
     *
     * This parameter enables you to display a subset of the login methods specified in the developer dashboard. Login methods will be rendered in the order they appear in the array. The first 4 options specified in the `primary` list will render on the default screen of the login experience. Options in the `overflow` list will appear on the following screen.
     *
     * Note that any login method included in this parameter must also be enabled as a login method in the developer dashboard.
     *
     * If both `loginMethodsAndOrder` and `loginMethods` are defined, `loginMethodsAndOrder` will take precedence.
     */
    loginMethodsAndOrder?: {
        primary: NonEmptyArray<LoginMethodOrderOption>;
        overflow?: Array<LoginMethodOrderOption>;
    };
    /** Options for internationalization of the privy modal */
    intl?: {
        /**
         * This property is used to configure formatting and validation for the phone number input
         * used when `phone` is enabled as a login method. Must be a valid
         * [two-leter ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (e.g. 'US').
         * Defaults to 'US'.
         *
         * @default 'US'
         */
        defaultCountry: CountryCode;
        /**
         * Custom localization strings for Privy UI components.
         *
         * Pass a partial object with only the strings you want to override.
         * All other strings will fall back to default English values.
         *
         * Supports simple template interpolation with {variableName} syntax.
         *
         * @experimental This feature is experimental and may change in future releases.
         *
         * @example
         * ```typescript
         * <PrivyProvider
         *   appId="your-app-id"
         *   config={{
         *     intl: {
         *       textLocalization: {
         *         'connectWallet.connectYourWallet': 'Connecter un portefeuille',
         *         'connectionStatus.successfullyConnected': 'Connexion réussie avec {walletName}',
         *       }
         *     }
         *   }}
         * >
         *   {children}
         * </PrivyProvider>
         * ```
         */
        textLocalization?: Partial<PrivyI18nStrings>;
    };
    /**
     * This property is only required for apps that use a third-party authentication provider.
     * @deprecated Use the `useSyncJwtBasedAuthState` hook instead.
     */
    customAuth?: {
        /**
         * If true, enable custom authentication integration.
         * This enables a JWT from a custom auth provider to be used to authenticate Privy embedded wallets.
         * Defaults to true.
         *
         * @default true
         * @deprecated Use the `useSyncJwtBasedAuthState` hook instead.
         */
        enabled?: boolean;
        /**
         * A callback that returns the user's custom auth provider's access token as a string.
         * Can be left blank if using cookies to store and send access tokens
         *
         * @deprecated Use the `useSyncJwtBasedAuthState` hook instead.
         *
         * @example
         * const {getAccessTokenSilently} = useAuth();
         *
         * <PrivyProvider
         *   {...props}
         *   config={{
         *     customAuth: {
         *       getCustomAccessToken: getAccessTokenSilently
         *     },
         *   }}
         * />
         */
        getCustomAccessToken: () => Promise<string | undefined>;
        /**
         * Custom auth providers loading state
         *
         * @deprecated Use the `useSyncJwtBasedAuthState` hook instead.
         *
         * @example
         * const {isLoading} = useAuth();
         *
         * <PrivyProvider
         *   {...props}
         *   config={{
         *     customAuth: {
         *       isLoading,
         *     },
         *   }}
         * />
         */
        isLoading: boolean;
    };
    /** All legal configuration */
    legal?: {
        /** URL to the terms and conditions page for your application.
         *  Rendered as a link in the privy modal footer.
         *  This overrides the server setting `terms_and_conditions_url` */
        termsAndConditionsUrl?: string | null;
        /** URL to the privacy policy page for your application.
         *  Rendered as a link in the privy modal footer.
         *  This overrides the server setting `privacy_policy_url` */
        privacyPolicyUrl?: string | null;
    };
    walletConnectCloudProjectId?: string;
    /**
     * Custom redirect URL for OAuth flows, useful for mobile applications.
     * If not provided, defaults to window.location.href.
     *
     * For Capacitor/mobile apps, use a custom URL scheme like:
     * 'com.yourapp.oauth://callback' or 'yourapp://oauth'
     *
     * Make sure to register this URL scheme in your app configuration
     * and add it to your app's allowed URL schemes in the Privy dashboard.
     */
    customOAuthRedirectUrl?: string;
    /**
     * If true, allows OAuth login in React Native WebViews and other embedded browsers.
     * By default, OAuth (particularly Google) is blocked in these environments because
     * OAuth providers typically reject authentication requests from embedded webviews.
     *
     * Only enable this if you have a specific use case and have confirmed OAuth works
     * in your WebView environment.
     *
     * @default false
     * @experimental This is an experimental config that is subject to breaking changes without a major version bump of the SDK.
     */
    allowOAuthInEmbeddedBrowsers?: boolean;
    /**
     * A list of supported chains, used to specify which chains should be used throughout the application.
     *
     * Calling `sendTransaction` or `switchChain` on an unsupported network will throw an error.
     *
     * For external wallets, if the wallet's current chain post-connection (during connect-only or siwe flows)
     * is not within the supported chains list, the user will be prompted to switch to the `defaultChain` (if set) or first supplied. If the chain
     * switching process does not fully succeed, the user will **not** be blocked from the application (and the wallet's current `chainId` can always
     * be observed and acted upon accordingly).
     *
     * For embedded wallets, the wallet will automatically default to the `defaultChain` (if set) or first supplied `supportedChain`.
     */
    supportedChains?: Chain[];
    /**
     * When supplied, the `defaultChain` will be the default chain used throughout the application.
     *
     * For external wallets, it will be used if the user's wallet it not within the `supportedChains` (or default chains) list.
     *
     * For embedded wallets, it will be used upon initialization, when the user hasn't switched to another supported chain.
     */
    defaultChain?: Chain;
    captchaEnabled?: boolean;
    /**
     * Options for connecting to external wallets like Coinbase Wallet, MetaMask, etc.
     *
     * @experimental This is an experimental config that is subject to breaking changes without a major version bump of the SDK.
     */
    externalWallets?: ExternalWalletsConfig;
    /** All embedded wallets configuration */
    embeddedWallets?: {
        ethereum?: {
            /**
             * Whether an Ethereum embedded wallet should be created for the user on login.
             *
             * For `all-users`, the user will be prompted to create a Privy wallet after successfully
             * logging in. If they cancel or are visiting after this flag was put in place, they will be
             * prompted to create a wallet on their next login.
             *
             * For `users-without-wallets`, the user will be prompted to create a Privy wallet after
             * successfully logging in, only if they do not currently have any wallet associated with their
             * user object - for example if they have linked an external wallet.
             *
             * For `off`, an embedded wallet is not created during login. You can always prompt the user to
             * create one manually with your app.
             *
             * Defaults to 'off'.
             */
            createOnLogin?: EmbeddedWalletCreateOnLoginConfig;
        };
        solana?: {
            /**
             * Whether a Solana embedded wallet should be created for the user on login.
             *
             * For `all-users`, the user will be prompted to create a Privy wallet after successfully
             * logging in. If they cancel or are visiting after this flag was put in place, they will be
             * prompted to create a wallet on their next login.
             *
             * For `users-without-wallets`, the user will be prompted to create a Privy wallet after
             * successfully logging in, only if they do not currently have any wallet associated with their
             * user object - for example if they have linked an external wallet.
             *
             * For `off`, an embedded wallet is not created during login. You can always prompt the user to
             * create one manually with your app.
             *
             * Defaults to 'off'.
             */
            createOnLogin?: EmbeddedWalletCreateOnLoginConfig;
        };
        /**
         * Set to `true` to disable automatic migration, if you are migrating
         * manually via the `useMigrateWallets` hook.
         *
         * @default false
         */
        disableAutomaticMigration?: boolean;
        /**
         * Override any settings for the embedded wallet's UI to show or hide the wallet UIs.
         *
         * If true, wallet UIs will always be shown.
         * If false, wallet UIs will always be hidden.
         *
         * If not set, the default behavior will match the server configuration.
         */
        showWalletUIs?: boolean;
        /**
         * Options to customize the display of transaction prices in the embedded wallet's transaction
         * prompt. You may configure a primary currency to emphasize, and a secondary currency to show
         * as subtext. Defaults to emphasizing the price in fiat currency, and showing the price in the native
         * token as subtext.
         *
         * You may either set:
         * - `{primary: 'fiat-currency', secondary: 'native-token'}` to emphasize fiat currency prices, showing native token
         *    prices as subtext. This is the default.
         * - `{secondary: 'native-token', secondary: null}` to show native token prices only, with no subtext.
         *
         * Privy does not currently support:
         * - emphasizing native token prices over fiat currency prices
         * - showing prices only in fiat currency, without native token prices
         *
         */
        priceDisplay?: PriceDisplayOptions;
        /**
         * If true, Privy will attempt to additional decoding calldata for 721 and 1155 approval, transfer, and mint sendTransaction calls,
         * in addition to the default ERC20 `transfer` and `approve` decoding.
         * If false, Privy will only decode `transfer` and `approve` calldata for ERC20 tokens.
         *
         * @default false
         * @experimental This is an experimental config that is subject to breaking changes without a major version bump of the SDK.
         */
        extendedCalldataDecoding?: boolean;
    };
    /**
     * All multi-factor authentication configuration
     */
    mfa?: {
        /**
         * If true, Privy will not prompt or instantiate any UI for MFA Verification. The developer
         * must handle MFA verification themselves.
         * If false, any action that requires MFA will raise a modal and require user to verify MFA
         * before proceeding.
         *
         * Defaults to false.
         */
        noPromptOnMfaRequired?: boolean;
    };
    passkeys?: {
        /**
         * - If `true`, unenrolling a passkey from MFA will also remove it as a login method.
         * - If `false`, it will keep it as a login method as long as it has not been manually unlinked.
         *
         * @default true
         */
        shouldUnlinkOnUnenrollMfa?: boolean;
        /**
         * - If `true`, unlinking a passkey as a login method will also unenroll it from MFA.
         * - If `false`, it will keep it as an mfa method as long as it has not been manually unenrolled.
         *
         * @default true
         */
        shouldUnenrollMfaOnUnlink?: boolean;
        /**
         * Allows overriding the default options returned for passkey registration
         */
        registration?: Pick<PublicKeyCredentialCreationOptionsJSON, 'hints'>;
    };
    /**
     * Settings associated with funding methods
     */
    fundingMethodConfig?: {
        moonpay: {
            /**
             * Determines whether to use the Moonpay sandbox flow.
             *
             * Defaults to false.
             */
            useSandbox?: boolean;
            /**
             * Determines the payment method for each Moonpay transaction.
             *
             * Defaults to Moonpay's default.
             */
            paymentMethod?: MoonpayPaymentMethod;
            /**
             * Determines the UI settings for each Moonpay transaction.
             *
             * Defaults to Moonpay's default.
             */
            uiConfig?: MoonpayUiConfig;
        };
    };
    /**
     * Configuration for Solana
     */
    solana?: {
        /**
         * @solana/kit RPC configuration objects for each solana chain. This applies for solana standard wallet hooks like `useStandardSignMessage`,
         * `useStandardSignTransaction`, `useStandardSignAndSendTransaction`.
         *
         * @example
         * ```typescript
         * import {createSolanaRpc, createSolanaRpcSubscriptions} from '@solana/kit';
         *
         * const rpcs = {
         *   'solana:mainnet': {
         *     rpc: createSolanaRpc('https://api.mainnet-beta.solana.com'),
         *     rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com'),
         *     blockExplorerUrl: 'https://explorer.solana.com',
         *   },
         * }
         */
        rpcs?: Partial<Record<SolanaChain, {
            rpc: Rpc<SolanaRpcApi>;
            rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
            blockExplorerUrl?: string;
        }>>;
    };
}
```

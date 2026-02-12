> ## Documentation Index
> Fetch the complete documentation index at: https://docs.base.org/llms.txt
> Use this file to discover all available pages before exploring further.

# Web (Next.js)

> Quickly add Sign in with Base and Base Pay to any Next.js app

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

This quick-start shows the **minimum** code required to add Sign in with Base (SIWB) and Base Pay to any Next.js app using the Base Account SDK.

## 1. Create a new Next.js app

If you're starting fresh, create a new Next.js app:

<CodeGroup>
  ```bash npm theme={null}
  npx create-next-app@latest base-account-quickstart
  cd base-account-quickstart
  ```

  ```bash yarn theme={null}
  yarn create next-app base-account-quickstart
  cd base-account-quickstart
  ```

  ```bash pnpm theme={null}
  pnpm create next-app base-account-quickstart
  cd base-account-quickstart
  ```

  ```bash bun theme={null}
  bunx create-next-app base-account-quickstart
  cd base-account-quickstart
  ```
</CodeGroup>

When prompted during setup, you can choose the default options or customize as needed. For this quickstart, the default settings work perfectly.

## 2. Install the SDK

<CodeGroup>
  ```bash npm theme={null}
  npm install @base-org/account @base-org/account-ui
  ```

  ```bash pnpm theme={null}
  pnpm add @base-org/account @base-org/account-ui
  ```

  ```bash yarn theme={null}
  yarn add @base-org/account @base-org/account-ui
  ```

  ```bash bun theme={null}
  bun add @base-org/account @base-org/account-ui
  ```
</CodeGroup>

<Tip>
  **Got a peer dependency error?**

  Use `--legacy-peer-deps` flag if you get a peer dependency error.
</Tip>

## 3. Create the main component

Replace the contents of `app/page.tsx` (or `app/page.js` if not using TypeScript) with this component:

```jsx title="app/page.tsx" lineNumbers theme={null}
'use client';

import React, { useState } from 'react';
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';
import { SignInWithBaseButton, BasePayButton } from '@base-org/account-ui/react';

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [theme, setTheme] = useState('light');

  // Initialize SDK
  const sdk = createBaseAccountSDK(
    {
      appName: 'Base Account Quick-start',
      appLogoUrl: 'https://base.org/logo.png',
    }
  );

  // Optional sign-in step – not required for `pay()`, but useful to get the user address
  const handleSignIn = async () => {
    try {
      await sdk.getProvider().request({ method: 'wallet_connect' });
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // One-tap USDC payment using the pay() function
  const handlePayment = async () => {
    try {
      const { id } = await pay({
        amount: '0.01', // USD – SDK quotes equivalent USDC
        to: '0xRecipientAddress', // Replace with your recipient address
        testnet: true // set to false or omit for Mainnet
      });

      setPaymentId(id);
      setPaymentStatus('Payment initiated! Click "Check Status" to see the result.');
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('Payment failed');
    }
  };

  // Check payment status using stored payment ID
  const handleCheckStatus = async () => {
    if (!paymentId) {
      setPaymentStatus('No payment ID found. Please make a payment first.');
      return;
    }

    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatus(`Payment status: ${status}`);
    } catch (error) {
      console.error('Status check failed:', error);
      setPaymentStatus('Status check failed');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const dark = theme === 'dark';
  const styles = {
    container: { minHeight: '100vh', backgroundColor: dark ? '#111' : '#fff', color: dark ? '#fff' : '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { backgroundColor: dark ? '#222' : '#f9f9f9', borderRadius: '12px', padding: '30px', maxWidth: '400px', textAlign: 'center' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: dark ? '#fff' : '#00f' },
    subtitle: { fontSize: '16px', color: dark ? '#aaa' : '#666', marginBottom: '30px' },
    themeToggle: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
    buttonGroup: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
    status: { marginTop: '20px', padding: '12px', backgroundColor: dark ? '#333' : '#f0f0f0', borderRadius: '8px', fontSize: '14px' },
    signInStatus: { marginTop: '8px', fontSize: '14px', color: dark ? '#0f0' : '#060' }
  };

  return (
    <div style={styles.container}>
      <button onClick={toggleTheme} style={styles.themeToggle}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div style={styles.card}>
        <h1 style={styles.title}>Base Account</h1>
        <p style={styles.subtitle}>Experience seamless crypto payments</p>
        
        <div style={styles.buttonGroup}>
          <SignInWithBaseButton 
            align="center"
            variant="solid"
            colorScheme={theme}
            size="medium"
            onClick={handleSignIn}
          />
          
          {isSignedIn && (
            <div style={styles.signInStatus}>
              ✅ Connected to Base Account
            </div>
          )}
          
          <BasePayButton 
            colorScheme={theme}
            onClick={handlePayment}
          />
          
          {paymentId && (
            <button 
              onClick={handleCheckStatus}
              style={{
                padding: '12px 24px',
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                border: `1px solid ${theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Check Payment Status
            </button>
          )}
        </div>

        {paymentStatus && (
          <div style={styles.status}>
            {paymentStatus}
          </div>
        )}
      </div>
    </div>
  );
}
```

<Note>
  **Note:**

  Make sure to replace `0xRecipientAddress` with your recipient address.
</Note>

<Tip>
  **Base Pay and SIWB are independent**

  You DO NOT need to use SIWB to use Base Pay. You can just call the `pay()` function without any additional setup.
</Tip>

## 4. Start your app

```bash  theme={null}
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Sign in with Base** (optional) and then **Pay**, approve the transaction, and you've sent 5 USDC on Base Sepolia—done! 🎉

**Note:** If you have an existing Next.js app, just install the SDK (`npm install @base-org/account @base-org/account-ui`) and add the component above to your project. For other React frameworks, you can adapt this component as needed.

## Next steps

* **[Authenticate Users](/base-account/guides/authenticate-users)** - strong authentication by setting up Sign in with Base with backend verification
* **[Accept Payments](/base-account/guides/accept-payments)** explore all the features of Base Pay
* **[Sign in with Base Button](/base-account/reference/ui-elements/sign-in-with-base-button)** – use the Sign in with Base Button component to quickly add authentication to your app
* **[Base Pay Button](/base-account/reference/ui-elements/base-pay-button)** – use the Base Pay Button component to quickly add payments to your app

<Warning>
  **Please Follow the Brand Guidelines**

  If you intend on using the `SignInWithBaseButton` or `BasePayButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.
</Warning>

import { createConfig, http, createConnector, CreateConnectorFn } from "wagmi";
import { base } from "wagmi/chains";
import { getAddress } from "viem";

// 1. Custom Connector Logic
const CHAIN_ID_HEX = "0x2105"; // Base Mainnet
const RPC_URL = "https://mainnet.base.org";

function beexoConnector(): CreateConnectorFn {
    return createConnector((config) => ({
        id: "beexo",
        name: "Beexo",
        type: "beexo",

        // 1. Connect Logic
        async connect(_parameters) {
            const { XOConnectProvider } = await import("xo-connect");

            // Instantiate the provider we tested earlier
            const provider = new XOConnectProvider({
                rpcs: { [CHAIN_ID_HEX]: RPC_URL },
                defaultChainId: CHAIN_ID_HEX,
            });

            // Trigger the XOConnect handshake
            const accounts = (await provider.request({
                method: "eth_requestAccounts",
            })) as string[];
            const chainId = (await provider.request({
                method: "eth_chainId",
            })) as string;

            // Return standard Wagmi data
            return {
                accounts: accounts.map((x) => getAddress(x)),
                chainId: parseInt(chainId, 16),
            } as never;
        },

        // 2. Disconnect Logic
        async disconnect() {
            // XOConnect doesn't have a strict disconnect, but Wagmi needs this method
        },

        // 3. Get Accounts
        async getAccounts() {
            const { XOConnectProvider } = await import("xo-connect");
            const provider = new XOConnectProvider({
                rpcs: { [CHAIN_ID_HEX]: RPC_URL },
                defaultChainId: CHAIN_ID_HEX,
            });
            const accounts = (await provider.request({
                method: "eth_accounts",
            })) as string[];
            return accounts.map((x) => getAddress(x));
        },

        // 4. Get Chain ID
        async getChainId() {
            return parseInt(CHAIN_ID_HEX, 16);
        },

        // 5. Provider Passthrough (Crucial!)
        // This tells Wagmi: "Use THIS provider for all contract calls"
        async getProvider() {
            const { XOConnectProvider } = await import("xo-connect");
            return new XOConnectProvider({
                rpcs: { [CHAIN_ID_HEX]: RPC_URL },
                defaultChainId: CHAIN_ID_HEX,
            });
        },

        // 6. Monitor for changes (Optional but good)
        async isAuthorized() {
            try {
                const accounts = await this.getAccounts();
                return !!accounts.length;
            } catch {
                return false;
            }
        },

        onAccountsChanged(accounts) {
            config.emitter.emit("change", {
                accounts: accounts.map((x) => getAddress(x)),
            });
        },
        onChainChanged(chain) {
            config.emitter.emit("change", { chainId: parseInt(chain, 16) });
        },
        onDisconnect() {
            config.emitter.emit("disconnect");
        },
    }));
}


// 2. Export Config
export const beexoConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http("https://mainnet.base.org"),
    },
    connectors: [beexoConnector()],
    ssr: true,
});

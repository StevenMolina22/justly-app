import { createConfig } from "wagmi";
import { activeChains, transports } from "@/config/chains";
import { injected } from "wagmi/connectors";

export const privyConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [injected()],
  ssr: true,
});

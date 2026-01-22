import { useAuthStrategy } from "@/config/strategies/AuthStrategyContext";

export const useSliceConnect = () => {
  const { connect, disconnect, isAuthenticated } = useAuthStrategy();

  return {
    connect,
    disconnect,
    isAuthenticated,
    label: isAuthenticated ? "Disconnect" : "Connect Wallet",
  };
};

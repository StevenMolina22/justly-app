import { useAccount } from "wagmi";

export const useSliceAccount = () => {
    const { address, isConnected, status } = useAccount();

    return {
        address,
        isConnected,
        status,
    };
};

import { useCallback, useRef } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { getCapabilities, sendCalls, waitForCallsStatus } from "viem/actions";

type BatchCall = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

type SendAtomicCallsResult = {
  id: string;
  status: Awaited<ReturnType<typeof waitForCallsStatus>>;
};

const UNSUPPORTED_BATCH_ERROR_CODES = new Set([-32601, -32602, 4100, 4200]);

function logBatch(...args: unknown[]) {
  console.info("[Batch]", ...args);
}

function extractErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === "number") return maybeCode;

  const causeCode = (error as { cause?: { code?: unknown } }).cause?.code;
  if (typeof causeCode === "number") return causeCode;

  return undefined;
}

export function isBatchUnsupportedError(error: unknown): boolean {
  const code = extractErrorCode(error);
  return typeof code === "number" && UNSUPPORTED_BATCH_ERROR_CODES.has(code);
}

function hasAtomicCapability(chainCapabilities: unknown): boolean {
  if (!chainCapabilities || typeof chainCapabilities !== "object") {
    return false;
  }

  const caps = chainCapabilities as {
    atomic?: { status?: string };
    atomicBatch?: { supported?: boolean };
  };

  const atomicStatus = caps.atomic?.status;
  if (atomicStatus === "supported" || atomicStatus === "ready") {
    return true;
  }

  return caps.atomicBatch?.supported === true;
}

function getChainCapabilities(
  capabilities: unknown,
  chainId: number,
): unknown | undefined {
  if (!capabilities || typeof capabilities !== "object") {
    return undefined;
  }

  const record = capabilities as Record<string, unknown>;
  return (
    record[String(chainId)] ??
    record[`0x${chainId.toString(16)}`] ??
    record[`0x${chainId.toString(16).toUpperCase()}`]
  );
}

export function useBatchCalls() {
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const capabilitiesCache = useRef<Map<string, boolean>>(new Map());
  const connectorId = connector?.id ?? "unknown";

  const supportsAtomicBatch = useCallback(async (): Promise<boolean> => {
    if (!walletClient || !address) return false;

    const cacheKey = `${address}:${chainId}:${connectorId}`;
    const cached = capabilitiesCache.current.get(cacheKey);
    if (typeof cached === "boolean") {
      return cached;
    }

    try {
      logBatch("Checking capabilities", {
        connectorId,
        chainId,
        address,
      });

      const probes: Array<() => Promise<unknown>> = [
        () => getCapabilities(walletClient, { account: address }),
        () => getCapabilities(walletClient),
        () => walletClient.request({ method: "wallet_getCapabilities", params: [address] }),
        () => walletClient.request({ method: "wallet_getCapabilities", params: [] }),
      ];

      for (const probe of probes) {
        try {
          const capabilities = await probe();
          const chainCapabilities = getChainCapabilities(capabilities, chainId);
          const supported = hasAtomicCapability(chainCapabilities);

          logBatch("Capability probe result", {
            connectorId,
            chainId,
            supported,
            chainCapabilities,
          });

          if (supported) {
            capabilitiesCache.current.set(cacheKey, true);
            return true;
          }
        } catch (probeError) {
          if (!isBatchUnsupportedError(probeError)) {
            logBatch("Capability probe error", probeError);
          }
        }
      }

      capabilitiesCache.current.set(cacheKey, false);
      return false;
    } catch (error) {
      logBatch("Capability detection failed", error);
      capabilitiesCache.current.set(cacheKey, false);
      return false;
    }
  }, [address, chainId, connectorId, walletClient]);

  const sendAtomicCalls = useCallback(
    async (calls: BatchCall[]): Promise<SendAtomicCallsResult> => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      const { id } = await sendCalls(walletClient, {
        account: address,
        calls,
        forceAtomic: true,
      });

      logBatch("Batch submitted", {
        connectorId,
        chainId,
        id,
      });

      const status = await waitForCallsStatus(walletClient, {
        id,
        timeout: 120_000,
        throwOnFailure: true,
      });

      return { id, status };
    },
    [address, chainId, connectorId, walletClient],
  );

  return {
    isReady: !!walletClient && !!address,
    supportsAtomicBatch,
    sendAtomicCalls,
  };
}

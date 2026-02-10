"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const ONBOARDING_KEY_PREFIX = "slice_onboarding_completed_v1";
export const ONBOARDING_REPLAY_EVENT = "slice:onboarding:replay";

export function getOnboardingStorageKey(address: string) {
  return `${ONBOARDING_KEY_PREFIX}:${address.toLowerCase()}`;
}

export function resetOnboarding(address?: string) {
  if (typeof window === "undefined") return;

  if (address) {
    localStorage.removeItem(getOnboardingStorageKey(address));
    return;
  }

  const keysToDelete: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(ONBOARDING_KEY_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
}

export function useOnboarding(address?: string, isConnected?: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const storageKey = useMemo(() => {
    if (!address) return null;
    return getOnboardingStorageKey(address);
  }, [address]);

  useEffect(() => {
    if (!isConnected || !storageKey) {
      const resetTimer = window.setTimeout(() => {
        setIsOpen(false);
        setStep(0);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const hasCompleted = localStorage.getItem(storageKey) === "true";
    if (!hasCompleted) {
      const openTimer = window.setTimeout(() => setIsOpen(true), 600);
      return () => window.clearTimeout(openTimer);
    }

    const closeTimer = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [isConnected, storageKey]);

  const complete = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    setIsOpen(false);
    setStep(0);
  }, [storageKey]);

  const next = useCallback((totalSteps: number) => {
    setStep((current) => {
      if (current >= totalSteps - 1) {
        return current;
      }
      return current + 1;
    });
  }, []);

  const open = useCallback(() => {
    setStep(0);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    step,
    setStep,
    next,
    open,
    complete,
    skip: complete,
  };
}

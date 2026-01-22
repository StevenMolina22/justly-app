"use client";

import { createContext, useContext } from "react";

interface AuthStrategy {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthStrategyContext = createContext<AuthStrategy | null>(null);

export const useAuthStrategy = () => {
  const context = useContext(AuthStrategyContext);
  if (!context)
    throw new Error("useAuthStrategy must be used within an AuthAdapter");
  return context;
};

export const AuthStrategyProvider = AuthStrategyContext.Provider;

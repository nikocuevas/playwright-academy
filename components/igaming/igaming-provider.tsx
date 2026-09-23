"use client";

import * as React from "react";
import type { Bet, Transaction } from "@/lib/practice/igaming-store";

export type IgamingUser = { id: string; email: string; username: string };

export type Wallet = {
  balance: number;
  bonusBalance: number;
  pendingBalance: number;
  depositLimit: number | null;
  depositedToday: number;
  selfExcluded: boolean;
};

type ActionResult = { error?: string };

type IgamingContextValue = {
  user: IgamingUser | null;
  wallet: Wallet;
  bets: Bet[];
  transactions: Transaction[];
  loading: boolean;
  refreshSession: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshBets: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  deposit: (amount: number, idempotencyKey?: string) => Promise<ActionResult>;
  withdraw: (amount: number) => Promise<ActionResult>;
  placeBet: (
    marketId: string,
    optionId: string,
    stake: number,
    idempotencyKey?: string,
  ) => Promise<ActionResult>;
  settleBet: (betId: string, outcome: "win" | "lose") => Promise<ActionResult>;
  setDepositLimit: (amount: number) => Promise<ActionResult>;
  selfExclude: () => Promise<void>;
  logout: () => Promise<void>;
};

const emptyWallet: Wallet = {
  balance: 0,
  bonusBalance: 0,
  pendingBalance: 0,
  depositLimit: null,
  depositedToday: 0,
  selfExcluded: false,
};

const IgamingContext = React.createContext<IgamingContextValue | null>(null);

export function IgamingProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<IgamingUser | null>(null);
  const [wallet, setWallet] = React.useState<Wallet>(emptyWallet);
  const [bets, setBets] = React.useState<Bet[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    try {
      const response = await fetch("/api/igaming/auth/session", { cache: "no-store" });
      const body = await response.json();
      setUser(body.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshWallet = React.useCallback(async () => {
    try {
      const response = await fetch("/api/igaming/wallet", { cache: "no-store" });
      if (!response.ok) {
        setWallet(emptyWallet);
        return;
      }
      const body = await response.json();
      setWallet(body.wallet ?? emptyWallet);
    } catch {
      setWallet(emptyWallet);
    }
  }, []);

  const refreshBets = React.useCallback(async () => {
    try {
      const response = await fetch("/api/igaming/bets", { cache: "no-store" });
      if (!response.ok) {
        setBets([]);
        return;
      }
      const body = await response.json();
      setBets(body.bets ?? []);
    } catch {
      setBets([]);
    }
  }, []);

  const refreshTransactions = React.useCallback(async () => {
    try {
      const response = await fetch("/api/igaming/transactions", { cache: "no-store" });
      if (!response.ok) {
        setTransactions([]);
        return;
      }
      const body = await response.json();
      setTransactions(body.transactions ?? []);
    } catch {
      setTransactions([]);
    }
  }, []);

  React.useEffect(() => {
    void (async () => {
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  React.useEffect(() => {
    if (user) void Promise.all([refreshWallet(), refreshBets(), refreshTransactions()]);
  }, [user, refreshWallet, refreshBets, refreshTransactions]);

  const value = React.useMemo<IgamingContextValue>(
    () => ({
      user,
      wallet,
      bets,
      transactions,
      loading,
      refreshSession,
      refreshWallet,
      refreshBets,
      refreshTransactions,
      async deposit(amount, idempotencyKey) {
        const response = await fetch("/api/igaming/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deposit", amount, idempotencyKey }),
        });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
        if (response.ok) await refreshTransactions();
        return response.ok ? {} : { error: body.error };
      },
      async withdraw(amount) {
        const response = await fetch("/api/igaming/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "withdraw", amount }),
        });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
        if (response.ok) await refreshTransactions();
        return response.ok ? {} : { error: body.error };
      },
      async placeBet(marketId, optionId, stake, idempotencyKey) {
        const response = await fetch("/api/igaming/bets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketId, optionId, stake, idempotencyKey }),
        });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
        if (response.ok) await Promise.all([refreshBets(), refreshTransactions()]);
        return response.ok ? {} : { error: body.error };
      },
      async settleBet(betId, outcome) {
        const response = await fetch(`/api/igaming/bets/${betId}/settle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outcome }),
        });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
        if (response.ok) await Promise.all([refreshBets(), refreshTransactions()]);
        return response.ok ? {} : { error: body.error };
      },
      async setDepositLimit(amount) {
        const response = await fetch("/api/igaming/limits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ depositLimit: amount }),
        });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
        return response.ok ? {} : { error: body.error };
      },
      async selfExclude() {
        const response = await fetch("/api/igaming/self-exclusion", { method: "POST" });
        const body = await response.json();
        if (body.wallet) setWallet(body.wallet);
      },
      async logout() {
        await fetch("/api/igaming/auth/logout", { method: "POST" });
        setUser(null);
        setWallet(emptyWallet);
        setBets([]);
        setTransactions([]);
      },
    }),
    [
      user,
      wallet,
      bets,
      transactions,
      loading,
      refreshSession,
      refreshWallet,
      refreshBets,
      refreshTransactions,
    ],
  );

  return <IgamingContext.Provider value={value}>{children}</IgamingContext.Provider>;
}

export function useIgaming() {
  const context = React.useContext(IgamingContext);
  if (!context) {
    throw new Error("useIgaming must be used inside an IgamingProvider");
  }
  return context;
}

/** Redirects to the login page when the session is missing. */
export function useRequireIgamingAuth() {
  const { user, loading } = useIgaming();

  React.useEffect(() => {
    if (!loading && !user) {
      window.location.replace(
        "/practice/igaming/login?next=" + encodeURIComponent(window.location.pathname),
      );
    }
  }, [loading, user]);

  return { user, loading };
}

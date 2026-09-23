"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { markets } from "@/lib/practice/igaming-data";
import { useIgaming, useRequireIgamingAuth } from "@/components/igaming/igaming-provider";

function DepositForm() {
  const { deposit } = useIgaming();
  const [amount, setAmount] = React.useState("50");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const result = await deposit(Number(amount), crypto.randomUUID());
      if (result.error) setError(result.error);
      else setMessage("Deposit successful.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      aria-label="Deposit"
      onSubmit={onSubmit}
      className="rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="text-sm font-semibold">Deposit</h2>
      <div className="mt-3">
        <label htmlFor="deposit-amount" className="mb-1.5 block text-sm font-medium">
          Deposit amount
        </label>
        <input
          id="deposit-amount"
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        />
      </div>

      {error && (
        <p
          role="alert"
          data-testid="deposit-error"
          className="mt-3 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          data-testid="deposit-confirmation"
          className="mt-3 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent"
        >
          {message}
        </p>
      )}

      <Button type="submit" size="sm" className="mt-4" disabled={submitting}>
        {submitting ? "Depositing…" : "Deposit"}
      </Button>
    </form>
  );
}

function BetSlip() {
  const { placeBet } = useIgaming();
  const [marketId, setMarketId] = React.useState(markets[0].id);
  const market = markets.find((m) => m.id === marketId) ?? markets[0];
  const [optionId, setOptionId] = React.useState(market.options[0].id);
  const option = market.options.find((o) => o.id === optionId) ?? market.options[0];
  const [stake, setStake] = React.useState("10");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const result = await placeBet(marketId, optionId, Number(stake), crypto.randomUUID());
      if (result.error) setError(result.error);
      else setMessage("Bet placed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      aria-label="Bet slip"
      onSubmit={onSubmit}
      className="rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="text-sm font-semibold">Bet slip</h2>

      <div className="mt-3">
        <label htmlFor="market" className="mb-1.5 block text-sm font-medium">
          Market
        </label>
        <select
          id="market"
          value={marketId}
          onChange={(e) => {
            const next = markets.find((m) => m.id === e.target.value) ?? markets[0];
            setMarketId(next.id);
            setOptionId(next.options[0].id);
          }}
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          {markets.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="selection" className="mb-1.5 block text-sm font-medium">
          Selection
        </label>
        <select
          id="selection"
          value={optionId}
          onChange={(e) => setOptionId(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          {market.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <p data-testid="selected-odds" className="mt-1 text-xs text-muted">
          Odds: {option.odds.toFixed(2)}
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="stake" className="mb-1.5 block text-sm font-medium">
          Stake
        </label>
        <input
          id="stake"
          type="number"
          min="0"
          step="0.5"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          data-testid="bet-confirmation"
          className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent"
        >
          {message}
        </p>
      )}

      <Button type="submit" className="mt-5 w-full" disabled={submitting}>
        {submitting ? "Placing bet…" : "Place Bet"}
      </Button>
    </form>
  );
}

export default function IgamingDashboard() {
  const { user, loading } = useRequireIgamingAuth();
  const { wallet } = useIgaming();

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">FakeBet Casino</h1>
      <p className="mt-1 text-sm text-muted">
        Fictional markets, fictional odds, fake money — nothing here is real.
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-[11px] uppercase tracking-wider text-faint">Balance</dt>
          <dd data-testid="dashboard-balance" className="mt-1 font-mono text-lg font-semibold">
            ${wallet.balance.toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-[11px] uppercase tracking-wider text-faint">Bonus balance</dt>
          <dd className="mt-1 font-mono text-lg font-semibold">
            ${wallet.bonusBalance.toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-[11px] uppercase tracking-wider text-faint">Pending balance</dt>
          <dd className="mt-1 font-mono text-lg font-semibold">
            ${wallet.pendingBalance.toFixed(2)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <DepositForm />
        <BetSlip />
      </div>
    </div>
  );
}

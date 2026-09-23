"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import type { BetType } from "@/lib/practice/roulette-engine";
import type { Round, RoundBet, RoundStatus } from "@/lib/practice/roulette-store";

const BET_TYPE_OPTIONS: { value: BetType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "red", label: "Red" },
  { value: "black", label: "Black" },
  { value: "odd", label: "Odd" },
  { value: "even", label: "Even" },
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

type StateResponse = {
  balance: number;
  currentBet: RoundBet | null;
  lastResult: { result: number; color: "red" | "black" | "green" } | null;
  status: RoundStatus;
  maxBet: number;
};

type SpinResponse = {
  roundId: string;
  result: number;
  color: "red" | "black" | "green";
  bet: RoundBet;
  won: boolean;
  payout: number;
  profit: number;
  balance: number;
};

function colorLabel(color: "red" | "black" | "green" | null): string {
  if (!color) return "—";
  return color[0].toUpperCase() + color.slice(1);
}

function betTypeLabel(bet: RoundBet | null): string {
  if (!bet) return "No active bet";
  const label = BET_TYPE_OPTIONS.find((o) => o.value === bet.type)?.label ?? bet.type;
  return bet.type === "number" ? `Number ${bet.selection} — ${bet.stake} credits` : `${label} — ${bet.stake} credits`;
}

/**
 * A malformed or empty response body (a bad proxy, a mocked-for-testing
 * failure) must not crash the click handler — it should surface as a plain
 * validation message instead, same as any other failure.
 */
async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function CasinoRoulettePage() {
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  const [maxBet, setMaxBet] = React.useState(10000);
  const [status, setStatus] = React.useState<RoundStatus>("READY");
  const [currentBet, setCurrentBet] = React.useState<RoundBet | null>(null);
  const [history, setHistory] = React.useState<Round[]>([]);

  const [lastResult, setLastResult] = React.useState<{ result: number; color: "red" | "black" | "green" } | null>(
    null,
  );
  const [lastOutcome, setLastOutcome] = React.useState<{ won: boolean; payout: number; profit: number } | null>(
    null,
  );

  const [betType, setBetType] = React.useState<BetType>("red");
  const [selection, setSelection] = React.useState("17");
  const [stake, setStake] = React.useState("100");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadState = React.useCallback(async () => {
    const response = await fetch("/api/casino/roulette/state", { cache: "no-store" });
    const body: StateResponse = await response.json();
    setBalance(body.balance);
    setMaxBet(body.maxBet);
    setStatus(body.status);
    setCurrentBet(body.currentBet);
    setLastResult(body.lastResult);
  }, []);

  const loadHistory = React.useCallback(async () => {
    const response = await fetch("/api/casino/roulette/history", { cache: "no-store" });
    const body: { history: Round[] } = await response.json();
    setHistory(body.history);
  }, []);

  React.useEffect(() => {
    void (async () => {
      await Promise.all([loadState(), loadHistory()]);
      setLoading(false);
    })();
  }, [loadState, loadHistory]);

  async function onPlaceBet(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body: { type: BetType; selection?: number; stake: number } = {
        type: betType,
        stake: Number(stake),
      };
      if (betType === "number") body.selection = Number(selection);

      const response = await fetch("/api/casino/roulette/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await parseJsonSafely<
        { round: Round; balance: number; status: RoundStatus } | { error: string }
      >(response);
      if (!response.ok || !result || "error" in result) {
        setError(result && "error" in result ? result.error : "Unexpected response from the server");
        return;
      }
      setBalance(result.balance);
      setStatus(result.status);
      setCurrentBet(result.round.bet);
      setLastOutcome(null);
    } catch {
      // A network failure (aborted request, timeout, DNS error, ...) never
      // touched local state above, so the balance already on screen is still
      // correct — no optimistic update to roll back.
      setError("Network error placing the bet — nothing was deducted");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSpin() {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/casino/roulette/spin", { method: "POST" });
      const result = await parseJsonSafely<SpinResponse | { error: string }>(response);
      if (!response.ok || !result || "error" in result) {
        setError(result && "error" in result ? result.error : "Unexpected response from the server");
        return;
      }
      setBalance(result.balance);
      setStatus("COMPLETED");
      setCurrentBet(null);
      setLastResult({ result: result.result, color: result.color });
      setLastOutcome({ won: result.won, payout: result.payout, profit: result.profit });
      await loadHistory();
    } catch {
      setError("Network error spinning — the bet is still staged, nothing was settled");
    } finally {
      setSubmitting(false);
    }
  }

  async function onReset() {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/casino/roulette/reset", { method: "POST" });
      const result = await parseJsonSafely<{ balance: number; status: RoundStatus }>(response);
      if (!response.ok || !result) {
        setError("Unexpected response from the server");
        return;
      }
      setBalance(result.balance);
      setStatus(result.status);
      setCurrentBet(null);
      setLastResult(null);
      setLastOutcome(null);
      setHistory([]);
    } catch {
      setError("Network error resetting the game");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading the table…</p>;
  }

  const canPlaceBet = status !== "BET_PLACED" && !submitting;
  const canSpin = status === "BET_PLACED" && !submitting;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">European Roulette</h1>
      <p className="mt-1 text-sm text-muted">
        Virtual credits only. Zero is green; every other pocket has a fixed red or black
        assignment. Built to be automated — see the Casino QA Lab lessons for how.
      </p>

      <dl className="mt-6 flex flex-wrap items-center gap-6">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-faint">Balance</dt>
          <dd data-testid="balance" className="mt-1 font-mono text-xl font-semibold">
            {balance.toLocaleString()} credits
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-faint">Last Result</dt>
          <dd className="mt-1 flex items-baseline gap-2 font-mono text-xl font-semibold">
            <span data-testid="winning-number">{lastResult ? lastResult.result : "—"}</span>
            <span data-testid="winning-color" className="text-sm font-medium text-muted">
              {colorLabel(lastResult?.color ?? null)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-faint">Max Bet</dt>
          <dd className="mt-1 font-mono text-sm text-muted">{maxBet.toLocaleString()} credits</dd>
        </div>
      </dl>

      <form
        aria-label="Place a bet"
        onSubmit={onPlaceBet}
        // The stake/number inputs' min/max are UX hints (spinner limits),
        // not the validation itself — that runs server-side (and is mirrored
        // client-side via the error message below) so every boundary case
        // gets the same clear message instead of being silently swallowed by
        // the browser's native constraint validation before it ever reaches
        // our handler.
        noValidate
        className="mt-6 rounded-xl border border-line bg-surface p-5"
      >
        <fieldset disabled={!canPlaceBet}>
          <legend className="text-sm font-semibold">Bet Type</legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {BET_TYPE_OPTIONS.map((option) => (
              <label key={option.value} htmlFor={`bet-type-${option.value}`} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  id={`bet-type-${option.value}`}
                  name="bet-type"
                  value={option.value}
                  checked={betType === option.value}
                  onChange={() => setBetType(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="number-selection" className="mb-1.5 block text-sm font-medium">
              Number (0-36)
            </label>
            <input
              id="number-selection"
              type="number"
              min={0}
              max={36}
              value={selection}
              disabled={!canPlaceBet || betType !== "number"}
              onChange={(e) => setSelection(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="stake" className="mb-1.5 block text-sm font-medium">
              Bet Amount
            </label>
            <input
              id="stake"
              type="number"
              min={1}
              disabled={!canPlaceBet}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm disabled:opacity-50"
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-muted">
          Current bet: <span data-testid="current-bet">{betTypeLabel(currentBet)}</span>
        </p>

        {error && (
          <p
            role="alert"
            data-testid="validation-message"
            className="mt-3 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit" disabled={!canPlaceBet}>
            Place Bet
          </Button>
          <Button type="button" variant="secondary" disabled={!canSpin} onClick={onSpin}>
            Spin
          </Button>
          <Button type="button" variant="outline" onClick={onReset} disabled={submitting}>
            Reset Game
          </Button>
        </div>
      </form>

      <div aria-live="polite" data-testid="game-result" className="mt-5">
        {lastOutcome && (
          <Callout tone={lastOutcome.won ? "success" : "info"} title="Result">
            <p className="font-mono text-sm">
              {lastOutcome.won ? `WIN +${lastOutcome.profit}` : "LOSE"}
              {" · "}
              Payout: <span data-testid="payout">{lastOutcome.payout}</span> credits
            </p>
          </Callout>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Bet History</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-line">
          <table data-testid="bet-history" className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-[11px] uppercase tracking-wider text-faint">
              <tr>
                <th className="px-3 py-2">Round</th>
                <th className="px-3 py-2">Result</th>
                <th className="px-3 py-2">Bet</th>
                <th className="px-3 py-2">Stake</th>
                <th className="px-3 py-2">Outcome</th>
                <th className="px-3 py-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted">
                    No rounds played yet.
                  </td>
                </tr>
              )}
              {history.map((round) => (
                <tr key={round.id} data-testid="bet-history-row" className="border-t border-line">
                  <td className="px-3 py-2 font-mono">{round.id}</td>
                  <td className="px-3 py-2 font-mono">
                    {round.result} <Badge tone={round.color === "red" ? "danger" : "neutral"}>{colorLabel(round.color)}</Badge>
                  </td>
                  <td className="px-3 py-2">{betTypeLabel(round.bet)}</td>
                  <td className="px-3 py-2 font-mono">{round.bet?.stake}</td>
                  <td className="px-3 py-2">
                    <Badge tone={round.profit > 0 ? "accent" : "neutral"}>{round.profit > 0 ? "WIN" : "LOSE"}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono">{round.profit > 0 ? `+${round.profit}` : "0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

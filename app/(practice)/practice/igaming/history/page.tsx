"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIgaming, useRequireIgamingAuth } from "@/components/igaming/igaming-provider";

const outcomeTone: Record<string, string> = {
  win: "bg-accent-soft text-accent",
  lose: "bg-danger-soft text-danger",
};

export default function IgamingHistoryPage() {
  const { user, loading } = useRequireIgamingAuth();
  const { bets, transactions, settleBet } = useIgaming();

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Bets &amp; Transactions</h1>
      <p className="mt-1 text-sm text-muted">
        This session&apos;s history only — resets when the server restarts.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-faint">Bets</h2>
      {bets.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No bets placed yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Bet history</caption>
            <thead>
              <tr className="bg-surface-2">
                {["Bet", "Market", "Selection", "Stake", "Odds", "Status", ""].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-line px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr
                  key={bet.id}
                  data-testid="bet-row"
                  className="border-b border-line bg-surface last:border-0"
                >
                  <th scope="row" className="px-4 py-3 text-left font-mono font-medium">
                    {bet.id}
                  </th>
                  <td className="px-4 py-3 text-muted">{bet.marketLabel}</td>
                  <td className="px-4 py-3 text-muted">{bet.optionLabel}</td>
                  <td className="px-4 py-3 font-mono">${bet.stake.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono">{bet.odds.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      data-testid="bet-status"
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        bet.status === "settled"
                          ? (outcomeTone[bet.outcome ?? ""] ?? "bg-surface-3 text-muted")
                          : "bg-warn-soft text-warn",
                      )}
                    >
                      {bet.status === "settled" ? `Settled — ${bet.outcome}` : "Accepted"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {bet.status === "accepted" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => settleBet(bet.id, "win")}>
                          Settle win
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => settleBet(bet.id, "lose")}>
                          Settle lose
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-faint">
        Transactions
      </h2>
      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No transactions yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">Transaction history</caption>
            <thead>
              <tr className="bg-surface-2">
                {["Transaction", "Type", "Amount", "Balance after"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-line px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  data-testid="transaction-row"
                  className="border-b border-line bg-surface last:border-0"
                >
                  <th scope="row" className="px-4 py-3 text-left font-mono font-medium">
                    {tx.id}
                  </th>
                  <td className="px-4 py-3 text-muted capitalize">
                    {tx.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono">${tx.balanceAfter.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

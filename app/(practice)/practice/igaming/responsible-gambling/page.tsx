"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { useIgaming, useRequireIgamingAuth } from "@/components/igaming/igaming-provider";

export default function ResponsibleGamblingPage() {
  const { user, loading } = useRequireIgamingAuth();
  const { wallet, setDepositLimit, selfExclude } = useIgaming();

  const [limit, setLimit] = React.useState("100");
  const [limitError, setLimitError] = React.useState("");
  const [limitSaved, setLimitSaved] = React.useState(false);
  const [confirmingExclusion, setConfirmingExclusion] = React.useState(false);
  const [excluded, setExcluded] = React.useState(false);

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  async function onSetLimit(event: React.FormEvent) {
    event.preventDefault();
    setLimitError("");
    setLimitSaved(false);
    const result = await setDepositLimit(Number(limit));
    if (result.error) setLimitError(result.error);
    else setLimitSaved(true);
  }

  async function onConfirmExclusion() {
    await selfExclude();
    setExcluded(true);
    setConfirmingExclusion(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Responsible Gambling</h1>
      <p className="mt-1 text-sm text-muted">
        Deposit limit:{" "}
        {wallet.depositLimit !== null ? `$${wallet.depositLimit.toFixed(2)} / day` : "Not set"} ·
        Deposited today: ${wallet.depositedToday.toFixed(2)}
      </p>

      <form
        aria-label="Set deposit limit"
        onSubmit={onSetLimit}
        className="mt-6 rounded-xl border border-line bg-surface p-5"
      >
        <label htmlFor="deposit-limit" className="mb-1.5 block text-sm font-medium">
          Daily deposit limit
        </label>
        <input
          id="deposit-limit"
          type="number"
          min="0"
          step="1"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        />

        {limitError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {limitError}
          </p>
        )}
        {limitSaved && (
          <p
            data-testid="limit-saved"
            className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent"
          >
            Deposit limit updated.
          </p>
        )}

        <Button type="submit" className="mt-5 w-full">
          Save limit
        </Button>
      </form>

      <div className="mt-8 rounded-xl border border-danger/40 bg-danger-soft/40 p-5">
        <h2 className="text-sm font-semibold text-danger">Self-exclusion</h2>
        <p className="mt-1 text-sm text-muted">
          Self-exclusion blocks deposits and betting for this session immediately, and cannot be
          undone from this page.
        </p>

        {excluded ? (
          <p data-testid="self-exclusion-confirmed" className="mt-3 text-sm font-medium text-danger">
            You are now self-excluded.
          </p>
        ) : confirmingExclusion ? (
          <div className="mt-3 flex gap-2">
            <Button variant="danger" size="sm" onClick={onConfirmExclusion}>
              Confirm self-exclusion
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingExclusion(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={() => setConfirmingExclusion(true)}
          >
            Self-exclude
          </Button>
        )}
      </div>

      <Callout tone="info" title="Why this matters for QA" className="mt-6">
        A self-excluded player must be blocked at the API layer too, not just hidden in the UI —
        the betting and deposit endpoints re-check <code>selfExcluded</code> on every request.
      </Callout>
    </div>
  );
}

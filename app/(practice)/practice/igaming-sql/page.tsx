import { Suspense } from "react";
import type { Metadata } from "next";
import { IgamingSqlLab } from "@/components/sql/igaming-sql-lab";

export const metadata: Metadata = {
  title: "iGaming SQL Lab",
  description:
    "The same in-browser SQL engine as the SQL for Testers module, over a separate 13-table synthetic gambling-platform dataset with deliberate ledger and compliance bugs.",
};

export default function IgamingSqlLabPage() {
  return (
    <div>
      <div className="border-b border-line bg-surface px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">iGaming SQL Lab</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
            Thirteen tables modelling a fictional online gambling platform — players,
            wallets, transactions, bets, settlements, KYC, self-exclusions and more —
            queried by the same in-browser SQL engine as the SQL for Testers module.
            The data contains deliberate reconciliation and compliance bugs; the QA
            Validation exercises ask you to find them. Entirely synthetic data.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <p className="p-8 text-center text-sm text-muted">Loading the iGaming SQL Lab…</p>
        }
      >
        <IgamingSqlLab />
      </Suspense>
    </div>
  );
}

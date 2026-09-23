import { Suspense } from "react";
import type { Metadata } from "next";
import { CasinoSqlLab } from "@/components/sql/casino-sql-lab";

export const metadata: Metadata = {
  title: "Casino SQL Lab",
  description:
    "The same in-browser SQL engine as the SQL for Testers module, over a separate four-table European Roulette dataset with deliberate reconciliation bugs.",
};

export default function CasinoSqlLabPage() {
  return (
    <div>
      <div className="border-b border-line bg-surface px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">Casino SQL Lab</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
            Four tables behind the European Roulette practice app — players, rounds,
            bets and transactions — queried by the same in-browser SQL engine as the
            SQL for Testers module. The data contains deliberate payout, reconciliation
            and duplicate-record bugs; the exercises ask you to find them. Entirely
            synthetic, virtual-credit data.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <p className="p-8 text-center text-sm text-muted">Loading the Casino SQL Lab…</p>
        }
      >
        <CasinoSqlLab />
      </Suspense>
    </div>
  );
}

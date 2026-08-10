import { Suspense } from "react";
import type { Metadata } from "next";
import { SqlLab } from "@/components/sql/sql-lab";

export const metadata: Metadata = {
  title: "SQL Lab",
  description:
    "An in-browser SQL engine over a seven-table QA dataset, with exercises that hunt for real data inconsistencies.",
};

export default function SqlLabPage() {
  return (
    <div>
      <div className="border-b border-line bg-surface px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">SQL for Testers Lab</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
            Seven tables modelled on ShopEasy, queried by an in-browser SQL engine —
            no database, no setup, identical results for everyone. The data contains
            deliberate inconsistencies; the QA Validation exercises ask you to find
            them.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <p className="p-8 text-center text-sm text-muted">Loading the SQL Lab…</p>
        }
      >
        <SqlLab />
      </Suspense>
    </div>
  );
}

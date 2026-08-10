"use client";

import { AlertTriangle } from "lucide-react";
import type { QueryResult } from "@/lib/sql-engine/executor";
import type { SqlValue } from "@/lib/sql-engine/dataset";

export function SqlResults({
  result,
  error,
}: {
  result: QueryResult | null;
  error: { message: string; hint?: string } | null;
}) {
  if (error) {
    return (
      <div className="m-3 rounded-xl border border-danger/40 bg-danger-soft p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-danger">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          Query failed
        </p>
        <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12.5px] text-fg/90">
          {error.message}
        </pre>
        {error.hint && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{error.hint}</p>
        )}
      </div>
    );
  }

  if (!result) {
    return (
      <p className="px-4 py-8 text-center text-sm text-faint">
        Run a query to see results.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-muted">
        <span>
          {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
        </span>
        <span>{result.columns.length} columns</span>
        <span>{result.durationMs} ms</span>
      </div>

      {result.notice && (
        <p className="border-b border-line bg-info-soft px-3 py-2 text-[12.5px] text-info">
          {result.notice}
        </p>
      )}

      {result.rowCount > 0 && (
        <div className="scrollbar-thin overflow-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead className="sticky top-0">
              <tr className="bg-surface-2">
                {result.columns.map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    scope="col"
                    className="whitespace-nowrap border-b border-line px-3 py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-line last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="whitespace-nowrap px-3 py-1.5 font-mono"
                    >
                      <Cell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Cell({ value }: { value: SqlValue }) {
  if (value === null) {
    return <span className="italic text-faint">NULL</span>;
  }
  if (typeof value === "number") {
    return <span className="text-info">{value}</span>;
  }
  return <span>{value}</span>;
}

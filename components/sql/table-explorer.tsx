"use client";

import * as React from "react";
import { ChevronRight, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { database } from "@/lib/sql-engine/dataset";

export function TableExplorer({
  onInsert,
}: {
  onInsert: (snippet: string) => void;
}) {
  const [open, setOpen] = React.useState<string[]>(["users"]);

  function toggle(name: string) {
    setOpen((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
        Schema
      </p>

      <ul className="space-y-0.5">
        {database.map((table) => {
          const expanded = open.includes(table.name);
          return (
            <li key={table.name}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggle(table.name)}
                  aria-expanded={expanded}
                  className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] hover:bg-surface-2"
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0 text-faint transition-transform",
                      expanded && "rotate-90",
                    )}
                    aria-hidden
                  />
                  <Table2 className="h-3.5 w-3.5 shrink-0 text-info" aria-hidden />
                  <span className="truncate font-mono">{table.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-faint">
                    {table.rows.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(`SELECT * FROM ${table.name};`)}
                  title={`Query ${table.name}`}
                  className="rounded px-1.5 py-1 text-[11px] text-faint hover:bg-surface-2 hover:text-accent"
                >
                  run
                </button>
              </div>

              {expanded && (
                <ul className="mb-1 ml-6 space-y-0.5 border-l border-line pl-2">
                  {table.columns.map((column) => (
                    <li key={column.name}>
                      <button
                        type="button"
                        onClick={() => onInsert(column.name)}
                        title={column.description}
                        className="flex w-full items-baseline gap-2 rounded px-1.5 py-0.5 text-left hover:bg-surface-2"
                      >
                        <span className="font-mono text-[12px]">{column.name}</span>
                        <span className="font-mono text-[10px] text-faint">
                          {column.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-line bg-surface-2 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
          Relationships
        </p>
        <pre className="mt-2 font-mono text-[10.5px] leading-relaxed text-muted">
{`users ──┬──< orders ──< order_items >── products
        │        │
        │        └──< payments
        │
        ├──< addresses
        └──< messages`}
        </pre>
      </div>
    </div>
  );
}

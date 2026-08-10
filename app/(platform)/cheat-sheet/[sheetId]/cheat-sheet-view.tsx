"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Code } from "@/components/ui/code-block";
import type { CheatSheet } from "@/content/cheat-sheets";

export function CheatSheetView({ sheet }: { sheet: CheatSheet }) {
  const [query, setQuery] = React.useState("");

  const needle = query.trim().toLowerCase();

  const sections = sheet.sections
    .map((section) => ({
      ...section,
      entries: section.entries.filter(
        (entry) =>
          !needle ||
          entry.code.toLowerCase().includes(needle) ||
          entry.description.toLowerCase().includes(needle),
      ),
    }))
    .filter((section) => section.entries.length > 0);

  return (
    <div>
      <div className="mb-5 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-line bg-surface px-3">
        <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${sheet.title.toLowerCase()}…`}
          aria-label={`Filter ${sheet.title}`}
          className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
        />
      </div>

      {sections.length === 0 && (
        <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
          Nothing matched “{query}”.
        </p>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full border-collapse">
                <tbody>
                  {section.entries.map((entry, index) => (
                    <tr
                      key={`${entry.code}-${index}`}
                      className="border-b border-line last:border-0 even:bg-surface-2/40"
                    >
                      <td className="w-1/2 bg-code-bg p-3 align-top">
                        <pre className="scrollbar-thin overflow-x-auto text-[12.5px] leading-6">
                          <Code code={entry.code} language={entry.language ?? "ts"} />
                        </pre>
                      </td>
                      <td className="bg-surface p-3 align-top text-sm leading-relaxed text-muted">
                        {entry.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

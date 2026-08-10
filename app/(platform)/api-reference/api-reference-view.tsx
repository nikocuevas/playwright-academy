"use client";

import * as React from "react";
import { Search, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { apiNamespaces } from "@/content/api-reference";

export function ApiReferenceView() {
  const [query, setQuery] = React.useState("");
  const [namespace, setNamespace] = React.useState("all");

  const needle = query.trim().toLowerCase();

  const groups = apiNamespaces
    .filter((group) => namespace === "all" || group.namespace === namespace)
    .map((group) => ({
      ...group,
      entries: group.entries.filter(
        (entry) =>
          !needle ||
          entry.signature.toLowerCase().includes(needle) ||
          entry.summary.toLowerCase().includes(needle) ||
          entry.commonUse.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-line bg-surface px-3">
          <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the API…"
            aria-label="Search the API reference"
            className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["all", ...apiNamespaces.map((g) => g.namespace)].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setNamespace(name)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12.5px] transition",
                namespace === name
                  ? "border-accent bg-accent-soft font-medium text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {name === "all" ? "All" : name}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
          Nothing matched “{query}”.
        </p>
      )}

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.namespace}>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
              {group.namespace}
            </h2>

            <div className="space-y-4">
              {group.entries.map((entry) => (
                <article
                  key={entry.id}
                  id={entry.id}
                  className="scroll-mt-20 overflow-hidden rounded-xl border border-line bg-surface"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
                    <code className="font-mono text-sm font-semibold">
                      {entry.signature}
                    </code>
                    {entry.simulated ? (
                      <Badge tone="violet">Runs in the playground</Badge>
                    ) : (
                      <Badge>Local Playwright only</Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-sm leading-relaxed">{entry.summary}</p>

                    {entry.parameters.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[440px] border-collapse text-sm">
                          <thead>
                            <tr>
                              {["Parameter", "Type", "Description"].map((header) => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="border-b border-line pb-1.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-faint"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entry.parameters.map((parameter) => (
                              <tr key={parameter.name} className="border-b border-line last:border-0">
                                <td className="py-1.5 pr-4 align-top font-mono text-[12.5px]">
                                  {parameter.name}
                                </td>
                                <td className="py-1.5 pr-4 align-top font-mono text-[12px] text-info">
                                  {parameter.type}
                                </td>
                                <td className="py-1.5 align-top text-[13px] text-muted">
                                  {parameter.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className="mt-3 font-mono text-xs text-faint">
                      Returns: <span className="text-info">{entry.returns}</span>
                    </p>

                    <CodeBlock code={entry.example} title="Example" />

                    <p className="text-sm text-muted">
                      <span className="font-medium text-fg">Common use: </span>
                      {entry.commonUse}
                    </p>

                    {entry.mistakes.length > 0 && (
                      <div className="mt-3 rounded-lg border border-warn/30 bg-warn-soft p-3">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warn">
                          <TriangleAlert className="h-3 w-3" aria-hidden />
                          Common mistakes
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {entry.mistakes.map((mistake) => (
                            <li key={mistake} className="flex items-start gap-2 text-[13px]">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" />
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

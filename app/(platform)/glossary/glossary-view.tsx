"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { glossary, glossaryCategories } from "@/content/glossary";

export function GlossaryView() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");

  const needle = query.trim().toLowerCase();

  const terms = glossary
    .filter((term) => category === "all" || term.category === category)
    .filter(
      (term) =>
        !needle ||
        term.term.toLowerCase().includes(needle) ||
        term.definition.toLowerCase().includes(needle),
    )
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-line bg-surface px-3">
          <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search the glossary"
            className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["all", ...glossaryCategories].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12.5px] transition",
                category === name
                  ? "border-accent bg-accent-soft font-medium text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {name === "all" ? "All" : name}
            </button>
          ))}
        </div>
      </div>

      {terms.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
          Nothing matched “{query}”.
        </p>
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          {terms.map((term) => (
            <div
              key={term.term}
              id={slugify(term.term)}
              className="scroll-mt-20 rounded-xl border border-line bg-surface p-4"
            >
              <dt className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold">{term.term}</span>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                  {term.category}
                </span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {term.definition}
              </dd>
              {term.href && (
                <Link
                  href={term.href}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-info hover:underline"
                >
                  Read more
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

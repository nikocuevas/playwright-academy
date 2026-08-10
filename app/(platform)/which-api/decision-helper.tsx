"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";
import { decisionTrees, type Recommendation } from "@/content/which-api";

export function DecisionHelper() {
  const [treeId, setTreeId] = React.useState(decisionTrees[0].id);
  const [optionId, setOptionId] = React.useState<string | null>(null);

  const tree = decisionTrees.find((t) => t.id === treeId)!;
  const option = tree.options.find((o) => o.id === optionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {decisionTrees.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTreeId(item.id);
              setOptionId(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition",
              treeId === item.id
                ? "border-accent bg-accent-soft font-medium text-accent"
                : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {item.question}
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold tracking-tight">{tree.question}</h2>
        <p className="mt-1 text-sm text-muted">{tree.intro}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {tree.options.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOptionId(item.id === optionId ? null : item.id)}
              aria-pressed={item.id === optionId}
              className={cn(
                "rounded-lg border p-3 text-left transition",
                item.id === optionId
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:border-line-strong hover:bg-surface-2",
              )}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {option && (
        <section className="animate-fade-up space-y-4">
          <RecommendationCard
            recommendation={option.recommendation}
            heading="Recommended"
            primary
          />

          {option.alternatives?.map((alternative) => (
            <RecommendationCard
              key={alternative.api}
              recommendation={alternative}
              heading="Also worth knowing"
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  heading,
  primary = false,
}: {
  recommendation: Recommendation;
  heading: string;
  primary?: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border",
        primary ? "border-accent/40" : "border-line",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5",
          primary
            ? "border-accent/30 bg-accent-soft"
            : "border-line bg-surface-2",
        )}
      >
        <div>
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              primary ? "text-accent" : "text-faint",
            )}
          >
            {heading}
          </p>
          <p className="font-mono text-sm font-semibold">{recommendation.api}</p>
        </div>

        {recommendation.href && (
          <Link
            href={recommendation.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-info hover:underline"
          >
            Read the lesson
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      <div className="bg-surface p-4">
        <CodeBlock
          code={recommendation.code}
          language={recommendation.code.trim().toUpperCase().startsWith("SELECT") ? "sql" : "ts"}
          className="mt-0"
        />

        <p className="text-sm leading-relaxed text-muted">{recommendation.why}</p>

        {recommendation.caution && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-soft p-3 text-[13px]">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
            {recommendation.caution}
          </p>
        )}
      </div>
    </article>
  );
}

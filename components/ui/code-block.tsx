"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { tokenClass, tokenize, type Language } from "@/lib/highlight";

export function Code({
  code,
  language = "ts",
  className,
}: {
  code: string;
  language?: Language;
  className?: string;
}) {
  const tokens = React.useMemo(() => tokenize(code, language), [code, language]);
  return (
    <code className={cn("font-mono", className)}>
      {tokens.map((t, i) => (
        <span key={i} className={tokenClass[t.type]}>
          {t.text}
        </span>
      ))}
    </code>
  );
}

export function CodeBlock({
  code,
  language = "ts",
  title,
  caption,
  showLineNumbers = false,
  highlightLines = [],
  className,
}: {
  code: string;
  language?: Language;
  title?: string;
  caption?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const trimmed = code.replace(/^\n+|\n+$/g, "");
  const lines = trimmed.split("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — silently ignore */
    }
  }

  return (
    <figure className={cn("group my-4 overflow-hidden rounded-xl border border-line", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
          {title ?? language}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-surface-3 hover:text-fg"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-x-auto bg-code-bg p-4 text-[13px] leading-6">
        <code className="font-mono">
          {lines.map((line, idx) => {
            const isHighlighted = highlightLines.includes(idx + 1);
            return (
              <div
                key={idx}
                className={cn(
                  "-mx-4 px-4",
                  isHighlighted && "bg-accent/10 border-l-2 border-accent",
                )}
              >
                {showLineNumbers && (
                  <span className="mr-4 inline-block w-6 select-none text-right text-[#4b5364]">
                    {idx + 1}
                  </span>
                )}
                <Code code={line || " "} language={language} />
              </div>
            );
          })}
        </code>
      </pre>
      {caption && (
        <figcaption className="border-t border-line bg-surface-2 px-3 py-2 text-xs text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Two snippets side by side: what to avoid vs. what to prefer. */
export function GoodBadCompare({
  bad,
  good,
  badLabel = "Avoid",
  goodLabel = "Prefer",
  language = "ts",
  note,
}: {
  bad: string;
  good: string;
  badLabel?: string;
  goodLabel?: string;
  language?: Language;
  note?: string;
}) {
  return (
    <div className="my-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-danger/40">
          <div className="border-b border-danger/30 bg-danger-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-danger">
            ✕ {badLabel}
          </div>
          <pre className="scrollbar-thin overflow-x-auto bg-code-bg p-3 text-[12.5px] leading-6">
            <Code code={bad.trim()} language={language} />
          </pre>
        </div>
        <div className="overflow-hidden rounded-xl border border-accent/40">
          <div className="border-b border-accent/30 bg-accent-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            ✓ {goodLabel}
          </div>
          <pre className="scrollbar-thin overflow-x-auto bg-code-bg p-3 text-[12.5px] leading-6">
            <Code code={good.trim()} language={language} />
          </pre>
        </div>
      </div>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}

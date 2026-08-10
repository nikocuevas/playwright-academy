"use client";

import * as React from "react";
import { Check, CircleDot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionStep, SimError } from "@/lib/playwright-simulator/runner";

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const rest = Math.round(ms % 1000);
  return `${String(seconds).padStart(2, "0")}:${String(rest).padStart(3, "0")}`;
}

export function ExecutionTimeline({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: ExecutionStep[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  if (steps.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-faint">
        Run the test to see each step execute against the simulated browser.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {steps.map((step) => {
        const selected = selectedIndex === step.index;
        return (
          <li key={step.index}>
            <button
              type="button"
              onClick={() => onSelect(step.index)}
              className={cn(
                "flex w-full items-start gap-2.5 px-3 py-1.5 text-left font-mono text-[12px] transition",
                selected ? "bg-surface-2" : "hover:bg-surface-2",
              )}
            >
              {step.status === "passed" ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
              )}
              <span className="shrink-0 text-faint">{formatTime(step.atMs)}</span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block break-words",
                    step.status === "failed" ? "text-danger" : "text-fg",
                  )}
                >
                  {step.label}
                </span>
                {step.note && (
                  <span className="mt-0.5 block break-words text-[11px] text-faint">
                    {step.note}
                  </span>
                )}
              </span>
              {selected && (
                <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ErrorPanel({ error }: { error: SimError }) {
  return (
    <div className="border-t border-danger/40 bg-danger-soft p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-danger">
        <X className="h-4 w-4" aria-hidden />
        {error.title}
      </p>

      <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-fg/90">
        {error.message}
      </pre>

      {error.locator && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-danger">
            Locator
          </p>
          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[12px]">
            {error.locator}
          </pre>
        </div>
      )}

      {(error.expected !== undefined || error.received !== undefined) && (
        <div className="mt-3 grid gap-1 font-mono text-[12px]">
          {error.expected !== undefined && (
            <p>
              <span className="text-faint">Expected: </span>
              <span className="text-accent">{error.expected}</span>
            </p>
          )}
          {error.received !== undefined && (
            <p>
              <span className="text-faint">Received: </span>
              <span className="text-danger">{error.received}</span>
            </p>
          )}
        </div>
      )}

      {error.reason && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-danger">
            Reason
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg/90">{error.reason}</p>
        </div>
      )}

      {error.callLog && error.callLog.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-danger">
            Call log
          </p>
          <pre className="mt-1 font-mono text-[11.5px] leading-relaxed text-muted">
            {error.callLog.map((line) => `  - ${line}`).join("\n")}
          </pre>
        </div>
      )}

      {error.available && error.available.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-danger">
            Available on the page
          </p>
          <ul className="mt-1 space-y-0.5 font-mono text-[11.5px] text-muted">
            {error.available.map((item, index) => (
              <li key={`${item}-${index}`}>- {item}</li>
            ))}
          </ul>
        </div>
      )}

      {error.line !== undefined && (
        <p className="mt-3 font-mono text-[11px] text-faint">
          at line {error.line}
        </p>
      )}
    </div>
  );
}

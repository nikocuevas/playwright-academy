import * as React from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  sublabel,
  size = "md",
  tone = "accent",
  className,
}: {
  value: number;
  label?: string;
  sublabel?: string;
  size?: "sm" | "md";
  tone?: "accent" | "info" | "violet" | "warn";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const bar = {
    accent: "bg-accent",
    info: "bg-info",
    violet: "bg-violet",
    warn: "bg-warn",
  }[tone];

  return (
    <div className={className}>
      {(label || sublabel) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium">{label}</span>}
          <span className="font-mono text-xs text-muted">
            {sublabel ?? `${pct}%`}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-3",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Blocky ████░░░░ style meter used on the dashboard. */
export function BlockMeter({ value, blocks = 16 }: { value: number; blocks?: number }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * blocks);
  return (
    <span className="font-mono text-[13px] tracking-tighter" aria-hidden>
      <span className="text-accent">{"█".repeat(filled)}</span>
      <span className="text-line-strong">{"░".repeat(blocks - filled)}</span>
    </span>
  );
}

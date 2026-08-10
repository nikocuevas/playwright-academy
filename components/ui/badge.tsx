import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "info"
  | "warn"
  | "danger"
  | "violet";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-3 text-muted border-line",
  accent: "bg-accent-soft text-accent border-transparent",
  info: "bg-info-soft text-info border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  violet: "bg-violet-soft text-violet border-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const difficultyTone: Record<string, BadgeTone> = {
  beginner: "accent",
  intermediate: "info",
  advanced: "violet",
  expert: "danger",
};

export function DifficultyBadge({ level }: { level: string }) {
  return (
    <Badge tone={difficultyTone[level] ?? "neutral"} className="capitalize">
      {level}
    </Badge>
  );
}

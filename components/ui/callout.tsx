import * as React from "react";
import {
  AlertTriangle,
  Bug,
  Info,
  Lightbulb,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutTone = "info" | "tip" | "warning" | "danger" | "success" | "bug";

const config: Record<
  CalloutTone,
  { icon: React.ElementType; wrapper: string; icons: string; label: string }
> = {
  info: {
    icon: Info,
    wrapper: "border-info/35 bg-info-soft",
    icons: "text-info",
    label: "Note",
  },
  tip: {
    icon: Lightbulb,
    wrapper: "border-accent/35 bg-accent-soft",
    icons: "text-accent",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-warn/40 bg-warn-soft",
    icons: "text-warn",
    label: "Careful",
  },
  danger: {
    icon: TriangleAlert,
    wrapper: "border-danger/40 bg-danger-soft",
    icons: "text-danger",
    label: "Common mistake",
  },
  success: {
    icon: ShieldCheck,
    wrapper: "border-accent/35 bg-accent-soft",
    icons: "text-accent",
    label: "Good practice",
  },
  bug: {
    icon: Bug,
    wrapper: "border-violet/40 bg-violet-soft",
    icons: "text-violet",
    label: "Debugging",
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, wrapper, icons, label } = config[tone];
  return (
    <div
      className={cn(
        "my-4 flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        wrapper,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", icons)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className={cn("mb-1 text-[12px] font-semibold uppercase tracking-wider", icons)}>
          {title ?? label}
        </p>
        <div className="text-fg/90 [&_p]:my-1">{children}</div>
      </div>
    </div>
  );
}

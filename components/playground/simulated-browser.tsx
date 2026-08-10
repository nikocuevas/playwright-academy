"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Lock, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimNode } from "@/lib/playwright-simulator/dom";

/**
 * Renders the simulator's node tree as a browser-ish preview.
 *
 * This is intentionally a *rendering* of the simulated DOM, not a copy of the
 * real practice app: it stays in sync with whatever the engine resolved, which
 * is what makes the highlighting meaningful.
 */
export function SimulatedBrowser({
  document: doc,
  url,
  highlight = [],
  className,
}: {
  document: SimNode;
  url: string;
  highlight?: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
        <div className="flex items-center gap-1 text-faint">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1">
          <Lock className="h-3 w-3 shrink-0 text-accent" aria-hidden />
          <span className="truncate font-mono text-[11px] text-muted">
            http://localhost:3000{url}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet">
          Simulated
        </span>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-bg p-4">
        <NodeView node={doc} highlight={highlight} depth={0} />
      </div>
    </div>
  );
}

function NodeView({
  node,
  highlight,
  depth,
}: {
  node: SimNode;
  highlight: string[];
  depth: number;
}) {
  if (node.hidden) return null;

  const isHighlighted = highlight.includes(node.key);
  const ring = isHighlighted
    ? "outline outline-2 outline-offset-2 outline-accent animate-pulse-ring rounded"
    : "";

  const children = (node.children ?? []).map((child) => (
    <NodeView key={child.key} node={child} highlight={highlight} depth={depth + 1} />
  ));

  switch (node.role) {
    case "banner":
      return (
        <header className={cn("mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2", ring)}>
          {children}
        </header>
      );

    case "navigation":
      return (
        <nav className={cn("flex flex-wrap items-center gap-3", ring)}>{children}</nav>
      );

    case "heading": {
      const size =
        node.headingLevel === 1
          ? "text-lg font-semibold"
          : "text-sm font-semibold";
      return (
        <div className={cn("mb-2", ring)}>
          <p className={cn(size, node.variant === "success" && "text-accent")}>
            {node.text}
          </p>
          {children}
        </div>
      );
    }

    case "link":
      return (
        <span
          className={cn(
            "inline-block cursor-default text-[13px] text-info underline decoration-info/40 underline-offset-2",
            node.variant === "primary" && "font-medium",
            ring,
          )}
        >
          {node.text}
          {children}
        </span>
      );

    case "button":
      return (
        <div className={cn("my-2 inline-block", ring)}>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-3 py-1.5 text-[13px] font-medium",
              node.disabled
                ? "cursor-not-allowed border-line bg-surface-3 text-faint"
                : node.variant === "primary"
                  ? "border-transparent bg-accent text-accent-fg"
                  : "border-line bg-surface text-fg",
            )}
          >
            {node.text}
          </span>
          {node.disabled && (
            <span className="ml-2 font-mono text-[10px] text-faint">disabled</span>
          )}
        </div>
      );

    case "textbox":
    case "searchbox":
      return (
        <label className={cn("mb-3 block", ring)}>
          <span className="mb-1 block text-[11px] font-medium text-muted">
            {node.label ?? node.name}
          </span>
          <span
            className={cn(
              "flex h-8 w-full max-w-sm items-center rounded-md border border-line bg-surface px-2.5 font-mono text-[12px]",
              node.value ? "text-fg" : "text-faint",
            )}
          >
            {node.inputType === "password" && node.value
              ? "•".repeat(node.value.length)
              : node.value || node.placeholder || " "}
          </span>
        </label>
      );

    case "combobox":
      return (
        <label className={cn("mb-3 block", ring)}>
          <span className="mb-1 block text-[11px] font-medium text-muted">
            {node.label ?? node.name}
          </span>
          <span className="flex h-8 w-full max-w-sm items-center justify-between rounded-md border border-line bg-surface px-2.5 font-mono text-[12px]">
            <span className={node.value ? "text-fg" : "text-faint"}>
              {node.options?.find((o) => o.value === node.value)?.label ??
                node.options?.[0]?.label ??
                "—"}
            </span>
            <span className="text-faint">▾</span>
          </span>
        </label>
      );

    case "checkbox":
    case "radio":
      return (
        <label className={cn("mb-2 flex items-center gap-2 text-[13px]", ring)}>
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center border text-[10px]",
              node.role === "radio" ? "rounded-full" : "rounded",
              node.checked
                ? "border-accent bg-accent text-accent-fg"
                : "border-line-strong bg-surface",
            )}
          >
            {node.checked ? (node.role === "radio" ? "●" : "✓") : ""}
          </span>
          {node.label ?? node.name}
        </label>
      );

    case "article":
      return (
        <article
          className={cn(
            "mb-3 rounded-lg border border-line bg-surface p-3",
            ring,
          )}
          data-product-id={node.attrs?.["data-product-id"]}
        >
          {children}
          {node.attrs?.["data-product-id"] && (
            <p className="mt-2 font-mono text-[10px] text-faint">
              data-product-id=&quot;{node.attrs["data-product-id"]}&quot; (regenerated)
            </p>
          )}
        </article>
      );

    case "table":
      return (
        <div className={cn("mb-3 overflow-hidden rounded-lg border border-line", ring)}>
          {children}
        </div>
      );

    case "row":
      return (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 border-b border-line px-3 py-2 text-[13px] last:border-0",
            ring,
          )}
        >
          {children}
        </div>
      );

    case "cell":
      return (
        <span className={cn("font-mono text-[12px] text-muted", ring)}>
          {node.text}
          {children}
        </span>
      );

    case "alert":
      return (
        <p
          className={cn(
            "mb-2 rounded-md border border-danger/40 bg-danger-soft px-2.5 py-1.5 text-[12px] text-danger",
            ring,
          )}
        >
          {node.text}
          {children}
        </p>
      );

    case "status":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px]",
            node.variant === "success"
              ? "bg-accent-soft text-accent"
              : "bg-surface-3 text-muted",
            ring,
          )}
        >
          {node.text}
          {children}
        </span>
      );

    case "group":
      return (
        <fieldset className={cn("mb-3 rounded-lg border border-line p-3", ring)}>
          {children}
        </fieldset>
      );

    case "form":
      return (
        <form
          onSubmit={(e) => e.preventDefault()}
          className={cn("rounded-lg border border-line bg-surface p-4", ring)}
        >
          {children}
        </form>
      );

    default:
      if (node.variant === "page") {
        return <div className={cn("space-y-1", ring)}>{children}</div>;
      }
      if (node.text) {
        return (
          <p
            className={cn(
              "mb-2 text-[13px]",
              node.variant === "muted" && "text-muted",
              node.variant === "price" && "font-mono font-semibold text-accent",
              node.variant === "success" && "font-medium text-accent",
              ring,
            )}
          >
            {node.text}
            {children}
          </p>
        );
      }
      return <div className={ring || undefined}>{children}</div>;
  }
}

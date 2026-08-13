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
 *
 * Every control is rendered with the same accessible role the simulator's own
 * `getByRole()` would match (native elements where the tag alone is enough —
 * `<button>`, `<input>`, `<a>`, real heading tags — and an explicit `role`
 * only where the tag can't say it), so learners can rely on the same locator
 * strategies against the preview that they use in their test code.
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

/**
 * A `<select>` in the simulated page.
 *
 * The preview is read-only — the simulated app is driven by the test code, not
 * by the mouse — but a control with a ▾ on it has to open when you click it.
 * Expanding shows every option and its `value`, which is what a learner needs
 * before writing `selectOption()`. The trigger carries `role="combobox"`
 * (matching what a real `<select>` exposes) rather than the plain "button"
 * role its `<button>` tag would otherwise imply.
 */
function ComboboxView({ node, ring }: { node: SimNode; ring: string }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const labelId = `${node.key}-label`;
  const listId = `${node.key}-options`;

  React.useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const options = node.options ?? [];
  const selectedValue = node.value || options[0]?.value || "";
  const selected = options.find((option) => option.value === selectedValue);

  return (
    <div ref={containerRef} className={cn("relative mb-3", ring)}>
      <span id={labelId} className="mb-1 block text-[11px] font-medium text-muted">
        {node.label ?? node.name}
      </span>

      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={node.disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-full max-w-sm items-center justify-between rounded-md border border-line bg-surface px-2.5 font-mono text-[12px] transition hover:border-line-strong"
      >
        <span className={node.value ? "text-fg" : "text-faint"}>
          {selected?.label ?? "—"}
        </span>
        <span
          className={cn(
            "inline-block text-faint transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-w-sm rounded-md border border-line bg-surface p-1 shadow-lg">
          <ul id={listId} role="listbox" aria-labelledby={labelId}>
            {options.map((option) => {
              const isSelected = option.value === selectedValue;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded px-2 py-1 font-mono text-[12px]",
                    isSelected ? "bg-accent-soft text-accent" : "text-muted",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="shrink-0 text-[10px] text-faint">
                    value=&quot;{option.value}&quot;
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-1 border-t border-line px-2 pt-1 text-[10px] leading-4 text-faint">
            Read-only preview — set it from your test with{" "}
            <span className="text-muted">selectOption()</span>.
          </p>
        </div>
      )}
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
      const level = Math.min(6, Math.max(1, node.headingLevel ?? 2));
      const Heading = `h${level}` as keyof React.JSX.IntrinsicElements;
      const size = level === 1 ? "text-lg font-semibold" : "text-sm font-semibold";
      return (
        <div className={cn("mb-2", ring)}>
          <Heading className={cn(size, node.variant === "success" && "text-accent")}>
            {node.text}
          </Heading>
          {children}
        </div>
      );
    }

    case "link":
      return (
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className={cn(
            "inline-block cursor-default text-[13px] text-info underline decoration-info/40 underline-offset-2",
            node.variant === "primary" && "font-medium",
            ring,
          )}
        >
          {node.text}
          {children}
        </a>
      );

    case "button":
      return (
        <div className={cn("my-2 inline-block", ring)}>
          <button
            type="button"
            disabled={node.disabled}
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
          </button>
          {node.disabled && (
            <span className="ml-2 font-mono text-[10px] text-faint">disabled</span>
          )}
        </div>
      );

    case "textbox":
    case "searchbox": {
      // A sibling label + htmlFor, not a wrapping label: once the input has a
      // value, a wrapping label's computed accessible name folds the value in
      // (e.g. "First Name Ada"), which getByLabel('First Name') would still
      // match by substring, but it stops matching { exact: true } and no
      // longer mirrors the real Registration app's markup.
      const controlId = `${node.key}-control`;
      return (
        <div className={cn("mb-3", ring)}>
          <label
            htmlFor={controlId}
            className="mb-1 block text-[11px] font-medium text-muted"
          >
            {node.label ?? node.name}
          </label>
          <input
            id={controlId}
            type={node.role === "searchbox" ? "search" : (node.inputType ?? "text")}
            value={node.value ?? ""}
            placeholder={node.placeholder}
            disabled={node.disabled}
            readOnly
            className={cn(
              "h-8 w-full max-w-sm rounded-md border border-line bg-surface px-2.5 font-mono text-[12px] outline-none",
              node.value ? "text-fg" : "text-faint",
            )}
          />
        </div>
      );
    }

    case "combobox":
      return <ComboboxView node={node} ring={ring} />;

    case "checkbox":
    case "radio":
      return (
        <label className={cn("mb-2 flex items-center gap-2 text-[13px]", ring)}>
          <input
            type={node.role}
            name={node.attrs?.name}
            value={node.attrs?.value}
            checked={Boolean(node.checked)}
            disabled={node.disabled}
            readOnly
            onClick={(event) => event.preventDefault()}
            className="h-4 w-4 accent-[var(--accent)]"
          />
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
        <div
          role="table"
          className={cn("mb-3 overflow-hidden rounded-lg border border-line", ring)}
        >
          {children}
        </div>
      );

    case "row":
      return (
        <div
          role="row"
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
        <span role="cell" className={cn("font-mono text-[12px] text-muted", ring)}>
          {node.text}
          {children}
        </span>
      );

    case "alert":
      return (
        <p
          role="alert"
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
          role="status"
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
          role="form"
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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { search, searchKindTone, type SearchDoc } from "@/lib/search";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo<SearchDoc[]>(() => search(query), [query]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (!value) reset();
          return !value;
        });
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function reset() {
    setQuery("");
    setActive(0);
  }

  function go(doc: SearchDoc) {
    setOpen(false);
    router.push(doc.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm text-faint transition hover:border-line-strong hover:text-muted"
      >
        <SearchIcon className="h-4 w-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search Playwright Academy"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon className="h-4 w-4 shrink-0 text-faint" aria-hidden />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Lessons, APIs, SQL, challenges…"
                aria-label="Search"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="rounded p-1 text-faint hover:text-fg"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="scrollbar-thin max-h-[55vh] overflow-y-auto">
              {query.trim().length < 2 && (
                <p className="px-4 py-6 text-center text-sm text-faint">
                  Type at least two characters.
                </p>
              )}

              {query.trim().length >= 2 && results.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-faint">
                  Nothing matched “{query}”.
                </p>
              )}

              <ul>
                {results.map((doc, index) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(doc)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-2.5 text-left transition",
                        index === active ? "bg-surface-2" : "hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider",
                          searchKindTone[doc.kind],
                        )}
                      >
                        {doc.kind}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {doc.title}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {doc.subtitle}
                        </span>
                      </span>
                      {index === active && (
                        <CornerDownLeft
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-faint"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 border-t border-line bg-surface-2 px-4 py-2 text-[11px] text-faint">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

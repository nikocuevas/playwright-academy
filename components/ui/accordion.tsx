"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
  className,
  allowMultiple = true,
}: {
  items: { id: string; title: React.ReactNode; content: React.ReactNode }[];
  className?: string;
  allowMultiple?: boolean;
}) {
  const [open, setOpen] = React.useState<string[]>([]);

  function toggle(id: string) {
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return allowMultiple ? [...prev, id] : [id];
    });
  }

  return (
    <div className={cn("divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-surface-2"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-faint transition-transform",
                  isOpen && "rotate-90",
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1">{item.title}</span>
            </button>
            {isOpen && (
              <div className="border-t border-line bg-surface-2/50 px-4 py-3 text-sm text-muted">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

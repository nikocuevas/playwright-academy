import { cn } from "@/lib/utils";

/** A stylised play/cursor mark — no external asset, so it themes cleanly. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Playwright Academy"
      className={cn("shrink-0", className)}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        className="fill-accent-soft stroke-accent/40"
        strokeWidth="1.5"
      />
      <path d="M12 9.5 L23 16 L12 22.5 Z" className="fill-accent" />
      <path
        d="M7 9.5 L7 22.5"
        className="stroke-accent"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dices, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIgaming } from "./igaming-provider";

const links = [
  { href: "/practice/igaming", label: "Bet Slip" },
  { href: "/practice/igaming/history", label: "History" },
  { href: "/practice/igaming/responsible-gambling", label: "Responsible Gambling" },
];

export function IgamingHeader() {
  const pathname = usePathname();
  const { user, wallet, logout } = useIgaming();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/practice/igaming"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Dices className="h-5 w-5 text-accent" aria-hidden />
          FakeBet Casino
        </Link>

        <nav aria-label="iGaming" className="flex items-center gap-4 text-sm">
          {links.map((link) => {
            const active =
              link.href === "/practice/igaming"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition",
                  active ? "font-medium text-fg" : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span
                data-testid="wallet-balance"
                className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs font-semibold text-accent"
              >
                ${wallet.balance.toFixed(2)}
              </span>
              <span data-testid="account-name" className="text-sm text-muted">
                {user.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/practice/igaming/login"
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

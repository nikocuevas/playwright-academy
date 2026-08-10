"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./search-dialog";
import { Logo } from "./logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Derived rather than reset in an effect: the menu is open only for the
  // route it was opened on, so navigating anywhere closes it.
  const [openedOn, setOpenedOn] = React.useState<string | null>(null);
  const mobileOpen = openedOn === pathname;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setOpenedOn(mobileOpen ? null : pathname)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-tight">
              Playwright Academy
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchDialog />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar pathname={pathname} mobileOpen={mobileOpen} />

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  mobileOpen,
}: {
  pathname: string;
  mobileOpen: boolean;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "scrollbar-thin sticky top-14 h-[calc(100dvh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-line bg-surface px-3 py-4",
        mobileOpen
          ? "fixed inset-x-0 top-14 z-20 block h-[calc(100dvh-3.5rem)] w-full"
          : "hidden lg:block",
      )}
    >
      <div className="mb-4 sm:hidden">
        <SearchDialog />
      </div>

      {navGroups.map((group) => (
        <div key={group.title} className="mb-5">
          <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                      active
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-6 rounded-lg border border-line bg-surface-2 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
          Training environment
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Accounts, payments, orders and SQL data are simulated. Progress is stored
          in this browser only.
        </p>
      </div>
    </nav>
  );
}

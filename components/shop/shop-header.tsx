"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop } from "./shop-provider";

const links = [
  { href: "/practice/shop", label: "Products" },
  { href: "/practice/shop/cart", label: "Cart" },
  { href: "/practice/shop/orders", label: "Orders" },
  { href: "/practice/shop/messages", label: "Messages" },
];

export function ShopHeader() {
  const pathname = usePathname();
  const { user, cart, logout } = useShop();

  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/practice/shop"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <ShoppingBag className="h-5 w-5 text-accent" aria-hidden />
          ShopEasy
        </Link>

        <nav aria-label="Shop" className="flex items-center gap-4 text-sm">
          {links.map((link) => {
            const active =
              link.href === "/practice/shop"
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
          <Link
            href="/practice/shop/cart"
            className="flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span
              data-testid="cart-count"
              className="min-w-5 rounded-full bg-accent-soft px-1.5 text-center font-mono text-xs font-semibold text-accent"
            >
              {count}
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span data-testid="account-name" className="text-sm text-muted">
                Welcome back, {user.fullName}
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
              href="/practice/shop/login"
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

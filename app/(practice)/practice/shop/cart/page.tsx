"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-provider";

export default function CartPage() {
  const { cart, loading, setQuantity, removeFromCart } = useShop();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading your cart…</p>
      ) : cart.items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">Your cart is empty</p>
          <ButtonLink href="/practice/shop" className="mt-4" size="sm">
            Browse products
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {cart.items.map((item) => (
              <li
                key={item.productId}
                data-testid="cart-item"
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p data-testid="cart-item-name" className="text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatPrice(item.unitPrice)} each
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="rounded-md border border-line p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span
                    data-testid="cart-item-quantity"
                    className="w-8 text-center font-mono text-sm"
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="rounded-md border border-line p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                <p
                  data-testid="cart-item-total"
                  className="w-20 text-right font-mono text-sm font-semibold"
                >
                  {formatPrice(item.lineTotal)}
                </p>

                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeFromCart(item.productId)}
                  className="rounded-md p-1.5 text-muted transition hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 rounded-xl border border-line bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd data-testid="cart-subtotal" className="font-mono">
                {formatPrice(cart.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd data-testid="cart-shipping" className="font-mono">
                {formatPrice(cart.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd data-testid="cart-tax" className="font-mono">
                {formatPrice(cart.tax)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
              <dt>Total</dt>
              <dd data-testid="cart-total" className="font-mono">
                {formatPrice(cart.total)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ButtonLink href="/practice/shop/checkout" size="lg">
              Proceed to Checkout
            </ButtonLink>
            <Link
              href="/practice/shop"
              className="text-sm text-info underline underline-offset-2"
            >
              Continue shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

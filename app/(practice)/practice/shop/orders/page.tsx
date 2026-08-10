"use client";

import * as React from "react";
import { cn, formatPrice } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import type { Order } from "@/lib/practice/store";
import { useRequireAuth } from "@/components/shop/shop-provider";

const statusTone: Record<string, string> = {
  Pending: "bg-warn-soft text-warn",
  Paid: "bg-info-soft text-info",
  Shipped: "bg-accent-soft text-accent",
  Cancelled: "bg-danger-soft text-danger",
};

export default function OrdersPage() {
  const { user, loading } = useRequireAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [fetching, setFetching] = React.useState(true);

  const load = React.useCallback(async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (response.ok) {
        const body = await response.json();
        setOrders(body.orders ?? []);
      }
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function cancel(orderNumber: string) {
    await fetch(`/api/orders/${orderNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    });
    await load();
  }

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Your Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Orders live in this browser session only and reset when the server restarts.
      </p>

      {fetching ? (
        <p className="mt-6 text-sm text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">You have no orders yet</p>
          <ButtonLink href="/practice/shop" className="mt-4" size="sm">
            Browse products
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Your order history</caption>
            <thead>
              <tr className="bg-surface-2">
                {["Order", "Date", "Items", "Total", "Status", ""].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-line px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.orderNumber}
                  data-testid="order-row"
                  className="border-b border-line bg-surface last:border-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-mono font-medium"
                  >
                    {order.orderNumber}
                  </th>
                  <td className="px-4 py-3 text-muted">{order.placedAt}</td>
                  <td className="px-4 py-3 text-muted">
                    {order.items.map((item) => item.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      data-testid="order-status"
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        statusTone[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={order.status !== "Pending"}
                      onClick={() => cancel(order.orderNumber)}
                    >
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

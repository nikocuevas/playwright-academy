"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message, Order } from "@/lib/practice/store";
import { useRequireAuth } from "@/components/shop/shop-provider";

export default function MessagesPage() {
  const { user, loading } = useRequireAuth();

  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [orderNumber, setOrderNumber] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);

  const load = React.useCallback(async () => {
    const [messageResponse, orderResponse] = await Promise.all([
      fetch("/api/messages", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" }),
    ]);

    if (messageResponse.ok) setMessages((await messageResponse.json()).messages ?? []);
    if (orderResponse.ok) setOrders((await orderResponse.json()).orders ?? []);
  }, []);

  React.useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSent(false);

    const found: Record<string, string> = {};
    if (!subject.trim()) found.subject = "Subject is required";
    if (!message.trim()) found.message = "Message is required";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          orderNumber: orderNumber || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrors({ form: body.error ?? "Could not send the message" });
        return;
      }

      setSent(true);
      setSubject("");
      setMessage("");
      setOrderNumber("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Contact support"
        className="rounded-xl border border-line bg-surface p-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Contact Support</h1>
        <p className="mt-1 text-sm text-muted">
          Messages are stored in this session only — nobody reads them.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-invalid={errors.subject ? true : undefined}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
            />
            {errors.subject && (
              <p role="alert" className="mt-1 text-xs text-danger">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="order" className="mb-1.5 block text-sm font-medium">
              Related order
            </label>
            <select
              id="order"
              name="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
            >
              <option value="">Not about a specific order</option>
              {orders.map((order) => (
                <option key={order.orderNumber} value={order.orderNumber}>
                  {order.orderNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              className="w-full rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-accent"
            />
            {errors.message && (
              <p role="alert" className="mt-1 text-xs text-danger">
                {errors.message}
              </p>
            )}
          </div>
        </div>

        {errors.form && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {errors.form}
          </p>
        )}

        <Button type="submit" className="mt-6" disabled={submitting}>
          {submitting ? "Sending…" : "Send Message"}
        </Button>

        {sent && (
          <p
            role="status"
            data-testid="message-success"
            className="mt-4 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm font-medium text-accent"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Message sent successfully!
          </p>
        )}
      </form>

      <aside className="h-fit rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Your messages</h2>
        {messages.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No messages yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {messages.map((item) => (
              <li
                key={item.id}
                data-testid="message-row"
                className="rounded-lg border border-line p-3"
              >
                <p className="text-sm font-medium">{item.subject}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{item.body}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-faint">
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 uppercase tracking-wider">
                    {item.status}
                  </span>
                  {item.orderNumber && (
                    <span className="font-mono">{item.orderNumber}</span>
                  )}
                  <span>{item.sentAt}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

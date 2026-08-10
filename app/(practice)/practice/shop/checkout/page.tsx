"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { provinces } from "@/lib/practice/shop-data";
import { useRequireAuth, useShop } from "@/components/shop/shop-provider";

type Placed = { orderNumber: string; total: number };

const shippingFields = [
  { name: "firstName", label: "First Name", half: true },
  { name: "lastName", label: "Last Name", half: true },
  { name: "address", label: "Address" },
  { name: "city", label: "City", half: true },
  { name: "postalCode", label: "Postal Code", half: true },
];

const paymentFields = [
  { name: "cardNumber", label: "Card Number", placeholder: "4111 1111 1111 1111" },
  { name: "expiration", label: "Expiration", placeholder: "MM/YY", half: true },
  { name: "cvv", label: "CVV", placeholder: "123", half: true },
];

export default function CheckoutPage() {
  const { user, loading } = useRequireAuth();
  const { cart, refreshCart } = useShop();

  const [values, setValues] = React.useState<Record<string, string>>({
    province: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [placed, setPlaced] = React.useState<Placed | null>(null);
  const [serverError, setServerError] = React.useState("");

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError("");

    const required = [
      ...shippingFields.map((f) => f.name),
      "province",
      ...paymentFields.map((f) => f.name),
    ];

    const found: Record<string, string> = {};
    for (const name of required) {
      if (!values[name]?.trim()) found[name] = "This field is required";
    }

    const digits = (values.cardNumber ?? "").replace(/\D/g, "");
    if (digits && (digits.length < 15 || digits.length > 16)) {
      found.cardNumber = "Enter a 15 or 16 digit card number";
    }
    if (values.expiration && !/^\d{2}\/\d{2}$/.test(values.expiration)) {
      found.expiration = "Use the MM/YY format";
    }
    if (values.cvv && !/^\d{3,4}$/.test(values.cvv)) {
      found.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    // Simulated payment processing delay.
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: values }),
      });
      const body = await response.json();

      if (!response.ok) {
        setServerError(body.error ?? "Could not place the order");
        return;
      }

      setPlaced({
        orderNumber: body.order.orderNumber,
        total: body.order.total,
      });
      await refreshCart();
    } catch {
      setServerError("Network request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-accent/40 bg-accent-soft p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-accent">Order Successful!</h1>

        <dl className="mt-6 space-y-2 text-left">
          <div className="flex justify-between border-b border-accent/20 pb-2">
            <dt className="text-sm text-muted">Order Number</dt>
            <dd data-testid="order-number" className="font-mono text-sm font-semibold">
              {placed.orderNumber}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted">Total charged</dt>
            <dd data-testid="order-total" className="font-mono text-sm font-semibold">
              {formatPrice(placed.total)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted">
          No payment was processed. The card details you entered were never sent
          anywhere and are not stored.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/practice/shop/orders">View Orders</ButtonLink>
          <ButtonLink href="/practice/shop/messages" variant="secondary">
            Contact Support
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Your cart is empty, so there is nothing to check out.
        </p>
        <ButtonLink href="/practice/shop" className="mt-4" size="sm">
          Browse products
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_280px]">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Checkout"
        className="rounded-xl border border-line bg-surface p-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold">Shipping</legend>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {shippingFields.map((field) => (
              <Field
                key={field.name}
                {...field}
                value={values[field.name] ?? ""}
                error={errors[field.name]}
                onChange={(value) => update(field.name, value)}
              />
            ))}

            <div className="mb-4 sm:col-span-1">
              <label htmlFor="province" className="mb-1.5 block text-sm font-medium">
                Province
              </label>
              <select
                id="province"
                name="province"
                value={values.province ?? ""}
                onChange={(e) => update("province", e.target.value)}
                aria-invalid={errors.province ? true : undefined}
                className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
              >
                <option value="">Select a province</option>
                {provinces.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {errors.province}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-2">
          <legend className="mb-3 text-sm font-semibold">Payment (simulated)</legend>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {paymentFields.map((field) => (
              <Field
                key={field.name}
                {...field}
                value={values[field.name] ?? ""}
                error={errors[field.name]}
                onChange={(value) => update(field.name, value)}
              />
            ))}
          </div>
          <p className="text-xs text-faint">
            This form does not contact a payment provider. Use the test card
            4111 1111 1111 1111.
          </p>
        </fieldset>

        {serverError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Processing payment…" : "Place Order"}
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted">
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0 font-mono">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="font-mono">{formatPrice(cart.shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Tax</dt>
            <dd className="font-mono">{formatPrice(cart.tax)}</dd>
          </div>
          <div className="flex justify-between pt-1 font-semibold">
            <dt>Total</dt>
            <dd data-testid="checkout-total" className="font-mono">
              {formatPrice(cart.total)}
            </dd>
          </div>
        </dl>
        <Link
          href="/practice/shop/cart"
          className="mt-4 block text-sm text-info underline underline-offset-2"
        >
          Edit cart
        </Link>
      </aside>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  half,
  value,
  error,
  onChange,
}: {
  name: string;
  label: string;
  placeholder?: string;
  half?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={half ? "mb-4 sm:col-span-1" : "mb-4 sm:col-span-2"}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

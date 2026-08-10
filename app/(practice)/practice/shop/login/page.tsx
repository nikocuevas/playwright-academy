"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession, refreshCart, user } = useShop();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const next = searchParams.get("next") ?? "/practice/shop";

  React.useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Sign in failed");
        return;
      }

      await Promise.all([refreshSession(), refreshCart()]);
      router.push(next);
    } catch {
      setError("Network request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Sign in"
        className="rounded-xl border border-line bg-surface p-6"
      >
        <h1 className="text-xl font-semibold tracking-tight">Sign in to ShopEasy</h1>
        <p className="mt-1 text-sm text-muted">
          Orders, messages and checkout require an account.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>

        <div className="mt-5 rounded-lg border border-line bg-surface-2 p-3 text-xs">
          <p className="font-medium">Demo credentials</p>
          <p className="mt-1 font-mono text-muted">testuser@example.com</p>
          <p className="font-mono text-muted">Password123!</p>
          <p className="mt-2 text-faint">
            Entirely fictional. Never enter real credentials into a practice app.
          </p>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Want to practise a registration form instead?{" "}
        <Link href="/practice/registration" className="text-info underline">
          Open the registration app
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={<p className="text-center text-sm text-muted">Loading…</p>}
    >
      <LoginForm />
    </React.Suspense>
  );
}

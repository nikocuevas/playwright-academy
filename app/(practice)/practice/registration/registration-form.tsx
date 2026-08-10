"use client";

import * as React from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { cn, pseudoId, pseudoToken, seededRandom } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  emptyRegistrationValues,
  registrationFields,
  validateRegistration,
  type RegistrationValues,
} from "@/lib/practice/registration-fields";

/**
 * The Registration practice app.
 *
 * Every field is rendered with a regenerated `id` and `data-session` token so
 * tests built on those attributes break — which is the whole point. The label,
 * `name` and `data-testid` are stable on purpose.
 */
export function RegistrationForm() {
  const [seed, setSeed] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<RegistrationValues>({
    ...emptyRegistrationValues,
  });
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [registered, setRegistered] = React.useState<string | null>(null);

  // Generated only on the client, after hydration, so server and client markup
  // agree on the first render.
  React.useEffect(() => {
    setSeed(Math.floor(Math.random() * 1_000_000));
  }, []);

  const attributes = React.useMemo(() => {
    if (seed === null) return null;
    const random = seededRandom(seed);
    const map: Record<string, { id: string; session: string }> = {};
    for (const field of registrationFields) {
      map[field.name] = { id: pseudoId("input", random), session: pseudoToken(random) };
    }
    map.terms = { id: pseudoId("input", random), session: pseudoToken(random) };
    map.submit = { id: pseudoId("btn", random), session: pseudoToken(random) };
    return map;
  }, [seed]);

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateRegistration(values, acceptedTerms);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // A short async submit, so learners must assert rather than assume.
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmitting(false);
    setRegistered(values.firstName);
  }

  function resetForm() {
    setValues({ ...emptyRegistrationValues });
    setAcceptedTerms(false);
    setErrors({});
    setRegistered(null);
    setSeed(Math.floor(Math.random() * 1_000_000));
  }

  if (registered) {
    return (
      <div
        className="rounded-xl border border-accent/40 bg-accent-soft p-8 text-center"
        data-testid="registration-success"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-accent">
          Registration successful!
        </h1>
        <p className="mt-2 text-lg" data-testid="registration-welcome">
          Welcome, {registered}.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Nothing was stored anywhere — this account exists only in your browser
          for the duration of this page.
        </p>
        <Button className="mt-6" onClick={resetForm}>
          Register another account
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Registration"
      className="rounded-xl border border-line bg-surface p-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">
            All fields marked required must be completed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSeed(Math.floor(Math.random() * 1_000_000))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Regenerate attributes
        </button>
      </div>

      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {registrationFields.map((field) => {
          const generated = attributes?.[field.name];
          const error = errors[field.name];
          const errorId = generated ? `${generated.id}-error` : undefined;
          const hintId = generated ? `${generated.id}-hint` : undefined;

          const common = {
            id: generated?.id,
            name: field.name,
            "data-session": generated?.session,
            "data-testid": `registration-${field.name.toLowerCase()}`,
            "aria-required": field.required || undefined,
            "aria-invalid": error ? true : undefined,
            "aria-describedby":
              [error ? errorId : null, field.hint ? hintId : null]
                .filter(Boolean)
                .join(" ") || undefined,
            className: cn(
              "h-10 w-full rounded-lg border bg-surface px-3 text-sm outline-none transition",
              error
                ? "border-danger focus:border-danger"
                : "border-line focus:border-accent",
            ),
          };

          if (field.type === "radio") {
            return (
              <fieldset
                key={field.name}
                className="mb-4 sm:col-span-2"
                aria-describedby={hintId}
              >
                <legend className="mb-1.5 text-sm font-medium">{field.label}</legend>
                <div className="flex flex-wrap gap-4">
                  {(field.options ?? []).map((option) => {
                    const optionId = generated
                      ? `${generated.id}-${option.value}`
                      : undefined;
                    return (
                      <label
                        key={option.value}
                        htmlFor={optionId}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          id={optionId}
                          name={field.name}
                          value={option.value}
                          checked={values[field.name] === option.value}
                          onChange={() => update(field.name, option.value)}
                          data-session={generated?.session}
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          }

          return (
            <div
              key={field.name}
              className={cn("mb-4", field.half ? "sm:col-span-1" : "sm:col-span-2")}
            >
              {/* The required marker sits outside the <label> so the accessible
                  name stays exactly "Password" rather than "Password *". */}
              <div className="mb-1.5 flex items-baseline gap-1">
                <label htmlFor={generated?.id} className="text-sm font-medium">
                  {field.label}
                </label>
                {field.required && (
                  <span className="text-danger" aria-hidden>
                    *
                  </span>
                )}
              </div>

              {field.type === "select" ? (
                <select
                  {...common}
                  value={values[field.name] ?? ""}
                  onChange={(e) => update(field.name, e.target.value)}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...common}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  value={values[field.name] ?? ""}
                  onChange={(e) => update(field.name, e.target.value)}
                />
              )}

              {field.hint && !error && (
                <p id={hintId} className="mt-1 text-xs text-faint">
                  {field.hint}
                </p>
              )}

              {error && (
                <p id={errorId} role="alert" className="mt-1 text-xs text-danger">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 border-t border-line pt-4">
        <label
          htmlFor={attributes?.terms.id}
          className="flex items-start gap-2.5 text-sm"
        >
          <input
            type="checkbox"
            id={attributes?.terms.id}
            name="terms"
            data-session={attributes?.terms.session}
            data-testid="registration-terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            I accept the{" "}
            <span className="text-info underline underline-offset-2">
              Terms and Conditions
            </span>
          </span>
        </label>
        {errors.terms && (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {errors.terms}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          id={attributes?.submit.id}
          data-session={attributes?.submit.session}
          disabled={submitting}
        >
          {submitting ? "Registering…" : "Register"}
        </Button>
        <Button type="button" variant="ghost" onClick={resetForm}>
          Clear form
        </Button>
        {Object.keys(errors).length > 0 && (
          <span role="status" className="text-xs text-danger">
            {Object.keys(errors).length} field
            {Object.keys(errors).length === 1 ? "" : "s"} need attention
          </span>
        )}
      </div>
    </form>
  );
}

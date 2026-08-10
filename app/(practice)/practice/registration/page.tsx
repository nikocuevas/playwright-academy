import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/code-block";
import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
  title: "Registration",
  description:
    "A registration form with regenerated ids and full client-side validation, built for locator practice.",
};

const stableHooks = `// These change on every render — never build a locator on them:
//   id="input-837462"
//   data-session="a83jd92"

// These are stable:
await page.getByLabel('Email').fill('ada@example.com');
await page.locator('input[name="email"]').fill('ada@example.com');
await page.getByTestId('registration-email').fill('ada@example.com');`;

export default function RegistrationPracticePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <RegistrationForm />

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">What to practise here</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• Locating fields without their generated ids</li>
              <li>• fill, check, selectOption on every control type</li>
              <li>• Client-side validation and error messages</li>
              <li>• Asserting an asynchronous success state</li>
            </ul>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">Stable vs. unstable hooks</h2>
            <p className="mt-1.5 text-sm text-muted">
              Press <strong>Regenerate attributes</strong> and watch the ids
              change. Anything you locate by id was correct for exactly one
              render.
            </p>
            <CodeBlock code={stableHooks} className="mt-3" />
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">Validation rules</h2>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="font-medium">Email</dt>
                <dd className="text-muted">Must look like an email address.</dd>
              </div>
              <div>
                <dt className="font-medium">Phone</dt>
                <dd className="text-muted">Optional; 10–15 digits when given.</dd>
              </div>
              <div>
                <dt className="font-medium">Password</dt>
                <dd className="text-muted">
                  8+ characters with at least one letter and one number.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Confirm Password</dt>
                <dd className="text-muted">Must match the password exactly.</dd>
              </div>
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd className="text-muted">Must be at least 18 years ago.</dd>
              </div>
              <div>
                <dt className="font-medium">Terms</dt>
                <dd className="text-muted">Must be accepted.</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}

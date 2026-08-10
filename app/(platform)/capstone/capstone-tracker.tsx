"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn, percent } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CodeBlock } from "@/components/ui/code-block";
import { capstoneAreas, capstoneTasks } from "@/content/capstone";
import { progressStore, useHydrated, useProgress } from "@/lib/progress";

const structure = `playwright/
├── pages/
│   ├── LoginPage.ts
│   ├── RegistrationPage.ts
│   ├── ShopPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── OrdersPage.ts
│   └── MessagesPage.ts
├── fixtures/
│   └── test.ts
├── test-data/
│   ├── users.ts
│   └── products.ts
└── .auth/                 (gitignored)

tests/
├── auth.setup.ts
├── registration/
├── authentication/
├── shopping/
├── checkout/
├── orders/
├── messages/
├── api/
└── network/

playwright.config.ts`;

export function CapstoneTracker() {
  const progress = useProgress();
  const hydrated = useHydrated();

  const done = capstoneTasks.filter((task) => progress.capstone[task.id]).length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface p-5">
        <ProgressBar
          value={hydrated ? percent(done, capstoneTasks.length) : 0}
          label="Capstone progress"
          sublabel={`${hydrated ? done : 0} of ${capstoneTasks.length} deliverables`}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Work against your local copy of this platform. Start the app with{" "}
          <code className="rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[12.5px]">
            npm run dev
          </code>{" "}
          and point your framework at{" "}
          <code className="rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[12.5px]">
            http://localhost:3000
          </code>
          . The brief and acceptance criteria live in the{" "}
          <Link href="/learn/capstone" className="text-info underline">
            Capstone module
          </Link>
          .
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {capstoneAreas.map((area) => (
            <section key={area}>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                {area}
              </h2>
              <ul className="space-y-2">
                {capstoneTasks
                  .filter((task) => task.area === area)
                  .map((task) => {
                    const complete = hydrated && Boolean(progress.capstone[task.id]);
                    return (
                      <li
                        key={task.id}
                        className={cn(
                          "rounded-xl border bg-surface p-4 transition",
                          complete ? "border-accent/40" : "border-line",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => progressStore.toggleCapstone(task.id)}
                          aria-pressed={complete}
                          className="flex w-full items-start gap-3 text-left"
                        >
                          {complete ? (
                            <CheckCircle2
                              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent"
                              aria-hidden
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-line-strong"
                              aria-hidden
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{task.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted">
                              {task.description}
                            </p>
                          </div>
                        </button>

                        <ul className="mt-3 space-y-1 border-t border-line pt-3">
                          {task.acceptance.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-[13px] text-muted"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">Target structure</h2>
            <pre className="scrollbar-thin mt-3 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-muted">
              {structure}
            </pre>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">Commands you will need</h2>
            <CodeBlock
              language="bash"
              code={`npm run dev
npx playwright install
npx playwright test
npx playwright test --ui
npx playwright show-report`}
              className="mt-2"
            />
          </section>

          <section className="rounded-xl border border-accent/30 bg-accent-soft p-5">
            <h2 className="text-sm font-semibold text-accent">Self-review</h2>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              <li>• Could a new engineer add a test without reading every file?</li>
              <li>• If a button label changes, how many files do you edit?</li>
              <li>• Does any test depend on another having run first?</li>
              <li>• Does each failure explain itself without opening a trace?</li>
              <li>• Would it still pass if the product ids were regenerated?</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Database,
  ListChecks,
  Radio,
  Rocket,
  Scale,
  ShieldCheck,
  Terminal,
  Timer,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { modules, allLessons, totalQuizQuestions } from "@/content/modules";
import { challenges } from "@/content/challenges";
import { sqlExercises } from "@/content/sql-exercises";
import { scenarios } from "@/lib/playwright-simulator/scenarios";
import { formatNumber } from "@/lib/utils";

const stats = [
  { value: `${modules.length}`, label: "Modules" },
  { value: `${allLessons.length}`, label: "Lessons" },
  { value: `${challenges.length}`, label: "Challenges" },
  { value: `${scenarios.length}`, label: "Playground scenarios" },
  { value: `${sqlExercises.length}`, label: "SQL exercises" },
  { value: `${formatNumber(totalQuizQuestions)}`, label: "Quiz questions" },
];

const roadmap = [
  "JavaScript / TypeScript",
  "Playwright Fundamentals",
  "Locators",
  "Actions",
  "Assertions",
  "Waiting",
  "Registration Practice",
  "Authentication & storageState",
  "Page Object Model",
  "Fixtures",
  "API Testing",
  "Network Interception",
  "ShopEasy E2E",
  "SQL for Testers",
  "Capstone",
];

const features = [
  {
    icon: Braces,
    title: "An interactive Playwright playground",
    body: "Write real Playwright syntax and watch a simulated browser respond, step by step, with Playwright-shaped error messages when you get it wrong.",
    href: "/playground",
    cta: "Open the playground",
  },
  {
    icon: ListChecks,
    title: "A registration app that fights back",
    body: "Ids, session tokens and class names are regenerated on every render, so only stable locators survive. Full client-side validation to test against.",
    href: "/practice/registration",
    cta: "Open the form",
  },
  {
    icon: Rocket,
    title: "ShopEasy, a complete e-commerce app",
    body: "Login, search, cart, checkout, order history and support messaging — with an API behind it, so you can practise hybrid API + UI testing.",
    href: "/practice/shop",
    cta: "Open ShopEasy",
  },
  {
    icon: Database,
    title: "A SQL lab with real bugs in the data",
    body: "Seven tables, an in-browser SQL engine, and deliberately seeded inconsistencies — a cancelled order with a completed payment, orphaned rows, a wrong total.",
    href: "/practice/sql",
    cta: "Open SQL Lab",
  },
  {
    icon: Radio,
    title: "API and network interception",
    body: "Validate endpoints with the request fixture, mock empty and error states with page.route, and assert on the payloads the UI actually sends.",
    href: "/learn/network-interception",
    cta: "Read the module",
  },
  {
    icon: Timer,
    title: "Waiting strategies, properly",
    body: "Auto-waiting, locator waits, URL and response waits — plus an honest account of why fixed timeouts keep appearing and why they should not.",
    href: "/learn/waiting",
    cta: "Read the module",
  },
];

const sampleTest = `import { test, expect } from '@playwright/test';

test('customer completes a purchase', async ({ page }) => {
  await page.goto('/practice/shop');

  const product = page
    .getByRole('article')
    .filter({ hasText: 'Wireless Headphones' });

  await product.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  await page.goto('/practice/shop/checkout');
  await page.getByRole('button', { name: 'Place Order' }).click();

  await expect(
    page.getByRole('heading', { name: 'Order Successful!' }),
  ).toBeVisible();
});`;

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-tight">
              Playwright Academy
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-5 text-sm text-muted md:flex">
            <Link href="/learn" className="hover:text-fg">
              Curriculum
            </Link>
            <Link href="/playground" className="hover:text-fg">
              Playground
            </Link>
            <Link href="/practice/shop" className="hover:text-fg">
              Practice apps
            </Link>
            <Link href="/practice/sql" className="hover:text-fg">
              SQL Lab
            </Link>
            <Link href="/cheat-sheet" className="hover:text-fg">
              Cheat sheets
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/dashboard" size="sm">
              Dashboard
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
              Free, open source, and deployable to Vercel in one click
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Master Playwright with{" "}
              <span className="text-accent">JavaScript &amp; TypeScript</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
              Learn modern browser automation by writing real tests against
              realistic applications — then validate the API and the data
              underneath them.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/learn" size="lg">
                Start Learning
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/playground" size="lg" variant="outline">
                <Terminal className="h-4 w-4" aria-hidden />
                Open Playground
              </ButtonLink>
            </div>
          </div>

          <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-4 py-5 text-center">
                <dt className="order-2 mt-1 text-[11px] uppercase tracking-wider text-faint">
                  {stat.label}
                </dt>
                <dd className="order-1 font-mono text-2xl font-semibold text-accent">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Not a documentation site
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Everything here is something you operate: a simulator you drive, apps
          you automate, a database you query.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40 hover:shadow-[var(--shadow-md)]"
              >
                <Icon className="h-5 w-5 text-accent" aria-hidden />
                <h3 className="mt-3 text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {feature.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {feature.cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------- code + QA */}
      <section className="border-y border-line bg-surface-2/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Write the test. Watch it run.
            </h2>
            <p className="mt-3 text-muted">
              The playground interprets a useful subset of the Playwright API
              against a simulated application, updates a simulated browser as it
              goes, and fails the way Playwright fails — strict mode violations,
              call logs, expected/received.
            </p>
            <p className="mt-3 text-muted">
              The same tests then run for real:{" "}
              <code className="rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[13px]">
                npx playwright test
              </code>{" "}
              drives Chromium against the very same practice apps.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/playground" variant="primary">
                Try the simulator
              </ButtonLink>
              <ButtonLink href="/learn/e2e-automation" variant="outline">
                See the E2E module
              </ButtonLink>
            </div>
          </div>

          <div>
            <CodeBlock
              code={sampleTest}
              title="tests/shopping/checkout.spec.ts"
              className="my-0"
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- QA triangle */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Test beyond the UI
            </h2>
            <p className="mt-3 text-muted">
              A green UI test proves the front end rendered a success state. It
              does not prove the order was stored, that its total matches its line
              items, or that the payment was recorded against the right order.
            </p>
            <p className="mt-3 text-muted">
              Playwright Academy teaches all three layers, because that is where
              the interesting defects live.
            </p>
          </div>

          <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-6 font-mono text-[12.5px] leading-relaxed text-muted">
{`                 QA VALIDATION
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
       UI            API        DATABASE
        │             │             │
   Playwright     API tests        SQL
        │             │             │
        └─────────────┼─────────────┘
                      ↓
              End-to-end confidence`}
          </pre>
        </div>
      </section>

      {/* ---------------------------------------------------------- roadmap */}
      <section className="border-t border-line bg-surface-2/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            The learning path
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Beginner → Playwright user → E2E automation engineer → advanced QA
            automation engineer.
          </p>

          <ol className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <ButtonLink href="/learn" size="lg">
              Start with module 1
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ honest */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-xl border border-warn/35 bg-warn-soft p-6">
          <h2 className="text-[15px] font-semibold text-warn">
            What is simulated, and what is real
          </h2>
          <div className="mt-3 grid gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="font-medium">Simulated</p>
              <ul className="mt-2 space-y-1 text-muted">
                <li>• The browser playground runs an educational Playwright interpreter, not a real browser.</li>
                <li>• Accounts, payments and orders are fictional and held in memory.</li>
                <li>• The SQL Lab queries a fixed in-memory dataset, not a database.</li>
                <li>• Progress is stored in your browser&apos;s localStorage and can be cleared.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Real</p>
              <ul className="mt-2 space-y-1 text-muted">
                <li>• The practice applications are real web apps you can automate.</li>
                <li>• The repository ships a real Playwright suite: <code className="font-mono">npx playwright test</code>.</li>
                <li>• The API routes are real HTTP endpoints for API testing.</li>
                <li>• The SQL engine really parses and executes your queries.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span>Playwright Academy — an open-source QA automation training platform.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/glossary" className="hover:text-fg">
              Glossary
            </Link>
            <Link href="/api-reference" className="hover:text-fg">
              API reference
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-4 w-4" aria-hidden />
              MIT licensed
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

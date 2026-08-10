# Playwright Academy

**Interactive Playwright JS/TS & QA Automation Training Platform**

An interactive learning and practice platform for QA automation engineers to learn
Playwright with JavaScript and TypeScript — through coding exercises, a simulated
browser you actually drive, realistic end-to-end applications, API testing and SQL
data-validation exercises.

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![React](https://img.shields.io/badge/React-19-61dafb)
![Playwright](https://img.shields.io/badge/Playwright-Test-2ead33)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088ff)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Why this project exists](#why-this-project-exists)
- [Features](#features)
- [Learning path](#learning-path)
- [Interactive Playwright Playground](#interactive-playwright-playground)
- [Practice applications](#practice-applications)
- [SQL for Testers](#sql-for-testers)
- [UI / API / database validation](#ui--api--database-validation)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running the Playwright tests](#running-the-playwright-tests)
- [Debugging](#debugging)
- [Environment variables](#environment-variables)
- [Authentication and storageState](#authentication-and-storagestate)
- [Testing strategy](#testing-strategy)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Simulator architecture](#simulator-architecture)
- [Limitations](#limitations)
- [Security](#security)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [What this project demonstrates](#what-this-project-demonstrates)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Playwright Academy is not a documentation site. Everything in it is something you
operate:

| Surface | What it is |
| --- | --- |
| **Curriculum** | 16 modules, 70 lessons, 88 quiz questions (~16 hours) |
| **Playwright Playground** | A Playwright interpreter that runs your code against a simulated browser |
| **Registration app** | A form with regenerated ids and full client-side validation |
| **ShopEasy** | A complete e-commerce app — login, cart, checkout, orders, messaging |
| **SQL Lab** | An in-browser SQL engine over a seven-table dataset with seeded data bugs |
| **Challenges** | 20 exercises, 14 of them runnable in the playground |
| **Capstone** | A 12-part brief to build a production-shaped automation framework |
| **Reference** | 31 API entries, 10 cheat sheets, 30 glossary terms, a decision helper |

The repository also contains a **real Playwright suite** (136 tests) that runs
against the practice applications with `npx playwright test`.

---

## Why this project exists

Playwright's documentation teaches the API very well. What it cannot do is give
you an application to break.

Most people learning browser automation get stuck at the same points: their
locators work once and fail after a deploy; their tests pass locally and are
flaky in CI; they can drive a UI but have no idea how to check whether the data
underneath it is correct. Those problems need a system under test, not more
reference material.

So this platform ships the applications too — deliberately awkward ones. The
registration form regenerates its ids on every render. The product grid has six
identical *Add to Cart* buttons. Checkout is asynchronous. Order numbers are
generated, so they have to be captured at runtime. The SQL dataset contains a
cancelled order with a completed payment, an orphaned line item and an order
total that disagrees with its line items.

The SQL lab is there because QA engineers are regularly asked to prove what the
application actually stored, and "the confirmation page said it worked" is not a
proof.

---

## Features

### Playwright

- JavaScript and TypeScript for test code — the subset that actually appears in suites
- An interactive Playwright simulator with a simulated browser preview
- Locators: `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`, CSS, XPath
- Chaining, `filter({ hasText })`, `filter({ has })`, `first`/`last`/`nth`
- Actions: click, fill, check, selectOption, press, hover, drag, file upload
- Web-first assertions, soft assertions, `expect.poll`, `expect.toPass`
- Auto-waiting, explicit waits, network waits, and why fixed timeouts fail
- Browser / BrowserContext / Page and test isolation
- Authentication with a setup project and `storageState`
- Page Object Model — including when it becomes over-engineering
- Fixtures: built-in, custom, scopes, options, ordering
- API testing with `APIRequestContext`, and hybrid API + UI strategy
- Network interception: `route.fulfill`, `continue`, `abort`, HAR replay
- Debugging: UI mode, the Inspector, `page.pause()`, the trace viewer, reporters
- Multi-browser projects and CI configuration

### Practice applications

- **Registration** — dynamic ids, `data-session` tokens, ten fields, six validation rules
- **ShopEasy** — authentication, search, filtering, sorting, cart, checkout, orders, messaging
- A real REST API behind both, so `page.route()` interception genuinely changes what renders

### SQL

- Interactive SQL editor with syntax highlighting and a schema explorer
- `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `DISTINCT`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`
- `JOIN`, `LEFT JOIN`, `GROUP BY`, `HAVING`, aggregates, aliases, subqueries
- 14 exercises ending in real QA data-validation scenarios

### Learning

- Lessons with objectives, worked examples, common mistakes and key takeaways
- Quizzes: multiple choice, true/false, code interpretation, find-the-bug, best-locator
- Progressive hints and full solutions on every challenge
- Progress tracking with export/import
- Global search (`⌘K`) across lessons, APIs, SQL, challenges and the glossary
- Light and dark themes, keyboard navigation, semantic HTML throughout

---

## Learning path

```text
JavaScript / TypeScript
        ↓
Playwright Fundamentals
        ↓
Locators
        ↓
Actions
        ↓
Assertions
        ↓
Waiting
        ↓
Registration Practice
        ↓
Authentication & storageState
        ↓
Page Object Model
        ↓
Fixtures
        ↓
API Testing
        ↓
Network Interception
        ↓
ShopEasy E2E
        ↓
Debugging & Tooling
        ↓
SQL for Testers
        ↓
Capstone
```

**After the foundations** you can read any Playwright test and know why each line
is there.
**After the core modules** you can automate a form or a shopping flow without
writing a single fixed wait.
**After the architecture modules** you can structure a suite other people can
contribute to.
**After the integration modules** you can decide which layer an assertion belongs
at — and prove the data is right, not just the screen.

---

## Interactive Playwright Playground

The browser-based playground provides an **educational Playwright simulation**.
Learners write commands such as:

```ts
await page.goto('/practice/shop/login');

await page.getByLabel('Email').fill('testuser@example.com');
await page.getByLabel('Password').fill('Password123!');

await page.getByRole('button', { name: 'Sign In' }).click();

await expect(page.getByText('Welcome back, Test User')).toBeVisible();
```

The simulator:

- **parses** the supported subset of Playwright syntax, including chained
  locators, options objects and regular expressions;
- **executes** the commands against a simulated application state;
- **updates** the simulated browser panel so you watch fields fill, checkboxes
  tick and pages navigate;
- **logs** every step on a timeline you can click to scrub back through the run;
- **fails like Playwright does** — strict mode violations, call logs,
  expected/received, and a list of what actually exists on the page;
- runs entirely in the browser, so nothing needs installing to start.

A real failure from the playground:

```text
✕ Test failed

locator.click: Timeout 5000ms exceeded.

LOCATOR
getByRole('button', { name: 'Loginn' })

REASON
No matching element found.

CALL LOG
  - waiting for getByRole('button', { name: 'Loginn' })
  -   locator resolved to 0 elements
  -   retrying…

AVAILABLE ON THE PAGE
- Sign In
```

### Real Playwright

The repository also contains an actual Playwright suite that drives Chromium
against the same practice applications:

```bash
npx playwright test
```

**The two are clearly labelled everywhere in the UI.** The playground badge reads
*Interactive simulation*; examples that need a real browser — the `request`
fixture, `page.route()` — are marked *Reference only — run this with real
Playwright* and are not executed by the simulator. The platform never claims the
playground is running a real browser.

---

## Practice applications

### Registration — `/practice/registration`

Teaches locators, dynamic attributes, form interaction, validation and
assertions.

Every field renders like this, with the `id` and `data-session` regenerated on
each render (there is a **Regenerate attributes** button so you can watch it
happen):

```html
<label for="input-837462">Email</label>
<input
  id="input-837462"
  data-session="a83jd92"
  data-testid="registration-email"
  name="email"
  type="email"
/>
```

Stable hooks: the label, `name`, `data-testid` and the accessible role.
Unstable hooks: `id`, `data-session`, class names.

### ShopEasy — `/practice/shop`

A complete e-commerce application for end-to-end work:

| Route | Covers |
| --- | --- |
| `/practice/shop/login` | Authentication, error states, redirects |
| `/practice/shop` | Search, category filter, sorting, loading and error states |
| `/practice/shop/product/[id]` | Product detail, quantity selection |
| `/practice/shop/cart` | Line items, quantity changes, removal, totals |
| `/practice/shop/checkout` | Shipping, simulated payment, validation, confirmation |
| `/practice/shop/orders` | Order history, statuses, cancellation |
| `/practice/shop/messages` | Support messaging tied to an order |

Demo credentials (entirely fictional): `testuser@example.com` / `Password123!`

The pages fetch from the platform's own REST API, which is what makes the
interception exercises real — mock `/api/products` and the grid genuinely
changes.

---

## SQL for Testers

**`/practice/sql`** — an interactive SQL lab that is intentionally simulated.

SQL Lab uses a fixed sample dataset and an in-memory SQL execution layer. It does
not require PostgreSQL, MySQL or any external database. That keeps the training
environment free, portable, deterministic and trivial to deploy — and it means
every learner's query returns exactly the same rows, so exercises can be checked
automatically.

```sql
SELECT
    u.first_name,
    o.id    AS order_id,
    o.total
FROM users u
JOIN orders o ON o.user_id = u.id
ORDER BY o.total DESC;
```

Seven tables: `users`, `products`, `orders`, `order_items`, `payments`,
`addresses`, `messages`.

The data contains deliberate defects for the QA validation exercises to find:

```sql
-- Orders that were cancelled but still charged
SELECT o.id, o.status, p.status, p.amount
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.status = 'cancelled' AND p.status = 'completed';
```

---

## UI / API / database validation

```text
                 QA VALIDATION
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
       UI            API        DATABASE
        │             │             │
   Playwright     API tests        SQL
        │             │             │
        └─────────────┼─────────────┘
                      ↓
              End-to-end confidence
```

A green UI test proves the front end rendered a success state. It does not prove
the order was persisted, that its total matches its line items, or that the
payment was recorded against the right order. The platform teaches all three
layers because that is where the expensive defects live.

---

## Technology stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4,
Lucide icons

**Testing** — Playwright Test (browser suite, API suite and pure unit tests for
the engines)

**Simulation** — a custom Playwright interpreter, an in-memory application state
machine, and a hand-written SQL engine (tokenizer → recursive-descent parser →
executor)

**Tooling** — ESLint, TypeScript, GitHub Actions

**Deployment** — Vercel

No database, no authentication provider, no paid services, no Docker.

---

## Architecture

```text
Presentation layer      app/ + components/
        ↓
Training content        content/           (data, not JSX)
        ↓
Practice applications   app/(practice)/ + app/api/
        ↓
Simulation engines      lib/playwright-simulator/ + lib/sql-engine/
        ↓
Local state / mock data localStorage + in-memory server store
```

**UI** renders lessons, navigation, the playground, progress and challenges. It
holds no educational content of its own.

**Content** is plain TypeScript data. Because lessons are data rather than JSX,
they can be counted, searched, cross-referenced and re-rendered by any surface —
the lesson page, the search index and the dashboard all read the same objects.

**Simulation engines** are pure and framework-free. Neither the Playwright
simulator nor the SQL engine imports React, which is why both are covered by fast
unit tests.

**Practice applications** provide realistic DOM structures and workflows, backed
by real API routes.

---

## Project structure

```text
playwright-academy/
├── app/
│   ├── (platform)/          Training platform routes (dashboard, learn, playground…)
│   ├── (practice)/          The applications under test
│   ├── api/                 REST endpoints for the practice apps
│   ├── layout.tsx
│   └── page.tsx             Landing page
├── components/
│   ├── ui/                  Button, Card, Badge, Callout, Tabs, CodeBlock…
│   ├── lesson/              Section renderer, quiz, progress controls
│   ├── playground/          Code editor, simulated browser, execution timeline
│   ├── shop/                ShopEasy chrome and client state
│   └── sql/                 SQL editor, results grid, schema explorer
├── content/
│   ├── modules/             16 modules of lessons (module-01…module-16)
│   ├── challenges.ts
│   ├── sql-exercises.ts
│   ├── cheat-sheets.ts
│   ├── api-reference.ts
│   ├── glossary.ts
│   ├── which-api.ts
│   └── capstone.ts
├── lib/
│   ├── playwright-simulator/  Parser, locator engine, actions, assertions, runner
│   ├── sql-engine/            Tokenizer, parser, executor, dataset
│   ├── practice/              Shared practice-app data and the server store
│   ├── progress.ts            localStorage progress store
│   └── search.ts              Global search index
├── playwright/
│   ├── pages/                 Page objects for the real test suite
│   ├── fixtures/              Custom fixtures
│   ├── test-data/             Test data factories
│   └── .auth/                 storageState (gitignored)
├── tests/
│   ├── unit/                  Simulator and SQL engine unit tests
│   ├── registration/  authentication/  shopping/  checkout/
│   ├── orders/  messages/  api/  network/
│   ├── auth.setup.ts
│   └── platform.spec.ts       Smoke coverage for the platform itself
├── docs/
│   ├── architecture.md
│   ├── playwright-simulator.md
│   ├── testing-strategy.md
│   └── sql-lab.md
├── .github/workflows/ci.yml
├── playwright.config.ts
├── DEPLOYMENT.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Getting started

```bash
git clone <repository-url>
cd playwright-academy

npm install
npx playwright install
npm run dev
```

Then open <http://localhost:3000>.

| Command | What it does |
| --- | --- |
| `npm install` | Installs the application and test dependencies |
| `npx playwright install` | Downloads the browser binaries (separate from the npm package) |
| `npm run dev` | Starts the platform and the practice applications |

No `.env` file is required. Nothing is configured. It just runs.

---

## Running the Playwright tests

```bash
npx playwright test                       # everything
npx playwright test tests/shopping        # one folder
npx playwright test --project=unit        # simulator + SQL engine, no browser
npx playwright test --ui                  # interactive UI mode
npx playwright test --debug               # step through with the Inspector
npx playwright test -g "add to cart"      # filter by title
npx playwright show-report                # open the HTML report
```

The config starts the dev server for you when `BASE_URL` is unset, so the suite
runs from a clean checkout with no manual steps.

The suite is split into four projects:

| Project | Contents |
| --- | --- |
| `unit` | Pure tests for the Playwright simulator and the SQL engine — no browser |
| `setup` | Signs in once and writes `playwright/.auth/user.json` |
| `public` | Tests that must run signed out: login, registration, redirects |
| `chromium` | The authenticated suite, depending on `setup` |

---

## Debugging

```bash
npx playwright test --ui                     # watch mode with a time-travel timeline
npx playwright test --debug                  # Playwright Inspector
npx playwright test --headed --slow-mo=500   # watch it happen
npx playwright test --repeat-each=20         # reproduce flakiness
npx playwright show-trace test-results/**/trace.zip
npx playwright codegen http://localhost:3000/practice/registration
```

Traces are recorded on the first retry (`trace: 'on-first-retry'`), screenshots
on failure, video retained on failure.

---

## Environment variables

Copy `.env.example` if you want to change anything — nothing is required.

```text
BASE_URL=http://localhost:3000
```

To run the same suite against a deployed environment:

```bash
BASE_URL=https://your-app.vercel.app npx playwright test
```

When `BASE_URL` is set, the config does **not** start a local dev server.

---

## Authentication and storageState

```text
Login once (tests/auth.setup.ts)
        ↓
Assert the session actually exists
        ↓
context.storageState({ path: 'playwright/.auth/user.json' })
        ↓
Every project applies it with use: { storageState }
        ↓
Tests start already authenticated
```

The real setup file in this repository:

```ts
setup("authenticate", async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login(validUser.email, validUser.password);
  await login.expectSignedIn(validUser.fullName);   // assert BEFORE saving

  await expect(page).toHaveURL(/\/practice\/shop$/);

  // Keep the identity cookie, drop the per-context data cookie, so every test
  // starts signed in but with its own empty cart.
  await page.context().clearCookies({ name: "shopeasy_session" });

  await page.context().storageState({ path: authFile });
});
```

Two details worth copying into your own suites:

1. **Assert before saving.** Calling `storageState()` straight after the click
   can capture the state before the session cookie is set, producing a file that
   looks valid and authenticates nothing.
2. **Separate identity from per-test data.** ShopEasy issues two cookies on
   purpose. If a single cookie carried both the login *and* the cart, every
   parallel worker sharing one `storageState` would fight over the same cart —
   the classic shared-account flakiness. This suite hit exactly that failure
   during development, and the split is the fix.

`playwright/.auth/` is gitignored. That file is a live credential.

---

## Testing strategy

The repository intentionally demonstrates several testing layers.

| Layer | Location | What it covers |
| --- | --- | --- |
| **Unit** | `tests/unit/` | The Playwright simulator (parser, locators, actions, assertions, errors) and the SQL engine (joins, aggregates, subqueries, NULL semantics). No browser, milliseconds to run. |
| **API** | `tests/api/` | Products, auth, cart and orders endpoints — shapes, filters, error codes, and the order-total reconciliation. |
| **E2E** | `tests/registration/`, `shopping/`, `checkout/`, `orders/`, `messages/` | The real user journeys through Chromium. |
| **Network** | `tests/network/` | Mocked empty, error and slow states; response modification; request-payload assertions. |
| **Platform** | `tests/platform.spec.ts` | The training platform itself: routes render, the playground executes and fails correctly, the SQL Lab returns rows. |

Conventions the suite follows:

- No `waitForTimeout` anywhere.
- No locator built on a generated id, hashed class or session token.
- Every scenario solution and every SQL exercise solution is asserted in CI, so
  the teaching material cannot silently rot.
- Preconditions are seeded through the API; the behaviour under test always goes
  through the UI.

---

## CI/CD

```text
Pull request / push
        ↓
npm ci
        ↓
TypeScript  →  ESLint  →  next build
        ↓
npx playwright install --with-deps
        ↓
npx playwright test
        ↓
Upload the HTML report (always)
```

The workflow lives at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and
runs two jobs: `quality` (typecheck, lint, build) and `test` (the Playwright
suite). The HTML report is uploaded with `if: always()`, because you need it
precisely when the job failed.

---

## Deployment

```text
GitHub  →  Import the repository into Vercel  →  Deploy
```

Vercel detects Next.js automatically. There is nothing to configure: no database,
no environment variables, no external services. Full instructions are in
[DEPLOYMENT.md](DEPLOYMENT.md).

**Works in the deployed environment:** the whole training platform, lessons,
quizzes, the playground simulator, the Registration app, ShopEasy, the API
routes, the SQL Lab and progress tracking.

**Requires local execution:** the real Playwright browser suite
(`npx playwright test`), UI mode, codegen and the trace viewer.

---

## Simulator architecture

`lib/playwright-simulator/` is a small, framework-free interpreter:

```text
your code
    ↓
parser.ts        statements → chains of calls (strings, regexes, objects)
    ↓
runner.ts        orchestrates execution, keeps variables, logs steps
    ↓
locator.ts       resolves getBy*/locator/filter/nth against the node tree
    ↓
actions.ts       click, fill, check, selectOption… → state transitions
assertions.ts    web-first matchers → pass/fail with expected vs. received
    ↓
app-state.ts     reducer holding the simulated application state
screens.ts       pure render(state) → node tree
    ↓
SimulatedBrowser renders the node tree, highlights the resolved element
```

Full details — supported APIs, locator resolution, the error model and the
deliberate limitations — are in
[docs/playwright-simulator.md](docs/playwright-simulator.md).

---

## Limitations

These are real, and the UI says so where it matters.

**Playwright simulator.** It implements an educational subset of the Playwright
API, not the whole thing. Network interception, the `request` fixture, multiple
contexts, file uploads, drag and drop and tracing are not simulated — examples
using them are labelled *Reference only* and are meant to be run locally.

**Authentication.** Entirely simulated, one fictional account, checked in plain
text against an in-memory record. It is a training target, not a reference
implementation.

**SQL.** The engine runs against a fixed in-memory dataset. It supports the
`SELECT` surface the curriculum teaches; it is read-only and rejects `INSERT`,
`UPDATE` and `DELETE` with an explanation.

**Persistence.** Practice data lives in memory on the server and resets when it
restarts. On Vercel's serverless runtime it is also not shared between
instances, so a cart may appear empty after an idle period. Learning progress
lives in `localStorage`, so it is per-browser and can be cleared — there is an
export/import button on the Progress page.

**E-commerce.** No payment processing, no real customer data, no real orders.

---

## Security

- No production credentials exist anywhere in this repository.
- `.env` files are gitignored; `.env.example` documents the one optional variable.
- `playwright/.auth/` is gitignored — a saved `storageState` is a live session.
- The practice credentials are fictional and only valid against the in-memory store.
- Payment entry is simulated; the card fields are never transmitted or stored.
- The UI warns on every practice page not to enter real personal or payment data.

---

## Screenshots

> **TODO:** capture these from a local run (`npm run dev`) at a 1440×900 viewport
> and drop the PNGs into `docs/screenshots/`, then link them here.
>
> 1. Landing page — `/`
> 2. Dashboard — `/dashboard`
> 3. Lesson page — `/learn/locators/get-by-role`
> 4. Playwright Playground with the simulated browser — `/playground?scenario=shopping`
> 5. A playground failure showing the Playwright-style error
> 6. Registration practice app — `/practice/registration`
> 7. ShopEasy product grid — `/practice/shop`
> 8. SQL Lab with a QA validation query — `/practice/sql`
> 9. Progress dashboard — `/progress`

## Demo

<!-- Add demo GIF here -->

Suggested recording:

```text
Open the playground
        ↓
Write a locator
        ↓
Run
        ↓
Watch the simulated browser react
        ↓
Assert
        ↓
Test passed
```

---

## Roadmap

```text
[x] Playwright fundamentals, locators, actions, assertions, waiting
[x] Interactive playground with a simulated browser and Playwright-style errors
[x] Registration practice application with regenerated attributes
[x] ShopEasy e-commerce application with a REST API
[x] SQL Lab with an in-browser SQL engine
[x] End-to-end scenarios and a capstone brief
[x] Authentication and storageState
[x] API testing and network interception modules
[x] Real Playwright suite covering the practice apps
[x] GitHub Actions CI

[ ] More simulated Playwright APIs (page.route, multiple contexts)
[ ] More SQL scenarios, including window functions
[ ] Additional practice applications (a data grid, a wizard, a file upload)
[ ] Advanced TypeScript module
[ ] Visual regression module
[ ] Accessibility testing module
[ ] Performance testing module
```

---

## What this project demonstrates

For anyone reviewing this as a portfolio piece, the work here covers:

- **Playwright automation** — locators, actions, assertions, waiting, fixtures
- **Test architecture** — page objects, fixtures, test data, project dependencies
- **Authentication** — setup projects, `storageState`, and isolating per-test data
- **API testing** — contract checks, error paths, hybrid API + UI strategy
- **Network interception** — mocking, response modification, payload assertions
- **SQL and data validation** — joins, aggregates, referential-integrity checks
- **Language engineering** — a parser, an interpreter and a SQL engine written from scratch
- **TypeScript** — strict mode across ~15k lines, no `any` in the engines
- **React / Next.js** — App Router, server and client components, route handlers
- **UI/UX** — a themeable design system, responsive layouts, accessible components
- **CI/CD** — GitHub Actions running typecheck, lint, build and the browser suite
- **Technical writing** — 70 lessons and four architecture documents

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, how to add a
lesson, a challenge, a SQL exercise or a simulator feature, and the pull request
checklist.

---

## License

[MIT](LICENSE)
# playwright-academy

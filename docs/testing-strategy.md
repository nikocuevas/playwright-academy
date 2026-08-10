# Testing strategy

This repository is a teaching artifact, so its own suite is written the way the
lessons say a suite should be written. The strategy below is the one the
curriculum argues for, applied to itself.

## Layers

```text
                 QA VALIDATION
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
       UI            API          DATA
        │             │             │
   Playwright     API tests    reconciliation
```

| Layer | Location | Runtime | Covers |
| --- | --- | --- | --- |
| Unit | `tests/unit/` | ~2 s, no browser | The Playwright simulator and the SQL engine |
| API | `tests/api/` | ~1 s, no page | Endpoint shapes, filters, error codes |
| E2E | `tests/registration/`, `shopping/`, `checkout/`, `orders/`, `messages/` | Chromium | Real user journeys |
| Network | `tests/network/` | Chromium | States real data cannot produce |
| Platform | `tests/platform.spec.ts` | Chromium | The training platform itself |

136 tests in total, running in about twenty seconds.

## Projects

```ts
projects: [
  { name: "unit",   testDir: "./tests/unit" },
  { name: "setup",  testMatch: /.*\.setup\.ts/ },
  { name: "public", testMatch: /.*\.public\.spec\.ts/ },
  {
    name: "chromium",
    dependencies: ["setup"],
    use: { storageState: "playwright/.auth/user.json" },
  },
]
```

- **unit** needs no browser at all, so engine changes get feedback in seconds.
- **setup** signs in once and writes the session file.
- **public** holds the tests that must run signed out — login, registration and
  the redirect for anonymous visitors.
- **chromium** is everything else, starting already authenticated.

## Rules the suite follows

**No fixed waits.** There is not one `waitForTimeout` in the suite. Where the
application is asynchronous — the registration submit delay, the simulated
payment — a web-first assertion absorbs it.

**No unstable locators.** Nothing is located by a generated id, a hashed class
or a session token. The page objects use roles, labels and test ids, which is
why they survive the registration app regenerating its attributes mid-test.

**Isolation over convenience.** Each test creates or seeds the data it needs.
The two-cookie split described in [architecture.md](architecture.md) exists
because the first version of this suite shared one cart across parallel workers
and failed exactly the way the lessons predict.

**Seed through the API, act through the UI.** Order tests create their order with
`page.request.post('/api/orders')` because creating it is a precondition, not the
behaviour under test. The cancellation itself goes through the interface a user
would use, and the result is verified at both layers.

```ts
await ordersPage.cancel(orderNumber);

// 1. The UI reflects it…
await expect(ordersPage.status(orderNumber)).toHaveText("Cancelled");

// 2. …and so does the stored data.
const check = await request.get(`/api/orders/${orderNumber}`);
expect((await check.json()).order.status).toBe("Cancelled");
```

**`page.request`, not the `request` fixture, when the page must see the data.**
The standalone `request` fixture is a separate context with its own cookie jar;
`page.request` shares the browser context's. Getting this wrong produced a very
confusing early failure, and the comment explaining it is still in the spec.

**Content is verified like code.** Every playground scenario solution is executed
by the unit tests, and every SQL exercise solution is run against the engine. A
solution that stops working fails CI rather than quietly misleading a learner.

## Page objects and fixtures

Seven page objects in `playwright/pages/`, each holding locators as `readonly`
constructor fields and workflows as methods. Assertions stay in the specs, so a
failure names the expectation rather than a `verifyEverything()` helper.

`playwright/fixtures/test.ts` exposes them as test arguments, plus a
`cartWithHeadphones` fixture that seeds a cart and empties it in teardown — after
`use()`, so cleanup runs even when the test fails.

## Failure artifacts

```ts
use: {
  trace: "on-first-retry",
  screenshot: "only-on-failure",
  video: "retain-on-failure",
  locale: "en-US",
  timezoneId: "UTC",
}
```

Locale and timezone are pinned so date and currency assertions behave identically
on a laptop and on a CI runner.

## What is deliberately not tested

- Visual regression. Baselines are environment-specific and would add
  maintenance without teaching anything the modules do not already cover.
- Firefox and WebKit in CI. The suite is Chromium-only to keep runs fast; the
  Fundamentals module explains the "full suite on one engine, smoke suite on the
  rest" trade-off.
- Load and performance. Out of scope for a training platform, and on the roadmap
  as a future module rather than a test suite.

## Running it

```bash
npx playwright test                      # everything
npx playwright test --project=unit       # engines only, ~2 s
npx playwright test --ui                 # watch mode
npx playwright test --repeat-each=20     # hunt flakiness
npx playwright show-report
```

import { scenarios } from "@/lib/playwright-simulator/scenarios";

export type Challenge = {
  id: string;
  title: string;
  track: "Locators" | "Actions" | "Assertions" | "Waiting" | "E2E" | "Auth" | "API" | "Network" | "Architecture" | "SQL" | "iGaming";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  problem: string;
  /** Where the learner solves it. */
  venue: "playground" | "local" | "sql-lab";
  /** Playground scenario id, when venue is 'playground'. */
  scenarioId?: string;
  /** SQL exercise id, when venue is 'sql-lab'. */
  sqlExerciseId?: string;
  starter?: string;
  solution?: string;
  hints: string[];
  explanation: string;
};

const local = (
  input: Omit<Challenge, "venue" | "hints"> & { hints: string[] },
): Challenge => ({ ...input, venue: "local" });

/** Challenges that run in the browser playground, derived from its scenarios. */
const playgroundChallenges: Challenge[] = scenarios
  .filter((s) => s.mode === "simulated" && s.challengeId)
  .map((scenario) => ({
    id: scenario.challengeId!,
    title: scenario.title,
    track:
      scenario.group === "Locators"
        ? "Locators"
        : scenario.group === "Actions"
          ? "Actions"
          : scenario.group === "Assertions"
            ? "Assertions"
            : scenario.group === "Waiting"
              ? "Waiting"
              : scenario.group === "Login"
                ? "Auth"
                : "E2E",
    difficulty: scenario.difficulty,
    problem: `${scenario.summary} ${scenario.task.join(". ")}.`,
    venue: "playground",
    scenarioId: scenario.id,
    starter: scenario.starterCode,
    solution: scenario.solution,
    hints: scenario.hints,
    explanation: scenario.summary,
  }));

/** Challenges that require a real Playwright run against the local app. */
const localChallenges: Challenge[] = [
  local({
    id: "ch-dynamic-locator",
    title: "Locate a field without its generated id",
    track: "Locators",
    difficulty: "intermediate",
    problem:
      "The Registration app renders `<input id=\"input-837462\" data-session=\"a83jd92\" name=\"email\">` and regenerates both the id and the session token on every render. Write three different locators for that field that survive a regeneration, and prove it by pressing Regenerate attributes between runs.",
    starter: `import { test, expect } from '@playwright/test';

test('locates the email field three stable ways', async ({ page }) => {
  await page.goto('/practice/registration');

  // TODO: three locators, none of which use the id or data-session
});`,
    solution: `import { test, expect } from '@playwright/test';

test('locates the email field three stable ways', async ({ page }) => {
  await page.goto('/practice/registration');

  const byLabel = page.getByLabel('Email');
  const byName = page.locator('input[name="email"]');
  const byTestId = page.getByTestId('registration-email');

  for (const locator of [byLabel, byName, byTestId]) {
    await expect(locator).toBeVisible();
    await locator.fill('ada@example.com');
    await expect(locator).toHaveValue('ada@example.com');
    await locator.clear();
  }
});`,
    hints: [
      "The label text is part of the user-visible contract.",
      "The `name` attribute is part of the form's contract with the server.",
      "The team owns `data-testid`, so it is stable by agreement.",
    ],
    explanation:
      "Generated ids, hashed class names and session tokens are implementation details. Labels, form field names and test ids are contracts — that is why they survive refactors.",
  }),
  local({
    id: "ch-validation-errors",
    title: "Cover the registration validation rules",
    track: "Assertions",
    difficulty: "intermediate",
    problem:
      "Write one test per validation rule: mismatched passwords, an invalid email, a missing terms checkbox and an under-18 date of birth. Each test must assert both the error message and that registration did NOT succeed.",
    starter: `import { test, expect } from '@playwright/test';

test.describe('Registration validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/registration');
  });

  // TODO: one test per rule
});`,
    solution: `import { test, expect } from '@playwright/test';

test.describe('Registration validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/registration');
  });

  test('rejects mismatched passwords', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Different123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Registration successful!' }),
    ).toBeHidden();
  });

  test('rejects an invalid email', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('requires the terms checkbox', async ({ page }) => {
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(
      page.getByText('You must accept the Terms and Conditions'),
    ).toBeVisible();
  });

  test('rejects an under-age date of birth', async ({ page }) => {
    await page.getByLabel('Date of Birth').fill('2015-01-01');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('You must be at least 18 years old')).toBeVisible();
  });
});`,
    hints: [
      "One rule per test keeps the failure message meaningful.",
      "'Password' substring-matches 'Confirm Password' — pass { exact: true }.",
      "Always assert the absence of success as well as the presence of the error.",
    ],
    explanation:
      "Negative tests outnumber happy paths on any real form. Asserting that the submission did not go through catches apps that show an error and submit anyway.",
  }),
  local({
    id: "ch-storage-state",
    title: "Build the authentication setup project",
    track: "Auth",
    difficulty: "advanced",
    problem:
      "Create tests/auth.setup.ts that signs into ShopEasy once and saves storageState to playwright/.auth/user.json, wire it up with project dependencies, then write a test that opens /practice/shop/orders and is already signed in. Also add one test that runs signed out and asserts the redirect to the login page.",
    starter: `// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // TODO: sign in, assert the session exists, save storageState
});`,
    solution: `// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/practice/shop/login');

  await page.getByLabel('Email').fill('testuser@example.com');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Assert BEFORE saving, so the cookie definitely exists.
  await expect(page.getByTestId('account-name')).toContainText('Test User');

  await page.context().storageState({ path: authFile });
});

// playwright.config.ts
// projects: [
//   { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
//   {
//     name: 'chromium',
//     use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
//     dependencies: ['setup'],
//   },
// ]

// tests/orders.spec.ts
test('order history is reachable when signed in', async ({ page }) => {
  await page.goto('/practice/shop/orders');
  await expect(page.getByRole('heading', { name: 'Your Orders' })).toBeVisible();
});

// tests/auth.public.spec.ts
test.use({ storageState: { cookies: [], origins: [] } });

test('anonymous visitors are redirected to login', async ({ page }) => {
  await page.goto('/practice/shop/orders');
  await expect(page).toHaveURL(/\\/login/);
});`,
    hints: [
      "The setup file must be matched by a project with testMatch: /.*\\.setup\\.ts/.",
      "Assert on a signed-in indicator before calling storageState — otherwise you may save an empty session.",
      "Add playwright/.auth/ to .gitignore; the file is a live credential.",
    ],
    explanation:
      "This is the single highest-leverage change in most suites: it removes a UI login from every test while keeping one deliberate login test.",
  }),
  local({
    id: "ch-custom-fixture",
    title: "Write a fixture that seeds a cart",
    track: "Architecture",
    difficulty: "advanced",
    problem:
      "Create a custom fixture `cartWithHeadphones` that adds the Wireless Headphones to the cart before the test body runs, and cleans the cart up afterwards. Use it in a test that verifies the cart page.",
    starter: `import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  // TODO
});`,
    solution: `import { test as base, expect, type Page } from '@playwright/test';

type Fixtures = { cartWithHeadphones: Page };

export const test = base.extend<Fixtures>({
  cartWithHeadphones: async ({ page }, use) => {
    await page.goto('/practice/shop');
    await page
      .getByRole('article')
      .filter({ hasText: 'Wireless Headphones' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    await use(page);

    // Teardown runs even when the test fails.
    await page.request.delete('/api/cart');
  },
});

test('cart shows the seeded product', async ({ cartWithHeadphones: page }) => {
  await page.goto('/practice/shop/cart');
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await expect(page.getByTestId('cart-item-name')).toHaveText('Wireless Headphones');
});`,
    hints: [
      "Everything before `await use(...)` is setup; everything after is teardown.",
      "The fixture receives `page` by destructuring, just like a test does.",
      "Return the page from the fixture so the test can keep using it.",
    ],
    explanation:
      "Fixtures own setup and teardown; page objects own interaction. Keeping them separate is what stops either from turning into a God object.",
  }),
  local({
    id: "ch-api-products",
    title: "Validate the products API",
    track: "API",
    difficulty: "intermediate",
    problem:
      "Write API tests for GET /api/products: the happy path returns a valid catalogue shape, ?category=audio filters correctly, and an unknown product id returns 404 with an error message.",
    starter: `import { test, expect } from '@playwright/test';

test('products endpoint', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('returns the catalogue', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.ok()).toBeTruthy();
  const { products } = await response.json();

  expect(products.length).toBeGreaterThan(0);
  for (const product of products) {
    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
  }
});

test('filters by category', async ({ request }) => {
  const response = await request.get('/api/products', {
    params: { category: 'audio' },
  });

  const { products } = await response.json();
  expect(products.length).toBeGreaterThan(0);
  expect(products.every((p) => p.category === 'audio')).toBe(true);
});

test('returns 404 for an unknown product', async ({ request }) => {
  const response = await request.get('/api/products/does-not-exist');

  expect(response.status()).toBe(404);
  expect(await response.json()).toMatchObject({ error: 'Product not found' });
});`,
    hints: [
      "The `request` fixture needs no browser page — the test runs in milliseconds.",
      "`params` builds the query string for you.",
      "Assert shapes rather than exact values so the test fails on contract changes, not data changes.",
    ],
    explanation:
      "Contract tests run in seconds and fail with a precise message. Without them, a renamed field surfaces as a dozen unrelated UI timeouts.",
  }),
  local({
    id: "ch-mock-products",
    title: "Mock the products API",
    track: "Network",
    difficulty: "advanced",
    problem:
      "Using page.route, write three tests against /practice/shop: one where the API returns an empty list, one where it returns 500, and one where the response is delayed so the loading state is visible.",
    starter: `import { test, expect } from '@playwright/test';

test('empty state', async ({ page }) => {
  // TODO: intercept **/api/products* before navigating
});`,
    solution: `import { test, expect } from '@playwright/test';

test('shows the empty state', async ({ page }) => {
  await page.route('**/api/products*', (route) =>
    route.fulfill({ json: { products: [] } }),
  );

  await page.goto('/practice/shop');

  await expect(page.getByText('No products match your search')).toBeVisible();
});

test('shows an error state', async ({ page }) => {
  await page.route('**/api/products*', (route) =>
    route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }),
  );

  await page.goto('/practice/shop');

  await expect(page.getByRole('alert')).toBeVisible();
});

test('shows a loading state while the API is slow', async ({ page }) => {
  await page.route('**/api/products*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.continue();
  });

  await page.goto('/practice/shop');

  await expect(page.getByTestId('products-skeleton')).toBeVisible();
});`,
    hints: [
      "Routes registered after goto() miss the requests that already fired.",
      "Every handler must call fulfill, continue or abort exactly once.",
      "`json:` sets both the body and the content-type header.",
    ],
    explanation:
      "Empty, error and slow states are nearly impossible to produce with real data on demand. Interception is how you cover them deterministically.",
  }),
  local({
    id: "ch-pom-refactor",
    title: "Refactor a spec into page objects",
    track: "Architecture",
    difficulty: "advanced",
    problem:
      "Take the complete purchase journey and extract ShopPage, CartPage and CheckoutPage. Locators become readonly fields, workflows become methods, and every assertion stays in the spec.",
    hints: [
      "Create locators in the constructor, not inside methods.",
      "A method should describe a user workflow, not a single click.",
      "If you find yourself writing verifyEverything(), stop — assertions belong in the test.",
    ],
    explanation:
      "The measurable win is that a label change becomes a one-line edit. The readability win is that specs read as user journeys.",
  }),
  local({
    id: "ch-flaky-hunt",
    title: "Diagnose a flaky test",
    track: "Waiting",
    difficulty: "expert",
    problem:
      "Write a deliberately flaky test (for example, one that asserts on a value read with textContent immediately after a click), reproduce the flakiness with --repeat-each, capture a trace, then fix it with a web-first assertion and prove it is stable.",
    starter: `npx playwright test tests/flaky.spec.ts --repeat-each=20 --workers=1 --trace on`,
    solution: `// Flaky: reads the DOM once, before the badge updates.
const count = await page.getByTestId('cart-count').textContent();
expect(count).toBe('1');

// Stable: polls until the badge updates or the timeout expires.
await expect(page.getByTestId('cart-count')).toHaveText('1');`,
    hints: [
      "--repeat-each amplifies intermittency so you can actually observe it.",
      "--workers=1 rules parallel interference in or out.",
      "The trace's before-snapshot shows exactly what was on screen at the moment of failure.",
    ],
    explanation:
      "Reproduce, then diagnose, then fix. Adding a sleep moves the failure rather than removing it.",
  }),
];

/** Challenges for the iGaming QA track — solved against /practice/igaming and /practice/igaming-sql. */
const igamingChallenges: Challenge[] = [
  local({
    id: "ig-ch-wallet-api",
    title: "Test the wallet API end to end",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "Write API tests for the iGaming wallet: sign in via POST /api/igaming/auth/login, then use the request fixture (which shares the browser context's cookies) to deposit through POST /api/igaming/wallet with { action: 'deposit', amount }, and assert the response's wallet.balance reflects it. Also assert GET /api/igaming/wallet returns the same value independently.",
    starter: `import { test, expect } from '@playwright/test';

test('deposit is reflected in the wallet', async ({ request }) => {
  // TODO: log in, deposit, assert the response AND a fresh GET agree
});`,
    solution: `import { test, expect } from '@playwright/test';

test('deposit is reflected in the wallet', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });

  const before = await (await request.get('/api/igaming/wallet')).json();

  const deposit = await request.post('/api/igaming/wallet', {
    data: { action: 'deposit', amount: 50 },
  });
  expect(deposit.status()).toBe(201);
  const { wallet } = await deposit.json();
  expect(wallet.balance).toBe(before.wallet.balance + 50);

  // Don't just trust the mutation response — re-read independently.
  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.wallet.balance).toBe(wallet.balance);
});`,
    hints: [
      "The request fixture shares cookies with the browser context, so a login POST authenticates later API calls too.",
      "Read the balance before acting, so the assertion isn't hard-coded to a specific starting balance.",
      "A mutation response and a fresh GET should always agree — that's the whole point of re-reading.",
    ],
    explanation:
      "A response body is a claim about what happened. Re-reading the resource independently is what actually proves it persisted.",
  }),
  local({
    id: "ig-ch-validate-bet",
    title: "Validate a bet placement end to end",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "Place a bet through POST /api/igaming/bets against a market from GET /practice/igaming (or hard-code mkt-derby-winner / opt-home from lib/practice/igaming-data.ts), then prove all of: the API response contains the created bet, the wallet balance dropped by exactly the stake, and GET /api/igaming/bets includes it.",
    starter: `import { test, expect } from '@playwright/test';

test('a placed bet is reflected everywhere', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('a placed bet is reflected everywhere', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });
  const before = await (await request.get('/api/igaming/wallet')).json();

  const placed = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-derby-winner', optionId: 'opt-home', stake: 20 },
  });
  expect(placed.status()).toBe(201);
  const { bet, wallet } = await placed.json();
  expect(bet.status).toBe('accepted');
  expect(wallet.balance).toBe(before.wallet.balance - 20);

  const list = await (await request.get('/api/igaming/bets')).json();
  expect(list.bets.some((b) => b.id === bet.id)).toBe(true);
});`,
    hints: [
      "A 'Bet placed' response proves the API responded — it does not by itself prove the wallet was debited.",
      "Compare the balance before and after, not just that it changed.",
      "GET /api/igaming/bets is the independent read that proves persistence.",
    ],
    explanation:
      "This is the track's central lesson in miniature: one user action, several claims (API response, wallet debit, persisted record), each needing its own assertion.",
  }),
  local({
    id: "ig-ch-insufficient-balance",
    title: "Test betting with insufficient balance",
    track: "iGaming",
    difficulty: "beginner",
    problem:
      "Prove that a stake larger than the current wallet balance is rejected: assert a 400 status, an error message, and — critically — that the wallet balance is completely unchanged afterward.",
    starter: `import { test, expect } from '@playwright/test';

test('a stake larger than the balance is rejected', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('a stake larger than the balance is rejected', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });
  const before = await (await request.get('/api/igaming/wallet')).json();

  const response = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-derby-winner', optionId: 'opt-home', stake: before.wallet.balance + 1000 },
  });

  expect(response.status()).toBe(400);
  expect((await response.json()).error).toMatch(/insufficient/i);

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.wallet.balance).toBe(before.wallet.balance);
});`,
    hints: [
      "Compute the stake relative to the real current balance so the test doesn't depend on a magic number.",
      "A 400 with the right error message is necessary but not sufficient.",
      "The balance-unchanged assertion is the one most tests skip — and the one that actually matters financially.",
    ],
    explanation:
      "A rejected bet that still debits the wallet is worse than a bet that succeeds — it's a silent financial loss disguised as an error message.",
  }),
  local({
    id: "ig-ch-duplicate-transaction",
    title: "Detect a duplicate transaction",
    track: "iGaming",
    difficulty: "advanced",
    problem:
      "Simulate a payment provider retrying a callback: call POST /api/igaming/wallet with { action: 'deposit', amount: 50, idempotencyKey: 'fixed-key-1' } twice in a row. Prove the wallet is only credited once — not twice — and that both responses report the same resulting balance.",
    starter: `import { test, expect } from '@playwright/test';

test('a duplicate deposit callback is only applied once', async ({ request }) => {
  // TODO: same idempotencyKey, sent twice
});`,
    solution: `import { test, expect } from '@playwright/test';

test('a duplicate deposit callback is only applied once', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });
  const before = await (await request.get('/api/igaming/wallet')).json();

  const body = { action: 'deposit', amount: 50, idempotencyKey: 'fixed-key-1' };
  const first = await request.post('/api/igaming/wallet', { data: body });
  const second = await request.post('/api/igaming/wallet', { data: body });

  const firstJson = await first.json();
  const secondJson = await second.json();
  expect(secondJson.wallet.balance).toBe(firstJson.wallet.balance);

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.wallet.balance).toBe(before.wallet.balance + 50); // not +100
});`,
    hints: [
      "Send the exact same idempotencyKey both times — a different key each time defeats the whole point of the test.",
      "The bug this catches doubles the credit; assert the exact expected delta, not just 'balance changed'.",
      "This is the API-level version of the 'double-click Place Bet' problem covered in the concurrency lesson.",
    ],
    explanation:
      "Without an idempotency key, a retried callback is indistinguishable from a second, genuine deposit — which is exactly how duplicate-credit bugs happen in production.",
  }),
  local({
    id: "ig-ch-kyc-response",
    title: "Validate a KYC verification response",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "Design (as a written test plan, not necessarily runnable code, since this track has no live KYC provider integration) the assertions you would make for a POST /kyc/verify response across each outcome: verified, failed, pending and manual_review. For each, list what the response should contain and what the account should — and should not — be able to do afterward.",
    hints: [
      "A 'pending' verdict is not a failure and not a pass — what should the account be allowed to do while it waits?",
      "'Failed' should be checked for both message clarity and that no gambling functionality opens up regardless.",
      "'manual_review' usually implies a support/ops workflow — what should QA verify is visible to that team?",
    ],
    explanation:
      "KYC has more than two outcomes, and each one implies different account behavior. Testing only 'pass' and 'fail' misses the pending/manual_review states real platforms spend most of their support effort on.",
  }),
  local({
    id: "ig-ch-self-exclusion",
    title: "Test self-exclusion is enforced everywhere",
    track: "iGaming",
    difficulty: "advanced",
    problem:
      "Prove self-exclusion is enforced at the API layer, not just hidden in the UI: call POST /api/igaming/self-exclusion, then attempt POST /api/igaming/bets and POST /api/igaming/wallet (deposit) with the SAME already-open session/cookies, and assert both are rejected.",
    starter: `import { test, expect } from '@playwright/test';

test('a self-excluded player is blocked from further activity', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('a self-excluded player is blocked from further activity', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });

  await request.post('/api/igaming/self-exclusion');

  const bet = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-derby-winner', optionId: 'opt-home', stake: 10 },
  });
  expect(bet.status()).toBe(400);
  expect((await bet.json()).error).toMatch(/self-excluded/i);

  const deposit = await request.post('/api/igaming/wallet', {
    data: { action: 'deposit', amount: 10 },
  });
  expect(deposit.status()).toBe(400);
  expect((await deposit.json()).error).toMatch(/self-excluded/i);
});`,
    hints: [
      "Use the same request context throughout, so the session cookie set by self-exclusion carries into the later calls.",
      "Test more than one endpoint — self-exclusion that blocks betting but not deposits is a real, dangerous gap.",
      "A UI that hides the 'Place Bet' button is not evidence the API rejects the request too.",
    ],
    explanation:
      "Self-exclusion is a promise the whole platform has to keep. Testing it through one surface (usually the UI) is the most common way this control is under-tested.",
  }),
  local({
    id: "ig-ch-deposit-limit",
    title: "Test a responsible-gambling deposit limit",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "Set a deposit limit via POST /api/igaming/limits, deposit an amount under it (should succeed), then attempt a further deposit that would push the day's total over the limit (should be rejected). Assert the wallet balance only reflects the accepted deposit.",
    starter: `import { test, expect } from '@playwright/test';

test('a deposit exceeding the configured limit is rejected', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('a deposit exceeding the configured limit is rejected', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });
  await request.post('/api/igaming/limits', { data: { depositLimit: 100 } });
  const before = await (await request.get('/api/igaming/wallet')).json();

  const ok = await request.post('/api/igaming/wallet', {
    data: { action: 'deposit', amount: 60 },
  });
  expect(ok.status()).toBe(201);

  const blocked = await request.post('/api/igaming/wallet', {
    data: { action: 'deposit', amount: 60 }, // 60 + 60 > 100
  });
  expect(blocked.status()).toBe(400);
  expect((await blocked.json()).error).toMatch(/limit/i);

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.wallet.balance).toBe(before.wallet.balance + 60);
});`,
    hints: [
      "The limit applies to the day's total deposits, not to a single transaction — test the boundary, not just an obviously-too-large amount.",
      "The first deposit should succeed; only the one that would cross the limit should fail.",
      "A responsible-gambling control that can be bypassed by retrying is a compliance-severity bug, not a minor one.",
    ],
    explanation:
      "This mirrors a real regulatory requirement: the platform must actually enforce a limit a player sets on themselves, not just store it as a preference.",
  }),
  local({
    id: "ig-ch-settlement-validation",
    title: "Validate a bet settlement",
    track: "iGaming",
    difficulty: "advanced",
    problem:
      "Place a bet, settle it as a win via POST /api/igaming/bets/{id}/settle with { outcome: 'win' }, and assert: the bet's status and payout fields, the wallet balance increased by exactly stake × odds, AND that attempting to settle the same bet again is rejected (a bet may only transition ACCEPTED → SETTLED once).",
    starter: `import { test, expect } from '@playwright/test';

test('settling a bet credits the correct payout and cannot repeat', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('settling a bet credits the correct payout and cannot repeat', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });

  const placed = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-derby-winner', optionId: 'opt-home', stake: 10 },
  });
  const { bet: created, wallet: afterStake } = await placed.json();

  const settled = await request.post(\`/api/igaming/bets/\${created.id}/settle\`, {
    data: { outcome: 'win' },
  });
  const { bet, wallet } = await settled.json();
  expect(bet.status).toBe('settled');
  expect(bet.payout).toBeCloseTo(created.stake * created.odds, 2);
  expect(wallet.balance).toBeCloseTo(afterStake.balance + bet.payout, 2);

  const again = await request.post(\`/api/igaming/bets/\${created.id}/settle\`, {
    data: { outcome: 'win' },
  });
  expect(again.status()).toBe(400);
  expect((await again.json()).error).toMatch(/already/i);
});`,
    hints: [
      "The expected payout is stake × odds — compute it from the bet you actually created, not a hard-coded number.",
      "Compare the wallet balance immediately before and after settlement, not against the very first balance in the test.",
      "The re-settlement attempt is the important half of this challenge — a duplicate settlement is a critical-severity financial bug.",
    ],
    explanation:
      "Settlement must be a one-way, one-time transition. A settlement endpoint that can be called twice will eventually be called twice — by a retry, a race, or a bug — and double-pay someone.",
  }),
  local({
    id: "ig-ch-ledger-mismatch",
    title: "Find a ledger mismatch using SQL",
    track: "iGaming",
    difficulty: "advanced",
    problem:
      "Open the iGaming SQL Lab (/practice/igaming-sql) and write a query that finds every wallet whose stored balance does not equal the sum of its own transactions. State, in one sentence, why this check has to run against the database and can't be done through the API or UI alone.",
    starter: "-- Write your query against the wallets and transactions tables.",
    solution: `SELECT w.id, w.player_id, w.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance
FROM wallets w
LEFT JOIN transactions t ON t.wallet_id = w.id
GROUP BY w.id, w.player_id, w.balance
HAVING w.balance <> COALESCE(SUM(t.amount), 0);`,
    hints: [
      "LEFT JOIN transactions onto wallets so a wallet with zero transactions still appears.",
      "GROUP BY the wallet and compare the stored balance to SUM(amount) in a HAVING clause.",
      "The API only ever returns the stored balance — it has no way to tell you whether that number is actually correct.",
    ],
    explanation:
      "This is the exercise 'ig-sql-unreconciled-wallet' in the iGaming SQL Lab. The API layer reports whatever the stored balance says; only a direct query against the ledger can prove that number is trustworthy.",
  }),
  local({
    id: "ig-ch-race-condition",
    title: "Identify a race condition",
    track: "iGaming",
    difficulty: "expert",
    problem:
      "Fire two POST /api/igaming/bets requests concurrently (Promise.all), each staking slightly more than half the current wallet balance, so together they exceed it. State what you'd expect from a correctly-implemented system, and write an assertion that would fail if the system allowed both to succeed (an overdrawn wallet balance).",
    starter: `import { test, expect } from '@playwright/test';

test('two concurrent bets cannot both succeed if their combined stake exceeds the balance', async ({ request }) => {
  // TODO
});`,
    solution: `import { test, expect } from '@playwright/test';

test('two concurrent bets cannot both succeed if their combined stake exceeds the balance', async ({ request }) => {
  await request.post('/api/igaming/auth/login', {
    data: { email: 'player@example.com', password: 'Password123!' },
  });
  const { wallet } = await (await request.get('/api/igaming/wallet')).json();
  const stake = Math.round((wallet.balance / 2 + 5) * 100) / 100; // > half each, so both together overdraw

  const [a, b] = await Promise.all([
    request.post('/api/igaming/bets', { data: { marketId: 'mkt-derby-winner', optionId: 'opt-home', stake } }),
    request.post('/api/igaming/bets', { data: { marketId: 'mkt-derby-winner', optionId: 'opt-away', stake } }),
  ]);

  const accepted = [a, b].filter((r) => r.status() === 201).length;
  expect(accepted).toBeLessThanOrEqual(1); // at most one may succeed

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.wallet.balance).toBeGreaterThanOrEqual(0); // never overdrawn
});`,
    hints: [
      "Promise.all fires both requests without waiting for the first response — a sequential await await would not exercise the race at all.",
      "The bug to catch is both requests succeeding when only one balance's worth of stake actually exists.",
      "A single passing run is weak evidence for a race condition — this class of bug is timing-dependent and worth repeating.",
    ],
    explanation:
      "This is the track's central concurrency example: two simultaneous requests against one balance. A correct system serializes the balance check and debit so at most one wins; an incorrect one lets both through and ends up with a negative or impossible balance.",
  }),
  local({
    id: "ig-ch-layer-design",
    title: "Design an API + UI hybrid test",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "Design (write the plan, and the test if you like) a hybrid test for 'placing a bet': create any required preconditions via the API for speed, exercise bet placement through the actual UI at /practice/igaming, then verify the result at both the UI layer (balance shown on screen) and the API layer (GET /api/igaming/wallet and /api/igaming/bets).",
    hints: [
      "API setup is for state you don't care about testing right now — use it to skip to the part of the flow you actually want to exercise.",
      "The UI portion should be the part under test: the actual bet-placement interaction.",
      "Verifying at both layers is the point — a UI-only check would miss a persistence bug; an API-only check would miss a rendering bug.",
    ],
    explanation:
      "Hybrid tests are especially valuable in this domain because a wrong number on screen and a wrong number in the database are different bugs with different causes, and only checking both layers tells you which one you have.",
  }),
  local({
    id: "ig-ch-choose-layer",
    title: "Choose the correct test layer",
    track: "iGaming",
    difficulty: "intermediate",
    problem:
      "For each scenario, name the single most appropriate layer to test it at (UI, API, database/SQL, or a hybrid) and justify the choice in one sentence: (1) a deposit form correctly disables its submit button while a request is in flight; (2) a settled bet's payout was calculated correctly; (3) every self-excluded player currently has zero active bets, across the whole player base; (4) a specific player's 'Place Bet' button is reachable by keyboard only.",
    hints: [
      "Ask what would make the check fail: a hidden database row, a wrong DOM state, or a value nobody's UI ever displays?",
      "A whole-player-base check ('every self-excluded player...') is rarely practical through the UI at all.",
      "Keyboard reachability is inherently a UI/accessibility property — no API or database check can substitute for it.",
    ],
    explanation:
      "(1) UI — it's a rendering/interaction property. (2) Hybrid or database — the UI can show a wrong number just as easily as a right one. (3) Database/SQL — a base-wide invariant check, impractical to assert one player at a time through the UI. (4) UI, specifically keyboard-driven interaction, not just a locator-based click.",
  }),
];

export const challenges: Challenge[] = [...playgroundChallenges, ...localChallenges, ...igamingChallenges];

export const challengeTracks = Array.from(
  challenges.reduce((map, challenge) => {
    const list = map.get(challenge.track) ?? [];
    list.push(challenge);
    map.set(challenge.track, list);
    return map;
  }, new Map<string, Challenge[]>()),
).map(([track, items]) => ({ track, items }));

export function getChallenge(id: string) {
  return challenges.find((c) => c.id === id);
}

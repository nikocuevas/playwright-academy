import { scenarios } from "@/lib/playwright-simulator/scenarios";

export type Challenge = {
  id: string;
  title: string;
  track: "Locators" | "Actions" | "Assertions" | "Waiting" | "E2E" | "Auth" | "API" | "Network" | "Architecture" | "SQL";
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

export const challenges: Challenge[] = [...playgroundChallenges, ...localChallenges];

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

import type { Module } from "../types";

export const fixturesModule: Module = {
  id: "fixtures",
  order: 10,
  title: "Fixtures",
  tagline: "Setup and teardown that composes",
  summary:
    "Built-in fixtures, custom fixtures, scopes and options — Playwright's answer to beforeEach sprawl.",
  difficulty: "intermediate",
  icon: "Puzzle",
  track: "architecture",
  lessons: [
    {
      id: "fix-builtin",
      slug: "built-in-fixtures",
      title: "The built-in fixtures",
      moduleId: "fixtures",
      summary:
        "page, context, browser, request, browserName — what each one gives you and what it costs.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Name the built-in fixtures and their scopes",
        "Choose the right one for a scenario",
        "Understand lazy instantiation",
      ],
      sections: [
        {
          kind: "table",
          title: "What is available in every test",
          headers: ["Fixture", "Scope", "Use it for"],
          rows: [
            ["page", "test", "The default — one isolated page"],
            ["context", "test", "Cookies, permissions, extra pages, storageState"],
            ["browser", "worker", "Creating additional contexts (multi-user tests)"],
            ["request", "test", "API calls that share the test's cookies"],
            ["browserName", "worker", "Conditional logic per engine"],
            ["playwright", "worker", "Low-level access to the library itself"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Fixtures are lazy",
          body: [
            "Only the fixtures you destructure are created. A test that asks for `{ request }` alone never launches a browser page — which is why pure API tests run so fast.",
          ],
        },
        {
          kind: "code",
          title: "Picking the right one",
          language: "ts",
          code: `
// Standard UI test
test('shows products', async ({ page }) => {});

// Needs permissions or extra pages
test('geolocation', async ({ context, page }) => {
  await context.grantPermissions(['geolocation']);
});

// Two independent sessions
test('two users', async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
});

// Pure API test — no browser page at all
test('products endpoint', async ({ request }) => {
  const res = await request.get('/api/products');
  expect(res.ok()).toBeTruthy();
});

// Engine-specific behaviour
test('webkit quirk', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit');
});
`,
        },
        {
          kind: "code",
          title: "Overriding fixture options with test.use",
          language: "ts",
          code: `
test.use({
  viewport: { width: 390, height: 844 },
  locale: 'fr-CA',
  timezoneId: 'America/Toronto',
  colorScheme: 'dark',
});

test('renders in French on a phone viewport', async ({ page }) => {});
`,
        },
      ],
      commonMistakes: [
        {
          title: "Requesting browser when page is enough",
          body: "It does not speed anything up and invites manual context management you then have to clean up.",
        },
        {
          title: "Expecting `request` to be unauthenticated",
          body: "The `request` fixture shares the test's storage state, so it inherits the logged-in session.",
        },
      ],
      keyTakeaways: [
        "Only destructured fixtures are created.",
        "page for UI, request for API, browser for multi-session.",
        "test.use overrides options per file or describe block.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which fixture do you need for two independent logged-in users in one test?",
          options: [
            { id: "a", text: "page" },
            { id: "b", text: "context" },
            { id: "c", text: "browser" },
            { id: "d", text: "request" },
          ],
          correct: "c",
          explanation:
            "`browser.newContext()` creates the second isolated session.",
        },
      ],
    },
    {
      id: "fix-custom",
      slug: "writing-custom-fixtures",
      title: "Writing custom fixtures",
      moduleId: "fixtures",
      summary:
        "test.extend, the use() callback, and turning page objects into test arguments.",
      difficulty: "intermediate",
      estimatedTime: 16,
      objectives: [
        "Extend the base test with your own fixtures",
        "Run teardown after use()",
        "Expose page objects and seeded data as fixtures",
      ],
      sections: [
        {
          kind: "code",
          title: "The anatomy of a fixture",
          language: "ts",
          code: `
import { test as base } from '@playwright/test';

export const test = base.extend<{ greeting: string }>({
  greeting: async ({}, use) => {
    // 1. setup
    const value = 'hello';

    // 2. hand it to the test and wait for it to finish
    await use(value);

    // 3. teardown
  },
});
`,
          caption:
            "Everything before use() is setup; everything after is teardown — even if the test failed.",
        },
        {
          kind: "code",
          title: "fixtures/test.ts — page objects as fixtures",
          language: "ts",
          code: `
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ShopPage } from '../pages/ShopPage';
import { CartPage } from '../pages/CartPage';

type Pages = {
  loginPage: LoginPage;
  shopPage: ShopPage;
  cartPage: CartPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect };
`,
        },
        {
          kind: "code",
          title: "The spec gets shorter",
          language: "ts",
          code: `
import { test, expect } from '../fixtures/test';

test('adds a product to the cart', async ({ shopPage, cartPage }) => {
  await shopPage.goto();
  await shopPage.addToCart('Wireless Headphones');

  await cartPage.goto();
  await expect(cartPage.itemNames).toHaveText(['Wireless Headphones']);
});
`,
        },
        {
          kind: "code",
          title: "A fixture that seeds and cleans up data",
          language: "ts",
          code: `
type DataFixtures = { seededOrder: { orderNumber: string } };

export const test = base.extend<DataFixtures>({
  seededOrder: async ({ request }, use) => {
    const created = await request.post('/api/orders', {
      data: { items: [{ productId: 'p-1001', quantity: 1 }] },
    });
    const order = await created.json();

    await use(order);

    await request.delete(\`/api/orders/\${order.orderNumber}\`);
  },
});
`,
          caption:
            "Teardown runs even when the test fails, so the environment does not accumulate junk.",
        },
        {
          kind: "code",
          title: "Auto fixtures run without being requested",
          language: "ts",
          code: `
export const test = base.extend<{ failOnConsoleError: void }>({
  failOnConsoleError: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });

      await use();

      expect(errors, 'no console errors during the test').toEqual([]);
    },
    { auto: true },
  ],
});
`,
        },
      ],
      commonMistakes: [
        {
          title: "Returning a value instead of calling use()",
          body: "The fixture must call `await use(value)`. Returning does nothing and teardown never runs.",
        },
        {
          title: "Putting cleanup after the test instead of after use()",
          body: "Code after `use()` is the teardown — that is where cleanup belongs so it runs on failure too.",
        },
      ],
      keyTakeaways: [
        "setup → await use(value) → teardown.",
        "Page objects as fixtures remove constructor noise from every test.",
        "auto: true fixtures apply to every test without being requested.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Where does fixture teardown code go?",
          options: [
            { id: "a", text: "Before await use()" },
            { id: "b", text: "After await use()" },
            { id: "c", text: "In test.afterEach" },
            { id: "d", text: "In a finally block around use()" },
          ],
          correct: "b",
          explanation:
            "Playwright resumes the fixture after the test finishes — pass or fail — so teardown goes after use().",
        },
      ],
      challenges: ["ch-custom-fixture"],
    },
    {
      id: "fix-scope",
      slug: "fixture-scope-and-options",
      title: "Fixture scope, options and ordering",
      moduleId: "fixtures",
      summary:
        "Test-scoped vs. worker-scoped, option fixtures, and how dependencies determine setup order.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Choose between test and worker scope",
        "Define configurable option fixtures",
        "Reason about fixture ordering",
      ],
      sections: [
        {
          kind: "table",
          title: "Scopes",
          headers: ["Scope", "Created", "Good for"],
          rows: [
            ["test (default)", "Once per test", "Anything that must be isolated"],
            ["worker", "Once per worker process", "Expensive shared resources — a seeded database, a token"],
          ],
        },
        {
          kind: "code",
          title: "A worker-scoped fixture",
          language: "ts",
          code: `
export const test = base.extend<{}, { apiToken: string }>({
  apiToken: [
    async ({}, use) => {
      const token = await fetchServiceToken();   // expensive
      await use(token);
    },
    { scope: 'worker' },
  ],
});
`,
          caption:
            "Note the second type parameter — worker fixtures are declared separately from test fixtures.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Worker-scoped state is shared",
          body: [
            "Every test in that worker sees the same value. If a test mutates it, the next test inherits the mutation. Keep worker fixtures read-only.",
          ],
        },
        {
          kind: "code",
          title: "Option fixtures — configurable per project",
          language: "ts",
          code: `
type Options = { userRole: 'customer' | 'admin' };

export const test = base.extend<Options>({
  userRole: ['customer', { option: true }],
});

// playwright.config.ts
projects: [
  { name: 'customer', use: { userRole: 'customer' } },
  { name: 'admin',    use: { userRole: 'admin' } },
],
`,
        },
        {
          kind: "text",
          title: "Ordering",
          body: [
            "Playwright builds a dependency graph from the fixtures each fixture destructures, then sets them up in order and tears them down in reverse. You never sequence anything manually — declaring the dependency is enough.",
          ],
        },
        {
          kind: "diagram",
          title: "Setup and teardown order",
          ascii: `setup:     browser → context → page → loginPage → seededOrder
test body: ────────────────────────────────────────────▶
teardown:  seededOrder → loginPage → page → context → browser`,
        },
      ],
      commonMistakes: [
        {
          title: "Using worker scope for mutable state",
          body: "Cross-test contamination that only shows up under parallelism.",
        },
        {
          title: "Expecting worker fixtures to see `page`",
          body: "A worker fixture cannot depend on a test-scoped fixture. The dependency only points one way.",
        },
      ],
      keyTakeaways: [
        "Test scope for isolation, worker scope for expensive read-only resources.",
        "Option fixtures make projects configurable without extra files.",
        "Ordering is derived from dependencies; teardown is exactly reversed.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which is safe as a worker-scoped fixture?",
          options: [
            { id: "a", text: "A shopping cart shared across tests" },
            { id: "b", text: "A read-only API token" },
            { id: "c", text: "The page object for the checkout page" },
            { id: "d", text: "A counter incremented by each test" },
          ],
          correct: "b",
          explanation:
            "Worker fixtures are shared. Only immutable, read-only resources belong there.",
        },
      ],
    },
  ],
};

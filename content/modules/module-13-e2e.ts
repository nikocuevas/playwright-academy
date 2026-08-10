import type { Module } from "../types";

export const e2eModule: Module = {
  id: "e2e-automation",
  order: 13,
  title: "End-to-End Automation with ShopEasy",
  tagline: "The full journey: browse, buy, verify, follow up",
  summary:
    "Bring locators, waiting, authentication, page objects and API validation together into the complete purchase journey — the exercise that most resembles real work.",
  difficulty: "advanced",
  icon: "Route",
  track: "integration",
  lessons: [
    {
      id: "e2e-tour",
      slug: "touring-shopeasy",
      title: "Touring ShopEasy",
      moduleId: "e2e-automation",
      summary:
        "The pages, the data model, and the deliberately awkward bits you will have to work around.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Navigate every page of the practice shop",
        "Identify the stable hooks on each screen",
        "Know which parts are intentionally hostile to lazy locators",
      ],
      sections: [
        {
          kind: "practice",
          href: "/practice/shop",
          title: "Open ShopEasy",
          body: "Sign in with testuser@example.com / Password123! and click through the whole journey once before automating it.",
        },
        {
          kind: "table",
          title: "The pages",
          headers: ["Route", "What it does"],
          rows: [
            ["/practice/shop/login", "Email + password sign-in"],
            ["/practice/shop", "Product grid with search and category filters"],
            ["/practice/shop/product/[id]", "Product detail with quantity selector"],
            ["/practice/shop/cart", "Line items, quantity changes, removal"],
            ["/practice/shop/checkout", "Shipping details, simulated payment"],
            ["/practice/shop/orders", "Order history with statuses"],
            ["/practice/shop/messages", "Support messages tied to an order"],
          ],
        },
        {
          kind: "list",
          title: "The deliberate obstacles",
          items: [
            "`data-product-id` is regenerated on every render — chaining and filtering are mandatory.",
            "Adding to the cart is asynchronous, so the badge updates a moment later.",
            "Checkout simulates a payment delay before the confirmation appears.",
            "Order numbers are generated, so they must be captured at runtime.",
            "The product grid renders a skeleton before the data arrives.",
          ],
        },
        {
          kind: "code",
          title: "The stable hooks",
          language: "ts",
          code: `
page.getByRole('article')                       // a product card
page.getByRole('button', { name: 'Add to Cart' })
page.getByTestId('cart-count')                  // the header badge
page.getByTestId('cart-item')                   // a cart line item
page.getByTestId('order-number')                // on the confirmation
page.getByTestId('order-status')                // in the history table
page.getByRole('searchbox', { name: 'Search products' })
`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Everything here is simulated",
          body: [
            "Accounts, payments and orders are fictional and live in memory. Never enter a real card number or real personal data — there is nothing to protect it.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Locating a product card by data-product-id",
          body: "It is regenerated on purpose. Filter the article by its visible name instead.",
        },
      ],
      keyTakeaways: [
        "Product cards are articles; filter them by name.",
        "Several steps are asynchronous by design — rely on web-first assertions.",
        "The generated order number is the thread that ties the journey together.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt: "How do you reach the Add to Cart button of a specific product?",
          options: [
            { id: "a", text: "page.locator('[data-product-id=\"837462\"] button')" },
            { id: "b", text: "page.getByRole('button', { name: 'Add to Cart' }).first()" },
            {
              id: "c",
              text: "page.getByRole('article').filter({ hasText: 'Wireless Headphones' }).getByRole('button', { name: 'Add to Cart' })",
            },
            { id: "d", text: "page.getByText('Wireless Headphones').click()" },
          ],
          correct: "c",
          explanation:
            "It survives reordering and the regenerated product ids, and it says exactly what it means.",
        },
      ],
      playground: ["shopping"],
    },
    {
      id: "e2e-purchase",
      slug: "the-complete-purchase-journey",
      title: "The complete purchase journey",
      moduleId: "e2e-automation",
      summary:
        "One test from sign-in to order confirmation, structured so a failure tells you exactly where it broke.",
      difficulty: "advanced",
      estimatedTime: 22,
      objectives: [
        "Automate the full checkout flow",
        "Structure a long test with test.step",
        "Carry a generated value across pages",
      ],
      sections: [
        {
          kind: "diagram",
          title: "The journey",
          ascii: `Authenticate
     ↓
Open Shop ──▶ Select Product ──▶ Add to Cart
     ↓
Open Cart ──▶ Verify Product
     ↓
Checkout ──▶ Fill Shipping ──▶ Place Order
     ↓
Verify Confirmation (capture ORD-######)
     ↓
Open Order History ──▶ Verify Order
     ↓
Send Message ──▶ Verify Success`,
        },
        {
          kind: "code",
          title: "The test",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';

test('customer completes a purchase and contacts support', async ({ page }) => {
  let orderNumber = '';

  await test.step('Add a product to the cart', async () => {
    await page.goto('/practice/shop');

    const product = page
      .getByRole('article')
      .filter({ hasText: 'Wireless Headphones' });

    await product.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  await test.step('Verify the cart contents', async () => {
    await page.goto('/practice/shop/cart');

    const item = page.getByTestId('cart-item');
    await expect(item).toHaveCount(1);
    await expect(item).toContainText('Wireless Headphones');
  });

  await test.step('Check out', async () => {
    await page.getByRole('link', { name: 'Proceed to Checkout' }).click();

    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Address').fill('100 Queen St W');
    await page.getByLabel('City').fill('Toronto');
    await page.getByLabel('Province').selectOption('ON');
    await page.getByLabel('Postal Code').fill('M5H 2N2');

    await page.getByLabel('Card Number').fill('4111111111111111');
    await page.getByLabel('Expiration').fill('12/29');
    await page.getByLabel('CVV').fill('123');

    await page.getByRole('button', { name: 'Place Order' }).click();
  });

  await test.step('Verify the confirmation', async () => {
    await expect(
      page.getByRole('heading', { name: 'Order Successful!' }),
    ).toBeVisible();

    orderNumber = (await page.getByTestId('order-number').innerText()).trim();
    expect(orderNumber).toMatch(/^ORD-\\d{6}$/);
  });

  await test.step('Find the order in the history', async () => {
    await page.goto('/practice/shop/orders');

    const row = page.getByRole('row').filter({ hasText: orderNumber });
    await expect(row).toBeVisible();
    await expect(row.getByTestId('order-status')).toHaveText('Pending');
  });

  await test.step('Contact support about the order', async () => {
    await page.goto('/practice/shop/messages');

    await page.getByLabel('Subject').fill(\`Question about \${orderNumber}\`);
    await page
      .getByLabel('Message')
      .fill('When will this order ship?');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Message sent successfully!')).toBeVisible();
  });
});
`,
        },
        {
          kind: "list",
          title: "Why it is written this way",
          items: [
            "`test.step` turns the report into a readable narrative and pinpoints the failing stage.",
            "`orderNumber` is captured, never hardcoded — the value differs every run.",
            "Every wait is an assertion on a real condition; there is not a single sleep.",
            "The product is reached by filtering an article, so ordering and generated ids do not matter.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Long tests are a trade-off",
          body: [
            "One long journey mirrors real usage but gives a coarse failure signal. A good compromise: one full journey as a smoke test, plus focused tests per stage using API seeding for the preconditions.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Hardcoding the order number after seeing it once",
          body: "It changes every run. Capture it into a variable.",
        },
        {
          title: "Skipping the cart verification",
          body: "If the cart is wrong, the confirmation assertion still passes and you learn nothing about where it broke.",
        },
      ],
      keyTakeaways: [
        "test.step makes a long journey diagnosable.",
        "Generated values must be captured at runtime and threaded through.",
        "Assert at each stage, not just at the end.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is the main benefit of test.step in a long journey?",
          options: [
            { id: "a", text: "It runs steps in parallel" },
            { id: "b", text: "It groups the report and shows exactly which stage failed" },
            { id: "c", text: "It retries each step" },
            { id: "d", text: "It is required for multi-page tests" },
          ],
          correct: "b",
          explanation:
            "Steps appear as collapsible groups in the HTML report and the trace viewer.",
        },
      ],
      challenges: ["ch-e2e-purchase"],
      playground: ["shopping"],
    },
    {
      id: "e2e-data",
      slug: "test-data-strategy",
      title: "Test data strategy",
      moduleId: "e2e-automation",
      summary:
        "Where data comes from, who owns it, and why shared fixtures eventually break every suite.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Compare data strategies and their failure modes",
        "Generate unique data per test",
        "Clean up what a test creates",
      ],
      sections: [
        {
          kind: "table",
          title: "Four strategies",
          headers: ["Strategy", "Pros", "Cons"],
          rows: [
            ["Shared static accounts", "Simple to start", "Tests interfere; fails under parallelism"],
            ["Generated per test", "Fully isolated", "Needs a creation path and cleanup"],
            ["API-seeded per test", "Fast and isolated", "Requires a usable API"],
            ["Snapshot/reset per run", "Deterministic", "Slow; hard on shared environments"],
          ],
        },
        {
          kind: "code",
          title: "Making data unique",
          language: "ts",
          code: `
function uniqueEmail(prefix = 'qa') {
  return \`\${prefix}+\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}@example.com\`;
}

test('registers a brand new user', async ({ page }) => {
  const email = uniqueEmail('registration');
  // …
});
`,
          caption:
            "The timestamp survives parallel workers; the random suffix survives same-millisecond collisions.",
        },
        {
          kind: "code",
          title: "Creating and cleaning up in a fixture",
          language: "ts",
          code: `
export const test = base.extend<{ order: { orderNumber: string } }>({
  order: async ({ request }, use) => {
    const created = await request.post('/api/orders', {
      data: { items: [{ productId: 'p-1001', quantity: 1 }] },
    });
    const order = await created.json();

    await use(order);

    await request.delete(\`/api/orders/\${order.orderNumber}\`);
  },
});
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "The shared-account trap",
          body: [
            "Two tests using the same account, running in parallel: one empties the cart while the other checks out. Both are correct in isolation and both fail together. This is the single most common source of 'random' failures in an E2E suite.",
          ],
        },
        {
          kind: "list",
          title: "Rules that hold up",
          items: [
            "A test creates the data it needs, or seeds it via the API.",
            "A test never depends on data another test created.",
            "A test cleans up in fixture teardown, so cleanup runs even on failure.",
            "Read-only reference data (the product catalogue) can be shared safely.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Assuming test order",
          body: "Playwright runs tests in parallel and in arbitrary order. 'Test B runs after test A' is not a guarantee you have.",
        },
        {
          title: "Cleaning up in afterEach instead of a fixture",
          body: "If the test fails early, afterEach may still run but the setup state is harder to reason about. Fixture teardown is tied directly to what the fixture created.",
        },
      ],
      keyTakeaways: [
        "Isolation beats convenience: generate or seed per test.",
        "Unique identifiers must survive parallel workers.",
        "Cleanup belongs in fixture teardown.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Two tests share an account and fail only when run in parallel. Best fix?",
          options: [
            { id: "a", text: "Set workers: 1" },
            { id: "b", text: "Give each test its own account or seeded data" },
            { id: "c", text: "Add retries" },
            { id: "d", text: "Add waitForTimeout between tests" },
          ],
          correct: "b",
          explanation:
            "Serialising the suite hides the coupling and gives up all parallel speed. Isolation removes the cause.",
        },
      ],
    },
    {
      id: "e2e-ci",
      slug: "running-e2e-in-ci",
      title: "Running E2E in CI",
      moduleId: "e2e-automation",
      summary:
        "Making the suite behave the same on a GitHub runner as it does on your laptop.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Configure the run for CI",
        "Publish reports and traces as artifacts",
        "Shard a long suite",
      ],
      sections: [
        {
          kind: "code",
          title: "CI-aware config",
          language: "ts",
          code: `
export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
`,
        },
        {
          kind: "code",
          title: "The GitHub Actions job",
          language: "text",
          code: `
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: npm }

- run: npm ci
- run: npx playwright install --with-deps
- run: npm run build
- run: npx playwright test

- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 14
`,
          caption:
            "`--with-deps` installs the system libraries the browsers need on a bare Linux runner.",
        },
        {
          kind: "code",
          title: "Sharding a long suite",
          language: "bash",
          code: `
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
`,
          caption:
            "Run the shards as a matrix, then merge the blob reports into one HTML report.",
        },
        {
          kind: "table",
          title: "Local vs. CI differences to expect",
          headers: ["Difference", "Consequence"],
          rows: [
            ["Slower, contended CPU", "Animations and transitions take longer"],
            ["No GPU", "Canvas and WebGL rendering can differ"],
            ["Different fonts", "Visual baselines mismatch"],
            ["Cold start", "The first test absorbs server warm-up"],
            ["Different timezone/locale", "Date formatting assertions break"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Pin the timezone and locale",
          body: [
            "Set `use: { timezoneId: 'UTC', locale: 'en-US' }` so date and currency assertions behave identically everywhere.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting --with-deps",
          body: "Browsers fail to launch on a clean Ubuntu runner with a cryptic shared-library error.",
        },
        {
          title: "Uploading artifacts only on success",
          body: "You need the report precisely when the job failed. Use `if: always()`.",
        },
      ],
      keyTakeaways: [
        "Retries, reporters and workers should differ between local and CI.",
        "Always upload the HTML report, especially on failure.",
        "Pin timezone and locale to remove a whole class of CI-only failures.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why does `npx playwright install --with-deps` matter in CI?",
          options: [
            { id: "a", text: "It installs npm dependencies" },
            { id: "b", text: "It installs the OS libraries the browsers need" },
            { id: "c", text: "It enables tracing" },
            { id: "d", text: "It configures sharding" },
          ],
          correct: "b",
          explanation:
            "A bare Linux runner lacks the shared libraries Chromium, Firefox and WebKit require.",
        },
      ],
    },
  ],
};

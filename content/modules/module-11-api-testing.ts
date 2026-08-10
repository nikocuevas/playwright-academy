import type { Module } from "../types";

export const apiModule: Module = {
  id: "api-testing",
  order: 11,
  title: "API Testing",
  tagline: "Test the layer underneath the UI — and combine the two",
  summary:
    "APIRequestContext, request/response assertions, and the hybrid API+UI strategy that makes E2E suites fast and precise.",
  difficulty: "intermediate",
  icon: "Network",
  track: "integration",
  lessons: [
    {
      id: "api-basics",
      slug: "api-requests-with-playwright",
      title: "Making API requests",
      moduleId: "api-testing",
      summary:
        "The request fixture, the HTTP verbs, and asserting on a response.",
      difficulty: "intermediate",
      estimatedTime: 15,
      objectives: [
        "Send GET, POST, PUT, PATCH and DELETE requests",
        "Assert on status, headers and body",
        "Understand what the request fixture shares with the browser",
      ],
      sections: [
        {
          kind: "text",
          title: "Why test the API from a browser-automation tool",
          body: [
            "Because the interesting tests are the ones that cross layers. Playwright's `request` fixture speaks HTTP directly and — crucially — shares cookies with the browser context, so you can create data through the API and verify it in the UI within one test.",
          ],
        },
        {
          kind: "code",
          title: "GET and assertions",
          language: "ts",
          code: `
test('lists products', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const body = await response.json();
  expect(body.products.length).toBeGreaterThan(0);
  expect(body.products[0]).toHaveProperty('price');
});
`,
        },
        {
          kind: "code",
          title: "The other verbs",
          language: "ts",
          code: `
await request.post('/api/orders', {
  data: { items: [{ productId: 'p-1001', quantity: 2 }] },
});

await request.put('/api/cart', { data: { items: [] } });

await request.patch('/api/orders/ORD-839472', {
  data: { status: 'cancelled' },
});

await request.delete('/api/cart/p-1001');

// Query string and headers
await request.get('/api/products', {
  params: { category: 'audio', sort: 'price' },
  headers: { 'X-Request-Id': 'test-123' },
});
`,
        },
        {
          kind: "code",
          title: "Response assertions",
          language: "ts",
          code: `
// Web-first assertion for responses — retries the check
await expect(response).toBeOK();

// Plain value assertions on the parsed body
const order = await response.json();
expect(order).toMatchObject({
  status: 'pending',
  orderNumber: expect.stringMatching(/^ORD-\\d{6}$/),
});
expect(order.total).toBeCloseTo(529.0, 2);
`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "request shares the browser session",
          body: [
            "Inside a test, the `request` fixture uses the same storage state as `page`. If storageState signed you in, your API calls are authenticated too. For a deliberately unauthenticated call, create a standalone context with `playwright.request.newContext()`.",
          ],
        },
        {
          kind: "code",
          title: "An independent request context",
          language: "ts",
          code: `
import { request as playwrightRequest } from '@playwright/test';

const anonymous = await playwrightRequest.newContext({
  baseURL: 'http://localhost:3000',
});

const res = await anonymous.get('/api/orders');
expect(res.status()).toBe(401);

await anonymous.dispose();
`,
        },
      ],
      commonMistakes: [
        {
          title: "Using `body` instead of `data`",
          body: "Playwright serialises the `data` option as JSON. `body` is for raw payloads.",
        },
        {
          title: "Assuming the request fixture is anonymous",
          body: "It inherits the test's session. Create a separate context when you need to test the unauthenticated path.",
        },
      ],
      keyTakeaways: [
        "`request` gives you a full HTTP client that shares the browser's cookies.",
        "`data` serialises JSON; `params` builds the query string.",
        "`expect(response).toBeOK()` is the web-first response assertion.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which option sends a JSON body with request.post?",
          options: [
            { id: "a", text: "body" },
            { id: "b", text: "data" },
            { id: "c", text: "json" },
            { id: "d", text: "payload" },
          ],
          correct: "b",
          explanation:
            "`data` is serialised to JSON with the correct content-type header set automatically.",
        },
      ],
      playground: ["api"],
    },
    {
      id: "api-hybrid",
      slug: "api-plus-ui-hybrid-testing",
      title: "Hybrid API + UI testing",
      moduleId: "api-testing",
      summary:
        "Set up through the API, act through the UI, verify through both. The highest-value pattern in this platform.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Seed state through the API to skip slow UI setup",
        "Verify a UI action landed correctly in the backend",
        "Decide which layer should own which assertion",
      ],
      sections: [
        {
          kind: "diagram",
          title: "The pattern",
          ascii: `API creates the data          (fast, deterministic)
        ↓
UI opens the page
        ↓
UI verifies the data is shown
        ↓
UI performs the action under test
        ↓
API validates the resulting state`,
        },
        {
          kind: "text",
          title: "Why it is worth the effort",
          body: [
            "Driving setup through the UI is slow and couples every test to screens that are not under test. If a test is about *cancelling* an order, the order should exist before the browser opens.",
            "Verifying through the API closes the other gap: a UI can show a success toast while writing the wrong thing to the backend. Checking both layers catches that.",
          ],
        },
        {
          kind: "code",
          title: "Seed via API, act via UI, verify via API",
          language: "ts",
          code: `
test('cancelling an order updates the backend', async ({ page, request }) => {
  // 1. Seed — no UI involved
  const created = await request.post('/api/orders', {
    data: { items: [{ productId: 'p-1001', quantity: 1 }] },
  });
  expect(created.ok()).toBeTruthy();
  const { orderNumber } = await created.json();

  // 2. Act through the UI
  await page.goto('/practice/shop/orders');
  const row = page.getByRole('row').filter({ hasText: orderNumber });
  await row.getByRole('button', { name: 'Cancel' }).click();

  // 3. Verify in the UI
  await expect(row.getByTestId('order-status')).toHaveText('Cancelled');

  // 4. Verify in the backend
  const check = await request.get(\`/api/orders/\${orderNumber}\`);
  expect((await check.json()).status).toBe('cancelled');
});
`,
        },
        {
          kind: "code",
          title: "Seeding storage directly for pure UI tests",
          language: "ts",
          code: `
// Skip login and cart-building entirely when they are not under test.
await page.addInitScript(() => {
  window.localStorage.setItem(
    'shopeasy:cart',
    JSON.stringify([{ productId: 'p-1001', quantity: 2 }]),
  );
});

await page.goto('/practice/shop/cart');
await expect(page.getByTestId('cart-item')).toHaveCount(1);
`,
          caption:
            "`addInitScript` runs before the page's own scripts, so the state is there from the first render.",
        },
        {
          kind: "table",
          title: "Which layer owns which assertion",
          headers: ["Question", "Layer"],
          rows: [
            ["Is the button reachable and labelled correctly?", "UI"],
            ["Does the confirmation show the right order number?", "UI"],
            ["Was the order persisted with the right total?", "API"],
            ["Is the payment status consistent with the order status?", "API or database"],
            ["Does the page work on mobile?", "UI"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Do not seed the thing you are testing",
          body: [
            "If the test is about the checkout flow, checkout must happen through the UI. Seeding is for the *preconditions*, never for the behaviour under test.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Seeding through the API and then never using the UI",
          body: "That is an API test wearing a browser costume — and it pays the cost of a browser for nothing.",
        },
        {
          title: "Assuming the UI assertion proves persistence",
          body: "Optimistic UI updates render success before the server responds. Verify the backend when persistence matters.",
        },
      ],
      keyTakeaways: [
        "Seed preconditions through the API; exercise the behaviour through the UI.",
        "Verify at both layers when persistence is part of the requirement.",
        "addInitScript seeds browser storage before the app boots.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt:
            "A test verifies that cancelling an order works. Which part should NOT be done through the API?",
          options: [
            { id: "a", text: "Creating the order to cancel" },
            { id: "b", text: "Clicking Cancel" },
            { id: "c", text: "Checking the final stored status" },
            { id: "d", text: "Logging in" },
          ],
          correct: "b",
          explanation:
            "The cancel action is the behaviour under test, so it must go through the interface a user would use.",
        },
      ],
      challenges: ["ch-api-products"],
      playground: ["api"],
    },
    {
      id: "api-contracts",
      slug: "contract-and-schema-checks",
      title: "Contract and schema checks",
      moduleId: "api-testing",
      summary:
        "Catching a breaking API change before it reaches the UI suite.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Assert the shape of a response, not just its values",
        "Write a lightweight schema check without extra dependencies",
        "Cover error responses as deliberately as success ones",
      ],
      sections: [
        {
          kind: "text",
          title: "Values change; shapes should not",
          body: [
            "Asserting `total === 529` breaks whenever the data changes. Asserting that `total` exists and is a number catches the change that actually matters: a renamed or removed field.",
          ],
        },
        {
          kind: "code",
          title: "A dependency-free shape check",
          language: "ts",
          code: `
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
};

function assertProductShape(value: unknown): asserts value is Product {
  const p = value as Record<string, unknown>;
  expect(typeof p.id).toBe('string');
  expect(typeof p.name).toBe('string');
  expect(typeof p.price).toBe('number');
  expect(typeof p.category).toBe('string');
  expect(typeof p.inStock).toBe('boolean');
}

test('product contract holds', async ({ request }) => {
  const { products } = await (await request.get('/api/products')).json();
  for (const product of products) assertProductShape(product);
});
`,
        },
        {
          kind: "code",
          title: "Error responses deserve tests too",
          language: "ts",
          code: `
test('rejects an unknown product', async ({ request }) => {
  const res = await request.get('/api/products/does-not-exist');

  expect(res.status()).toBe(404);
  expect(await res.json()).toMatchObject({ error: 'Product not found' });
});

test('rejects an invalid order payload', async ({ request }) => {
  const res = await request.post('/api/orders', { data: { items: [] } });

  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain('at least one item');
});
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Where these tests pay off",
          body: [
            "Contract tests run in seconds and fail with a precise message. Without them, a renamed field shows up as fifteen unrelated UI tests timing out on a missing element.",
          ],
        },
        {
          kind: "table",
          title: "Coverage checklist per endpoint",
          headers: ["Case", "Expected"],
          rows: [
            ["Happy path", "2xx and the documented shape"],
            ["Missing resource", "404 with an error message"],
            ["Invalid payload", "400 with a useful validation message"],
            ["Unauthenticated", "401"],
            ["Wrong role", "403"],
            ["Pagination / filters", "Correct subset and count"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing 200 responses",
          body: "Error handling is where most integration bugs live.",
        },
        {
          title: "Asserting exact values from live data",
          body: "The test then fails whenever the data changes rather than when the contract breaks.",
        },
      ],
      keyTakeaways: [
        "Assert shapes for stability; assert values only for seeded data.",
        "Error paths need the same coverage as success paths.",
        "Contract failures are far cheaper to diagnose than cascading UI timeouts.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why prefer a shape assertion over an exact value assertion on live data?",
          options: [
            { id: "a", text: "It runs faster" },
            { id: "b", text: "It fails when the contract breaks, not when the data changes" },
            { id: "c", text: "Playwright cannot compare numbers" },
            { id: "d", text: "It needs no await" },
          ],
          correct: "b",
          explanation:
            "The point of a contract test is to detect structural changes, not data drift.",
        },
      ],
    },
    {
      id: "api-the-practice-api",
      slug: "the-shopeasy-api",
      title: "The ShopEasy API",
      moduleId: "api-testing",
      summary:
        "The endpoints this platform ships, so you can write real API tests locally.",
      difficulty: "intermediate",
      estimatedTime: 10,
      objectives: [
        "Know the available endpoints and payloads",
        "Write API tests against the running app",
        "Understand the in-memory data model",
      ],
      sections: [
        {
          kind: "table",
          title: "Endpoints",
          headers: ["Method & path", "Purpose"],
          rows: [
            ["POST /api/auth/login", "Authenticate; returns the user and sets a session cookie"],
            ["POST /api/auth/logout", "Clear the session"],
            ["GET /api/products", "List products; supports ?category=, ?q=, ?sort="],
            ["GET /api/products/[id]", "One product, or 404"],
            ["GET /api/cart", "Current cart"],
            ["POST /api/cart", "Add an item"],
            ["PATCH /api/cart", "Change a quantity"],
            ["DELETE /api/cart", "Remove an item or clear the cart"],
            ["GET /api/orders", "Order history"],
            ["POST /api/orders", "Place an order; returns an ORD-###### number"],
            ["GET /api/orders/[id]", "One order"],
            ["GET /api/messages", "Support messages"],
            ["POST /api/messages", "Send a message"],
          ],
        },
        {
          kind: "code",
          title: "A test you can run right now",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';

test('products endpoint supports filtering', async ({ request }) => {
  const all = await request.get('/api/products');
  const audio = await request.get('/api/products', {
    params: { category: 'audio' },
  });

  const allBody = await all.json();
  const audioBody = await audio.json();

  expect(audioBody.products.length).toBeLessThan(allBody.products.length);
  expect(audioBody.products.every((p) => p.category === 'audio')).toBe(true);
});
`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "The data is deliberately simulated",
          body: [
            "Products come from a fixed catalogue; carts and orders live in an in-memory store keyed by a session cookie. That keeps the platform free to deploy and makes every exercise deterministic — but it also means data resets when the server restarts, and it is not shared between Vercel serverless instances.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Expecting orders to persist forever",
          body: "The store is in-memory. Create what you need inside the test rather than relying on data from a previous run.",
        },
      ],
      keyTakeaways: [
        "The platform ships a small but complete REST surface for practice.",
        "Cart and order state is session-scoped and in-memory.",
        "Every exercise is reproducible from a clean state.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which endpoint places an order?",
          options: [
            { id: "a", text: "PUT /api/cart" },
            { id: "b", text: "POST /api/orders" },
            { id: "c", text: "POST /api/checkout" },
            { id: "d", text: "GET /api/orders/new" },
          ],
          correct: "b",
          explanation:
            "It returns the generated ORD-###### number used throughout the E2E exercises.",
        },
      ],
    },
  ],
};

import type { Module } from "../types";

export const networkModule: Module = {
  id: "network-interception",
  order: 12,
  title: "Network Interception",
  tagline: "Control every request the page makes",
  summary:
    "page.route, fulfil, continue and abort — mocking data, forcing errors, simulating slowness and asserting on what the UI sends.",
  difficulty: "advanced",
  icon: "Radio",
  track: "integration",
  lessons: [
    {
      id: "net-route",
      slug: "intercepting-with-page-route",
      title: "Intercepting with page.route",
      moduleId: "network-interception",
      summary:
        "The handler signature, URL patterns, and the three things you can do with a request.",
      difficulty: "advanced",
      estimatedTime: 15,
      objectives: [
        "Register a route handler",
        "Choose between fulfil, continue and abort",
        "Match URLs precisely",
      ],
      sections: [
        {
          kind: "text",
          title: "The idea",
          body: [
            "`page.route()` puts your code between the browser and the network. Every matching request pauses and hands you a `Route` object. You then decide what happens: answer it yourself, let it through (possibly modified), or fail it.",
          ],
        },
        {
          kind: "diagram",
          title: "Where the handler sits",
          ascii: `Page requests /api/products
        │
        ▼
   your route handler
        │
   ┌────┼─────────┬──────────┐
   ▼    ▼         ▼          ▼
fulfil  continue  continue   abort
(mock)  (as-is)   (modified) (fail)`,
        },
        {
          kind: "code",
          title: "The three outcomes",
          language: "ts",
          code: `
// 1. Answer it yourself — the server is never contacted
await page.route('**/api/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ products: [] }),
  });
});

// 2. Let it through untouched (or with changes)
await page.route('**/api/**', async (route) => {
  await route.continue({
    headers: { ...route.request().headers(), 'X-Test-Run': 'true' },
  });
});

// 3. Fail it
await page.route('**/*.{png,jpg,webp}', (route) => route.abort());
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Register routes before navigating",
          body: [
            "A handler added after `page.goto()` misses every request that has already fired. Set routes up first.",
          ],
        },
        {
          kind: "table",
          title: "Pattern matching",
          headers: ["Pattern", "Matches"],
          rows: [
            ["'**/api/products'", "Any host, that path"],
            ["'**/api/products?**'", "The path with any query string"],
            ["/\\/api\\/orders\\/\\d+/", "Regex — /api/orders/123"],
            ["(url) => url.pathname.startsWith('/api')", "Predicate function"],
          ],
        },
        {
          kind: "code",
          title: "Scope and cleanup",
          language: "ts",
          code: `
// Whole context — applies to every page in it
await context.route('**/api/**', handler);

// Remove a handler mid-test
await page.unroute('**/api/products');

// Only intercept the first N matching requests
await page.route('**/api/products', handler, { times: 1 });
`,
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting to resolve the route",
          body: "Every handler must call fulfill, continue or abort. Otherwise the request hangs until the test times out.",
        },
        {
          title: "A pattern that matches more than intended",
          body: "`'**/api/*'` also catches `/api/auth`. Be specific, or check `route.request().url()` inside the handler.",
        },
      ],
      keyTakeaways: [
        "Every route handler must resolve the route exactly once.",
        "Register handlers before the navigation that triggers the requests.",
        "context.route applies to every page; page.route to one.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "The test hangs and times out. Why?",
          code: `await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const body = await response.json();
  console.log(body);
});`,
          options: [
            { id: "a", text: "route.fetch() is not a function" },
            { id: "b", text: "The handler never calls fulfill, continue or abort" },
            { id: "c", text: "The pattern is wrong" },
            { id: "d", text: "console.log blocks the handler" },
          ],
          correct: "b",
          explanation:
            "After inspecting the response you must resolve the route, e.g. `await route.fulfill({ response })`.",
        },
      ],
      playground: ["network"],
    },
    {
      id: "net-mocking",
      slug: "mocking-responses",
      title: "Mocking responses and edge-case states",
      moduleId: "network-interception",
      summary:
        "Empty lists, server errors, slow endpoints — the states that are almost impossible to produce with real data.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Mock a successful payload",
        "Force error and empty states",
        "Simulate latency deliberately",
      ],
      sections: [
        {
          kind: "code",
          title: "Deterministic product data",
          language: "ts",
          code: `
test('renders exactly the products the API returns', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: [
          { id: 'p-1', name: 'Test Product A', price: 10, category: 'audio', inStock: true },
          { id: 'p-2', name: 'Test Product B', price: 20, category: 'audio', inStock: false },
        ],
      }),
    });
  });

  await page.goto('/practice/shop');

  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByText('Test Product A')).toBeVisible();
});
`,
        },
        {
          kind: "code",
          title: "The empty state",
          language: "ts",
          code: `
await page.route('**/api/products', (route) =>
  route.fulfill({ json: { products: [] } }),
);

await page.goto('/practice/shop');
await expect(page.getByText('No products match your search')).toBeVisible();
`,
          caption: "`json:` is shorthand for JSON body plus content-type.",
        },
        {
          kind: "code",
          title: "Server errors",
          language: "ts",
          code: `
await page.route('**/api/products', (route) =>
  route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }),
);

await page.goto('/practice/shop');

await expect(page.getByRole('alert')).toContainText(
  'Something went wrong loading products',
);
await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
`,
        },
        {
          kind: "code",
          title: "Slow responses and loading states",
          language: "ts",
          code: `
await page.route('**/api/products', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await route.continue();
});

await page.goto('/practice/shop');

await expect(page.getByTestId('products-skeleton')).toBeVisible();
await expect(page.getByRole('article').first()).toBeVisible({ timeout: 10_000 });
`,
        },
        {
          kind: "code",
          title: "Modifying a real response",
          language: "ts",
          code: `
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const body = await response.json();

  // Keep the real payload; mark the first item out of stock.
  body.products[0].inStock = false;

  await route.fulfill({ response, json: body });
});
`,
          caption:
            "The best of both: real data, one controlled deviation.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Mocks drift",
          body: [
            "A mocked payload is a copy of a contract that lives somewhere else. When the API changes, the mock keeps your UI test green while production breaks. Pair mocked UI tests with unmocked contract tests against the real endpoint.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Mocking every endpoint by default",
          body: "The suite stops testing integration entirely. Mock the states you cannot otherwise reach.",
        },
        {
          title: "Hand-writing a mock that does not match the real shape",
          body: "Capture a real response once and trim it, rather than inventing the structure.",
        },
      ],
      keyTakeaways: [
        "Mocking is the only practical way to test empty, error and slow states.",
        "`route.fetch()` plus `fulfill({ response, json })` modifies real data.",
        "Every mock needs a contract test somewhere to keep it honest.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is the best reason to mock an endpoint?",
          options: [
            { id: "a", text: "To make tests faster" },
            { id: "b", text: "To reach states real data cannot produce — errors, empty lists, latency" },
            { id: "c", text: "To avoid needing a backend at all" },
            { id: "d", text: "Because mocking is always more reliable" },
          ],
          correct: "b",
          explanation:
            "Speed is a side benefit. The real value is deterministic access to hard-to-reach states.",
        },
      ],
      challenges: ["ch-mock-products"],
      playground: ["network"],
    },
    {
      id: "net-request-validation",
      slug: "validating-outgoing-requests",
      title: "Validating what the UI sends",
      moduleId: "network-interception",
      summary:
        "Catching the bug where the screen says success but the payload was wrong.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Inspect method, headers and body of an outgoing request",
        "Assert on a payload without blocking the request",
        "Record all requests a flow produces",
      ],
      sections: [
        {
          kind: "code",
          title: "Assert on the payload, then let it through",
          language: "ts",
          code: `
await page.route('**/api/messages', async (route) => {
  const request = route.request();

  expect(request.method()).toBe('POST');
  expect(request.postDataJSON()).toMatchObject({
    subject: 'Where is my order?',
    message: expect.stringContaining('ORD-'),
  });

  await route.continue();
});

await page.getByRole('button', { name: 'Send Message' }).click();
await expect(page.getByText('Message sent successfully!')).toBeVisible();
`,
        },
        {
          kind: "code",
          title: "Recording every request in a flow",
          language: "ts",
          code: `
const apiCalls: string[] = [];

page.on('request', (request) => {
  if (request.url().includes('/api/')) {
    apiCalls.push(\`\${request.method()} \${new URL(request.url()).pathname}\`);
  }
});

await completeCheckout(page);

expect(apiCalls).toEqual([
  'GET /api/cart',
  'POST /api/orders',
  'GET /api/orders',
]);
`,
          caption:
            "Useful for catching duplicate submissions and N+1 request storms.",
        },
        {
          kind: "code",
          title: "Checking headers",
          language: "ts",
          code: `
await page.route('**/api/**', async (route) => {
  const headers = route.request().headers();
  expect(headers['content-type']).toContain('application/json');
  await route.continue();
});
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "A real bug this catches",
          body: [
            "A quantity selector shows 3 in the UI but posts `quantity: 1`. Every UI assertion passes; the order is wrong. Only a payload assertion sees it.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Throwing inside a route handler",
          body: "A failed assertion inside the handler can leave the route unresolved. Collect the data, resolve the route, then assert after.",
        },
        {
          title: "Attaching page.on('request') after the action",
          body: "Listeners only see events fired after they attach.",
        },
      ],
      keyTakeaways: [
        "Route handlers can assert on a request and still let it through.",
        "page.on('request') gives you a full log of a flow's network calls.",
        "Payload assertions catch bugs the UI happily hides.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "How do you read a POST body inside a route handler?",
          options: [
            { id: "a", text: "route.body()" },
            { id: "b", text: "route.request().postDataJSON()" },
            { id: "c", text: "await route.json()" },
            { id: "d", text: "route.request().body()" },
          ],
          correct: "b",
          explanation:
            "`postDataJSON()` parses the body; `postData()` gives you the raw string.",
        },
      ],
      playground: ["network"],
    },
    {
      id: "net-har",
      slug: "har-recording-and-replay",
      title: "HAR recording and offline replay",
      moduleId: "network-interception",
      summary:
        "Record real traffic once, replay it forever — deterministic tests with realistic data.",
      difficulty: "advanced",
      estimatedTime: 11,
      objectives: [
        "Record a HAR file from a real session",
        "Replay it in tests",
        "Weigh realism against staleness",
      ],
      sections: [
        {
          kind: "code",
          title: "Record",
          language: "ts",
          code: `
await page.routeFromHAR('har/shop.har', {
  url: '**/api/**',
  update: true,      // record on this run
});

await page.goto('/practice/shop');
`,
        },
        {
          kind: "code",
          title: "Replay",
          language: "ts",
          code: `
await page.routeFromHAR('har/shop.har', {
  url: '**/api/**',
  update: false,          // replay only
  notFound: 'abort',      // fail loudly on an unrecorded request
});

await page.goto('/practice/shop');
await expect(page.getByRole('article')).toHaveCount(6);
`,
        },
        {
          kind: "table",
          title: "HAR vs. hand-written mocks",
          headers: ["", "HAR", "Hand-written"],
          rows: [
            ["Realism", "Exactly what the server sent", "Whatever you typed"],
            ["Effort", "Record once", "Write and maintain each shape"],
            ["Readability", "Large opaque JSON", "Explicit and reviewable"],
            ["Staleness", "Silent — until you re-record", "Visible in the diff"],
            ["Best for", "Complex third-party payloads", "Targeted edge cases"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Scrub before committing",
          body: [
            "HAR files capture headers and bodies verbatim — including auth tokens, cookies and personal data. Review and redact before they enter the repository.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Committing a HAR with real credentials",
          body: "Treat a HAR like a log file: assume it contains secrets until you have checked.",
        },
        {
          title: "Leaving update: true in the committed test",
          body: "The recording is rewritten on every run and the test silently stops asserting anything stable.",
        },
      ],
      keyTakeaways: [
        "routeFromHAR records and replays real traffic.",
        "`notFound: 'abort'` surfaces requests the recording does not cover.",
        "HARs may contain secrets — scrub them.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is the biggest risk of committing a HAR file?",
          options: [
            { id: "a", text: "File size" },
            { id: "b", text: "It can contain auth tokens and personal data" },
            { id: "c", text: "It only works in Chromium" },
            { id: "d", text: "It slows tests down" },
          ],
          correct: "b",
          explanation:
            "HAR captures full headers and bodies. Redact before committing.",
        },
      ],
    },
  ],
};

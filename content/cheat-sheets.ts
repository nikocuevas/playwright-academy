import type { Language } from "@/lib/highlight";

export type CheatEntry = {
  code: string;
  description: string;
  language?: Language;
};

export type CheatSection = {
  title: string;
  entries: CheatEntry[];
};

export type CheatSheet = {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  sections: CheatSection[];
};

export const cheatSheets: CheatSheet[] = [
  {
    id: "javascript-typescript",
    title: "JavaScript & TypeScript",
    tagline: "The language features that appear in test code",
    icon: "Braces",
    sections: [
      {
        title: "Declarations",
        entries: [
          { code: "const x = 1;", description: "Cannot be reassigned — the default" },
          { code: "let i = 0;", description: "Reassignable; use for counters" },
          { code: "const { page } = fixtures;", description: "Object destructuring" },
          { code: "const [a, b] = list;", description: "Array destructuring" },
          { code: "const copy = { ...original };", description: "Shallow copy via spread" },
        ],
      },
      {
        title: "Functions",
        entries: [
          { code: "const f = (a, b) => a + b;", description: "Arrow with implicit return" },
          { code: "const f = async () => { await x(); };", description: "Async arrow" },
          { code: "function f(a = 1) {}", description: "Default parameter" },
        ],
      },
      {
        title: "Async",
        entries: [
          { code: "await promise;", description: "Wait for a promise to settle" },
          { code: "await Promise.all([a, b]);", description: "Run concurrently, wait for both" },
          { code: "try { await x(); } catch (e) {}", description: "Handle a rejection" },
        ],
      },
      {
        title: "Arrays",
        entries: [
          { code: "list.map((x) => x * 2)", description: "Transform every element" },
          { code: "list.filter((x) => x > 2)", description: "Keep matching elements" },
          { code: "list.find((x) => x.id === 1)", description: "First match or undefined" },
          { code: "list.some(fn) / list.every(fn)", description: "Any / all match" },
          { code: "for (const x of list) { await f(x); }", description: "Loop that can await" },
        ],
      },
      {
        title: "TypeScript",
        entries: [
          { code: "const s: string = 'a';", description: "Type annotation" },
          { code: "type User = { email: string; phone?: string };", description: "Object shape, optional property" },
          { code: "type Status = 'paid' | 'shipped';", description: "Union of literals" },
          { code: "import { type Page } from '@playwright/test';", description: "Type-only import" },
        ],
      },
    ],
  },
  {
    id: "locators",
    title: "Locators",
    tagline: "Finding elements, in priority order",
    icon: "Crosshair",
    sections: [
      {
        title: "Built-in locators",
        entries: [
          { code: "page.getByRole('button', { name: 'Login' })", description: "Role + accessible name — the default choice" },
          { code: "page.getByLabel('Email')", description: "Form field by its label" },
          { code: "page.getByPlaceholder('Search products')", description: "Input by placeholder" },
          { code: "page.getByText('Order Successful!')", description: "Visible text" },
          { code: "page.getByTestId('cart-count')", description: "data-testid attribute" },
          { code: "page.getByAltText('Product photo')", description: "Image alt text" },
          { code: "page.getByTitle('Close')", description: "title attribute" },
        ],
      },
      {
        title: "Options",
        entries: [
          { code: "{ exact: true }", description: "Exact, case-sensitive match" },
          { code: "{ name: /ORD-\\d+/ }", description: "Regex name match" },
          { code: "{ level: 1 }", description: "Heading level" },
          { code: "{ checked: true }", description: "Checkbox / radio state" },
        ],
      },
      {
        title: "CSS and XPath",
        entries: [
          { code: "page.locator('input[name=\"email\"]')", description: "Attribute selector — stable" },
          { code: "page.locator('[data-product-id]')", description: "Attribute present, any value" },
          { code: "page.locator('[id^=\"input-\"]')", description: "Starts-with match" },
          { code: "page.locator('//tr[td=\"ORD-1\"]')", description: "XPath — rarely needed" },
        ],
      },
      {
        title: "Chaining and filtering",
        entries: [
          { code: "card.getByRole('button', { name: 'Add' })", description: "Search inside a locator" },
          { code: "rows.filter({ hasText: 'ORD-1' })", description: "Filter by content" },
          { code: "rows.filter({ has: page.getByRole('button') })", description: "Filter by a descendant" },
          { code: "rows.filter({ hasNotText: 'Cancelled' })", description: "Filter by absence" },
          { code: "items.first() / .last() / .nth(2)", description: "Positional selection" },
        ],
      },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    tagline: "Everything a user can do",
    icon: "MousePointerClick",
    sections: [
      {
        title: "Core",
        entries: [
          { code: "await locator.click()", description: "Click after actionability checks" },
          { code: "await locator.dblclick()", description: "Double click" },
          { code: "await locator.fill('text')", description: "Set an input's value" },
          { code: "await locator.clear()", description: "Empty an input" },
          { code: "await locator.pressSequentially('abc')", description: "One key at a time" },
          { code: "await locator.press('Enter')", description: "Single key press" },
        ],
      },
      {
        title: "Form controls",
        entries: [
          { code: "await locator.check()", description: "Tick a checkbox or radio (idempotent)" },
          { code: "await locator.uncheck()", description: "Untick a checkbox" },
          { code: "await locator.setChecked(true)", description: "Set the state explicitly" },
          { code: "await locator.selectOption('CA')", description: "Select by value" },
          { code: "await locator.selectOption({ label: 'Canada' })", description: "Select by label" },
          { code: "await locator.setInputFiles('a.png')", description: "Upload a file" },
        ],
      },
      {
        title: "Pointer and keyboard",
        entries: [
          { code: "await locator.hover()", description: "Move the pointer over it" },
          { code: "await source.dragTo(target)", description: "Drag and drop" },
          { code: "await page.keyboard.press('ControlOrMeta+A')", description: "Cross-platform shortcut" },
          { code: "await page.mouse.move(x, y, { steps: 10 })", description: "Low-level move" },
        ],
      },
      {
        title: "Navigation",
        entries: [
          { code: "await page.goto('/cart')", description: "Navigate, relative to baseURL" },
          { code: "await page.reload()", description: "Reload the page" },
          { code: "await page.goBack()", description: "History back" },
        ],
      },
    ],
  },
  {
    id: "assertions",
    title: "Assertions",
    tagline: "Web-first assertions retry; value assertions do not",
    icon: "CircleCheck",
    sections: [
      {
        title: "Visibility and presence",
        entries: [
          { code: "await expect(l).toBeVisible()", description: "Rendered and visible" },
          { code: "await expect(l).toBeHidden()", description: "Hidden or absent" },
          { code: "await expect(l).toBeAttached()", description: "In the DOM" },
          { code: "await expect(l).toHaveCount(3)", description: "Exact number of matches (retries)" },
        ],
      },
      {
        title: "Text and values",
        entries: [
          { code: "await expect(l).toHaveText('Done')", description: "Exact, whitespace-normalised" },
          { code: "await expect(l).toContainText('one')", description: "Substring" },
          { code: "await expect(l).toHaveText(['a', 'b'])", description: "One expectation per matched element" },
          { code: "await expect(l).toHaveValue('x')", description: "Form control value" },
          { code: "await expect(l).toBeEmpty()", description: "No text or value" },
        ],
      },
      {
        title: "State",
        entries: [
          { code: "await expect(l).toBeEnabled()", description: "Not disabled" },
          { code: "await expect(l).toBeChecked()", description: "Checkbox or radio is ticked" },
          { code: "await expect(l).toBeEditable()", description: "Accepts input" },
          { code: "await expect(l).toHaveAttribute('href', /cart/)", description: "Attribute matches" },
        ],
      },
      {
        title: "Page and response",
        entries: [
          { code: "await expect(page).toHaveURL(/orders/)", description: "Current URL" },
          { code: "await expect(page).toHaveTitle(/ShopEasy/)", description: "Document title" },
          { code: "await expect(response).toBeOK()", description: "2xx status" },
        ],
      },
      {
        title: "Modifiers",
        entries: [
          { code: "await expect(l).not.toBeVisible()", description: "Negate any matcher" },
          { code: "await expect.soft(l).toHaveText('x')", description: "Record the failure, keep going" },
          { code: "await expect.poll(fn).toBe('paid')", description: "Retry an arbitrary async value" },
          { code: "await expect(fn).toPass()", description: "Retry a whole block" },
        ],
      },
    ],
  },
  {
    id: "waiting",
    title: "Waiting",
    tagline: "Wait for conditions, not durations",
    icon: "Timer",
    sections: [
      {
        title: "Automatic",
        entries: [
          { code: "await locator.click()", description: "Waits for attached, visible, stable, hit-testable, enabled" },
          { code: "await expect(l).toBeVisible()", description: "Polls until it passes or times out" },
        ],
      },
      {
        title: "Explicit",
        entries: [
          { code: "await locator.waitFor({ state: 'hidden' })", description: "Wait for an element state" },
          { code: "await page.waitForURL('/shop')", description: "Wait for navigation" },
          { code: "await page.waitForLoadState('domcontentloaded')", description: "Wait for a load state" },
          { code: "await page.waitForResponse('**/api/orders')", description: "Wait for a response" },
          { code: "await page.waitForRequest('**/api/orders')", description: "Wait for a request" },
          { code: "await page.waitForEvent('popup')", description: "Wait for a page event" },
        ],
      },
      {
        title: "Ordering",
        entries: [
          {
            code: "const [res] = await Promise.all([\n  page.waitForResponse('**/api/orders'),\n  button.click(),\n]);",
            description: "Register the wait BEFORE the trigger",
          },
        ],
      },
      {
        title: "Avoid",
        entries: [
          { code: "await page.waitForTimeout(3000)", description: "Fixed sleep — slow and still flaky" },
          { code: "await page.waitForLoadState('networkidle')", description: "Unreliable on modern apps" },
        ],
      },
    ],
  },
  {
    id: "authentication",
    title: "Authentication",
    tagline: "Log in once, reuse everywhere",
    icon: "KeyRound",
    sections: [
      {
        title: "Saving state",
        entries: [
          {
            code: "await page.context().storageState({ path: 'playwright/.auth/user.json' })",
            description: "Serialise cookies and localStorage after asserting the login worked",
          },
          {
            code: "await request.storageState({ path: 'playwright/.auth/user.json' })",
            description: "Same, from an API-only login",
          },
        ],
      },
      {
        title: "Using state",
        entries: [
          { code: "use: { storageState: 'playwright/.auth/user.json' }", description: "Apply to a project" },
          { code: "test.use({ storageState: { cookies: [], origins: [] } })", description: "Run a file signed out" },
          { code: "dependencies: ['setup']", description: "Guarantee the setup project runs first" },
        ],
      },
      {
        title: "Inspecting",
        entries: [
          { code: "await context.cookies()", description: "Read the cookies" },
          { code: "await context.clearCookies()", description: "Clear the session" },
          { code: "await page.evaluate(() => localStorage)", description: "Read localStorage" },
        ],
      },
    ],
  },
  {
    id: "api",
    title: "API testing",
    tagline: "The request fixture",
    icon: "Network",
    sections: [
      {
        title: "Requests",
        entries: [
          { code: "await request.get('/api/products')", description: "GET" },
          { code: "await request.post('/api/orders', { data: {...} })", description: "POST with a JSON body" },
          { code: "await request.put(url, { data })", description: "PUT" },
          { code: "await request.patch(url, { data })", description: "PATCH" },
          { code: "await request.delete(url)", description: "DELETE" },
          { code: "{ params: { category: 'audio' } }", description: "Query string" },
          { code: "{ headers: { 'X-Trace': '1' } }", description: "Custom headers" },
        ],
      },
      {
        title: "Responses",
        entries: [
          { code: "response.ok()", description: "true for 2xx" },
          { code: "response.status()", description: "Numeric status" },
          { code: "await response.json()", description: "Parsed body" },
          { code: "await response.text()", description: "Raw body" },
          { code: "response.headers()", description: "Response headers" },
        ],
      },
      {
        title: "Standalone context",
        entries: [
          {
            code: "const ctx = await request.newContext({ baseURL });",
            description: "An unauthenticated client, independent of the test session",
          },
          { code: "await ctx.dispose()", description: "Clean it up" },
        ],
      },
    ],
  },
  {
    id: "network",
    title: "Network interception",
    tagline: "page.route and friends",
    icon: "Radio",
    sections: [
      {
        title: "Registering",
        entries: [
          { code: "await page.route('**/api/products', handler)", description: "One page" },
          { code: "await context.route('**/api/**', handler)", description: "Every page in the context" },
          { code: "await page.unroute('**/api/products')", description: "Remove a handler" },
          { code: "{ times: 1 }", description: "Only intercept the first N matches" },
        ],
      },
      {
        title: "Resolving",
        entries: [
          { code: "await route.fulfill({ json: { products: [] } })", description: "Answer it yourself" },
          { code: "await route.fulfill({ status: 500 })", description: "Force an error" },
          { code: "await route.continue()", description: "Let it through" },
          { code: "await route.continue({ headers })", description: "Modify then continue" },
          { code: "await route.abort()", description: "Fail the request" },
          { code: "const res = await route.fetch()", description: "Fetch the real response to modify it" },
        ],
      },
      {
        title: "Inspecting",
        entries: [
          { code: "route.request().method()", description: "HTTP method" },
          { code: "route.request().postDataJSON()", description: "Parsed request body" },
          { code: "page.on('request', handler)", description: "Log every request" },
          { code: "await page.routeFromHAR('file.har')", description: "Replay recorded traffic" },
        ],
      },
    ],
  },
  {
    id: "cli",
    title: "CLI & config",
    tagline: "Running, debugging and reporting",
    icon: "Terminal",
    sections: [
      {
        title: "Running",
        entries: [
          { code: "npx playwright test", description: "Run everything", language: "bash" },
          { code: "npx playwright test --ui", description: "Interactive UI mode", language: "bash" },
          { code: "npx playwright test --debug", description: "Step through with the Inspector", language: "bash" },
          { code: "npx playwright test --headed", description: "Watch the browser", language: "bash" },
          { code: "npx playwright test -g \"add to cart\"", description: "Filter by title", language: "bash" },
          { code: "npx playwright test --project=firefox", description: "One project", language: "bash" },
          { code: "npx playwright test --repeat-each=20", description: "Hunt flakiness", language: "bash" },
          { code: "npx playwright test --shard=1/4", description: "Shard across machines", language: "bash" },
        ],
      },
      {
        title: "Reporting",
        entries: [
          { code: "npx playwright show-report", description: "Open the HTML report", language: "bash" },
          { code: "npx playwright show-trace trace.zip", description: "Open a trace", language: "bash" },
          { code: "npx playwright merge-reports --reporter=html ./blob-report", description: "Merge sharded runs", language: "bash" },
        ],
      },
      {
        title: "Authoring",
        entries: [
          { code: "npx playwright codegen http://localhost:3000", description: "Record a draft test", language: "bash" },
          { code: "npx playwright install", description: "Download browser binaries", language: "bash" },
          { code: "npx playwright install --with-deps", description: "Also install OS libraries (CI)", language: "bash" },
        ],
      },
    ],
  },
  {
    id: "sql",
    title: "SQL for testers",
    tagline: "Reading and validating data",
    icon: "Database",
    sections: [
      {
        title: "Selecting",
        entries: [
          { code: "SELECT id, email FROM users;", description: "Specific columns", language: "sql" },
          { code: "SELECT DISTINCT category FROM products;", description: "Unique values", language: "sql" },
          { code: "SELECT total AS order_total FROM orders;", description: "Column alias", language: "sql" },
          { code: "SELECT * FROM orders LIMIT 10;", description: "Cap the result", language: "sql" },
        ],
      },
      {
        title: "Filtering",
        entries: [
          { code: "WHERE price > 100 AND in_stock = 1", description: "Combine conditions", language: "sql" },
          { code: "WHERE status IN ('paid', 'shipped')", description: "Set membership", language: "sql" },
          { code: "WHERE price BETWEEN 50 AND 200", description: "Inclusive range", language: "sql" },
          { code: "WHERE email LIKE '%@example.com'", description: "Pattern match", language: "sql" },
          { code: "WHERE phone IS NULL", description: "Missing value — never `= NULL`", language: "sql" },
        ],
      },
      {
        title: "Joining",
        entries: [
          { code: "JOIN orders o ON o.user_id = u.id", description: "Rows present in both", language: "sql" },
          { code: "LEFT JOIN orders o ON o.user_id = u.id", description: "Keep every left row", language: "sql" },
          { code: "LEFT JOIN … WHERE o.id IS NULL", description: "Find rows with no match", language: "sql" },
        ],
      },
      {
        title: "Aggregating",
        entries: [
          { code: "COUNT(*), SUM(total), AVG(total), MIN(x), MAX(x)", description: "Aggregate functions", language: "sql" },
          { code: "GROUP BY status", description: "Bucket rows", language: "sql" },
          { code: "HAVING COUNT(*) >= 2", description: "Filter groups (WHERE filters rows)", language: "sql" },
        ],
      },
      {
        title: "Subqueries",
        entries: [
          { code: "WHERE total > (SELECT AVG(total) FROM orders)", description: "Scalar subquery", language: "sql" },
          { code: "WHERE id IN (SELECT user_id FROM orders)", description: "Membership subquery", language: "sql" },
          { code: "-- NOT IN + NULL returns nothing; prefer LEFT JOIN", description: "The classic trap", language: "sql" },
        ],
      },
    ],
  },
];

export function getCheatSheet(id: string) {
  return cheatSheets.find((c) => c.id === id);
}

export type ApiEntry = {
  id: string;
  namespace:
    | "Page"
    | "Locator"
    | "Browser"
    | "BrowserContext"
    | "APIRequestContext"
    | "Route"
    | "Request"
    | "Response"
    | "Test"
    | "Expect";
  signature: string;
  summary: string;
  parameters: { name: string; type: string; description: string }[];
  returns: string;
  example: string;
  commonUse: string;
  mistakes: string[];
  /** Whether the browser playground can execute it. */
  simulated: boolean;
};

export const apiReference: ApiEntry[] = [
  // ---------------------------------------------------------------- Page ---
  {
    id: "page-goto",
    namespace: "Page",
    signature: "page.goto(url[, options])",
    summary: "Navigates to a URL and waits for the load state.",
    parameters: [
      { name: "url", type: "string", description: "Absolute, or relative to baseURL" },
      { name: "options.waitUntil", type: "'load' | 'domcontentloaded' | 'commit' | 'networkidle'", description: "When to consider navigation finished. Default 'load'." },
      { name: "options.timeout", type: "number", description: "Override the navigation timeout" },
    ],
    returns: "Promise<Response | null>",
    example: `await page.goto('/practice/shop');
await page.goto('/practice/shop', { waitUntil: 'domcontentloaded' });`,
    commonUse: "The first line of nearly every test.",
    mistakes: [
      "Hardcoding a full URL instead of configuring baseURL.",
      "Using waitUntil: 'networkidle' on an app that polls — it never settles.",
    ],
    simulated: true,
  },
  {
    id: "page-getbyrole",
    namespace: "Page",
    signature: "page.getByRole(role[, options])",
    summary: "Finds an element by its ARIA role and accessible name.",
    parameters: [
      { name: "role", type: "string", description: "button, link, textbox, checkbox, heading, article…" },
      { name: "options.name", type: "string | RegExp", description: "Accessible name; substring and case-insensitive by default" },
      { name: "options.exact", type: "boolean", description: "Require an exact, case-sensitive name match" },
      { name: "options.level", type: "number", description: "Heading level" },
      { name: "options.checked", type: "boolean", description: "Checkbox or radio state" },
    ],
    returns: "Locator",
    example: `page.getByRole('button', { name: 'Add to Cart' });
page.getByRole('heading', { name: 'Checkout', level: 1 });`,
    commonUse: "The default locator — it survives styling and id changes.",
    mistakes: [
      "Expecting a <div onclick> to have the button role.",
      "Forgetting that aria-label overrides visible text.",
    ],
    simulated: true,
  },
  {
    id: "page-getbylabel",
    namespace: "Page",
    signature: "page.getByLabel(text[, options])",
    summary: "Finds a form control by its associated label.",
    parameters: [
      { name: "text", type: "string | RegExp", description: "Label text" },
      { name: "options.exact", type: "boolean", description: "Exact match" },
    ],
    returns: "Locator",
    example: `await page.getByLabel('Email').fill('a@b.com');
await page.getByLabel('Password', { exact: true }).fill('secret');`,
    commonUse: "Filling forms.",
    mistakes: [
      "'Password' also matches 'Confirm Password' — pass { exact: true }.",
    ],
    simulated: true,
  },
  {
    id: "page-gettestid",
    namespace: "Page",
    signature: "page.getByTestId(id)",
    summary: "Finds an element by its data-testid attribute.",
    parameters: [{ name: "id", type: "string | RegExp", description: "Test id value" }],
    returns: "Locator",
    example: `await expect(page.getByTestId('cart-count')).toHaveText('2');`,
    commonUse: "Elements with no useful role or stable text.",
    mistakes: [
      "Using test ids for everything — they carry no accessibility signal.",
      "Forgetting to set testIdAttribute when the app uses data-qa.",
    ],
    simulated: true,
  },
  {
    id: "page-route",
    namespace: "Page",
    signature: "page.route(url, handler[, options])",
    summary: "Intercepts matching network requests.",
    parameters: [
      { name: "url", type: "string | RegExp | function", description: "Glob, regex or predicate" },
      { name: "handler", type: "(route, request) => Promise<void>", description: "Must resolve the route" },
      { name: "options.times", type: "number", description: "Only intercept the first N matches" },
    ],
    returns: "Promise<void>",
    example: `await page.route('**/api/products', (route) =>
  route.fulfill({ json: { products: [] } }),
);`,
    commonUse: "Mocking empty, error and slow states.",
    mistakes: [
      "Registering the route after page.goto().",
      "A handler that never calls fulfill/continue/abort — the test hangs.",
    ],
    simulated: false,
  },
  {
    id: "page-waitforresponse",
    namespace: "Page",
    signature: "page.waitForResponse(urlOrPredicate[, options])",
    summary: "Waits for a matching network response.",
    parameters: [
      { name: "urlOrPredicate", type: "string | RegExp | function", description: "Pattern or predicate" },
      { name: "options.timeout", type: "number", description: "How long to wait" },
    ],
    returns: "Promise<Response>",
    example: `const [response] = await Promise.all([
  page.waitForResponse('**/api/orders'),
  page.getByRole('button', { name: 'Place Order' }).click(),
]);`,
    commonUse: "Capturing a response body, or waiting when the UI gives no signal.",
    mistakes: ["Clicking first and then starting to wait — a race you lose on fast responses."],
    simulated: true,
  },
  {
    id: "page-waitforurl",
    namespace: "Page",
    signature: "page.waitForURL(url[, options])",
    summary: "Waits until the page navigates to a matching URL.",
    parameters: [
      { name: "url", type: "string | RegExp | function", description: "Expected URL" },
    ],
    returns: "Promise<void>",
    example: `await page.waitForURL(/\\/orders\\/ORD-\\d+/);`,
    commonUse: "Confirming a redirect after a form submission.",
    mistakes: ["Reaching for waitForNavigation, which is deprecated and racy."],
    simulated: true,
  },
  {
    id: "page-pause",
    namespace: "Page",
    signature: "page.pause()",
    summary: "Pauses execution and opens the Playwright Inspector.",
    parameters: [],
    returns: "Promise<void>",
    example: `await page.pause();`,
    commonUse: "Trying locators live against a real page.",
    mistakes: ["Committing it — CI hangs until the job times out."],
    simulated: false,
  },

  // ------------------------------------------------------------- Locator ---
  {
    id: "locator-click",
    namespace: "Locator",
    signature: "locator.click([options])",
    summary: "Clicks after the element passes the actionability checks.",
    parameters: [
      { name: "options.button", type: "'left' | 'right' | 'middle'", description: "Mouse button" },
      { name: "options.modifiers", type: "Array", description: "Alt, Control, Meta, Shift" },
      { name: "options.force", type: "boolean", description: "Skip the actionability checks" },
      { name: "options.timeout", type: "number", description: "How long to retry" },
    ],
    returns: "Promise<void>",
    example: `await page.getByRole('button', { name: 'Register' }).click();`,
    commonUse: "The most common action in any suite.",
    mistakes: [
      "Using force: true to silence a real 'intercepts pointer events' error.",
      "Clicking a checkbox instead of using check().",
    ],
    simulated: true,
  },
  {
    id: "locator-fill",
    namespace: "Locator",
    signature: "locator.fill(value[, options])",
    summary: "Focuses, clears and sets an input's value in one step.",
    parameters: [{ name: "value", type: "string", description: "Value to set; '' clears" }],
    returns: "Promise<void>",
    example: `await page.getByLabel('Email').fill('testuser@example.com');`,
    commonUse: "All ordinary text entry.",
    mistakes: [
      "Using pressSequentially when fill would do — it is far slower.",
      "Passing a formatted date to a native date input instead of yyyy-mm-dd.",
    ],
    simulated: true,
  },
  {
    id: "locator-filter",
    namespace: "Locator",
    signature: "locator.filter(options)",
    summary: "Narrows a set of matches by content or by a nested locator.",
    parameters: [
      { name: "options.hasText", type: "string | RegExp", description: "Must contain this text" },
      { name: "options.hasNotText", type: "string | RegExp", description: "Must not contain it" },
      { name: "options.has", type: "Locator", description: "Must contain a matching descendant" },
      { name: "options.hasNot", type: "Locator", description: "Must not contain one" },
    ],
    returns: "Locator",
    example: `page.getByRole('article').filter({ hasText: 'Wireless Headphones' });`,
    commonUse: "Selecting one card or row out of many.",
    mistakes: ["hasText substring-matching more than you intended — anchor a regex if it matters."],
    simulated: true,
  },
  {
    id: "locator-selectoption",
    namespace: "Locator",
    signature: "locator.selectOption(values[, options])",
    summary: "Selects options in a native <select>.",
    parameters: [
      { name: "values", type: "string | { label } | { index } | Array", description: "Value, label, index, or an array for multi-select" },
    ],
    returns: "Promise<string[]>",
    example: `await page.getByLabel('Country').selectOption('CA');
await page.getByLabel('Country').selectOption({ label: 'Canada' });`,
    commonUse: "Native dropdowns.",
    mistakes: ["Calling it on a custom div-based combobox — click the trigger, then the option."],
    simulated: true,
  },
  {
    id: "locator-count",
    namespace: "Locator",
    signature: "locator.count()",
    summary: "Returns how many elements match right now.",
    parameters: [],
    returns: "Promise<number>",
    example: `const count = await page.getByTestId('cart-item').count();`,
    commonUse: "Iterating over a known-stable list.",
    mistakes: ["Using it as an assertion — it does not retry. Use toHaveCount()."],
    simulated: true,
  },

  // ------------------------------------------------------------- Browser ---
  {
    id: "browser-newcontext",
    namespace: "Browser",
    signature: "browser.newContext([options])",
    summary: "Creates an isolated browser context — a fresh session.",
    parameters: [
      { name: "options.storageState", type: "string | object", description: "Seed cookies and localStorage" },
      { name: "options.viewport", type: "{ width, height }", description: "Viewport size" },
      { name: "options.locale", type: "string", description: "Locale, e.g. 'en-CA'" },
    ],
    returns: "Promise<BrowserContext>",
    example: `const admin = await browser.newContext({
  storageState: 'playwright/.auth/admin.json',
});`,
    commonUse: "Multi-user scenarios.",
    mistakes: ["Forgetting to close it — the worker leaks memory over a long run."],
    simulated: false,
  },

  // ------------------------------------------------------ BrowserContext ---
  {
    id: "context-storagestate",
    namespace: "BrowserContext",
    signature: "context.storageState([options])",
    summary: "Serialises cookies and localStorage, optionally to a file.",
    parameters: [{ name: "options.path", type: "string", description: "Where to write the JSON" }],
    returns: "Promise<StorageState>",
    example: `await page.context().storageState({ path: 'playwright/.auth/user.json' });`,
    commonUse: "The authentication setup pattern.",
    mistakes: [
      "Saving before asserting that the login succeeded.",
      "Committing the file — it is a live credential.",
    ],
    simulated: false,
  },
  {
    id: "context-route",
    namespace: "BrowserContext",
    signature: "context.route(url, handler)",
    summary: "Intercepts requests from every page in the context.",
    parameters: [
      { name: "url", type: "string | RegExp | function", description: "Pattern" },
      { name: "handler", type: "function", description: "Must resolve the route" },
    ],
    returns: "Promise<void>",
    example: `await context.route('**/analytics/**', (route) => route.abort());`,
    commonUse: "Blocking third-party noise across a whole test.",
    mistakes: ["Blocking something the app depends on and misdiagnosing the resulting failure."],
    simulated: false,
  },

  // --------------------------------------------------- APIRequestContext ---
  {
    id: "request-get",
    namespace: "APIRequestContext",
    signature: "request.get(url[, options])",
    summary: "Sends a GET request, sharing the test's cookies.",
    parameters: [
      { name: "options.params", type: "object", description: "Query string parameters" },
      { name: "options.headers", type: "object", description: "Request headers" },
    ],
    returns: "Promise<APIResponse>",
    example: `const response = await request.get('/api/products', {
  params: { category: 'audio' },
});`,
    commonUse: "API tests and hybrid API+UI setup.",
    mistakes: ["Assuming it is unauthenticated — it inherits the test's storage state."],
    simulated: false,
  },
  {
    id: "request-post",
    namespace: "APIRequestContext",
    signature: "request.post(url[, options])",
    summary: "Sends a POST request.",
    parameters: [
      { name: "options.data", type: "object | string", description: "Serialised as JSON when given an object" },
      { name: "options.form", type: "object", description: "URL-encoded form body" },
      { name: "options.multipart", type: "object", description: "Multipart body, for uploads" },
    ],
    returns: "Promise<APIResponse>",
    example: `const created = await request.post('/api/orders', {
  data: { items: [{ productId: 'p-1001', quantity: 1 }] },
});`,
    commonUse: "Seeding data before a UI test.",
    mistakes: ["Using `body` instead of `data` for JSON."],
    simulated: false,
  },

  // --------------------------------------------------------------- Route ---
  {
    id: "route-fulfill",
    namespace: "Route",
    signature: "route.fulfill([options])",
    summary: "Answers the request without contacting the server.",
    parameters: [
      { name: "options.status", type: "number", description: "HTTP status" },
      { name: "options.json", type: "any", description: "JSON body plus content-type" },
      { name: "options.body", type: "string | Buffer", description: "Raw body" },
      { name: "options.response", type: "APIResponse", description: "Base the reply on a real response" },
    ],
    returns: "Promise<void>",
    example: `await route.fulfill({ status: 500, json: { error: 'Boom' } });`,
    commonUse: "Mocking error and empty states.",
    mistakes: ["Writing a mock whose shape does not match the real contract."],
    simulated: false,
  },
  {
    id: "route-continue",
    namespace: "Route",
    signature: "route.continue([options])",
    summary: "Sends the request on, optionally modified.",
    parameters: [
      { name: "options.headers", type: "object", description: "Replacement headers" },
      { name: "options.postData", type: "string | Buffer", description: "Replacement body" },
      { name: "options.url", type: "string", description: "Redirect to another URL" },
    ],
    returns: "Promise<void>",
    example: `await route.continue({
  headers: { ...route.request().headers(), 'X-Test': '1' },
});`,
    commonUse: "Asserting on a payload without changing behaviour.",
    mistakes: ["Throwing inside the handler and leaving the route unresolved."],
    simulated: false,
  },
  {
    id: "route-abort",
    namespace: "Route",
    signature: "route.abort([errorCode])",
    summary: "Fails the request.",
    parameters: [{ name: "errorCode", type: "string", description: "e.g. 'failed', 'timedout'" }],
    returns: "Promise<void>",
    example: `await page.route('**/*.{png,jpg}', (route) => route.abort());`,
    commonUse: "Blocking images or third-party scripts to speed a run up.",
    mistakes: ["Aborting something the page needs and then debugging the wrong symptom."],
    simulated: false,
  },

  // ------------------------------------------------------------- Request ---
  {
    id: "request-postdatajson",
    namespace: "Request",
    signature: "request.postDataJSON()",
    summary: "Parses the request body as JSON.",
    parameters: [],
    returns: "any",
    example: `expect(route.request().postDataJSON()).toMatchObject({ quantity: 3 });`,
    commonUse: "Catching a UI that displays one value and sends another.",
    mistakes: ["Calling it on a GET request, which has no body."],
    simulated: false,
  },

  // ------------------------------------------------------------ Response ---
  {
    id: "response-json",
    namespace: "Response",
    signature: "response.json()",
    summary: "Parses the response body as JSON.",
    parameters: [],
    returns: "Promise<any>",
    example: `const { products } = await (await request.get('/api/products')).json();`,
    commonUse: "Reading API results.",
    mistakes: ["Calling it on an error response that returned HTML."],
    simulated: false,
  },

  // ---------------------------------------------------------------- Test ---
  {
    id: "test-step",
    namespace: "Test",
    signature: "test.step(title, body)",
    summary: "Groups actions into a named step in the report.",
    parameters: [
      { name: "title", type: "string", description: "Step name" },
      { name: "body", type: "() => Promise<void>", description: "The step's actions" },
    ],
    returns: "Promise<void>",
    example: `await test.step('Check out', async () => {
  await page.getByRole('button', { name: 'Place Order' }).click();
});`,
    commonUse: "Making a long journey diagnosable.",
    mistakes: ["Forgetting to await the step."],
    simulated: false,
  },
  {
    id: "test-use",
    namespace: "Test",
    signature: "test.use(options)",
    summary: "Overrides fixture options for a file or describe block.",
    parameters: [{ name: "options", type: "object", description: "viewport, locale, storageState…" }],
    returns: "void",
    example: `test.use({ storageState: { cookies: [], origins: [] } });`,
    commonUse: "Running one file signed out, or at a mobile viewport.",
    mistakes: ["Calling it inside a test body — it must be at file or describe scope."],
    simulated: false,
  },
  {
    id: "test-extend",
    namespace: "Test",
    signature: "test.extend(fixtures)",
    summary: "Creates a new test object with custom fixtures.",
    parameters: [{ name: "fixtures", type: "object", description: "name -> async ({ deps }, use) => {}" }],
    returns: "TestType",
    example: `export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});`,
    commonUse: "Page objects and seeded data as test arguments.",
    mistakes: ["Returning a value instead of calling `await use(value)`."],
    simulated: false,
  },

  // -------------------------------------------------------------- Expect ---
  {
    id: "expect-tobevisible",
    namespace: "Expect",
    signature: "expect(locator).toBeVisible([options])",
    summary: "Retries until the element is visible.",
    parameters: [{ name: "options.timeout", type: "number", description: "Override the expect timeout" }],
    returns: "Promise<void>",
    example: `await expect(page.getByText('Order Successful!')).toBeVisible();`,
    commonUse: "The most common assertion in any suite.",
    mistakes: ["Forgetting await — the test passes even when the assertion fails."],
    simulated: true,
  },
  {
    id: "expect-tohavetext",
    namespace: "Expect",
    signature: "expect(locator).toHaveText(expected[, options])",
    summary: "Retries until the text matches exactly (after whitespace normalisation).",
    parameters: [
      { name: "expected", type: "string | RegExp | Array", description: "Array when the locator matches several elements" },
    ],
    returns: "Promise<void>",
    example: `await expect(page.getByTestId('cart-item-name')).toHaveText([
  'Wireless Headphones',
  'Mechanical Keyboard',
]);`,
    commonUse: "Verifying rendered content.",
    mistakes: ["Using it where toContainText was meant — exact matching is strict."],
    simulated: true,
  },
  {
    id: "expect-tohavecount",
    namespace: "Expect",
    signature: "expect(locator).toHaveCount(n)",
    summary: "Retries until exactly n elements match.",
    parameters: [{ name: "n", type: "number", description: "Expected number of matches" }],
    returns: "Promise<void>",
    example: `await expect(page.getByTestId('cart-item')).toHaveCount(0);`,
    commonUse: "Asserting a list length, or that something is gone.",
    mistakes: ["Using `await locator.count()` and comparing — that snapshot does not retry."],
    simulated: true,
  },
  {
    id: "expect-poll",
    namespace: "Expect",
    signature: "expect.poll(fn[, options]).toBe(value)",
    summary: "Retries an arbitrary async function until its result matches.",
    parameters: [
      { name: "fn", type: "() => Promise<any>", description: "Value producer" },
      { name: "options.intervals", type: "number[]", description: "Backoff schedule" },
      { name: "options.timeout", type: "number", description: "Total budget" },
    ],
    returns: "Promise<void>",
    example: `await expect.poll(async () => {
  const res = await request.get('/api/orders/ORD-1');
  return (await res.json()).status;
}).toBe('paid');`,
    commonUse: "Waiting for an asynchronous backend state change.",
    mistakes: ["Wrapping a locator assertion in it — those already retry."],
    simulated: false,
  },
  {
    id: "expect-soft",
    namespace: "Expect",
    signature: "expect.soft(value).matcher()",
    summary: "Records a failure and lets the test continue.",
    parameters: [],
    returns: "Promise<void>",
    example: `await expect.soft(page.getByTestId('order-total')).toHaveText('$249.50');`,
    commonUse: "Checking many independent fields on one screen.",
    mistakes: ["Soft-asserting something later steps depend on."],
    simulated: false,
  },
];

export const apiNamespaces = Array.from(
  apiReference.reduce((map, entry) => {
    const list = map.get(entry.namespace) ?? [];
    list.push(entry);
    map.set(entry.namespace, list);
    return map;
  }, new Map<string, ApiEntry[]>()),
).map(([namespace, entries]) => ({ namespace, entries }));

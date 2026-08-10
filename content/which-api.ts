/** Data for the interactive "Which API should I use?" decision helper. */

export type Recommendation = {
  api: string;
  code: string;
  why: string;
  caution?: string;
  href?: string;
};

export type DecisionOption = {
  id: string;
  label: string;
  description: string;
  recommendation: Recommendation;
  alternatives?: Recommendation[];
};

export type DecisionTree = {
  id: string;
  question: string;
  intro: string;
  options: DecisionOption[];
};

export const decisionTrees: DecisionTree[] = [
  {
    id: "waiting",
    question: "What are you waiting for?",
    intro:
      "Almost every flaky test comes from waiting for the wrong thing. Pick what you are actually waiting on.",
    options: [
      {
        id: "element",
        label: "An element",
        description: "A button, a message, a row — something to appear, disappear or become clickable.",
        recommendation: {
          api: "Nothing, or a web-first assertion",
          code: `// Actions already wait:
await page.getByRole('button', { name: 'Place Order' }).click();

// When the wait IS the check:
await expect(page.getByText('Order Successful!')).toBeVisible();`,
          why: "Actions run the actionability checks and assertions poll, so an explicit wait is usually redundant.",
          href: "/learn/waiting/auto-waiting",
        },
        alternatives: [
          {
            api: "locator.waitFor()",
            code: `await page.getByTestId('spinner').waitFor({ state: 'hidden' });`,
            why: "When the wait is setup rather than a check — for example waiting for a loader to clear.",
          },
        ],
      },
      {
        id: "url",
        label: "A URL change",
        description: "The app should navigate somewhere after an action.",
        recommendation: {
          api: "page.waitForURL()",
          code: `await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForURL('/practice/shop');`,
          why: "It targets exactly the condition that defines success and fails with a clear message.",
          caution: "waitForNavigation() is deprecated and racy — do not use it.",
          href: "/learn/waiting/explicit-waits",
        },
        alternatives: [
          {
            api: "expect(page).toHaveURL()",
            code: `await expect(page).toHaveURL(/\\/shop/);`,
            why: "Same wait, but it also records an assertion in the report.",
          },
        ],
      },
      {
        id: "response",
        label: "An API response",
        description: "You need the response body, or the UI gives no signal that the work finished.",
        recommendation: {
          api: "page.waitForResponse()",
          code: `const [response] = await Promise.all([
  page.waitForResponse('**/api/orders'),
  page.getByRole('button', { name: 'Place Order' }).click(),
]);

expect(response.status()).toBe(201);`,
          why: "Registering the wait before the click removes the race entirely.",
          caution: "Prefer asserting on visible UI when that is sufficient — network waits couple the test to endpoints.",
          href: "/learn/waiting/waiting-for-requests-and-responses",
        },
      },
      {
        id: "request",
        label: "An outgoing request",
        description: "You want to verify what the UI actually sent.",
        recommendation: {
          api: "page.waitForRequest()",
          code: `const [request] = await Promise.all([
  page.waitForRequest('**/api/messages'),
  page.getByRole('button', { name: 'Send Message' }).click(),
]);

expect(request.postDataJSON()).toMatchObject({ subject: 'Where is my order?' });`,
          why: "Catches the bug where the screen says success but the payload was wrong.",
          href: "/learn/network-interception/validating-outgoing-requests",
        },
      },
      {
        id: "load",
        label: "The page to finish loading",
        description: "You are not sure what to wait for, so you want to wait for 'everything'.",
        recommendation: {
          api: "An assertion on the content you care about",
          code: `await page.goto('/practice/shop');
await expect(page.getByRole('article')).toHaveCount(6);`,
          why: "The page is 'ready' when the thing you need is on it. Assert that directly.",
          caution:
            "waitForLoadState('networkidle') never settles on apps with polling or analytics — Playwright discourages it.",
          href: "/learn/waiting/explicit-waits",
        },
      },
      {
        id: "time",
        label: "A fixed amount of time",
        description: "You want to pause for a couple of seconds.",
        recommendation: {
          api: "Almost certainly something else",
          code: `// Instead of:
await page.waitForTimeout(3000);

// Wait for the condition:
await expect(page.getByText('Order Successful!')).toBeVisible();`,
          why: "A fixed wait is too long on a fast machine and too short on a loaded CI runner.",
          caution:
            "The rare legitimate case is asserting that something does NOT happen within a period — and it deserves a comment.",
          href: "/learn/waiting/fixed-timeouts-and-timeout-config",
        },
      },
    ],
  },
  {
    id: "locator",
    question: "What are you trying to find?",
    intro: "Work down this list and stop at the first one that applies.",
    options: [
      {
        id: "interactive",
        label: "A button, link or form control",
        description: "Anything a user can operate.",
        recommendation: {
          api: "getByRole()",
          code: `page.getByRole('button', { name: 'Add to Cart' });
page.getByRole('link', { name: 'View Orders' });`,
          why: "Role and accessible name are tied to meaning, so they survive styling and markup refactors.",
          href: "/learn/locators/get-by-role",
        },
      },
      {
        id: "field",
        label: "A labelled input",
        description: "A text field, password, date or select with a visible label.",
        recommendation: {
          api: "getByLabel()",
          code: `page.getByLabel('Email');
page.getByLabel('Password', { exact: true });`,
          why: "The label is the contract with the user and with assistive technology.",
          caution: "Substring matching means 'Password' also matches 'Confirm Password'.",
          href: "/learn/locators/get-by-label-text-placeholder-testid",
        },
      },
      {
        id: "message",
        label: "A message or piece of copy",
        description: "A confirmation, an error, a status line.",
        recommendation: {
          api: "getByText()",
          code: `await expect(page.getByText('Order Successful!')).toBeVisible();`,
          why: "The copy is what the user actually reads, so asserting on it tests the real outcome.",
          caution: "Brittle if the wording changes often — a test id may be steadier for volatile copy.",
          href: "/learn/locators/get-by-label-text-placeholder-testid",
        },
      },
      {
        id: "one-of-many",
        label: "One item among many identical ones",
        description: "A specific product card, table row or list item.",
        recommendation: {
          api: "filter() plus chaining",
          code: `page
  .getByRole('article')
  .filter({ hasText: 'Wireless Headphones' })
  .getByRole('button', { name: 'Add to Cart' });`,
          why: "It states the requirement directly and survives reordering and regenerated ids.",
          caution: "Reaching for .nth() or .first() here hides the ambiguity rather than resolving it.",
          href: "/learn/locators/chaining-and-filtering",
        },
      },
      {
        id: "no-semantics",
        label: "A widget with no useful role or text",
        description: "A counter badge, a chart, a virtualised row.",
        recommendation: {
          api: "getByTestId()",
          code: `page.getByTestId('cart-count');`,
          why: "An intentional, team-owned hook beats a fragile CSS chain.",
          caution: "If a control genuinely has no role, that is often an accessibility bug worth filing.",
          href: "/learn/locators/get-by-label-text-placeholder-testid",
        },
      },
      {
        id: "attribute",
        label: "Something identified only by an attribute",
        description: "A form field with a name, or a data-* attribute.",
        recommendation: {
          api: "locator() with a CSS attribute selector",
          code: `page.locator('input[name="email"]');
page.locator('[data-product-category="audio"]');`,
          why: "Attributes that describe purpose are part of the contract and stay stable.",
          caution: "Never build on generated ids, hashed classes or nth-child positions.",
          href: "/learn/locators/css-and-xpath",
        },
      },
    ],
  },
  {
    id: "layer",
    question: "Which layer should own this check?",
    intro:
      "Putting an assertion at the wrong layer makes it slow, brittle, or blind to the real defect.",
    options: [
      {
        id: "ui-journey",
        label: "Can the user complete the journey?",
        description: "Navigation, forms, buttons, confirmation screens.",
        recommendation: {
          api: "A Playwright UI test",
          code: `await page.getByRole('button', { name: 'Place Order' }).click();
await expect(page.getByRole('heading', { name: 'Order Successful!' })).toBeVisible();`,
          why: "Only a browser can prove the journey works end to end.",
          href: "/learn/e2e-automation/the-complete-purchase-journey",
        },
      },
      {
        id: "api-contract",
        label: "Does the API return the right shape?",
        description: "Field names, types, status codes, error handling.",
        recommendation: {
          api: "An API test with the request fixture",
          code: `const response = await request.get('/api/products');
expect(response.ok()).toBeTruthy();
expect(typeof (await response.json()).products[0].price).toBe('number');`,
          why: "It runs in milliseconds and fails with a precise message instead of a cascade of UI timeouts.",
          href: "/learn/api-testing/contract-and-schema-checks",
        },
      },
      {
        id: "persistence",
        label: "Was the data actually stored correctly?",
        description: "Totals, statuses, relationships between records.",
        recommendation: {
          api: "An API read-back, or SQL",
          code: `SELECT o.id, o.status, p.status, p.amount
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.status = 'cancelled' AND p.status = 'completed';`,
          why: "A UI can render success while writing the wrong thing. Only the data layer can disprove that.",
          href: "/learn/sql-for-testers/qa-validation-scenarios",
        },
      },
      {
        id: "edge-state",
        label: "How does the UI behave when the API misbehaves?",
        description: "Empty lists, 500s, slow responses.",
        recommendation: {
          api: "page.route() to mock the response",
          code: `await page.route('**/api/products*', (route) =>
  route.fulfill({ status: 500, json: { error: 'Boom' } }),
);`,
          why: "These states are effectively impossible to produce on demand with real data.",
          href: "/learn/network-interception/mocking-responses",
        },
      },
    ],
  },
];

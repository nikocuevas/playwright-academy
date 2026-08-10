import type { Module } from "../types";

export const waitingModule: Module = {
  id: "waiting",
  order: 6,
  title: "Waiting Strategies",
  tagline: "The module that decides whether your suite is flaky",
  summary:
    "Auto-waiting, locator waits, URL waits, network waits and load states — plus an honest account of why fixed timeouts keep showing up and why they should not.",
  difficulty: "intermediate",
  icon: "Timer",
  track: "core",
  lessons: [
    {
      id: "wait-auto",
      slug: "auto-waiting",
      title: "Auto-waiting: what you get for free",
      moduleId: "waiting",
      summary:
        "Playwright waits before every action and inside every web-first assertion. Most explicit waits are redundant.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "List the actionability checks",
        "Explain what auto-waiting does not cover",
        "Read a timeout error and identify the failing check",
      ],
      sections: [
        {
          kind: "text",
          title: "Two layers of built-in waiting",
          body: [
            "**Actions** wait for the element to be attached, visible, stable, hit-testable and enabled before dispatching an event. **Web-first assertions** re-evaluate until they pass. Between them, the vast majority of timing problems disappear without you writing a single wait.",
          ],
        },
        {
          kind: "code",
          title: "No waits needed here",
          language: "ts",
          code: `
await page.goto('/practice/shop/login');
await page.getByLabel('Email').fill('testuser@example.com');
await page.getByLabel('Password').fill('Password123!');
await page.getByRole('button', { name: 'Sign In' }).click();

// The dashboard renders asynchronously — the assertion polls until it exists.
await expect(page.getByText('Welcome back, Test User')).toBeVisible();
`,
        },
        {
          kind: "table",
          title: "What each action waits for",
          headers: ["Action", "Checks"],
          rows: [
            ["click", "attached, visible, stable, receives events, enabled"],
            ["fill", "attached, visible, enabled, editable"],
            ["check / uncheck", "attached, visible, stable, receives events, enabled"],
            ["selectOption", "attached, visible, enabled"],
            ["hover", "attached, visible, stable, receives events"],
            ["textContent / getAttribute", "attached only"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "What auto-waiting does not know about",
          body: [
            "It cannot know that a background API call must finish before the data you are about to assert is correct, or that a toast will disappear after three seconds. Those need explicit waits — but almost always a *conditional* one, not a fixed sleep.",
          ],
        },
        {
          kind: "code",
          title: "Reading a timeout error",
          language: "text",
          code: `
locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Place Order' })
  -   locator resolved to <button disabled>Place Order</button>
  - element is not enabled - waiting...
`,
        },
        {
          kind: "text",
          title: "The call log is the diagnosis",
          body: [
            "That log says the element was found but stayed disabled. The fix is not a longer timeout — it is understanding why the button never enabled (a validation error, an unfilled required field, a failed request).",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Adding waitForTimeout because 'the page is slow'",
          body: "The action already waits up to 30 seconds. A sleep only adds delay to the passing case.",
        },
        {
          title: "Ignoring the call log",
          body: "It names the exact failing check. Reading it turns a mystery into a two-minute fix.",
        },
      ],
      keyTakeaways: [
        "Actions and web-first assertions both wait automatically.",
        "The call log in a timeout error identifies the failing check.",
        "Auto-waiting covers the DOM, not your application's background work.",
      ],
      quiz: [
        {
          id: "q1",
          type: "correct-wait",
          prompt:
            "A button appears about a second after page load. What should you do before clicking it?",
          options: [
            { id: "a", text: "await page.waitForTimeout(1500)" },
            { id: "b", text: "Nothing — click() waits for it" },
            { id: "c", text: "await page.waitForLoadState('networkidle')" },
            { id: "d", text: "Poll with a while loop" },
          ],
          correct: "b",
          explanation:
            "click() waits for the element to be attached, visible, stable, hit-testable and enabled.",
        },
      ],
      playground: ["waiting"],
    },
    {
      id: "wait-explicit",
      slug: "explicit-waits",
      title: "Explicit waits: locator, URL and load state",
      moduleId: "waiting",
      summary: "waitFor, waitForURL and waitForLoadState — and when each is right.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Wait for an element to reach a specific state",
        "Wait for navigation to a URL",
        "Understand load states and their limits",
      ],
      sections: [
        {
          kind: "code",
          title: "locator.waitFor",
          language: "ts",
          code: `
await page.getByTestId('spinner').waitFor({ state: 'hidden' });
await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 10_000 });
await page.getByTestId('toast').waitFor({ state: 'detached' });
`,
          caption:
            "States: 'attached' | 'detached' | 'visible' | 'hidden'.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Usually an assertion is better",
          body: [
            "`await expect(spinner).toBeHidden()` waits *and* documents the expectation in the report. Reach for `waitFor()` when the wait is genuinely setup rather than a check.",
          ],
        },
        {
          kind: "code",
          title: "page.waitForURL",
          language: "ts",
          code: `
await page.getByRole('button', { name: 'Sign In' }).click();

await page.waitForURL('/practice/shop');
await page.waitForURL(/\\/orders\\/ORD-\\d+/);
await page.waitForURL((url) => url.searchParams.has('q'));
`,
        },
        {
          kind: "code",
          title: "page.waitForLoadState",
          language: "ts",
          code: `
await page.waitForLoadState();                  // 'load'
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');     // avoid on modern apps
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "networkidle is a trap",
          body: [
            "It resolves after 500 ms with no network activity. Analytics beacons, polling, websockets and long-lived connections mean many apps never reach that state — the wait then burns the full timeout and fails. Playwright's own docs discourage it. Wait for the thing you actually care about instead.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Waiting for the whole network to go quiet",
          goodLabel: "Waiting for the specific outcome",
          bad: `
await page.goto('/practice/shop');
await page.waitForLoadState('networkidle');
await expect(page.getByRole('article')).toHaveCount(6);`,
          good: `
await page.goto('/practice/shop');
await expect(page.getByRole('article')).toHaveCount(6);`,
        },
      ],
      commonMistakes: [
        {
          title: "waitForNavigation after a click",
          body: "Deprecated and racy. Use `waitForURL`, or simply assert on content from the new page.",
        },
        {
          title: "Waiting for a spinner that never appears",
          body: "If the request is fast, the spinner may never render and `waitFor({ state: 'visible' })` times out. Wait for the end state instead.",
        },
      ],
      keyTakeaways: [
        "Prefer an assertion over a bare waitFor — it waits and documents.",
        "waitForURL is the clean way to confirm navigation.",
        "networkidle is unreliable on modern applications.",
      ],
      quiz: [
        {
          id: "q1",
          type: "correct-wait",
          prompt:
            "After clicking Sign In the app redirects to /practice/shop. What is the best wait?",
          options: [
            { id: "a", text: "await page.waitForTimeout(2000)" },
            { id: "b", text: "await page.waitForURL('/practice/shop')" },
            { id: "c", text: "await page.waitForLoadState('networkidle')" },
            { id: "d", text: "await page.waitForNavigation()" },
          ],
          correct: "b",
          explanation:
            "waitForURL targets exactly the condition that defines success and fails with a clear message.",
        },
      ],
      playground: ["waiting"],
    },
    {
      id: "wait-network",
      slug: "waiting-for-requests-and-responses",
      title: "Waiting for requests and responses",
      moduleId: "waiting",
      summary:
        "waitForResponse, waitForRequest and the ordering rule that makes them reliable.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Wait for a specific API response",
        "Assert on the request a UI action produced",
        "Avoid the register-after-trigger race",
      ],
      sections: [
        {
          kind: "callout",
          tone: "danger",
          title: "Register the wait BEFORE the action",
          body: [
            "If you click first and then start waiting, a fast response is already gone and the wait times out. Always start the wait first — `Promise.all` is the idiomatic way to express that.",
          ],
        },
        {
          kind: "code",
          title: "waitForResponse",
          language: "ts",
          code: `
const [response] = await Promise.all([
  page.waitForResponse(
    (r) => r.url().includes('/api/orders') && r.request().method() === 'POST',
  ),
  page.getByRole('button', { name: 'Place Order' }).click(),
]);

expect(response.status()).toBe(201);

const body = await response.json();
expect(body.orderNumber).toMatch(/^ORD-\\d{6}$/);
`,
        },
        {
          kind: "code",
          title: "waitForRequest — validating what the UI sends",
          language: "ts",
          code: `
const [request] = await Promise.all([
  page.waitForRequest('**/api/messages'),
  page.getByRole('button', { name: 'Send Message' }).click(),
]);

expect(request.method()).toBe('POST');
expect(request.postDataJSON()).toMatchObject({
  subject: 'Where is my order?',
});
`,
          caption:
            "This is how you catch a UI that silently sends the wrong payload — the screen says success, the request was wrong.",
        },
        {
          kind: "code",
          title: "URL patterns",
          language: "ts",
          code: `
page.waitForResponse('**/api/products');          // glob
page.waitForResponse(/\\/api\\/orders\\/\\d+/);        // regex
page.waitForResponse((r) => r.status() === 500);  // predicate
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Do not over-couple to the network",
          body: [
            "Waiting on an endpoint ties the test to an implementation detail. If asserting on visible UI is enough, do that. Use network waits when you need the response body, or when the UI gives no signal that the work finished.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Clicking, then awaiting waitForResponse",
          body: "A race you lose whenever the API is fast. Use Promise.all.",
        },
        {
          title: "Matching a URL substring that also matches other endpoints",
          body: "`'**/api/order'` also matches `/api/orders/123`. Add the method or tighten the pattern.",
        },
      ],
      keyTakeaways: [
        "Start the wait before the action that triggers the request.",
        "waitForRequest verifies the payload the UI actually sends.",
        "Prefer UI assertions unless you need the response itself.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "This times out roughly half the time. Why?",
          code: `await page.getByRole('button', { name: 'Place Order' }).click();
const response = await page.waitForResponse('**/api/orders');`,
          options: [
            { id: "a", text: "The glob pattern is wrong" },
            { id: "b", text: "The wait starts after the response may already have arrived" },
            { id: "c", text: "waitForResponse needs a predicate" },
            { id: "d", text: "The click needs force: true" },
          ],
          correct: "b",
          explanation:
            "Wrap both in Promise.all so the listener is attached before the click fires.",
        },
      ],
      playground: ["waiting"],
    },
    {
      id: "wait-timeouts",
      slug: "fixed-timeouts-and-timeout-config",
      title: "Fixed timeouts, and the timeouts you should configure",
      moduleId: "waiting",
      summary:
        "Why waitForTimeout is a last resort, and how Playwright's timeout hierarchy actually works.",
      difficulty: "intermediate",
      estimatedTime: 13,
      objectives: [
        "Explain why fixed sleeps cause both slowness and flakiness",
        "Identify the rare legitimate uses",
        "Configure test, action, expect and navigation timeouts",
      ],
      sections: [
        {
          kind: "text",
          title: "The problem with a sleep",
          body: [
            "A fixed wait is simultaneously too long and too short. On a fast machine it wastes time on every run; on a loaded CI runner it is not enough and the test fails anyway. Multiply by a few hundred tests and you have a slow suite that is still flaky.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Guessing",
          goodLabel: "Waiting for the condition",
          bad: `
await page.getByRole('button', { name: 'Place Order' }).click();
await page.waitForTimeout(3000);
await expect(page.getByText('Order Successful!')).toBeVisible();`,
          good: `
await page.getByRole('button', { name: 'Place Order' }).click();
await expect(page.getByText('Order Successful!')).toBeVisible();`,
        },
        {
          kind: "list",
          title: "The few defensible uses",
          items: [
            "Debugging by hand, to watch what happens — remove it before committing.",
            "Verifying a debounce genuinely delays a request (the delay is the requirement).",
            "Confirming that something does **not** happen within a period, e.g. no auto-redirect.",
            "Working around a third-party widget with no observable ready state — comment why.",
          ],
        },
        {
          kind: "code",
          title: "Asserting that nothing happens",
          language: "ts",
          code: `
// Here the wait IS the requirement: the session must not expire early.
await page.waitForTimeout(3000);
await expect(page).toHaveURL('/practice/shop');
await expect(page.getByText('Welcome back, Test User')).toBeVisible();
`,
        },
        {
          kind: "table",
          title: "The timeout hierarchy",
          headers: ["Timeout", "Default", "Set with"],
          rows: [
            ["Whole test", "30 s", "timeout in config, or test.setTimeout()"],
            ["Each action", "no separate default — bounded by the test", "use.actionTimeout"],
            ["Each expect", "5 s", "expect.timeout, or per-assertion option"],
            ["Navigation", "30 s", "use.navigationTimeout"],
            ["Whole run", "none", "globalTimeout"],
          ],
        },
        {
          kind: "code",
          title: "Configuring them",
          language: "ts",
          code: `
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
});

// For one slow test only:
test('generates the annual report', async ({ page }) => {
  test.setTimeout(180_000);
});
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Raising timeouts globally hides problems",
          body: [
            "If a suite only passes at 60-second action timeouts, the real issue is elsewhere — a missing wait condition, a slow environment, or a genuine performance bug worth reporting.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Sprinkling waitForTimeout to 'stabilise' a suite",
          body: "It makes the suite slower without making it reliable, and it hides the real cause.",
        },
        {
          title: "Raising the test timeout instead of the assertion timeout",
          body: "The test timeout bounds everything; the individual assertion still gives up after 5 seconds.",
        },
      ],
      keyTakeaways: [
        "Wait for conditions, not for durations.",
        "Legitimate sleeps are rare, and always come with a comment explaining why.",
        "Know the four timeout levels — raising the wrong one changes nothing.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt:
            "A test times out after 30 s even though you set `expect.timeout` to 60 s. Why?",
          options: [
            { id: "a", text: "expect.timeout is ignored" },
            { id: "b", text: "The overall test timeout is still 30 s and bounds everything" },
            { id: "c", text: "You must also set actionTimeout" },
            { id: "d", text: "The assertion is not web-first" },
          ],
          correct: "b",
          explanation:
            "Raise `timeout` in the config or call `test.setTimeout()` — the test timeout caps every wait inside it.",
        },
        {
          id: "q2",
          type: "correct-wait",
          prompt:
            "You must confirm the app does NOT redirect within 3 seconds. Which is correct?",
          options: [
            { id: "a", text: "await expect(page).toHaveURL('/practice/shop')" },
            { id: "b", text: "await page.waitForTimeout(3000), then assert the URL" },
            { id: "c", text: "await page.waitForURL('/practice/shop')" },
            { id: "d", text: "await page.waitForLoadState('networkidle')" },
          ],
          correct: "b",
          explanation:
            "This is the rare case where the duration is the requirement — you are asserting absence of a change over time.",
        },
      ],
    },
    {
      id: "wait-flakiness",
      slug: "diagnosing-flaky-tests",
      title: "Diagnosing flaky tests",
      moduleId: "waiting",
      summary:
        "A systematic method for turning an intermittent failure into a fixed one.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Reproduce flakiness deliberately",
        "Classify the root cause",
        "Apply the right fix for each category",
      ],
      sections: [
        {
          kind: "steps",
          title: "A repeatable process",
          steps: [
            {
              title: "Reproduce it",
              body: "Run the test many times in a row until it fails. If it never fails locally, run it under CPU load or with a throttled CPU.",
              code: "npx playwright test tests/checkout --repeat-each=20 --workers=1",
              language: "bash",
            },
            {
              title: "Capture a trace",
              body: "Record every run so you have the timeline of the failing one.",
              code: "npx playwright test tests/checkout --trace on",
              language: "bash",
            },
            {
              title: "Read the trace",
              body: "Open the failing action and inspect the DOM snapshot at that moment. What was on the page instead of what you expected?",
              code: "npx playwright show-trace test-results/**/trace.zip",
              language: "bash",
            },
            {
              title: "Classify and fix",
              body: "Match the symptom to a category in the table below, then apply that fix rather than adding a wait.",
            },
          ],
        },
        {
          kind: "table",
          title: "Root causes and their fixes",
          headers: ["Symptom", "Cause", "Fix"],
          rows: [
            ["Element found but click lands elsewhere", "Layout shifted after load", "Assert the final state first, or wait for the image/font to settle"],
            ["Passes alone, fails in parallel", "Shared data between tests", "Give each test its own data and its own context"],
            ["Fails only on the first run of the day", "Cold cache / cold server", "Warm up in global setup, or use a webServer with a health check"],
            ["Assertion reads stale text", "Snapshot assertion instead of web-first", "Use await expect(locator).toHaveText(...)"],
            ["Random timeouts on one endpoint", "Genuine backend slowness", "Report it — the test is finding a real bug"],
            ["Fails after a deploy", "Locator built on a generated attribute", "Move to role/label/test id"],
          ],
        },
        {
          kind: "callout",
          tone: "bug",
          title: "Retries hide, they do not fix",
          body: [
            "`retries: 2` in CI is a pragmatic shield against infrastructure noise, but a test marked *flaky* in the report is unfinished work. Track flaky rates and fix the top offenders — otherwise the suite quietly stops meaning anything.",
          ],
        },
        {
          kind: "code",
          title: "Useful flags while hunting",
          language: "bash",
          code: `
npx playwright test --repeat-each=20         # amplify intermittency
npx playwright test --workers=1              # rule out parallelism
npx playwright test --headed --slow-mo=500   # watch it happen
npx playwright test --trace on --ui          # time travel through the run
`,
        },
      ],
      commonMistakes: [
        {
          title: "Fixing flakiness by adding sleeps",
          body: "The failure moves rather than disappears, and the suite gets slower every time.",
        },
        {
          title: "Assuming flakiness is always the test's fault",
          body: "Intermittent 500s and race conditions in the product surface as flaky tests. Sometimes the correct output is a bug report.",
        },
      ],
      keyTakeaways: [
        "Reproduce with --repeat-each before attempting a fix.",
        "The trace viewer shows the DOM at the moment of failure — use it.",
        "Categorise the cause; each category has a specific fix that is not a sleep.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A test passes alone but fails when the suite runs in parallel. Most likely cause?",
          options: [
            { id: "a", text: "The machine is too slow" },
            { id: "b", text: "Tests share state or data" },
            { id: "c", text: "Playwright does not support parallelism" },
            { id: "d", text: "The locator is wrong" },
          ],
          correct: "b",
          explanation:
            "Shared fixtures, shared accounts or shared records break isolation. Give each test its own data.",
        },
      ],
    },
  ],
};

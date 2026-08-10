import type { Module } from "../types";

export const debuggingModule: Module = {
  id: "debugging",
  order: 14,
  title: "Debugging & Tooling",
  tagline: "Read a failure, reproduce it, fix it",
  summary:
    "UI mode, the Inspector, traces, codegen and the reporters — the tools that turn an opaque CI failure into a two-minute fix.",
  difficulty: "intermediate",
  icon: "Bug",
  track: "architecture",
  lessons: [
    {
      id: "dbg-tools",
      slug: "ui-mode-inspector-and-pause",
      title: "UI mode, the Inspector and page.pause",
      moduleId: "debugging",
      summary: "Three ways to step through a test while it runs.",
      difficulty: "intermediate",
      estimatedTime: 13,
      objectives: [
        "Use UI mode as a daily driver",
        "Step through with the Inspector",
        "Drop into an interactive session at a specific line",
      ],
      sections: [
        {
          kind: "code",
          title: "The commands",
          language: "bash",
          code: `
npx playwright test --ui                     # watch mode + time travel
npx playwright test --debug                  # Inspector, step by step
npx playwright test --headed --slow-mo=500   # just watch it happen
npx playwright test example.spec.ts:14       # one test, by line number
`,
        },
        {
          kind: "list",
          title: "What UI mode gives you",
          items: [
            "A timeline of every action with a DOM snapshot before and after.",
            "Watch mode — the test re-runs when you save the file.",
            "A locator picker that generates the locator for anything you hover.",
            "Network, console and source panels for the selected step.",
          ],
        },
        {
          kind: "code",
          title: "page.pause()",
          language: "ts",
          code: `
test('debug the cart', async ({ page }) => {
  await page.goto('/practice/shop/cart');

  await page.pause();   // opens the Inspector and stops here

  await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
});
`,
          caption:
            "In the paused Inspector you can try locators live against the real page.",
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Never commit page.pause()",
          body: [
            "In CI it hangs the run until the job times out. Add a lint rule or a pre-commit grep to catch it.",
          ],
        },
        {
          kind: "code",
          title: "codegen",
          language: "bash",
          code: `
npx playwright codegen http://localhost:3000/practice/registration
npx playwright codegen --device="iPhone 14" http://localhost:3000
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Codegen output is a draft",
          body: [
            "It records what you did, not what you meant. Expect to replace generated ids, add assertions, remove redundant steps and split one recording into several tests.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Debugging with console.log alone",
          body: "The trace and the Inspector show the DOM at the moment of failure. Logs only show what you thought to print.",
        },
        {
          title: "Shipping recorded tests unedited",
          body: "They are brittle, assertion-free and unreadable. Treat codegen as a starting point.",
        },
      ],
      keyTakeaways: [
        "UI mode is the best default for local development.",
        "page.pause() gives you a live locator sandbox — never commit it.",
        "Codegen drafts a test; you still have to write it.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What happens if page.pause() reaches CI?",
          options: [
            { id: "a", text: "It is ignored in headless mode" },
            { id: "b", text: "The test hangs until the job times out" },
            { id: "c", text: "It takes a screenshot and continues" },
            { id: "d", text: "It fails immediately with a clear error" },
          ],
          correct: "b",
          explanation:
            "It waits for interactive input that never comes. Keep it out of committed code.",
        },
      ],
    },
    {
      id: "dbg-trace",
      slug: "the-trace-viewer",
      title: "The trace viewer",
      moduleId: "debugging",
      summary:
        "The most valuable debugging artifact Playwright produces, and how to read one.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Configure trace recording appropriately",
        "Open and navigate a trace",
        "Diagnose a failure from the snapshot and network panels",
      ],
      sections: [
        {
          kind: "code",
          title: "Recording",
          language: "ts",
          code: `
use: {
  trace: 'on-first-retry',      // recommended default
  // 'on'                  — every run; large and slow
  // 'retain-on-failure'   — keep only failures
  // 'off'                 — no tracing
}
`,
        },
        {
          kind: "code",
          title: "Opening",
          language: "bash",
          code: `
npx playwright show-trace test-results/checkout-place-order/trace.zip
npx playwright show-report      # then click the trace icon on a failed test
`,
        },
        {
          kind: "table",
          title: "What each panel tells you",
          headers: ["Panel", "Answers"],
          rows: [
            ["Actions timeline", "What ran, in what order, and how long it took"],
            ["Before/After snapshots", "What the DOM looked like at that instant"],
            ["Call log", "Which actionability check was still failing"],
            ["Network", "Which requests fired, their status and payloads"],
            ["Console", "Application errors that coincided with the failure"],
            ["Source", "The exact line of test code"],
          ],
        },
        {
          kind: "steps",
          title: "Reading a failure",
          steps: [
            {
              title: "Find the red action",
              body: "The timeline marks the failing step. Everything before it succeeded.",
            },
            {
              title: "Open the 'before' snapshot",
              body: "This is a real, inspectable DOM. Was the element there? Was something covering it?",
            },
            {
              title: "Read the call log",
              body: "It names the check that never passed — not visible, not enabled, not stable, intercepted.",
            },
            {
              title: "Check the network panel",
              body: "A 500 on the request that should have populated the page explains a missing element far better than a longer timeout.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Traces are portable",
          body: [
            "Download the artifact from CI and open it locally, or drop it into trace.playwright.dev. You get the failing run exactly as it happened, without reproducing it.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Running with trace: 'on' everywhere",
          body: "It slows every test and produces gigabytes of artifacts. `on-first-retry` gives the same signal where it matters.",
        },
        {
          title: "Not uploading traces from CI",
          body: "Without the artifact you are debugging from a stack trace alone.",
        },
      ],
      keyTakeaways: [
        "The trace contains DOM snapshots, network and console for every step.",
        "The call log names the failing actionability check.",
        "`on-first-retry` is the right cost/benefit default.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A click times out. Which trace panel identifies the cause fastest?",
          options: [
            { id: "a", text: "The console panel" },
            { id: "b", text: "The call log plus the before-snapshot" },
            { id: "c", text: "The source panel" },
            { id: "d", text: "The metadata panel" },
          ],
          correct: "b",
          explanation:
            "The call log names the failing check and the snapshot shows what was actually on screen.",
        },
      ],
    },
    {
      id: "dbg-errors",
      slug: "reading-playwright-errors",
      title: "Reading Playwright errors",
      moduleId: "debugging",
      summary:
        "A field guide to the failure messages you will meet most often.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Interpret the four most common error shapes",
        "Map each to its usual cause",
        "Know the fix that is not 'increase the timeout'",
      ],
      sections: [
        {
          kind: "code",
          title: "1. Strict mode violation",
          language: "text",
          code: `
Error: strict mode violation: getByRole('button', { name: 'Add to Cart' })
resolved to 6 elements:
  1) <button>Add to Cart</button> aka getByRole('article')
       .filter({ hasText: 'Wireless Headphones' }).getByRole('button')
  ...
`,
        },
        {
          kind: "text",
          body: [
            "**Cause:** the description matches several elements. **Fix:** scope it — Playwright even suggests a disambiguated locator in the error itself.",
          ],
        },
        {
          kind: "code",
          title: "2. Timeout with a call log",
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
          body: [
            "**Cause:** the element exists but never became actionable. **Fix:** find out why it stayed disabled — usually an unfilled required field or a failed request. A longer timeout changes nothing.",
          ],
        },
        {
          kind: "code",
          title: "3. Assertion failure",
          language: "text",
          code: `
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Order Successful!')
Expected: visible
Received: <element(s) not found>
Timeout:  5000ms
`,
        },
        {
          kind: "text",
          body: [
            "**Cause:** the element never appeared. **Fix:** check the network panel — did the request fail? Also check the exact text; 'Order Successful!' and 'Order successful!' are different strings.",
          ],
        },
        {
          kind: "code",
          title: "4. Element intercepts pointer events",
          language: "text",
          code: `
locator.click: Timeout 30000ms exceeded.
Call log:
  - attempting click action
  -   <div class="cookie-banner">…</div> intercepts pointer events
  - retrying click action
`,
        },
        {
          kind: "text",
          body: [
            "**Cause:** something is on top of your target. **Fix:** dismiss the overlay. `force: true` would click the banner instead — a passing test that did nothing.",
          ],
        },
        {
          kind: "table",
          title: "Quick triage",
          headers: ["Message contains", "Look at"],
          rows: [
            ["strict mode violation", "Your locator — it is too broad"],
            ["not enabled / not editable", "Application state, not the timeout"],
            ["intercepts pointer events", "Overlays: modals, banners, sticky headers"],
            ["element(s) not found", "Network failures and exact text"],
            ["Test timeout of 30000ms exceeded", "The whole test is too slow, or it is stuck on one step"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating every timeout as 'the app is slow'",
          body: "The call log almost always says otherwise. Read it before changing any configuration.",
        },
      ],
      keyTakeaways: [
        "Playwright errors name the cause — the call log is the diagnosis.",
        "Strict mode violations even suggest a better locator.",
        "Raising the timeout is the correct fix surprisingly rarely.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt:
            "'element is not enabled - waiting...' appears in the call log. What do you do?",
          options: [
            { id: "a", text: "Increase the timeout" },
            { id: "b", text: "Use force: true" },
            { id: "c", text: "Find out why the button never enables" },
            { id: "d", text: "Add waitForTimeout before the click" },
          ],
          correct: "c",
          explanation:
            "The element was found; the app never enabled it. That is usually a missing precondition — or a real bug.",
        },
      ],
    },
    {
      id: "dbg-reporters",
      slug: "reporters-and-artifacts",
      title: "Reporters and artifacts",
      moduleId: "debugging",
      summary:
        "Making the run's output useful to people who were not watching it.",
      difficulty: "intermediate",
      estimatedTime: 10,
      objectives: [
        "Choose reporters for local and CI runs",
        "Attach screenshots and videos on failure",
        "Add custom attachments and annotations",
      ],
      sections: [
        {
          kind: "table",
          title: "Built-in reporters",
          headers: ["Reporter", "Use"],
          rows: [
            ["list", "Local default — one line per test"],
            ["line", "Compact, good for long suites"],
            ["html", "Full report with traces and screenshots"],
            ["github", "Inline annotations on pull requests"],
            ["junit", "Feeds CI dashboards that expect JUnit XML"],
            ["json", "Machine-readable, for custom tooling"],
            ["blob", "Shard output that merges into one HTML report"],
          ],
        },
        {
          kind: "code",
          title: "Artifacts on failure",
          language: "ts",
          code: `
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
}
`,
        },
        {
          kind: "code",
          title: "Custom attachments",
          language: "ts",
          code: `
test('order confirmation', async ({ page }, testInfo) => {
  // …
  await testInfo.attach('confirmation', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });

  await testInfo.attach('order-payload', {
    body: JSON.stringify(order, null, 2),
    contentType: 'application/json',
  });
});
`,
        },
        {
          kind: "code",
          title: "Annotations",
          language: "ts",
          code: `
test('flaky under load', async ({ page }) => {
  test.info().annotations.push({
    type: 'issue',
    description: 'https://github.com/org/repo/issues/412',
  });
});
`,
        },
        {
          kind: "code",
          title: "Merging sharded reports",
          language: "bash",
          code: `
npx playwright test --shard=1/4 --reporter=blob
npx playwright merge-reports --reporter=html ./blob-report
`,
        },
      ],
      commonMistakes: [
        {
          title: "video: 'on' for the whole suite",
          body: "Gigabytes of artifacts and a noticeably slower run. Retain on failure only.",
        },
        {
          title: "No reporter configured for CI",
          body: "The default output is hard to read in a log. Add `github` and `html`.",
        },
      ],
      keyTakeaways: [
        "Different reporters for local and CI.",
        "Attach payloads and screenshots to make failures self-explanatory.",
        "blob + merge-reports gives one report across shards.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which reporter annotates a pull request inline?",
          options: [
            { id: "a", text: "list" },
            { id: "b", text: "github" },
            { id: "c", text: "json" },
            { id: "d", text: "dot" },
          ],
          correct: "b",
          explanation:
            "The github reporter emits workflow commands that render as inline annotations.",
        },
      ],
    },
  ],
};

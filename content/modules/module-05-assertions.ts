import type { Module } from "../types";

export const assertionsModule: Module = {
  id: "assertions",
  order: 5,
  title: "Assertions",
  tagline: "Web-first assertions that retry until the app catches up",
  summary:
    "The difference between an assertion that polls and one that snapshots is the difference between a stable suite and a flaky one.",
  difficulty: "beginner",
  icon: "CircleCheck",
  track: "core",
  lessons: [
    {
      id: "assert-web-first",
      slug: "web-first-assertions",
      title: "Web-first assertions and auto-retry",
      moduleId: "assertions",
      summary:
        "Why `await expect(locator).toBeVisible()` is fundamentally different from `expect(await locator.isVisible()).toBe(true)`.",
      difficulty: "beginner",
      estimatedTime: 14,
      objectives: [
        "Explain what retrying means for an assertion",
        "Spot the non-retrying anti-pattern",
        "Control assertion timeouts",
      ],
      sections: [
        {
          kind: "text",
          title: "The core idea",
          body: [
            "A web-first assertion takes a **locator**, not a value. Because the locator is re-resolved on every attempt, Playwright can keep checking until the condition holds or the timeout expires. Modern UIs update asynchronously; this is what absorbs that.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Snapshot — fails the instant the value is wrong",
          goodLabel: "Web-first — retries until it is right",
          bad: `
const visible = await page.getByText('Order Successful!').isVisible();
expect(visible).toBe(true);`,
          good: `
await expect(page.getByText('Order Successful!')).toBeVisible();`,
          note:
            "The bad version reads the DOM once, typically before the confirmation has rendered.",
        },
        {
          kind: "diagram",
          title: "What retrying looks like",
          ascii: `t=0ms    check → not visible
t=100ms  check → not visible
t=200ms  check → not visible
t=340ms  check → VISIBLE ✓  assertion passes

(gives up at the configured timeout, default 5000ms)`,
        },
        {
          kind: "code",
          title: "Timeouts",
          language: "ts",
          code: `
// Per assertion
await expect(page.getByTestId('report-ready')).toBeVisible({ timeout: 30_000 });

// Globally, in playwright.config.ts
export default defineConfig({
  expect: { timeout: 10_000 },
});
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "The missing await",
          body: [
            "`expect(locator).toBeVisible()` without `await` returns a Promise that nobody checks. The test passes even when the assertion fails. Enable the `@typescript-eslint/no-floating-promises` rule — it catches this class of bug immediately.",
          ],
        },
        {
          kind: "table",
          title: "Two families of assertion",
          headers: ["", "Retrying (web-first)", "Non-retrying"],
          rows: [
            ["Argument", "A Locator, Page or APIResponse", "A plain value"],
            ["Example", "await expect(locator).toHaveText('x')", "expect(total).toBe(3)"],
            ["Needs await", "Yes", "No"],
            ["Use for", "Anything about the page", "Values you already computed"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "expect(await locator.textContent()).toBe('...')",
          body: "One snapshot, no retry. Use `await expect(locator).toHaveText('...')`.",
        },
        {
          title: "Raising the global expect timeout to hide flakiness",
          body: "It slows every failure down. Find the specific condition worth waiting for instead.",
        },
      ],
      keyTakeaways: [
        "Web-first assertions take a locator and poll until the condition holds.",
        "Assertions on already-read values cannot retry.",
        "Always await an expect on a locator.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "This assertion fails intermittently even though the message eventually appears. Why?",
          code: `const text = await page.getByTestId('toast').textContent();
expect(text).toBe('Message sent successfully!');`,
          options: [
            { id: "a", text: "textContent returns null" },
            { id: "b", text: "It reads the DOM once and cannot retry" },
            { id: "c", text: "toBe should be toEqual" },
            { id: "d", text: "getByTestId is the wrong locator" },
          ],
          correct: "b",
          explanation:
            "`await expect(page.getByTestId('toast')).toHaveText('Message sent successfully!')` polls until the toast renders.",
        },
        {
          id: "q2",
          type: "true-false",
          prompt: "`expect(locator).toBeVisible()` without await still fails the test when the element is missing.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation:
            "The returned Promise rejects, but nothing awaits it, so the test moves on and often passes.",
        },
      ],
      playground: ["assertions"],
      challenges: ["ch-assert-success"],
    },
    {
      id: "assert-locator",
      slug: "locator-assertions",
      title: "Locator assertions in full",
      moduleId: "assertions",
      summary:
        "Visibility, text, values, state, counts and attributes — with the exact-vs-substring rules.",
      difficulty: "beginner",
      estimatedTime: 16,
      objectives: [
        "Pick the right assertion for each situation",
        "Know when text matching is exact and when it is not",
        "Use .not correctly",
      ],
      sections: [
        {
          kind: "code",
          title: "Visibility and presence",
          language: "ts",
          code: `
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();     // hidden OR not in the DOM
await expect(locator).toBeAttached();   // in the DOM, possibly invisible
await expect(locator).toHaveCount(3);
await expect(locator).toHaveCount(0);   // matches nothing
await expect(locator).toBeInViewport();
`,
        },
        {
          kind: "code",
          title: "Text and values",
          language: "ts",
          code: `
await expect(heading).toHaveText('Order Successful!');       // exact, normalised
await expect(banner).toContainText('successfully');           // substring
await expect(heading).toHaveText(/ORD-\\d{6}/);                // regex

await expect(emailInput).toHaveValue('testuser@example.com'); // form value
await expect(emailInput).toBeEmpty();
await expect(select).toHaveValues(['audio', 'wearables']);    // multi-select
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "toHaveText on a multi-match locator",
          body: [
            "If the locator matches several elements, `toHaveText` expects an **array** of expected strings, one per element, in order. Passing a single string then fails with a confusing message.",
          ],
        },
        {
          kind: "code",
          title: "Asserting a whole list at once",
          language: "ts",
          code: `
await expect(page.getByTestId('cart-item-name')).toHaveText([
  'Wireless Headphones',
  'Mechanical Keyboard',
]);
`,
        },
        {
          kind: "code",
          title: "State",
          language: "ts",
          code: `
await expect(button).toBeEnabled();
await expect(button).toBeDisabled();
await expect(checkbox).toBeChecked();
await expect(checkbox).not.toBeChecked();
await expect(input).toBeEditable();
await expect(input).toBeFocused();
`,
        },
        {
          kind: "code",
          title: "Attributes, classes and CSS",
          language: "ts",
          code: `
await expect(link).toHaveAttribute('href', '/practice/shop/cart');
await expect(link).toHaveAttribute('href', /\\/cart$/);
await expect(el).toHaveClass(/is-active/);
await expect(el).toHaveId('main-content');
await expect(el).toHaveCSS('display', 'none');
await expect(el).toHaveJSProperty('checked', true);
`,
        },
        {
          kind: "code",
          title: "Page-level assertions",
          language: "ts",
          code: `
await expect(page).toHaveURL('/practice/shop/orders');
await expect(page).toHaveURL(/\\/orders/);
await expect(page).toHaveTitle(/ShopEasy/);
`,
        },
        {
          kind: "table",
          title: "Matching rules at a glance",
          headers: ["Assertion", "Match"],
          rows: [
            ["toHaveText('x')", "Exact, after whitespace normalisation"],
            ["toContainText('x')", "Substring"],
            ["toHaveValue('x')", "Exact"],
            ["toHaveURL('/a')", "Resolved against baseURL, exact"],
            ["toHaveAttribute('a', 'b')", "Exact unless a regex is given"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "toBeHidden vs. not.toBeVisible",
          body: [
            "`toBeHidden()` passes when the element is hidden **or** absent. `not.toBeVisible()` passes as soon as it stops being visible. They usually agree, but `toHaveCount(0)` is the clearest way to assert that something is genuinely gone from the DOM.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "toHaveText where toContainText was meant",
          body: "Exact matching fails on 'Welcome back, Test User' when you asserted 'Welcome back'.",
        },
        {
          title: "Asserting on styling instead of behaviour",
          body: "`toHaveCSS('color', 'rgb(255,0,0)')` breaks on a theme change. Assert the error message text instead.",
        },
      ],
      keyTakeaways: [
        "toHaveText is exact; toContainText is a substring; both accept regexes.",
        "For a multi-match locator, toHaveText takes an array.",
        "toHaveCount(0) is the clearest 'this is gone' assertion.",
      ],
      quiz: [
        {
          id: "q1",
          type: "predict-result",
          prompt:
            "The element renders as `<h2>  Welcome back, Test User </h2>`. Which assertion passes?",
          options: [
            { id: "a", text: "toHaveText('Welcome back')" },
            { id: "b", text: "toContainText('Welcome back')" },
            { id: "c", text: "toHaveValue('Welcome back, Test User')" },
            { id: "d", text: "toHaveText('  Welcome back, Test User ')" },
          ],
          correct: "b",
          explanation:
            "toHaveText is exact after normalisation, so it needs the full string. toContainText matches the substring. toHaveValue is for form controls.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "How do you assert the cart is empty in the DOM?",
          options: [
            { id: "a", text: "await expect(page.getByTestId('cart-item')).toHaveCount(0)" },
            { id: "b", text: "expect(await page.getByTestId('cart-item').count()).toBe(0)" },
            { id: "c", text: "await expect(page.getByTestId('cart-item')).toBeNull()" },
            { id: "d", text: "await expect(page.getByTestId('cart-item')).toBeUndefined()" },
          ],
          correct: "a",
          explanation:
            "toHaveCount retries; the raw count() call snapshots immediately and can pass for the wrong reason.",
        },
      ],
      playground: ["assertions"],
    },
    {
      id: "assert-soft-custom",
      slug: "soft-assertions-and-messages",
      title: "Soft assertions, custom messages and polling",
      moduleId: "assertions",
      summary:
        "Collect several failures in one run, label them clearly, and poll arbitrary conditions.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Use expect.soft to gather multiple failures",
        "Attach a custom message to an assertion",
        "Poll a non-locator condition with expect.poll",
      ],
      sections: [
        {
          kind: "code",
          title: "Soft assertions",
          language: "ts",
          code: `
await expect.soft(page.getByTestId('order-number')).toContainText('ORD-');
await expect.soft(page.getByTestId('order-total')).toHaveText('$249.50');
await expect.soft(page.getByTestId('order-status')).toHaveText('Paid');

// The test continues after each failure and reports all of them at the end.
`,
          caption:
            "Ideal for verifying many fields on one confirmation screen — you see every mismatch in a single run.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Soft assertions do not stop the test",
          body: [
            "If the next step depends on the previous assertion being true, use a hard assertion. Soft assertions are for independent checks on a page you have already reached.",
          ],
        },
        {
          kind: "code",
          title: "Custom failure messages",
          language: "ts",
          code: `
await expect(
  page.getByTestId('cart-count'),
  'cart badge should show the two items added above',
).toHaveText('2');
`,
        },
        {
          kind: "code",
          title: "expect.poll — retry any async value",
          language: "ts",
          code: `
// Poll an API until the order reaches the expected status.
await expect
  .poll(async () => {
    const res = await request.get('/api/orders/ORD-839472');
    return (await res.json()).status;
  }, {
    message: 'order should become paid',
    timeout: 15_000,
    intervals: [500, 1000, 2000],
  })
  .toBe('paid');
`,
        },
        {
          kind: "code",
          title: "expect.toPass — retry a whole block",
          language: "ts",
          code: `
await expect(async () => {
  const res = await request.get('/api/products');
  expect(res.status()).toBe(200);
  expect((await res.json()).products.length).toBeGreaterThan(0);
}).toPass({ timeout: 20_000 });
`,
        },
      ],
      commonMistakes: [
        {
          title: "Soft-asserting something the rest of the test depends on",
          body: "The test carries on into a broken state and produces a cascade of confusing failures.",
        },
        {
          title: "Wrapping a locator assertion in expect.poll",
          body: "Locator assertions already retry. expect.poll is for values that do not — API responses, database reads, computed totals.",
        },
      ],
      keyTakeaways: [
        "expect.soft collects independent failures in one run.",
        "A custom message turns a cryptic failure into a readable one.",
        "expect.poll and expect.toPass bring retrying to non-locator checks.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "When is expect.soft the right choice?",
          options: [
            { id: "a", text: "When checking several independent fields on one screen" },
            { id: "b", text: "When the next step depends on the assertion" },
            { id: "c", text: "When the assertion is flaky" },
            { id: "d", text: "Always — it gives more information" },
          ],
          correct: "a",
          explanation:
            "Soft assertions let the test continue, which is only safe when the following steps do not depend on the result.",
        },
      ],
    },
    {
      id: "assert-visual-a11y",
      slug: "snapshot-and-accessibility-assertions",
      title: "Snapshot and accessibility assertions",
      moduleId: "assertions",
      summary:
        "Screenshot comparison and ARIA snapshots — powerful, and easy to make unmaintainable.",
      difficulty: "advanced",
      estimatedTime: 12,
      objectives: [
        "Write a visual regression assertion",
        "Mask dynamic regions",
        "Use ARIA snapshots to lock in structure",
      ],
      sections: [
        {
          kind: "code",
          title: "Screenshot comparison",
          language: "ts",
          code: `
await expect(page).toHaveScreenshot('shop-landing.png', {
  maxDiffPixelRatio: 0.01,
  mask: [page.getByTestId('cart-count'), page.getByTestId('order-number')],
  animations: 'disabled',
});

// Component-level is far more stable than full-page
await expect(page.getByRole('article').first()).toHaveScreenshot('card.png');
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Baselines are platform-specific",
          body: [
            "Font rendering differs between macOS and Linux, so a baseline captured locally will not match CI. Generate baselines in the same container CI uses, or run visual checks only in that environment.",
          ],
        },
        {
          kind: "code",
          title: "ARIA snapshots",
          language: "ts",
          code: `
await expect(page.getByRole('form')).toMatchAriaSnapshot(\`
  - heading "Create your account" [level=1]
  - textbox "First Name"
  - textbox "Last Name"
  - textbox "Email"
  - checkbox "Terms and Conditions"
  - button "Register"
\`);
`,
          caption:
            "Asserts the accessibility structure rather than pixels — resilient to styling changes, and it fails loudly when semantics regress.",
        },
        {
          kind: "table",
          title: "Choosing between them",
          headers: ["Concern", "Best tool"],
          rows: [
            ["Did the layout visually break?", "toHaveScreenshot on a component"],
            ["Did the structure/semantics change?", "toMatchAriaSnapshot"],
            ["Did the content change?", "toHaveText / toContainText"],
            ["Is the app still usable?", "Role-based locators plus an axe scan"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Full-page screenshots on every test",
          body: "They fail on any unrelated change and get updated blindly with `--update-snapshots`, which destroys their value.",
        },
        {
          title: "Not masking dynamic content",
          body: "Timestamps, order numbers and cart counts guarantee a diff. Mask them.",
        },
      ],
      keyTakeaways: [
        "Prefer component screenshots over full-page ones.",
        "Mask everything that legitimately changes.",
        "ARIA snapshots assert meaning, which usually matters more than pixels.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Visual tests pass locally and fail in CI on every run. Most likely cause?",
          options: [
            { id: "a", text: "CI is too slow" },
            { id: "b", text: "Baselines were generated on a different OS with different font rendering" },
            { id: "c", text: "toHaveScreenshot is unsupported in CI" },
            { id: "d", text: "The viewport is random" },
          ],
          correct: "b",
          explanation:
            "Generate baselines in the same environment CI uses — typically a Linux container.",
        },
      ],
    },
  ],
};

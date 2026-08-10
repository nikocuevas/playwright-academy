import type { Module } from "../types";

export const fundamentalsModule: Module = {
  id: "playwright-fundamentals",
  order: 2,
  title: "Playwright Fundamentals",
  tagline: "Install it, run it, and understand every line of your first test",
  summary:
    "What Playwright is, how the test runner works, and the object model — Browser, BrowserContext, Page, Locator — that everything else builds on.",
  difficulty: "beginner",
  icon: "PlayCircle",
  track: "core",
  lessons: [
    {
      id: "pw-what-is",
      slug: "what-is-playwright",
      title: "What Playwright is (and what it is not)",
      moduleId: "playwright-fundamentals",
      summary:
        "A browser automation library plus a test runner, driving Chromium, Firefox and WebKit through one API.",
      difficulty: "beginner",
      estimatedTime: 10,
      objectives: [
        "Describe what Playwright automates",
        "Separate the library from the test runner",
        "Know where Playwright fits in a testing strategy",
      ],
      sections: [
        {
          kind: "text",
          title: "Two things in one package",
          body: [
            "**Playwright** is a browser automation library: it launches real browsers and drives them programmatically. **Playwright Test** (`@playwright/test`) is the test runner built on top of it — it gives you `test()`, `expect()`, parallelism, retries, reporters and fixtures.",
            "When people say 'we use Playwright' they almost always mean both together.",
          ],
        },
        {
          kind: "diagram",
          title: "How a test reaches the browser",
          ascii: `Your test file (.spec.ts)
        │
        ▼
Playwright Test runner  ── fixtures, retries, reporting
        │
        ▼
Playwright library      ── one API for three engines
        │
   ┌────┴─────┬──────────┐
   ▼          ▼          ▼
Chromium   Firefox    WebKit`,
        },
        {
          kind: "list",
          title: "What makes it different from older tools",
          items: [
            "**Auto-waiting** — actions wait for elements to be actionable, so most explicit sleeps disappear.",
            "**Browser contexts** — isolated, near-instant 'incognito profiles' instead of relaunching a browser per test.",
            "**One API, three engines** — Chromium, Firefox and WebKit without separate drivers.",
            "**Network control built in** — intercept, mock and assert on requests with `page.route()`.",
            "**Trace viewer** — a recorded timeline with DOM snapshots for every failing run.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where E2E tests belong",
          body: [
            "End-to-end tests are the slowest and most expensive layer. Use them for critical user journeys — register, log in, buy, pay — and push detail coverage down to API and unit tests. This platform's API testing module shows how to combine the layers.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Confusing `playwright` with `@playwright/test`",
          body: "`playwright` is the library alone. For test suites install `@playwright/test`, which includes the library plus the runner.",
        },
        {
          title: "Trying to E2E-test everything",
          body: "A 400-test browser suite that takes an hour gets ignored. Test the journeys; validate the rest through the API layer.",
        },
      ],
      keyTakeaways: [
        "Playwright = automation library + test runner.",
        "Auto-waiting and browser contexts are the two features that most reduce flakiness.",
        "E2E is one layer of a strategy, not the whole strategy.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which package should a new test suite install?",
          options: [
            { id: "a", text: "playwright" },
            { id: "b", text: "@playwright/test" },
            { id: "c", text: "playwright-core" },
            { id: "d", text: "@playwright/browser" },
          ],
          correct: "b",
          explanation:
            "`@playwright/test` bundles the automation library with the test runner, fixtures, expect and reporters.",
        },
      ],
    },
    {
      id: "pw-install",
      slug: "installation-and-project-setup",
      title: "Installation and project setup",
      moduleId: "playwright-fundamentals",
      summary:
        "From an empty folder to a running test, and what each generated file is for.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Install Playwright and its browsers",
        "Understand playwright.config.ts",
        "Run tests headed, headless and in UI mode",
      ],
      sections: [
        {
          kind: "steps",
          title: "Setting up",
          steps: [
            {
              title: "Install the test package",
              body: "This adds the runner, the library and TypeScript types.",
              code: "npm install -D @playwright/test",
              language: "bash",
            },
            {
              title: "Download the browser binaries",
              body: "Playwright ships pinned builds of Chromium, Firefox and WebKit. They live outside node_modules, so this step is separate.",
              code: "npx playwright install",
              language: "bash",
            },
            {
              title: "Run the suite",
              body: "Headless by default, in parallel across workers.",
              code: "npx playwright test",
              language: "bash",
            },
            {
              title: "Open the report",
              body: "An HTML report with traces, screenshots and step timings.",
              code: "npx playwright show-report",
              language: "bash",
            },
          ],
        },
        {
          kind: "code",
          title: "A realistic playwright.config.ts",
          language: "ts",
          code: `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`,
          caption: "This is close to the config shipped with Playwright Academy.",
        },
        {
          kind: "table",
          title: "The settings that matter most",
          headers: ["Option", "Why it matters"],
          rows: [
            ["baseURL", "Lets tests use `page.goto('/cart')` instead of full URLs, so one env var retargets the whole suite."],
            ["trace", "`on-first-retry` records a full timeline only for runs that already failed once — great signal, low cost."],
            ["retries", "Retrying in CI hides transient infrastructure noise. Keep it at 0 locally so you feel your own flakiness."],
            ["fullyParallel", "Runs tests inside a file in parallel. Requires genuinely independent tests."],
            ["webServer", "Starts your app before the run and shuts it down afterwards."],
          ],
        },
        {
          kind: "code",
          title: "Useful run commands",
          language: "bash",
          code: `
npx playwright test                      # everything, headless
npx playwright test tests/shopping       # one folder
npx playwright test --headed             # watch the browser
npx playwright test --ui                 # interactive UI mode
npx playwright test --debug              # step through with Inspector
npx playwright test --project=firefox    # one project only
npx playwright test -g "add to cart"     # filter by title
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "UI mode is the fastest feedback loop",
          body: [
            "`npx playwright test --ui` gives you a watch mode with a time-travel timeline, DOM snapshots and a locator picker. It is the single best habit to build early.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Skipping `npx playwright install`",
          body: "Installing the npm package does not download browsers. The first run then fails with 'Executable doesn't exist'.",
        },
        {
          title: "Hardcoding http://localhost:3000 in tests",
          body: "Set `baseURL` in the config and use relative paths, so the same suite can run against a deployed environment.",
        },
      ],
      keyTakeaways: [
        "Two install steps: the npm package, then the browser binaries.",
        "`baseURL` plus relative paths makes the suite portable across environments.",
        "`trace: 'on-first-retry'` is the best default for debugging CI failures.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Your first run fails with \"Executable doesn't exist\". What is missing?",
          options: [
            { id: "a", text: "npm install" },
            { id: "b", text: "npx playwright install" },
            { id: "c", text: "A playwright.config.ts file" },
            { id: "d", text: "Node.js 20+" },
          ],
          correct: "b",
          explanation:
            "Browser binaries are downloaded separately from the npm package.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "Which trace setting gives good debugging signal at low cost?",
          options: [
            { id: "a", text: "trace: 'on'" },
            { id: "b", text: "trace: 'off'" },
            { id: "c", text: "trace: 'on-first-retry'" },
            { id: "d", text: "trace: 'retain-on-failure' for every run" },
          ],
          correct: "c",
          explanation:
            "It records only when a test has already failed once, so you get the timeline for exactly the runs you care about.",
        },
      ],
    },
    {
      id: "pw-first-test",
      slug: "your-first-test-line-by-line",
      title: "Your first test, line by line",
      moduleId: "playwright-fundamentals",
      summary: "Six lines of code, fully explained.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Write and run a first test",
        "Explain every token in the file",
        "Use baseURL-relative navigation",
      ],
      sections: [
        {
          kind: "code",
          title: "tests/example.spec.ts",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Playwright Academy/);
});
`,
          showLineNumbers: true,
        },
        {
          kind: "list",
          title: "Every part of it",
          items: [
            "`import { test, expect } from '@playwright/test'` — pulls the runner's test function and its assertion library. Do not import `expect` from anywhere else; Playwright's version is the one that auto-retries.",
            "`test('homepage loads', ...)` — registers a test with a human-readable title. The title appears in reports and can be filtered with `-g`.",
            "`async ({ page }) => {}` — the test body. `page` is a fixture: a fresh, isolated page created for this test and thrown away afterwards.",
            "`await page.goto('/')` — navigates. Because `baseURL` is configured, `'/'` expands to `http://localhost:3000/`.",
            "`await expect(page).toHaveTitle(/Playwright Academy/)` — a web-first assertion. It polls until the title matches or the timeout expires.",
          ],
        },
        {
          kind: "callout",
          tone: "success",
          title: "Every test starts clean",
          body: [
            "Each test gets its own BrowserContext: no cookies, no localStorage, no leftover state from the previous test. That isolation is what lets Playwright run tests in parallel safely.",
          ],
        },
        {
          kind: "code",
          title: "Adding a second, more realistic test",
          language: "ts",
          code: `
test('registration page shows the form', async ({ page }) => {
  await page.goto('/practice/registration');

  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible();

  await expect(page.getByLabel('Email')).toBeEmpty();
});
`,
        },
        {
          kind: "practice",
          href: "/playground?scenario=navigate",
          title: "Try it in the playground",
          body: "Run this exact test against the simulated browser and watch each step execute.",
        },
      ],
      commonMistakes: [
        {
          title: "Importing expect from another library",
          body: "Jest's or Chai's `expect` does not auto-retry. Always import both `test` and `expect` from `@playwright/test`.",
        },
        {
          title: "Writing full URLs everywhere",
          body: "With `baseURL` set, use relative paths. It keeps the suite runnable against local, preview and production URLs.",
        },
      ],
      keyTakeaways: [
        "`test(title, fn)` registers a test; the fn receives fixtures.",
        "`page` is a fresh isolated page per test.",
        "Playwright's `expect` polls — that is what makes it web-first.",
      ],
      quiz: [
        {
          id: "q1",
          type: "true-false",
          prompt: "Two tests in the same file share cookies and localStorage by default.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation:
            "Each test gets its own BrowserContext, so storage and cookies start empty.",
        },
      ],
      playground: ["navigate"],
    },
    {
      id: "pw-object-model",
      slug: "browser-context-page",
      title: "Browser, BrowserContext and Page",
      moduleId: "playwright-fundamentals",
      summary:
        "The three-level object model that explains test isolation, parallelism and storageState.",
      difficulty: "beginner",
      estimatedTime: 14,
      objectives: [
        "Explain the relationship between Browser, BrowserContext and Page",
        "Describe why contexts make tests fast and isolated",
        "Create extra contexts and pages when a scenario needs them",
      ],
      sections: [
        {
          kind: "diagram",
          title: "The hierarchy",
          ascii: `Browser  (one process — expensive to start)
│
├── Context A   (isolated cookies / storage / permissions)
│    ├── Page 1
│    └── Page 2      ← shares session with Page 1
│
└── Context B   (completely separate session)
     └── Page 1`,
          caption:
            "Playwright creates one Browser per worker and one Context per test.",
        },
        {
          kind: "table",
          title: "What each level owns",
          headers: ["Object", "Think of it as", "Owns"],
          rows: [
            ["Browser", "The application process", "Engine, launch options"],
            [
              "BrowserContext",
              "An incognito profile",
              "Cookies, localStorage, permissions, geolocation, storageState",
            ],
            ["Page", "A single tab", "The DOM, navigation, network events"],
          ],
        },
        {
          kind: "text",
          title: "Why this design matters",
          body: [
            "Launching a browser takes hundreds of milliseconds. Creating a context takes a few. By reusing one browser and giving every test a fresh context, Playwright gets true isolation at almost no cost — which is exactly what makes parallel execution safe.",
            "This is also the foundation of `storageState`: authentication lives in the context, so you can save it once and hand it to every future context.",
          ],
        },
        {
          kind: "code",
          title: "Two users in one test",
          language: "ts",
          code: `
test('two shoppers do not share a cart', async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();

  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();

  await alicePage.goto('/practice/shop');
  await bobPage.goto('/practice/shop');

  // Alice adds an item; Bob's cart stays empty.
  await alicePage
    .getByRole('article')
    .filter({ hasText: 'Wireless Headphones' })
    .getByRole('button', { name: 'Add to Cart' })
    .click();

  await expect(alicePage.getByTestId('cart-count')).toHaveText('1');
  await expect(bobPage.getByTestId('cart-count')).toHaveText('0');

  await alice.close();
  await bob.close();
});
`,
          caption:
            "Ask for the `browser` fixture when you need to build contexts yourself.",
        },
        {
          kind: "code",
          title: "A second tab inside one session",
          language: "ts",
          code: `
const secondTab = await page.context().newPage();
await secondTab.goto('/practice/shop/orders');
// secondTab shares cookies and localStorage with page
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Close what you create",
          body: [
            "Fixtures clean themselves up. Contexts you create manually with `browser.newContext()` do not — close them or the worker leaks memory across a long run.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Expecting two contexts to share login",
          body: "They cannot — that is the point. Use `storageState` to seed both with the same authenticated session.",
        },
        {
          title: "Launching a browser per test manually",
          body: "The `page` fixture already gives you an isolated environment. Manual launching is slow and rarely needed.",
        },
      ],
      keyTakeaways: [
        "Browser → Context → Page, from most expensive to cheapest.",
        "Isolation lives at the context level, which is why each test gets its own.",
        "Multi-user scenarios need multiple contexts, not multiple browsers.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Where do cookies and localStorage live?",
          options: [
            { id: "a", text: "On the Browser" },
            { id: "b", text: "On the BrowserContext" },
            { id: "c", text: "On the Page" },
            { id: "d", text: "On the Locator" },
          ],
          correct: "b",
          explanation:
            "Storage is per context. Two pages in the same context share it; two contexts never do.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt:
            "You need to test a chat between two logged-in users in one test. What do you create?",
          options: [
            { id: "a", text: "Two browsers" },
            { id: "b", text: "Two contexts, one page each" },
            { id: "c", text: "Two pages in the same context" },
            { id: "d", text: "Two test files" },
          ],
          correct: "b",
          explanation:
            "Separate contexts give separate sessions. Two pages in one context would share the same logged-in user.",
        },
      ],
    },
    {
      id: "pw-test-structure",
      slug: "test-structure-and-hooks",
      title: "Test structure, hooks and tags",
      moduleId: "playwright-fundamentals",
      summary:
        "describe blocks, beforeEach, test.step, skip/only and tagging a suite.",
      difficulty: "beginner",
      estimatedTime: 13,
      objectives: [
        "Group tests and share setup with hooks",
        "Make reports readable with test.step",
        "Skip, focus and tag tests deliberately",
      ],
      sections: [
        {
          kind: "code",
          title: "Grouping and shared setup",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/registration');
  });

  test('rejects mismatched passwords', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Different123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('requires the terms checkbox', async ({ page }) => {
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(
      page.getByText('You must accept the Terms and Conditions'),
    ).toBeVisible();
  });
});
`,
        },
        {
          kind: "table",
          title: "The hooks",
          headers: ["Hook", "Runs"],
          rows: [
            ["test.beforeEach", "Before every test in scope — the workhorse"],
            ["test.afterEach", "After every test; good for diagnostics on failure"],
            ["test.beforeAll", "Once per worker; no `page` fixture available"],
            ["test.afterAll", "Once per worker, for teardown"],
          ],
        },
        {
          kind: "code",
          title: "test.step makes long tests readable",
          language: "ts",
          code: `
test('complete purchase', async ({ page }) => {
  await test.step('Add a product to the cart', async () => {
    await page.goto('/practice/shop');
    await page
      .getByRole('article')
      .filter({ hasText: 'Wireless Headphones' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
  });

  await test.step('Check out', async () => {
    await page.goto('/practice/shop/checkout');
    await page.getByRole('button', { name: 'Place Order' }).click();
  });

  await test.step('Verify the confirmation', async () => {
    await expect(page.getByText('Order Successful!')).toBeVisible();
  });
});
`,
          caption:
            "Steps become collapsible groups in the HTML report and the trace viewer.",
        },
        {
          kind: "code",
          title: "Skipping, focusing and tagging",
          language: "ts",
          code: `
test.skip('not implemented yet', async () => {});
test.fixme('known broken — ticket QA-412', async () => {});
test.only('run just this one locally', async () => {});

test('checkout works', { tag: '@smoke' }, async ({ page }) => {});

// Conditional skip
test('webkit only', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'WebKit-specific behaviour');
});
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "test.only in CI is a silent disaster",
          body: [
            "It makes the whole suite pass while running one test. Set `forbidOnly: !!process.env.CI` in the config so CI fails the build instead.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Using beforeAll to log in",
          body: "beforeAll runs once per worker and has no `page` fixture. Use a setup project with storageState instead — covered in the Authentication module.",
        },
        {
          title: "Sharing state between tests through module variables",
          body: "Tests run in parallel and in arbitrary order. Any state that leaks between them will eventually fail.",
        },
      ],
      keyTakeaways: [
        "beforeEach is where per-test navigation and setup belongs.",
        "test.step turns a 40-line journey into a readable report.",
        "`forbidOnly` in CI prevents an accidental `test.only` from hiding the suite.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why can't you use the `page` fixture inside beforeAll?",
          options: [
            { id: "a", text: "It is only available in afterAll" },
            { id: "b", text: "`page` is test-scoped; beforeAll is worker-scoped" },
            { id: "c", text: "beforeAll cannot be async" },
            { id: "d", text: "You can — it works fine" },
          ],
          correct: "b",
          explanation:
            "The page fixture is created per test. Worker-scoped hooks run outside any individual test.",
        },
      ],
    },
    {
      id: "pw-config-projects",
      slug: "projects-and-multi-browser",
      title: "Projects, devices and multi-browser runs",
      moduleId: "playwright-fundamentals",
      summary:
        "One suite, many configurations: browsers, viewports, mobile emulation and dependencies.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Define projects for Chromium, Firefox and WebKit",
        "Emulate mobile devices",
        "Use project dependencies for setup steps",
      ],
      sections: [
        {
          kind: "text",
          title: "A project is a named run configuration",
          body: [
            "Projects let the same test files execute under different settings. The classic use is cross-browser coverage, but they also power device emulation and — importantly — authentication setup.",
          ],
        },
        {
          kind: "code",
          title: "Cross-browser and mobile projects",
          language: "ts",
          code: `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['iPhone 14'] } },
  ],
});
`,
        },
        {
          kind: "table",
          title: "The three engines",
          headers: ["Project", "Engine", "Approximates"],
          rows: [
            ["chromium", "Chromium", "Chrome and Edge"],
            ["firefox", "Gecko", "Firefox"],
            ["webkit", "WebKit", "Safari, including iOS"],
          ],
        },
        {
          kind: "code",
          title: "Project dependencies — the setup pattern",
          language: "ts",
          code: `
projects: [
  { name: 'setup', testMatch: /.*\\.setup\\.ts/ },

  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
],
`,
          caption:
            "`dependencies` guarantees the setup project finishes before the browser project starts. This is how storageState gets created exactly once.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Do not run every test on every browser",
          body: [
            "Run the full suite on Chromium and a smoke-tagged subset on Firefox and WebKit. You catch engine-specific bugs without tripling CI time.",
          ],
        },
        {
          kind: "code",
          title: "Running a subset",
          language: "bash",
          code: `
npx playwright test --project=chromium
npx playwright test --project=webkit --grep @smoke
`,
        },
      ],
      commonMistakes: [
        {
          title: "Assuming WebKit equals Safari exactly",
          body: "WebKit is the same engine, but not the full Safari browser. It catches most rendering and API differences, not every one.",
        },
        {
          title: "Forgetting `dependencies` on the setup project",
          body: "Without it the browser project may start before the auth file exists, and every test fails on the first navigation.",
        },
      ],
      keyTakeaways: [
        "Projects are named configurations over the same test files.",
        "`dependencies` orders projects — the basis of the auth setup pattern.",
        "Full suite on one engine, smoke suite on the rest, is a sane default.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What does `dependencies: ['setup']` on a project do?",
          options: [
            { id: "a", text: "Installs npm packages before the run" },
            { id: "b", text: "Runs the setup project to completion first" },
            { id: "c", text: "Imports fixtures from the setup project" },
            { id: "d", text: "Retries the project if setup fails" },
          ],
          correct: "b",
          explanation:
            "It orders execution, which is how the authentication file is guaranteed to exist before tests run.",
        },
      ],
    },
  ],
};

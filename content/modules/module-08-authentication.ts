import type { Module } from "../types";

export const authModule: Module = {
  id: "authentication",
  order: 8,
  title: "Authentication & storageState",
  tagline: "Log in once, run a hundred authenticated tests",
  summary:
    "The single highest-leverage optimisation in most suites: capture a signed-in browser state once in a setup project, then start every test already authenticated.",
  difficulty: "intermediate",
  icon: "KeyRound",
  track: "architecture",
  lessons: [
    {
      id: "auth-problem",
      slug: "the-authentication-problem",
      title: "The problem with logging in every test",
      moduleId: "authentication",
      summary:
        "Why repeating the login flow in beforeEach is slow, noisy and misleading.",
      difficulty: "intermediate",
      estimatedTime: 10,
      objectives: [
        "Quantify the cost of per-test login",
        "Explain why a shared login makes failures ambiguous",
        "Describe where authentication state actually lives",
      ],
      sections: [
        {
          kind: "text",
          title: "The naive approach",
          body: [
            "Most suites start with a `beforeEach` that navigates to the login page, fills the form and waits for the dashboard. It works — and then it becomes the slowest, noisiest part of the run.",
          ],
        },
        {
          kind: "code",
          title: "What everyone writes first",
          language: "ts",
          code: `
test.beforeEach(async ({ page }) => {
  await page.goto('/practice/shop/login');
  await page.getByLabel('Email').fill('testuser@example.com');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Welcome back, Test User')).toBeVisible();
});
`,
        },
        {
          kind: "table",
          title: "What it costs",
          headers: ["Problem", "Impact"],
          rows: [
            ["~3 s per test", "120 tests add roughly six minutes to every run"],
            ["Login is exercised 120 times", "One real login test would prove the same thing"],
            ["A login outage fails everything", "The report says 120 failures instead of one"],
            ["Extra load on the auth service", "Rate limiting and lockouts in shared environments"],
          ],
        },
        {
          kind: "text",
          title: "Where the session actually lives",
          body: [
            "After a successful login the browser holds a session cookie and often some localStorage. Both belong to the **BrowserContext**. If you can serialise that state to a file, any future context can start from it — already logged in, with no UI interaction at all.",
          ],
        },
        {
          kind: "diagram",
          title: "The pattern",
          ascii: `Setup project (runs once)
   login through the UI
        ↓
   context.storageState({ path: 'playwright/.auth/user.json' })
        ↓
Every test project
   use: { storageState: 'playwright/.auth/user.json' }
        ↓
   tests start already authenticated`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Still test login itself",
          body: [
            "Keep one unauthenticated spec covering the real login flow, including bad credentials. The storageState pattern removes repetition, not coverage.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Deleting the login test after adopting storageState",
          body: "Login is a critical journey. Test it once, deliberately, in an unauthenticated project.",
        },
      ],
      keyTakeaways: [
        "Session state lives on the BrowserContext, so it can be serialised.",
        "Per-test UI login is slow and turns one outage into hundreds of failures.",
        "Log in once, reuse everywhere, and keep one dedicated login test.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which object owns cookies and localStorage?",
          options: [
            { id: "a", text: "Page" },
            { id: "b", text: "BrowserContext" },
            { id: "c", text: "Browser" },
            { id: "d", text: "Locator" },
          ],
          correct: "b",
          explanation:
            "That is exactly why `context.storageState()` can capture and restore an authenticated session.",
        },
      ],
    },
    {
      id: "auth-setup-project",
      slug: "setup-project-and-storage-state",
      title: "Building the setup project",
      moduleId: "authentication",
      summary:
        "auth.setup.ts, storageState, project dependencies — the complete working pattern.",
      difficulty: "intermediate",
      estimatedTime: 18,
      objectives: [
        "Write an auth.setup.ts that saves storageState",
        "Wire it up with project dependencies",
        "Keep the auth file out of version control",
      ],
      sections: [
        {
          kind: "code",
          title: "tests/auth.setup.ts",
          language: "ts",
          code: `
import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/practice/shop/login');

  await page.getByLabel('Email').fill('testuser@example.com');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for the session to actually exist before saving it.
  await expect(page.getByText('Welcome back, Test User')).toBeVisible();

  await page.context().storageState({ path: authFile });
});
`,
          highlightLines: [16],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Assert before you save",
          body: [
            "Calling `storageState()` immediately after the click can capture the state before the session cookie is set. You then get a file that looks valid and authenticates nothing. Always assert on a signed-in indicator first.",
          ],
        },
        {
          kind: "code",
          title: "playwright.config.ts",
          language: "ts",
          code: `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Tests that must run signed out.
    {
      name: 'unauthenticated',
      testMatch: /.*\\.public\\.spec\\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`,
        },
        {
          kind: "code",
          title: "What the saved file contains",
          language: "json",
          code: `
{
  "cookies": [
    {
      "name": "shopeasy_session",
      "value": "s%3A8f2a...",
      "domain": "localhost",
      "path": "/",
      "expires": 1767225600,
      "httpOnly": true,
      "secure": false,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "http://localhost:3000",
      "localStorage": [{ "name": "shopeasy:user", "value": "{\\"id\\":\\"u-1001\\"}" }]
    }
  ]
}
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Never commit this file",
          body: [
            "It is a live credential. `playwright/.auth/` must be in `.gitignore` — a leaked session file is a leaked account.",
          ],
        },
        {
          kind: "code",
          title: "Now the tests are trivial",
          language: "ts",
          code: `
test('shows order history', async ({ page }) => {
  await page.goto('/practice/shop/orders');   // already signed in
  await expect(page.getByRole('heading', { name: 'Your Orders' })).toBeVisible();
});
`,
        },
        {
          kind: "text",
          title: "Opting out per test",
          body: [
            "A single test can drop the shared session without needing its own project.",
          ],
        },
        {
          kind: "code",
          title: "Running one test signed out",
          language: "ts",
          code: `
test.use({ storageState: { cookies: [], origins: [] } });

test('redirects anonymous visitors to login', async ({ page }) => {
  await page.goto('/practice/shop/orders');
  await expect(page).toHaveURL(/\\/login/);
});
`,
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting dependencies: ['setup']",
          body: "Tests start before the auth file exists and fail on the first navigation.",
        },
        {
          title: "Committing playwright/.auth/user.json",
          body: "A real credential in git history. Add the folder to .gitignore before the first commit.",
        },
        {
          title: "Saving state before the session exists",
          body: "Assert on a logged-in element first, then call storageState().",
        },
      ],
      keyTakeaways: [
        "auth.setup.ts logs in once and writes storageState to a file.",
        "`dependencies` guarantees ordering; `storageState` in `use` applies it.",
        "The auth file is a credential — gitignore it.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "The saved state never authenticates anything. Why?",
          code: `await page.getByRole('button', { name: 'Sign In' }).click();
await page.context().storageState({ path: authFile });`,
          options: [
            { id: "a", text: "storageState needs a URL argument" },
            { id: "b", text: "State is saved before the login response sets the cookie" },
            { id: "c", text: "storageState only works in Chromium" },
            { id: "d", text: "The path must be absolute" },
          ],
          correct: "b",
          explanation:
            "Add an assertion on a signed-in indicator between the click and the save.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "How do you run one test signed out in a suite that uses storageState globally?",
          options: [
            { id: "a", text: "test.use({ storageState: { cookies: [], origins: [] } })" },
            { id: "b", text: "await context.clearCookies() in the test" },
            { id: "c", text: "test.skip() the auth setup" },
            { id: "d", text: "Delete the auth file first" },
          ],
          correct: "a",
          explanation:
            "`test.use` overrides fixture options for that file or describe block.",
        },
      ],
      challenges: ["ch-storage-state"],
      playground: ["login"],
    },
    {
      id: "auth-multi-role",
      slug: "multiple-roles-and-api-login",
      title: "Multiple roles and API-based login",
      moduleId: "authentication",
      summary:
        "Admin, customer and guest sessions side by side — and skipping the login UI entirely.",
      difficulty: "advanced",
      estimatedTime: 15,
      objectives: [
        "Create one storageState file per role",
        "Expose roles as fixtures",
        "Authenticate through the API instead of the UI",
      ],
      sections: [
        {
          kind: "code",
          title: "One setup test per role",
          language: "ts",
          code: `
const roles = [
  { name: 'customer', email: 'testuser@example.com', file: 'customer.json' },
  { name: 'admin',    email: 'admin@example.com',    file: 'admin.json' },
];

for (const role of roles) {
  setup(\`authenticate as \${role.name}\`, async ({ page }) => {
    await page.goto('/practice/shop/login');
    await page.getByLabel('Email').fill(role.email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByTestId('account-name')).toBeVisible();

    await page.context().storageState({ path: \`playwright/.auth/\${role.file}\` });
  });
}
`,
        },
        {
          kind: "code",
          title: "Roles as fixtures",
          language: "ts",
          code: `
// fixtures/roles.ts
import { test as base, type Page } from '@playwright/test';

type RoleFixtures = { adminPage: Page; customerPage: Page };

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    await use(await context.newPage());
    await context.close();
  },

  customerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/customer.json',
    });
    await use(await context.newPage());
    await context.close();
  },
});
`,
        },
        {
          kind: "code",
          title: "Two roles in one test",
          language: "ts",
          code: `
test('admin can see an order the customer just placed', async ({
  customerPage,
  adminPage,
}) => {
  await customerPage.goto('/practice/shop/checkout');
  await customerPage.getByRole('button', { name: 'Place Order' }).click();

  const orderNumber = await customerPage
    .getByTestId('order-number')
    .textContent();

  await adminPage.goto('/practice/shop/orders');
  await expect(
    adminPage.getByRole('row').filter({ hasText: orderNumber!.trim() }),
  ).toBeVisible();
});
`,
        },
        {
          kind: "text",
          title: "Skipping the UI entirely",
          body: [
            "If the app issues a session through an API endpoint, the setup can call it directly. This is faster and removes a dependency on the login page's markup — but it also means the login UI is no longer exercised at all, so keep a real UI login test alongside it.",
          ],
        },
        {
          kind: "code",
          title: "API login",
          language: "ts",
          code: `
setup('authenticate via API', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: 'testuser@example.com', password: 'Password123!' },
  });
  expect(response.ok()).toBeTruthy();

  // The request context collected the Set-Cookie response — save it.
  await request.storageState({ path: 'playwright/.auth/user.json' });
});
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Token expiry",
          body: [
            "A storageState file captured at the start of a long CI run can expire before the run finishes. If your tokens are short-lived, re-run the setup per shard or shorten the run.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Sharing one account across parallel workers",
          body: "Concurrent sessions can invalidate each other and tests interfere through shared data. Use one account per role, and ideally per worker.",
        },
        {
          title: "Only ever authenticating via API",
          body: "The login form then has zero coverage. Keep one UI login test.",
        },
      ],
      keyTakeaways: [
        "One storageState file per role, created in the setup project.",
        "Fixtures turn roles into clean, declarative test arguments.",
        "API login is fast — pair it with one real UI login test.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is the main risk of authenticating only through the API?",
          options: [
            { id: "a", text: "It is slower" },
            { id: "b", text: "The login UI ends up with no test coverage" },
            { id: "c", text: "storageState cannot be saved from a request context" },
            { id: "d", text: "It does not work in CI" },
          ],
          correct: "b",
          explanation:
            "Speed is the benefit; lost coverage is the cost. Keep one dedicated UI login test.",
        },
      ],
    },
    {
      id: "auth-session-debugging",
      slug: "debugging-authentication",
      title: "Debugging authentication failures",
      moduleId: "authentication",
      summary:
        "When every test suddenly redirects to /login, this is the checklist.",
      difficulty: "intermediate",
      estimatedTime: 10,
      objectives: [
        "Inspect cookies and storage at runtime",
        "Work through the common causes in order",
        "Recover cleanly from a stale auth file",
      ],
      sections: [
        {
          kind: "code",
          title: "Inspecting the session",
          language: "ts",
          code: `
const cookies = await page.context().cookies();
console.log(cookies.map((c) => \`\${c.name}=\${c.value.slice(0, 12)}…\`));

const stored = await page.evaluate(() =>
  JSON.stringify(window.localStorage),
);
console.log(stored);
`,
        },
        {
          kind: "table",
          title: "Symptom → cause",
          headers: ["Symptom", "Likely cause"],
          rows: [
            ["Every test redirects to /login", "Auth file missing, stale, or `dependencies` not set"],
            ["Works locally, fails in CI", "The .auth folder is gitignored and CI never ran setup"],
            ["Works for the first few tests only", "Token expired mid-run, or the account was locked"],
            ["Session lost after a redirect", "Cookie domain mismatch between the setup URL and baseURL"],
            ["Passes alone, fails in parallel", "Workers sharing one account and invalidating each other"],
          ],
        },
        {
          kind: "code",
          title: "Forcing a fresh session",
          language: "bash",
          code: `
rm -rf playwright/.auth
npx playwright test --project=setup
npx playwright test
`,
        },
        {
          kind: "callout",
          tone: "bug",
          title: "The trace viewer shows the redirect",
          body: [
            "Open the trace, find the first navigation, and check the Network tab. A 302 to `/login` on the very first request means the state was never applied — look at the setup project, not the test.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Committing the auth file so CI 'works'",
          body: "It fixes the symptom by leaking a credential. Let CI run the setup project instead.",
        },
      ],
      keyTakeaways: [
        "Redirects to /login on the first navigation point at the setup project.",
        "Delete the .auth folder and re-run setup to rule out staleness.",
        "Cookie domain must match the baseURL the tests use.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt:
            "CI fails with 'ENOENT: playwright/.auth/user.json'. What is wrong?",
          options: [
            { id: "a", text: "The file should be committed to git" },
            { id: "b", text: "The setup project did not run — check dependencies and testMatch" },
            { id: "c", text: "Playwright cannot write files in CI" },
            { id: "d", text: "The path must be absolute" },
          ],
          correct: "b",
          explanation:
            "The file is generated, never committed. If it is missing, the setup project did not execute first.",
        },
      ],
    },
  ],
};

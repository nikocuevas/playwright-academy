export type GlossaryTerm = {
  term: string;
  category: "Playwright" | "QA" | "Web" | "Data";
  definition: string;
  seeAlso?: string[];
  href?: string;
};

export const glossary: GlossaryTerm[] = [
  {
    term: "Locator",
    category: "Playwright",
    definition:
      "A lazy description of how to find an element. It is re-resolved every time it is used, which is why Playwright has no stale element errors.",
    seeAlso: ["Strict mode", "Auto-waiting"],
    href: "/learn/locators/what-a-locator-is",
  },
  {
    term: "Strict mode",
    category: "Playwright",
    definition:
      "Actions throw when a locator matches more than one element, rather than silently using the first. The error is telling you the locator is ambiguous.",
    seeAlso: ["Locator"],
    href: "/learn/locators/what-a-locator-is",
  },
  {
    term: "Auto-waiting",
    category: "Playwright",
    definition:
      "Before each action Playwright waits for the element to be attached, visible, stable, able to receive events and enabled. Web-first assertions poll on the same principle.",
    seeAlso: ["Actionability", "Web-first assertion"],
    href: "/learn/waiting/auto-waiting",
  },
  {
    term: "Actionability",
    category: "Playwright",
    definition:
      "The set of checks an element must pass before an action is dispatched. A timeout error's call log names the check that never passed.",
    href: "/learn/actions/click-fill-and-type",
  },
  {
    term: "Web-first assertion",
    category: "Playwright",
    definition:
      "An assertion that takes a locator or page and retries until it passes or times out — for example `await expect(locator).toBeVisible()`.",
    seeAlso: ["Auto-waiting"],
    href: "/learn/assertions/web-first-assertions",
  },
  {
    term: "BrowserContext",
    category: "Playwright",
    definition:
      "An isolated browser session owning its own cookies, localStorage and permissions. Playwright gives each test a fresh one, which is what makes parallel runs safe.",
    seeAlso: ["storageState", "Test isolation"],
    href: "/learn/playwright-fundamentals/browser-context-page",
  },
  {
    term: "Page",
    category: "Playwright",
    definition: "A single tab inside a context. The `page` fixture is a fresh page per test.",
    href: "/learn/playwright-fundamentals/browser-context-page",
  },
  {
    term: "storageState",
    category: "Playwright",
    definition:
      "A JSON snapshot of a context's cookies and localStorage. Saved once by a setup project and reused so tests start already authenticated. Treat the file as a credential.",
    seeAlso: ["Setup project", "BrowserContext"],
    href: "/learn/authentication/setup-project-and-storage-state",
  },
  {
    term: "Setup project",
    category: "Playwright",
    definition:
      "A project matched to `*.setup.ts` files that other projects declare as a dependency, guaranteeing it runs first. The standard place to create storageState.",
    href: "/learn/authentication/setup-project-and-storage-state",
  },
  {
    term: "Fixture",
    category: "Playwright",
    definition:
      "A named, reusable piece of setup and teardown delivered as a test argument. Everything before `await use(value)` is setup; everything after is teardown.",
    href: "/learn/fixtures/writing-custom-fixtures",
  },
  {
    term: "Project",
    category: "Playwright",
    definition:
      "A named run configuration over the same test files — a browser, a device, or a setup step. Projects can depend on each other.",
    href: "/learn/playwright-fundamentals/projects-and-multi-browser",
  },
  {
    term: "Worker",
    category: "Playwright",
    definition:
      "A separate process running tests in parallel. Worker-scoped fixtures are shared by every test in that process, so they must be read-only.",
    href: "/learn/fixtures/fixture-scope-and-options",
  },
  {
    term: "Trace",
    category: "Playwright",
    definition:
      "A recorded timeline of a run containing DOM snapshots, network activity, console output and the call log for every action. Opened with `npx playwright show-trace`.",
    href: "/learn/debugging/the-trace-viewer",
  },
  {
    term: "Route",
    category: "Playwright",
    definition:
      "An intercepted network request. Your handler must resolve it exactly once with fulfill, continue or abort.",
    href: "/learn/network-interception/intercepting-with-page-route",
  },
  {
    term: "APIRequestContext",
    category: "Playwright",
    definition:
      "Playwright's HTTP client, exposed as the `request` fixture. Inside a test it shares the browser context's cookies.",
    href: "/learn/api-testing/api-requests-with-playwright",
  },
  {
    term: "Dynamic locator",
    category: "Playwright",
    definition:
      "A locator built on a value that changes between renders or deploys — a generated id, a hashed class, a session token. It passes once and then fails.",
    href: "/learn/locators/dynamic-locators",
  },
  {
    term: "Page Object Model",
    category: "QA",
    definition:
      "A pattern where each page is represented by a class holding its locators and workflows, so specs describe user journeys rather than DOM structure.",
    href: "/learn/page-object-model/building-a-page-object",
  },
  {
    term: "Test isolation",
    category: "QA",
    definition:
      "Each test starts from a clean state and does not depend on any other test. Shared accounts and shared data are the usual way it is lost.",
    href: "/learn/e2e-automation/test-data-strategy",
  },
  {
    term: "Flaky test",
    category: "QA",
    definition:
      "A test that passes and fails without any code change. Usually caused by a missing wait condition, shared state, or a genuine race in the product.",
    href: "/learn/waiting/diagnosing-flaky-tests",
  },
  {
    term: "Smoke test",
    category: "QA",
    definition:
      "A small, fast suite covering the critical journeys, run on every change to answer 'is this deployable at all?'.",
  },
  {
    term: "Contract test",
    category: "QA",
    definition:
      "A test that asserts the shape of an API response rather than its values, so it fails when the contract changes rather than when the data does.",
    href: "/learn/api-testing/contract-and-schema-checks",
  },
  {
    term: "Hybrid API + UI test",
    category: "QA",
    definition:
      "Preconditions created through the API, the behaviour exercised through the UI, and the result verified at both layers.",
    href: "/learn/api-testing/api-plus-ui-hybrid-testing",
  },
  {
    term: "Accessible name",
    category: "Web",
    definition:
      "The label assistive technology announces for an element, computed from aria-labelledby, aria-label, an associated label, text content, or alt text.",
    href: "/learn/locators/get-by-role",
  },
  {
    term: "ARIA role",
    category: "Web",
    definition:
      "The semantic type of an element — button, link, textbox, heading. Most HTML elements have an implicit role.",
    href: "/learn/locators/get-by-role",
  },
  {
    term: "Shadow DOM",
    category: "Web",
    definition:
      "An encapsulated DOM subtree used by web components. Playwright's locators pierce open shadow roots; XPath does not.",
  },
  {
    term: "HAR",
    category: "Web",
    definition:
      "HTTP Archive — a JSON recording of network traffic that Playwright can replay. It captures headers and bodies, so scrub it before committing.",
    href: "/learn/network-interception/har-recording-and-replay",
  },
  {
    term: "NULL",
    category: "Data",
    definition:
      "SQL's 'unknown'. It is never equal to anything, including itself, so `= NULL` always returns no rows. Use IS NULL.",
    href: "/learn/sql-for-testers/select-where-order-by",
  },
  {
    term: "LEFT JOIN",
    category: "Data",
    definition:
      "Keeps every row from the left table, filling the right side with NULL when there is no match. Combined with `IS NULL` it finds missing relationships.",
    href: "/learn/sql-for-testers/joins",
  },
  {
    term: "Referential integrity",
    category: "Data",
    definition:
      "The guarantee that every foreign key points at a row that exists. Orphaned records are a violation, and a classic thing for testers to check.",
    href: "/learn/sql-for-testers/qa-validation-scenarios",
  },
  {
    term: "Aggregate",
    category: "Data",
    definition:
      "A function that folds many rows into one value — COUNT, SUM, AVG, MIN, MAX. Filter aggregates with HAVING, not WHERE.",
    href: "/learn/sql-for-testers/group-by-and-aggregates",
  },
];

export const glossaryCategories = ["Playwright", "QA", "Web", "Data"] as const;

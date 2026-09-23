export type GlossaryTerm = {
  term: string;
  category: "Playwright" | "QA" | "Web" | "Data" | "iGaming";
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
  {
    term: "iGaming",
    category: "iGaming",
    definition:
      "Interactive gambling delivered online — sportsbook betting, casino games, and everything around them (wallets, KYC, responsible gambling). Educational usage here: entirely synthetic players, currency and outcomes.",
    seeAlso: ["Sportsbook", "Casino"],
    href: "/learn/igaming-qa/introduction-to-igaming-qa",
  },
  {
    term: "Sportsbook",
    category: "iGaming",
    definition:
      "The part of a gambling platform offering bets on real-world sporting and event outcomes, as opposed to the casino (slots and table games).",
    seeAlso: ["Casino", "Bet"],
    href: "/learn/igaming-qa/understanding-an-online-gambling-platform",
  },
  {
    term: "Casino",
    category: "iGaming",
    definition:
      "The part of a gambling platform offering slots, table and live-dealer games, each played in rounds rather than settled against a real-world event.",
    seeAlso: ["RTP", "Sportsbook"],
    href: "/learn/igaming-qa/casino-and-game-testing",
  },
  {
    term: "Bet",
    category: "iGaming",
    definition:
      "A player's wager on an outcome. Moves through a state machine — typically CREATED/ACCEPTED, then SETTLED, VOIDED or REJECTED — and QA's job is to prove the invalid transitions are actually blocked, not just the valid ones.",
    seeAlso: ["Stake", "Odds", "Settlement", "Void"],
    href: "/learn/igaming-qa/betting-and-bet-placement",
  },
  {
    term: "Stake",
    category: "iGaming",
    definition:
      "The amount a player risks on a bet. Must never exceed the wallet's available balance, and the debit should be atomic with bet creation.",
    seeAlso: ["Bet", "Wallet"],
    href: "/learn/igaming-qa/betting-and-bet-placement",
  },
  {
    term: "Odds",
    category: "iGaming",
    definition:
      "The multiplier applied to a stake to compute a winning payout. Decimal odds of 2.5 on a $10 stake return $25 if the bet wins.",
    seeAlso: ["Bet", "Settlement"],
    href: "/learn/igaming-qa/betting-and-bet-placement",
  },
  {
    term: "Settlement",
    category: "iGaming",
    definition:
      "The process of resolving a bet's outcome and crediting any payout. A settlement should be idempotent — attempting to re-settle an already-settled bet must be rejected, not re-applied.",
    seeAlso: ["Bet", "Idempotency", "Ledger"],
    href: "/learn/igaming-qa/bet-settlement-and-payouts",
  },
  {
    term: "Void",
    category: "iGaming",
    definition:
      "A bet cancelled after acceptance (a market error, a postponed event), refunding the stake rather than settling to a win or loss.",
    seeAlso: ["Bet", "Settlement"],
    href: "/learn/igaming-qa/betting-and-bet-placement",
  },
  {
    term: "Wallet",
    category: "iGaming",
    definition:
      "A player's balances — cash, bonus and pending — held separately even though the UI often shows one combined number. Cash and bonus balance are different currencies with the same symbol.",
    seeAlso: ["Ledger", "Bonus balance"],
    href: "/learn/igaming-qa/wallets-and-financial-transactions",
  },
  {
    term: "Ledger",
    category: "iGaming",
    definition:
      "The append-only transaction history behind a wallet balance. The stored balance should always equal the sum of the ledger; when it doesn't, that's a reconciliation bug, not a UI bug.",
    seeAlso: ["Wallet", "Reconciliation"],
    href: "/learn/igaming-qa/database-and-ledger-validation",
  },
  {
    term: "Bonus balance",
    category: "iGaming",
    definition:
      "Promotional funds held separately from cash, usually restricted from withdrawal until a wagering requirement is met.",
    seeAlso: ["Wagering requirement", "Wallet"],
    href: "/learn/igaming-qa/bonuses-and-promotions",
  },
  {
    term: "Wagering requirement",
    category: "iGaming",
    definition:
      "The total amount a player must stake before a bonus (or its winnings) becomes withdrawable — for example, a $20 bonus with a 10x requirement needs $200 wagered.",
    seeAlso: ["Bonus balance"],
    href: "/learn/igaming-qa/bonuses-and-promotions",
  },
  {
    term: "KYC",
    category: "iGaming",
    definition:
      "Know Your Customer — identity and age verification a player must pass before gambling with real money. QA validates every outcome state (verified, failed, pending, manual review), not just the happy path.",
    seeAlso: ["AML", "Geolocation"],
    href: "/learn/igaming-qa/age-verification-and-kyc",
  },
  {
    term: "AML",
    category: "iGaming",
    definition:
      "Anti-Money Laundering — controls that flag unusual financial patterns for review. QA's role is validating that the controls fire and degrade safely, not attempting to bypass them.",
    seeAlso: ["KYC", "Risk engine"],
    href: "/learn/igaming-qa/risk-and-fraud-testing",
  },
  {
    term: "Self-exclusion",
    category: "iGaming",
    definition:
      "A player-initiated block on their own account, which the platform must honor immediately and everywhere — login, betting, deposits, casino — including for a session already open when it takes effect.",
    seeAlso: ["Responsible gambling", "Cooling-off"],
    href: "/learn/igaming-qa/self-exclusion-and-player-protection",
  },
  {
    term: "Cooling-off",
    category: "iGaming",
    definition:
      "A short, player-set break from the platform, distinct from self-exclusion in duration and (usually) reversibility.",
    seeAlso: ["Self-exclusion", "Responsible gambling"],
    href: "/learn/igaming-qa/responsible-gambling",
  },
  {
    term: "Responsible gambling",
    category: "iGaming",
    definition:
      "The set of player-protection controls — deposit limits, loss limits, cooling-off, self-exclusion — a platform must enforce, not merely offer as a setting.",
    seeAlso: ["Self-exclusion", "Cooling-off"],
    href: "/learn/igaming-qa/responsible-gambling",
  },
  {
    term: "Geolocation",
    category: "iGaming",
    definition:
      "Verification of a player's physical location, used to allow or block gambling by territory. A business-critical control, not a UX nicety — it must re-check periodically, not just once at login.",
    seeAlso: ["KYC"],
    href: "/learn/igaming-qa/geolocation-and-restricted-territories",
  },
  {
    term: "Risk engine",
    category: "iGaming",
    definition:
      "The system that scores accounts and transactions for fraud or abuse risk. QA's concern is behavioral: does it fire, does it degrade safely on timeout, and is fail-open ever the wrong default.",
    seeAlso: ["AML"],
    href: "/learn/igaming-qa/risk-and-fraud-testing",
  },
  {
    term: "Payment callback",
    category: "iGaming",
    definition:
      "A webhook from a payment provider confirming a deposit or withdrawal outcome. Providers retry callbacks, so the handler must be idempotent or the same payment gets applied twice.",
    seeAlso: ["Idempotency", "Reconciliation"],
    href: "/learn/igaming-qa/deposits-and-withdrawals",
  },
  {
    term: "Idempotency",
    category: "iGaming",
    definition:
      "The property that repeating the same request (with the same idempotency key) produces the same result once, not once per attempt. The direct fix for duplicate bets, duplicate deposits and duplicate settlements.",
    seeAlso: ["Payment callback", "Settlement"],
    href: "/learn/igaming-qa/idempotency-and-duplicate-transactions",
  },
  {
    term: "Reconciliation",
    category: "iGaming",
    definition:
      "Proving a stored balance equals the sum of its transaction history. A wallet that doesn't reconcile is a defect regardless of what the UI shows.",
    seeAlso: ["Ledger"],
    href: "/learn/igaming-qa/database-and-ledger-validation",
  },
  {
    term: "RTP",
    category: "iGaming",
    definition:
      "Return to Player — a casino game's theoretical long-run payout percentage. QA validates that game round outcomes are recorded and settled correctly; RTP fairness itself is outside QA's scope.",
    href: "/learn/igaming-qa/casino-and-game-testing",
  },
];

export const glossaryCategories = ["Playwright", "QA", "Web", "Data", "iGaming"] as const;

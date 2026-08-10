import type { Module } from "../types";

export const capstoneModule: Module = {
  id: "capstone",
  order: 16,
  title: "Capstone: ShopEasy Automation Framework",
  tagline: "Build the whole thing yourself",
  summary:
    "Everything in this platform, assembled into one framework you write from scratch: page objects, fixtures, auth setup, API validation, network mocks and CI.",
  difficulty: "expert",
  icon: "GraduationCap",
  track: "capstone",
  lessons: [
    {
      id: "cap-brief",
      slug: "the-brief",
      title: "The brief",
      moduleId: "capstone",
      summary:
        "What you are building, what 'done' means, and how to run it.",
      difficulty: "expert",
      estimatedTime: 15,
      objectives: [
        "Understand the scope of the capstone",
        "Set up the project structure",
        "Know the acceptance criteria",
      ],
      sections: [
        {
          kind: "text",
          title: "The assignment",
          body: [
            "Build a production-shaped Playwright framework covering the ShopEasy and Registration practice applications. Not a folder of recorded scripts — a maintainable suite another engineer could join tomorrow.",
            "Work against your local copy of this platform: `npm run dev`, then point the framework at `http://localhost:3000`.",
          ],
        },
        {
          kind: "code",
          title: "The structure to aim for",
          language: "text",
          code: `
playwright/
├── pages/
│   ├── LoginPage.ts
│   ├── RegistrationPage.ts
│   ├── ShopPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── OrdersPage.ts
│   └── MessagesPage.ts
├── fixtures/
│   └── test.ts
├── test-data/
│   ├── users.ts
│   └── products.ts
└── .auth/            (gitignored)

tests/
├── auth.setup.ts
├── registration/
├── authentication/
├── shopping/
├── checkout/
├── orders/
├── messages/
├── api/
└── network/

playwright.config.ts
`,
        },
        {
          kind: "list",
          title: "Acceptance criteria",
          ordered: true,
          items: [
            "`npx playwright test` passes from a clean checkout with no manual setup.",
            "No `waitForTimeout` outside a commented, justified exception.",
            "No locator built on a generated id, a hashed class or a session token.",
            "Authentication happens once, in a setup project, via storageState.",
            "Each spec is independent and passes when run alone or in parallel.",
            "The suite runs green in GitHub Actions with the report uploaded as an artifact.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Order of work",
          body: [
            "Config and one smoke test first. Then auth setup. Then page objects as the specs demand them — not before. Resist building the whole abstraction layer up front.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Designing the framework before writing a test",
          body: "You end up with abstractions nothing needs. Let the second and third test tell you what to extract.",
        },
      ],
      keyTakeaways: [
        "The deliverable is a maintainable suite, not a pile of scripts.",
        "Green from a clean checkout, with no manual steps, is the bar.",
        "Extract abstractions in response to duplication.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What should you build first?",
          options: [
            { id: "a", text: "All seven page objects" },
            { id: "b", text: "The config plus one passing smoke test" },
            { id: "c", text: "The CI workflow" },
            { id: "d", text: "The custom fixtures file" },
          ],
          correct: "b",
          explanation:
            "A working end-to-end loop first; abstractions afterwards, driven by real duplication.",
        },
      ],
    },
    {
      id: "cap-checklist",
      slug: "the-checklist",
      title: "The full checklist",
      moduleId: "capstone",
      summary:
        "Every deliverable, tracked on the Capstone page so you can see how far you have got.",
      difficulty: "expert",
      estimatedTime: 12,
      objectives: [
        "Enumerate every required capability",
        "Track progress through the build",
        "Self-review against the review guide",
      ],
      sections: [
        {
          kind: "practice",
          href: "/capstone",
          title: "Open the capstone tracker",
          body: "Each item below has a checkbox there, saved in your browser, with the acceptance criteria spelled out.",
        },
        {
          kind: "table",
          title: "Deliverables",
          headers: ["Area", "What it must prove"],
          rows: [
            ["Registration", "Happy path plus validation, with no unstable locators"],
            ["Authentication", "auth.setup.ts writing storageState, consumed via project dependencies"],
            ["Shopping", "Search, filter, product selection, add to cart, cart contents"],
            ["Checkout", "Shipping, simulated payment, confirmation with a captured order number"],
            ["Orders", "The captured order found and verified in the history"],
            ["Messaging", "A message sent about that order, with the success state verified"],
            ["API", "Product and order endpoints validated directly, including error cases"],
            ["Network", "At least one mocked response covering an empty or error state"],
            ["Architecture", "Page objects, fixtures, test data files, a CI-aware config"],
            ["CI", "A GitHub Actions workflow that runs lint, typecheck, build and tests"],
          ],
        },
        {
          kind: "list",
          title: "Self-review questions",
          items: [
            "Could a new engineer add a test without reading every existing file?",
            "If a button label changes, how many files do you edit?",
            "Does any test depend on another test having run first?",
            "Does every failure message tell you what broke without opening a trace?",
            "Would this suite still pass if the product ids were regenerated? (They will be.)",
          ],
        },
        {
          kind: "callout",
          tone: "success",
          title: "The real deliverable",
          body: [
            "This capstone is a portfolio artifact. A suite that runs green in CI, is readable, and demonstrates the API and data layers as well as the UI, says more in an interview than any certificate.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Skipping the API and network sections",
          body: "They are the parts that distinguish an automation engineer from someone who records scripts.",
        },
      ],
      keyTakeaways: [
        "Ten areas, each with a concrete acceptance criterion.",
        "Self-review against maintainability, not just green ticks.",
        "The finished suite is a genuinely useful portfolio piece.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which capability most distinguishes a senior automation engineer's suite?",
          options: [
            { id: "a", text: "More UI tests" },
            { id: "b", text: "Cross-layer validation: UI, API and data together" },
            { id: "c", text: "Longer test names" },
            { id: "d", text: "More page objects" },
          ],
          correct: "b",
          explanation:
            "Knowing which layer should own which assertion is the judgement that scales a suite.",
        },
      ],
    },
  ],
};

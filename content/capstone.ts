export type CapstoneTask = {
  id: string;
  area: string;
  title: string;
  description: string;
  acceptance: string[];
};

export const capstoneTasks: CapstoneTask[] = [
  {
    id: "cap-setup",
    area: "Foundation",
    title: "Project setup and configuration",
    description:
      "Create a Playwright project pointed at your local copy of the academy, with a CI-aware configuration.",
    acceptance: [
      "playwright.config.ts defines baseURL from process.env.BASE_URL with a localhost fallback",
      "trace: 'on-first-retry', screenshot and video on failure",
      "retries and workers differ between local and CI",
      "A webServer entry starts the app automatically when BASE_URL is not set",
    ],
  },
  {
    id: "cap-registration",
    area: "Registration",
    title: "Registration coverage",
    description:
      "Automate the Registration practice app, happy path and validation rules.",
    acceptance: [
      "A test completes registration and asserts the personalised welcome message",
      "One test per validation rule: password mismatch, invalid email, missing terms, under-18 date",
      "No locator uses the generated id or data-session attribute",
      "Negative tests also assert that registration did not succeed",
    ],
  },
  {
    id: "cap-auth",
    area: "Authentication",
    title: "Authentication setup project",
    description:
      "Sign in once and reuse the session across the authenticated suite.",
    acceptance: [
      "tests/auth.setup.ts signs in and writes playwright/.auth/user.json",
      "It asserts on a signed-in indicator BEFORE saving the state",
      "The authenticated project declares dependencies: ['setup']",
      "playwright/.auth/ is gitignored",
      "One test runs signed out and asserts the redirect to /login",
    ],
  },
  {
    id: "cap-shopping",
    area: "Shopping",
    title: "Product browsing and cart",
    description: "Search, filter, select a product and manage the cart.",
    acceptance: [
      "Search narrows the product grid and the result is asserted",
      "A specific product is added using filter() and chaining, not nth()",
      "The cart badge and the cart line items are both verified",
      "Quantity change and removal are covered",
    ],
  },
  {
    id: "cap-checkout",
    area: "Checkout",
    title: "Checkout and confirmation",
    description: "Complete the purchase flow with shipping and simulated payment.",
    acceptance: [
      "All shipping and payment fields are filled through their labels",
      "The confirmation heading is asserted",
      "The generated order number is captured at runtime and matched against /^ORD-\\d{6}$/",
      "test.step groups the stages of the journey",
    ],
  },
  {
    id: "cap-orders",
    area: "Orders",
    title: "Order history verification",
    description: "Find the order you just created in the history.",
    acceptance: [
      "The captured order number is used to filter the history rows",
      "The order status is asserted",
      "The test does not depend on any order created by another test",
    ],
  },
  {
    id: "cap-messages",
    area: "Messaging",
    title: "Support messaging",
    description: "Send a message about the order and verify the confirmation.",
    acceptance: [
      "The message references the captured order number",
      "The success confirmation is asserted with a web-first assertion",
      "A negative test covers submitting with an empty subject",
    ],
  },
  {
    id: "cap-api",
    area: "API",
    title: "API validation",
    description: "Validate the products and orders endpoints directly.",
    acceptance: [
      "GET /api/products is validated for shape, not just status",
      "Category filtering is verified",
      "An unknown product returns 404 with an error body",
      "At least one test seeds data through the API and verifies it in the UI",
    ],
  },
  {
    id: "cap-network",
    area: "Network",
    title: "Network interception",
    description: "Cover the states real data cannot produce.",
    acceptance: [
      "An empty-state test mocks /api/products with an empty list",
      "An error-state test mocks a 500 response",
      "Routes are registered before navigation",
      "One test asserts on an outgoing request payload",
    ],
  },
  {
    id: "cap-architecture",
    area: "Architecture",
    title: "Page objects, fixtures and test data",
    description: "Structure the suite so a new engineer could contribute on day one.",
    acceptance: [
      "One page object per page, locators as readonly constructor fields",
      "Assertions live in the specs, not inside page objects",
      "A fixtures file exposes page objects as test arguments",
      "Test data lives in test-data/ and unique values are generated per run",
    ],
  },
  {
    id: "cap-ci",
    area: "CI",
    title: "Continuous integration",
    description: "Run the whole thing automatically on every push.",
    acceptance: [
      "A GitHub Actions workflow runs typecheck, lint, build and the Playwright suite",
      "npx playwright install --with-deps is used",
      "The HTML report is uploaded with if: always()",
      "forbidOnly is enabled in CI",
    ],
  },
  {
    id: "cap-quality",
    area: "Quality",
    title: "Self-review",
    description: "Hold the finished suite to the standard you would apply in review.",
    acceptance: [
      "No waitForTimeout outside a commented, justified exception",
      "No page.pause() or test.only committed",
      "Every test passes when run alone and when run in parallel",
      "The suite is green from a clean checkout with no manual setup",
    ],
  },
];

export const capstoneAreas = Array.from(
  new Set(capstoneTasks.map((t) => t.area)),
);

import type { ExecutionResult } from "./runner";

export type ScenarioMode = "simulated" | "reference";

export type Scenario = {
  id: string;
  group: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  summary: string;
  /** Bullet list of what the learner has to achieve. */
  task: string[];
  initialUrl: string;
  starterCode: string;
  solution: string;
  hints: string[];
  mode: ScenarioMode;
  /** Progress id recorded when the challenge is solved. */
  challengeId?: string;
  /** Extra verification beyond "the test passed". */
  check?: (result: ExecutionResult) => { passed: boolean; message: string };
};

const header = `import { test, expect } from '@playwright/test';\n\n`;

function wrap(title: string, body: string) {
  return `${header}test('${title}', async ({ page }) => {\n${body}\n});\n`;
}

export const scenarios: Scenario[] = [
  {
    id: "navigate",
    group: "Navigate",
    title: "Navigate to a page",
    difficulty: "beginner",
    summary: "The first line of nearly every Playwright test.",
    task: [
      "Navigate to /practice/registration",
      "Assert the page URL is correct",
    ],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-navigate",
    starterCode: wrap(
      "navigates to registration",
      [
        "  // TODO:",
        "  // 1. Navigate to /practice/registration",
        "  // 2. Assert the URL with expect(page).toHaveURL()",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "navigates to registration",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  await expect(page).toHaveURL('/practice/registration');",
      ].join("\n"),
    ),
    hints: [
      "You need to navigate to the registration page.",
      "Use page.goto() — remember to await it.",
      "The URL is '/practice/registration', and expect(page).toHaveURL() verifies it.",
    ],
    check: (result) => {
      const navigated = result.steps.some((s) => s.label.includes("page.goto"));
      return {
        passed: navigated && result.finalState.url === "/practice/registration",
        message: navigated
          ? "Navigated successfully."
          : "The test passed but never called page.goto().",
      };
    },
  },
  {
    id: "locators",
    group: "Locators",
    title: "Find the Email field",
    difficulty: "beginner",
    summary:
      "The Registration app regenerates its ids on every render. Find the field anyway.",
    task: [
      "Locate the Email field without using its generated id",
      "Assert that it is visible and empty",
    ],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-locate-email",
    starterCode: wrap(
      "locates the email field",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  // TODO: locate the Email field and assert it is visible",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "locates the email field",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  const email = page.getByLabel('Email');",
        "",
        "  await expect(email).toBeVisible();",
        "  await expect(email).toBeEmpty();",
      ].join("\n"),
    ),
    hints: [
      "The id changes on every render, so it cannot be part of the locator.",
      "The field has a visible <label>. Which getBy* locator matches labels?",
      "page.getByLabel('Email') — then assert with expect(...).toBeVisible().",
    ],
  },
  {
    id: "actions",
    group: "Actions",
    title: "Fill the name and email fields",
    difficulty: "beginner",
    summary: "Three fills, and an assertion that the values landed.",
    task: [
      "Fill First Name, Last Name and Email",
      "Assert the Email field holds the value you typed",
    ],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-fill-fields",
    starterCode: wrap(
      "fills the top of the form",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  // TODO: fill First Name, Last Name and Email",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "fills the top of the form",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  await page.getByLabel('First Name').fill('Ada');",
        "  await page.getByLabel('Last Name').fill('Lovelace');",
        "  await page.getByLabel('Email').fill('ada@example.com');",
        "",
        "  await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');",
      ].join("\n"),
    ),
    hints: [
      "Each field has a label you can locate by.",
      "fill() sets the value in one step — no need to clear first.",
      "await page.getByLabel('First Name').fill('Ada');",
    ],
    check: (result) => {
      const { fields } = result.finalState;
      const filled = Boolean(
        fields.firstName?.trim() && fields.lastName?.trim() && fields.email?.trim(),
      );
      return {
        passed: filled,
        message: filled
          ? "All three fields were filled."
          : "First Name, Last Name and Email must all be filled.",
      };
    },
  },
  {
    id: "select",
    group: "Actions",
    title: "Select a country",
    difficulty: "beginner",
    summary: "Native <select> elements use selectOption, not click.",
    task: ["Select Canada in the Country dropdown", "Assert the selected value"],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-select-country",
    starterCode: wrap(
      "selects a country",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  // TODO: select Canada",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "selects a country",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  await page.getByLabel('Country').selectOption('CA');",
        "",
        "  await expect(page.getByLabel('Country')).toHaveValue('CA');",
      ].join("\n"),
    ),
    hints: [
      "The Country control is a native <select>.",
      "selectOption() accepts a value, a { label } object or an { index }.",
      "The value for Canada is 'CA'.",
    ],
    check: (result) => ({
      passed: result.finalState.fields.country === "CA",
      message:
        result.finalState.fields.country === "CA"
          ? "Canada is selected."
          : "The Country field is not set to CA.",
    }),
  },
  {
    id: "checkbox",
    group: "Actions",
    title: "Accept the terms",
    difficulty: "beginner",
    summary: "check() is idempotent; click() toggles.",
    task: ["Tick the Terms and Conditions checkbox", "Assert that it is checked"],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-accept-terms",
    starterCode: wrap(
      "accepts the terms",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  // TODO: accept the Terms and Conditions",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "accepts the terms",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  const terms = page.getByRole('checkbox', { name: 'Terms and Conditions' });",
        "",
        "  await terms.check();",
        "",
        "  await expect(terms).toBeChecked();",
      ].join("\n"),
    ),
    hints: [
      "The checkbox has an accessible name.",
      "getByRole('checkbox', { name: ... }) locates it.",
      "Use check() rather than click() so the step is idempotent.",
    ],
    check: (result) => ({
      passed: Boolean(result.finalState.checks.terms),
      message: result.finalState.checks.terms
        ? "Terms accepted."
        : "The terms checkbox is still unchecked.",
    }),
  },
  {
    id: "registration",
    group: "Registration",
    title: "Complete the registration",
    difficulty: "intermediate",
    summary: "Fill every required field, submit, and verify the success panel.",
    task: [
      "Fill all required fields",
      "Accept the terms and submit",
      "Assert the success heading and the personalised welcome message",
    ],
    initialUrl: "/practice/registration",
    mode: "simulated",
    challengeId: "ch-register-submit",
    starterCode: wrap(
      "registers a new account",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  // TODO:",
        "  // 1. Fill First Name, Last Name, Email",
        "  // 2. Fill Password and Confirm Password",
        "  // 3. Fill Date of Birth, Country, Address, City, Postal Code",
        "  // 4. Accept the terms",
        "  // 5. Click Register",
        "  // 6. Verify the success message",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "registers a new account",
      [
        "  await page.goto('/practice/registration');",
        "",
        "  await page.getByLabel('First Name').fill('Ada');",
        "  await page.getByLabel('Last Name').fill('Lovelace');",
        "  await page.getByLabel('Email').fill('ada@example.com');",
        "  await page.getByLabel('Password', { exact: true }).fill('Password123!');",
        "  await page.getByLabel('Confirm Password').fill('Password123!');",
        "  await page.getByLabel('Date of Birth').fill('1990-12-10');",
        "  await page.getByLabel('Country').selectOption('CA');",
        "  await page.getByLabel('Address').fill('12 Analytical Way');",
        "  await page.getByLabel('City').fill('Toronto');",
        "  await page.getByLabel('Postal Code').fill('M5V 2T6');",
        "",
        "  await page.getByRole('checkbox', { name: 'Terms and Conditions' }).check();",
        "",
        "  await page.getByRole('button', { name: 'Register' }).click();",
        "",
        "  await expect(",
        "    page.getByRole('heading', { name: 'Registration successful!' }),",
        "  ).toBeVisible();",
        "",
        "  await expect(page.getByTestId('registration-welcome')).toHaveText('Welcome, Ada.');",
      ].join("\n"),
    ),
    hints: [
      "Every required field must be filled before the form will submit.",
      "'Password' also matches 'Confirm Password' — pass { exact: true }.",
      "The date field takes an ISO string such as '1990-12-10'.",
    ],
    check: (result) => ({
      passed: result.finalState.registrationSubmitted,
      message: result.finalState.registrationSubmitted
        ? "Registration completed."
        : "The form was not submitted successfully — check the validation errors in the preview.",
    }),
  },
  {
    id: "login",
    group: "Login",
    title: "Sign in to ShopEasy",
    difficulty: "beginner",
    summary: "Authenticate and verify the signed-in state.",
    task: [
      "Sign in with testuser@example.com / Password123!",
      "Assert the account name appears in the header",
    ],
    initialUrl: "/practice/shop/login",
    mode: "simulated",
    challengeId: "ch-login",
    starterCode: wrap(
      "signs in",
      [
        "  await page.goto('/practice/shop/login');",
        "",
        "  // TODO: sign in and verify the welcome message",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "signs in",
      [
        "  await page.goto('/practice/shop/login');",
        "",
        "  await page.getByLabel('Email').fill('testuser@example.com');",
        "  await page.getByLabel('Password').fill('Password123!');",
        "  await page.getByRole('button', { name: 'Sign In' }).click();",
        "",
        "  await expect(page.getByTestId('account-name')).toHaveText(",
        "    'Welcome back, Test User',",
        "  );",
      ].join("\n"),
    ),
    hints: [
      "The demo credentials are shown on the login screen itself.",
      "The submit button's accessible name is 'Sign In'.",
      "After signing in, the header shows a data-testid of 'account-name'.",
    ],
    check: (result) => ({
      passed: Boolean(result.finalState.auth),
      message: result.finalState.auth
        ? "Signed in successfully."
        : "The session was never established — check the credentials.",
    }),
  },
  {
    id: "shopping",
    group: "Shopping",
    title: "Add a specific product to the cart",
    difficulty: "intermediate",
    summary:
      "Six identical Add to Cart buttons. Reach the right one with chaining and filtering.",
    task: [
      "Add the Wireless Headphones to the cart",
      "Assert that the cart badge shows 1",
    ],
    initialUrl: "/practice/shop",
    mode: "simulated",
    challengeId: "ch-locator-chaining",
    starterCode: wrap(
      "adds a product to the cart",
      [
        "  await page.goto('/practice/shop');",
        "",
        "  // TODO: add ONLY the Wireless Headphones to the cart.",
        "  // Do not use nth() or first().",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "adds a product to the cart",
      [
        "  await page.goto('/practice/shop');",
        "",
        "  const product = page",
        "    .getByRole('article')",
        "    .filter({ hasText: 'Wireless Headphones' });",
        "",
        "  await product.getByRole('button', { name: 'Add to Cart' }).click();",
        "",
        "  await expect(page.getByTestId('cart-count')).toHaveText('1');",
      ].join("\n"),
    ),
    hints: [
      "Each product card is an <article>. Clicking the button directly is ambiguous.",
      "filter({ hasText: ... }) narrows a set of matches by their content.",
      "Chain from the filtered card: product.getByRole('button', { name: 'Add to Cart' }).",
    ],
    check: (result) => {
      const line = result.finalState.cart.find((l) => l.productId === "p-1001");
      return {
        passed: Boolean(line) && result.finalState.cart.length === 1,
        message: line
          ? "The Wireless Headphones are in the cart."
          : "The cart does not contain exactly the Wireless Headphones.",
      };
    },
  },
  {
    id: "assertions",
    group: "Assertions",
    title: "Assert the cart contents",
    difficulty: "intermediate",
    summary: "Web-first assertions on counts, text and values.",
    task: [
      "Add two different products",
      "Open the cart and assert it has exactly two line items",
    ],
    initialUrl: "/practice/shop",
    mode: "simulated",
    challengeId: "ch-assert-cart",
    starterCode: wrap(
      "verifies the cart",
      [
        "  await page.goto('/practice/shop');",
        "",
        "  // TODO: add two products, open the cart, assert the count",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "verifies the cart",
      [
        "  await page.goto('/practice/shop');",
        "",
        "  await page",
        "    .getByRole('article')",
        "    .filter({ hasText: 'Wireless Headphones' })",
        "    .getByRole('button', { name: 'Add to Cart' })",
        "    .click();",
        "",
        "  await page",
        "    .getByRole('article')",
        "    .filter({ hasText: 'Mechanical Keyboard' })",
        "    .getByRole('button', { name: 'Add to Cart' })",
        "    .click();",
        "",
        "  await page.goto('/practice/shop/cart');",
        "",
        "  await expect(page.getByTestId('cart-item')).toHaveCount(2);",
        "  await expect(page.getByTestId('cart-item-name')).toHaveText([",
        "    'Wireless Headphones',",
        "    'Mechanical Keyboard',",
        "  ]);",
      ].join("\n"),
    ),
    hints: [
      "Each cart line has data-testid=\"cart-item\".",
      "toHaveCount() retries until the expected number of elements exist.",
      "When a locator matches several elements, toHaveText() takes an array.",
    ],
    check: (result) => ({
      passed: result.finalState.cart.length === 2,
      message:
        result.finalState.cart.length === 2
          ? "Two products are in the cart."
          : `The cart holds ${result.finalState.cart.length} line item(s).`,
    }),
  },
  {
    id: "waiting",
    group: "Waiting",
    title: "Wait for the right thing",
    difficulty: "intermediate",
    summary:
      "Use waitForURL and waitForResponse instead of a fixed sleep.",
    task: [
      "Sign in",
      "Wait for the navigation to /practice/shop",
      "Wait for the POST to /api/auth/login",
    ],
    initialUrl: "/practice/shop/login",
    mode: "simulated",
    challengeId: "ch-waiting",
    starterCode: wrap(
      "waits for conditions, not durations",
      [
        "  await page.goto('/practice/shop/login');",
        "",
        "  await page.getByLabel('Email').fill('testuser@example.com');",
        "  await page.getByLabel('Password').fill('Password123!');",
        "  await page.getByRole('button', { name: 'Sign In' }).click();",
        "",
        "  // TODO: replace a fixed wait with real conditions",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "waits for conditions, not durations",
      [
        "  await page.goto('/practice/shop/login');",
        "",
        "  await page.getByLabel('Email').fill('testuser@example.com');",
        "  await page.getByLabel('Password').fill('Password123!');",
        "  await page.getByRole('button', { name: 'Sign In' }).click();",
        "",
        "  await page.waitForURL('/practice/shop');",
        "  await page.waitForResponse('**/api/auth/login');",
        "",
        "  await expect(page.getByTestId('account-name')).toContainText('Test User');",
      ].join("\n"),
    ),
    hints: [
      "After a successful sign-in the app navigates away from /login.",
      "page.waitForURL() asserts the destination directly.",
      "The login request is POST /api/auth/login — waitForResponse can match it.",
    ],
  },
  {
    id: "e2e",
    group: "Shopping",
    title: "Complete a purchase",
    difficulty: "advanced",
    summary: "The full journey: sign in, add, check out, confirm.",
    task: [
      "Sign in",
      "Add a product to the cart",
      "Fill the checkout form and place the order",
      "Assert the confirmation and capture the order number",
    ],
    initialUrl: "/practice/shop/login",
    mode: "simulated",
    challengeId: "ch-e2e-purchase",
    starterCode: wrap(
      "completes a purchase",
      [
        "  // TODO: sign in, add a product, check out, verify the confirmation",
        "",
      ].join("\n"),
    ),
    solution: wrap(
      "completes a purchase",
      [
        "  await page.goto('/practice/shop/login');",
        "  await page.getByLabel('Email').fill('testuser@example.com');",
        "  await page.getByLabel('Password').fill('Password123!');",
        "  await page.getByRole('button', { name: 'Sign In' }).click();",
        "",
        "  await page",
        "    .getByRole('article')",
        "    .filter({ hasText: 'Wireless Headphones' })",
        "    .getByRole('button', { name: 'Add to Cart' })",
        "    .click();",
        "",
        "  await page.goto('/practice/shop/checkout');",
        "",
        "  await page.getByLabel('First Name').fill('Test');",
        "  await page.getByLabel('Last Name').fill('User');",
        "  await page.getByLabel('Address').fill('100 Queen St W');",
        "  await page.getByLabel('City').fill('Toronto');",
        "  await page.getByLabel('Province').selectOption('ON');",
        "  await page.getByLabel('Postal Code').fill('M5H 2N2');",
        "  await page.getByLabel('Card Number').fill('4111111111111111');",
        "  await page.getByLabel('Expiration').fill('12/29');",
        "  await page.getByLabel('CVV').fill('123');",
        "",
        "  await page.getByRole('button', { name: 'Place Order' }).click();",
        "",
        "  await expect(",
        "    page.getByRole('heading', { name: 'Order Successful!' }),",
        "  ).toBeVisible();",
        "",
        "  const orderNumber = await page.getByTestId('order-number').textContent();",
        "  expect(orderNumber).toMatch(/^ORD-\\d{6}$/);",
      ].join("\n"),
    ),
    hints: [
      "Checkout is a protected route — you must sign in first or you land back on /login.",
      "Every shipping and payment field is required before Place Order will work.",
      "The confirmation exposes the order number as data-testid=\"order-number\".",
    ],
    check: (result) => ({
      passed: Boolean(result.finalState.lastOrder),
      message: result.finalState.lastOrder
        ? `Order ${result.finalState.lastOrder.orderNumber} was placed.`
        : "No order was placed.",
    }),
  },
  {
    id: "messages",
    group: "Shopping",
    title: "Contact support about an order",
    difficulty: "intermediate",
    summary: "A short flow that ends in a success status message.",
    task: [
      "Sign in and open the messages page",
      "Send a message",
      "Assert the success confirmation",
    ],
    initialUrl: "/practice/shop/login",
    mode: "simulated",
    challengeId: "ch-send-message",
    starterCode: wrap(
      "sends a support message",
      ["  // TODO: sign in, open /practice/shop/messages, send a message", ""].join("\n"),
    ),
    solution: wrap(
      "sends a support message",
      [
        "  await page.goto('/practice/shop/login');",
        "  await page.getByLabel('Email').fill('testuser@example.com');",
        "  await page.getByLabel('Password').fill('Password123!');",
        "  await page.getByRole('button', { name: 'Sign In' }).click();",
        "",
        "  await page.goto('/practice/shop/messages');",
        "",
        "  await page.getByLabel('Subject').fill('Where is my order?');",
        "  await page.getByLabel('Message').fill('Any update on ORD-839472?');",
        "  await page.getByRole('button', { name: 'Send Message' }).click();",
        "",
        "  await expect(page.getByText('Message sent successfully!')).toBeVisible();",
      ].join("\n"),
    ),
    hints: [
      "/practice/shop/messages requires an authenticated session.",
      "Both Subject and Message are required.",
      "The success text is exactly 'Message sent successfully!'.",
    ],
    check: (result) => ({
      passed: result.finalState.messageSent,
      message: result.finalState.messageSent
        ? "Message sent."
        : "No message was sent.",
    }),
  },
  {
    id: "api",
    group: "API",
    title: "API testing with the request fixture",
    difficulty: "advanced",
    summary:
      "Reference example — API requests run against the real app, not the simulator.",
    task: [
      "Read the example",
      "Run it locally with npx playwright test",
    ],
    initialUrl: "/practice/shop",
    mode: "reference",
    starterCode: `import { test, expect } from '@playwright/test';

test('products endpoint returns a valid catalogue', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const { products } = await response.json();

  expect(products.length).toBeGreaterThan(0);
  expect(products.every((p) => typeof p.price === 'number')).toBe(true);
});

test('rejects an unknown product', async ({ request }) => {
  const response = await request.get('/api/products/does-not-exist');

  expect(response.status()).toBe(404);
  expect(await response.json()).toMatchObject({ error: 'Product not found' });
});
`,
    solution: "",
    hints: [
      "The request fixture speaks HTTP directly — no browser page is created.",
      "The academy ships these endpoints, so this test runs as-is locally.",
    ],
  },
  {
    id: "network",
    group: "Network",
    title: "Mocking a response with page.route",
    difficulty: "advanced",
    summary:
      "Reference example — network interception needs a real browser, so it is not executed here.",
    task: [
      "Read the example",
      "Run it locally against /practice/shop",
    ],
    initialUrl: "/practice/shop",
    mode: "reference",
    starterCode: `import { test, expect } from '@playwright/test';

test('shows the empty state when the API returns no products', async ({ page }) => {
  // Register the route BEFORE navigating.
  await page.route('**/api/products*', async (route) => {
    await route.fulfill({ json: { products: [] } });
  });

  await page.goto('/practice/shop');

  await expect(page.getByText('No products match your search')).toBeVisible();
});

test('shows an error state when the API fails', async ({ page }) => {
  await page.route('**/api/products*', (route) =>
    route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }),
  );

  await page.goto('/practice/shop');

  await expect(page.getByRole('alert')).toBeVisible();
});
`,
    solution: "",
    hints: [
      "Every route handler must call fulfill, continue or abort exactly once.",
      "Handlers registered after goto() miss the requests that already fired.",
    ],
  },
];

export const scenarioGroups = Array.from(
  scenarios.reduce((map, scenario) => {
    const list = map.get(scenario.group) ?? [];
    list.push(scenario);
    map.set(scenario.group, list);
    return map;
  }, new Map<string, Scenario[]>()),
).map(([group, items]) => ({ group, items }));

export function getScenario(id: string) {
  return scenarios.find((s) => s.id === id);
}

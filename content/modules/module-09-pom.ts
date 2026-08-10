import type { Module } from "../types";

export const pomModule: Module = {
  id: "page-object-model",
  order: 9,
  title: "Page Object Model",
  tagline: "Structure that helps — and the version that hurts",
  summary:
    "How to build page objects for the practice applications, when POM pays for itself, and the over-engineering failure mode nobody warns you about.",
  difficulty: "intermediate",
  icon: "Boxes",
  track: "architecture",
  lessons: [
    {
      id: "pom-basics",
      slug: "building-a-page-object",
      title: "Building a page object",
      moduleId: "page-object-model",
      summary:
        "Locators as fields, workflows as methods, assertions left in the test.",
      difficulty: "intermediate",
      estimatedTime: 16,
      objectives: [
        "Write a page object class for a real page",
        "Decide what belongs in the object and what stays in the test",
        "Compose page objects across a journey",
      ],
      sections: [
        {
          kind: "text",
          title: "What a page object is for",
          body: [
            "A page object is a single place that knows how to find things on a page and how to perform its workflows. Specs then describe *what* the user does, not *how* the DOM is shaped.",
            "The measurable benefit: when a label changes, you edit one file instead of thirty.",
          ],
        },
        {
          kind: "code",
          title: "pages/LoginPage.ts",
          language: "ts",
          code: `
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/practice/shop/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Waits until the app has actually established the session. */
  async expectSignedIn(name: string) {
    await expect(this.page.getByText(\`Welcome back, \${name}\`)).toBeVisible();
  }
}
`,
        },
        {
          kind: "code",
          title: "The spec that uses it",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('signs in with valid credentials', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login('testuser@example.com', 'Password123!');

  await login.expectSignedIn('Test User');
});

test('shows an error for bad credentials', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login('testuser@example.com', 'wrong-password');

  await expect(login.errorMessage).toHaveText('Invalid email or password');
});
`,
        },
        {
          kind: "table",
          title: "What goes where",
          headers: ["Belongs in the page object", "Belongs in the test"],
          rows: [
            ["Locators", "Assertions about business outcomes"],
            ["Navigation (goto)", "Test data"],
            ["Multi-step workflows (login, checkout)", "The narrative of the scenario"],
            ["Waits that are part of the workflow", "What 'correct' means"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Exposing locators is fine",
          body: [
            "Some teams hide locators behind getters and add a method per assertion. That doubles the API for no benefit. Exposing readonly locators lets tests assert naturally while keeping the definition in one place.",
          ],
        },
        {
          kind: "code",
          title: "Composing across a journey",
          language: "ts",
          code: `
const shop = new ShopPage(page);
const cart = new CartPage(page);
const checkout = new CheckoutPage(page);

await shop.goto();
await shop.addToCart('Wireless Headphones');

await cart.goto();
await expect(cart.itemNames).toHaveText(['Wireless Headphones']);

await checkout.goto();
await checkout.fillShipping(shippingDetails);
await checkout.fillPayment(cardDetails);
await checkout.placeOrder();

await expect(checkout.confirmationHeading).toBeVisible();
`,
        },
      ],
      commonMistakes: [
        {
          title: "Creating locators inside methods",
          body: "They get rebuilt on every call and end up duplicated across methods. Define them once in the constructor.",
        },
        {
          title: "Hiding every assertion behind a method",
          body: "`expectCartCountToBe(2)` adds a layer with no value. Expose the locator and assert in the test.",
        },
      ],
      keyTakeaways: [
        "Locators are fields; workflows are methods; assertions live in tests.",
        "One definition per locator means one edit when the UI changes.",
        "Page objects compose naturally across a journey.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Where should locators be defined in a page object?",
          options: [
            { id: "a", text: "Inside each method that needs them" },
            { id: "b", text: "As readonly fields assigned in the constructor" },
            { id: "c", text: "In a global constants file" },
            { id: "d", text: "Inline in the spec files" },
          ],
          correct: "b",
          explanation:
            "Constructor fields give one definition per element and make the page's surface obvious at a glance.",
        },
      ],
    },
    {
      id: "pom-good-bad",
      slug: "good-and-bad-page-objects",
      title: "Good and bad page objects",
      moduleId: "page-object-model",
      summary:
        "Side-by-side examples of the patterns that help and the ones that quietly make a suite worse.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Recognise the God-object anti-pattern",
        "Avoid returning page objects from every method",
        "Keep test data out of page objects",
      ],
      sections: [
        {
          kind: "compare",
          badLabel: "One class for the whole app",
          goodLabel: "One class per page",
          bad: `
class ShopEasyPage {
  async login() {}
  async search() {}
  async addToCart() {}
  async checkout() {}
  async viewOrders() {}
  async sendMessage() {}
  // …900 lines later
}`,
          good: `
class LoginPage {}
class ShopPage {}
class CartPage {}
class CheckoutPage {}
class OrdersPage {}
class MessagesPage {}`,
        },
        {
          kind: "compare",
          badLabel: "Fluent chaining for its own sake",
          goodLabel: "Plain methods",
          bad: `
await new LoginPage(page)
  .goto()
  .then((p) => p.login(email, password))
  .then((p) => p.navigateToShop())
  .then((p) => p.addToCart('Wireless Headphones'));`,
          good: `
await login.goto();
await login.login(email, password);
await shop.addToCart('Wireless Headphones');`,
          note:
            "Returning `this` from every method looks elegant in a slide and produces terrible stack traces in a failure.",
        },
        {
          kind: "compare",
          badLabel: "Test data baked into the page object",
          goodLabel: "Data passed in",
          bad: `
class LoginPage {
  async loginAsTestUser() {
    await this.email.fill('testuser@example.com');
    await this.password.fill('Password123!');
    await this.submit.click();
  }
}`,
          good: `
class LoginPage {
  async login(email: string, password: string) { /* … */ }
}

// test-data/users.ts
export const validUser = { email: '…', password: '…' };`,
        },
        {
          kind: "compare",
          badLabel: "Assertions buried in the page object",
          goodLabel: "Assertions in the test",
          bad: `
class CartPage {
  async verifyEverything() {
    await expect(this.title).toBeVisible();
    await expect(this.items).toHaveCount(2);
    await expect(this.total).toHaveText('$339.49');
  }
}`,
          good: `
await expect(cart.items).toHaveCount(2);
await expect(cart.total).toHaveText('$339.49');`,
          note:
            "When `verifyEverything` fails you cannot tell which expectation broke without opening the class.",
        },
        {
          kind: "list",
          title: "Warning signs",
          items: [
            "A page object longer than about 200 lines.",
            "Methods named `verify*` that wrap a single assertion.",
            "Hardcoded credentials or product names inside the class.",
            "A method that takes eight boolean parameters.",
            "Inheritance three levels deep to share two locators.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Deep inheritance hierarchies",
          body: "BasePage → AuthenticatedPage → ShopPage → ProductPage makes every change ripple. Prefer composition and small classes.",
        },
        {
          title: "A page object per component AND per page",
          body: "Component objects are useful for genuinely reused widgets. Creating one for every div is bureaucracy.",
        },
      ],
      keyTakeaways: [
        "One class per page, small and focused.",
        "Data in, assertions out.",
        "Fluent chaining trades debuggability for aesthetics — usually a bad deal.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which is the clearest sign a page object has gone wrong?",
          options: [
            { id: "a", text: "It exposes readonly locators" },
            { id: "b", text: "It is 900 lines and covers six pages" },
            { id: "c", text: "It has a goto() method" },
            { id: "d", text: "It takes page in the constructor" },
          ],
          correct: "b",
          explanation:
            "A God object recreates the coupling POM was meant to remove.",
        },
      ],
    },
    {
      id: "pom-when-not",
      slug: "when-not-to-use-pom",
      title: "When POM is over-engineering",
      moduleId: "page-object-model",
      summary:
        "An honest look at when a page object costs more than it saves.",
      difficulty: "advanced",
      estimatedTime: 11,
      objectives: [
        "Judge whether a page object is justified",
        "Use lighter alternatives",
        "Recognise POM cargo-culting",
      ],
      sections: [
        {
          kind: "text",
          title: "The trade-off",
          body: [
            "Every page object adds indirection. That is worth paying for when locators are reused and workflows are long. It is not worth paying for a page touched by one test.",
          ],
        },
        {
          kind: "table",
          title: "A rough decision table",
          headers: ["Situation", "Verdict"],
          rows: [
            ["Page used by 10+ tests", "Page object — clearly worth it"],
            ["Multi-step workflow repeated across specs", "Page object or a helper"],
            ["Page touched by a single test", "Inline locators are fine"],
            ["A one-off spike or exploratory test", "No abstraction"],
            ["Locators genuinely stable (role-based)", "Lower urgency — churn is low"],
            ["Component reused across many pages", "Component object, not a page object"],
          ],
        },
        {
          kind: "code",
          title: "A lighter alternative: helper functions",
          language: "ts",
          code: `
// helpers/shop.ts
export async function addProductToCart(page: Page, productName: string) {
  await page
    .getByRole('article')
    .filter({ hasText: productName })
    .getByRole('button', { name: 'Add to Cart' })
    .click();
}
`,
          caption:
            "No class, no constructor, no ceremony — and it removes the same duplication.",
        },
        {
          kind: "code",
          title: "A lighter alternative: fixtures",
          language: "ts",
          code: `
export const test = base.extend<{ cartWithHeadphones: Page }>({
  cartWithHeadphones: async ({ page }, use) => {
    await page.goto('/practice/shop');
    await addProductToCart(page, 'Wireless Headphones');
    await use(page);
  },
});
`,
          caption:
            "Fixtures handle setup; page objects handle interaction. They solve different problems.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "POM is not a testing strategy",
          body: [
            "A suite can have immaculate page objects and still test nothing valuable. Coverage of the right journeys, good data management and reliable waiting matter far more than the shape of the abstraction.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Creating a page object before writing a second test",
          body: "You abstract the wrong thing. Write two tests, then extract what they actually share.",
        },
        {
          title: "Using page objects for setup",
          body: "Setup belongs in fixtures. Page objects that also seed data become tangled and hard to reuse.",
        },
      ],
      keyTakeaways: [
        "Abstract on the second or third repetition, not the first.",
        "Helper functions and fixtures often solve the problem more cheaply.",
        "Structure is not a substitute for testing the right things.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "When is a page object least justified?",
          options: [
            { id: "a", text: "A checkout page used by 15 tests" },
            { id: "b", text: "A rarely visited settings page used by one test" },
            { id: "c", text: "A login page used everywhere" },
            { id: "d", text: "A product grid with complex filtering" },
          ],
          correct: "b",
          explanation:
            "With one consumer there is no duplication to remove — the abstraction is pure overhead.",
        },
      ],
    },
  ],
};

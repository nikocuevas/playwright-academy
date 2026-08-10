import type { Module } from "../types";

export const jsTsModule: Module = {
  id: "javascript-typescript",
  order: 1,
  title: "JavaScript & TypeScript for Playwright",
  tagline: "The language subset you actually use in tests",
  summary:
    "Playwright tests are just TypeScript files. This module covers exactly the language features that show up in real test suites — and skips the ones that do not.",
  difficulty: "beginner",
  icon: "Braces",
  track: "foundations",
  lessons: [
    {
      id: "js-variables",
      slug: "variables-and-values",
      title: "Variables, const and let",
      moduleId: "javascript-typescript",
      summary:
        "Why nearly every line of a Playwright test starts with const, and when let is the right call.",
      difficulty: "beginner",
      estimatedTime: 10,
      objectives: [
        "Declare values with const and let and explain the difference",
        "Recognise why var does not appear in modern test code",
        "Store locators in variables to remove duplication",
      ],
      sections: [
        {
          kind: "text",
          title: "A variable is a name for a value",
          body: [
            "When you automate a browser you constantly need to refer to the same thing more than once: an email address, a price, a button. A variable gives that value a name so you can reuse it instead of retyping it.",
            "JavaScript has two declarations worth knowing: `const` and `let`. A third one, `var`, exists for historical reasons and you should not use it.",
          ],
        },
        {
          kind: "code",
          title: "const — the default choice",
          code: `
const email = 'testuser@example.com';
const password = 'Password123!';

// This would throw: "Assignment to constant variable."
// email = 'someone-else@example.com';
`,
          caption:
            "const means the name cannot be pointed at a different value later.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "const is not 'frozen'",
          body: [
            "`const` locks the *binding*, not the contents. You can still push into a `const` array or change a property on a `const` object. That is why test data objects are almost always declared with `const`.",
          ],
        },
        {
          kind: "code",
          title: "let — only when the value genuinely changes",
          code: `
let attempts = 0;

while (attempts < 3) {
  attempts = attempts + 1;
}
`,
        },
        {
          kind: "text",
          title: "In a Playwright test",
          body: [
            "The most valuable use of `const` in a test suite is naming a locator. A locator is lazy — creating it does not touch the page — so storing it costs nothing and makes the test read like a description of the workflow.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Repeated, hard to change",
          goodLabel: "Named once, reused",
          bad: `
await page.getByRole('button', { name: 'Add to Cart' }).click();
await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();`,
          good: `
const addToCart = page.getByRole('button', { name: 'Add to Cart' });

await addToCart.click();
await expect(addToCart).toBeDisabled();`,
          note: "If the button label changes, you edit one line instead of hunting through the file.",
        },
        {
          kind: "table",
          title: "Quick reference",
          headers: ["Declaration", "Reassignable", "Use it when"],
          rows: [
            ["const", "No", "Almost always — locators, test data, page objects"],
            ["let", "Yes", "Counters, values built up inside a loop"],
            ["var", "Yes", "Never in new code — function-scoped and error-prone"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Reaching for let out of habit",
          body: "If you never reassign the variable, use const. Readers can then trust that the name always points at the same thing.",
        },
        {
          title: "Expecting const to make an object immutable",
          body: "`const user = { name: 'A' }` still allows `user.name = 'B'`. Use `Object.freeze` or simply do not mutate shared test data.",
        },
      ],
      keyTakeaways: [
        "Default to const; reach for let only when a value is genuinely reassigned.",
        "const protects the name, not the contents of an object or array.",
        "Storing a locator in a const removes duplication and documents intent.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which declaration should you reach for first in a Playwright test?",
          options: [
            { id: "a", text: "var" },
            { id: "b", text: "const" },
            { id: "c", text: "let" },
            { id: "d", text: "It makes no difference" },
          ],
          correct: "b",
          explanation:
            "const is the default. It signals to the reader that the binding never changes, which is true for locators and test data.",
        },
        {
          id: "q2",
          type: "predict-result",
          prompt: "What happens when this code runs?",
          code: `const user = { name: 'Ada' };
user.name = 'Grace';
console.log(user.name);`,
          options: [
            { id: "a", text: "TypeError: Assignment to constant variable" },
            { id: "b", text: "Logs 'Ada'" },
            { id: "c", text: "Logs 'Grace'" },
            { id: "d", text: "Logs undefined" },
          ],
          correct: "c",
          explanation:
            "const prevents rebinding `user` to a different object. Mutating a property of that object is still allowed.",
        },
      ],
    },
    {
      id: "js-functions",
      slug: "functions-and-arrow-functions",
      title: "Functions and arrow functions",
      moduleId: "javascript-typescript",
      summary:
        "Every Playwright test body is an arrow function. Here is what that syntax means.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Write function declarations and arrow functions",
        "Pass parameters and return values",
        "Read the arrow function inside test()",
      ],
      sections: [
        {
          kind: "text",
          title: "Functions package up work",
          body: [
            "A function is a reusable block of steps. You give it a name, optionally some inputs (parameters), and it can hand back a result (a return value).",
          ],
        },
        {
          kind: "code",
          title: "Three ways to write the same thing",
          code: `
// 1. Function declaration
function fullName(first, last) {
  return first + ' ' + last;
}

// 2. Function expression
const fullName2 = function (first, last) {
  return first + ' ' + last;
};

// 3. Arrow function — the modern default
const fullName3 = (first, last) => first + ' ' + last;
`,
        },
        {
          kind: "text",
          title: "Reading a Playwright test signature",
          body: [
            "Now the shape of every Playwright test should make sense. `test()` is a function that takes two arguments: a title string, and a function containing the steps.",
          ],
        },
        {
          kind: "code",
          title: "Decomposing test()",
          language: "ts",
          code: `
test('homepage loads', async ({ page }) => {
  await page.goto('/');
});

//   ^ name        ^ async arrow function
//                        ^ destructured fixture argument
`,
          highlightLines: [2],
        },
        {
          kind: "list",
          title: "Piece by piece",
          items: [
            "`test` — the function Playwright gives you to register a test.",
            "`'homepage loads'` — the first argument, the test title shown in reports.",
            "`async ({ page }) => { ... }` — the second argument, an arrow function that receives fixtures.",
            "`{ page }` — destructuring: pull the `page` fixture out of the object Playwright passes in.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Arrow functions and `this`",
          body: [
            "Arrow functions do not create their own `this`. That is one reason Playwright's test API uses them — there is no hidden context to trip over, unlike some older frameworks where `function () {}` was mandatory.",
          ],
        },
        {
          kind: "code",
          title: "Extracting a helper",
          language: "ts",
          code: `
async function login(page, email, password) {
  await page.goto('/practice/shop/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test('shows the account name after login', async ({ page }) => {
  await login(page, 'testuser@example.com', 'Password123!');
  await expect(page.getByText('Welcome back, Test User')).toBeVisible();
});
`,
          caption:
            "Helpers are the first step toward page objects — you will formalise this later in the Page Object Model module.",
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting the braces change the meaning",
          body: "`(x) => x * 2` returns implicitly. `(x) => { x * 2 }` returns undefined because the braces open a block, not an expression.",
        },
        {
          title: "Writing test('name', () => { await ... })",
          body: "If the body contains `await`, the arrow function must be marked `async`.",
        },
      ],
      keyTakeaways: [
        "Arrow functions are the default style in Playwright test code.",
        "`test(title, fn)` is an ordinary function call — nothing magic about it.",
        "Braceless arrows return implicitly; braced arrows need an explicit return.",
      ],
      quiz: [
        {
          id: "q1",
          type: "code-interpretation",
          prompt: "What does this arrow function return?",
          code: `const double = (n) => { n * 2 };
console.log(double(4));`,
          options: [
            { id: "a", text: "8" },
            { id: "b", text: "undefined" },
            { id: "c", text: "4" },
            { id: "d", text: "A syntax error" },
          ],
          correct: "b",
          explanation:
            "The braces create a function body, so `n * 2` is evaluated and discarded. Either remove the braces or add `return`.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "In `test('x', async ({ page }) => {})`, what is `{ page }`?",
          options: [
            { id: "a", text: "An object literal being created" },
            { id: "b", text: "Destructuring of the fixtures object Playwright passes in" },
            { id: "c", text: "A TypeScript type annotation" },
            { id: "d", text: "A block statement" },
          ],
          correct: "b",
          explanation:
            "Playwright calls your function with a fixtures object. `{ page }` pulls just the `page` property out of it.",
        },
      ],
    },
    {
      id: "js-objects-arrays",
      slug: "objects-arrays-and-destructuring",
      title: "Objects, arrays and destructuring",
      moduleId: "javascript-typescript",
      summary:
        "Test data lives in objects and arrays, and destructuring is everywhere in Playwright's API.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Build and read objects and arrays",
        "Destructure objects and arrays",
        "Model test data as reusable objects",
      ],
      sections: [
        {
          kind: "code",
          title: "Objects group related values",
          language: "ts",
          code: `
const user = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  password: 'Password123!',
};

console.log(user.email);       // dot access
console.log(user['email']);    // bracket access
`,
        },
        {
          kind: "code",
          title: "Arrays hold ordered lists",
          language: "ts",
          code: `
const countries = ['Canada', 'United States', 'Mexico'];

countries.length;   // 3
countries[0];       // 'Canada'
countries.at(-1);   // 'Mexico'
`,
        },
        {
          kind: "text",
          title: "Destructuring",
          body: [
            "Destructuring pulls values out of an object or array into standalone variables. Playwright leans on it heavily — every test signature uses it.",
          ],
        },
        {
          kind: "code",
          title: "Object and array destructuring",
          language: "ts",
          code: `
const { firstName, email } = user;
// firstName === 'Test', email === 'testuser@example.com'

// Rename while destructuring
const { firstName: given } = user;

// Provide a default when the key is missing
const { phone = '000-000-0000' } = user;

// Arrays destructure by position
const [first, second] = countries;
`,
        },
        {
          kind: "code",
          title: "Why Playwright tests look the way they do",
          language: "ts",
          code: `
// Playwright calls your function with an object of fixtures:
// { page, context, browser, request, ... }

test('uses two fixtures', async ({ page, request }) => {
  const response = await request.get('/api/products');
  await page.goto('/practice/shop');
});
`,
          caption:
            "You only destructure the fixtures you use — Playwright only creates those.",
        },
        {
          kind: "code",
          title: "Test data as a reusable object",
          language: "ts",
          code: `
// test-data/users.ts
export const validUser = {
  email: 'testuser@example.com',
  password: 'Password123!',
  fullName: 'Test User',
};

// tests/login.spec.ts
import { validUser } from '../test-data/users';

await page.getByLabel('Email').fill(validUser.email);
`,
        },
      ],
      commonMistakes: [
        {
          title: "Destructuring a fixture you did not ask for",
          body: "Only fixtures listed in the destructuring pattern are instantiated. Asking for `browser` when you only need `page` slows the test down.",
        },
        {
          title: "Mutating shared test data",
          body: "If one test edits an imported object, later tests inherit the change. Copy it first: `const user = { ...validUser }`.",
        },
      ],
      keyTakeaways: [
        "Objects group related test data; arrays hold ordered collections.",
        "Destructuring is how you receive fixtures in every Playwright test.",
        "Spread (`{ ...obj }`) gives you a copy so tests stay independent.",
      ],
      quiz: [
        {
          id: "q1",
          type: "code-interpretation",
          prompt: "What is logged?",
          code: `const config = { retries: 2 };
const { retries, workers = 4 } = config;
console.log(retries, workers);`,
          options: [
            { id: "a", text: "2 4" },
            { id: "b", text: "2 undefined" },
            { id: "c", text: "undefined 4" },
            { id: "d", text: "TypeError" },
          ],
          correct: "a",
          explanation:
            "`retries` exists so it is taken from the object. `workers` is missing, so the default of 4 applies.",
        },
      ],
    },
    {
      id: "js-async",
      slug: "promises-async-await",
      title: "Promises, async and await",
      moduleId: "javascript-typescript",
      summary:
        "The single most important language concept for Playwright: almost every call returns a Promise.",
      difficulty: "beginner",
      estimatedTime: 18,
      objectives: [
        "Explain what a Promise represents",
        "Use await correctly and know when it is required",
        "Recognise the failure modes of a missing await",
      ],
      sections: [
        {
          kind: "text",
          title: "Browser work takes time",
          body: [
            "Clicking a button, loading a page or reading text all take real time. JavaScript does not block while it waits — instead, functions that take time return a **Promise**: an object representing a value that will exist later.",
            "`await` pauses the surrounding `async` function until that Promise settles, then hands you the value.",
          ],
        },
        {
          kind: "diagram",
          title: "What await actually does",
          ascii: `page.click()  ──▶ returns Promise (pending)
                     │
       await ────────┤  test pauses here
                     │
                     ▼
              Promise resolves ──▶ test continues`,
        },
        {
          kind: "code",
          title: "The shape you will write hundreds of times",
          language: "ts",
          code: `
test('login', async ({ page }) => {
  await page.goto('/practice/shop/login');
  await page.getByLabel('Email').fill('testuser@example.com');
  await page.getByRole('button', { name: 'Sign In' }).click();
});
`,
          caption:
            "`async` on the function, `await` on every call that returns a Promise.",
        },
        {
          kind: "callout",
          tone: "danger",
          title: "The number one Playwright bug",
          body: [
            "A missing `await` does not usually crash. The test races ahead, the action happens out of order (or after the test ends), and you get a flaky failure that is painful to diagnose. Turn on the `no-floating-promises` ESLint rule to catch these.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Missing await — race condition",
          goodLabel: "Awaited — deterministic",
          bad: `
page.getByLabel('Email').fill('a@b.com');
page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.getByText('Welcome')).toBeVisible();`,
          good: `
await page.getByLabel('Email').fill('a@b.com');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.getByText('Welcome')).toBeVisible();`,
        },
        {
          kind: "text",
          title: "What does NOT need await",
          body: [
            "Creating a locator is synchronous and lazy. `page.getByRole('button')` does not touch the page — it just describes how to find something. Only when you call an action or assertion on it does work happen.",
          ],
        },
        {
          kind: "code",
          title: "Locator creation vs. locator use",
          language: "ts",
          code: `
const signIn = page.getByRole('button', { name: 'Sign In' }); // no await
await signIn.click();                                          // await
await expect(signIn).toBeHidden();                             // await
`,
        },
        {
          kind: "code",
          title: "Running things in parallel with Promise.all",
          language: "ts",
          code: `
// Start waiting for the response BEFORE the click that triggers it,
// otherwise the response can arrive before you begin listening.
const [response] = await Promise.all([
  page.waitForResponse('**/api/orders'),
  page.getByRole('button', { name: 'Place Order' }).click(),
]);

expect(response.status()).toBe(200);
`,
        },
        {
          kind: "code",
          title: "try / catch for expected failures",
          language: "ts",
          code: `
try {
  await page.getByText('Cookie banner').click({ timeout: 2000 });
} catch {
  // Banner was not shown this run — that is fine.
}
`,
          caption:
            "Use sparingly. Swallowing errors can hide real problems; prefer an explicit conditional check.",
        },
      ],
      commonMistakes: [
        {
          title: "await on a locator instead of an action",
          body: "`await page.getByRole('button')` awaits a non-Promise. It is harmless but meaningless — the await belongs on `.click()`.",
        },
        {
          title: "Clicking before starting to wait for the response",
          body: "If you `click()` and then `waitForResponse()`, the response may already have arrived. Start the wait first, ideally with `Promise.all`.",
        },
        {
          title: "Forgetting async on the test callback",
          body: "`await` is only legal inside an `async` function. Playwright test callbacks should nearly always be `async`.",
        },
      ],
      keyTakeaways: [
        "Nearly every Playwright action and assertion returns a Promise and needs await.",
        "Creating a locator is synchronous — no await required.",
        "Start a wait before the action that triggers it, using Promise.all.",
        "A missing await produces flaky, confusing failures rather than clean errors.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "This test intermittently fails. What is wrong?",
          code: `test('checkout', async ({ page }) => {
  await page.goto('/practice/shop/cart');
  page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/checkout/);
});`,
          options: [
            { id: "a", text: "goto should not be awaited" },
            { id: "b", text: "The click is missing await" },
            { id: "c", text: "toHaveURL needs a string, not a regex" },
            { id: "d", text: "The test callback should not be async" },
          ],
          correct: "b",
          explanation:
            "Without await, the click Promise floats. The URL assertion may start before the navigation is even triggered.",
        },
        {
          id: "q2",
          type: "true-false",
          prompt: "`page.getByRole('button')` must be awaited.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation:
            "Locator creation is lazy and synchronous. Only actions and assertions on the locator are asynchronous.",
        },
        {
          id: "q3",
          type: "multiple-choice",
          prompt:
            "You need to capture the response to POST /api/orders triggered by clicking 'Place Order'. Which is correct?",
          options: [
            {
              id: "a",
              text: "Click, then await page.waitForResponse('**/api/orders')",
            },
            {
              id: "b",
              text: "await Promise.all([page.waitForResponse('**/api/orders'), button.click()])",
            },
            { id: "c", text: "await page.waitForTimeout(3000) after the click" },
            { id: "d", text: "await page.waitForLoadState('networkidle')" },
          ],
          correct: "b",
          explanation:
            "Registering the wait before the click removes the race. Option A can miss a fast response; C and D are unreliable.",
        },
      ],
    },
    {
      id: "js-classes-modules",
      slug: "classes-and-modules",
      title: "Classes, imports and exports",
      moduleId: "javascript-typescript",
      summary:
        "The building blocks of page objects: classes with a constructor, and ES module imports.",
      difficulty: "beginner",
      estimatedTime: 14,
      objectives: [
        "Write a class with a constructor and methods",
        "Export and import across files",
        "Read a typical page object class",
      ],
      sections: [
        {
          kind: "code",
          title: "A class bundles data and behaviour",
          language: "ts",
          code: `
class Counter {
  count = 0;

  increment() {
    this.count += 1;
    return this.count;
  }
}

const c = new Counter();
c.increment(); // 1
`,
        },
        {
          kind: "text",
          title: "The constructor",
          body: [
            "The `constructor` runs when you write `new ClassName(...)`. Page objects use it to capture the `page` and build their locators once.",
          ],
        },
        {
          kind: "code",
          title: "A page object, decoded",
          language: "ts",
          code: `
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/practice/shop/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
`,
          caption:
            "Locators are created in the constructor because they are lazy — nothing is queried until a method runs.",
        },
        {
          kind: "code",
          title: "Named vs. default exports",
          language: "ts",
          code: `
// Named export (preferred — the name is discoverable)
export class CartPage {}
import { CartPage } from './CartPage';

// Default export
export default class CartPage2 {}
import AnythingIWant from './CartPage2';

// Re-export several from one entry point
export * from './LoginPage';
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Prefer named exports in test suites",
          body: [
            "Named exports keep the same identifier everywhere, which makes grep, refactoring and code review easier across a large suite.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Doing work in the constructor",
          body: "Never `await` navigation inside a constructor — constructors cannot be async. Put it in a `goto()` method.",
        },
        {
          title: "Forgetting `this.`",
          body: "Inside a class method, fields must be accessed as `this.email`, not `email`.",
        },
      ],
      keyTakeaways: [
        "A page object is a plain class: locators as fields, workflows as methods.",
        "Constructors are synchronous — navigation belongs in a method.",
        "Named exports keep identifiers stable across a suite.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "Why will this page object fail?",
          code: `export class ShopPage {
  constructor(page) {
    this.page = page;
    await page.goto('/practice/shop');
  }
}`,
          options: [
            { id: "a", text: "Classes cannot have constructors" },
            { id: "b", text: "You cannot await inside a constructor" },
            { id: "c", text: "page.goto does not exist" },
            { id: "d", text: "The class needs a default export" },
          ],
          correct: "b",
          explanation:
            "Constructors cannot be async. Move navigation into an async `goto()` method that the test calls explicitly.",
        },
      ],
    },
    {
      id: "ts-types",
      slug: "typescript-types-and-interfaces",
      title: "TypeScript types and interfaces",
      moduleId: "javascript-typescript",
      summary:
        "Just enough type syntax to read Playwright's API and to type your own test data.",
      difficulty: "beginner",
      estimatedTime: 15,
      objectives: [
        "Annotate variables, parameters and return values",
        "Define object shapes with type and interface",
        "Import Playwright's Page and Locator types",
      ],
      sections: [
        {
          kind: "text",
          title: "Types describe the shape of your data",
          body: [
            "TypeScript adds a layer of checking on top of JavaScript. It never runs in the browser — it is erased at build time — but it catches a whole class of mistakes in your editor, before the test ever runs.",
          ],
        },
        {
          kind: "code",
          title: "Basic annotations",
          language: "ts",
          code: `
const email: string = 'testuser@example.com';
const quantity: number = 2;
const acceptedTerms: boolean = true;
const tags: string[] = ['smoke', 'regression'];

function total(price: number, qty: number): number {
  return price * qty;
}
`,
        },
        {
          kind: "code",
          title: "Describing objects",
          language: "ts",
          code: `
type User = {
  email: string;
  password: string;
  phone?: string;       // optional
};

interface Product {
  id: string;
  name: string;
  price: number;
}

const validUser: User = {
  email: 'testuser@example.com',
  password: 'Password123!',
};
`,
        },
        {
          kind: "table",
          title: "type vs. interface",
          headers: ["", "type", "interface"],
          rows: [
            ["Object shapes", "Yes", "Yes"],
            ["Unions (`'a' | 'b'`)", "Yes", "No"],
            ["Declaration merging", "No", "Yes"],
            ["Recommended for test data", "Yes — simpler and more flexible", "Fine too"],
          ],
        },
        {
          kind: "code",
          title: "Playwright's own types",
          language: "ts",
          code: `
import { test, expect, type Page, type Locator } from '@playwright/test';

async function addToCart(page: Page, productName: string): Promise<void> {
  const card: Locator = page
    .getByRole('article')
    .filter({ hasText: productName });

  await card.getByRole('button', { name: 'Add to Cart' }).click();
}
`,
          caption:
            "`type` on the import makes it explicit that only the type is imported and nothing ships to runtime.",
        },
        {
          kind: "code",
          title: "Union types are great for test data",
          language: "ts",
          code: `
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

const status: OrderStatus = 'paid';   // ok
// const bad: OrderStatus = 'payed';  // compile error — typo caught
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Resist the urge to use `any`",
          body: [
            "`any` switches off checking for that value and everything derived from it. If you genuinely do not know the shape, `unknown` is the honest choice — it forces you to narrow before use.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Believing types run at test time",
          body: "Types are erased before execution. They cannot validate an API response at runtime — assert on it explicitly instead.",
        },
        {
          title: "Typing everything explicitly",
          body: "TypeScript infers well. `const page = await context.newPage()` is already typed as Page; adding an annotation is noise.",
        },
      ],
      keyTakeaways: [
        "TypeScript is compile-time only — it catches mistakes in the editor, not at runtime.",
        "`type` handles object shapes and unions; both `type` and `interface` work for page objects.",
        "Import `Page` and `Locator` as types when writing helpers and page objects.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which type correctly models an order status of pending, paid or shipped?",
          options: [
            { id: "a", text: "type Status = string" },
            { id: "b", text: "type Status = 'pending' | 'paid' | 'shipped'" },
            { id: "c", text: "type Status = ['pending', 'paid', 'shipped']" },
            { id: "d", text: "type Status = any" },
          ],
          correct: "b",
          explanation:
            "A union of string literals restricts the value to exactly those three and catches typos at compile time.",
        },
        {
          id: "q2",
          type: "true-false",
          prompt: "TypeScript types validate API responses at runtime.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation:
            "Types are erased at build time. To validate a response you must assert on the actual data.",
        },
      ],
    },
    {
      id: "js-array-methods",
      slug: "array-methods-for-tests",
      title: "Array methods you will actually use",
      moduleId: "javascript-typescript",
      summary:
        "map, filter, find, some, every and includes — applied to locators and API payloads.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Transform and filter arrays without loops",
        "Work with the array returned by locator.all()",
        "Validate API response collections",
      ],
      sections: [
        {
          kind: "code",
          title: "The core five",
          language: "ts",
          code: `
const prices = [19.99, 249.5, 4.25, 89];

prices.map((p) => p * 1.13);        // new array, each transformed
prices.filter((p) => p > 50);       // new array, only matches
prices.find((p) => p > 50);         // first match, or undefined
prices.some((p) => p > 200);        // true / false — any match?
prices.every((p) => p > 0);         // true / false — all match?
`,
        },
        {
          kind: "code",
          title: "Validating an API response",
          language: "ts",
          code: `
const response = await request.get('/api/products');
const { products } = await response.json();

expect(products.length).toBeGreaterThan(0);
expect(products.every((p) => p.price > 0)).toBe(true);

const headphones = products.find((p) => p.name === 'Wireless Headphones');
expect(headphones).toBeDefined();
`,
        },
        {
          kind: "text",
          title: "locator.all() and allTextContents()",
          body: [
            "Most of the time you should assert on a locator directly and let auto-waiting do its job. But when you genuinely need the values — say, to check sort order — Playwright can hand you an array.",
          ],
        },
        {
          kind: "code",
          title: "Checking that a list is sorted",
          language: "ts",
          code: `
const priceTexts = await page
  .getByTestId('product-price')
  .allTextContents();

const values = priceTexts.map((t) => Number(t.replace(/[^0-9.]/g, '')));
const sorted = [...values].sort((a, b) => a - b);

expect(values).toEqual(sorted);
`,
          caption:
            "`[...values]` copies first, because `sort()` mutates the array in place.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "allTextContents() does not auto-wait for a count",
          body: [
            "It resolves against whatever is on the page right now. If the list is still loading you may read an empty array. Assert the expected count first with `await expect(list).toHaveCount(6)`.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Using forEach with await inside",
          body: "`forEach` ignores returned Promises. Use a `for...of` loop when the body awaits.",
        },
        {
          title: "Sorting in place by accident",
          body: "`sort()` mutates. Copy with spread before sorting if you still need the original order.",
        },
      ],
      keyTakeaways: [
        "map/filter/find/some/every replace most loops in test code.",
        "Assert a count before reading text arrays off the page.",
        "Use `for...of`, not `forEach`, when the loop body awaits.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "Why does this loop finish before the clicks happen?",
          code: `const buttons = await page.getByRole('button', { name: 'Remove' }).all();
buttons.forEach(async (b) => {
  await b.click();
});`,
          options: [
            { id: "a", text: "all() does not return an array" },
            { id: "b", text: "forEach does not await the async callback" },
            { id: "c", text: "click() is synchronous" },
            { id: "d", text: "The locator is wrong" },
          ],
          correct: "b",
          explanation:
            "forEach calls the callback and discards the returned Promise. Use `for (const b of buttons) { await b.click(); }`.",
        },
      ],
    },
  ],
};

import type { Module } from "../types";

export const locatorsModule: Module = {
  id: "locators",
  order: 3,
  title: "Locators",
  tagline: "The skill that decides whether your suite survives a redesign",
  summary:
    "Every Playwright test is a chain of locators. This module covers the built-in getBy* locators, CSS and XPath, chaining, filtering, and a strategy for surviving dynamic ids.",
  difficulty: "beginner",
  icon: "Crosshair",
  track: "core",
  lessons: [
    {
      id: "loc-what-is",
      slug: "what-a-locator-is",
      title: "What a locator really is",
      moduleId: "locators",
      summary:
        "A locator is a lazy description of how to find an element — not the element itself.",
      difficulty: "beginner",
      estimatedTime: 10,
      objectives: [
        "Explain laziness and re-resolution",
        "Distinguish locators from element handles",
        "Understand strictness",
      ],
      sections: [
        {
          kind: "text",
          title: "A recipe, not an ingredient",
          body: [
            "In older tools, `findElement` returned a reference to a specific DOM node. If React re-rendered, that reference went stale and you got a `StaleElementReferenceException`.",
            "A Playwright locator is different: it stores *how to find* the element. Every time you act on it, Playwright resolves it again against the current DOM. Stale element errors simply do not happen.",
          ],
        },
        {
          kind: "code",
          title: "Creating vs. using",
          language: "ts",
          code: `
// Nothing has happened yet — no query, no waiting.
const cartCount = page.getByTestId('cart-count');

// Now Playwright resolves it, waits, and reads the text.
await expect(cartCount).toHaveText('1');

// Resolved again from scratch, against the updated DOM.
await expect(cartCount).toHaveText('2');
`,
        },
        {
          kind: "callout",
          tone: "success",
          title: "Strictness is a feature",
          body: [
            "If a locator matches more than one element, actions throw a strict mode violation instead of silently picking the first one. That error is telling you the description is ambiguous — fix the locator rather than reaching for `.first()`.",
          ],
        },
        {
          kind: "code",
          title: "A strict mode violation",
          language: "text",
          code: `
Error: strict mode violation: getByRole('button') resolved to 6 elements:
  1) <button>Add to Cart</button>
  2) <button>Add to Cart</button>
  ...

Call log:
  - waiting for getByRole('button')
`,
        },
        {
          kind: "table",
          title: "Locator vs. ElementHandle",
          headers: ["", "Locator", "ElementHandle"],
          rows: [
            ["Resolved", "Every time it is used", "Once, at creation"],
            ["Goes stale", "Never", "Yes"],
            ["Auto-waits", "Yes", "No"],
            ["Use it", "Always", "Only for rare low-level work"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Reaching for `.first()` to silence strict mode",
          body: "It hides ambiguity. If the order changes, the test silently targets the wrong element. Narrow with `filter()` or a scoped parent instead.",
        },
        {
          title: "Storing an ElementHandle",
          body: "`page.$('...')` returns a handle that can go stale. Use `page.locator('...')`.",
        },
      ],
      keyTakeaways: [
        "A locator is a lazy, re-resolvable description — never a stale reference.",
        "Strict mode turns ambiguity into a loud error instead of a silent bug.",
        "Prefer locators over element handles in essentially all test code.",
      ],
      quiz: [
        {
          id: "q1",
          type: "true-false",
          prompt: "Creating a locator queries the DOM immediately.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation:
            "Locators are lazy. The DOM is queried when an action or assertion runs.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt:
            "`getByRole('button')` resolves to 6 elements and your click throws. What is the best fix?",
          options: [
            { id: "a", text: "Add .first()" },
            { id: "b", text: "Scope to the containing card, then find the button" },
            { id: "c", text: "Increase the timeout" },
            { id: "d", text: "Use page.$ instead" },
          ],
          correct: "b",
          explanation:
            "Scoping expresses the real intent — the button inside a particular product card — and stays correct when the list order changes.",
        },
      ],
      playground: ["locators"],
    },
    {
      id: "loc-get-by-role",
      slug: "get-by-role",
      title: "getByRole — the first locator to reach for",
      moduleId: "locators",
      summary:
        "Find elements the way assistive technology does: by accessible role and name.",
      difficulty: "beginner",
      estimatedTime: 16,
      objectives: [
        "Use getByRole with name, exact and level options",
        "Map common HTML elements to their implicit roles",
        "Explain why role-based locators resist refactoring",
      ],
      sections: [
        {
          kind: "text",
          title: "Why role first",
          body: [
            "The accessibility tree is what a screen reader sees. It is derived from semantic HTML and ARIA, and it changes only when the *meaning* of the UI changes — not when a designer swaps a class name or a bundler regenerates an id.",
            "A test written against roles therefore breaks when the user-visible behaviour breaks. That is exactly the signal you want.",
          ],
        },
        {
          kind: "code",
          title: "The basic form",
          language: "ts",
          code: `
page.getByRole('button', { name: 'Add to Cart' });
page.getByRole('link', { name: 'View Orders' });
page.getByRole('heading', { name: 'Checkout', level: 1 });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('checkbox', { name: 'Terms and Conditions' });
page.getByRole('combobox', { name: 'Country' });
page.getByRole('article');
`,
        },
        {
          kind: "table",
          title: "Implicit roles you will use constantly",
          headers: ["HTML", "Role"],
          rows: [
            ["<button>, <input type=\"submit\">", "button"],
            ["<a href=\"...\">", "link"],
            ["<input type=\"text\">, <textarea>", "textbox"],
            ["<input type=\"checkbox\">", "checkbox"],
            ["<input type=\"radio\">", "radio"],
            ["<select>", "combobox (or listbox when multiple)"],
            ["<h1>–<h6>", "heading (with level)"],
            ["<table>", "table"],
            ["<ul>, <ol>", "list"],
            ["<article>", "article"],
            ["<nav>", "navigation"],
            ["<img alt=\"...\">", "img"],
          ],
        },
        {
          kind: "text",
          title: "The accessible name",
          body: [
            "The `name` option matches the element's accessible name, which is computed from — roughly in order — `aria-labelledby`, `aria-label`, an associated `<label>`, the element's own text, or `alt`/`title`.",
            "Matching is case-insensitive and ignores surrounding whitespace by default. Pass `exact: true` when you need a precise, case-sensitive match.",
          ],
        },
        {
          kind: "code",
          title: "Name matching options",
          language: "ts",
          code: `
// Substring, case-insensitive (default)
page.getByRole('button', { name: 'add to cart' });

// Exact, case-sensitive
page.getByRole('button', { name: 'Add to Cart', exact: true });

// Regex for dynamic names
page.getByRole('heading', { name: /^Order ORD-\\d+$/ });

// Other useful options
page.getByRole('checkbox', { name: 'Terms', checked: true });
page.getByRole('button', { name: 'Place Order', disabled: true });
`,
        },
        {
          kind: "compare",
          badLabel: "Breaks on any refactor",
          goodLabel: "Survives refactors",
          bad: `
page.locator('#btn-8f3a2');
page.locator('.MuiButton-root.css-1x9f7d');
page.locator('div > div > div:nth-child(3) > button');`,
          good: `
page.getByRole('button', { name: 'Login' });`,
          note:
            "The generated id, the CSS-in-JS class and the DOM position are all implementation details. The role and the label are the contract with the user.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Two ways to discover roles",
          body: [
            "Run `npx playwright codegen http://localhost:3000` and hover elements — it suggests role-based locators. Or open UI mode and use the locator picker. Both beat guessing.",
          ],
        },
        {
          kind: "practice",
          href: "/practice/registration",
          title: "Practice on the Registration app",
          body: "Every control there has a proper label and role — and a deliberately unstable id — so role-based locators are the only ones that keep working.",
        },
      ],
      commonMistakes: [
        {
          title: "Assuming a <div onclick> is a button",
          body: "A div has no implicit role. If the app uses one, either fix the app or fall back to `getByText` / `getByTestId`.",
        },
        {
          title: "Using the visible text when an aria-label overrides it",
          body: "`aria-label` wins over inner text. Check the accessibility tree, not the rendered label.",
        },
      ],
      keyTakeaways: [
        "getByRole is the default locator: role + accessible name.",
        "Roles change when meaning changes, not when styling changes.",
        "Use `exact: true` or a regex when substring matching is too loose.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt:
            "The page has <button id=\"btn-92831\" class=\"css-1kd9\">Place Order</button>. Which locator is best?",
          options: [
            { id: "a", text: "page.locator('#btn-92831')" },
            { id: "b", text: "page.locator('.css-1kd9')" },
            { id: "c", text: "page.getByRole('button', { name: 'Place Order' })" },
            { id: "d", text: "page.locator('button').nth(3)" },
          ],
          correct: "c",
          explanation:
            "The role and the accessible name are stable and describe user intent. The id and class are generated; the index depends on layout.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "What role does a <select> element expose?",
          options: [
            { id: "a", text: "dropdown" },
            { id: "b", text: "combobox" },
            { id: "c", text: "select" },
            { id: "d", text: "menu" },
          ],
          correct: "b",
          explanation:
            "A single-select `<select>` is a combobox. With the `multiple` attribute it becomes a listbox.",
        },
      ],
      playground: ["locators"],
      challenges: ["ch-locate-email", "ch-register-submit"],
    },
    {
      id: "loc-other-getby",
      slug: "get-by-label-text-placeholder-testid",
      title: "getByLabel, getByText, getByPlaceholder, getByTestId",
      moduleId: "locators",
      summary:
        "The rest of the built-in locators, and a clear rule for when each one is the right choice.",
      difficulty: "beginner",
      estimatedTime: 16,
      objectives: [
        "Pick the right getBy* locator for a given element",
        "Use getByLabel for form fields",
        "Know when a test id is genuinely the best option",
      ],
      sections: [
        {
          kind: "code",
          title: "getByLabel — form fields",
          language: "ts",
          code: `
await page.getByLabel('Email').fill('testuser@example.com');
await page.getByLabel('Confirm Password').fill('Password123!');

// 'Password' also matches 'Confirm Password' — be explicit:
await page.getByLabel('Password', { exact: true }).fill('Password123!');
`,
          caption:
            "Works with <label for>, wrapping labels, aria-label and aria-labelledby.",
        },
        {
          kind: "code",
          title: "getByText — visible copy",
          language: "ts",
          code: `
await expect(page.getByText('Order Successful!')).toBeVisible();
await expect(page.getByText('Registration successful!')).toBeVisible();

// Exact match
page.getByText('Cart', { exact: true });

// Regex for generated content
page.getByText(/Order Number: ORD-\\d{6}/);
`,
        },
        {
          kind: "code",
          title: "getByPlaceholder — when there is no label",
          language: "ts",
          code: `
await page.getByPlaceholder('Search products').fill('headphones');
`,
          caption:
            "A placeholder is not a label. If a field only has a placeholder, that is an accessibility bug worth reporting.",
        },
        {
          kind: "code",
          title: "getByTestId — the deliberate escape hatch",
          language: "ts",
          code: `
// <span data-testid="cart-count">2</span>
await expect(page.getByTestId('cart-count')).toHaveText('2');

// Configure a different attribute name if your app uses one:
// playwright.config.ts
//   use: { testIdAttribute: 'data-qa' }
`,
        },
        {
          kind: "table",
          title: "Which one, when",
          headers: ["Locator", "Best for", "Watch out for"],
          rows: [
            ["getByRole", "Buttons, links, headings, inputs — almost everything", "Requires semantic HTML"],
            ["getByLabel", "Form fields", "Substring matches sibling labels"],
            ["getByPlaceholder", "Unlabelled inputs", "Placeholders change with copy edits"],
            ["getByText", "Messages, static copy", "Brittle if the copy is edited often"],
            ["getByTestId", "Non-semantic widgets, counters, containers", "Invisible to users — no accessibility signal"],
            ["getByAltText", "Images", "Only images"],
            ["getByTitle", "Tooltips", "Rare"],
          ],
        },
        {
          kind: "diagram",
          title: "The decision order",
          ascii: `Is it interactive or has a role?      ──▶ getByRole
        │ no
Is it a labelled form field?          ──▶ getByLabel
        │ no
Is it identified by visible copy?     ──▶ getByText
        │ no
Is there a placeholder?               ──▶ getByPlaceholder
        │ no
Add a test id to the app              ──▶ getByTestId
        │ not possible
Scoped CSS as a last resort           ──▶ locator('[name="email"]')`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Test ids are not a failure",
          body: [
            "Role-based locators are the default, but a stable `data-testid` on a chart, a counter or a virtualised row is far better than a fragile CSS chain. What matters is that the hook is intentional and owned by the team.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "getByLabel('Password') matching two fields",
          body: "It substring-matches, so 'Confirm Password' also matches. Add `{ exact: true }`.",
        },
        {
          title: "Using getByText on a button",
          body: "It works, but `getByRole('button', { name })` also asserts that the element really is a button.",
        },
      ],
      keyTakeaways: [
        "Role → label → text → placeholder → test id → CSS.",
        "`exact: true` resolves the 'Password' vs. 'Confirm Password' trap.",
        "A deliberate test id beats a brittle CSS chain every time.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "The form has 'Password' and 'Confirm Password'. Why does this throw a strict mode violation?",
          code: `await page.getByLabel('Password').fill('Password123!');`,
          options: [
            { id: "a", text: "getByLabel does not support fill" },
            { id: "b", text: "'Password' substring-matches both labels" },
            { id: "c", text: "The field is disabled" },
            { id: "d", text: "The label is missing a for attribute" },
          ],
          correct: "b",
          explanation:
            "Use `page.getByLabel('Password', { exact: true })` to match only the first field.",
        },
        {
          id: "q2",
          type: "best-locator",
          prompt:
            "You need the cart badge: <span data-testid=\"cart-count\" class=\"css-9d2\">3</span>. Best locator?",
          options: [
            { id: "a", text: "page.getByText('3')" },
            { id: "b", text: "page.locator('.css-9d2')" },
            { id: "c", text: "page.getByTestId('cart-count')" },
            { id: "d", text: "page.getByRole('status')" },
          ],
          correct: "c",
          explanation:
            "The badge has no useful role and its text is the value under test. The test id is the stable, intentional hook.",
        },
      ],
      challenges: ["ch-locate-email"],
    },
    {
      id: "loc-css-xpath",
      slug: "css-and-xpath",
      title: "CSS, XPath and when to use them",
      moduleId: "locators",
      summary:
        "The lower-level escape hatches — powerful, occasionally necessary, easy to abuse.",
      difficulty: "intermediate",
      estimatedTime: 14,
      objectives: [
        "Write attribute-based CSS locators",
        "Recognise when XPath is genuinely required",
        "Avoid positional and structural selectors",
      ],
      sections: [
        {
          kind: "code",
          title: "CSS locators that are actually stable",
          language: "ts",
          code: `
page.locator('input[name="email"]');
page.locator('[data-product-category="audio"]');
page.locator('form[aria-label="Registration"] input[type="checkbox"]');
`,
          caption:
            "Attributes that describe purpose (name, type, data-*) are stable. Classes and generated ids are not.",
        },
        {
          kind: "compare",
          badLabel: "Structural — breaks on any layout change",
          goodLabel: "Semantic attribute",
          bad: `
page.locator('div.container > div:nth-child(2) > form > input:first-of-type');`,
          good: `
page.locator('input[name="email"]');`,
        },
        {
          kind: "text",
          title: "XPath",
          body: [
            "Playwright supports XPath, and it has one capability CSS lacks: walking *up* the tree with `..`. In practice, `filter()` and `has:` cover almost every case where people reach for XPath, and they read far better.",
          ],
        },
        {
          kind: "code",
          title: "XPath, and the Playwright equivalent",
          language: "ts",
          code: `
// XPath: find the row containing 'ORD-839472', then its Cancel button
page.locator("//tr[td[text()='ORD-839472']]//button[text()='Cancel']");

// Playwright equivalent — clearer and role-aware
page
  .getByRole('row')
  .filter({ hasText: 'ORD-839472' })
  .getByRole('button', { name: 'Cancel' });
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "XPath does not pierce shadow DOM",
          body: [
            "Playwright's CSS engine and getBy* locators pierce open shadow roots automatically. XPath does not. If you are testing web components, XPath will quietly fail to find things.",
          ],
        },
        {
          kind: "table",
          title: "Stability ranking",
          headers: ["Selector", "Stability", "Notes"],
          rows: [
            ["getByRole / getByLabel", "High", "Tied to user-visible semantics"],
            ["[data-testid]", "High", "Explicitly owned by the team"],
            ["[name], [type]", "Medium-high", "Part of the form contract"],
            ["Utility/CSS-in-JS classes", "Low", "Regenerated by the build"],
            ["nth-child, XPath positions", "Very low", "Break on any reorder"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Copying 'Copy selector' out of DevTools",
          body: "Browsers generate long structural paths that break the moment a wrapper div is added.",
        },
        {
          title: "Using XPath for text matching",
          body: "`getByText` handles whitespace normalisation and regex; XPath `text()` is exact-match and brittle.",
        },
      ],
      keyTakeaways: [
        "CSS on semantic attributes is fine; CSS on structure is not.",
        "Nearly every XPath is better expressed with filter() and chaining.",
        "XPath cannot pierce shadow DOM — Playwright's own engines can.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt:
            "The email input is <input id=\"input-837462\" data-session=\"a83jd92\" name=\"email\">, and the id changes on every load. Which two locators are safe?",
          options: [
            { id: "a", text: "#input-837462 and [data-session=\"a83jd92\"]" },
            { id: "b", text: "getByLabel('Email') and input[name=\"email\"]" },
            { id: "c", text: "input:nth-child(3) and .form-input" },
            { id: "d", text: "//input[@id='input-837462']" },
          ],
          correct: "b",
          explanation:
            "The label and the `name` attribute are part of the form's contract. The id and session token are regenerated on every render.",
        },
      ],
      challenges: ["ch-dynamic-locator"],
    },
    {
      id: "loc-chaining-filtering",
      slug: "chaining-and-filtering",
      title: "Chaining, filtering and nested locators",
      moduleId: "locators",
      summary:
        "How to say 'the Add to Cart button inside the Wireless Headphones card' — the single most useful locator skill.",
      difficulty: "intermediate",
      estimatedTime: 18,
      objectives: [
        "Scope a locator to a container",
        "Filter a collection by text or by a nested locator",
        "Use nth, first and last responsibly",
      ],
      sections: [
        {
          kind: "text",
          title: "Chaining narrows the search",
          body: [
            "Calling `.getByRole()` on a locator searches only inside that locator's matches. This is how you turn an ambiguous query into a precise one without touching the application.",
          ],
        },
        {
          kind: "code",
          title: "The pattern to memorise",
          language: "ts",
          code: `
const product = page
  .getByRole('article')
  .filter({ hasText: 'Wireless Headphones' });

await product.getByRole('button', { name: 'Add to Cart' }).click();
await expect(product.getByTestId('product-price')).toHaveText('$249.50');
`,
          caption:
            "Works no matter how many products are on the page, in any order.",
        },
        {
          kind: "code",
          title: "filter() options",
          language: "ts",
          code: `
// By text content (substring, case-insensitive)
rows.filter({ hasText: 'ORD-839472' });

// By regex
rows.filter({ hasText: /Total: \\$\\d+/ });

// By a descendant locator
rows.filter({ has: page.getByRole('button', { name: 'Cancel' }) });

// By the ABSENCE of something
rows.filter({ hasNot: page.getByText('Cancelled') });
rows.filter({ hasNotText: 'Cancelled' });
`,
        },
        {
          kind: "code",
          title: "Chained filters compose",
          language: "ts",
          code: `
const shippedHighValueOrders = page
  .getByRole('row')
  .filter({ hasText: 'Shipped' })
  .filter({ has: page.getByTestId('order-total-high') });

await expect(shippedHighValueOrders).toHaveCount(2);
`,
        },
        {
          kind: "text",
          title: "nth, first and last",
          body: [
            "These pick by position, so they only make sense when position is genuinely part of the requirement — 'the first search result', 'the last row'. Reaching for them to escape a strict mode violation is a smell.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Position used to dodge ambiguity",
          goodLabel: "Position used because it is the requirement",
          bad: `
await page.getByRole('button', { name: 'Add to Cart' }).nth(2).click();`,
          good: `
await expect(page.getByRole('article').first())
  .toContainText('Best Seller');`,
        },
        {
          kind: "code",
          title: "Counting and iterating",
          language: "ts",
          code: `
const items = page.getByTestId('cart-item');

await expect(items).toHaveCount(3);        // auto-retries

const count = await items.count();          // snapshot, no retry
for (let i = 0; i < count; i += 1) {
  await expect(items.nth(i)).toBeVisible();
}
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "count() does not wait",
          body: [
            "`await locator.count()` returns whatever matches right now — often 0 while a list is still rendering. Assert with `toHaveCount()` first; that one retries.",
          ],
        },
        {
          kind: "practice",
          href: "/practice/shop",
          title: "Practice on ShopEasy",
          body: "Product cards there carry regenerated `data-product-id` values, so chaining and filtering are the only reliable way to reach a specific card.",
        },
      ],
      commonMistakes: [
        {
          title: "filter({ hasText }) matching a substring you did not intend",
          body: "'Order 1' also matches 'Order 12'. Use a regex anchored with ^ and $ when it matters.",
        },
        {
          title: "Using `has:` with a page-level locator and expecting it to search globally",
          body: "The `has:` locator is resolved relative to the outer locator's matches, not the page.",
        },
      ],
      keyTakeaways: [
        "Chaining scopes a search; filtering selects among siblings.",
        "`filter({ has })` and `filter({ hasNot })` replace almost all XPath.",
        "`toHaveCount()` retries; `count()` does not.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt:
            "Six product cards each have an 'Add to Cart' button. You need the one in the Wireless Headphones card. Which is best?",
          options: [
            { id: "a", text: "page.getByRole('button', { name: 'Add to Cart' }).nth(1)" },
            { id: "b", text: "page.locator('[data-product-id=\"837462\"] button')" },
            {
              id: "c",
              text: "page.getByRole('article').filter({ hasText: 'Wireless Headphones' }).getByRole('button', { name: 'Add to Cart' })",
            },
            { id: "d", text: "page.getByText('Wireless Headphones').click()" },
          ],
          correct: "c",
          explanation:
            "It expresses the requirement directly and survives reordering and regenerated product ids.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "Which finds rows that do NOT contain a Cancel button?",
          options: [
            { id: "a", text: "rows.filter({ hasNot: page.getByRole('button', { name: 'Cancel' }) })" },
            { id: "b", text: "rows.not({ hasText: 'Cancel' })" },
            { id: "c", text: "rows.filter({ has: '!Cancel' })" },
            { id: "d", text: "rows.excluding('Cancel')" },
          ],
          correct: "a",
          explanation:
            "`hasNot` takes a locator; `hasNotText` is the text-based equivalent.",
        },
      ],
      playground: ["shopping"],
      challenges: ["ch-locator-chaining"],
    },
    {
      id: "loc-dynamic",
      slug: "dynamic-locators",
      title: "Surviving dynamic ids and generated attributes",
      moduleId: "locators",
      summary:
        "Modern frameworks regenerate ids and class names on every build. Here is how to test anyway.",
      difficulty: "intermediate",
      estimatedTime: 15,
      objectives: [
        "Recognise unstable attributes on sight",
        "Choose a stable alternative for each case",
        "Build locators from runtime data",
      ],
      sections: [
        {
          kind: "text",
          title: "The problem",
          body: [
            "Component libraries generate ids like `input-837462` or `:r7:`. CSS-in-JS emits classes like `css-1x9f7d`. Session tokens end up in `data-session` attributes. All of them change — sometimes on every page load, sometimes on every deploy.",
            "The Registration practice app in this platform regenerates these on purpose, so you can feel the failure mode before it bites you at work.",
          ],
        },
        {
          kind: "code",
          title: "What the practice app renders",
          language: "html",
          code: `
<label for="input-837462">Email</label>
<input
  id="input-837462"
  data-session="a83jd92"
  data-testid="registration-email"
  name="email"
  type="email"
/>
`,
        },
        {
          kind: "table",
          title: "Attribute triage",
          headers: ["Attribute", "Stable?", "Verdict"],
          rows: [
            ["id=\"input-837462\"", "No", "Regenerated per render — never use"],
            ["data-session=\"a83jd92\"", "No", "Per-session token — never use"],
            ["class=\"css-1x9f7d\"", "No", "Build-time hash — never use"],
            ["name=\"email\"", "Yes", "Part of the form contract"],
            ["data-testid=\"registration-email\"", "Yes", "Owned by the team"],
            ["<label>Email</label>", "Yes", "User-visible; use getByLabel"],
          ],
        },
        {
          kind: "compare",
          badLabel: "Passes once, fails tomorrow",
          goodLabel: "Three stable options",
          bad: `
page.locator('#input-837462');
page.locator('[data-session="a83jd92"]');
page.locator('.css-1x9f7d');`,
          good: `
page.getByLabel('Email');
page.locator('input[name="email"]');
page.getByTestId('registration-email');`,
        },
        {
          kind: "text",
          title: "When the value itself is dynamic",
          body: [
            "Sometimes the thing you need to match *is* generated — an order number, for example. Two techniques cover this: match with a regex pattern, or read the value at runtime and build the locator from it.",
          ],
        },
        {
          kind: "code",
          title: "Pattern matching",
          language: "ts",
          code: `
await expect(page.getByText(/^ORD-\\d{6}$/)).toBeVisible();

page.locator('[data-product-id]');            // attribute present, any value
page.locator('[id^="input-"]');               // starts with
page.locator('[class*="product-card"]');      // contains
`,
        },
        {
          kind: "code",
          title: "Capture at runtime, then use it",
          language: "ts",
          code: `
// Read the generated order number from the confirmation page…
const orderNumber = await page.getByTestId('order-number').textContent();

// …then find that exact order in the history.
await page.goto('/practice/shop/orders');

const row = page
  .getByRole('row')
  .filter({ hasText: orderNumber!.trim() });

await expect(row).toBeVisible();
`,
          caption:
            "This is the standard shape of an end-to-end assertion across pages.",
        },
        {
          kind: "callout",
          tone: "success",
          title: "The rule of thumb",
          body: [
            "If you cannot explain *why* an attribute will still be there after the next refactor, do not build a locator on it.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Recording a locator with codegen and never reviewing it",
          body: "Codegen sometimes falls back to a generated id. Always read what it produced and replace unstable parts.",
        },
        {
          title: "Hardcoding a captured value",
          body: "Copying `ORD-839472` into the test works exactly once. Capture it into a variable instead.",
        },
      ],
      keyTakeaways: [
        "Generated ids, hashed classes and session tokens are never valid hooks.",
        "Labels, `name` attributes and test ids are.",
        "For generated values, match with a regex or capture at runtime.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "This test passes locally and fails after every deploy. Why?",
          code: `await page.locator('#input-837462').fill('a@b.com');`,
          options: [
            { id: "a", text: "fill() cannot be used on inputs" },
            { id: "b", text: "The id is generated per render and changes" },
            { id: "c", text: "The locator needs await when created" },
            { id: "d", text: "# is not valid CSS in Playwright" },
          ],
          correct: "b",
          explanation:
            "Use `getByLabel('Email')`, `input[name=\"email\"]` or the test id instead.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt:
            "You need to verify an order that was just created, whose number is generated. What do you do?",
          options: [
            { id: "a", text: "Hardcode the order number seen during development" },
            { id: "b", text: "Read the number from the confirmation, then filter the history rows by it" },
            { id: "c", text: "Use .first() on the orders table" },
            { id: "d", text: "Skip verifying the number" },
          ],
          correct: "b",
          explanation:
            "Capturing at runtime is precise and independent of ordering or other tests' data.",
        },
      ],
      challenges: ["ch-dynamic-locator"],
      playground: ["registration"],
    },
    {
      id: "loc-strategy",
      slug: "locator-strategy",
      title: "Building a locator strategy for a team",
      moduleId: "locators",
      summary:
        "Turning individual good choices into a convention the whole suite follows.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Define a team-wide locator priority order",
        "Decide where locators live in the codebase",
        "Push accessibility fixes back into the product",
      ],
      sections: [
        {
          kind: "list",
          title: "A priority order worth adopting",
          ordered: true,
          items: [
            "`getByRole` with an accessible name.",
            "`getByLabel` for form fields.",
            "`getByText` for user-visible messages.",
            "`getByTestId` for elements with no useful semantics.",
            "CSS on semantic attributes (`[name]`, `[data-*]`).",
            "XPath — only for tree-walking that `filter()` cannot express.",
          ],
        },
        {
          kind: "text",
          title: "Locators belong in page objects",
          body: [
            "Scattering raw locators across 60 spec files means a single UI change causes 60 edits. Define each locator once, in a page object, and let specs read as workflows.",
          ],
        },
        {
          kind: "compare",
          badLabel: "Locator repeated across specs",
          goodLabel: "Locator owned by a page object",
          bad: `
// checkout.spec.ts
await page.getByRole('button', { name: 'Place Order' }).click();

// orders.spec.ts
await page.getByRole('button', { name: 'Place Order' }).click();`,
          good: `
// pages/CheckoutPage.ts
readonly placeOrder = this.page.getByRole('button', { name: 'Place Order' });

// specs
await checkoutPage.placeOrder.click();`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Automation pressure improves the product",
          body: [
            "If a control cannot be located by role or label, users of assistive technology cannot reach it either. File the accessibility bug rather than working around it with a CSS chain — you fix two problems at once.",
          ],
        },
        {
          kind: "table",
          title: "Signals that a locator needs rethinking",
          headers: ["Symptom", "Likely cause"],
          rows: [
            ["Frequent strict mode violations", "Locator is too broad — scope it"],
            ["Breaks after a styling PR", "Built on classes or generated ids"],
            ["Breaks when data changes", "Depends on position or on a specific record"],
            ["Needs .first() to pass", "Ambiguity papered over rather than resolved"],
            ["Long CSS chain", "Missing test id or missing semantics in the app"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Letting every engineer choose their own style",
          body: "Without a documented order, a suite ends up with five conventions and no way to review locator quality.",
        },
        {
          title: "Treating .first() as a fix",
          body: "It converts a loud, informative error into a silent, order-dependent bug.",
        },
      ],
      keyTakeaways: [
        "Write the priority order down and review locators in code review.",
        "Define each locator once, inside a page object.",
        "Hard-to-locate elements are usually an accessibility defect worth filing.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A locator needs `.first()` to stop failing. What is the healthiest response?",
          options: [
            { id: "a", text: "Keep .first() — it works" },
            { id: "b", text: "Scope the locator to the right container or filter it" },
            { id: "c", text: "Increase the timeout" },
            { id: "d", text: "Switch to XPath" },
          ],
          correct: "b",
          explanation:
            "Strict mode is reporting genuine ambiguity. Resolving it keeps the test meaningful when order changes.",
        },
      ],
    },
  ],
};

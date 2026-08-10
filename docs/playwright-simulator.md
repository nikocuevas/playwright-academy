# The Playwright simulator

`lib/playwright-simulator/` interprets a subset of the Playwright API against a
simulated application, in the browser, with no dependencies.

## Why it exists

Real browser automation cannot run inside a deployed web page, and requiring a
local install before anyone can write their first locator loses most learners at
step one. The simulator removes that barrier: you can write real Playwright
syntax, watch a browser-shaped panel react, and read a Playwright-shaped failure
— immediately, in any browser.

It is explicitly **not** a claim that Playwright is running. The playground
labels itself *Interactive simulation*, examples it cannot execute are labelled
*Reference only*, and the repository ships a real Playwright suite for the
genuine article.

## Pipeline

```text
learner's code
      │
      ▼
  parser.ts        statements → { root, calls: [{ name, args }] }
      │
      ▼
  runner.ts        orchestrates, holds variables, records steps
      │
      ├─▶ locator.ts      resolve(steps) → matched nodes
      ├─▶ actions.ts      perform(node, call) → new state
      └─▶ assertions.ts   evaluate(matcher, args, matches) → outcome
      │
      ▼
  app-state.ts     reducer: SimState × SimAction → SimState
  screens.ts       render(state) → SimNode tree
      │
      ▼
  SimulatedBrowser renders the tree and highlights resolved elements
```

## Parsing

The parser is not a JavaScript engine. It recognises the shapes a Playwright test
is made of:

```ts
await page.goto('/practice/shop');
const product = page.getByRole('article').filter({ hasText: 'Wireless Headphones' });
await product.getByRole('button', { name: 'Add to Cart' }).click();
await expect(page.getByTestId('cart-count')).toHaveText('1');
await expect(page.getByText('Gone')).not.toBeVisible();
```

It handles:

- `import` lines and a `test(...)` wrapper — the body is extracted and the
  wrapper ignored
- `await`, `const`/`let` assignment, and statement splitting on `;` at depth zero
- string, number, boolean, `null`, regex, array and object-literal arguments,
  including nested objects and trailing commas left behind by multi-line calls
- `expect(...)` with a locator, a page or a literal, and `.not` negation
- line and block comments

Failures raise `SimSyntaxError` with a line number, which the playground
highlights in the gutter.

## The simulated DOM

Screens are trees of `SimNode`:

```ts
type SimNode = {
  key: string;          // stable identity, used for highlighting
  role: SimRole;        // button, link, textbox, checkbox, article, row…
  text?: string;
  name?: string;        // explicit accessible name
  label?: string;
  placeholder?: string;
  testId?: string;
  attrs?: Record<string, string>;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: { value: string; label: string }[];
  action?: { type: string; payload?: Record<string, unknown> };
  field?: string;       // binds an input to application state
  children?: SimNode[];
};
```

Accessible names are computed in the order that matters in practice: explicit
name → label → own text → placeholder. Text matching normalises whitespace, is
case-insensitive by default, and supports regular expressions — the same rules
Playwright applies.

The registration screen is generated from
`lib/practice/registration-fields.ts`, the same module the real React form uses.
A locator that works in the simulator therefore works against the real page.

## Locator resolution

Supported: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`,
`getByTestId`, `getByAltText`, `getByTitle`, `locator` (CSS subset), `filter`,
`first`, `last`, `nth`.

Options: `name`, `exact`, `level`, `checked`, `disabled`, and `filter`'s
`hasText`, `hasNotText`, `has`, `hasNot`.

The CSS subset covers tag names, `#id`, `.class`, attribute selectors with
`=`, `^=`, `$=`, `*=`, `~=`, comma lists and descendant combinators — enough for
`input[name="email"]` and `[data-product-id]`, which is what the curriculum
teaches.

Two semantics are reproduced faithfully because lessons depend on them:

- **Scoping.** `page.getByRole()` may match the document root; `locator.getByRole()`
  only searches descendants.
- **Strict mode.** An action on a locator matching more than one element fails
  with a strict mode violation listing the matches — it does not silently take
  the first.

## Actions

`click`, `dblclick`, `fill`, `clear`, `check`, `uncheck`, `setChecked`,
`selectOption`, `press`, `hover`, `focus`, `blur`, `waitFor`,
`scrollIntoViewIfNeeded`.

Actions dispatch typed events into the reducer, so clicking *Add to Cart*
genuinely changes the cart, and the preview re-renders from the new state. They
also enforce the rules the lessons teach:

- `fill` on a non-input fails with an explanation
- `selectOption` on a non-`<select>` fails and points at click-then-click
- `uncheck` on a radio fails
- acting on a disabled element produces a timeout error whose reason is
  *element is not enabled*

## Assertions

Locator matchers: `toBeVisible`, `toBeHidden`, `toBeAttached`, `toHaveText`
(string, regex or array), `toContainText`, `toHaveValue`, `toBeEmpty`,
`toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toHaveCount`, `toHaveAttribute`,
`toHaveId`, `toBeEditable`.

Page matchers: `toHaveURL`, `toHaveTitle`.

Value matchers: `toBe`, `toEqual`, `toBeTruthy`, `toBeFalsy`, `toMatch`,
`toContain`, `toBeGreaterThan`, `toBeLessThan`, `toHaveLength`.

`.not` negates any of them.

## Simulated network

Actions record the requests the application would send:

| Action | Request |
| --- | --- |
| Sign in | `POST /api/auth/login` |
| Add to cart | `POST /api/cart` |
| Place order | `POST /api/orders` |
| Send message | `POST /api/messages` |
| Navigate to the shop | `GET /api/products` |

`page.waitForResponse()` and `page.waitForRequest()` match against that log, with
glob and regex support. When nothing matches, the error explains that the wait
must be registered before the action that triggers it — the exact mistake the
waiting module covers — and lists the requests that were actually observed.

## The error model

Errors are the product, not an afterthought. Every failure carries a title, a
Playwright-shaped message, and whichever of these apply: the locator, expected
vs. received, a reason, a call log, and a list of what exists on the page.

```text
✕ Strict mode violation

locator.click: strict mode violation: getByRole('button', { name: 'Add to Cart' })
resolved to 6 elements

REASON
A locator used for an action must match exactly one element. Scope it to a
container or use filter().

AVAILABLE ON THE PAGE
- button "Add to Cart"
- button "Add to Cart"
…
```

Unsupported APIs fail loudly and name what *is* supported. A silent no-op would
teach the wrong thing.

## Execution log and scrubbing

Every step records a timestamp, a label, the resolved element keys and a
**snapshot of the state after that step**. Clicking a step in the timeline
rewinds the preview to that moment and highlights the element the locator
resolved to. That is what makes the panel feel like a debugger rather than an
animation.

## Deliberate limitations

Not simulated: network interception (`page.route`), the `request` fixture,
multiple browser contexts, file uploads, drag and drop, dialogs, popups,
downloads, tracing, screenshots and real timing.

Scenarios needing these are marked `mode: "reference"` — the playground shows
the code, explains why it is not executed here, and points at
`npx playwright test`.

## Tests

`tests/unit/simulator.spec.ts` covers the parser, execution, both error shapes
and the guard on protected routes — and asserts that **every published scenario
solution actually passes**. A scenario whose solution stops working fails CI.

## Future work

- `page.route()` against the simulated request log
- Multiple contexts, to demonstrate isolation visually
- A locator picker in the preview that generates the recommended locator
- Auto-waiting animation, so retrying is visible rather than instantaneous

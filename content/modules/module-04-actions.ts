import type { Module } from "../types";

export const actionsModule: Module = {
  id: "actions",
  order: 4,
  title: "Actions",
  tagline: "Clicking, typing, checking, selecting, dragging, uploading",
  summary:
    "Everything a user can do to a page, plus the actionability checks Playwright runs before each action so you rarely need an explicit wait.",
  difficulty: "beginner",
  icon: "MousePointerClick",
  track: "core",
  lessons: [
    {
      id: "act-click-fill",
      slug: "click-fill-and-type",
      title: "click, fill and typing",
      moduleId: "actions",
      summary:
        "The two actions that make up most of a test suite — and the difference between fill and pressSequentially.",
      difficulty: "beginner",
      estimatedTime: 14,
      objectives: [
        "Use click with its common options",
        "Choose between fill and pressSequentially",
        "Clear a field correctly",
      ],
      sections: [
        {
          kind: "code",
          title: "click",
          language: "ts",
          code: `
await page.getByRole('button', { name: 'Register' }).click();

await page.getByRole('link', { name: 'Cart' }).click({ modifiers: ['Meta'] });
await page.getByTestId('product-card').click({ button: 'right' });
await page.getByRole('row').first().dblclick();
await page.getByRole('button', { name: 'Save' }).click({ timeout: 10_000 });
`,
        },
        {
          kind: "text",
          title: "What happens before the click",
          body: [
            "Playwright does not click blindly. Before dispatching the event it waits for the element to pass a series of **actionability checks**, retrying until they pass or the timeout expires.",
          ],
        },
        {
          kind: "list",
          title: "Actionability checks for click",
          ordered: true,
          items: [
            "**Attached** — the element is in the DOM.",
            "**Visible** — it has a non-empty bounding box and is not `visibility: hidden`.",
            "**Stable** — it has stopped moving for two animation frames.",
            "**Receives events** — a hit test at the click point actually reaches this element.",
            "**Enabled** — it is not disabled.",
          ],
        },
        {
          kind: "callout",
          tone: "success",
          title: "This is why sleeps are unnecessary",
          body: [
            "The 'receives events' check is the one that saves you: if a modal overlay or a sticky header covers the button, Playwright waits instead of clicking the overlay. Most `waitForTimeout` calls in a suite are compensating for a check Playwright already performs.",
          ],
        },
        {
          kind: "code",
          title: "fill — the right way to enter text",
          language: "ts",
          code: `
await page.getByLabel('Email').fill('testuser@example.com');

// Clearing
await page.getByLabel('Email').fill('');
await page.getByLabel('Email').clear();   // equivalent, more explicit
`,
          caption:
            "fill focuses the field, clears it, sets the value and dispatches an input event.",
        },
        {
          kind: "code",
          title: "pressSequentially — one key at a time",
          language: "ts",
          code: `
// Use only when the app reacts to individual keystrokes,
// e.g. a search box with a debounced autocomplete.
await page
  .getByPlaceholder('Search products')
  .pressSequentially('head', { delay: 100 });

await expect(page.getByRole('listbox')).toContainText('Wireless Headphones');
`,
        },
        {
          kind: "table",
          title: "fill vs. pressSequentially",
          headers: ["", "fill()", "pressSequentially()"],
          rows: [
            ["Speed", "Instant", "Slow — one key at a time"],
            ["Events", "input, change", "keydown/keypress/keyup per character"],
            ["Use for", "Almost everything", "Autocomplete, masked inputs, key handlers"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "`type()` is deprecated",
          body: [
            "Older tutorials use `locator.type()`. It has been replaced by `pressSequentially()`. For normal form entry, `fill()` is faster and more reliable.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Using pressSequentially everywhere",
          body: "It multiplies runtime for no benefit. Reach for it only when the app genuinely responds to individual keystrokes.",
        },
        {
          title: "Adding a sleep before a click",
          body: "Actionability checks already cover this. If a click still fails, read the error — it names the failing check.",
        },
      ],
      keyTakeaways: [
        "click runs five actionability checks before dispatching the event.",
        "fill is the default for text entry; pressSequentially is the exception.",
        "A failing click error tells you which check did not pass — read it.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A click fails with 'element intercepts pointer events'. What does that mean?",
          options: [
            { id: "a", text: "The element does not exist" },
            { id: "b", text: "Another element (often a modal or sticky header) covers it" },
            { id: "c", text: "The element is disabled" },
            { id: "d", text: "The page is still loading" },
          ],
          correct: "b",
          explanation:
            "The hit test at the click point resolved to a different element. Close the overlay or scroll, rather than forcing the click.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "A search box shows suggestions only after each keystroke. Which do you use?",
          options: [
            { id: "a", text: "fill()" },
            { id: "b", text: "pressSequentially()" },
            { id: "c", text: "press('Enter')" },
            { id: "d", text: "setInputFiles()" },
          ],
          correct: "b",
          explanation:
            "fill sets the value in one shot and may not trigger the per-key handlers the autocomplete listens to.",
        },
      ],
      playground: ["actions"],
      challenges: ["ch-fill-fields"],
    },
    {
      id: "act-checkbox-select",
      slug: "checkboxes-radios-and-selects",
      title: "Checkboxes, radio buttons and select menus",
      moduleId: "actions",
      summary:
        "check, uncheck, setChecked and selectOption — including the multi-select and native-vs-custom traps.",
      difficulty: "beginner",
      estimatedTime: 13,
      objectives: [
        "Toggle checkboxes and radios reliably",
        "Select options by value, label or index",
        "Handle custom dropdowns that are not <select>",
      ],
      sections: [
        {
          kind: "code",
          title: "Checkboxes and radios",
          language: "ts",
          code: `
await page.getByRole('checkbox', { name: 'Terms and Conditions' }).check();
await page.getByLabel('Subscribe to newsletter').uncheck();

// Idempotent — sets the state regardless of the current one
await page.getByLabel('Remember me').setChecked(true);

// Radios: check the one you want; the group handles the rest
await page.getByRole('radio', { name: 'Female' }).check();
`,
          caption:
            "check() verifies the resulting state for you and throws if the click did not take effect.",
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Do not use click() on a checkbox",
          body: [
            "`click()` toggles. If the box is already ticked, you untick it. `check()` is a no-op when the state is already correct, which makes the test order-independent.",
          ],
        },
        {
          kind: "code",
          title: "Native <select>",
          language: "ts",
          code: `
const country = page.getByLabel('Country');

await country.selectOption('CA');                  // by value
await country.selectOption({ label: 'Canada' });   // by visible label
await country.selectOption({ index: 2 });          // by position

// Multi-select
await page.getByLabel('Categories').selectOption(['audio', 'wearables']);

// Clear a multi-select
await page.getByLabel('Categories').selectOption([]);
`,
        },
        {
          kind: "code",
          title: "Custom dropdowns are not selects",
          language: "ts",
          code: `
// A div-based combobox: open it, then pick an option by role.
await page.getByRole('combobox', { name: 'Province' }).click();
await page.getByRole('option', { name: 'Ontario' }).click();

await expect(
  page.getByRole('combobox', { name: 'Province' }),
).toHaveText('Ontario');
`,
          caption:
            "`selectOption` only works on native <select>. Anything else needs click-then-click.",
        },
        {
          kind: "table",
          title: "Asserting the result",
          headers: ["Control", "Assertion"],
          rows: [
            ["Checkbox / radio", "await expect(box).toBeChecked()"],
            ["Native select", "await expect(select).toHaveValue('CA')"],
            ["Multi-select", "await expect(select).toHaveValues(['audio', 'wearables'])"],
            ["Custom combobox", "await expect(combo).toHaveText('Ontario')"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "selectOption on a custom dropdown",
          body: "It throws 'Element is not a <select> element'. Click to open, then click the option by role.",
        },
        {
          title: "Selecting by label when the label has trailing whitespace",
          body: "Label matching is exact after normalisation. If it fails, select by value instead.",
        },
      ],
      keyTakeaways: [
        "check/uncheck are idempotent; click is not.",
        "selectOption accepts value, label or index — and arrays for multi-select.",
        "Custom dropdowns need click-then-click-option.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "This step sometimes leaves the box unticked. Why?",
          code: `await page.getByLabel('Terms and Conditions').click();`,
          options: [
            { id: "a", text: "getByLabel does not work on checkboxes" },
            { id: "b", text: "click toggles, so a pre-ticked box becomes unticked" },
            { id: "c", text: "The label is not associated with the input" },
            { id: "d", text: "click needs a force option" },
          ],
          correct: "b",
          explanation:
            "Use `check()`, which sets the state and verifies it, making the step order-independent.",
        },
      ],
      playground: ["registration"],
      challenges: ["ch-select-country", "ch-accept-terms"],
    },
    {
      id: "act-keyboard-mouse",
      slug: "keyboard-and-mouse",
      title: "Keyboard, hover and drag",
      moduleId: "actions",
      summary:
        "press, keyboard shortcuts, hover, dragTo and the low-level mouse API.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Send key presses and shortcuts",
        "Test hover-revealed UI",
        "Perform a drag and drop",
      ],
      sections: [
        {
          kind: "code",
          title: "press and keyboard shortcuts",
          language: "ts",
          code: `
await page.getByPlaceholder('Search products').press('Enter');
await page.getByLabel('Email').press('Tab');

// Modifiers
await page.getByRole('textbox').press('Control+A');
await page.keyboard.press('Escape');

// Page-level typing (no specific element)
await page.keyboard.type('Hello');
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Cross-platform modifiers",
          body: [
            "Use `ControlOrMeta` so the same test works on macOS and Linux/Windows: `press('ControlOrMeta+A')`.",
          ],
        },
        {
          kind: "code",
          title: "hover",
          language: "ts",
          code: `
const card = page
  .getByRole('article')
  .filter({ hasText: 'Wireless Headphones' });

await card.hover();
await expect(card.getByRole('button', { name: 'Quick View' })).toBeVisible();
`,
        },
        {
          kind: "code",
          title: "Drag and drop",
          language: "ts",
          code: `
// High level — works for most HTML5 drag implementations
await page
  .getByTestId('task-card-1')
  .dragTo(page.getByTestId('column-done'));

// Low level — when the app uses custom pointer handling
const source = page.getByTestId('slider-handle');
const target = page.getByTestId('slider-track');

const box = (await target.boundingBox())!;
await source.hover();
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 10 });
await page.mouse.up();
`,
          caption:
            "The `steps` option matters: some libraries ignore a single instantaneous move.",
        },
        {
          kind: "code",
          title: "File upload",
          language: "ts",
          code: `
await page.getByLabel('Profile photo').setInputFiles('test-data/avatar.png');

// Multiple files
await page.getByLabel('Attachments').setInputFiles([
  'test-data/a.pdf',
  'test-data/b.pdf',
]);

// Clear the selection
await page.getByLabel('Profile photo').setInputFiles([]);

// Build a file in memory — no fixture file on disk
await page.getByLabel('Import CSV').setInputFiles({
  name: 'orders.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from('id,total\\nORD-1,49.99'),
});
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "force: true skips the safety net",
          body: [
            "`click({ force: true })` bypasses the actionability checks. It turns a clear failure into a click that lands somewhere unexpected. Use it only when you have proven the check itself is wrong.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Clicking a hidden file input",
          body: "`setInputFiles` works on the input directly — you never need to click it or automate the OS dialog.",
        },
        {
          title: "Dragging with a single mouse.move",
          body: "Many drag libraries need intermediate move events. Pass `{ steps: 10 }`.",
        },
      ],
      keyTakeaways: [
        "`ControlOrMeta` keeps shortcut tests portable across platforms.",
        "setInputFiles bypasses the native file dialog entirely.",
        "force: true disables the checks that make Playwright reliable.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "How do you upload a file to <input type=\"file\"> in Playwright?",
          options: [
            { id: "a", text: "Click it and automate the OS dialog" },
            { id: "b", text: "locator.setInputFiles('path/to/file')" },
            { id: "c", text: "locator.fill('path/to/file')" },
            { id: "d", text: "page.keyboard.type('path/to/file')" },
          ],
          correct: "b",
          explanation:
            "setInputFiles sets the files programmatically. No OS dialog is involved.",
        },
      ],
      playground: ["actions"],
    },
    {
      id: "act-navigation",
      slug: "navigation-and-dialogs",
      title: "Navigation, dialogs, tabs and downloads",
      moduleId: "actions",
      summary:
        "goto, reload, back/forward, native dialogs, popups and file downloads.",
      difficulty: "intermediate",
      estimatedTime: 12,
      objectives: [
        "Navigate and control history",
        "Handle alert, confirm and prompt",
        "Capture a popup window and a download",
      ],
      sections: [
        {
          kind: "code",
          title: "Navigation",
          language: "ts",
          code: `
await page.goto('/practice/shop');
await page.goto('/practice/shop', { waitUntil: 'domcontentloaded' });

await page.reload();
await page.goBack();
await page.goForward();
`,
        },
        {
          kind: "table",
          title: "waitUntil options",
          headers: ["Value", "Resolves when"],
          rows: [
            ["'load' (default)", "The load event has fired"],
            ["'domcontentloaded'", "The DOM is parsed — faster, usually enough"],
            ["'commit'", "The response headers arrived — fastest"],
            ["'networkidle'", "No network activity for 500 ms — discouraged, flaky on modern apps"],
          ],
        },
        {
          kind: "code",
          title: "Native dialogs",
          language: "ts",
          code: `
// Register the handler BEFORE triggering the dialog.
page.on('dialog', (dialog) => {
  expect(dialog.message()).toContain('Cancel this order?');
  return dialog.accept();
});

await page.getByRole('button', { name: 'Cancel Order' }).click();
`,
          caption:
            "Without a handler, Playwright auto-dismisses dialogs — which can make a test look like the confirm never happened.",
        },
        {
          kind: "code",
          title: "Popups and new tabs",
          language: "ts",
          code: `
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Invoice (PDF)' }).click(),
]);

await popup.waitForLoadState();
await expect(popup).toHaveTitle(/Invoice/);
`,
        },
        {
          kind: "code",
          title: "Downloads",
          language: "ts",
          code: `
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);

expect(download.suggestedFilename()).toBe('orders.csv');
await download.saveAs('./test-results/orders.csv');
`,
        },
      ],
      commonMistakes: [
        {
          title: "Registering the dialog handler after the click",
          body: "The dialog blocks the page. Register `page.on('dialog', ...)` first.",
        },
        {
          title: "Reaching for waitUntil: 'networkidle'",
          body: "Apps with polling, analytics or websockets never go idle. Assert on a visible element instead.",
        },
      ],
      keyTakeaways: [
        "Register dialog and popup handlers before the action that triggers them.",
        "`domcontentloaded` is usually the right waitUntil.",
        "Downloads and popups both arrive as events, captured with Promise.all.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "The confirm dialog is never accepted. Why?",
          code: `await page.getByRole('button', { name: 'Delete' }).click();
page.on('dialog', (d) => d.accept());`,
          options: [
            { id: "a", text: "accept() must be awaited" },
            { id: "b", text: "The handler is registered after the dialog appeared" },
            { id: "c", text: "Playwright cannot handle confirm dialogs" },
            { id: "d", text: "The locator is wrong" },
          ],
          correct: "b",
          explanation:
            "By the time the listener attaches, Playwright has already auto-dismissed the dialog. Register it first.",
        },
      ],
    },
  ],
};

import type { Module } from "../types";

export const registrationModule: Module = {
  id: "registration-practice",
  order: 7,
  title: "Registration Practice",
  tagline: "Automate a real form with hostile, regenerating attributes",
  summary:
    "Apply locators, actions and assertions to the Registration practice app — a form deliberately built with unstable ids, client-side validation and an async submit.",
  difficulty: "beginner",
  icon: "ClipboardList",
  track: "core",
  lessons: [
    {
      id: "reg-tour",
      slug: "touring-the-registration-app",
      title: "Touring the Registration app",
      moduleId: "registration-practice",
      summary:
        "What the form contains, what it validates, and which attributes you are allowed to rely on.",
      difficulty: "beginner",
      estimatedTime: 12,
      objectives: [
        "Describe every field and its control type",
        "Identify the stable and unstable attributes",
        "Understand the validation rules you will be testing",
      ],
      sections: [
        {
          kind: "practice",
          href: "/practice/registration",
          title: "Open the app in another tab",
          body: "Keep it side by side while you work through this module. The Regenerate attributes button shows you exactly what changes on every render.",
        },
        {
          kind: "table",
          title: "The form",
          headers: ["Field", "Control", "Rules"],
          rows: [
            ["First Name / Last Name", "textbox", "Required"],
            ["Email", "textbox (type=email)", "Required, must contain @ and a domain"],
            ["Phone", "textbox (type=tel)", "Optional, 10–15 digits when provided"],
            ["Password", "password", "Required, min 8 chars, 1 number, 1 letter"],
            ["Confirm Password", "password", "Must equal Password"],
            ["Date of Birth", "date", "Required, must be at least 18 years ago"],
            ["Gender", "radio group", "Male / Female / Other"],
            ["Country", "select (combobox)", "Required"],
            ["Address / City / Postal Code", "textbox", "Required"],
            ["Terms and Conditions", "checkbox", "Must be checked"],
          ],
        },
        {
          kind: "code",
          title: "What one field renders as",
          language: "html",
          code: `
<label for="input-837462">Email</label>
<input
  id="input-837462"
  data-session="a83jd92"
  data-testid="registration-email"
  name="email"
  type="email"
  aria-required="true"
/>
`,
        },
        {
          kind: "list",
          title: "The rules of engagement",
          items: [
            "`id` and `data-session` are regenerated on every render — **never** locate by them.",
            "`name`, `data-testid`, the label text and the role are stable — use those.",
            "Validation runs on submit, and error messages are linked with `aria-describedby`.",
            "Submission is asynchronous with a short delay, so the success panel appears after a moment.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Prove it to yourself",
          body: [
            "Open the app, note the email field's id, press Regenerate attributes, and look again. Any test built on that id was correct for exactly one render.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Recording once with codegen and shipping it",
          body: "Codegen may pick the generated id. Always review and replace it with a label or test id.",
        },
      ],
      keyTakeaways: [
        "The stable hooks are label, role, name and data-testid.",
        "Validation is on submit; errors are associated with their fields.",
        "Submission is async — assert on the success panel, do not sleep.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt: "Which locator for the Email field will still work tomorrow?",
          options: [
            { id: "a", text: "page.locator('#input-837462')" },
            { id: "b", text: "page.locator('[data-session=\"a83jd92\"]')" },
            { id: "c", text: "page.getByLabel('Email')" },
            { id: "d", text: "page.locator('input').nth(2)" },
          ],
          correct: "c",
          explanation:
            "The label is part of the user-facing contract. The id and session token are regenerated on every render.",
        },
      ],
      playground: ["registration"],
    },
    {
      id: "reg-happy-path",
      slug: "automating-the-happy-path",
      title: "Automating the happy path",
      moduleId: "registration-practice",
      summary: "Fill every field, submit, and verify the personalised success message.",
      difficulty: "beginner",
      estimatedTime: 16,
      objectives: [
        "Fill text, date, radio, select and checkbox controls",
        "Submit and assert on the confirmation",
        "Keep the test readable with test data objects",
      ],
      sections: [
        {
          kind: "code",
          title: "The complete test",
          language: "ts",
          code: `
import { test, expect } from '@playwright/test';

const newUser = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.lovelace@example.com',
  phone: '4165550199',
  password: 'Password123!',
  dateOfBirth: '1990-12-10',
  country: 'CA',
  address: '12 Analytical Way',
  city: 'Toronto',
  postalCode: 'M5V 2T6',
};

test('registers a new account', async ({ page }) => {
  await page.goto('/practice/registration');

  await page.getByLabel('First Name').fill(newUser.firstName);
  await page.getByLabel('Last Name').fill(newUser.lastName);
  await page.getByLabel('Email').fill(newUser.email);
  await page.getByLabel('Phone').fill(newUser.phone);
  await page.getByLabel('Password', { exact: true }).fill(newUser.password);
  await page.getByLabel('Confirm Password').fill(newUser.password);
  await page.getByLabel('Date of Birth').fill(newUser.dateOfBirth);

  await page.getByRole('radio', { name: 'Female' }).check();
  await page.getByLabel('Country').selectOption(newUser.country);

  await page.getByLabel('Address').fill(newUser.address);
  await page.getByLabel('City').fill(newUser.city);
  await page.getByLabel('Postal Code').fill(newUser.postalCode);

  await page.getByRole('checkbox', { name: /Terms and Conditions/ }).check();

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(
    page.getByRole('heading', { name: 'Registration successful!' }),
  ).toBeVisible();

  await expect(page.getByTestId('registration-welcome')).toHaveText(
    'Welcome, Ada.',
  );
});
`,
        },
        {
          kind: "list",
          title: "Details worth noticing",
          items: [
            "`getByLabel('Password', { exact: true })` — without `exact`, 'Confirm Password' also matches.",
            "Date inputs take an ISO string: `fill('1990-12-10')`.",
            "`check()` rather than `click()` on the radio and the checkbox, so the step is idempotent.",
            "The terms label contains a link, so a regex name match is more robust than an exact string.",
            "No waits anywhere — the assertion polls until the async submit completes.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Unique data per run",
          body: [
            "Real registration forms reject duplicate emails. Generate uniqueness rather than hardcoding: `` const email = `qa+${Date.now()}@example.com` ``.",
          ],
        },
        {
          kind: "code",
          title: "The same test as a page object",
          language: "ts",
          code: `
const registration = new RegistrationPage(page);

await registration.goto();
await registration.fillForm(newUser);
await registration.submit();

await expect(registration.successHeading).toBeVisible();
`,
          caption:
            "You will build this class in the Page Object Model module.",
        },
      ],
      commonMistakes: [
        {
          title: "getByLabel('Password') without exact",
          body: "Strict mode violation — it matches both password fields.",
        },
        {
          title: "Typing a date as '10/12/1990'",
          body: "A native date input expects the ISO format regardless of display locale.",
        },
      ],
      keyTakeaways: [
        "Test data belongs in an object, not inline in the steps.",
        "exact: true disambiguates overlapping labels.",
        "Assert on the confirmation; never sleep after submit.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What value should you pass to fill() for a native date input?",
          options: [
            { id: "a", text: "'10/12/1990'" },
            { id: "b", text: "'1990-12-10'" },
            { id: "c", text: "'December 10, 1990'" },
            { id: "d", text: "new Date('1990-12-10')" },
          ],
          correct: "b",
          explanation:
            "Date inputs use the ISO yyyy-mm-dd format internally, whatever the browser displays.",
        },
      ],
      playground: ["registration"],
      challenges: ["ch-fill-fields", "ch-select-country", "ch-accept-terms", "ch-register-submit"],
    },
    {
      id: "reg-validation",
      slug: "testing-validation-and-negative-paths",
      title: "Validation and negative paths",
      moduleId: "registration-practice",
      summary:
        "The interesting tests are the ones that are supposed to fail — and there are more of them than happy paths.",
      difficulty: "intermediate",
      estimatedTime: 15,
      objectives: [
        "Assert on field-level error messages",
        "Drive negative cases from a data table",
        "Check accessibility wiring of errors",
      ],
      sections: [
        {
          kind: "code",
          title: "One rule per test",
          language: "ts",
          code: `
test('rejects mismatched passwords', async ({ page }) => {
  await page.goto('/practice/registration');

  await page.getByLabel('Password', { exact: true }).fill('Password123!');
  await page.getByLabel('Confirm Password').fill('Different123!');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByText('Passwords do not match')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Registration successful!' }),
  ).toBeHidden();
});
`,
          caption:
            "Asserting that success did NOT happen is as important as asserting the error text.",
        },
        {
          kind: "code",
          title: "Data-driven negative cases",
          language: "ts",
          code: `
const invalidEmails = [
  { value: 'not-an-email', reason: 'no @ sign' },
  { value: 'missing@domain', reason: 'no top-level domain' },
  { value: '@example.com', reason: 'no local part' },
];

for (const { value, reason } of invalidEmails) {
  test(\`rejects email with \${reason}\`, async ({ page }) => {
    await page.goto('/practice/registration');
    await page.getByLabel('Email').fill(value);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });
}
`,
          caption:
            "Each iteration becomes a separate test with its own name in the report.",
        },
        {
          kind: "code",
          title: "Verifying the error is wired up accessibly",
          language: "ts",
          code: `
const email = page.getByLabel('Email');

await expect(email).toHaveAttribute('aria-invalid', 'true');

const describedBy = await email.getAttribute('aria-describedby');
await expect(page.locator(\`#\${describedBy}\`)).toHaveText(
  'Enter a valid email address',
);
`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Negative tests outnumber positive ones",
          body: [
            "A ten-field form has one happy path and dozens of ways to fail. Cover the rules that carry business risk — password policy, age gate, terms acceptance — and drive the rest from a table.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only asserting that the error appeared",
          body: "Also assert that the submission did not succeed. An app can show an error and still register the user.",
        },
        {
          title: "One giant test covering every validation rule",
          body: "The first failure hides the rest, and the report tells you nothing about which rule broke.",
        },
      ],
      keyTakeaways: [
        "One validation rule per test keeps failures diagnosable.",
        "Loop over a data table to generate negative cases.",
        "Assert both the error and the absence of success.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why assert `toBeHidden()` on the success heading in a negative test?",
          options: [
            { id: "a", text: "It makes the test longer" },
            { id: "b", text: "An app can show a validation error and still submit — this catches that" },
            { id: "c", text: "Playwright requires two assertions" },
            { id: "d", text: "It speeds the test up" },
          ],
          correct: "b",
          explanation:
            "Showing an error and performing the action anyway is a real bug class. Assert the outcome, not just the message.",
        },
      ],
      challenges: ["ch-validation-errors"],
    },
  ],
};

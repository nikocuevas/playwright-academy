import { test, expect } from "../../playwright/fixtures/test";
import { newRegistration } from "../../playwright/test-data/users";

test.describe("Registration", () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  test("registers a new account and greets the user by name", async ({
    registrationPage,
  }) => {
    const user = newRegistration({ firstName: "Ada" });

    await registrationPage.fillForm(user);
    await registrationPage.acceptTermsAndSubmit();

    await expect(registrationPage.successHeading).toBeVisible();
    await expect(registrationPage.welcome).toHaveText("Welcome, Ada.");
  });

  test("rejects mismatched passwords and does not register", async ({
    registrationPage,
  }) => {
    await registrationPage.fillForm(newRegistration());
    await registrationPage.confirmPassword.fill("Different123!");
    await registrationPage.acceptTermsAndSubmit();

    await expect(registrationPage.errorFor("Passwords do not match")).toBeVisible();
    await expect(registrationPage.successHeading).toBeHidden();
  });

  test("requires the terms checkbox", async ({ registrationPage }) => {
    await registrationPage.fillForm(newRegistration());
    await registrationPage.register.click();

    await expect(
      registrationPage.errorFor("You must accept the Terms and Conditions"),
    ).toBeVisible();
    await expect(registrationPage.successHeading).toBeHidden();
  });

  test("rejects an under-age date of birth", async ({ registrationPage }) => {
    await registrationPage.fillForm(
      newRegistration({ dateOfBirth: "2015-01-01" }),
    );
    await registrationPage.acceptTermsAndSubmit();

    await expect(
      registrationPage.errorFor("You must be at least 18 years old"),
    ).toBeVisible();
  });

  // One test per rule keeps the failure message meaningful.
  const invalidEmails = [
    { value: "not-an-email", reason: "no @ sign" },
    { value: "missing@domain", reason: "no top-level domain" },
    { value: "@example.com", reason: "no local part" },
  ];

  for (const { value, reason } of invalidEmails) {
    test(`rejects an email with ${reason}`, async ({ registrationPage }) => {
      await registrationPage.fillForm(newRegistration({ email: value }));
      await registrationPage.acceptTermsAndSubmit();

      await expect(
        registrationPage.errorFor("Enter a valid email address"),
      ).toBeVisible();
    });
  }

  test("required fields are reported when the form is empty", async ({
    registrationPage,
  }) => {
    await registrationPage.register.click();

    await expect(registrationPage.errorFor("First Name is required")).toBeVisible();
    await expect(registrationPage.errorFor("Email is required")).toBeVisible();
  });
});

test.describe("Dynamic locators", () => {
  test("stable locators survive an attribute regeneration", async ({
    page,
    registrationPage,
  }) => {
    await registrationPage.goto();

    const idBefore = await registrationPage.email.getAttribute("id");
    await registrationPage.regenerate.click();
    const idAfter = await registrationPage.email.getAttribute("id");

    // The generated id really does change — which is why no locator uses it.
    expect(idBefore).not.toBe(idAfter);

    const byLabel = page.getByLabel("Email");
    const byName = page.locator('input[name="email"]');
    const byTestId = page.getByTestId("registration-email");

    for (const locator of [byLabel, byName, byTestId]) {
      await expect(locator).toBeVisible();
      await locator.fill("ada@example.com");
      await expect(locator).toHaveValue("ada@example.com");
      await locator.clear();
    }
  });

  test("errors are wired up accessibly", async ({ page, registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.email.fill("not-an-email");
    await registrationPage.register.click();

    const email = page.getByLabel("Email");
    await expect(email).toHaveAttribute("aria-invalid", "true");

    const describedBy = await email.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toHaveText(
      "Enter a valid email address",
    );
  });
});

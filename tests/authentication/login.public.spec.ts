import { test, expect } from "../../playwright/fixtures/test";
import { invalidUser, validUser } from "../../playwright/test-data/users";

/**
 * The storageState pattern removes repetition, not coverage — the login flow
 * itself still gets a dedicated, unauthenticated spec.
 */
test.describe("Login", () => {
  test("signs in with valid credentials", async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);

    await loginPage.expectSignedIn(validUser.fullName);
    await expect(page).toHaveURL(/\/practice\/shop$/);
  });

  test("rejects invalid credentials without navigating", async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(invalidUser.email, invalidUser.password);

    await expect(loginPage.error).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("account-name")).toBeHidden();
  });

  test("reports missing credentials", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submit.click();

    await expect(loginPage.error).toHaveText("Email and password are required");
  });

  test("redirects anonymous visitors away from protected pages", async ({
    page,
  }) => {
    await page.goto("/practice/shop/orders");
    await expect(page).toHaveURL(/\/practice\/shop\/login/);
  });

  test("signing out clears the session", async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await loginPage.expectSignedIn(validUser.fullName);

    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByTestId("account-name")).toBeHidden();
  });
});

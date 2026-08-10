import { test, expect } from "../../playwright/fixtures/test";
import { validUser } from "../../playwright/test-data/users";

/**
 * These tests run in the authenticated project, so they start with the session
 * captured by tests/auth.setup.ts. No login step appears anywhere.
 */
test.describe("Reused authentication", () => {
  test("protected pages open directly", async ({ page, ordersPage }) => {
    await ordersPage.goto();

    await expect(ordersPage.heading).toBeVisible();
    await expect(page.getByTestId("account-name")).toContainText(
      validUser.fullName,
    );
  });

  test("the saved state contains a session cookie", async ({ page }) => {
    await page.goto("/practice/shop");

    const cookies = await page.context().cookies();
    const identity = cookies.find((cookie) => cookie.name === "shopeasy_user");

    expect(identity, "the storageState file should carry the identity cookie").toBeTruthy();
    expect(identity?.httpOnly).toBe(true);
  });

  test("the API shares the browser session", async ({ page, request }) => {
    await page.goto("/practice/shop");

    const response = await request.get("/api/auth/session");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.authenticated).toBe(true);
    expect(body.user.email).toBe(validUser.email);
  });
});

test.describe("Opting out of the shared session", () => {
  // test.use overrides the fixture option for this describe block only.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("an anonymous context is redirected to login", async ({ page }) => {
    await page.goto("/practice/shop/messages");
    await expect(page).toHaveURL(/\/practice\/shop\/login/);
  });
});

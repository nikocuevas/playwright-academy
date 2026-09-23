import { test, expect } from "../../playwright/fixtures/test";
import { invalidIgamingUser, validIgamingUser } from "../../playwright/test-data/igaming-users";

/**
 * Runs signed out, same as the ShopEasy login spec — the iGaming practice app
 * has its own independent session cookies, so no storageState is involved.
 */
test.describe("iGaming login", () => {
  test("signs in with valid credentials", async ({ page, igamingPage }) => {
    await igamingPage.login(validIgamingUser.email, validIgamingUser.password);

    await expect(igamingPage.accountName).toContainText(validIgamingUser.username);
    await expect(page).toHaveURL(/\/practice\/igaming$/);
  });

  test("rejects invalid credentials without navigating", async ({
    page,
    igamingPage,
  }) => {
    await igamingPage.login(invalidIgamingUser.email, invalidIgamingUser.password);

    await expect(
      page.getByRole("form", { name: "Sign in" }).getByRole("alert"),
    ).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
    await expect(igamingPage.accountName).toBeHidden();
  });

  test("reports missing credentials", async ({ page, igamingPage }) => {
    await igamingPage.gotoLogin();
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(
      page.getByRole("form", { name: "Sign in" }).getByRole("alert"),
    ).toHaveText("Email and password are required");
  });

  test("redirects anonymous visitors away from protected pages", async ({ page }) => {
    await page.goto("/practice/igaming/history");
    await expect(page).toHaveURL(/\/practice\/igaming\/login/);
  });
});

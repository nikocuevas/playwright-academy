import { test as setup, expect } from "@playwright/test";
import path from "node:path";
import { LoginPage } from "../playwright/pages/LoginPage";
import { validUser } from "../playwright/test-data/users";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

/**
 * Signs in once for the whole run and saves the session.
 *
 * The assertion between the click and the save is not optional: without it you
 * can capture the state before the session cookie exists, producing a file that
 * looks valid and authenticates nothing.
 */
setup("authenticate", async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login(validUser.email, validUser.password);
  await login.expectSignedIn(validUser.fullName);

  await expect(page).toHaveURL(/\/practice\/shop$/);

  // Keep the identity cookie, drop the per-context data cookie. Every test then
  // starts signed in but with its own empty cart, so parallel workers cannot
  // interfere with each other.
  await page.context().clearCookies({ name: "shopeasy_session" });

  await page.context().storageState({ path: authFile });
});

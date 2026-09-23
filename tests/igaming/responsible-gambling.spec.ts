import { test, expect } from "../../playwright/fixtures/test";
import { validIgamingUser } from "../../playwright/test-data/igaming-users";
import { markets } from "../../lib/practice/igaming-data";

test.describe("Responsible gambling", () => {
  test.beforeEach(async ({ igamingPage }) => {
    await igamingPage.login(validIgamingUser.email, validIgamingUser.password);
  });

  test("self-exclusion blocks further bet placement", async ({ igamingPage }) => {
    await igamingPage.selfExclude();

    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];
    await igamingPage.placeBet(market.label, option.label, 5);

    await expect(igamingPage.betError).toContainText(/self-excluded/i);
  });

  test("self-exclusion blocks deposits at the API layer, not just the UI", async ({
    page,
    igamingPage,
  }) => {
    await igamingPage.selfExclude();

    const response = await page.request.post("/api/igaming/wallet", {
      data: { action: "deposit", amount: 20 },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/self-excluded/i);
  });

  test("a deposit limit can be set and is reflected on the page", async ({ igamingPage }) => {
    await igamingPage.setDepositLimit(75);
    await expect(igamingPage.page.getByTestId("limit-saved")).toBeVisible();
    await expect(igamingPage.page.getByText("$75.00 / day")).toBeVisible();
  });
});

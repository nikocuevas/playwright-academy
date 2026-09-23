import { test, expect } from "../../playwright/fixtures/test";
import { validIgamingUser } from "../../playwright/test-data/igaming-users";

test.describe("iGaming wallet", () => {
  test.beforeEach(async ({ igamingPage }) => {
    await igamingPage.login(validIgamingUser.email, validIgamingUser.password);
  });

  test("depositing increases the wallet balance", async ({ igamingPage }) => {
    const before = await igamingPage.dashboardBalance.textContent();

    await igamingPage.deposit(50);

    await expect(igamingPage.depositConfirmation).toBeVisible();
    await expect(igamingPage.dashboardBalance).not.toHaveText(before ?? "");
  });

  test("a deposit exceeding the configured daily limit is rejected", async ({
    igamingPage,
  }) => {
    await igamingPage.setDepositLimit(20);
    await igamingPage.goto();

    await igamingPage.deposit(50);

    await expect(igamingPage.depositError).toContainText("deposit limit");
  });

  test("a duplicate deposit callback with the same idempotency key is applied only once", async ({
    page,
    igamingPage,
  }) => {
    await igamingPage.goto();
    const key = `dup-deposit-${Date.now()}`;

    const first = await page.request.post("/api/igaming/wallet", {
      data: { action: "deposit", amount: 40, idempotencyKey: key },
    });
    expect(first.ok()).toBeTruthy();
    const firstBody = await first.json();

    const second = await page.request.post("/api/igaming/wallet", {
      data: { action: "deposit", amount: 40, idempotencyKey: key },
    });
    expect(second.ok()).toBeTruthy();
    const secondBody = await second.json();

    expect(
      secondBody.wallet.balance,
      "a repeated payment callback must not credit the wallet twice",
    ).toBe(firstBody.wallet.balance);
  });

  test("withdrawing more than the balance is rejected", async ({ page, igamingPage }) => {
    await igamingPage.goto();

    const response = await page.request.post("/api/igaming/wallet", {
      data: { action: "withdraw", amount: 999_999 },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/insufficient/i);
  });
});

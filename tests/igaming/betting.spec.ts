import { test, expect } from "../../playwright/fixtures/test";
import { validIgamingUser } from "../../playwright/test-data/igaming-users";
import { markets } from "../../lib/practice/igaming-data";

test.describe("iGaming betting", () => {
  test.beforeEach(async ({ igamingPage }) => {
    await igamingPage.login(validIgamingUser.email, validIgamingUser.password);
  });

  test("placing a bet debits the stake from the wallet", async ({ igamingPage }) => {
    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];

    const before = await igamingPage.dashboardBalance.textContent();
    await igamingPage.placeBet(market.label, option.label, 10);

    await expect(igamingPage.betConfirmation).toBeVisible();
    await expect(igamingPage.dashboardBalance).not.toHaveText(before ?? "");
  });

  test("a stake larger than the balance is rejected", async ({ igamingPage }) => {
    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];

    await igamingPage.placeBet(market.label, option.label, 100_000);

    await expect(igamingPage.betError).toContainText(/insufficient/i);
  });

  test("submitting the same bet twice with one idempotency key creates only one bet", async ({
    page,
    igamingPage,
  }) => {
    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];
    const key = `dup-bet-${Date.now()}`;

    const first = await page.request.post("/api/igaming/bets", {
      data: { marketId: market.id, optionId: option.id, stake: 10, idempotencyKey: key },
    });
    expect(first.ok()).toBeTruthy();
    const firstBet = (await first.json()).bet;

    // Simulates a double-clicked "Place Bet" button sending the request twice.
    const second = await page.request.post("/api/igaming/bets", {
      data: { marketId: market.id, optionId: option.id, stake: 10, idempotencyKey: key },
    });
    expect(second.ok()).toBeTruthy();
    const secondBet = (await second.json()).bet;

    expect(secondBet.id).toBe(firstBet.id);

    const betsResponse = await page.request.get("/api/igaming/bets");
    const { bets } = await betsResponse.json();
    expect(
      bets.filter((b: { id: string }) => b.id === firstBet.id),
      "only one bet row should exist for the duplicated request",
    ).toHaveLength(1);
  });

  test("settling a bet as a win credits the payout, and cannot be settled twice", async ({
    page,
    igamingPage,
  }) => {
    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];

    const placed = await page.request.post("/api/igaming/bets", {
      data: { marketId: market.id, optionId: option.id, stake: 10 },
    });
    const { bet } = await placed.json();

    const settled = await page.request.post(`/api/igaming/bets/${bet.id}/settle`, {
      data: { outcome: "win" },
    });
    expect(settled.ok()).toBeTruthy();
    const settledBody = await settled.json();
    expect(settledBody.bet.status).toBe("settled");
    expect(settledBody.bet.payout).toBeGreaterThan(0);

    const again = await page.request.post(`/api/igaming/bets/${bet.id}/settle`, {
      data: { outcome: "win" },
    });
    expect(again.status()).toBe(400);
  });

  test("a losing bet is settled without crediting a payout", async ({ page, igamingPage }) => {
    await igamingPage.goto();
    const market = markets[0];
    const option = market.options[0];

    const placed = await page.request.post("/api/igaming/bets", {
      data: { marketId: market.id, optionId: option.id, stake: 10 },
    });
    const { bet } = await placed.json();

    const settled = await page.request.post(`/api/igaming/bets/${bet.id}/settle`, {
      data: { outcome: "lose" },
    });
    const settledBody = await settled.json();
    expect(settledBody.bet.status).toBe("settled");
    expect(settledBody.bet.payout).toBe(0);
  });
});

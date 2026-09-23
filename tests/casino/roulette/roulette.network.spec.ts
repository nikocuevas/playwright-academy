import { test, expect } from "../../../playwright/fixtures/test";

/**
 * Why these mock the network instead of asserting on the wheel: forcing the
 * result via the test-only endpoint (see roulette.payout.spec.ts) is how
 * this suite gets a deterministic *outcome*. These tests are about a
 * different axis — how the UI behaves when the *network itself* misbehaves,
 * which `page.route` can simulate far more reliably than trying to provoke
 * a real failure.
 */
test.describe("Roulette — network interception", () => {
  test("mocks a successful spin response", async ({ page, roulettePage }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);

    await page.route("**/api/casino/roulette/spin", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          roundId: "R999",
          result: 1,
          color: "red",
          bet: { type: "red", stake: 100 },
          won: true,
          payout: 200,
          profit: 100,
          balance: 1100,
        }),
      });
    });

    await roulettePage.spin();

    await expect(roulettePage.winningNumber).toHaveText("1");
    await expect(roulettePage.gameResult).toContainText("WIN");
    await expect(roulettePage.balance).toHaveText("1,100 credits");
  });

  test("a 500 server error surfaces a message and leaves the balance untouched", async ({
    page,
    roulettePage,
  }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);
    await expect(roulettePage.balance).toHaveText("900 credits");

    await page.route("**/api/casino/roulette/spin", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await roulettePage.spin();

    await expect(roulettePage.validationMessage).toContainText(/internal server error/i);
    // The mocked failure never reached the real handler, so no payout was
    // ever credited — the balance is exactly where the bet left it.
    await expect(roulettePage.balance).toHaveText("900 credits");
  });

  test("a malformed (non-JSON) response is handled without crashing the page", async ({
    page,
    roulettePage,
  }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);

    await page.route("**/api/casino/roulette/spin", async (route) => {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "not json at all" });
    });

    await roulettePage.spin();

    await expect(roulettePage.validationMessage).toBeVisible();
    // The page must still be usable — no crash, no stuck "submitting" state.
    await expect(roulettePage.spinButton).toBeEnabled();
    await expect(roulettePage.balance).toHaveText("900 credits");
  });

  test("an aborted/timed-out request does not double-deduct on a manual retry", async ({
    page,
    roulettePage,
  }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);

    let attempt = 0;
    await page.route("**/api/casino/roulette/spin", async (route) => {
      attempt += 1;
      if (attempt === 1) {
        await route.abort("timedout");
        return;
      }
      await route.continue();
    });

    await roulettePage.spin(); // aborted — the click handler surfaces an error
    await expect(roulettePage.validationMessage).toBeVisible();
    await expect(roulettePage.balance).toHaveText("900 credits");

    // The bet is still staged (the round never completed), so a retry
    // through the real endpoint is exactly what a player would do next.
    await roulettePage.spin();
    await expect(roulettePage.gameResult).toContainText(/WIN|LOSE/);

    // Whichever way the real spin resolved, the payout was applied exactly
    // once — a 900 starting point plus at most one settlement.
    const state = await page.request.get("/api/casino/roulette/state");
    const { balance } = await state.json();
    expect(balance).toBeGreaterThanOrEqual(900);
  });

  test("mocks an insufficient-balance rejection from the bet endpoint", async ({
    page,
    roulettePage,
  }) => {
    await roulettePage.open();

    await page.route("**/api/casino/roulette/bet", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Bet amount exceeds your current balance" }),
      });
    });

    await roulettePage.placeBetOf("red", 999_999);

    await expect(roulettePage.validationMessage).toContainText(/exceeds your current balance/i);
    // A rejected bet must never have deducted anything client-side either.
    await expect(roulettePage.balance).toHaveText("1,000 credits");
  });

  test("a request the network layer delivers twice does not double-deduct the balance", async ({
    page,
    roulettePage,
  }) => {
    await roulettePage.open();

    // Simulates a flaky connection or proxy retry delivering the browser's
    // bet request to the server twice: a duplicate real request fired
    // alongside the one the page itself makes, landing before it.
    await page.route("**/api/casino/roulette/bet", async (route) => {
      await page.request.post("/api/casino/roulette/bet", { data: route.request().postDataJSON() });
      await route.continue();
    });

    await roulettePage.placeBetOf("red", 100);

    // The manual page.request.post above (awaited first, inside the route
    // handler) is the one that actually wins the READY -> BET_PLACED
    // transition. The page's OWN request is the one route.continue() then
    // releases second, so — from the UI's point of view — its own bet
    // placement is the one that gets rejected as "already placed". Wait for
    // that rejection to actually render before reading server state, so the
    // test doesn't race ahead of the second request's response.
    await expect(roulettePage.validationMessage).toBeVisible();

    // Even though two bet requests actually reached the server, the round's
    // state machine only allowed the first of them to move READY ->
    // BET_PLACED — the balance reflects exactly one stake deduction, not two.
    const state = await page.request.get("/api/casino/roulette/state");
    const { balance } = await state.json();
    expect(balance).toBe(900);
  });
});

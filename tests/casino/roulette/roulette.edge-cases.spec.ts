import { test, expect } from "../../../playwright/fixtures/test";

test.describe("Roulette — boundary and negative testing (via the UI)", () => {
  test("zero stake is rejected", async ({ roulettePage }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 0);
    await expect(roulettePage.validationMessage).toContainText(/greater than zero/i);
  });

  test("a negative stake is rejected", async ({ roulettePage, page }) => {
    await roulettePage.open();
    await roulettePage.selectBetType("red");
    // Native number inputs reject a leading "-" from `.fill` in some
    // browsers, so this goes through the API directly — the important thing
    // under test is the server-side rule, not whether a given browser's
    // number input widget accepts the keystroke.
    const response = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "red", stake: -50 },
    });
    expect(response.status()).toBe(400);
  });

  test("a bet greater than the balance is rejected", async ({ roulettePage }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 5000);
    await expect(roulettePage.validationMessage).toContainText(/balance/i);
    await expect(roulettePage.balance).toHaveText("1,000 credits");
  });

  test("a bet over the maximum bet is rejected (checked ahead of the balance check)", async ({
    roulettePage,
  }) => {
    // 20,000 exceeds both the 10,000 max bet and the 1,000 starting balance;
    // the server checks the max-bet ceiling first, so this is what surfaces.
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 20000);
    await expect(roulettePage.validationMessage).toContainText(/maximum bet/i);
  });

  test("an invalid roulette number (out of 0-36) is rejected", async ({ roulettePage }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("number", 10, 99);
    await expect(roulettePage.validationMessage).toContainText(/0 and 36/);
  });

  test("attempting to spin without placing a bet first shows no path to do so, and the API confirms it's blocked", async ({
    roulettePage,
    page,
  }) => {
    await roulettePage.open();
    // The UI disables Spin until a bet exists — proving the guard exists at
    // the API too is what actually protects the balance.
    await expect(roulettePage.spinButton).toBeDisabled();

    const response = await page.request.post("/api/casino/roulette/spin");
    expect(response.status()).toBe(400);
  });

  test("attempting to place a second bet while one is already staged is rejected", async ({
    roulettePage,
    page,
  }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);

    // The UI's own form disables itself once a bet is staged (see below);
    // the real protection is server-side, so exercise it directly too.
    const response = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "black", stake: 100 },
    });
    expect(response.status()).toBe(400);
    // Only one stake was ever deducted.
    await expect(roulettePage.balance).toHaveText("900 credits");
  });

  test("the bet form disables itself once a bet is staged, preventing a double-submit at the UI layer", async ({
    roulettePage,
  }) => {
    await roulettePage.open();
    await roulettePage.placeBetOf("red", 100);

    await expect(roulettePage.placeBetButton).toBeDisabled();
  });
});

test.describe("Roulette — concurrency", () => {
  test("two simultaneous spin requests against one staged bet: only one is processed", async ({
    roulettePage,
    page,
  }) => {
    await roulettePage.open();
    await roulettePage.forceResult(1);
    await roulettePage.placeBetOf("red", 100);

    const [first, second] = await Promise.all([
      page.request.post("/api/casino/roulette/spin"),
      page.request.post("/api/casino/roulette/spin"),
    ]);

    const statuses = [first.status(), second.status()].sort();
    // Exactly one request wins the race and settles the round (200); the
    // other finds the round already moved on and is rejected (400).
    expect(statuses).toEqual([200, 400]);

    const historyResponse = await page.request.get("/api/casino/roulette/history");
    const { history } = await historyResponse.json();
    expect(history).toHaveLength(1);
  });

  test("two simultaneous bet requests against one balance: only one stake is deducted", async ({
    roulettePage,
    page,
  }) => {
    await roulettePage.open();

    const [first, second] = await Promise.all([
      page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 800 } }),
      page.request.post("/api/casino/roulette/bet", { data: { type: "black", stake: 800 } }),
    ]);

    const statuses = [first.status(), second.status()].sort();
    expect(statuses).toEqual([201, 400]);

    const state = await page.request.get("/api/casino/roulette/state");
    const { balance } = await state.json();
    // If both had been accepted, balance would be 1000 - 1600 = a negative
    // balance, which must never happen.
    expect(balance).toBe(200);
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  test("double-clicking Spin does not create two completed rounds", async ({ roulettePage, page }) => {
    await roulettePage.open();
    await roulettePage.forceResult(1);
    await roulettePage.placeBetOf("red", 100);

    // `dispatchEvent` (unlike `.click()`) skips Playwright's actionability
    // retries, so both click events actually land back-to-back instead of
    // the second one erroring out once the button disables itself after the
    // first — the closest a UI-level interaction gets to the API-level race
    // test above.
    await Promise.all([
      roulettePage.spinButton.dispatchEvent("click"),
      roulettePage.spinButton.dispatchEvent("click"),
    ]);

    await expect(roulettePage.gameResult).toContainText(/WIN|LOSE/);

    const historyResponse = await page.request.get("/api/casino/roulette/history");
    const { history } = await historyResponse.json();
    expect(history).toHaveLength(1);
  });
});

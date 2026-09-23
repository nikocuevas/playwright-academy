import { test, expect } from "../../../playwright/fixtures/test";

/**
 * The accounting model, asserted end to end through the real API for every
 * bet type, win and loss. This is the reference "GOOD" pattern the curriculum
 * contrasts with asserting directly on a random spin:
 *
 *   BAD:  click Spin, then assert some text says "WIN".
 *   GOOD: force the result via the test-only endpoint, THEN assert the
 *         winning number, color, win/loss flag, payout, profit and the
 *         resulting balance all agree with what the rules say they must be.
 *
 * Accounting model: the stake is deducted the moment the bet is placed. On a
 * win, `profit = stake * multiplier` (35 for a straight number, 1 for every
 * even-money bet) and `payout = stake + profit` is credited back — so the
 * net effect of a round is always `balance_after = balance_before_bet + profit`.
 * On a loss, both are zero and the balance keeps its post-stake value.
 */
test.describe("Roulette payout accounting", () => {
  test("an even-money win (Red, 100 stake): profit 100, payout 200, balance 1100", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 1 }, // red
    });
    const bet = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "red", stake: 100 },
    });
    expect((await bet.json()).balance).toBe(900); // stake deducted immediately

    const spin = await page.request.post("/api/casino/roulette/spin");
    const body = await spin.json();
    expect(body.won).toBe(true);
    expect(body.profit).toBe(100);
    expect(body.payout).toBe(200);
    expect(body.balance).toBe(1100); // 1000 original + 100 profit
  });

  test("an even-money loss (Black on red, 100 stake): profit 0, payout 0, balance 900", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 1 }, // red — Black bet loses
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "black", stake: 100 } });

    const spin = await page.request.post("/api/casino/roulette/spin");
    const body = await spin.json();
    expect(body.won).toBe(false);
    expect(body.profit).toBe(0);
    expect(body.payout).toBe(0);
    expect(body.balance).toBe(900); // the stake stays deducted, nothing credited
  });

  test("a straight Number win (17, 100 stake): profit 3500, payout 3600, balance 4500", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 17 },
    });
    await page.request.post("/api/casino/roulette/bet", {
      data: { type: "number", selection: 17, stake: 100 },
    });

    const spin = await page.request.post("/api/casino/roulette/spin");
    const body = await spin.json();
    expect(body.won).toBe(true);
    expect(body.profit).toBe(3500); // stake * 35
    expect(body.payout).toBe(3600); // stake + profit — includes the stake's return
    expect(body.balance).toBe(4500); // 1000 original + 3500 profit
  });

  test("a straight Number loss (selected 17, wheel lands 5): balance unchanged from post-stake", async ({
    page,
  }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 5 },
    });
    await page.request.post("/api/casino/roulette/bet", {
      data: { type: "number", selection: 17, stake: 100 },
    });

    const spin = await page.request.post("/api/casino/roulette/spin");
    const body = await spin.json();
    expect(body.won).toBe(false);
    expect(body.payout).toBe(0);
    expect(body.balance).toBe(900);
  });

  const evenMoneyTypes = ["red", "black", "odd", "even", "low", "high"] as const;
  const winningResultFor: Record<(typeof evenMoneyTypes)[number], number> = {
    red: 1,
    black: 2,
    odd: 1,
    even: 2,
    low: 1,
    high: 19,
  };

  for (const type of evenMoneyTypes) {
    test(`every even-money bet type pays 1:1 profit on a win — ${type}`, async ({ page }) => {
      await page.request.post("/api/casino/roulette/test-result", {
        headers: { "X-Test-Mode": "enable" },
        data: { result: winningResultFor[type] },
      });
      await page.request.post("/api/casino/roulette/bet", { data: { type, stake: 250 } });

      const spin = await page.request.post("/api/casino/roulette/spin");
      const body = await spin.json();
      expect(body.won).toBe(true);
      expect(body.profit).toBe(250); // 1:1
      expect(body.payout).toBe(500); // stake + profit
    });
  }

  test("Green (0) only pays the Number bet on 0 — every even-money bet loses on it", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 0 },
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 100 } });

    const spin = await page.request.post("/api/casino/roulette/spin");
    const body = await spin.json();
    expect(body.color).toBe("green");
    expect(body.won).toBe(false);
  });

  test("a full multi-round balance trace matches the documented ledger model", async ({ page }) => {
    // Starting balance 1000.
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 1 }, // red — wins
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 100 } });
    let spin = await (await page.request.post("/api/casino/roulette/spin")).json();
    expect(spin.balance).toBe(1100); // +100 profit

    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 2 }, // black — a Red bet loses
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 300 } });
    spin = await (await page.request.post("/api/casino/roulette/spin")).json();
    expect(spin.balance).toBe(800); // -300 stake, no payout

    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 17 },
    });
    await page.request.post("/api/casino/roulette/bet", {
      data: { type: "number", selection: 17, stake: 20 },
    });
    spin = await (await page.request.post("/api/casino/roulette/spin")).json();
    expect(spin.balance).toBe(1500); // 800 + (20 * 35) profit
  });
});

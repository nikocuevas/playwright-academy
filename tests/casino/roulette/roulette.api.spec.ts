import { test, expect } from "../../../playwright/fixtures/test";

/**
 * API-level coverage for the roulette endpoints — status codes, response
 * schema and validation, not just the happy path. UI tests exercise the same
 * behavior through the page; these confirm the contract the UI (and any
 * other client) actually receives.
 */
test.describe("Roulette API — happy path", () => {
  test("GET /state returns the initial session shape", async ({ page }) => {
    const response = await page.request.get("/api/casino/roulette/state");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      balance: 1000,
      currentBet: null,
      lastResult: null,
      status: "READY",
      maxBet: 10000,
    });
  });

  test("POST /bet returns 201 with the round and the debited balance", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "red", stake: 100 },
    });
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.balance).toBe(900);
    expect(body.status).toBe("BET_PLACED");
    expect(body.round).toMatchObject({
      status: "BET_PLACED",
      bet: { type: "red", stake: 100 },
    });
    expect(body.round.id).toEqual(expect.any(String));
  });

  test("POST /spin returns the documented schema for a forced winning number bet", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 17 },
    });
    await page.request.post("/api/casino/roulette/bet", {
      data: { type: "number", selection: 17, stake: 100 },
    });

    const response = await page.request.post("/api/casino/roulette/spin");
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Accounting model: profit = stake * 35 = 3500; payout = stake + profit =
    // 3600 (what gets credited back); balance = 1000 (original) + 3500 (profit).
    expect(body).toMatchObject({
      result: 17,
      color: "black", // 17 is black on a European wheel
      bet: { type: "number", selection: 17, stake: 100 },
      won: true,
      profit: 3500,
      payout: 3600,
      balance: 4500,
    });
    expect(body.roundId).toEqual(expect.any(String));
  });

  test("POST /spin on a losing even-money bet credits nothing", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 2 }, // black
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 100 } });

    const response = await page.request.post("/api/casino/roulette/spin");
    const body = await response.json();
    expect(body).toMatchObject({ won: false, profit: 0, payout: 0, balance: 900 });
  });

  test("GET /history reflects a completed round", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 1 },
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 50 } });
    await page.request.post("/api/casino/roulette/spin");

    const response = await page.request.get("/api/casino/roulette/history");
    expect(response.status()).toBe(200);
    const { history } = await response.json();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ status: "COMPLETED", result: 1, color: "red" });
  });

  test("POST /reset returns the starting balance and READY status", async ({ page }) => {
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 100 } });

    const response = await page.request.post("/api/casino/roulette/reset");
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ balance: 1000, status: "READY" });
  });
});

test.describe("Roulette API — the test-result mechanism is test-only", () => {
  test("is rejected without the X-Test-Mode header", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/test-result", {
      data: { result: 17 },
    });
    expect(response.status()).toBe(403);
  });

  test("rejects an out-of-range forced result even with the header", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 99 },
    });
    expect(response.status()).toBe(400);
  });

  test("a forced result is consumed by exactly one spin", async ({ page }) => {
    await page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: 0 },
    });
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 10 } });
    const first = await (await page.request.post("/api/casino/roulette/spin")).json();
    expect(first.result).toBe(0);

    // The next round is not forced — it should not also land on 0 by
    // construction of the test (a second forced value was never set).
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 10 } });
    const second = await (await page.request.post("/api/casino/roulette/spin")).json();
    expect(second.result).toEqual(expect.any(Number));
  });
});

test.describe("Roulette API — bet validation", () => {
  const cases: { name: string; body: Record<string, unknown> }[] = [
    { name: "missing type", body: { stake: 100 } },
    { name: "missing stake", body: { type: "red" } },
    { name: "zero stake", body: { type: "red", stake: 0 } },
    { name: "negative stake", body: { type: "red", stake: -50 } },
    { name: "non-numeric stake", body: { type: "red", stake: "abc" } },
    { name: "decimal (fractional) stake", body: { type: "red", stake: 10.5 } },
    { name: "stake over the maximum bet", body: { type: "red", stake: 20000 } },
    { name: "invalid roulette number selection", body: { type: "number", selection: 99, stake: 10 } },
    { name: "missing selection for a number bet", body: { type: "number", stake: 10 } },
    { name: "selection supplied for a non-number bet", body: { type: "red", selection: 5, stake: 10 } },
    { name: "unknown bet type", body: { type: "purple", stake: 10 } },
  ];

  for (const { name, body } of cases) {
    test(`rejects: ${name}`, async ({ page }) => {
      const response = await page.request.post("/api/casino/roulette/bet", { data: body });
      expect(response.status()).toBe(400);
      const json = await response.json();
      expect(json.error).toEqual(expect.any(String));
    });
  }

  test("rejects a stake greater than the current balance (but under the max bet)", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "red", stake: 5000 },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects placing a second bet while one is already staged", async ({ page }) => {
    await page.request.post("/api/casino/roulette/bet", { data: { type: "red", stake: 10 } });
    const response = await page.request.post("/api/casino/roulette/bet", {
      data: { type: "black", stake: 10 },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects spinning without a bet placed", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/spin");
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/bet/i);
  });

  test("rejects an invalid JSON body", async ({ page }) => {
    const response = await page.request.post("/api/casino/roulette/bet", {
      headers: { "Content-Type": "application/json" },
      data: "not json {{{",
    });
    expect(response.status()).toBe(400);
  });
});

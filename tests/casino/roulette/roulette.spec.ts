import { test, expect } from "../../../playwright/fixtures/test";
import type { RouletteBetType } from "../../../playwright/pages/RoulettePage";

const BET_TYPES: { type: RouletteBetType; selection?: number }[] = [
  { type: "number", selection: 17 },
  { type: "red" },
  { type: "black" },
  { type: "odd" },
  { type: "even" },
  { type: "low" },
  { type: "high" },
];

/** A result guaranteed to win each bet type above (17 is red/odd/low, so the number bet reuses it). */
const WINNING_RESULT: Record<RouletteBetType, number> = {
  number: 17,
  red: 1,
  black: 2,
  odd: 1,
  even: 2,
  low: 1,
  high: 19,
};

/** A result guaranteed to lose each bet type above. */
const LOSING_RESULT: Record<RouletteBetType, number> = {
  number: 5,
  red: 2,
  black: 1,
  odd: 2,
  even: 1,
  low: 19,
  high: 1,
};

test.describe("Roulette smoke", () => {
  test("the table loads with balance and controls visible", async ({ roulettePage, page }) => {
    await roulettePage.open();

    await expect(page.getByRole("heading", { name: "European Roulette" })).toBeVisible();
    await expect(roulettePage.balance).toHaveText("1,000 credits");
    await expect(roulettePage.placeBetButton).toBeVisible();
    await expect(roulettePage.spinButton).toBeVisible();
    await expect(roulettePage.resetButton).toBeVisible();
    await expect(roulettePage.currentBet).toHaveText("No active bet");

    for (const { type } of BET_TYPES) {
      await expect(roulettePage.betTypeRadio(type)).toBeVisible();
    }
  });

  test("the Spin button is disabled until a bet is placed", async ({ roulettePage }) => {
    await roulettePage.open();
    await expect(roulettePage.spinButton).toBeDisabled();
    await roulettePage.placeBetOf("red", 50);
    await expect(roulettePage.spinButton).toBeEnabled();
  });
});

test.describe("Roulette bet placement", () => {
  for (const { type, selection } of BET_TYPES) {
    test(`places a ${type} bet and deducts the stake immediately`, async ({ roulettePage }) => {
      await roulettePage.open();
      await roulettePage.placeBetOf(type, 100, selection);

      await expect(roulettePage.validationMessage).toHaveCount(0);
      await expect(roulettePage.currentBet).not.toHaveText("No active bet");
      // 1000 - 100 stake, deducted the moment the bet is placed, not on spin.
      await expect(roulettePage.balance).toHaveText("900 credits");
    });
  }
});

test.describe("Roulette winning bets (deterministic via forced results)", () => {
  for (const { type, selection } of BET_TYPES) {
    test(`${type} bet wins`, async ({ roulettePage }) => {
      await roulettePage.open();
      await roulettePage.forceResult(WINNING_RESULT[type]);
      await roulettePage.placeBetOf(type, 100, selection);
      await roulettePage.spin();

      await expect(roulettePage.winningNumber).toHaveText(String(WINNING_RESULT[type]));
      await expect(roulettePage.gameResult).toContainText("WIN");
    });
  }
});

test.describe("Roulette losing bets (deterministic via forced results)", () => {
  for (const { type, selection } of BET_TYPES) {
    test(`${type} bet loses`, async ({ roulettePage }) => {
      await roulettePage.open();
      await roulettePage.forceResult(LOSING_RESULT[type]);
      await roulettePage.placeBetOf(type, 100, selection);
      await roulettePage.spin();

      await expect(roulettePage.winningNumber).toHaveText(String(LOSING_RESULT[type]));
      await expect(roulettePage.gameResult).toContainText("LOSE");
    });
  }
});

test.describe("Roulette state", () => {
  test("Reset Game restores the starting balance and clears history", async ({ roulettePage }) => {
    await roulettePage.open();
    await roulettePage.forceResult(1); // red
    await roulettePage.placeBetOf("red", 500);
    await roulettePage.spin();
    await expect(roulettePage.balance).not.toHaveText("1,000 credits");

    await roulettePage.resetGame();

    await expect(roulettePage.balance).toHaveText("1,000 credits");
    await expect(roulettePage.currentBet).toHaveText("No active bet");
    await expect(roulettePage.betHistoryRows).toHaveCount(0);
  });

  test("a completed round is appended to bet history", async ({ roulettePage }) => {
    await roulettePage.open();
    await roulettePage.forceResult(17);
    await roulettePage.placeBetOf("number", 100, 17);
    await roulettePage.spin();

    await expect(roulettePage.betHistoryRows).toHaveCount(1);
    await expect(roulettePage.betHistory).toContainText("R001");
  });

  test("balance stays consistent across a losing then a winning round", async ({ roulettePage }) => {
    await roulettePage.open();

    await roulettePage.forceResult(2); // black — loses a red bet
    await roulettePage.placeBetOf("red", 100);
    await roulettePage.spin();
    await expect(roulettePage.balance).toHaveText("900 credits");

    await roulettePage.forceResult(1); // red — wins a red bet
    await roulettePage.placeBetOf("red", 100);
    await roulettePage.spin();
    await expect(roulettePage.balance).toHaveText("1,000 credits");
  });
});

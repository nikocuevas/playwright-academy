/**
 * Pure European Roulette game logic — no Next.js, no I/O, no randomness
 * baked in beyond what the caller supplies. Kept separate from the store and
 * the UI so it can be tested directly and so the business rules live in one
 * reusable place instead of being duplicated across a route handler and a
 * component.
 */

export type BetType = "number" | "red" | "black" | "odd" | "even" | "low" | "high";

export const BET_TYPES: BetType[] = ["number", "red", "black", "odd", "even", "low", "high"];

/** Standard European (single-zero) red pocket set; 0 is green; every other 1-36 is black. */
export const RED_NUMBERS = new Set<number>([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export type SpinColor = "red" | "black" | "green";

export function colorOf(n: number): SpinColor {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

/** 35:1 on a straight number, 1:1 (even money) on everything else. */
export function payoutMultiplier(type: BetType): number {
  return type === "number" ? 35 : 1;
}

export type RouletteBet = {
  type: BetType;
  /** Required for `type: "number"` (0-36); must be absent for every other type. */
  selection?: number;
  stake: number;
};

export type BetOutcome = { won: boolean; profit: number; payout: number };

/**
 * The accounting model (documented in full in `docs/casino-roulette-architecture.md`
 * and the "Testing Bets and Payouts" lesson):
 *
 *  - The stake is deducted from the balance the moment the bet is placed —
 *    not here. This function only evaluates what happens once the wheel stops.
 *  - On a win: `profit` is the net gain (stake × multiplier); `payout` is the
 *    total credited back to the balance, i.e. the stake *and* the profit
 *    (`payout = stake + profit`). Crediting `payout` after a stake that was
 *    already deducted nets out to `balance_after = balance_before_bet + profit`.
 *  - On a loss: both are zero: the stake stays deducted, nothing is credited.
 */
export function evaluateBet(bet: RouletteBet, result: number): BetOutcome {
  const color = colorOf(result);
  let won: boolean;

  switch (bet.type) {
    case "number":
      won = bet.selection === result;
      break;
    case "red":
      won = color === "red";
      break;
    case "black":
      won = color === "black";
      break;
    case "odd":
      won = result !== 0 && result % 2 === 1;
      break;
    case "even":
      won = result !== 0 && result % 2 === 0;
      break;
    case "low":
      won = result >= 1 && result <= 18;
      break;
    case "high":
      won = result >= 19 && result <= 36;
      break;
    default:
      won = false;
  }

  if (!won) return { won: false, profit: 0, payout: 0 };

  const profit = bet.stake * payoutMultiplier(bet.type);
  return { won: true, profit, payout: bet.stake + profit };
}

export type BetValidationInput = {
  type?: string;
  selection?: unknown;
  stake?: unknown;
};

export type BetValidationResult = { ok: true } | { error: string };

/** Every case in the module's bet-validation checklist, in the order listed there. */
export function validateBet(
  bet: BetValidationInput,
  balance: number,
  maxBet: number,
): BetValidationResult {
  if (!bet.type) {
    return { error: "A bet type is required" };
  }
  if (!BET_TYPES.includes(bet.type as BetType)) {
    return { error: `Unknown bet type "${bet.type}"` };
  }
  const type = bet.type as BetType;

  if (bet.stake === undefined || bet.stake === null) {
    return { error: "A bet amount is required" };
  }
  if (typeof bet.stake !== "number" || !Number.isFinite(bet.stake)) {
    return { error: "Bet amount must be a number" };
  }
  if (!Number.isInteger(bet.stake)) {
    return { error: "Bet amount must be a whole number of credits — fractional stakes are not supported" };
  }
  if (bet.stake <= 0) {
    return { error: "Bet amount must be greater than zero" };
  }
  if (bet.stake > maxBet) {
    return { error: `Bet amount cannot exceed the maximum bet of ${maxBet} credits` };
  }
  if (bet.stake > balance) {
    return { error: "Bet amount exceeds your current balance" };
  }

  if (type === "number") {
    if (bet.selection === undefined || bet.selection === null) {
      return { error: "A number selection is required for a Number bet" };
    }
    if (
      typeof bet.selection !== "number" ||
      !Number.isInteger(bet.selection) ||
      bet.selection < 0 ||
      bet.selection > 36
    ) {
      return { error: "Selection must be a whole number between 0 and 36" };
    }
  } else if (bet.selection !== undefined && bet.selection !== null) {
    return { error: `A "${type}" bet does not take a number selection` };
  }

  return { ok: true };
}

/**
 * Fixed, fictional betting markets for the iGaming practice app.
 *
 * Deliberately small and fixed: every learner sees the same two markets and
 * odds, so exercises and Playwright specs stay reproducible. Entirely
 * simulated — no real operator, no real odds, no real money.
 */

export type MarketOption = { id: string; label: string; odds: number };

export type Market = {
  id: string;
  label: string;
  closesInMinutes: number;
  options: MarketOption[];
};

export const markets: Market[] = [
  {
    id: "mkt-derby-winner",
    label: "Season Derby — Match Winner",
    closesInMinutes: 45,
    options: [
      { id: "opt-home", label: "Riverside FC", odds: 2.1 },
      { id: "opt-draw", label: "Draw", odds: 3.4 },
      { id: "opt-away", label: "Harbor United", odds: 3.0 },
    ],
  },
  {
    id: "mkt-title-fight",
    label: "Title Fight — Method of Victory",
    closesInMinutes: 120,
    options: [
      { id: "opt-ko", label: "Knockout", odds: 2.5 },
      { id: "opt-decision", label: "Decision", odds: 1.8 },
      { id: "opt-draw2", label: "Draw", odds: 12.0 },
    ],
  },
];

export function getMarket(id: string) {
  return markets.find((m) => m.id === id);
}

export function getMarketOption(marketId: string, optionId: string) {
  const market = getMarket(marketId);
  return market?.options.find((o) => o.id === optionId);
}

/** The only account the practice app knows about. Entirely fictional. */
export const demoIgamingUser = {
  id: "pl-2001",
  email: "player@example.com",
  password: "Password123!",
  username: "TestPlayer",
};

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** BET-###### — deterministic per sequence position so tests stay reproducible. */
export function makeBetId(sequence: number) {
  return `BET-${(500123 + sequence * 91).toString().slice(0, 6)}`;
}

/** TXN-###### — deterministic per sequence position so tests stay reproducible. */
export function makeTransactionId(sequence: number) {
  return `TXN-${(700321 + sequence * 53).toString().slice(0, 6)}`;
}

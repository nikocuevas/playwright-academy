export type SqlExercise = {
  id: string;
  title: string;
  group: "Basics" | "Filtering" | "Joins" | "Aggregates" | "Subqueries" | "QA Validation";
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt: string;
  /** What a correct answer must contain, checked loosely against the result. */
  expectation: string;
  hints: string[];
  solution: string;
  /**
   * Verification runs the learner's query and compares the result to the
   * solution's. `columns: 'exact'` also requires the same column labels.
   */
  compare: "rows" | "rowsAndColumns" | "rowCount";
  starter?: string;
};

export const casinoSqlExercises: SqlExercise[] = [
  {
    id: "casino-sql-all-rounds",
    title: "Find all roulette rounds",
    group: "Basics",
    difficulty: "beginner",
    prompt: "Return every round of roulette recorded in the system.",
    expectation: "All 20 rounds, including the one FAILED round.",
    hints: ["SELECT * FROM rounds;"],
    solution: `SELECT * FROM rounds;`,
    compare: "rowCount",
    starter: "SELECT * FROM rounds;",
  },
  {
    id: "casino-sql-winning-bets",
    title: "Find winning bets",
    group: "Filtering",
    difficulty: "beginner",
    prompt: "Find every bet that won. Return the full bet row.",
    expectation: "14 winning bets.",
    hints: ["WHERE status = 'won'"],
    solution: `SELECT * FROM bets WHERE status = 'won';`,
    compare: "rows",
    starter: "SELECT * FROM bets;",
  },
  {
    id: "casino-sql-losing-bets",
    title: "Find losing bets",
    group: "Filtering",
    difficulty: "beginner",
    prompt: "Find every bet that lost. Return the full bet row.",
    expectation: "5 losing bets.",
    hints: ["WHERE status = 'lost'"],
    solution: `SELECT * FROM bets WHERE status = 'lost';`,
    compare: "rows",
  },
  {
    id: "casino-sql-payout-mismatch",
    title: "Find bets where the stored payout does not match the expected payout",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "European Roulette pays 36x stake on a winning Number bet (stake returned plus 35x profit) and 2x stake on any other winning bet type (even money). Find every winning bet whose stored payout disagrees with that formula. Return the bet id, bet_type, stake and payout.",
    expectation: "Exactly one winning bet whose stored payout doesn't match the formula for its bet_type.",
    hints: [
      "Only 'won' bets can have this bug — a loss's correct payout is always 0.",
      "A CASE expression can compute the expected payout: 36 x stake for 'number', 2 x stake for everything else.",
      "WHERE status = 'won' AND payout <> CASE WHEN bet_type = 'number' THEN stake * 36 ELSE stake * 2 END",
    ],
    solution: `SELECT id, bet_type, stake, payout
FROM bets
WHERE status = 'won'
  AND payout <> CASE WHEN bet_type = 'number' THEN stake * 36 ELSE stake * 2 END;`,
    compare: "rows",
  },
  {
    id: "casino-sql-round-transactions",
    title: "Find transactions associated with a specific round",
    group: "Filtering",
    difficulty: "beginner",
    prompt: "Round 1 was a winning Red bet. Return every transaction recorded against round 1.",
    expectation: "Two transactions: the stake debit and the payout credit.",
    hints: ["WHERE round_id = 1"],
    solution: `SELECT * FROM transactions WHERE round_id = 1;`,
    compare: "rows",
    starter: "SELECT * FROM transactions WHERE round_id = 1;",
  },
  {
    id: "casino-sql-duplicate-transactions",
    title: "Find duplicate transactions",
    group: "Aggregates",
    difficulty: "intermediate",
    prompt:
      "A transaction should never be recorded twice for the same player, round, type and amount. Find any group of transactions that share all four. Return those columns plus how many rows share them.",
    expectation: "One group of two transactions that are exact duplicates — a payout applied twice.",
    hints: [
      "GROUP BY the columns that should make a transaction unique.",
      "HAVING COUNT(*) > 1 keeps only the groups with more than one row.",
    ],
    solution: `SELECT player_id, round_id, type, amount, COUNT(*) AS occurrences
FROM transactions
GROUP BY player_id, round_id, type, amount
HAVING COUNT(*) > 1;`,
    compare: "rows",
  },
  {
    id: "casino-sql-balance-mismatch",
    title: "Find players whose balance does not match their transaction history",
    group: "Aggregates",
    difficulty: "advanced",
    prompt:
      "A player's stored balance should always equal the sum of their own transactions. Find every player where that isn't true. Return the player id, username, stored balance and the calculated balance from the ledger.",
    expectation: "One player whose stored balance disagrees with their transaction history.",
    hints: [
      "LEFT JOIN transactions onto players and GROUP BY the player.",
      "COALESCE(SUM(t.amount), 0) handles a player with zero transactions.",
      "Compare the stored balance to the calculated one in HAVING, because it involves an aggregate.",
    ],
    solution: `SELECT p.id, p.username, p.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance
FROM players p
LEFT JOIN transactions t ON t.player_id = p.id
GROUP BY p.id, p.username, p.balance
HAVING p.balance <> COALESCE(SUM(t.amount), 0);`,
    compare: "rows",
  },
  {
    id: "casino-sql-rounds-missing-transactions",
    title: "Find rounds with missing transactions",
    group: "Joins",
    difficulty: "advanced",
    prompt:
      "Every completed round with a bet should have left at least a stake transaction behind. Find every COMPLETED round with no transactions recorded at all. Return the round id, player id and result.",
    expectation: "One completed round — a real win — with zero transactions ever recorded for it.",
    hints: [
      "LEFT JOIN transactions onto rounds, matching on round_id.",
      "The missing ones are where the transaction side came back NULL.",
      "WHERE r.status = 'COMPLETED' AND t.id IS NULL",
    ],
    solution: `SELECT r.id, r.player_id, r.result
FROM rounds r
LEFT JOIN transactions t ON t.round_id = r.id
WHERE r.status = 'COMPLETED' AND t.id IS NULL;`,
    compare: "rows",
  },
  {
    id: "casino-sql-impossible-payouts",
    title: "Find bets with impossible payouts",
    group: "QA Validation",
    difficulty: "intermediate",
    prompt: "A lost bet must always have a payout of 0. Find any losing bet with a nonzero payout.",
    expectation: "One losing bet with a nonzero payout — structurally impossible.",
    hints: ["WHERE status = 'lost' AND payout <> 0"],
    solution: `SELECT * FROM bets WHERE status = 'lost' AND payout <> 0;`,
    compare: "rows",
  },
  {
    id: "casino-sql-failed-rounds-balance-change",
    title: "Find failed rounds that incorrectly changed the balance",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "A FAILED round never produced a result, so it should never have moved any money. Find every transaction attached to a FAILED round. Return the round id, the transaction id and its amount.",
    expectation: "One FAILED round with a transaction that debited the player's balance anyway.",
    hints: [
      "JOIN transactions to rounds on round_id.",
      "WHERE rounds.status = 'FAILED'",
    ],
    solution: `SELECT r.id AS round_id, t.id AS transaction_id, t.amount
FROM rounds r
JOIN transactions t ON t.round_id = r.id
WHERE r.status = 'FAILED';`,
    compare: "rows",
  },
];

export const casinoSqlExerciseGroups = Array.from(
  casinoSqlExercises.reduce((map, exercise) => {
    const list = map.get(exercise.group) ?? [];
    list.push(exercise);
    map.set(exercise.group, list);
    return map;
  }, new Map<string, SqlExercise[]>()),
).map(([group, items]) => ({ group, items }));

export function getCasinoSqlExercise(id: string) {
  return casinoSqlExercises.find((e) => e.id === id);
}

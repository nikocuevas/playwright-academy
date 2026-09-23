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

export const igamingSqlExercises: SqlExercise[] = [
  {
    id: "ig-sql-negative-balances",
    title: "Find players with negative balances",
    group: "Filtering",
    difficulty: "beginner",
    prompt:
      "A wallet balance must never go negative. Find every wallet whose balance is below zero. Return the wallet id, player id and balance.",
    expectation: "Exactly one wallet with a negative balance.",
    hints: [
      "You only need the wallets table.",
      "WHERE balance < 0",
    ],
    solution: `SELECT id, player_id, balance
FROM wallets
WHERE balance < 0;`,
    compare: "rows",
    starter: "SELECT * FROM wallets;",
  },
  {
    id: "ig-sql-duplicate-transactions",
    title: "Find duplicate transactions",
    group: "Aggregates",
    difficulty: "intermediate",
    prompt:
      "Two transaction rows can look identical — same wallet, type, amount and timestamp — even when their idempotency keys differ, which usually means the same real-world charge was recorded twice. Find any group of transactions that share a wallet_id, type, amount and created_at. Return those columns plus how many rows share them.",
    expectation: "One group of two transactions that are exact duplicates by content.",
    hints: [
      "GROUP BY the columns that should make a transaction unique.",
      "HAVING COUNT(*) > 1 keeps only the groups with more than one row.",
      "This is a content-based duplicate, not the idempotency-key duplicate in the next exercise.",
    ],
    solution: `SELECT wallet_id, type, amount, created_at, COUNT(*) AS occurrences
FROM transactions
GROUP BY wallet_id, type, amount, created_at
HAVING COUNT(*) > 1;`,
    compare: "rows",
  },
  {
    id: "ig-sql-bets-without-settlement",
    title: "Find bets without settlements",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "A bet marked 'settled' should always have a matching row in bet_settlements. Find every settled bet with no settlement record. Return the bet id, player id, market and status.",
    expectation: "One settled bet with no corresponding settlement row.",
    hints: [
      "LEFT JOIN bet_settlements onto bets so unmatched bets are kept, not dropped.",
      "The missing ones are where the settlement side came back NULL.",
      "WHERE b.status = 'settled' AND s.id IS NULL",
    ],
    solution: `SELECT b.id, b.player_id, b.market, b.status
FROM bets b
LEFT JOIN bet_settlements s ON s.bet_id = b.id
WHERE b.status = 'settled' AND s.id IS NULL;`,
    compare: "rows",
  },
  {
    id: "ig-sql-settled-without-ledger",
    title: "Find settled wins with no payout transaction",
    group: "Joins",
    difficulty: "advanced",
    prompt:
      "A settlement recording a win should always be followed by a bet_payout transaction crediting the player's wallet. Find every winning settlement with no matching bet_payout row in transactions. Return the settlement id, bet id, outcome and payout.",
    expectation: "One winning settlement whose payout was never applied to the ledger.",
    hints: [
      "LEFT JOIN transactions onto bet_settlements, matching on bet_id and type = 'bet_payout'.",
      "Filter to outcome = 'win' first — losses never need a payout.",
      "The bug is where the transaction side is NULL.",
    ],
    solution: `SELECT s.id, s.bet_id, s.outcome, s.payout
FROM bet_settlements s
LEFT JOIN transactions t ON t.bet_id = s.bet_id AND t.type = 'bet_payout'
WHERE s.outcome = 'win' AND t.id IS NULL;`,
    compare: "rows",
  },
  {
    id: "ig-sql-unreconciled-wallet",
    title: "Find wallets that don't reconcile",
    group: "Aggregates",
    difficulty: "advanced",
    prompt:
      "A wallet's stored balance should always equal the sum of its own transactions. Find every wallet where that isn't true. Return the wallet id, player id, the stored balance and the calculated balance from the ledger.",
    expectation: "One wallet whose stored balance disagrees with its transaction history.",
    hints: [
      "LEFT JOIN transactions onto wallets and GROUP BY the wallet.",
      "COALESCE(SUM(t.amount), 0) handles a wallet with zero transactions.",
      "Compare the stored balance to the calculated one in HAVING, because it involves an aggregate.",
    ],
    solution: `SELECT w.id, w.player_id, w.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance
FROM wallets w
LEFT JOIN transactions t ON t.wallet_id = w.id
GROUP BY w.id, w.player_id, w.balance
HAVING w.balance <> COALESCE(SUM(t.amount), 0);`,
    compare: "rows",
  },
  {
    id: "ig-sql-self-excluded-active-bets",
    title: "Find self-excluded players who still placed a bet",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Once a player self-excludes, no further bets should be accepted from them. Find any bet placed after its player's self-exclusion started. Return the player id, bet id, bet status, exclusion date and bet date.",
    expectation: "One bet placed after its player's self-exclusion began — a control failure.",
    hints: [
      "Join self_exclusions to bets on player_id.",
      "Compare bets.placed_at to self_exclusions.excluded_at.",
      "Any bet placed after the exclusion date should not exist.",
    ],
    solution: `SELECT se.player_id, b.id AS bet_id, b.status, se.excluded_at, b.placed_at
FROM self_exclusions se
JOIN bets b ON b.player_id = se.player_id
WHERE b.placed_at > se.excluded_at;`,
    compare: "rows",
  },
  {
    id: "ig-sql-failed-kyc-activity",
    title: "Find failed-KYC players with gambling activity",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "A player whose identity verification failed should be blocked from placing bets. Find every bet placed by a player whose most relevant kyc_verifications row has status 'failed'. Return the player id, username, kyc status and bet id.",
    expectation: "One player with a failed KYC check who still has a bet on record.",
    hints: [
      "Join players to kyc_verifications where status = 'failed'.",
      "Then join to bets on player_id.",
      "The result is every control failure of this kind, not just the first one found.",
    ],
    solution: `SELECT p.id AS player_id, p.username, k.status AS kyc_status, b.id AS bet_id
FROM players p
JOIN kyc_verifications k ON k.player_id = p.id AND k.status = 'failed'
JOIN bets b ON b.player_id = p.id;`,
    compare: "rows",
  },
  {
    id: "ig-sql-duplicate-callbacks",
    title: "Find duplicate payment callbacks",
    group: "Aggregates",
    difficulty: "intermediate",
    prompt:
      "A payment provider's webhook callback carries an idempotency_key that should make retries harmless — the same key should never be applied twice. Find any idempotency_key used by more than one transaction. Return the key and how many transactions used it.",
    expectation: "One idempotency key that was applied twice.",
    hints: [
      "GROUP BY idempotency_key.",
      "Exclude NULL keys first with WHERE idempotency_key IS NOT NULL.",
      "HAVING COUNT(*) > 1 finds the reused key.",
    ],
    solution: `SELECT idempotency_key, COUNT(*) AS occurrences
FROM transactions
WHERE idempotency_key IS NOT NULL
GROUP BY idempotency_key
HAVING COUNT(*) > 1;`,
    compare: "rows",
  },
  {
    id: "ig-sql-inconsistent-amounts",
    title: "Find transactions that disagree with their bet's stake",
    group: "Joins",
    difficulty: "advanced",
    prompt:
      "A bet_stake transaction's amount should always match the stake on the bet it funds. Find every bet_stake transaction whose (absolute) amount is different from its bet's stake. Return the bet id, the bet's stake, the transaction id and the transaction's amount.",
    expectation: "One bet_stake transaction that debited a different amount than the bet's stake.",
    hints: [
      "Join bets to transactions on bet_id, keeping only type = 'bet_stake'.",
      "Transaction amounts are stored signed (negative for a debit) — compare ABS(t.amount) to b.stake.",
      "WHERE ABS(t.amount) <> b.stake",
    ],
    solution: `SELECT b.id AS bet_id, b.stake AS bet_stake, t.id AS transaction_id, ABS(t.amount) AS transaction_amount
FROM bets b
JOIN transactions t ON t.bet_id = b.id AND t.type = 'bet_stake'
WHERE ABS(t.amount) <> b.stake;`,
    compare: "rows",
  },
  {
    id: "ig-sql-wallet-reconciliation",
    title: "Reconcile a player's wallet",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Player 6 (farid_h) has raised a support ticket disputing their balance. Reconcile their wallet: show the stored balance, the balance calculated from their transaction history, and the difference between them.",
    expectation: "One row showing player 6's stored balance, calculated balance and the discrepancy.",
    hints: [
      "This is the same shape of query as the general 'wallets that don't reconcile' exercise, filtered to one player.",
      "LEFT JOIN transactions onto the wallet and SUM the amounts.",
      "difference = stored_balance - calculated_balance.",
    ],
    solution: `SELECT w.player_id, w.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance,
       w.balance - COALESCE(SUM(t.amount), 0) AS difference
FROM wallets w
LEFT JOIN transactions t ON t.wallet_id = w.id
WHERE w.player_id = 6
GROUP BY w.id, w.player_id, w.balance;`,
    compare: "rows",
    starter: "SELECT * FROM wallets WHERE player_id = 6;",
  },
];

export const igamingSqlExerciseGroups = Array.from(
  igamingSqlExercises.reduce((map, exercise) => {
    const list = map.get(exercise.group) ?? [];
    list.push(exercise);
    map.set(exercise.group, list);
    return map;
  }, new Map<string, SqlExercise[]>()),
).map(([group, items]) => ({ group, items }));

export function getIgamingSqlExercise(id: string) {
  return igamingSqlExercises.find((e) => e.id === id);
}

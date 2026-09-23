import { test, expect } from "@playwright/test";
import { executeSql } from "@/lib/sql-engine/executor";
import { getIgamingTable, igamingTableNames } from "@/lib/sql-engine/igaming-dataset";
import { igamingSqlExercises } from "@/content/igaming-sql-exercises";

const source = { getTable: getIgamingTable, tableNames: igamingTableNames };
const run = (sql: string) => executeSql(sql, source);

test.describe("iGaming SQL engine", () => {
  test("selects all rows from a table", () => {
    const result = run("SELECT * FROM players;");
    expect(result.rowCount).toBe(10);
    expect(result.columns).toContain("kyc_status");
  });

  test("does not affect the default ShopEasy dataset", () => {
    const result = executeSql("SELECT * FROM users;");
    expect(result.rowCount).toBe(8);
  });

  test("joins wallets to players", () => {
    const result = run(`
      SELECT p.username, w.balance
      FROM players p
      JOIN wallets w ON w.player_id = p.id
      ORDER BY p.id;
    `);
    expect(result.rowCount).toBe(10);
    expect(result.rows[0]).toEqual(["alice_w", 170]);
  });

  test("finds the seeded data-integrity bugs", () => {
    const negativeBalances = run("SELECT id FROM wallets WHERE balance < 0;");
    expect(negativeBalances.rows).toEqual([[2]]);

    const duplicateTransactions = run(`
      SELECT wallet_id, COUNT(*) AS occurrences
      FROM transactions
      GROUP BY wallet_id, type, amount, created_at
      HAVING COUNT(*) > 1;
    `);
    expect(duplicateTransactions.rows).toEqual([[3, 2]]);

    const settledWithoutSettlement = run(`
      SELECT b.id
      FROM bets b
      LEFT JOIN bet_settlements s ON s.bet_id = b.id
      WHERE b.status = 'settled' AND s.id IS NULL;
    `);
    expect(settledWithoutSettlement.rows).toEqual([[4]]);

    const winsWithoutPayout = run(`
      SELECT s.bet_id
      FROM bet_settlements s
      LEFT JOIN transactions t ON t.bet_id = s.bet_id AND t.type = 'bet_payout'
      WHERE s.outcome = 'win' AND t.id IS NULL;
    `);
    expect(winsWithoutPayout.rows).toEqual([[5]]);

    const unreconciled = run(`
      SELECT w.player_id, w.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance
      FROM wallets w
      LEFT JOIN transactions t ON t.wallet_id = w.id
      GROUP BY w.id, w.player_id, w.balance
      HAVING w.balance <> COALESCE(SUM(t.amount), 0);
    `);
    expect(unreconciled.rows).toEqual([[6, 300, 190]]);

    const selfExcludedActive = run(`
      SELECT se.player_id, b.id AS bet_id
      FROM self_exclusions se
      JOIN bets b ON b.player_id = se.player_id
      WHERE b.placed_at > se.excluded_at;
    `);
    expect(selfExcludedActive.rows).toEqual([[7, 7]]);

    const failedKyc = run(`
      SELECT p.id AS player_id, b.id AS bet_id
      FROM players p
      JOIN kyc_verifications k ON k.player_id = p.id AND k.status = 'failed'
      JOIN bets b ON b.player_id = p.id;
    `);
    expect(failedKyc.rows).toEqual([[8, 8]]);

    const duplicateCallbacks = run(`
      SELECT idempotency_key, COUNT(*) AS occurrences
      FROM transactions
      WHERE idempotency_key IS NOT NULL
      GROUP BY idempotency_key
      HAVING COUNT(*) > 1;
    `);
    expect(duplicateCallbacks.rows).toEqual([["idem-p9-shared", 2]]);

    const inconsistentAmounts = run(`
      SELECT b.id AS bet_id, b.stake, ABS(t.amount) AS transaction_amount
      FROM bets b
      JOIN transactions t ON t.bet_id = b.id AND t.type = 'bet_stake'
      WHERE ABS(t.amount) <> b.stake;
    `);
    expect(inconsistentAmounts.rows).toEqual([[10, 75, 60]]);

    const reconciliation = run(`
      SELECT w.player_id, w.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance,
             w.balance - COALESCE(SUM(t.amount), 0) AS difference
      FROM wallets w
      LEFT JOIN transactions t ON t.wallet_id = w.id
      WHERE w.player_id = 6
      GROUP BY w.id, w.player_id, w.balance;
    `);
    expect(reconciliation.rows).toEqual([[6, 300, 190, 110]]);
  });

  test("reports unknown tables against the iGaming schema, not ShopEasy's", () => {
    expect(() => run("SELECT * FROM orders;")).toThrow(/Unknown table/);

    let caught: unknown;
    try {
      run("SELECT * FROM orders;");
    } catch (error) {
      caught = error;
    }
    expect((caught as { hint?: string }).hint).toContain("players");
  });
});

test.describe("iGaming SQL exercise solutions", () => {
  for (const exercise of igamingSqlExercises) {
    test(`solution runs: ${exercise.title}`, () => {
      const result = run(exercise.solution);
      expect(result.rowCount, `${exercise.id} returned no rows`).toBeGreaterThan(0);
    });
  }
});

import { test, expect } from "@playwright/test";
import { executeSql } from "@/lib/sql-engine/executor";
import { getCasinoTable, casinoTableNames } from "@/lib/sql-engine/casino-dataset";
import { casinoSqlExercises } from "@/content/casino-sql-exercises";

const source = { getTable: getCasinoTable, tableNames: casinoTableNames };
const run = (sql: string) => executeSql(sql, source);

test.describe("Casino SQL engine", () => {
  test("selects all rows from a table", () => {
    const result = run("SELECT * FROM players;");
    expect(result.rowCount).toBe(10);
    expect(result.columns).toContain("balance");
  });

  test("does not affect the default ShopEasy dataset", () => {
    const result = executeSql("SELECT * FROM users;");
    expect(result.rowCount).toBe(8);
  });

  test("counts rounds, bets and transactions", () => {
    expect(run("SELECT * FROM rounds;").rowCount).toBe(20);
    expect(run("SELECT * FROM bets;").rowCount).toBe(19);
    expect(run("SELECT * FROM transactions;").rowCount).toBe(44);
  });

  test("joins players to their bets via rounds", () => {
    const result = run(`
      SELECT p.username, b.bet_type, b.status
      FROM players p
      JOIN rounds r ON r.player_id = p.id
      JOIN bets b ON b.round_id = r.id
      WHERE p.id = 1
      ORDER BY b.id;
    `);
    expect(result.rowCount).toBe(2);
    expect(result.rows[0]).toEqual(["alice_r", "red", "won"]);
    expect(result.rows[1]).toEqual(["alice_r", "black", "lost"]);
  });

  test("finds the seeded data-integrity bugs", () => {
    const payoutMismatch = run(`
      SELECT id, bet_type, stake, payout
      FROM bets
      WHERE status = 'won'
        AND payout <> CASE WHEN bet_type = 'number' THEN stake * 36 ELSE stake * 2 END;
    `);
    expect(payoutMismatch.rows).toEqual([[13, "number", 100, 3500]]);

    const balanceMismatch = run(`
      SELECT p.id, p.username, p.balance AS stored_balance, COALESCE(SUM(t.amount), 0) AS calculated_balance
      FROM players p
      LEFT JOIN transactions t ON t.player_id = p.id
      GROUP BY p.id, p.username, p.balance
      HAVING p.balance <> COALESCE(SUM(t.amount), 0);
    `);
    expect(balanceMismatch.rows).toEqual([[6, "finn_q", 1130, 1090]]);

    const duplicateTransactions = run(`
      SELECT player_id, round_id, type, amount, COUNT(*) AS occurrences
      FROM transactions
      GROUP BY player_id, round_id, type, amount
      HAVING COUNT(*) > 1;
    `);
    expect(duplicateTransactions.rows).toEqual([[10, 15, "bet_payout", 100, 2]]);

    const duplicateRounds = run(`
      SELECT player_id, result, created_at, COUNT(*) AS occurrences
      FROM rounds
      GROUP BY player_id, result, created_at
      HAVING COUNT(*) > 1;
    `);
    expect(duplicateRounds.rows).toEqual([[10, 26, "2026-01-27T21:00:00", 2]]);

    const missingTransactions = run(`
      SELECT r.id, r.player_id, r.result
      FROM rounds r
      LEFT JOIN transactions t ON t.round_id = r.id
      WHERE r.status = 'COMPLETED' AND t.id IS NULL;
    `);
    expect(missingTransactions.rows).toEqual([[20, 5, 4]]);

    const impossiblePayouts = run(`SELECT id FROM bets WHERE status = 'lost' AND payout <> 0;`);
    expect(impossiblePayouts.rows).toEqual([[18]]);

    const failedRoundsBalanceChange = run(`
      SELECT r.id AS round_id, t.id AS transaction_id, t.amount
      FROM rounds r
      JOIN transactions t ON t.round_id = r.id
      WHERE r.status = 'FAILED';
    `);
    expect(failedRoundsBalanceChange.rows).toEqual([[8, 23, -300]]);

    const negativeBalance = run(`SELECT id, username FROM players WHERE balance < 0;`);
    expect(negativeBalance.rows).toEqual([[7, "gus_t"]]);
  });

  test("reports unknown tables against the casino schema, not ShopEasy's", () => {
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

test.describe("Casino SQL exercise solutions", () => {
  for (const exercise of casinoSqlExercises) {
    test(`solution runs: ${exercise.title}`, () => {
      const result = run(exercise.solution);
      expect(result.rowCount, `${exercise.id} returned no rows`).toBeGreaterThan(0);
    });
  }
});

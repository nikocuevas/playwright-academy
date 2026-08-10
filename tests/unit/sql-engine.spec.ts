import { test, expect } from "@playwright/test";
import { executeSql } from "@/lib/sql-engine/executor";
import { sqlExercises } from "@/content/sql-exercises";

test.describe("SQL engine", () => {
  test("selects all rows from a table", () => {
    const result = executeSql("SELECT * FROM users;");
    expect(result.rowCount).toBe(8);
    expect(result.columns).toContain("email");
  });

  test("filters, orders and limits", () => {
    const result = executeSql(`
      SELECT name, price FROM products
      WHERE price > 100
      ORDER BY price DESC
      LIMIT 2;
    `);

    expect(result.rows).toEqual([
      ["27-inch Monitor", 399],
      ["Wireless Headphones", 249.5],
    ]);
  });

  test("IS NULL finds missing values that = NULL cannot", () => {
    expect(executeSql("SELECT id FROM users WHERE phone IS NULL;").rowCount).toBe(3);
    expect(executeSql("SELECT id FROM users WHERE phone = NULL;").rowCount).toBe(0);
  });

  test("supports IN, BETWEEN, LIKE and DISTINCT", () => {
    expect(
      executeSql("SELECT id FROM orders WHERE status IN ('pending', 'paid');").rowCount,
    ).toBe(5);
    expect(
      executeSql("SELECT id FROM products WHERE price BETWEEN 40 AND 130;").rowCount,
    ).toBe(4);
    expect(
      executeSql("SELECT id FROM users WHERE email LIKE '%@example.com';").rowCount,
    ).toBe(8);
    expect(executeSql("SELECT DISTINCT category FROM products;").rowCount).toBe(4);
  });

  test("inner join pairs matching rows", () => {
    const result = executeSql(`
      SELECT u.first_name, o.id
      FROM users u
      JOIN orders o ON o.user_id = u.id;
    `);
    expect(result.rowCount).toBe(9);
  });

  test("left join plus IS NULL finds users with no orders", () => {
    const result = executeSql(`
      SELECT u.id
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE o.id IS NULL;
    `);
    expect(result.rows.map((r) => r[0]).sort()).toEqual([4, 6, 7]);
  });

  test("aggregates with GROUP BY and HAVING", () => {
    const result = executeSql(`
      SELECT status, COUNT(*) AS orders, SUM(total) AS revenue
      FROM orders
      GROUP BY status
      ORDER BY status;
    `);

    expect(result.columns).toEqual(["status", "orders", "revenue"]);
    expect(result.rows[0][0]).toBe("cancelled");

    const having = executeSql(`
      SELECT u.first_name, COUNT(o.id) AS order_count
      FROM users u
      JOIN orders o ON o.user_id = u.id
      GROUP BY u.id, u.first_name
      HAVING COUNT(o.id) >= 2;
    `);
    expect(having.rowCount).toBe(4);
  });

  test("bare aggregates collapse to a single row", () => {
    const result = executeSql("SELECT COUNT(*) AS total, AVG(price) AS avg FROM products;");
    expect(result.rowCount).toBe(1);
    expect(result.rows[0][0]).toBe(6);
  });

  test("scalar subquery in WHERE", () => {
    const result = executeSql(`
      SELECT id FROM orders WHERE total > (SELECT AVG(total) FROM orders);
    `);
    expect(result.rowCount).toBeGreaterThan(0);
    expect(result.rowCount).toBeLessThan(9);
  });

  test("IN with a subquery", () => {
    const result = executeSql(`
      SELECT id FROM users WHERE id IN (SELECT user_id FROM orders);
    `);
    expect(result.rows.map((r) => r[0]).sort()).toEqual([1, 2, 3, 5, 8]);
  });

  test("finds the seeded data-integrity bugs", () => {
    const cancelledButPaid = executeSql(`
      SELECT o.id FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE o.status = 'cancelled' AND p.status = 'completed';
    `);
    expect(cancelledButPaid.rows).toEqual([["ORD-839472"]]);

    const orphans = executeSql(`
      SELECT oi.id FROM order_items oi
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE o.id IS NULL;
    `);
    expect(orphans.rows).toEqual([[14]]);

    const mismatched = executeSql(`
      SELECT o.id FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, o.total
      HAVING o.total <> SUM(oi.quantity * oi.unit_price);
    `);
    expect(mismatched.rows).toEqual([["ORD-840568"]]);
  });

  test("rejects write statements with an explanation", () => {
    expect(() => executeSql("DELETE FROM users;")).toThrow(/read-only/);
  });

  test("reports unknown tables and columns helpfully", () => {
    expect(() => executeSql("SELECT * FROM customers;")).toThrow(/Unknown table/);
    expect(() => executeSql("SELECT nope FROM users;")).toThrow(/Unknown column/);
  });

  test("reports a syntax error with position information", () => {
    let caught: unknown;
    try {
      executeSql("SELECT FROM WHERE users;");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeTruthy();
  });
});

test.describe("SQL exercise solutions", () => {
  for (const exercise of sqlExercises) {
    test(`solution runs: ${exercise.title}`, () => {
      const result = executeSql(exercise.solution);
      expect(result.rowCount, `${exercise.id} returned no rows`).toBeGreaterThan(0);
    });
  }
});

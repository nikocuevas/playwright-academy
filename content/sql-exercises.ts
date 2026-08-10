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

export const sqlExercises: SqlExercise[] = [
  {
    id: "sql-active-users",
    title: "Find active users",
    group: "Basics",
    difficulty: "beginner",
    prompt:
      "List the id, first name and email of every user whose status is 'active', newest registrations first.",
    expectation: "Six active users, ordered by created_at descending.",
    hints: [
      "You only need the users table.",
      "Filter with WHERE status = 'active'.",
      "ORDER BY created_at DESC puts the newest first.",
    ],
    solution: `SELECT id, first_name, email
FROM users
WHERE status = 'active'
ORDER BY created_at DESC;`,
    compare: "rows",
    starter: "SELECT * FROM users;",
  },
  {
    id: "sql-expensive-products",
    title: "Find expensive products",
    group: "Filtering",
    difficulty: "beginner",
    prompt:
      "List the name and price of every product costing more than $100, most expensive first.",
    expectation: "Four products above $100.",
    hints: [
      "Compare the price column with a number — no quotes.",
      "WHERE price > 100",
      "ORDER BY price DESC",
    ],
    solution: `SELECT name, price
FROM products
WHERE price > 100
ORDER BY price DESC;`,
    compare: "rows",
  },
  {
    id: "sql-missing-phone",
    title: "Users with no phone number",
    group: "Filtering",
    difficulty: "beginner",
    prompt:
      "Find every user who has no phone number on file. Return their id, first name and email.",
    expectation: "Three users whose phone is NULL.",
    hints: [
      "NULL means 'unknown' and is never equal to anything.",
      "`WHERE phone = NULL` always returns zero rows.",
      "Use WHERE phone IS NULL.",
    ],
    solution: `SELECT id, first_name, email
FROM users
WHERE phone IS NULL;`,
    compare: "rows",
  },
  {
    id: "sql-order-contents",
    title: "What was in an order",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "For order ORD-839883, list the product name, quantity and unit price of every line item.",
    expectation: "Two line items belonging to that order.",
    hints: [
      "You need order_items joined to products.",
      "Join on order_items.product_id = products.id.",
      "Filter with WHERE oi.order_id = 'ORD-839883'.",
    ],
    solution: `SELECT p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 'ORD-839883';`,
    compare: "rows",
  },
  {
    id: "sql-user-orders",
    title: "Join users and orders",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "List each order with the first name of the customer who placed it, the order id, its status and its total. Highest total first.",
    expectation: "Every order paired with its customer.",
    hints: [
      "orders.user_id references users.id.",
      "Give the tables short aliases to keep the query readable.",
      "ORDER BY o.total DESC",
    ],
    solution: `SELECT u.first_name, o.id AS order_id, o.status, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
ORDER BY o.total DESC;`,
    compare: "rows",
  },
  {
    id: "sql-users-without-orders",
    title: "Users who never ordered",
    group: "Joins",
    difficulty: "intermediate",
    prompt:
      "Find every user who has never placed an order. Return their id, first name and email.",
    expectation: "Three users with no matching order.",
    hints: [
      "An INNER JOIN would drop exactly the users you are looking for.",
      "Keep every user with a LEFT JOIN.",
      "Then filter for the rows where the order side is NULL.",
    ],
    solution: `SELECT u.id, u.first_name, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;`,
    compare: "rows",
  },
  {
    id: "sql-orders-per-status",
    title: "Orders and revenue by status",
    group: "Aggregates",
    difficulty: "intermediate",
    prompt:
      "For each order status, show the status, how many orders have it, and the sum of their totals. Highest revenue first.",
    expectation: "One row per status with a count and a sum.",
    hints: [
      "GROUP BY collapses rows into buckets.",
      "COUNT(*) counts the rows in each bucket.",
      "Alias the aggregates so the result is readable.",
    ],
    solution: `SELECT status, COUNT(*) AS orders, SUM(total) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC;`,
    compare: "rows",
  },
  {
    id: "sql-top-customers",
    title: "Customers with more than one order",
    group: "Aggregates",
    difficulty: "intermediate",
    prompt:
      "List the customers who have placed two or more orders, showing their first name and the number of orders, most orders first.",
    expectation: "Four customers with at least two orders.",
    hints: [
      "Join users to orders and group by the user.",
      "Aggregates cannot be filtered in WHERE.",
      "HAVING COUNT(o.id) >= 2",
    ],
    solution: `SELECT u.first_name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.first_name
HAVING COUNT(o.id) >= 2
ORDER BY order_count DESC;`,
    compare: "rows",
  },
  {
    id: "sql-above-average-orders",
    title: "Orders above the average",
    group: "Subqueries",
    difficulty: "advanced",
    prompt:
      "Find every order whose total is greater than the average order total. Return the order id and total, largest first.",
    expectation: "The orders above the overall average.",
    hints: [
      "You need the average of all orders before you can compare against it.",
      "A scalar subquery in WHERE can compute it.",
      "WHERE total > (SELECT AVG(total) FROM orders)",
    ],
    solution: `SELECT id, total
FROM orders
WHERE total > (SELECT AVG(total) FROM orders)
ORDER BY total DESC;`,
    compare: "rows",
  },
  {
    id: "sql-audio-buyers",
    title: "Customers who bought audio products",
    group: "Subqueries",
    difficulty: "advanced",
    prompt:
      "List the id, first name and email of every user who has ordered at least one product in the 'audio' category.",
    expectation: "The distinct set of customers with an audio purchase.",
    hints: [
      "Work out which user_ids appear on orders containing an audio product.",
      "That inner query needs orders, order_items and products.",
      "Then use WHERE id IN ( … ).",
    ],
    solution: `SELECT id, first_name, email
FROM users
WHERE id IN (
    SELECT o.user_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE p.category = 'audio'
);`,
    compare: "rows",
  },
  {
    id: "sql-cancelled-with-payment",
    title: "Cancelled orders that were still charged",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Find orders with status 'cancelled' that have a payment with status 'completed'. Return the order id, order status, payment status and amount.",
    expectation: "The orders where a customer was charged for a cancellation.",
    hints: [
      "Join orders to payments on order_id.",
      "Both conditions go in the WHERE clause.",
      "Every row returned is a defect worth reporting.",
    ],
    solution: `SELECT o.id AS order_id, o.status AS order_status, p.status AS payment_status, p.amount
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.status = 'cancelled' AND p.status = 'completed';`,
    compare: "rows",
  },
  {
    id: "sql-payment-mismatch",
    title: "Payments that disagree with the order total",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Find every order whose payment amount is different from the stored order total. Return the order id, the order total, the payment amount and the difference.",
    expectation: "The orders where the captured amount does not match.",
    hints: [
      "Join orders to payments.",
      "Use <> to compare the two amounts.",
      "You can compute the difference directly in the SELECT list.",
    ],
    solution: `SELECT o.id, o.total, p.amount, p.amount - o.total AS difference
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE p.amount <> o.total;`,
    compare: "rows",
  },
  {
    id: "sql-orphan-items",
    title: "Orphaned line items",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Find every row in order_items whose order_id does not match any existing order. Return the item id and its order_id.",
    expectation: "The line items pointing at an order that no longer exists.",
    hints: [
      "Keep all order_items with a LEFT JOIN onto orders.",
      "The orphans are the rows where the orders side came back NULL.",
      "WHERE o.id IS NULL",
    ],
    solution: `SELECT oi.id, oi.order_id
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.id IS NULL;`,
    compare: "rows",
  },
  {
    id: "sql-total-mismatch",
    title: "Order totals that do not match their line items",
    group: "QA Validation",
    difficulty: "advanced",
    prompt:
      "Find every order whose stored total is different from the sum of quantity × unit_price across its line items. Return the order id, the stored total and the calculated total.",
    expectation: "The order where the stored total is wrong.",
    hints: [
      "Join orders to order_items and group by the order.",
      "The calculated total is SUM(oi.quantity * oi.unit_price).",
      "Compare them in HAVING, because the comparison involves an aggregate.",
    ],
    solution: `SELECT o.id, o.total AS order_total, SUM(oi.quantity * oi.unit_price) AS calculated_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total
HAVING o.total <> SUM(oi.quantity * oi.unit_price);`,
    compare: "rows",
  },
];

export const sqlExerciseGroups = Array.from(
  sqlExercises.reduce((map, exercise) => {
    const list = map.get(exercise.group) ?? [];
    list.push(exercise);
    map.set(exercise.group, list);
    return map;
  }, new Map<string, SqlExercise[]>()),
).map(([group, items]) => ({ group, items }));

export function getSqlExercise(id: string) {
  return sqlExercises.find((e) => e.id === id);
}

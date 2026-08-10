import type { Module } from "../types";

export const sqlModule: Module = {
  id: "sql-for-testers",
  order: 15,
  title: "SQL for Testers",
  tagline: "Validate the layer the UI cannot show you",
  summary:
    "SELECT, filtering, joins and aggregates aimed squarely at QA work: verifying what the application actually stored, and finding the inconsistencies nobody's UI will ever display.",
  difficulty: "intermediate",
  icon: "Database",
  track: "data",
  lessons: [
    {
      id: "sql-why",
      slug: "why-testers-need-sql",
      title: "Why testers need SQL",
      moduleId: "sql-for-testers",
      summary:
        "The UI shows what it chose to show. The database shows what happened.",
      difficulty: "beginner",
      estimatedTime: 10,
      objectives: [
        "Explain the UI / API / database validation layers",
        "Identify bugs only visible in data",
        "Know where SQL fits in a test strategy",
      ],
      sections: [
        {
          kind: "diagram",
          title: "Three layers, three kinds of truth",
          ascii: `                 QA VALIDATION
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
       UI            API        DATABASE
        │             │             │
   Playwright     API tests        SQL
        │             │             │
        └─────────────┼─────────────┘
                      ↓
              End-to-end confidence`,
        },
        {
          kind: "text",
          title: "What the UI cannot tell you",
          body: [
            "A confirmation screen saying 'Order Successful!' proves the front end rendered a success state. It does not prove the order row exists, that its total matches the line items, or that the payment was recorded against the right order.",
            "Those are data questions, and SQL is how you answer them.",
          ],
        },
        {
          kind: "list",
          title: "Bugs that only show up in the data",
          items: [
            "An order marked `cancelled` with a `completed` payment — a refund that never happened.",
            "An order whose `total` does not equal the sum of its line items.",
            "Orphaned `order_items` rows pointing at a deleted order.",
            "Duplicate orders created by a double-clicked submit button.",
            "A user with two active addresses when the schema assumes one.",
          ],
        },
        {
          kind: "practice",
          href: "/practice/sql",
          title: "Open the SQL Lab",
          body: "It runs an in-browser SQL engine over a fixed seven-table dataset. No database to install, and the answers are the same for everyone.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Read access, not write access",
          body: [
            "Testers generally query; they rarely mutate. Everything in this module is SELECT-based, which is also the safest thing to be doing in a shared environment.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating a green UI test as proof of persistence",
          body: "Optimistic rendering shows success before the server confirms anything.",
        },
      ],
      keyTakeaways: [
        "UI, API and database each answer a different question.",
        "Cross-layer inconsistencies are invisible to UI-only testing.",
        "For QA work, SELECT is almost the whole language.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which bug is invisible from the UI alone?",
          options: [
            { id: "a", text: "A misaligned button" },
            { id: "b", text: "An order marked cancelled whose payment is still completed" },
            { id: "c", text: "A missing validation message" },
            { id: "d", text: "A broken link" },
          ],
          correct: "b",
          explanation:
            "Nothing in the interface displays that relationship. Only a join across orders and payments reveals it.",
        },
      ],
    },
    {
      id: "sql-select",
      slug: "select-where-order-by",
      title: "SELECT, WHERE and ORDER BY",
      moduleId: "sql-for-testers",
      summary: "Reading rows, filtering them and controlling the order.",
      difficulty: "beginner",
      estimatedTime: 15,
      objectives: [
        "Select specific columns and alias them",
        "Filter with comparison and logical operators",
        "Sort and limit results",
      ],
      sections: [
        {
          kind: "code",
          title: "The basic shape",
          language: "sql",
          code: `
SELECT id, first_name, email, status
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;
`,
        },
        {
          kind: "table",
          title: "Clause order",
          headers: ["Clause", "Purpose"],
          rows: [
            ["SELECT", "Which columns to return"],
            ["FROM", "Which table"],
            ["WHERE", "Which rows"],
            ["GROUP BY", "How to bucket rows"],
            ["HAVING", "Which buckets to keep"],
            ["ORDER BY", "How to sort"],
            ["LIMIT", "How many to return"],
          ],
        },
        {
          kind: "code",
          title: "Filtering",
          language: "sql",
          code: `
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE category = 'audio' AND in_stock = 1;
SELECT * FROM orders  WHERE status IN ('pending', 'paid');
SELECT * FROM products WHERE price BETWEEN 50 AND 200;
SELECT * FROM users   WHERE email LIKE '%@example.com';
SELECT * FROM users   WHERE phone IS NULL;
SELECT DISTINCT category FROM products;
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "NULL is not a value",
          body: [
            "`WHERE phone = NULL` returns nothing, ever. NULL means 'unknown', and unknown is never equal to anything — including itself. Use `IS NULL` and `IS NOT NULL`.",
          ],
        },
        {
          kind: "code",
          title: "Aliases make output readable",
          language: "sql",
          code: `
SELECT
    u.first_name AS customer,
    o.id         AS order_id,
    o.total      AS order_total
FROM orders o
JOIN users u ON u.id = o.user_id;
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "A habit worth forming",
          body: [
            "Before running a WHERE clause you are unsure about, run it as a plain SELECT with a LIMIT first. Seeing the shape of the data prevents most wrong answers.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "= NULL instead of IS NULL",
          body: "Silently returns zero rows, which reads as 'no problems found'.",
        },
        {
          title: "LIKE without a wildcard",
          body: "`LIKE 'test'` is just equality. You probably wanted `LIKE '%test%'`.",
        },
      ],
      keyTakeaways: [
        "SELECT / FROM / WHERE / ORDER BY / LIMIT covers most QA queries.",
        "IN, BETWEEN and LIKE express common filters concisely.",
        "NULL comparisons need IS NULL.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt: "This query returns no rows even though many users have no phone. Why?",
          code: `SELECT * FROM users WHERE phone = NULL;`,
          options: [
            { id: "a", text: "phone is not a column" },
            { id: "b", text: "NULL comparisons need IS NULL" },
            { id: "c", text: "It needs a LIMIT" },
            { id: "d", text: "NULL must be quoted" },
          ],
          correct: "b",
          explanation:
            "Nothing equals NULL. `WHERE phone IS NULL` is the correct form.",
        },
      ],
      sqlExercises: ["sql-active-users", "sql-expensive-products", "sql-missing-phone"],
    },
    {
      id: "sql-joins",
      slug: "joins",
      title: "JOIN and LEFT JOIN",
      moduleId: "sql-for-testers",
      summary:
        "Connecting tables — and using LEFT JOIN to find the rows that are missing.",
      difficulty: "intermediate",
      estimatedTime: 18,
      objectives: [
        "Write an inner join across two and three tables",
        "Use LEFT JOIN to find absent relationships",
        "Read the ShopEasy schema",
      ],
      sections: [
        {
          kind: "diagram",
          title: "The ShopEasy schema",
          ascii: `users ──┬──< orders ──< order_items >── products
        │        │
        │        └──< payments
        │
        ├──< addresses
        └──< messages`,
          caption: "'<' points from the one side to the many side.",
        },
        {
          kind: "code",
          title: "INNER JOIN — rows that match on both sides",
          language: "sql",
          code: `
SELECT
    u.first_name,
    o.id     AS order_id,
    o.total,
    o.status
FROM users u
JOIN orders o ON o.user_id = u.id
ORDER BY o.total DESC;
`,
        },
        {
          kind: "code",
          title: "Three tables — what was actually in an order",
          language: "sql",
          code: `
SELECT
    o.id        AS order_id,
    p.name      AS product,
    oi.quantity,
    oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.id = 'ORD-839472';
`,
        },
        {
          kind: "text",
          title: "LEFT JOIN finds what is missing",
          body: [
            "An inner join drops rows with no match. A LEFT JOIN keeps every row from the left table and fills the right side with NULL. Adding `WHERE right.id IS NULL` is the standard idiom for 'find the ones with nothing on the other side'.",
          ],
        },
        {
          kind: "code",
          title: "Users who have never ordered",
          language: "sql",
          code: `
SELECT u.id, u.first_name, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
`,
        },
        {
          kind: "code",
          title: "Orders with no payment recorded",
          language: "sql",
          code: `
SELECT o.id, o.status, o.total
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL;
`,
          caption:
            "A genuine data-integrity check, and a bug if any 'paid' order shows up here.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Joins multiply rows",
          body: [
            "One order with three line items produces three rows. If you then `SUM(o.total)` you have counted the order total three times. Aggregate the many side first, or use a subquery.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting the ON clause",
          body: "You get a cross join: every row against every row. A 100-row and 50-row table become 5,000 rows.",
        },
        {
          title: "Filtering the right table in WHERE after a LEFT JOIN",
          body: "`WHERE p.status = 'completed'` turns the LEFT JOIN back into an inner join. Put that condition in the ON clause instead.",
        },
      ],
      keyTakeaways: [
        "JOIN keeps matches; LEFT JOIN keeps everything on the left.",
        "LEFT JOIN + IS NULL is the 'find the missing ones' pattern.",
        "Joining a one-to-many relationship duplicates the one side.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "How do you find users who have never placed an order?",
          options: [
            { id: "a", text: "JOIN orders and check total = 0" },
            { id: "b", text: "LEFT JOIN orders and filter WHERE orders.id IS NULL" },
            { id: "c", text: "SELECT * FROM users WHERE orders IS NULL" },
            { id: "d", text: "RIGHT JOIN orders" },
          ],
          correct: "b",
          explanation:
            "The LEFT JOIN keeps every user; the NULL check keeps only those with no matching order.",
        },
        {
          id: "q2",
          type: "find-the-bug",
          prompt: "This is meant to list all orders with their payment status, but drops unpaid orders. Why?",
          code: `SELECT o.id, p.status
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.status = 'completed';`,
          options: [
            { id: "a", text: "LEFT JOIN is the wrong join type" },
            { id: "b", text: "The WHERE clause on the right table cancels the LEFT JOIN" },
            { id: "c", text: "The ON condition is wrong" },
            { id: "d", text: "payments has no status column" },
          ],
          correct: "b",
          explanation:
            "Rows with NULL payment status fail the WHERE. Move the condition into the ON clause to preserve them.",
        },
      ],
      sqlExercises: ["sql-user-orders", "sql-users-without-orders", "sql-order-contents"],
    },
    {
      id: "sql-aggregates",
      slug: "group-by-and-aggregates",
      title: "GROUP BY, aggregates and HAVING",
      moduleId: "sql-for-testers",
      summary:
        "COUNT, SUM, AVG, MIN, MAX — and filtering the groups themselves.",
      difficulty: "intermediate",
      estimatedTime: 16,
      objectives: [
        "Aggregate rows into summary values",
        "Group by one or more columns",
        "Filter groups with HAVING",
      ],
      sections: [
        {
          kind: "code",
          title: "Aggregates over the whole table",
          language: "sql",
          code: `
SELECT
    COUNT(*)     AS order_count,
    SUM(total)   AS revenue,
    AVG(total)   AS average_order,
    MIN(total)   AS smallest,
    MAX(total)   AS largest
FROM orders;
`,
        },
        {
          kind: "code",
          title: "Per group",
          language: "sql",
          code: `
SELECT
    status,
    COUNT(*)   AS orders,
    SUM(total) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC;
`,
        },
        {
          kind: "code",
          title: "HAVING filters groups, WHERE filters rows",
          language: "sql",
          code: `
SELECT
    u.id,
    u.first_name,
    COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status <> 'cancelled'      -- rows, before grouping
GROUP BY u.id, u.first_name
HAVING COUNT(o.id) >= 2            -- groups, after aggregating
ORDER BY order_count DESC;
`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "COUNT(*) vs. COUNT(column)",
          body: [
            "`COUNT(*)` counts rows. `COUNT(column)` counts non-NULL values in that column. After a LEFT JOIN they differ, and that difference is often exactly the number you want.",
          ],
        },
        {
          kind: "code",
          title: "A real validation query",
          language: "sql",
          code: `
-- Does every order total match the sum of its line items?
SELECT
    o.id,
    o.total                              AS order_total,
    SUM(oi.quantity * oi.unit_price)     AS calculated_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total
HAVING o.total <> SUM(oi.quantity * oi.unit_price);
`,
          caption:
            "Any row returned is a discrepancy worth reporting.",
        },
      ],
      commonMistakes: [
        {
          title: "Selecting a column that is not grouped or aggregated",
          body: "Strict engines reject it; lenient ones return an arbitrary row's value, which is worse.",
        },
        {
          title: "Using WHERE to filter an aggregate",
          body: "`WHERE COUNT(*) > 2` is invalid — aggregates are only available to HAVING.",
        },
      ],
      keyTakeaways: [
        "WHERE filters rows before grouping; HAVING filters groups after.",
        "Every selected column must be grouped or aggregated.",
        "Comparing a stored total against a recalculated one is a classic QA check.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "You need users with more than two orders. Where does that condition go?",
          options: [
            { id: "a", text: "WHERE COUNT(o.id) > 2" },
            { id: "b", text: "HAVING COUNT(o.id) > 2" },
            { id: "c", text: "ORDER BY COUNT(o.id) > 2" },
            { id: "d", text: "In the JOIN's ON clause" },
          ],
          correct: "b",
          explanation:
            "WHERE runs before grouping, so aggregates do not exist yet. HAVING filters the resulting groups.",
        },
      ],
      sqlExercises: ["sql-orders-per-status", "sql-top-customers", "sql-total-mismatch"],
    },
    {
      id: "sql-subqueries",
      slug: "subqueries",
      title: "Subqueries",
      moduleId: "sql-for-testers",
      summary: "Queries inside queries, for the questions a single SELECT cannot express.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Use a subquery in WHERE with IN",
        "Compare against a scalar subquery",
        "Choose between a subquery and a join",
      ],
      sections: [
        {
          kind: "code",
          title: "IN with a subquery",
          language: "sql",
          code: `
-- Every user who has ordered something from the audio category
SELECT id, first_name, email
FROM users
WHERE id IN (
    SELECT o.user_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON p.id = oi.product_id
    WHERE p.category = 'audio'
);
`,
        },
        {
          kind: "code",
          title: "Scalar subquery — compare against a computed value",
          language: "sql",
          code: `
SELECT id, total
FROM orders
WHERE total > (SELECT AVG(total) FROM orders)
ORDER BY total DESC;
`,
        },
        {
          kind: "code",
          title: "NOT IN — the inverse",
          language: "sql",
          code: `
SELECT id, first_name
FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
`,
        },
        {
          kind: "callout",
          tone: "danger",
          title: "NOT IN and NULL do not mix",
          body: [
            "If the subquery returns even one NULL, `NOT IN` returns no rows at all. `NOT EXISTS` or a LEFT JOIN with `IS NULL` is safer whenever the column is nullable.",
          ],
        },
        {
          kind: "table",
          title: "Subquery or join?",
          headers: ["Need", "Prefer"],
          rows: [
            ["Columns from both tables in the output", "JOIN"],
            ["Only a membership test", "IN / EXISTS subquery"],
            ["Compare against an aggregate of the whole table", "Scalar subquery"],
            ["Find rows with no match", "LEFT JOIN + IS NULL, or NOT EXISTS"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "A subquery in the SELECT list running per row",
          body: "It can be very slow on large tables. A join usually expresses the same thing more efficiently.",
        },
        {
          title: "NOT IN over a nullable column",
          body: "Returns an empty result set that looks like 'no issues found'.",
        },
      ],
      keyTakeaways: [
        "IN for membership, scalar subqueries for comparisons against aggregates.",
        "NOT IN is unsafe with NULLs — use NOT EXISTS or LEFT JOIN.",
        "If you need columns from both sides, use a join.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why can NOT IN return zero rows unexpectedly?",
          options: [
            { id: "a", text: "It is not supported in most engines" },
            { id: "b", text: "A single NULL in the subquery makes every comparison unknown" },
            { id: "c", text: "It requires an index" },
            { id: "d", text: "It only works with numbers" },
          ],
          correct: "b",
          explanation:
            "Comparisons against NULL are unknown, so no row can satisfy NOT IN. Use NOT EXISTS instead.",
        },
      ],
      sqlExercises: ["sql-above-average-orders", "sql-audio-buyers"],
    },
    {
      id: "sql-qa-scenarios",
      slug: "qa-validation-scenarios",
      title: "QA validation scenarios",
      moduleId: "sql-for-testers",
      summary:
        "The queries you will actually be asked for: reconciling states, finding orphans, proving a bug.",
      difficulty: "advanced",
      estimatedTime: 18,
      objectives: [
        "Write cross-table consistency checks",
        "Turn a query result into a defensible bug report",
        "Combine Playwright and SQL in one verification",
      ],
      sections: [
        {
          kind: "code",
          title: "Cancelled orders with completed payments",
          language: "sql",
          code: `
SELECT
    o.id      AS order_id,
    o.status  AS order_status,
    p.status  AS payment_status,
    p.amount
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.status = 'cancelled'
  AND p.status = 'completed';
`,
          caption:
            "Every row here is money taken for an order that was cancelled.",
        },
        {
          kind: "code",
          title: "Payment amounts that disagree with order totals",
          language: "sql",
          code: `
SELECT o.id, o.total, p.amount, (p.amount - o.total) AS difference
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE p.amount <> o.total;
`,
        },
        {
          kind: "code",
          title: "Orphaned line items",
          language: "sql",
          code: `
SELECT oi.id, oi.order_id
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.id IS NULL;
`,
        },
        {
          kind: "code",
          title: "Messages referencing an order that does not exist",
          language: "sql",
          code: `
SELECT m.id, m.subject, m.order_id
FROM messages m
LEFT JOIN orders o ON o.id = m.order_id
WHERE m.order_id IS NOT NULL
  AND o.id IS NULL;
`,
        },
        {
          kind: "text",
          title: "From result set to bug report",
          body: [
            "A query result is evidence, not yet a report. A useful bug says what the rule is, how many rows violate it, gives one concrete example, states the impact, and includes the query so anyone can re-run it.",
          ],
        },
        {
          kind: "code",
          title: "A report that gets fixed",
          language: "text",
          code: `
Title: Cancelled orders retain completed payments

Rule:     Cancelling an order must refund or void its payment.
Found:    3 orders violate this.
Example:  ORD-839472 — order.status='cancelled',
          payment.status='completed', amount=$249.50
Impact:   Customers are charged for cancelled orders.
Query:    SELECT o.id, o.status, p.status, p.amount
          FROM orders o JOIN payments p ON p.order_id = o.id
          WHERE o.status='cancelled' AND p.status='completed';
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Combining Playwright and SQL",
          body: [
            "In a real suite, place the order through the UI, capture the generated order number, then run the reconciliation query for that id. The UI proves the journey works; the query proves the data is right.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Reporting a count with no example",
          body: "'17 rows are inconsistent' is unactionable. One concrete id makes it reproducible.",
        },
        {
          title: "Querying production without checking first",
          body: "An unbounded join on a large table can affect live performance. Use a read replica and a LIMIT.",
        },
      ],
      keyTakeaways: [
        "Consistency checks are joins plus a condition that should never be true.",
        "A good data bug report includes the rule, the count, an example and the query.",
        "SQL validation complements the UI journey rather than replacing it.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which query finds order items whose order no longer exists?",
          options: [
            { id: "a", text: "SELECT * FROM order_items WHERE order_id IS NULL" },
            { id: "b", text: "LEFT JOIN orders on order_id and filter WHERE orders.id IS NULL" },
            { id: "c", text: "JOIN orders and count the rows" },
            { id: "d", text: "SELECT * FROM orders WHERE id NOT IN (SELECT order_id FROM order_items)" },
          ],
          correct: "b",
          explanation:
            "Option A only finds items with no order reference at all; option D finds orders without items — the opposite question.",
        },
      ],
      sqlExercises: [
        "sql-cancelled-with-payment",
        "sql-payment-mismatch",
        "sql-orphan-items",
      ],
    },
  ],
};

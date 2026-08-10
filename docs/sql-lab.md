# SQL Lab

`lib/sql-engine/` is a small SQL engine written from scratch: a tokenizer, a
recursive-descent parser and an executor, running over a fixed in-memory
dataset.

## Why simulate it

A real database would mean a connection string, a migration step, a seeding
step, credentials, and a hosting bill — before anyone writes `SELECT`. It would
also make exercises non-deterministic, because two learners' databases drift
apart.

An in-memory engine keeps the platform free to deploy, portable, and
**deterministic**: every learner's query returns exactly the same rows, so the
lab can check an answer by running the reference solution and comparing result
sets.

The trade-off is honest and stated in the UI: this is not a database. There are
no indexes, no transactions, no query planner, and no write support.

## Pipeline

```text
SQL text
   │
   ▼
tokenizer.ts    keywords, identifiers, strings, numbers, operators, comments
   │
   ▼
parser.ts       recursive descent → Query AST
   │
   ▼
executor.ts     FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT
                → ORDER BY → LIMIT/OFFSET
   │
   ▼
QueryResult     { columns, rows, rowCount, durationMs, notice? }
```

## Supported SQL

| Area | Support |
| --- | --- |
| Projection | Columns, `*`, `table.*`, aliases with or without `AS`, arithmetic |
| Filtering | `=`, `<>`, `!=`, `<`, `>`, `<=`, `>=`, `AND`, `OR`, `NOT` |
| Predicates | `IN` (list or subquery), `BETWEEN`, `LIKE`, `IS NULL`, `IS NOT NULL` |
| Joins | `JOIN` / `INNER JOIN`, `LEFT JOIN` (+ `OUTER`), with `ON` |
| Grouping | `GROUP BY` with multiple keys, `HAVING` |
| Aggregates | `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)`, `SUM`, `AVG`, `MIN`, `MAX` |
| Functions | `ROUND`, `ABS`, `UPPER`, `LOWER`, `LENGTH`, `COALESCE` |
| Subqueries | Scalar in `WHERE`, and `IN (SELECT …)` |
| Other | `DISTINCT`, `ORDER BY` (including on a select alias), `LIMIT`, `OFFSET`, `CASE WHEN` |

Not supported: `RIGHT`/`FULL JOIN` (the error suggests rewriting as a `LEFT
JOIN`), window functions, CTEs, `UNION`, and anything that writes.

## Semantics worth noting

**NULL is three-valued.** `WHERE phone = NULL` returns nothing, `IS NULL` works,
and `NOT IN` over a list containing a NULL returns no rows — the exact trap the
subqueries lesson warns about, reproduced rather than smoothed over.

**LEFT JOIN produces real NULLs.** The unmatched side resolves to NULL for every
column, so `LEFT JOIN … WHERE right.id IS NULL` finds missing relationships
exactly as expected.

**ORDER BY can reference a select alias**, because `ORDER BY revenue DESC` after
`SUM(total) AS revenue` is what people actually write.

**Aggregates are only available to HAVING**, not `WHERE` — the rule the
aggregates lesson teaches.

## Errors

Errors carry a message, a character position where available, and a hint:

```text
Unknown table "customers"
Available tables: users, products, orders, order_items, payments, addresses, messages.
```

```text
DELETE is not supported — the SQL Lab is read-only
Testers typically only need SELECT. The dataset is fixed so exercises stay reproducible.
```

An empty result also gets a note, because in QA validation zero rows usually
means *no violations found*, which is the good outcome and is easy to
misread as a broken query.

## The dataset

Seven tables modelled on ShopEasy:

```text
users ──┬──< orders ──< order_items >── products
        │        │
        │        └──< payments
        │
        ├──< addresses
        └──< messages
```

8 users, 6 products, 9 orders, 14 line items, 8 payments, 6 addresses, 5
messages.

### Seeded defects

The data contains four deliberate inconsistencies, one for each QA validation
exercise:

| Defect | Where | Found by |
| --- | --- | --- |
| Cancelled order with a completed payment | `ORD-839472` | Join orders to payments, filter both statuses |
| Payment amount ≠ order total | `ORD-840294` | Join and compare with `<>` |
| Orphaned line item | `order_items.id = 14` → `ORD-999999` | `LEFT JOIN` + `IS NULL` |
| Stored total ≠ sum of line items | `ORD-840568` | `GROUP BY` + `HAVING` |

A fifth, softer one: `messages.id = 5` references an order that does not exist.

These are not decoration. They are the reason the lab exists — a UI can never
show you that a cancelled order was still charged.

## Answer checking

The lab runs the learner's query and the reference solution, then compares:

1. Row counts must match, else the feedback points at the filter conditions.
2. Row *values* are compared as multisets, with each row's cells sorted, so
   column order and aliases do not matter — only the data.

That keeps checking strict about correctness and relaxed about style.

## Tests

`tests/unit/sql-engine.spec.ts` covers projection, filtering, NULL semantics,
both join types, grouping and `HAVING`, aggregates, subqueries, the read-only
guard, and error messages — plus a check that every published exercise solution
runs and returns rows.

## Future work

- Window functions (`ROW_NUMBER`, `RANK`) for deduplication scenarios
- CTEs (`WITH`), which is how most real validation queries are written
- `EXPLAIN`-style output showing the executed clause order
- A larger dataset with more subtle defects

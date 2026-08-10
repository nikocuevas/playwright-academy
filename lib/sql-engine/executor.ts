import { getTable, tableNames, type Row, type SqlValue } from "./dataset";
import { isAggregate, parseSql, type Expr, type Query } from "./parser";
import { SqlError } from "./tokenizer";

/**
 * A tiny in-memory SQL executor.
 *
 * It supports the SELECT surface the SQL for Testers module teaches: joins,
 * filtering, grouping, aggregates, subqueries and ordering. It is not a
 * database — there is no indexing, no transactions and no write support.
 */

/** A joined row: alias -> source row. */
type Scope = Record<string, Row | null>;

export type QueryResult = {
  columns: string[];
  rows: SqlValue[][];
  rowCount: number;
  durationMs: number;
  /** Set when the engine wants to teach something about the result. */
  notice?: string;
};

export function executeSql(sql: string): QueryResult {
  const started = performance.now();
  const query = parseSql(sql);
  const scopes = buildScopes(query);
  const result = runQuery(query, scopes);

  return {
    ...result,
    durationMs: Math.max(0.1, Math.round((performance.now() - started) * 10) / 10),
  };
}

function buildScopes(query: Query): Scope[] {
  if (!query.from) return [{}];

  const table = resolveTable(query.from.name);
  const alias = query.from.alias ?? query.from.name;

  let scopes: Scope[] = table.rows.map((row) => ({ [alias]: row }));

  for (const join of query.joins) {
    const joined = resolveTable(join.table.name);
    const joinAlias = join.table.alias ?? join.table.name;
    const next: Scope[] = [];

    for (const scope of scopes) {
      let matched = false;

      for (const row of joined.rows) {
        const candidate: Scope = { ...scope, [joinAlias]: row };
        if (!join.on || isTruthy(evaluate(join.on, candidate, null))) {
          next.push(candidate);
          matched = true;
        }
      }

      if (!matched && join.type === "left") {
        next.push({ ...scope, [joinAlias]: null });
      }
    }

    scopes = next;
  }

  return scopes;
}

function resolveTable(name: string) {
  const table = getTable(name);
  if (!table) {
    throw new SqlError(
      `Unknown table "${name}"`,
      undefined,
      `Available tables: ${tableNames.join(", ")}.`,
    );
  }
  return table;
}

function runQuery(query: Query, allScopes: Scope[]): Omit<QueryResult, "durationMs"> {
  const filtered = query.where
    ? allScopes.filter((scope) => isTruthy(evaluate(query.where!, scope, null)))
    : allScopes;

  const selectHasAggregate = query.columns.some((c) => containsAggregate(c.expr));
  const havingHasAggregate = query.having ? containsAggregate(query.having) : false;
  const grouped = query.groupBy.length > 0;

  let groups: { key: SqlValue[]; rows: Scope[] }[];

  if (grouped) {
    const map = new Map<string, { key: SqlValue[]; rows: Scope[] }>();
    for (const scope of filtered) {
      const key = query.groupBy.map((expr) => evaluate(expr, scope, null));
      const hash = JSON.stringify(key);
      const bucket = map.get(hash);
      if (bucket) bucket.rows.push(scope);
      else map.set(hash, { key, rows: [scope] });
    }
    groups = [...map.values()];
  } else if (selectHasAggregate || havingHasAggregate) {
    // A bare aggregate collapses everything into one group.
    groups = [{ key: [], rows: filtered }];
  } else {
    groups = filtered.map((scope) => ({ key: [], rows: [scope] }));
  }

  if (query.having) {
    groups = groups.filter((group) =>
      isTruthy(evaluate(query.having!, group.rows[0] ?? {}, group.rows)),
    );
  }

  const columns = expandColumns(query, filtered[0]);

  let rows = groups.map((group) =>
    columns.map((column) =>
      evaluate(column.expr, group.rows[0] ?? {}, group.rows),
    ),
  );

  if (query.distinct) {
    const seen = new Set<string>();
    rows = rows.filter((row) => {
      const hash = JSON.stringify(row);
      if (seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });
  }

  if (query.orderBy.length > 0) {
    // SQL lets ORDER BY reference a SELECT alias; resolve those first.
    const byLabel = new Map(columns.map((c) => [c.label.toLowerCase(), c.expr]));
    const orderExprs = query.orderBy.map((order) =>
      order.expr.kind === "column" && !order.expr.table
        ? (byLabel.get(order.expr.name.toLowerCase()) ?? order.expr)
        : order.expr,
    );

    const sortKeys = groups.map((group) =>
      orderExprs.map((expr) => evaluate(expr, group.rows[0] ?? {}, group.rows)),
    );

    const indexed = rows.map((row, index) => ({ row, keys: sortKeys[index] ?? [] }));

    indexed.sort((a, b) => {
      for (let i = 0; i < query.orderBy.length; i += 1) {
        const cmp = compareValues(a.keys[i], b.keys[i]);
        if (cmp !== 0) return query.orderBy[i].direction === "desc" ? -cmp : cmp;
      }
      return 0;
    });

    rows = indexed.map((entry) => entry.row);
  }

  const offset = query.offset ?? 0;
  if (offset > 0) rows = rows.slice(offset);
  if (query.limit !== undefined) rows = rows.slice(0, query.limit);

  return {
    columns: columns.map((c) => c.label),
    rows,
    rowCount: rows.length,
    notice:
      rows.length === 0
        ? "0 rows. For a QA validation query that often means no violations were found — which is the good outcome."
        : undefined,
  };
}

type ExpandedColumn = { label: string; expr: Expr };

function expandColumns(query: Query, sample: Scope | undefined): ExpandedColumn[] {
  const out: ExpandedColumn[] = [];

  for (const item of query.columns) {
    if (item.expr.kind === "star") {
      const aliases = starAliases(query, item.expr.table);

      for (const alias of aliases) {
        const table = resolveTable(tableNameForAlias(query, alias));
        for (const column of table.columns) {
          out.push({
            label: aliases.length > 1 ? `${alias}.${column.name}` : column.name,
            expr: { kind: "column", table: alias, name: column.name },
          });
        }
      }
      continue;
    }

    out.push({ label: item.alias ?? describeExpr(item.expr), expr: item.expr });
  }

  if (out.length === 0 && sample) {
    throw new SqlError("SELECT needs at least one column");
  }

  return out;
}

function starAliases(query: Query, table?: string): string[] {
  const aliases: string[] = [];
  if (query.from) aliases.push(query.from.alias ?? query.from.name);
  for (const join of query.joins) aliases.push(join.table.alias ?? join.table.name);

  if (!table) return aliases;
  if (!aliases.includes(table)) {
    throw new SqlError(
      `Unknown table alias "${table}"`,
      undefined,
      `Available: ${aliases.join(", ")}.`,
    );
  }
  return [table];
}

function tableNameForAlias(query: Query, alias: string): string {
  if (query.from && (query.from.alias ?? query.from.name) === alias) return query.from.name;
  const join = query.joins.find((j) => (j.table.alias ?? j.table.name) === alias);
  if (join) return join.table.name;
  return alias;
}

export function describeExpr(expr: Expr): string {
  switch (expr.kind) {
    case "column":
      return expr.table ? `${expr.table}.${expr.name}` : expr.name;
    case "literal":
      return expr.value === null ? "NULL" : String(expr.value);
    case "function":
      return `${expr.name}(${expr.star ? "*" : expr.args.map(describeExpr).join(", ")})`;
    case "binary":
      return `${describeExpr(expr.left)} ${expr.op} ${describeExpr(expr.right)}`;
    case "unary":
      return `${expr.op} ${describeExpr(expr.expr)}`;
    case "star":
      return "*";
    case "case":
      return "CASE";
    case "subquery":
      return "(subquery)";
    default:
      return "expr";
  }
}

function containsAggregate(expr: Expr): boolean {
  switch (expr.kind) {
    case "function":
      return isAggregate(expr.name) || expr.args.some(containsAggregate);
    case "binary":
      return containsAggregate(expr.left) || containsAggregate(expr.right);
    case "unary":
      return containsAggregate(expr.expr);
    case "in":
      return containsAggregate(expr.expr);
    case "between":
      return (
        containsAggregate(expr.expr) ||
        containsAggregate(expr.low) ||
        containsAggregate(expr.high)
      );
    case "like":
      return containsAggregate(expr.expr);
    case "isNull":
      return containsAggregate(expr.expr);
    case "case":
      return expr.branches.some(
        (b) => containsAggregate(b.when) || containsAggregate(b.then),
      );
    default:
      return false;
  }
}

/**
 * Evaluates an expression.
 *
 * `groupRows` is present when evaluating in an aggregate context; aggregate
 * functions fold over it, while plain columns read the group's first row.
 */
function evaluate(expr: Expr, scope: Scope, groupRows: Scope[] | null): SqlValue {
  switch (expr.kind) {
    case "literal":
      return expr.value;

    case "column":
      return readColumn(expr, scope);

    case "star":
      return null;

    case "unary": {
      if (expr.op === "NOT") {
        const value = evaluate(expr.expr, scope, groupRows);
        if (value === null) return null;
        return isTruthy(value) ? 0 : 1;
      }
      const value = evaluate(expr.expr, scope, groupRows);
      return value === null ? null : -Number(value);
    }

    case "binary":
      return evaluateBinary(expr, scope, groupRows);

    case "function":
      return evaluateFunction(expr, scope, groupRows);

    case "isNull": {
      const value = evaluate(expr.expr, scope, groupRows);
      const isNull = value === null;
      return (expr.negated ? !isNull : isNull) ? 1 : 0;
    }

    case "like": {
      const value = evaluate(expr.expr, scope, groupRows);
      const pattern = evaluate(expr.pattern, scope, groupRows);
      if (value === null || pattern === null) return null;
      const matched = likeToRegExp(String(pattern)).test(String(value));
      return (expr.negated ? !matched : matched) ? 1 : 0;
    }

    case "between": {
      const value = evaluate(expr.expr, scope, groupRows);
      const low = evaluate(expr.low, scope, groupRows);
      const high = evaluate(expr.high, scope, groupRows);
      if (value === null || low === null || high === null) return null;
      const within =
        compareValues(value, low) >= 0 && compareValues(value, high) <= 0;
      return (expr.negated ? !within : within) ? 1 : 0;
    }

    case "in": {
      const value = evaluate(expr.expr, scope, groupRows);
      const candidates = expr.query
        ? runSubquery(expr.query)
        : (expr.list ?? []).map((item) => evaluate(item, scope, groupRows));

      if (value === null) return null;
      // SQL's NOT IN with a NULL in the list yields unknown — reproduce that,
      // because it is the exact trap the lesson warns about.
      if (expr.negated && candidates.some((c) => c === null)) return null;

      const found = candidates.some((candidate) => looseEquals(value, candidate));
      return (expr.negated ? !found : found) ? 1 : 0;
    }

    case "subquery": {
      const values = runSubquery(expr.query);
      if (values.length === 0) return null;
      return values[0];
    }

    case "case": {
      for (const branch of expr.branches) {
        if (isTruthy(evaluate(branch.when, scope, groupRows))) {
          return evaluate(branch.then, scope, groupRows);
        }
      }
      return expr.otherwise ? evaluate(expr.otherwise, scope, groupRows) : null;
    }

    default:
      return null;
  }
}

function readColumn(
  expr: Extract<Expr, { kind: "column" }>,
  scope: Scope,
): SqlValue {
  if (expr.table) {
    const row = scope[expr.table];
    if (row === undefined) {
      throw new SqlError(
        `Unknown table alias "${expr.table}"`,
        undefined,
        `Available: ${Object.keys(scope).join(", ") || "none"}.`,
      );
    }
    if (row === null) return null; // unmatched LEFT JOIN side
    if (!(expr.name in row)) {
      throw new SqlError(
        `Unknown column "${expr.table}.${expr.name}"`,
        undefined,
        `Columns: ${Object.keys(row).join(", ")}.`,
      );
    }
    return row[expr.name];
  }

  const owners = Object.entries(scope).filter(
    ([, row]) => row !== null && expr.name in row,
  );

  if (owners.length === 0) {
    const available = Object.values(scope)
      .flatMap((row) => (row ? Object.keys(row) : []))
      .filter((name, index, all) => all.indexOf(name) === index);

    // A NULL side of a LEFT JOIN still has to resolve to NULL rather than fail.
    const nullSideHasIt = Object.values(scope).some((row) => row === null);
    if (nullSideHasIt) return null;

    throw new SqlError(
      `Unknown column "${expr.name}"`,
      undefined,
      available.length ? `Available columns: ${available.join(", ")}.` : undefined,
    );
  }

  return (owners[0][1] as Row)[expr.name];
}

function evaluateBinary(
  expr: Extract<Expr, { kind: "binary" }>,
  scope: Scope,
  groupRows: Scope[] | null,
): SqlValue {
  if (expr.op === "AND" || expr.op === "OR") {
    const left = evaluate(expr.left, scope, groupRows);
    const right = evaluate(expr.right, scope, groupRows);

    if (expr.op === "AND") {
      if (left === null || right === null) {
        return isTruthy(left) === false || isTruthy(right) === false ? 0 : null;
      }
      return isTruthy(left) && isTruthy(right) ? 1 : 0;
    }

    if (left === null || right === null) {
      return isTruthy(left) || isTruthy(right) ? 1 : null;
    }
    return isTruthy(left) || isTruthy(right) ? 1 : 0;
  }

  const left = evaluate(expr.left, scope, groupRows);
  const right = evaluate(expr.right, scope, groupRows);

  if (expr.op === "||") {
    if (left === null || right === null) return null;
    return `${left}${right}`;
  }

  if (left === null || right === null) return null;

  switch (expr.op) {
    case "=":
      return looseEquals(left, right) ? 1 : 0;
    case "<>":
      return looseEquals(left, right) ? 0 : 1;
    case "<":
      return compareValues(left, right) < 0 ? 1 : 0;
    case ">":
      return compareValues(left, right) > 0 ? 1 : 0;
    case "<=":
      return compareValues(left, right) <= 0 ? 1 : 0;
    case ">=":
      return compareValues(left, right) >= 0 ? 1 : 0;
    case "+":
      return round(Number(left) + Number(right));
    case "-":
      return round(Number(left) - Number(right));
    case "*":
      return round(Number(left) * Number(right));
    case "/":
      return Number(right) === 0 ? null : round(Number(left) / Number(right));
    case "%":
      return Number(right) === 0 ? null : Number(left) % Number(right);
    default:
      throw new SqlError(`Unsupported operator "${expr.op}"`);
  }
}

function evaluateFunction(
  expr: Extract<Expr, { kind: "function" }>,
  scope: Scope,
  groupRows: Scope[] | null,
): SqlValue {
  const name = expr.name.toUpperCase();

  if (isAggregate(name)) {
    const rows = groupRows ?? [scope];

    if (name === "COUNT") {
      if (expr.star || expr.args.length === 0) return rows.length;
      const values = rows
        .map((row) => evaluate(expr.args[0], row, null))
        .filter((v) => v !== null);
      if (expr.distinct) {
        return new Set(values.map((v) => JSON.stringify(v))).size;
      }
      return values.length;
    }

    const numbers = rows
      .map((row) => evaluate(expr.args[0], row, null))
      .filter((v): v is number | string => v !== null)
      .map(Number)
      .filter((n) => !Number.isNaN(n));

    if (numbers.length === 0) return null;

    switch (name) {
      case "SUM":
        return round(numbers.reduce((a, b) => a + b, 0));
      case "AVG":
        return round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
      case "MIN":
        return Math.min(...numbers);
      case "MAX":
        return Math.max(...numbers);
      default:
        return null;
    }
  }

  const args = expr.args.map((arg) => evaluate(arg, scope, groupRows));

  switch (name) {
    case "ROUND": {
      if (args[0] === null) return null;
      const digits = args[1] === undefined || args[1] === null ? 0 : Number(args[1]);
      const factor = 10 ** digits;
      return Math.round(Number(args[0]) * factor) / factor;
    }
    case "ABS":
      return args[0] === null ? null : Math.abs(Number(args[0]));
    case "UPPER":
      return args[0] === null ? null : String(args[0]).toUpperCase();
    case "LOWER":
      return args[0] === null ? null : String(args[0]).toLowerCase();
    case "LENGTH":
      return args[0] === null ? null : String(args[0]).length;
    case "COALESCE":
      return args.find((value) => value !== null) ?? null;
    default:
      throw new SqlError(`Unsupported function "${expr.name}"`);
  }
}

function runSubquery(query: Query): SqlValue[] {
  const scopes = buildScopes(query);
  const result = runQuery(query, scopes);
  return result.rows.map((row) => row[0]);
}

function likeToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

function looseEquals(a: SqlValue, b: SqlValue): boolean {
  if (a === null || b === null) return false;
  if (typeof a === "number" || typeof b === "number") {
    return Number(a) === Number(b);
  }
  return String(a) === String(b);
}

export function compareValues(a: SqlValue, b: SqlValue): number {
  if (a === null && b === null) return 0;
  if (a === null) return -1;
  if (b === null) return 1;

  if (typeof a === "number" && typeof b === "number") return a - b;

  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;

  return String(a).localeCompare(String(b));
}

function isTruthy(value: SqlValue): boolean {
  if (value === null) return false;
  if (typeof value === "number") return value !== 0;
  return value !== "" && value !== "0" && value.toLowerCase() !== "false";
}

function round(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

export { SqlError };

export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "punctuation"
  | "star";

export type Token = {
  type: TokenType;
  value: string;
  /** Upper-cased value, for keyword comparisons. */
  upper: string;
  start: number;
};

export const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "ORDER", "BY", "ASC", "DESC",
  "LIMIT", "OFFSET", "DISTINCT", "AS", "JOIN", "INNER", "LEFT", "RIGHT", "FULL",
  "OUTER", "ON", "GROUP", "HAVING", "IN", "BETWEEN", "LIKE", "IS", "NULL",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "CASE", "WHEN", "THEN", "ELSE", "END",
  "UNION", "ALL", "TRUE", "FALSE", "ROUND", "ABS", "UPPER", "LOWER", "LENGTH",
  "COALESCE",
]);

export class SqlError extends Error {
  constructor(
    message: string,
    readonly position?: number,
    readonly hint?: string,
  ) {
    super(message);
    this.name = "SqlError";
  }
}

const OPERATORS = ["<>", "!=", "<=", ">=", "||", "=", "<", ">", "+", "-", "*", "/", "%"];

export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    // Comments
    if (char === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      continue;
    }
    if (char === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }

    // Strings
    if (char === "'" || char === '"') {
      const quote = char;
      let j = i + 1;
      let value = "";
      while (j < sql.length) {
        if (sql[j] === quote && sql[j + 1] === quote) {
          value += quote;
          j += 2;
          continue;
        }
        if (sql[j] === quote) break;
        value += sql[j];
        j += 1;
      }
      if (j >= sql.length) {
        throw new SqlError("Unterminated string literal", i, "Add the closing quote.");
      }
      tokens.push({ type: "string", value, upper: value.toUpperCase(), start: i });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(sql[i + 1] ?? ""))) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j += 1;
      const value = sql.slice(i, j);
      tokens.push({ type: "number", value, upper: value, start: i });
      i = j;
      continue;
    }

    // Identifiers and keywords
    if (/[A-Za-z_]/.test(char)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_.$]/.test(sql[j])) j += 1;
      const value = sql.slice(i, j);
      const upper = value.toUpperCase();
      tokens.push({
        type: KEYWORDS.has(upper) ? "keyword" : "identifier",
        value,
        upper,
        start: i,
      });
      i = j;
      continue;
    }

    if (char === "*") {
      tokens.push({ type: "star", value: "*", upper: "*", start: i });
      i += 1;
      continue;
    }

    const operator = OPERATORS.find((op) => sql.startsWith(op, i));
    if (operator) {
      tokens.push({
        type: "operator",
        value: operator,
        upper: operator,
        start: i,
      });
      i += operator.length;
      continue;
    }

    if ("(),;".includes(char)) {
      tokens.push({ type: "punctuation", value: char, upper: char, start: i });
      i += 1;
      continue;
    }

    throw new SqlError(`Unexpected character "${char}"`, i);
  }

  return tokens;
}

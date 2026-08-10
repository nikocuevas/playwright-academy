import { SqlError, tokenize, type Token } from "./tokenizer";

/** AST for the SELECT subset the lab supports. */

export type Expr =
  | { kind: "column"; table?: string; name: string }
  | { kind: "literal"; value: string | number | null }
  | { kind: "star"; table?: string }
  | { kind: "binary"; op: string; left: Expr; right: Expr }
  | { kind: "unary"; op: string; expr: Expr }
  | { kind: "function"; name: string; args: Expr[]; star?: boolean; distinct?: boolean }
  | { kind: "in"; expr: Expr; list?: Expr[]; query?: Query; negated: boolean }
  | { kind: "between"; expr: Expr; low: Expr; high: Expr; negated: boolean }
  | { kind: "like"; expr: Expr; pattern: Expr; negated: boolean }
  | { kind: "isNull"; expr: Expr; negated: boolean }
  | { kind: "subquery"; query: Query }
  | { kind: "case"; branches: { when: Expr; then: Expr }[]; otherwise?: Expr };

export type SelectItem = { expr: Expr; alias?: string };

export type TableRef = { name: string; alias?: string };

export type Join = {
  type: "inner" | "left";
  table: TableRef;
  on?: Expr;
};

export type Query = {
  distinct: boolean;
  columns: SelectItem[];
  from?: TableRef;
  joins: Join[];
  where?: Expr;
  groupBy: Expr[];
  having?: Expr;
  orderBy: { expr: Expr; direction: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
};

const AGGREGATES = new Set(["COUNT", "SUM", "AVG", "MIN", "MAX"]);
const SCALAR_FUNCTIONS = new Set([
  "ROUND",
  "ABS",
  "UPPER",
  "LOWER",
  "LENGTH",
  "COALESCE",
]);

export function isAggregate(name: string) {
  return AGGREGATES.has(name.toUpperCase());
}

class Parser {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.position + offset];
  }

  private next(): Token {
    const token = this.tokens[this.position];
    if (!token) throw new SqlError("Unexpected end of query");
    this.position += 1;
    return token;
  }

  private matchKeyword(...keywords: string[]): boolean {
    const token = this.peek();
    if (token && token.type === "keyword" && keywords.includes(token.upper)) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private atKeyword(...keywords: string[]): boolean {
    const token = this.peek();
    return Boolean(token && token.type === "keyword" && keywords.includes(token.upper));
  }

  private expectKeyword(keyword: string) {
    const token = this.peek();
    if (!token || token.type !== "keyword" || token.upper !== keyword) {
      throw new SqlError(
        `Expected ${keyword}${token ? ` but found "${token.value}"` : ""}`,
        token?.start,
      );
    }
    this.position += 1;
  }

  private expectPunct(value: string) {
    const token = this.peek();
    if (!token || token.value !== value) {
      throw new SqlError(
        `Expected "${value}"${token ? ` but found "${token.value}"` : ""}`,
        token?.start,
      );
    }
    this.position += 1;
  }

  private atPunct(value: string) {
    const token = this.peek();
    return Boolean(token && token.type === "punctuation" && token.value === value);
  }

  /** `nested` is set for subqueries, where a trailing ")" belongs to the caller. */
  parseQuery(nested = false): Query {
    this.expectKeyword("SELECT");

    const distinct = this.matchKeyword("DISTINCT");
    const columns = this.parseSelectList();

    const query: Query = {
      distinct,
      columns,
      joins: [],
      groupBy: [],
      orderBy: [],
    };

    if (this.matchKeyword("FROM")) {
      query.from = this.parseTableRef();

      // Joins
      for (;;) {
        let type: "inner" | "left" | undefined;

        if (this.atKeyword("JOIN")) {
          this.position += 1;
          type = "inner";
        } else if (this.atKeyword("INNER")) {
          this.position += 1;
          this.expectKeyword("JOIN");
          type = "inner";
        } else if (this.atKeyword("LEFT")) {
          this.position += 1;
          this.matchKeyword("OUTER");
          this.expectKeyword("JOIN");
          type = "left";
        } else if (this.atKeyword("RIGHT") || this.atKeyword("FULL")) {
          const token = this.peek()!;
          throw new SqlError(
            `${token.upper} JOIN is not supported by the SQL Lab engine`,
            token.start,
            "Rewrite it as a LEFT JOIN with the tables swapped.",
          );
        }

        if (!type) break;

        const table = this.parseTableRef();
        let on: Expr | undefined;
        if (this.matchKeyword("ON")) on = this.parseExpression();
        query.joins.push({ type, table, on });
      }
    }

    if (this.matchKeyword("WHERE")) query.where = this.parseExpression();

    if (this.matchKeyword("GROUP")) {
      this.expectKeyword("BY");
      query.groupBy = this.parseExpressionList();
    }

    if (this.matchKeyword("HAVING")) query.having = this.parseExpression();

    if (this.matchKeyword("ORDER")) {
      this.expectKeyword("BY");
      do {
        const expr = this.parseExpression();
        let direction: "asc" | "desc" = "asc";
        if (this.matchKeyword("DESC")) direction = "desc";
        else this.matchKeyword("ASC");
        query.orderBy.push({ expr, direction });
      } while (this.matchComma());
    }

    if (this.matchKeyword("LIMIT")) {
      const token = this.next();
      if (token.type !== "number") {
        throw new SqlError("LIMIT expects a number", token.start);
      }
      query.limit = Number(token.value);
    }

    if (this.matchKeyword("OFFSET")) {
      const token = this.next();
      if (token.type !== "number") {
        throw new SqlError("OFFSET expects a number", token.start);
      }
      query.offset = Number(token.value);
    }

    if (nested) return query;

    if (this.atPunct(";")) this.position += 1;

    const leftover = this.peek();
    if (leftover) {
      throw new SqlError(
        `Unexpected "${leftover.value}" after the end of the query`,
        leftover.start,
      );
    }

    return query;
  }

  private matchComma() {
    if (this.atPunct(",")) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private parseSelectList(): SelectItem[] {
    const items: SelectItem[] = [];
    do {
      const expr = this.parseExpression();
      let alias: string | undefined;

      if (this.matchKeyword("AS")) {
        const token = this.next();
        alias = token.value;
      } else {
        const token = this.peek();
        if (token && token.type === "identifier") {
          alias = token.value;
          this.position += 1;
        }
      }

      items.push({ expr, alias });
    } while (this.matchComma());

    return items;
  }

  private parseExpressionList(): Expr[] {
    const list: Expr[] = [];
    do {
      list.push(this.parseExpression());
    } while (this.matchComma());
    return list;
  }

  private parseTableRef(): TableRef {
    const token = this.next();
    if (token.type !== "identifier") {
      throw new SqlError(`Expected a table name but found "${token.value}"`, token.start);
    }

    let alias: string | undefined;
    if (this.matchKeyword("AS")) {
      alias = this.next().value;
    } else {
      const nextToken = this.peek();
      if (nextToken && nextToken.type === "identifier") {
        alias = nextToken.value;
        this.position += 1;
      }
    }

    return { name: token.value, alias };
  }

  // Expression precedence: OR < AND < NOT < comparison < additive < multiplicative
  parseExpression(): Expr {
    return this.parseOr();
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.matchKeyword("OR")) {
      left = { kind: "binary", op: "OR", left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.matchKeyword("AND")) {
      left = { kind: "binary", op: "AND", left, right: this.parseNot() };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.matchKeyword("NOT")) {
      return { kind: "unary", op: "NOT", expr: this.parseNot() };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    const left = this.parseAdditive();
    const token = this.peek();

    if (token?.type === "operator" && ["=", "<>", "!=", "<", ">", "<=", ">="].includes(token.value)) {
      this.position += 1;
      return {
        kind: "binary",
        op: token.value === "!=" ? "<>" : token.value,
        left,
        right: this.parseAdditive(),
      };
    }

    const negated = this.matchKeyword("NOT");

    if (this.matchKeyword("IN")) {
      this.expectPunct("(");
      if (this.atKeyword("SELECT")) {
        const query = this.parseQuery(true);
        this.expectPunct(")");
        return { kind: "in", expr: left, query, negated };
      }
      const list = this.parseExpressionList();
      this.expectPunct(")");
      return { kind: "in", expr: left, list, negated };
    }

    if (this.matchKeyword("BETWEEN")) {
      const low = this.parseAdditive();
      this.expectKeyword("AND");
      const high = this.parseAdditive();
      return { kind: "between", expr: left, low, high, negated };
    }

    if (this.matchKeyword("LIKE")) {
      return { kind: "like", expr: left, pattern: this.parseAdditive(), negated };
    }

    if (negated) {
      const found = this.peek();
      throw new SqlError(
        `NOT must be followed by IN, BETWEEN or LIKE${found ? `, found "${found.value}"` : ""}`,
        found?.start,
      );
    }

    if (this.matchKeyword("IS")) {
      const isNegated = this.matchKeyword("NOT");
      this.expectKeyword("NULL");
      return { kind: "isNull", expr: left, negated: isNegated };
    }

    return left;
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    for (;;) {
      const token = this.peek();
      if (token?.type === "operator" && ["+", "-", "||"].includes(token.value)) {
        this.position += 1;
        left = {
          kind: "binary",
          op: token.value,
          left,
          right: this.parseMultiplicative(),
        };
        continue;
      }
      return left;
    }
  }

  private parseMultiplicative(): Expr {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      if (
        (token?.type === "operator" && ["/", "%"].includes(token.value)) ||
        token?.type === "star"
      ) {
        this.position += 1;
        left = {
          kind: "binary",
          op: token.type === "star" ? "*" : token.value,
          left,
          right: this.parseUnary(),
        };
        continue;
      }
      return left;
    }
  }

  private parseUnary(): Expr {
    const token = this.peek();
    if (token?.type === "operator" && token.value === "-") {
      this.position += 1;
      return { kind: "unary", op: "-", expr: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const token = this.peek();
    if (!token) throw new SqlError("Unexpected end of query");

    if (token.type === "star") {
      this.position += 1;
      return { kind: "star" };
    }

    if (token.type === "number") {
      this.position += 1;
      return { kind: "literal", value: Number(token.value) };
    }

    if (token.type === "string") {
      this.position += 1;
      return { kind: "literal", value: token.value };
    }

    if (token.type === "keyword" && token.upper === "NULL") {
      this.position += 1;
      return { kind: "literal", value: null };
    }

    if (token.type === "keyword" && (token.upper === "TRUE" || token.upper === "FALSE")) {
      this.position += 1;
      return { kind: "literal", value: token.upper === "TRUE" ? 1 : 0 };
    }

    if (token.type === "keyword" && token.upper === "CASE") {
      return this.parseCase();
    }

    if (this.atPunct("(")) {
      this.position += 1;
      if (this.atKeyword("SELECT")) {
        const query = this.parseQuery(true);
        this.expectPunct(")");
        return { kind: "subquery", query };
      }
      const expr = this.parseExpression();
      this.expectPunct(")");
      return expr;
    }

    // Function call or column reference
    if (token.type === "identifier" || token.type === "keyword") {
      const name = token.value;
      const upper = token.upper;
      this.position += 1;

      if (this.atPunct("(")) {
        if (!AGGREGATES.has(upper) && !SCALAR_FUNCTIONS.has(upper)) {
          throw new SqlError(
            `Unknown function "${name}"`,
            token.start,
            `Supported: ${[...AGGREGATES, ...SCALAR_FUNCTIONS].join(", ")}.`,
          );
        }
        this.position += 1;

        const distinct = this.matchKeyword("DISTINCT");

        if (this.atPunct(")")) {
          this.position += 1;
          return { kind: "function", name: upper, args: [], distinct };
        }

        const args = this.parseExpressionList();
        this.expectPunct(")");

        const star = args.length === 1 && args[0].kind === "star";
        return { kind: "function", name: upper, args, star, distinct };
      }

      if (token.type === "keyword" && !AGGREGATES.has(upper) && !SCALAR_FUNCTIONS.has(upper)) {
        throw new SqlError(
          `Unexpected keyword "${name}"`,
          token.start,
          "Did you misspell a clause, or use a reserved word as a column name?",
        );
      }

      // Qualified name: table.column, or table.*
      if (name.includes(".")) {
        const [table, column] = name.split(".");
        if (column === "") {
          // `u.` followed by a star token.
          if (this.peek()?.type === "star") {
            this.position += 1;
            return { kind: "star", table };
          }
        }
        return { kind: "column", table, name: column };
      }

      if (this.peek()?.type === "star" && name.endsWith(".")) {
        this.position += 1;
        return { kind: "star", table: name.slice(0, -1) };
      }

      return { kind: "column", name };
    }

    throw new SqlError(`Unexpected token "${token.value}"`, token.start);
  }

  private parseCase(): Expr {
    this.expectKeyword("CASE");
    const branches: { when: Expr; then: Expr }[] = [];
    let otherwise: Expr | undefined;

    while (this.matchKeyword("WHEN")) {
      const when = this.parseExpression();
      this.expectKeyword("THEN");
      const then = this.parseExpression();
      branches.push({ when, then });
    }

    if (this.matchKeyword("ELSE")) otherwise = this.parseExpression();
    this.expectKeyword("END");

    return { kind: "case", branches, otherwise };
  }
}

export function parseSql(sql: string): Query {
  const trimmed = sql.trim();
  if (!trimmed) {
    throw new SqlError("Enter a query to run", 0, "Try: SELECT * FROM users;");
  }

  const upper = trimmed.toUpperCase();
  const writeKeyword = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE"].find(
    (kw) => upper.startsWith(kw),
  );
  if (writeKeyword) {
    throw new SqlError(
      `${writeKeyword} is not supported — the SQL Lab is read-only`,
      0,
      "Testers typically only need SELECT. The dataset is fixed so exercises stay reproducible.",
    );
  }

  const tokens = tokenize(trimmed);
  return new Parser(tokens).parseQuery();
}

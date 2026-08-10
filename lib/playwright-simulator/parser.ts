/**
 * A parser for the subset of Playwright test syntax the playground supports.
 *
 * It is not a JavaScript engine. It understands statements of the shape
 * `await <chain>;`, `const x = <chain>;` and `await expect(<chain>).<matcher>()`,
 * which is what a Playwright test is almost entirely made of.
 */

export type SimValue =
  | string
  | number
  | boolean
  | null
  | RegExp
  | SimValue[]
  | { [key: string]: SimValue };

export type Call = { name: string; args: SimValue[] };

export type Chain = {
  /** `page`, `expect`, `request`, or the name of a previously declared variable. */
  root: string;
  /** Argument of `expect(...)`, itself a chain. */
  expectTarget?: Chain;
  /** Literal argument of `expect(...)` when it is not a chain. */
  expectLiteral?: SimValue;
  negated: boolean;
  calls: Call[];
};

export type Statement = {
  line: number;
  raw: string;
  awaited: boolean;
  assignTo?: string;
  chain: Chain;
};

export class SimSyntaxError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly snippet: string,
  ) {
    super(message);
    this.name = "SimSyntaxError";
  }
}

/** Remove line and block comments while preserving string contents. */
function stripComments(code: string): string {
  let out = "";
  let i = 0;
  let quote: string | null = null;

  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];

    if (quote) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }

    if (c === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") i += 1;
      continue;
    }

    if (c === "/" && next === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? code.length : end + 2;
      // Preserve newlines so line numbers stay accurate.
      out += code.slice(i, stop).replace(/[^\n]/g, "");
      i = stop;
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

/**
 * Extracts the body of a `test(...)` callback when the snippet is a full test
 * file. Returns the input unchanged when there is no wrapper.
 */
function extractTestBody(code: string): { body: string; offsetLine: number } {
  const testCall = code.search(/\btest(?:\.\w+)?\s*\(/);
  if (testCall === -1) return { body: code, offsetLine: 0 };

  const arrow = code.indexOf("=>", testCall);
  if (arrow === -1) return { body: code, offsetLine: 0 };

  const braceStart = code.indexOf("{", arrow);
  if (braceStart === -1) return { body: code, offsetLine: 0 };

  let depth = 0;
  let quote: string | null = null;
  for (let i = braceStart; i < code.length; i += 1) {
    const c = code[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{") depth += 1;
    if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        const body = code.slice(braceStart + 1, i);
        const offsetLine = code.slice(0, braceStart + 1).split("\n").length - 1;
        return { body, offsetLine };
      }
    }
  }

  return { body: code.slice(braceStart + 1), offsetLine: 0 };
}

type RawStatement = { text: string; line: number };

function splitStatements(code: string, offsetLine: number): RawStatement[] {
  const statements: RawStatement[] = [];
  let current = "";
  let line = offsetLine + 1;
  let startLine = line;
  let depth = 0;
  let quote: string | null = null;

  const push = () => {
    const text = current.trim();
    if (text) statements.push({ text, line: startLine });
    current = "";
    startLine = line;
  };

  for (let i = 0; i < code.length; i += 1) {
    const c = code[i];

    if (c === "\n") {
      line += 1;
      if (!current.trim()) startLine = line;
      current += " ";
      continue;
    }

    if (quote) {
      current += c;
      if (c === "\\") {
        current += code[i + 1] ?? "";
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      current += c;
      continue;
    }

    if (c === "(" || c === "[" || c === "{") depth += 1;
    if (c === ")" || c === "]" || c === "}") depth -= 1;

    if (c === ";" && depth <= 0) {
      push();
      continue;
    }

    current += c;
  }

  push();
  return statements;
}

/** Finds the index of the closing bracket matching the one at `start`. */
function matchBracket(text: string, start: number): number {
  const open = text[start];
  const close = open === "(" ? ")" : open === "[" ? "]" : "}";
  let depth = 0;
  let quote: string | null = null;

  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === open) depth += 1;
    else if (c === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevel(text: string, separator = ","): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      current += c;
      if (c === "\\") {
        current += text[i + 1] ?? "";
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      current += c;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth += 1;
    if (c === ")" || c === "]" || c === "}") depth -= 1;
    if (c === separator && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += c;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

export function parseValue(input: string, line: number): SimValue {
  const text = input.trim();
  if (!text) return null;

  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null" || text === "undefined") return null;

  const first = text[0];

  if (first === '"' || first === "'" || first === "`") {
    if (text[text.length - 1] !== first) {
      throw new SimSyntaxError("Unterminated string literal", line, text);
    }
    return text
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\`/g, "`")
      .replace(/\\\\/g, "\\");
  }

  if (first === "/") {
    const lastSlash = text.lastIndexOf("/");
    if (lastSlash > 0) {
      const pattern = text.slice(1, lastSlash);
      const flags = text.slice(lastSlash + 1);
      try {
        return new RegExp(pattern, flags);
      } catch {
        throw new SimSyntaxError(`Invalid regular expression: ${text}`, line, text);
      }
    }
  }

  if (first === "[") {
    const end = matchBracket(text, 0);
    const inner = text.slice(1, end === -1 ? undefined : end);
    return splitTopLevel(inner).map((part) => parseValue(part, line));
  }

  if (first === "{") {
    const end = matchBracket(text, 0);
    const inner = text.slice(1, end === -1 ? undefined : end);
    const obj: { [key: string]: SimValue } = {};
    for (const entry of splitTopLevel(inner)) {
      const colon = findTopLevelColon(entry);
      if (colon === -1) {
        const key = entry.trim();
        if (key) obj[key] = true;
        continue;
      }
      const rawKey = entry.slice(0, colon).trim().replace(/^['"`]|['"`]$/g, "");
      obj[rawKey] = parseValue(entry.slice(colon + 1), line);
    }
    return obj;
  }

  const numeric = Number(text.replace(/_/g, ""));
  if (!Number.isNaN(numeric)) return numeric;

  // Anything else (an identifier or expression) is passed through as text so
  // the runner can produce a helpful message rather than a parse crash.
  return text;
}

function findTopLevelColon(text: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth += 1;
    if (c === ")" || c === "]" || c === "}") depth -= 1;
    if (c === ":" && depth === 0) return i;
  }
  return -1;
}

function parseCalls(text: string, line: number): { calls: Call[]; negated: boolean } {
  const calls: Call[] = [];
  let negated = false;
  let rest = text;

  while (rest.trim()) {
    const trimmed = rest.trim();
    if (!trimmed.startsWith(".")) {
      throw new SimSyntaxError(
        `Unexpected token near "${trimmed.slice(0, 24)}"`,
        line,
        trimmed,
      );
    }

    const afterDot = trimmed.slice(1);
    const nameMatch = afterDot.match(/^([A-Za-z_$][\w$]*)/);
    if (!nameMatch) {
      throw new SimSyntaxError(
        `Expected a method name after "."`,
        line,
        trimmed,
      );
    }

    const name = nameMatch[1];
    let cursor = 1 + name.length;

    if (name === "not") {
      negated = true;
      rest = trimmed.slice(cursor);
      continue;
    }

    const remainder = trimmed.slice(cursor).trimStart();
    if (!remainder.startsWith("(")) {
      // Property access such as `.first` without parentheses.
      calls.push({ name, args: [] });
      rest = remainder;
      continue;
    }

    const openIndex = trimmed.indexOf("(", cursor);
    const closeIndex = matchBracket(trimmed, openIndex);
    if (closeIndex === -1) {
      throw new SimSyntaxError("Unbalanced parentheses", line, trimmed);
    }

    const argText = trimmed.slice(openIndex + 1, closeIndex);
    const args = splitTopLevel(argText)
      .map((a) => a.trim())
      .filter(Boolean)
      .map((a) => parseValue(a, line));

    calls.push({ name, args });
    cursor = closeIndex + 1;
    rest = trimmed.slice(cursor);
  }

  return { calls, negated };
}

export function parseChain(expression: string, line: number): Chain {
  const text = expression.trim();

  if (text.startsWith("expect")) {
    const openIndex = text.indexOf("(");
    const closeIndex = matchBracket(text, openIndex);
    if (openIndex === -1 || closeIndex === -1) {
      throw new SimSyntaxError("expect(...) is missing its argument", line, text);
    }

    // Multi-line calls often leave a trailing comma once newlines collapse.
    const inner = text.slice(openIndex + 1, closeIndex).trim().replace(/,\s*$/, "");
    const after = text.slice(closeIndex + 1);
    const { calls, negated } = parseCalls(after, line);

    const looksLikeChain = /^(page|request|[A-Za-z_$][\w$]*)\s*(\.|$)/.test(inner);
    const chain: Chain = {
      root: "expect",
      negated,
      calls,
    };

    if (looksLikeChain && /\.|^[A-Za-z_$][\w$]*$/.test(inner)) {
      try {
        chain.expectTarget = parseChain(inner.replace(/^await\s+/, ""), line);
      } catch {
        chain.expectLiteral = parseValue(inner, line);
      }
    } else {
      chain.expectLiteral = parseValue(inner, line);
    }

    return chain;
  }

  const rootMatch = text.match(/^([A-Za-z_$][\w$]*)/);
  if (!rootMatch) {
    throw new SimSyntaxError(
      `Cannot parse expression "${text.slice(0, 40)}"`,
      line,
      text,
    );
  }

  const root = rootMatch[1];
  const { calls, negated } = parseCalls(text.slice(root.length), line);
  return { root, negated, calls };
}

const IGNORED_PATTERNS = [
  /^import\b/,
  /^export\b/,
  /^test\b/,
  /^\}?\)?$/,
  /^\}$/,
  /^\)$/,
  /^console\./,
];

export function parse(code: string): Statement[] {
  const withoutComments = stripComments(code);
  const { body, offsetLine } = extractTestBody(withoutComments);
  const raw = splitStatements(body, offsetLine);

  const statements: Statement[] = [];

  for (const { text, line } of raw) {
    const cleaned = text.replace(/^\s+|\s+$/g, "").replace(/\)\s*$/, (m, offset: number) =>
      // Trailing `})` left over from the test wrapper.
      offset === 0 ? "" : m,
    );

    if (!cleaned || IGNORED_PATTERNS.some((p) => p.test(cleaned))) continue;

    let expression = cleaned;
    let assignTo: string | undefined;

    const assignMatch = expression.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/,
    );
    if (assignMatch) {
      assignTo = assignMatch[1];
      expression = assignMatch[2].trim();
    }

    let awaited = false;
    if (/^await\s+/.test(expression)) {
      awaited = true;
      expression = expression.replace(/^await\s+/, "");
    }

    if (!expression) continue;

    statements.push({
      line,
      raw: cleaned,
      awaited,
      assignTo,
      chain: parseChain(expression, line),
    });
  }

  return statements;
}

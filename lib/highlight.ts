/**
 * A very small, dependency-free syntax highlighter.
 *
 * It is intentionally simple: the academy shows short teaching snippets, not
 * whole files, so a token-scanner good enough for strings/comments/keywords
 * beats pulling in a 300 kB highlighting library on every lesson page.
 */

export type Language = "ts" | "js" | "bash" | "sql" | "html" | "json" | "text";

export type Token = {
  text: string;
  type:
    | "plain"
    | "comment"
    | "string"
    | "number"
    | "keyword"
    | "builtin"
    | "function"
    | "operator"
    | "punctuation"
    | "tag"
    | "attr"
    | "property";
};

const TS_KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "var", "function",
  "return", "async", "await", "class", "extends", "implements", "new", "this",
  "if", "else", "for", "of", "in", "while", "do", "switch", "case", "break",
  "continue", "try", "catch", "finally", "throw", "typeof", "instanceof",
  "interface", "type", "enum", "public", "private", "protected", "readonly",
  "static", "as", "void", "null", "undefined", "true", "false", "yield",
  "constructor", "super", "get", "set", "satisfies", "keyof",
]);

const TS_BUILTINS = new Set([
  "test", "expect", "page", "browser", "context", "request", "locator",
  "describe", "beforeEach", "afterEach", "beforeAll", "afterAll", "console",
  "Promise", "Array", "Object", "String", "Number", "Boolean", "Date", "Math",
  "JSON", "process", "require", "module", "string", "number", "boolean", "any",
  "unknown", "never", "Record", "Partial", "Locator", "Page", "BrowserContext",
]);

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "and", "or", "not", "order", "by", "asc", "desc",
  "limit", "offset", "distinct", "as", "join", "inner", "left", "right", "full",
  "outer", "on", "group", "having", "count", "sum", "avg", "min", "max", "in",
  "between", "like", "is", "null", "case", "when", "then", "else", "end",
  "union", "all", "insert", "into", "values", "update", "set", "delete",
]);

const BASH_KEYWORDS = new Set([
  "npm", "npx", "node", "git", "cd", "run", "install", "export", "echo", "yarn",
  "pnpm", "playwright", "test", "dev", "build", "start", "sudo", "mkdir", "rm",
]);

function pushPlain(tokens: Token[], text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === "plain") last.text += text;
  else tokens.push({ text, type: "plain" });
}

function highlightJsLike(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c);
  const isIdent = (c: string) => /[A-Za-z0-9_$]/.test(c);

  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];

    // Line comment
    if (c === "/" && next === "/") {
      let j = i;
      while (j < code.length && code[j] !== "\n") j += 1;
      tokens.push({ text: code.slice(i, j), type: "comment" });
      i = j;
      continue;
    }
    // Block comment
    if (c === "/" && next === "*") {
      const end = code.indexOf("*/", i + 2);
      const j = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, j), type: "comment" });
      i = j;
      continue;
    }
    // Strings & template literals
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === c) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ text: code.slice(i, j), type: "string" });
      i = j;
      continue;
    }
    // Numbers
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < code.length && /[0-9._a-fx]/i.test(code[j])) j += 1;
      tokens.push({ text: code.slice(i, j), type: "number" });
      i = j;
      continue;
    }
    // Identifiers / keywords
    if (isIdentStart(c)) {
      let j = i;
      while (j < code.length && isIdent(code[j])) j += 1;
      const word = code.slice(i, j);
      const prevChar = code[i - 1];
      let k = j;
      while (k < code.length && /\s/.test(code[k])) k += 1;
      const isCall = code[k] === "(";

      let type: Token["type"] = "plain";
      if (TS_KEYWORDS.has(word)) type = "keyword";
      else if (isCall) type = "function";
      else if (TS_BUILTINS.has(word)) type = "builtin";
      else if (prevChar === ".") type = "property";
      tokens.push({ text: word, type });
      i = j;
      continue;
    }
    if (/[{}()[\];,]/.test(c)) {
      tokens.push({ text: c, type: "punctuation" });
      i += 1;
      continue;
    }
    if (/[=+\-*/%<>!&|?:.^~]/.test(c)) {
      tokens.push({ text: c, type: "operator" });
      i += 1;
      continue;
    }
    pushPlain(tokens, c);
    i += 1;
  }
  return tokens;
}

function highlightWordList(code: string, words: Set<string>): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c === "#" || (c === "-" && code[i + 1] === "-" && words === SQL_KEYWORDS)) {
      let j = i;
      while (j < code.length && code[j] !== "\n") j += 1;
      tokens.push({ text: code.slice(i, j), type: "comment" });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== c) j += 1;
      tokens.push({ text: code.slice(i, Math.min(j + 1, code.length)), type: "string" });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < code.length && /[0-9.]/.test(code[j])) j += 1;
      tokens.push({ text: code.slice(i, j), type: "number" });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_.\-]/.test(code[j])) j += 1;
      const word = code.slice(i, j);
      tokens.push({
        text: word,
        type: words.has(word.toLowerCase()) ? "keyword" : "plain",
      });
      i = j;
      continue;
    }
    if (/[*(),;=<>]/.test(c)) {
      tokens.push({ text: c, type: "punctuation" });
      i += 1;
      continue;
    }
    pushPlain(tokens, c);
    i += 1;
  }
  return tokens;
}

function highlightHtml(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === "<") {
      const end = code.indexOf(">", i);
      const j = end === -1 ? code.length : end + 1;
      const chunk = code.slice(i, j);
      // Split the tag into name / attributes / values.
      const re = /([a-zA-Z-]+)=("[^"]*"|'[^']*')|(<\/?[a-zA-Z0-9-]+)|(\/?>)/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(chunk))) {
        pushPlain(tokens, chunk.slice(last, m.index));
        if (m[1]) {
          tokens.push({ text: m[1], type: "attr" });
          tokens.push({ text: "=", type: "operator" });
          tokens.push({ text: m[2], type: "string" });
        } else if (m[3]) {
          tokens.push({ text: m[3], type: "tag" });
        } else if (m[4]) {
          tokens.push({ text: m[4], type: "tag" });
        }
        last = m.index + m[0].length;
      }
      pushPlain(tokens, chunk.slice(last));
      i = j;
      continue;
    }
    let j = i;
    while (j < code.length && code[j] !== "<") j += 1;
    pushPlain(tokens, code.slice(i, j));
    i = j;
  }
  return tokens;
}

export function tokenize(code: string, language: Language): Token[] {
  switch (language) {
    case "ts":
    case "js":
    case "json":
      return highlightJsLike(code);
    case "sql":
      return highlightWordList(code, SQL_KEYWORDS);
    case "bash":
      return highlightWordList(code, BASH_KEYWORDS);
    case "html":
      return highlightHtml(code);
    default:
      return [{ text: code, type: "plain" }];
  }
}

export const tokenClass: Record<Token["type"], string> = {
  plain: "text-[#dfe3ec]",
  comment: "text-[#6b7385] italic",
  string: "text-[#9ad67d]",
  number: "text-[#e5b567]",
  keyword: "text-[#c792ea]",
  builtin: "text-[#63d6ff]",
  function: "text-[#82aaff]",
  operator: "text-[#89ddff]",
  punctuation: "text-[#8d95a6]",
  tag: "text-[#ff8b8b]",
  attr: "text-[#e5b567]",
  property: "text-[#7fd7c4]",
};

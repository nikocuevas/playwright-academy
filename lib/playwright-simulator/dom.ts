/**
 * The simulated DOM.
 *
 * Screens are described as a tree of `SimNode`s rather than real HTML. That
 * keeps the engine small and deterministic while still modelling the parts
 * Playwright cares about: roles, accessible names, labels, placeholders, test
 * ids, attributes, values and visibility.
 */

export type SimRole =
  | "button"
  | "link"
  | "textbox"
  | "checkbox"
  | "radio"
  | "combobox"
  | "heading"
  | "article"
  | "list"
  | "listitem"
  | "row"
  | "table"
  | "cell"
  | "img"
  | "alert"
  | "status"
  | "searchbox"
  | "form"
  | "navigation"
  | "banner"
  | "dialog"
  | "option"
  | "group"
  | "generic";

export type SimInputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "number"
  | "date"
  | "search";

export type SimNode = {
  /** Stable identity used to highlight the element in the preview. */
  key: string;
  role: SimRole;
  /** Visible text owned by this node (not its children). */
  text?: string;
  /** Accessible name; falls back to `text` when omitted. */
  name?: string;
  label?: string;
  placeholder?: string;
  testId?: string;
  attrs?: Record<string, string>;
  /** Current value for form controls. */
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  inputType?: SimInputType;
  options?: { value: string; label: string }[];
  /** Action dispatched when the node is clicked. */
  action?: { type: string; payload?: Record<string, unknown> };
  /** Field name bound to application state, for inputs. */
  field?: string;
  headingLevel?: number;
  children?: SimNode[];
  /** Purely presentational hint for the simulated browser renderer. */
  variant?:
    | "page"
    | "card"
    | "row"
    | "stack"
    | "inline"
    | "title"
    | "muted"
    | "price"
    | "badge"
    | "success"
    | "error"
    | "primary"
    | "table";
};

export type ResolvedNode = {
  node: SimNode;
  /** Ancestors, outermost first. */
  path: SimNode[];
};

export function walk(
  node: SimNode,
  visit: (node: SimNode, path: SimNode[]) => void,
  path: SimNode[] = [],
) {
  visit(node, path);
  for (const child of node.children ?? []) {
    walk(child, visit, [...path, node]);
  }
}

export function flatten(root: SimNode): ResolvedNode[] {
  const out: ResolvedNode[] = [];
  walk(root, (node, path) => out.push({ node, path }));
  return out;
}

/** All text inside a node, including its descendants. */
export function textContent(node: SimNode): string {
  const parts: string[] = [];
  walk(node, (n) => {
    if (n.text) parts.push(n.text);
    if (n.role === "textbox" && n.value) parts.push(n.value);
  });
  return normalize(parts.join(" "));
}

/** Playwright normalises whitespace before matching text. */
export function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * A simplified accessible-name computation: explicit name, then label, then
 * own text, then placeholder — mirroring the order that matters in practice.
 */
export function accessibleName(node: SimNode): string {
  if (node.name) return normalize(node.name);
  if (node.label) return normalize(node.label);
  if (node.text) return normalize(node.text);
  if (node.role === "button" || node.role === "link") {
    const inner = textContent(node);
    if (inner) return inner;
  }
  if (node.placeholder) return normalize(node.placeholder);
  return "";
}

export function isVisible(node: SimNode, path: SimNode[]): boolean {
  if (node.hidden) return false;
  return !path.some((ancestor) => ancestor.hidden);
}

export function matchesText(
  haystack: string,
  needle: string | RegExp,
  exact = false,
): boolean {
  const value = normalize(haystack);
  if (needle instanceof RegExp) return needle.test(value);
  const target = normalize(needle);
  return exact
    ? value === target
    : value.toLowerCase().includes(target.toLowerCase());
}

/** Human-readable description used in simulated error messages. */
export function describeNode(node: SimNode): string {
  const name = accessibleName(node);
  const bits: string[] = [node.role];
  if (name) bits.push(`"${name}"`);
  if (node.testId) bits.push(`[data-testid="${node.testId}"]`);
  if (node.disabled) bits.push("[disabled]");
  if (node.hidden) bits.push("[hidden]");
  return bits.join(" ");
}

/** A CSS-ish selector matcher supporting the subset the lessons teach. */
export function matchesSelector(node: SimNode, selector: string): boolean {
  const trimmed = selector.trim();

  // Comma-separated selector list
  if (trimmed.includes(",")) {
    return trimmed.split(",").some((part) => matchesSelector(node, part));
  }

  // Descendant combinators are resolved by the caller; here we match one step.
  const attrMatch = trimmed.match(
    /^([a-zA-Z][\w-]*)?(?:\[([\w-]+)(?:([~^$*]?=)"?([^"\]]*)"?)?\])?$/,
  );

  if (attrMatch) {
    const [, tagPart, attrName, operator, attrValue] = attrMatch;
    if (tagPart && !matchesTag(node, tagPart)) return false;
    if (!attrName) return Boolean(tagPart);

    const actual = readAttribute(node, attrName);
    if (actual === undefined) return false;
    if (!operator) return true;

    switch (operator) {
      case "=":
        return actual === attrValue;
      case "^=":
        return actual.startsWith(attrValue);
      case "$=":
        return actual.endsWith(attrValue);
      case "*=":
        return actual.includes(attrValue);
      case "~=":
        return actual.split(/\s+/).includes(attrValue);
      default:
        return false;
    }
  }

  // #id and .class
  if (trimmed.startsWith("#")) {
    return readAttribute(node, "id") === trimmed.slice(1);
  }
  if (trimmed.startsWith(".")) {
    const classes = readAttribute(node, "class")?.split(/\s+/) ?? [];
    return classes.includes(trimmed.slice(1));
  }

  return matchesTag(node, trimmed);
}

const roleTags: Record<string, SimRole[]> = {
  input: ["textbox", "checkbox", "radio", "searchbox"],
  button: ["button"],
  a: ["link"],
  select: ["combobox"],
  article: ["article"],
  table: ["table"],
  tr: ["row"],
  td: ["cell"],
  form: ["form"],
  h1: ["heading"],
  h2: ["heading"],
  h3: ["heading"],
  img: ["img"],
  option: ["option"],
  div: ["generic"],
  span: ["generic"],
  li: ["listitem"],
  ul: ["list"],
};

function matchesTag(node: SimNode, tag: string) {
  if (tag === "*") return true;
  const roles = roleTags[tag.toLowerCase()];
  if (!roles) return false;
  if (tag.toLowerCase().startsWith("h") && node.role === "heading") {
    const level = Number(tag.slice(1));
    return Number.isNaN(level) ? true : node.headingLevel === level;
  }
  return roles.includes(node.role);
}

export function readAttribute(node: SimNode, name: string): string | undefined {
  switch (name) {
    case "data-testid":
      return node.testId;
    case "placeholder":
      return node.placeholder;
    case "value":
      return node.value;
    case "type":
      return node.inputType ?? (node.role === "checkbox" ? "checkbox" : undefined);
    case "role":
      return node.role;
    case "disabled":
      return node.disabled ? "" : undefined;
    default:
      return node.attrs?.[name];
  }
}

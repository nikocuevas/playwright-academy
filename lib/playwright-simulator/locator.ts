import {
  accessibleName,
  flatten,
  matchesSelector,
  matchesText,
  normalize,
  textContent,
  type ResolvedNode,
  type SimNode,
} from "./dom";
import { parseChain, type Call, type SimValue } from "./parser";

/** Locator-producing methods the simulator understands. */
export const LOCATOR_METHODS = new Set([
  "getByRole",
  "getByText",
  "getByLabel",
  "getByPlaceholder",
  "getByTestId",
  "getByAltText",
  "getByTitle",
  "locator",
  "filter",
  "nth",
  "first",
  "last",
]);

export class LocatorError extends Error {
  constructor(
    message: string,
    readonly detail?: {
      locator?: string;
      reason?: string;
      available?: string[];
      matched?: string[];
    },
  ) {
    super(message);
    this.name = "LocatorError";
  }
}

export type LocatorStep = Call;

function asString(value: SimValue | undefined): string | RegExp | undefined {
  if (typeof value === "string") return value;
  if (value instanceof RegExp) return value;
  return undefined;
}

function option(args: SimValue[], index: number): Record<string, SimValue> {
  const value = args[index];
  if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof RegExp)) {
    return value as Record<string, SimValue>;
  }
  return {};
}

function applyStep(
  scopes: ResolvedNode[],
  step: LocatorStep,
  root: SimNode,
  includeSelf: boolean,
): ResolvedNode[] {
  const collect = (
    candidates: ResolvedNode[],
    predicate: (node: SimNode) => boolean,
  ) => collectFrom(candidates, predicate, includeSelf);

  switch (step.name) {
    case "getByRole": {
      const role = String(step.args[0] ?? "");
      const opts = option(step.args, 1);
      const name = asString(opts.name);
      const exact = opts.exact === true;

      return collect(scopes, (node) => {
        if (node.role !== role) return false;
        if (name !== undefined && !matchesText(accessibleName(node), name, exact)) {
          return false;
        }
        if (typeof opts.level === "number" && node.headingLevel !== opts.level) {
          return false;
        }
        if (typeof opts.checked === "boolean" && Boolean(node.checked) !== opts.checked) {
          return false;
        }
        if (typeof opts.disabled === "boolean" && Boolean(node.disabled) !== opts.disabled) {
          return false;
        }
        return true;
      });
    }

    case "getByText": {
      const needle = asString(step.args[0]);
      const exact = option(step.args, 1).exact === true;
      if (needle === undefined) return [];
      return collect(scopes, (node) => {
        // Match the node that owns the text, not every ancestor.
        if (node.text && matchesText(node.text, needle, exact)) return true;
        return false;
      });
    }

    case "getByLabel": {
      const needle = asString(step.args[0]);
      const exact = option(step.args, 1).exact === true;
      if (needle === undefined) return [];
      return collect(scopes, (node) =>
        Boolean(node.label && matchesText(node.label, needle, exact)),
      );
    }

    case "getByPlaceholder": {
      const needle = asString(step.args[0]);
      const exact = option(step.args, 1).exact === true;
      if (needle === undefined) return [];
      return collect(scopes, (node) =>
        Boolean(node.placeholder && matchesText(node.placeholder, needle, exact)),
      );
    }

    case "getByTestId": {
      const needle = asString(step.args[0]);
      if (needle === undefined) return [];
      return collect(scopes, (node) =>
        needle instanceof RegExp
          ? Boolean(node.testId && needle.test(node.testId))
          : node.testId === needle,
      );
    }

    case "getByAltText":
    case "getByTitle": {
      const needle = asString(step.args[0]);
      if (needle === undefined) return [];
      const attr = step.name === "getByAltText" ? "alt" : "title";
      return collect(scopes, (node) =>
        Boolean(node.attrs?.[attr] && matchesText(node.attrs[attr], needle)),
      );
    }

    case "locator": {
      const selector = step.args[0];
      if (typeof selector !== "string") return [];
      return resolveSelector(scopes, selector, includeSelf);
    }

    case "filter": {
      const opts = option(step.args, 0);
      return scopes.filter((scope) => {
        const content = textContent(scope.node);

        if (opts.hasText !== undefined) {
          const needle = asString(opts.hasText);
          if (needle !== undefined && !matchesText(content, needle)) return false;
        }
        if (opts.hasNotText !== undefined) {
          const needle = asString(opts.hasNotText);
          if (needle !== undefined && matchesText(content, needle)) return false;
        }
        if (opts.has !== undefined) {
          const inner = resolveNested(scope.node, opts.has, root);
          if (inner.length === 0) return false;
        }
        if (opts.hasNot !== undefined) {
          const inner = resolveNested(scope.node, opts.hasNot, root);
          if (inner.length > 0) return false;
        }
        return true;
      });
    }

    case "first":
      return scopes.slice(0, 1);

    case "last":
      return scopes.slice(-1);

    case "nth": {
      const index = Number(step.args[0] ?? 0);
      const target = index < 0 ? scopes.length + index : index;
      return scopes[target] ? [scopes[target]] : [];
    }

    default:
      throw new LocatorError(
        `The simulator does not support "${step.name}()" yet.`,
        {
          reason:
            "Supported locator methods: getByRole, getByText, getByLabel, getByPlaceholder, getByTestId, locator, filter, first, last, nth.",
        },
      );
  }
}

/**
 * Gathers matching nodes inside each scope.
 *
 * `includeSelf` mirrors Playwright: `page.getByRole()` can match the document
 * root, while `locator.getByRole()` only searches descendants.
 */
function collectFrom(
  scopes: ResolvedNode[],
  predicate: (node: SimNode) => boolean,
  includeSelf: boolean,
): ResolvedNode[] {
  const seen = new Set<SimNode>();
  const out: ResolvedNode[] = [];

  for (const scope of scopes) {
    const candidates = flatten(scope.node).filter(
      (candidate) => includeSelf || candidate.node !== scope.node,
    );

    for (const candidate of candidates) {
      if (seen.has(candidate.node)) continue;
      if (predicate(candidate.node)) {
        seen.add(candidate.node);
        out.push({
          node: candidate.node,
          path: [...scope.path, ...candidate.path],
        });
      }
    }
  }

  return out;
}

function resolveSelector(
  scopes: ResolvedNode[],
  selector: string,
  includeSelf: boolean,
): ResolvedNode[] {
  const parts = selector
    .split(/\s+>\s+|\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let current = scopes;
  let first = includeSelf;
  for (const part of parts) {
    current = collectFrom(current, (node) => matchesSelector(node, part), first);
    first = false;
  }
  return current;
}

/**
 * `filter({ has: page.getByRole(...) })` — the nested locator is resolved
 * relative to each candidate, matching Playwright's semantics.
 */
function resolveNested(scope: SimNode, value: SimValue, root: SimNode): ResolvedNode[] {
  // The parser turns an unquoted nested expression into a string; re-parse it.
  if (typeof value !== "string") return [];

  if (!/^(?:page|[A-Za-z_$][\w$]*)\./.test(value)) {
    return collectFrom(
      [{ node: scope, path: [] }],
      (node) => matchesSelector(node, value),
      false,
    );
  }

  try {
    const chain = parseChain(value, 0);
    return resolveWithin(scope, chain.calls, root);
  } catch {
    return [];
  }
}

/** Resolves inside a scope; the scope itself never matches. */
export function resolveWithin(
  scope: SimNode,
  steps: LocatorStep[],
  root: SimNode = scope,
): ResolvedNode[] {
  return runSteps(scope, steps, root, false);
}

/** Resolves against the document; the root element can match. */
export function resolve(
  scope: SimNode,
  steps: LocatorStep[],
  root: SimNode = scope,
): ResolvedNode[] {
  return runSteps(scope, steps, root, true);
}

function runSteps(
  scope: SimNode,
  steps: LocatorStep[],
  root: SimNode,
  includeSelfOnFirstStep: boolean,
): ResolvedNode[] {
  let current: ResolvedNode[] = [{ node: scope, path: [] }];
  let includeSelf = includeSelfOnFirstStep;

  for (const step of steps) {
    current = applyStep(current, step, root, includeSelf);
    includeSelf = false;
    if (current.length === 0) break;
  }

  return current;
}

/** Renders a locator chain the way Playwright prints it in errors. */
export function describeLocator(steps: LocatorStep[]): string {
  return steps
    .map((step) => {
      const args = step.args.map(formatValue).join(", ");
      return `${step.name}(${args})`;
    })
    .join(".");
}

export function formatValue(value: SimValue): string {
  if (value instanceof RegExp) return value.toString();
  if (typeof value === "string") return `'${value}'`;
  if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
  if (value && typeof value === "object") {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${formatValue(v)}`)
      .join(", ")} }`;
  }
  return String(value);
}

/**
 * Builds the "here is what actually exists" hint that makes simulator errors
 * more useful than a bare timeout.
 */
export function suggestAlternatives(root: SimNode, steps: LocatorStep[]): string[] {
  const last = steps[steps.length - 1];
  if (!last) return [];

  const all = flatten(root);

  if (last.name === "getByRole") {
    const role = String(last.args[0] ?? "");
    return all
      .filter((r) => r.node.role === role)
      .map((r) => accessibleName(r.node))
      .filter(Boolean)
      .slice(0, 8);
  }

  if (last.name === "getByLabel") {
    return all
      .map((r) => r.node.label)
      .filter((l): l is string => Boolean(l))
      .slice(0, 10);
  }

  if (last.name === "getByTestId") {
    return all
      .map((r) => r.node.testId)
      .filter((t): t is string => Boolean(t))
      .slice(0, 10);
  }

  if (last.name === "getByText") {
    return all
      .map((r) => r.node.text)
      .filter((t): t is string => Boolean(t))
      .map(normalize)
      .filter((t) => t.length > 0 && t.length < 60)
      .slice(0, 10);
  }

  if (last.name === "getByPlaceholder") {
    return all
      .map((r) => r.node.placeholder)
      .filter((p): p is string => Boolean(p))
      .slice(0, 10);
  }

  return [];
}

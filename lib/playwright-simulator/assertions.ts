import {
  accessibleName,
  matchesText,
  normalize,
  readAttribute,
  textContent,
  type ResolvedNode,
} from "./dom";
import { formatValue } from "./locator";
import type { SimValue } from "./parser";

export class AssertionError extends Error {
  constructor(
    message: string,
    readonly detail: {
      matcher: string;
      locator?: string;
      expected: string;
      received: string;
    },
  ) {
    super(message);
    this.name = "AssertionError";
  }
}

export const LOCATOR_MATCHERS = new Set([
  "toBeVisible",
  "toBeHidden",
  "toBeAttached",
  "toHaveText",
  "toContainText",
  "toHaveValue",
  "toBeEmpty",
  "toBeEnabled",
  "toBeDisabled",
  "toBeChecked",
  "toHaveCount",
  "toHaveAttribute",
  "toHaveId",
  "toBeEditable",
  "toBeFocused",
]);

export const PAGE_MATCHERS = new Set(["toHaveURL", "toHaveTitle"]);

export const VALUE_MATCHERS = new Set([
  "toBe",
  "toEqual",
  "toBeTruthy",
  "toBeFalsy",
  "toMatch",
  "toContain",
  "toBeGreaterThan",
  "toBeLessThan",
  "toHaveLength",
]);

type Outcome = { passed: boolean; expected: string; received: string };

/** Evaluates a locator matcher against the resolved elements. */
export function evaluateLocatorMatcher(
  matcher: string,
  args: SimValue[],
  matches: ResolvedNode[],
): Outcome {
  const first = matches[0]?.node;
  const arg = args[0];

  switch (matcher) {
    case "toBeVisible":
      return {
        passed: Boolean(first) && !first!.hidden,
        expected: "visible",
        received: !first ? "element(s) not found" : first.hidden ? "hidden" : "visible",
      };

    case "toBeHidden":
      return {
        passed: !first || Boolean(first.hidden),
        expected: "hidden",
        received: !first ? "not found (counts as hidden)" : first.hidden ? "hidden" : "visible",
      };

    case "toBeAttached":
      return {
        passed: Boolean(first),
        expected: "attached",
        received: first ? "attached" : "element(s) not found",
      };

    case "toHaveText": {
      if (Array.isArray(arg)) {
        const actual = matches.map((m) => textContent(m.node));
        const expected = arg.map((a) => String(a));
        return {
          passed:
            actual.length === expected.length &&
            actual.every((value, i) => matchesText(value, expected[i], true)),
          expected: formatValue(arg),
          received: formatValue(actual as SimValue),
        };
      }
      const actual = first ? textContent(first) : "";
      return {
        passed:
          Boolean(first) && matchesText(actual, arg as string | RegExp, !(arg instanceof RegExp)),
        expected: formatValue(arg),
        received: first ? `'${actual}'` : "element(s) not found",
      };
    }

    case "toContainText": {
      const actual = first ? textContent(first) : "";
      return {
        passed: Boolean(first) && matchesText(actual, arg as string | RegExp),
        expected: formatValue(arg),
        received: first ? `'${actual}'` : "element(s) not found",
      };
    }

    case "toHaveValue": {
      const actual = first?.value ?? "";
      return {
        passed:
          Boolean(first) &&
          (arg instanceof RegExp ? arg.test(actual) : actual === String(arg)),
        expected: formatValue(arg),
        received: first ? `'${actual}'` : "element(s) not found",
      };
    }

    case "toBeEmpty": {
      const actual = first ? (first.value ?? textContent(first)) : "";
      return {
        passed: Boolean(first) && normalize(actual) === "",
        expected: "empty",
        received: first ? `'${actual}'` : "element(s) not found",
      };
    }

    case "toBeEnabled":
      return {
        passed: Boolean(first) && !first!.disabled,
        expected: "enabled",
        received: !first ? "element(s) not found" : first.disabled ? "disabled" : "enabled",
      };

    case "toBeDisabled":
      return {
        passed: Boolean(first?.disabled),
        expected: "disabled",
        received: !first ? "element(s) not found" : first.disabled ? "disabled" : "enabled",
      };

    case "toBeChecked": {
      const shouldBeChecked = arg === undefined ? true : arg !== false;
      return {
        passed: Boolean(first) && Boolean(first!.checked) === shouldBeChecked,
        expected: shouldBeChecked ? "checked" : "unchecked",
        received: !first
          ? "element(s) not found"
          : first.checked
            ? "checked"
            : "unchecked",
      };
    }

    case "toHaveCount": {
      const expected = Number(arg ?? 0);
      return {
        passed: matches.length === expected,
        expected: String(expected),
        received: String(matches.length),
      };
    }

    case "toHaveAttribute": {
      const attribute = String(args[0] ?? "");
      const expectedValue = args[1];
      const actual = first ? readAttribute(first, attribute) : undefined;
      const passed =
        actual !== undefined &&
        (expectedValue === undefined ||
          (expectedValue instanceof RegExp
            ? expectedValue.test(actual)
            : actual === String(expectedValue)));
      return {
        passed,
        expected: `${attribute}=${expectedValue === undefined ? "<any>" : formatValue(expectedValue)}`,
        received: actual === undefined ? "<attribute missing>" : `'${actual}'`,
      };
    }

    case "toHaveId": {
      const actual = first ? readAttribute(first, "id") : undefined;
      return {
        passed: actual === String(arg),
        expected: formatValue(arg),
        received: actual ? `'${actual}'` : "<no id>",
      };
    }

    case "toBeEditable":
      return {
        passed: Boolean(first) && !first!.disabled && Boolean(first!.field),
        expected: "editable",
        received: first ? (first.disabled ? "disabled" : "editable") : "element(s) not found",
      };

    case "toBeFocused":
      return {
        passed: false,
        expected: "focused",
        received: "the simulator does not track focus",
      };

    default:
      throw new AssertionError(
        `The simulator does not support expect(locator).${matcher}() yet.`,
        {
          matcher,
          expected: "a supported matcher",
          received: [...LOCATOR_MATCHERS].join(", "),
        },
      );
  }
}

export function evaluatePageMatcher(
  matcher: string,
  args: SimValue[],
  context: { url: string; title: string },
): Outcome {
  const arg = args[0];

  if (matcher === "toHaveURL") {
    const actual = context.url;
    const passed =
      arg instanceof RegExp ? arg.test(actual) : normalizePath(String(arg)) === actual;
    return { passed, expected: formatValue(arg), received: `'${actual}'` };
  }

  if (matcher === "toHaveTitle") {
    const actual = context.title;
    const passed =
      arg instanceof RegExp ? arg.test(actual) : actual === String(arg);
    return { passed, expected: formatValue(arg), received: `'${actual}'` };
  }

  throw new AssertionError(
    `The simulator does not support expect(page).${matcher}() yet.`,
    {
      matcher,
      expected: "a supported matcher",
      received: [...PAGE_MATCHERS].join(", "),
    },
  );
}

export function evaluateValueMatcher(
  matcher: string,
  args: SimValue[],
  actual: SimValue,
): Outcome {
  const arg = args[0];
  const received = formatValue(actual);

  switch (matcher) {
    case "toBe":
    case "toEqual":
      return {
        passed: JSON.stringify(actual) === JSON.stringify(arg),
        expected: formatValue(arg),
        received,
      };
    case "toBeTruthy":
      return { passed: Boolean(actual), expected: "truthy", received };
    case "toBeFalsy":
      return { passed: !actual, expected: "falsy", received };
    case "toMatch":
      return {
        passed:
          typeof actual === "string" &&
          (arg instanceof RegExp ? arg.test(actual) : actual.includes(String(arg))),
        expected: formatValue(arg),
        received,
      };
    case "toContain":
      return {
        passed:
          (typeof actual === "string" && actual.includes(String(arg))) ||
          (Array.isArray(actual) && actual.includes(arg)),
        expected: formatValue(arg),
        received,
      };
    case "toBeGreaterThan":
      return {
        passed: Number(actual) > Number(arg),
        expected: `> ${formatValue(arg)}`,
        received,
      };
    case "toBeLessThan":
      return {
        passed: Number(actual) < Number(arg),
        expected: `< ${formatValue(arg)}`,
        received,
      };
    case "toHaveLength":
      return {
        passed:
          (typeof actual === "string" || Array.isArray(actual)) &&
          actual.length === Number(arg),
        expected: `length ${formatValue(arg)}`,
        received,
      };
    default:
      throw new AssertionError(
        `The simulator does not support expect(value).${matcher}() yet.`,
        {
          matcher,
          expected: "a supported matcher",
          received: [...VALUE_MATCHERS].join(", "),
        },
      );
  }
}

function normalizePath(url: string) {
  const withoutOrigin = url.replace(/^https?:\/\/[^/]+/, "");
  const path = withoutOrigin.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) return `/${path}`;
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function describeMatches(matches: ResolvedNode[]): string[] {
  return matches.slice(0, 6).map((m) => {
    const name = accessibleName(m.node);
    return name ? `${m.node.role} "${name}"` : m.node.role;
  });
}

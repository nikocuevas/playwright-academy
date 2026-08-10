import { createInitialState, reduce, normalizeUrl, type SimState } from "./app-state";
import { render } from "./screens";
import { accessibleName, type ResolvedNode, type SimNode } from "./dom";
import {
  describeLocator,
  formatValue,
  LOCATOR_METHODS,
  LocatorError,
  resolve,
  suggestAlternatives,
  type LocatorStep,
} from "./locator";
import {
  ACTION_METHODS,
  ActionError,
  performAction,
  readLocatorValue,
} from "./actions";
import {
  AssertionError,
  describeMatches,
  evaluateLocatorMatcher,
  evaluatePageMatcher,
  evaluateValueMatcher,
  LOCATOR_MATCHERS,
  PAGE_MATCHERS,
} from "./assertions";
import {
  parse,
  SimSyntaxError,
  type SimValue,
  type Statement,
} from "./parser";

export type SimError = {
  title: string;
  message: string;
  locator?: string;
  reason?: string;
  expected?: string;
  received?: string;
  available?: string[];
  callLog?: string[];
  line?: number;
};

export type ExecutionStep = {
  index: number;
  line: number;
  atMs: number;
  label: string;
  status: "passed" | "failed" | "skipped";
  note?: string;
  highlight: string[];
  url: string;
  /** State after the step, so the preview can scrub through the run. */
  snapshot: SimState;
};

export type ExecutionResult = {
  steps: ExecutionStep[];
  passed: boolean;
  error?: SimError;
  finalState: SimState;
  document: SimNode;
  durationMs: number;
  requests: { method: string; url: string; status: number }[];
};

type Variable =
  | { kind: "locator"; steps: LocatorStep[] }
  | { kind: "value"; value: SimValue };

const READ_METHODS = new Set([
  "textContent",
  "innerText",
  "inputValue",
  "isVisible",
  "isChecked",
  "isEnabled",
  "isDisabled",
  "count",
  "all",
  "allTextContents",
  "getAttribute",
  "boundingBox",
]);

const PAGE_METHODS = new Set([
  "goto",
  "reload",
  "goBack",
  "goForward",
  "waitForURL",
  "waitForTimeout",
  "waitForResponse",
  "waitForRequest",
  "waitForLoadState",
  "title",
  "url",
  "screenshot",
  "pause",
  "setViewportSize",
  "context",
  "close",
]);

const STEP_COST: Record<string, number> = {
  goto: 118,
  reload: 96,
  click: 41,
  dblclick: 48,
  fill: 22,
  check: 26,
  uncheck: 26,
  selectOption: 24,
  press: 18,
  hover: 16,
  waitForURL: 34,
  waitForResponse: 57,
  waitForRequest: 43,
  waitForTimeout: 0,
  expect: 19,
};

function pageTitle(url: string) {
  if (url === "/practice/registration") return "Registration · Playwright Academy";
  if (url.startsWith("/practice/shop")) return "ShopEasy · Playwright Academy";
  return "Playwright Academy";
}

/** Splits a chain's calls into the locator part and the terminal operation. */
function splitCalls(calls: LocatorStep[]) {
  const locatorSteps: LocatorStep[] = [];
  let terminal: LocatorStep | undefined;
  const rest: LocatorStep[] = [];

  for (const call of calls) {
    if (!terminal && LOCATOR_METHODS.has(call.name)) {
      locatorSteps.push(call);
      continue;
    }
    if (!terminal) {
      terminal = call;
      continue;
    }
    rest.push(call);
  }

  return { locatorSteps, terminal, rest };
}

function strictModeError(
  locatorText: string,
  matches: ResolvedNode[],
  operation: string,
): SimError {
  return {
    title: "Strict mode violation",
    message: `${operation}: strict mode violation: ${locatorText} resolved to ${matches.length} elements`,
    locator: locatorText,
    reason:
      "A locator used for an action must match exactly one element. Scope it to a container or use filter().",
    available: describeMatches(matches),
  };
}

function notFoundError(
  locatorText: string,
  operation: string,
  document: SimNode,
  steps: LocatorStep[],
): SimError {
  const available = suggestAlternatives(document, steps);
  return {
    title: "Test failed",
    message: `${operation}: Timeout 5000ms exceeded.`,
    locator: locatorText,
    reason: "No matching element found.",
    available,
    callLog: [
      `waiting for ${locatorText}`,
      "  locator resolved to 0 elements",
      "  retrying…",
    ],
  };
}

export class SimulatorRunner {
  private state: SimState;
  private document: SimNode;
  private readonly variables = new Map<string, Variable>();
  private readonly steps: ExecutionStep[] = [];
  private readonly requests: { method: string; url: string; status: number }[] = [];
  private clock = 0;
  private index = 0;

  constructor(initialState?: SimState) {
    this.state = initialState ?? createInitialState();
    this.document = render(this.state);
  }

  private rerender() {
    this.document = render(this.state);
  }

  private log(
    line: number,
    label: string,
    cost: number,
    highlight: string[] = [],
    note?: string,
  ) {
    this.clock += cost;
    this.index += 1;
    this.steps.push({
      index: this.index,
      line,
      atMs: this.clock,
      label,
      status: "passed",
      note,
      highlight,
      url: this.state.url,
      snapshot: this.state,
    });
  }

  private fail(line: number, label: string, error: SimError): ExecutionResult {
    this.clock += 12;
    this.index += 1;
    this.steps.push({
      index: this.index,
      line,
      atMs: this.clock,
      label,
      status: "failed",
      highlight: [],
      url: this.state.url,
      snapshot: this.state,
    });

    return {
      steps: this.steps,
      passed: false,
      error: { ...error, line },
      finalState: this.state,
      document: this.document,
      durationMs: this.clock,
      requests: this.requests,
    };
  }

  run(code: string): ExecutionResult {
    let statements: Statement[];

    try {
      statements = parse(code);
    } catch (error) {
      const syntax = error as SimSyntaxError;
      return {
        steps: [],
        passed: false,
        error: {
          title: "Could not parse the test",
          message: syntax.message,
          reason: syntax.snippet,
          line: syntax.line,
        },
        finalState: this.state,
        document: this.document,
        durationMs: 0,
        requests: [],
      };
    }

    if (statements.length === 0) {
      return {
        steps: [],
        passed: false,
        error: {
          title: "Nothing to run",
          message: "No supported statements were found.",
          reason:
            "Write statements such as `await page.goto('/practice/registration');` inside the test body.",
        },
        finalState: this.state,
        document: this.document,
        durationMs: 0,
        requests: [],
      };
    }

    for (const statement of statements) {
      const failure = this.execute(statement);
      if (failure) return failure;
    }

    return {
      steps: this.steps,
      passed: true,
      finalState: this.state,
      document: this.document,
      durationMs: this.clock,
      requests: this.requests,
    };
  }

  private execute(statement: Statement): ExecutionResult | undefined {
    const { chain, line } = statement;

    try {
      if (chain.root === "expect") return this.runExpect(statement);
      if (chain.root === "page") return this.runPage(statement);

      const variable = this.variables.get(chain.root);
      if (!variable) {
        return this.fail(line, statement.raw, {
          title: "Unknown identifier",
          message: `"${chain.root}" is not defined.`,
          reason:
            "Declare it first, for example: const email = page.getByLabel('Email');",
        });
      }

      if (variable.kind === "value") {
        return this.fail(line, statement.raw, {
          title: "Not a locator",
          message: `"${chain.root}" holds a value, not a locator.`,
        });
      }

      return this.runLocatorChain(statement, [...variable.steps, ...chain.calls]);
    } catch (error) {
      return this.fail(line, statement.raw, toSimError(error));
    }
  }

  private runPage(statement: Statement): ExecutionResult | undefined {
    const { chain, line } = statement;
    const first = chain.calls[0];

    if (!first) {
      return this.fail(line, statement.raw, {
        title: "Incomplete statement",
        message: "`page` on its own does nothing.",
      });
    }

    if (LOCATOR_METHODS.has(first.name)) {
      return this.runLocatorChain(statement, chain.calls);
    }

    if (!PAGE_METHODS.has(first.name)) {
      return this.fail(line, statement.raw, {
        title: "Unsupported API",
        message: `The simulator does not support page.${first.name}() yet.`,
        reason: `Supported page methods: ${[...PAGE_METHODS].join(", ")}.`,
      });
    }

    const args = first.args;

    switch (first.name) {
      case "goto": {
        const url = normalizeUrl(String(args[0] ?? "/"));
        const before = this.state.url;
        this.state = reduce(this.state, { type: "navigate", payload: { url } });
        this.rerender();
        this.requests.push({ method: "GET", url, status: 200 });

        const redirected = this.state.url !== url;
        this.log(
          line,
          `page.goto('${url}')`,
          STEP_COST.goto,
          [],
          redirected
            ? `redirected to ${this.state.url} — the route requires authentication`
            : before === this.state.url
              ? undefined
              : undefined,
        );
        return undefined;
      }

      case "reload":
        this.rerender();
        this.log(line, "page.reload()", STEP_COST.reload);
        return undefined;

      case "goBack":
        this.state = reduce(this.state, { type: "back" });
        this.rerender();
        this.log(line, "page.goBack()", STEP_COST.goto);
        return undefined;

      case "waitForTimeout": {
        const ms = Number(args[0] ?? 0);
        this.log(
          line,
          `page.waitForTimeout(${ms})`,
          ms,
          [],
          "fixed waits make the suite slower without making it more reliable",
        );
        return undefined;
      }

      case "waitForLoadState":
        this.log(
          line,
          `page.waitForLoadState(${args[0] ? formatValue(args[0]) : ""})`,
          24,
        );
        return undefined;

      case "waitForURL": {
        const expected = args[0];
        const actual = this.state.url;
        const passed =
          expected instanceof RegExp
            ? expected.test(actual)
            : normalizeUrl(String(expected)) === actual;

        if (!passed) {
          return this.fail(line, statement.raw, {
            title: "Test failed",
            message: `page.waitForURL: Timeout 5000ms exceeded.`,
            expected: formatValue(expected),
            received: `'${actual}'`,
            reason: "The application never navigated to that URL.",
          });
        }
        this.log(line, `page.waitForURL(${formatValue(expected)})`, STEP_COST.waitForURL);
        return undefined;
      }

      case "waitForResponse":
      case "waitForRequest": {
        const pattern = args[0];
        const match = this.requests.find((r) => matchesUrlPattern(r.url, pattern));

        if (!match) {
          return this.fail(line, statement.raw, {
            title: "Test failed",
            message: `page.${first.name}: Timeout 5000ms exceeded.`,
            expected: formatValue(pattern),
            reason:
              "No matching request was observed. Remember that the wait must be registered before the action that triggers it.",
            available: this.requests.map((r) => `${r.method} ${r.url} → ${r.status}`),
          });
        }

        this.log(
          line,
          `page.${first.name}(${formatValue(pattern)})`,
          STEP_COST[first.name] ?? 40,
          [],
          `matched ${match.method} ${match.url} → ${match.status}`,
        );
        return undefined;
      }

      case "title":
        if (statement.assignTo) {
          this.variables.set(statement.assignTo, {
            kind: "value",
            value: pageTitle(this.state.url),
          });
        }
        this.log(line, "page.title()", 8);
        return undefined;

      case "url":
        if (statement.assignTo) {
          this.variables.set(statement.assignTo, {
            kind: "value",
            value: this.state.url,
          });
        }
        this.log(line, "page.url()", 4);
        return undefined;

      default:
        this.log(line, `page.${first.name}()`, 10, [], "no-op in the simulator");
        return undefined;
    }
  }

  private runLocatorChain(
    statement: Statement,
    calls: LocatorStep[],
  ): ExecutionResult | undefined {
    const { line } = statement;
    const { locatorSteps, terminal } = splitCalls(calls);
    const locatorText = describeLocator(locatorSteps);

    // `const email = page.getByLabel('Email');`
    if (!terminal) {
      if (statement.assignTo) {
        this.variables.set(statement.assignTo, { kind: "locator", steps: locatorSteps });
      }
      const matches = resolve(this.document, locatorSteps);
      this.log(
        line,
        locatorText,
        6,
        matches.map((m) => m.node.key),
        matches.length === 0 ? "resolved to 0 elements" : undefined,
      );
      return undefined;
    }

    const matches = resolve(this.document, locatorSteps);

    if (READ_METHODS.has(terminal.name)) {
      return this.runRead(statement, locatorSteps, matches, terminal);
    }

    if (!ACTION_METHODS.has(terminal.name)) {
      return this.fail(line, statement.raw, {
        title: "Unsupported API",
        message: `The simulator does not support locator.${terminal.name}() yet.`,
        reason: `Supported actions: ${[...ACTION_METHODS].join(", ")}.`,
      });
    }

    const operation = `locator.${terminal.name}`;

    if (matches.length === 0) {
      return this.fail(
        line,
        statement.raw,
        notFoundError(locatorText, operation, this.document, locatorSteps),
      );
    }

    if (matches.length > 1 && terminal.name !== "waitFor") {
      return this.fail(
        line,
        statement.raw,
        strictModeError(locatorText, matches, operation),
      );
    }

    const target = matches[0].node;
    const result = performAction(this.state, target, terminal);

    this.state = result.state;
    this.requests.push(...result.requests);
    this.rerender();

    const argText = terminal.args.map(formatValue).join(", ");
    this.log(
      line,
      `${locatorText ? `${locatorText}.` : ""}${terminal.name}(${argText})`,
      STEP_COST[terminal.name] ?? 20,
      [target.key],
      result.note,
    );

    return undefined;
  }

  private runRead(
    statement: Statement,
    locatorSteps: LocatorStep[],
    matches: ResolvedNode[],
    terminal: LocatorStep,
  ): ExecutionResult | undefined {
    const { line } = statement;
    const locatorText = describeLocator(locatorSteps);

    let value: SimValue;

    if (terminal.name === "count") {
      value = matches.length;
    } else if (terminal.name === "allTextContents") {
      value = matches.map((m) => m.node.text ?? accessibleName(m.node));
    } else if (terminal.name === "getAttribute") {
      const attr = String(terminal.args[0] ?? "");
      value = matches[0]?.node.attrs?.[attr] ?? null;
    } else {
      if (matches.length === 0) {
        return this.fail(
          line,
          statement.raw,
          notFoundError(locatorText, `locator.${terminal.name}`, this.document, locatorSteps),
        );
      }
      value = readLocatorValue(matches[0].node, terminal.name) as SimValue;
    }

    if (statement.assignTo) {
      this.variables.set(statement.assignTo, { kind: "value", value });
    }

    this.log(
      line,
      `${locatorText}.${terminal.name}()`,
      10,
      matches.map((m) => m.node.key),
      `→ ${formatValue(value)}`,
    );
    return undefined;
  }

  private runExpect(statement: Statement): ExecutionResult | undefined {
    const { chain, line } = statement;
    const matcherCall = chain.calls[chain.calls.length - 1];

    if (!matcherCall) {
      return this.fail(line, statement.raw, {
        title: "Incomplete assertion",
        message: "expect(...) needs a matcher, for example .toBeVisible().",
      });
    }

    const negated = chain.negated;
    const target = chain.expectTarget;

    // expect(page).toHaveURL(...) / toHaveTitle(...)
    if (target && target.root === "page" && target.calls.length === 0) {
      const outcome = evaluatePageMatcher(matcherCall.name, matcherCall.args, {
        url: this.state.url,
        title: pageTitle(this.state.url),
      });
      return this.finishAssertion(statement, `expect(page).${matcherCall.name}`, outcome, negated);
    }

    // expect(locator).toX()
    if (target) {
      let steps: LocatorStep[] = [];

      if (target.root === "page") {
        steps = target.calls;
      } else {
        const variable = this.variables.get(target.root);
        if (variable?.kind === "locator") {
          steps = [...variable.steps, ...target.calls];
        } else if (variable?.kind === "value") {
          const outcome = evaluateValueMatcher(
            matcherCall.name,
            matcherCall.args,
            variable.value,
          );
          return this.finishAssertion(
            statement,
            `expect(${target.root}).${matcherCall.name}`,
            outcome,
            negated,
          );
        } else {
          return this.fail(line, statement.raw, {
            title: "Unknown identifier",
            message: `"${target.root}" is not defined.`,
          });
        }
      }

      const locatorText = describeLocator(steps);

      if (PAGE_MATCHERS.has(matcherCall.name)) {
        const outcome = evaluatePageMatcher(matcherCall.name, matcherCall.args, {
          url: this.state.url,
          title: pageTitle(this.state.url),
        });
        return this.finishAssertion(
          statement,
          `expect(page).${matcherCall.name}`,
          outcome,
          negated,
        );
      }

      if (!LOCATOR_MATCHERS.has(matcherCall.name)) {
        return this.fail(line, statement.raw, {
          title: "Unsupported matcher",
          message: `The simulator does not support expect(locator).${matcherCall.name}() yet.`,
          reason: `Supported: ${[...LOCATOR_MATCHERS].join(", ")}.`,
        });
      }

      const matches = resolve(this.document, steps);
      const outcome = evaluateLocatorMatcher(matcherCall.name, matcherCall.args, matches);

      return this.finishAssertion(
        statement,
        `expect(${locatorText}).${negated ? "not." : ""}${matcherCall.name}`,
        outcome,
        negated,
        locatorText,
        matches.map((m) => m.node.key),
        matches.length === 0 ? suggestAlternatives(this.document, steps) : undefined,
      );
    }

    // expect(literal).toBe(...)
    const literal = chain.expectLiteral ?? null;
    const outcome = evaluateValueMatcher(matcherCall.name, matcherCall.args, literal);
    return this.finishAssertion(
      statement,
      `expect(${formatValue(literal)}).${matcherCall.name}`,
      outcome,
      negated,
    );
  }

  private finishAssertion(
    statement: Statement,
    label: string,
    outcome: { passed: boolean; expected: string; received: string },
    negated: boolean,
    locatorText?: string,
    highlight: string[] = [],
    available?: string[],
  ): ExecutionResult | undefined {
    const passed = negated ? !outcome.passed : outcome.passed;

    if (!passed) {
      return this.fail(statement.line, statement.raw, {
        title: "Assertion failed",
        message: `${label}() failed`,
        locator: locatorText,
        expected: negated ? `not ${outcome.expected}` : outcome.expected,
        received: outcome.received,
        available,
      });
    }

    this.log(statement.line, `${label}()`, STEP_COST.expect, highlight);
    return undefined;
  }
}

function matchesUrlPattern(url: string, pattern: SimValue): boolean {
  if (pattern instanceof RegExp) return pattern.test(url);
  if (typeof pattern !== "string") return false;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§§")
    .replace(/\*/g, "[^/]*")
    .replace(/§§/g, ".*");

  return new RegExp(`^${escaped}$`).test(url) || url.includes(pattern.replace(/\*/g, ""));
}

function toSimError(error: unknown): SimError {
  if (error instanceof LocatorError) {
    return {
      title: "Locator error",
      message: error.message,
      locator: error.detail?.locator,
      reason: error.detail?.reason,
      available: error.detail?.available,
    };
  }
  if (error instanceof ActionError) {
    return {
      title: "Action failed",
      message: error.message,
      reason: error.detail?.reason,
      available: error.detail?.hint ? [error.detail.hint] : undefined,
    };
  }
  if (error instanceof AssertionError) {
    return {
      title: "Assertion error",
      message: error.message,
      expected: error.detail.expected,
      received: error.detail.received,
    };
  }
  if (error instanceof SimSyntaxError) {
    return { title: "Syntax error", message: error.message, line: error.line };
  }
  return {
    title: "Unexpected error",
    message: error instanceof Error ? error.message : String(error),
  };
}

/** Convenience entry point used by the playground UI. */
export function runSimulation(code: string, initialUrl?: string): ExecutionResult {
  const runner = new SimulatorRunner(
    initialUrl ? createInitialState(initialUrl) : undefined,
  );
  return runner.run(code);
}

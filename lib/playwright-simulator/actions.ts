import type { SimNode } from "./dom";
import { accessibleName, describeNode } from "./dom";
import { reduce, type SimAction, type SimState } from "./app-state";
import type { Call, SimValue } from "./parser";

export class ActionError extends Error {
  constructor(
    message: string,
    readonly detail?: { reason?: string; hint?: string },
  ) {
    super(message);
    this.name = "ActionError";
  }
}

export const ACTION_METHODS = new Set([
  "click",
  "dblclick",
  "fill",
  "clear",
  "check",
  "uncheck",
  "setChecked",
  "selectOption",
  "press",
  "hover",
  "focus",
  "blur",
  "type",
  "pressSequentially",
  "waitFor",
  "scrollIntoViewIfNeeded",
]);

export type ActionResult = {
  state: SimState;
  /** Simulated network calls the action produced. */
  requests: { method: string; url: string; status: number }[];
  note?: string;
};

/** Requests the simulated app "sends" for a given dispatched action. */
function requestsFor(action: SimAction): ActionResult["requests"] {
  switch (action.type) {
    case "login.submit":
      return [{ method: "POST", url: "/api/auth/login", status: 200 }];
    case "cart.add":
    case "cart.increment":
      return [{ method: "POST", url: "/api/cart", status: 200 }];
    case "cart.remove":
    case "cart.decrement":
      return [{ method: "DELETE", url: "/api/cart", status: 200 }];
    case "checkout.place":
      return [{ method: "POST", url: "/api/orders", status: 201 }];
    case "message.send":
      return [{ method: "POST", url: "/api/messages", status: 201 }];
    case "registration.submit":
      return [{ method: "POST", url: "/api/auth/register", status: 201 }];
    case "search.submit":
      return [{ method: "GET", url: "/api/products", status: 200 }];
    case "navigate": {
      const url = String(action.payload?.url ?? "");
      if (url.startsWith("/practice/shop")) {
        return [{ method: "GET", url: "/api/products", status: 200 }];
      }
      return [];
    }
    default:
      return [];
  }
}

function assertEnabled(node: SimNode, method: string) {
  if (node.disabled) {
    throw new ActionError(
      `locator.${method}: Timeout 5000ms exceeded.`,
      {
        reason: `element is not enabled — resolved to ${describeNode(node)}`,
        hint: "The element exists but the application never enabled it. Check the preconditions rather than raising the timeout.",
      },
    );
  }
  if (node.hidden) {
    throw new ActionError(`locator.${method}: Timeout 5000ms exceeded.`, {
      reason: `element is not visible — resolved to ${describeNode(node)}`,
    });
  }
}

function setField(state: SimState, field: string, value: string): SimState {
  return { ...state, fields: { ...state.fields, [field]: value } };
}

export function performAction(
  state: SimState,
  node: SimNode,
  call: Call,
): ActionResult {
  const { name, args } = call;

  switch (name) {
    case "click":
    case "dblclick": {
      assertEnabled(node, name);

      if (node.role === "checkbox") {
        const field = node.field ?? "";
        const next = {
          ...state,
          checks: { ...state.checks, [field]: !state.checks[field] },
        };
        return { state: next, requests: [] };
      }

      if (node.role === "radio" && node.field?.includes(":")) {
        const [group, value] = node.field.split(":");
        return { state: setField(state, group, value), requests: [] };
      }

      if (!node.action) {
        return {
          state,
          requests: [],
          note: `clicked ${describeNode(node)} — no application behaviour is attached to it`,
        };
      }

      const action = node.action as SimAction;
      return { state: reduce(state, action), requests: requestsFor(action) };
    }

    case "fill":
    case "type":
    case "pressSequentially": {
      assertEnabled(node, name);
      if (!node.field) {
        throw new ActionError(`locator.${name}: Element is not an input`, {
          reason: `resolved to ${describeNode(node)}`,
          hint: "fill() only works on textboxes. Did you mean click()?",
        });
      }
      const value = args[0];
      return {
        state: setField(state, node.field, value === undefined ? "" : String(value)),
        requests: [],
      };
    }

    case "clear": {
      assertEnabled(node, name);
      if (!node.field) {
        throw new ActionError("locator.clear: Element is not an input", {
          reason: `resolved to ${describeNode(node)}`,
        });
      }
      return { state: setField(state, node.field, ""), requests: [] };
    }

    case "check":
    case "uncheck":
    case "setChecked": {
      assertEnabled(node, name);
      const desired =
        name === "check" ? true : name === "uncheck" ? false : args[0] !== false;

      if (node.role === "radio" && node.field?.includes(":")) {
        const [group, value] = node.field.split(":");
        if (!desired) {
          throw new ActionError("locator.uncheck: Cannot uncheck a radio button", {
            reason: "Radio buttons are cleared by checking a different option.",
          });
        }
        return { state: setField(state, group, value), requests: [] };
      }

      if (node.role !== "checkbox") {
        throw new ActionError(`locator.${name}: Not a checkbox or radio button`, {
          reason: `resolved to ${describeNode(node)}`,
          hint: "check() only works on checkboxes and radio buttons.",
        });
      }

      const field = node.field ?? "";
      return {
        state: { ...state, checks: { ...state.checks, [field]: desired } },
        requests: [],
      };
    }

    case "selectOption": {
      assertEnabled(node, name);
      if (node.role !== "combobox") {
        throw new ActionError("locator.selectOption: Element is not a <select>", {
          reason: `resolved to ${describeNode(node)}`,
          hint: "Custom dropdowns need click() on the trigger, then click() on the option.",
        });
      }

      const chosen = resolveOptionValue(node, args[0]);
      if (chosen === undefined) {
        throw new ActionError("locator.selectOption: Option not found", {
          reason: `Available options: ${(node.options ?? [])
            .map((o) => `${o.label} (${o.value || "empty"})`)
            .join(", ")}`,
        });
      }
      return { state: setField(state, node.field ?? "", chosen), requests: [] };
    }

    case "press": {
      assertEnabled(node, name);
      const key = String(args[0] ?? "");
      if (key === "Enter" && node.field === "shopSearch") {
        const action: SimAction = { type: "search.submit" };
        return { state: reduce(state, action), requests: requestsFor(action) };
      }
      return { state, requests: [], note: `pressed ${key}` };
    }

    case "hover":
    case "focus":
    case "blur":
    case "scrollIntoViewIfNeeded":
      return { state, requests: [] };

    case "waitFor": {
      const options = (args[0] ?? {}) as Record<string, SimValue>;
      const desired = String(options.state ?? "visible");
      const visible = !node.hidden;
      const ok =
        desired === "visible" || desired === "attached" ? visible : !visible;

      if (!ok) {
        throw new ActionError(
          `locator.waitFor: Timeout 5000ms exceeded waiting for state "${desired}"`,
          { reason: `resolved to ${describeNode(node)}` },
        );
      }
      return { state, requests: [] };
    }

    default:
      throw new ActionError(`The simulator does not support "${name}()" yet.`, {
        hint: `Supported actions: ${[...ACTION_METHODS].join(", ")}.`,
      });
  }
}

function resolveOptionValue(node: SimNode, arg: SimValue): string | undefined {
  const options = node.options ?? [];

  if (typeof arg === "string") {
    const byValue = options.find((o) => o.value === arg);
    if (byValue) return byValue.value;
    const byLabel = options.find(
      (o) => o.label.toLowerCase() === arg.toLowerCase(),
    );
    return byLabel?.value;
  }

  if (arg && typeof arg === "object" && !Array.isArray(arg)) {
    const record = arg as Record<string, SimValue>;
    if (typeof record.label === "string") {
      return options.find((o) => o.label === record.label)?.value;
    }
    if (typeof record.value === "string") {
      return options.find((o) => o.value === record.value)?.value;
    }
    if (typeof record.index === "number") {
      return options[record.index]?.value;
    }
  }

  return undefined;
}

/** Values readable from a locator, used by assertions and variables. */
export function readLocatorValue(node: SimNode, method: string): string | number | boolean {
  switch (method) {
    case "textContent":
    case "innerText":
      return node.text ?? accessibleName(node);
    case "inputValue":
      return node.value ?? "";
    case "isVisible":
      return !node.hidden;
    case "isChecked":
      return Boolean(node.checked);
    case "isEnabled":
      return !node.disabled;
    case "isDisabled":
      return Boolean(node.disabled);
    default:
      return "";
  }
}

import {
  cartTotals,
  demoUser,
  getProduct,
  makeOrderNumber,
  type CartLine,
} from "@/lib/practice/shop-data";
import {
  emptyRegistrationValues,
  validateRegistration,
} from "@/lib/practice/registration-fields";

/**
 * State of the simulated application.
 *
 * The simulator is a tiny reducer-driven app: locator actions mutate fields,
 * clicks dispatch typed actions, and screens are pure functions of this state.
 * That is what makes the preview pane feel like a real browser.
 */

export type SimOrder = {
  orderNumber: string;
  total: number;
  status: "Pending" | "Paid" | "Shipped" | "Cancelled";
  items: { productId: string; quantity: number }[];
  placedAt: string;
};

export type SimState = {
  url: string;
  history: string[];
  fields: Record<string, string>;
  checks: Record<string, boolean>;
  auth: { name: string; email: string } | null;
  registrationSubmitted: boolean;
  registrationErrors: Record<string, string>;
  registeredName: string;
  loginError: string | null;
  cart: CartLine[];
  orders: SimOrder[];
  lastOrder: SimOrder | null;
  messageSent: boolean;
  messages: { subject: string; body: string }[];
  search: string;
  category: string;
  orderSequence: number;
  /** Set when the app is deliberately showing a network/error state. */
  productsError: string | null;
};

export const PROTECTED_ROUTES = [
  "/practice/shop/checkout",
  "/practice/shop/orders",
  "/practice/shop/messages",
];

export function createInitialState(url = "/practice/registration"): SimState {
  return {
    url,
    history: [url],
    fields: { ...emptyRegistrationValues },
    checks: {},
    auth: null,
    registrationSubmitted: false,
    registrationErrors: {},
    registeredName: "",
    loginError: null,
    cart: [],
    orders: [
      {
        orderNumber: "ORD-771204",
        total: 158.19,
        status: "Shipped",
        items: [{ productId: "p-1003", quantity: 1 }],
        placedAt: "2026-05-14",
      },
    ],
    lastOrder: null,
    messageSent: false,
    messages: [],
    search: "",
    category: "all",
    orderSequence: 0,
    productsError: null,
  };
}

export type SimAction =
  | { type: "navigate"; payload?: { url?: string } }
  | { type: "back" }
  | { type: "registration.submit" }
  | { type: "login.submit" }
  | { type: "logout" }
  | { type: "cart.add"; payload?: { productId?: string } }
  | { type: "cart.remove"; payload?: { productId?: string } }
  | { type: "cart.increment"; payload?: { productId?: string } }
  | { type: "cart.decrement"; payload?: { productId?: string } }
  | { type: "checkout.place" }
  | { type: "message.send" }
  | { type: "search.submit" }
  | { type: "order.cancel"; payload?: { orderNumber?: string } };

export function reduce(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "navigate": {
      const target = action.payload?.url ?? "/";
      return navigate(state, target);
    }

    case "back": {
      const history = [...state.history];
      history.pop();
      const previous = history[history.length - 1] ?? "/practice/shop";
      return { ...state, url: previous, history };
    }

    case "registration.submit": {
      const errors = validateRegistration(state.fields, Boolean(state.checks.terms));
      if (Object.keys(errors).length > 0) {
        return { ...state, registrationErrors: errors, registrationSubmitted: false };
      }
      return {
        ...state,
        registrationErrors: {},
        registrationSubmitted: true,
        registeredName: state.fields.firstName ?? "",
      };
    }

    case "login.submit": {
      const email = (state.fields.loginEmail ?? "").trim();
      const password = state.fields.loginPassword ?? "";

      if (email === demoUser.email && password === demoUser.password) {
        const next = {
          ...state,
          auth: { name: demoUser.fullName, email },
          loginError: null,
        };
        return navigate(next, "/practice/shop");
      }
      return { ...state, loginError: "Invalid email or password" };
    }

    case "logout":
      return navigate({ ...state, auth: null, cart: [] }, "/practice/shop/login");

    case "cart.add": {
      const productId = action.payload?.productId;
      if (!productId || !getProduct(productId)) return state;
      const existing = state.cart.find((l) => l.productId === productId);
      const cart = existing
        ? state.cart.map((l) =>
            l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [...state.cart, { productId, quantity: 1 }];
      return { ...state, cart };
    }

    case "cart.remove":
      return {
        ...state,
        cart: state.cart.filter((l) => l.productId !== action.payload?.productId),
      };

    case "cart.increment":
      return {
        ...state,
        cart: state.cart.map((l) =>
          l.productId === action.payload?.productId
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        ),
      };

    case "cart.decrement":
      return {
        ...state,
        cart: state.cart
          .map((l) =>
            l.productId === action.payload?.productId
              ? { ...l, quantity: l.quantity - 1 }
              : l,
          )
          .filter((l) => l.quantity > 0),
      };

    case "checkout.place": {
      if (state.cart.length === 0) return state;

      const required = [
        "shipFirstName",
        "shipLastName",
        "shipAddress",
        "shipCity",
        "shipProvince",
        "shipPostalCode",
        "cardNumber",
        "cardExpiry",
        "cardCvv",
      ];
      const missing = required.filter((f) => !state.fields[f]?.trim());
      if (missing.length > 0) {
        return {
          ...state,
          registrationErrors: { checkout: "Complete every required field" },
        };
      }

      const sequence = state.orderSequence + 1;
      const order: SimOrder = {
        orderNumber: makeOrderNumber(sequence),
        total: cartTotals(state.cart).total,
        status: "Pending",
        items: state.cart,
        placedAt: new Date().toISOString().slice(0, 10),
      };

      return {
        ...state,
        cart: [],
        orders: [order, ...state.orders],
        lastOrder: order,
        orderSequence: sequence,
        registrationErrors: {},
      };
    }

    case "order.cancel":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.orderNumber === action.payload?.orderNumber
            ? { ...o, status: "Cancelled" }
            : o,
        ),
      };

    case "message.send": {
      const subject = state.fields.messageSubject ?? "";
      const body = state.fields.messageBody ?? "";
      if (!subject.trim() || !body.trim()) {
        return {
          ...state,
          registrationErrors: { message: "Subject and message are required" },
        };
      }
      return {
        ...state,
        messageSent: true,
        messages: [{ subject, body }, ...state.messages],
        registrationErrors: {},
      };
    }

    case "search.submit":
      return { ...state, search: state.fields.shopSearch ?? "" };

    default:
      return state;
  }
}

function navigate(state: SimState, url: string): SimState {
  const target = normalizeUrl(url);
  const needsAuth = PROTECTED_ROUTES.some((route) => target.startsWith(route));

  const destination =
    needsAuth && !state.auth ? "/practice/shop/login" : target;

  return {
    ...state,
    url: destination,
    history: [...state.history, destination],
    // Leaving a screen resets its transient success state, exactly as a real
    // client-side app would when the component unmounts.
    registrationSubmitted:
      destination === "/practice/registration" ? state.registrationSubmitted : false,
    messageSent:
      destination === "/practice/shop/messages" ? state.messageSent : false,
    loginError: destination === "/practice/shop/login" ? state.loginError : null,
  };
}

export function normalizeUrl(url: string) {
  if (!url) return "/";
  const trimmed = url.trim();
  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/, "");
  const path = withoutOrigin.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) return `/${path}`;
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

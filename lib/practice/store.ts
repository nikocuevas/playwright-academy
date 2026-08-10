import { cookies } from "next/headers";
import {
  cartTotals,
  demoUser,
  getProduct,
  makeOrderNumber,
  type CartLine,
} from "./shop-data";

/**
 * In-memory session store for the ShopEasy practice app.
 *
 * Deliberately not a database: the platform has to deploy to Vercel's free tier
 * with zero configuration. The consequences are documented in the UI and the
 * README — data resets when the server restarts and is not shared between
 * serverless instances.
 */

/**
 * Two cookies, on purpose.
 *
 * `shopeasy_user` carries the authenticated identity and is what a
 * `storageState` file needs to preserve. `shopeasy_session` is the key for this
 * browser context's own cart and orders — clearing it in the auth setup gives
 * every test its own data bucket while staying signed in. Without that split,
 * parallel workers sharing one storageState would fight over one cart.
 */
export const SESSION_COOKIE = "shopeasy_session";
export const USER_COOKIE = "shopeasy_user";

export type Order = {
  orderNumber: string;
  status: "Pending" | "Paid" | "Shipped" | "Cancelled";
  items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  placedAt: string;
  shipping_address?: Record<string, string>;
};

export type Message = {
  id: string;
  subject: string;
  body: string;
  orderNumber?: string;
  status: "open" | "answered";
  sentAt: string;
};

export type Session = {
  id: string;
  user: { id: string; email: string; firstName: string; lastName: string } | null;
  cart: CartLine[];
  orders: Order[];
  messages: Message[];
  orderSequence: number;
};

type Store = { sessions: Map<string, Session> };

// Survives hot reloads in development.
const globalStore = globalThis as unknown as { __shopEasyStore?: Store };
const store: Store = (globalStore.__shopEasyStore ??= { sessions: new Map() });

function createSession(id: string): Session {
  return {
    id,
    user: null,
    cart: [],
    orders: [],
    messages: [],
    orderSequence: 0,
  };
}

export function newSessionId() {
  return `s-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Reads the session for the current request, creating its data bucket (and the
 * cookies) if this is the first call.
 */
export async function resolveSession(): Promise<Session> {
  const jar = await cookies();
  let id = jar.get(SESSION_COOKIE)?.value;

  if (!id) {
    id = newSessionId();
    jar.set(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  let session = store.sessions.get(id);
  if (!session) {
    session = createSession(id);
    store.sessions.set(id, session);
  }

  // Identity comes from its own cookie, so a fresh data bucket stays signed in.
  const userId = jar.get(USER_COOKIE)?.value;
  session.user = userId
    ? {
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
      }
    : null;

  return session;
}

export async function signIn() {
  const jar = await cookies();
  jar.set(USER_COOKIE, demoUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function signOut(session: Session) {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
  session.user = null;
  session.cart = [];
}

export function addToCart(session: Session, productId: string, quantity = 1) {
  const product = getProduct(productId);
  if (!product) return { error: "Product not found" as const };
  if (!product.inStock) return { error: "Product is out of stock" as const };

  const existing = session.cart.find((line) => line.productId === productId);
  if (existing) existing.quantity += quantity;
  else session.cart.push({ productId, quantity });

  return { ok: true as const };
}

export function setQuantity(session: Session, productId: string, quantity: number) {
  if (quantity <= 0) {
    session.cart = session.cart.filter((line) => line.productId !== productId);
    return { ok: true as const };
  }
  const line = session.cart.find((l) => l.productId === productId);
  if (!line) return { error: "Item not in cart" as const };
  line.quantity = quantity;
  return { ok: true as const };
}

export function serialiseCart(session: Session) {
  const items = session.cart.map((line) => {
    const product = getProduct(line.productId)!;
    return {
      productId: line.productId,
      name: product.name,
      unitPrice: product.price,
      quantity: line.quantity,
      lineTotal: Math.round(product.price * line.quantity * 100) / 100,
    };
  });

  return { items, ...cartTotals(session.cart) };
}

export function placeOrder(
  session: Session,
  shippingAddress?: Record<string, string>,
) {
  if (session.cart.length === 0) {
    return { error: "Cart is empty — add at least one item" as const };
  }

  const totals = cartTotals(session.cart);
  session.orderSequence += 1;

  const order: Order = {
    orderNumber: makeOrderNumber(session.orderSequence + session.orders.length),
    status: "Pending",
    items: session.cart.map((line) => {
      const product = getProduct(line.productId)!;
      return {
        productId: line.productId,
        name: product.name,
        quantity: line.quantity,
        unitPrice: product.price,
      };
    }),
    ...totals,
    placedAt: new Date().toISOString().slice(0, 10),
    shipping_address: shippingAddress,
  };

  session.orders.unshift(order);
  session.cart = [];

  return { ok: true as const, order };
}

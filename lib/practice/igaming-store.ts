import { cookies } from "next/headers";
import {
  demoIgamingUser,
  getMarket,
  getMarketOption,
  makeBetId,
  makeTransactionId,
  round2,
} from "./igaming-data";

/**
 * In-memory session store for the iGaming practice app.
 *
 * Independent of the ShopEasy store (`./store.ts`) — its own cookies, its own
 * in-memory map, its own session shape. Deliberately not a database, for the
 * same reasons documented on the ShopEasy store: data resets when the server
 * restarts and is not shared between serverless instances.
 */

/**
 * Two cookies, on purpose — same split as ShopEasy's store. `igaming_user`
 * carries the authenticated identity; `igaming_session` is the key for this
 * browser context's own wallet, bets and transactions.
 */
export const IGAMING_SESSION_COOKIE = "igaming_session";
export const IGAMING_USER_COOKIE = "igaming_user";

export type Wallet = {
  balance: number;
  bonusBalance: number;
  pendingBalance: number;
};

export type Bet = {
  id: string;
  marketId: string;
  marketLabel: string;
  optionId: string;
  optionLabel: string;
  odds: number;
  stake: number;
  status: "accepted" | "settled";
  outcome?: "win" | "lose";
  payout?: number;
  placedAt: string;
  settledAt?: string;
};

export type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "bet_stake" | "bet_payout";
  amount: number;
  balanceAfter: number;
  createdAt: string;
  reference?: string;
};

export type Session = {
  id: string;
  user: { id: string; email: string; username: string } | null;
  wallet: Wallet;
  bets: Bet[];
  transactions: Transaction[];
  depositLimit: number | null;
  depositedToday: number;
  selfExcluded: boolean;
  betSequence: number;
  txSequence: number;
  /** Idempotency-key -> the result that was produced the first time it was seen. */
  appliedIdempotencyKeys: Map<string, unknown>;
};

type Store = { sessions: Map<string, Session> };

// Survives hot reloads in development.
const globalStore = globalThis as unknown as { __igamingStore?: Store };
const store: Store = (globalStore.__igamingStore ??= { sessions: new Map() });

function createSession(id: string): Session {
  return {
    id,
    user: null,
    wallet: { balance: 500, bonusBalance: 25, pendingBalance: 0 },
    bets: [],
    transactions: [],
    depositLimit: null,
    depositedToday: 0,
    selfExcluded: false,
    betSequence: 0,
    txSequence: 0,
    appliedIdempotencyKeys: new Map(),
  };
}

export function newSessionId() {
  return `is-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Reads the session for the current request, creating its data bucket (and
 * the cookies) if this is the first call.
 */
export async function resolveIgamingSession(): Promise<Session> {
  const jar = await cookies();
  let id = jar.get(IGAMING_SESSION_COOKIE)?.value;

  if (!id) {
    id = newSessionId();
    jar.set(IGAMING_SESSION_COOKIE, id, {
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

  const userId = jar.get(IGAMING_USER_COOKIE)?.value;
  session.user = userId
    ? { id: demoIgamingUser.id, email: demoIgamingUser.email, username: demoIgamingUser.username }
    : null;

  return session;
}

export async function signIn() {
  const jar = await cookies();
  jar.set(IGAMING_USER_COOKIE, demoIgamingUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function signOut(session: Session) {
  const jar = await cookies();
  jar.delete(IGAMING_USER_COOKIE);
  session.user = null;
}

function recordTransaction(
  session: Session,
  type: Transaction["type"],
  amount: number,
  reference?: string,
): Transaction {
  session.txSequence += 1;
  const tx: Transaction = {
    id: makeTransactionId(session.txSequence),
    type,
    amount: round2(amount),
    balanceAfter: round2(session.wallet.balance),
    createdAt: new Date().toISOString(),
    reference,
  };
  session.transactions.unshift(tx);
  return tx;
}

/**
 * Deposits fake money into the wallet.
 *
 * Enforces two business rules QA must validate on a real platform: a
 * self-excluded player cannot deposit, and a deposit cannot push the player
 * over their own configured daily limit. `idempotencyKey`, when supplied,
 * makes a duplicate payment-provider callback safe — the second call with the
 * same key returns the first call's result instead of crediting twice.
 */
export function deposit(session: Session, amount: number, idempotencyKey?: string) {
  if (idempotencyKey) {
    const cacheKey = `deposit:${idempotencyKey}`;
    if (session.appliedIdempotencyKeys.has(cacheKey)) {
      return session.appliedIdempotencyKeys.get(cacheKey) as
        | { ok: true; transaction: Transaction; wallet: Wallet }
        | { error: string };
    }
  }

  if (session.selfExcluded) {
    return { error: "Player is self-excluded — deposits are blocked" as const };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Deposit amount must be greater than zero" as const };
  }
  if (session.depositLimit !== null && session.depositedToday + amount > session.depositLimit) {
    return {
      error: `Deposit would exceed the daily deposit limit of $${session.depositLimit.toFixed(2)}` as const,
    };
  }

  session.wallet.balance = round2(session.wallet.balance + amount);
  session.depositedToday = round2(session.depositedToday + amount);
  const transaction = recordTransaction(session, "deposit", amount);

  const result = { ok: true as const, transaction, wallet: { ...session.wallet } };
  if (idempotencyKey) session.appliedIdempotencyKeys.set(`deposit:${idempotencyKey}`, result);
  return result;
}

/** No negative balances: a withdrawal larger than the balance is rejected outright. */
export function withdraw(session: Session, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Withdrawal amount must be greater than zero" as const };
  }
  if (amount > session.wallet.balance) {
    return { error: "Insufficient balance for this withdrawal" as const };
  }

  session.wallet.balance = round2(session.wallet.balance - amount);
  const transaction = recordTransaction(session, "withdrawal", -amount);
  return { ok: true as const, transaction, wallet: { ...session.wallet } };
}

/**
 * Places a bet against a fixed market/option.
 *
 * Rejects a self-excluded player, a stake over the wallet balance, and an
 * unknown market/option (simulating a closed or invalid market). Like
 * `deposit`, `idempotencyKey` makes a double-submitted bet (a double-clicked
 * "Place Bet" button, or a retried request) safe: the same key returns the
 * bet that was already created instead of creating a second one.
 */
export function placeBet(
  session: Session,
  marketId: string,
  optionId: string,
  stake: number,
  idempotencyKey?: string,
) {
  if (idempotencyKey) {
    const cacheKey = `bet:${idempotencyKey}`;
    if (session.appliedIdempotencyKeys.has(cacheKey)) {
      return session.appliedIdempotencyKeys.get(cacheKey) as
        | { ok: true; bet: Bet; wallet: Wallet }
        | { error: string };
    }
  }

  if (session.selfExcluded) {
    return { error: "Player is self-excluded — betting is blocked" as const };
  }
  if (!Number.isFinite(stake) || stake <= 0) {
    return { error: "Stake must be greater than zero" as const };
  }

  const market = getMarket(marketId);
  const option = getMarketOption(marketId, optionId);
  if (!market || !option) {
    return { error: "Market or selection not found — it may be closed" as const };
  }
  if (stake > session.wallet.balance) {
    return { error: "Insufficient balance for this stake" as const };
  }

  session.wallet.balance = round2(session.wallet.balance - stake);
  session.betSequence += 1;

  const bet: Bet = {
    id: makeBetId(session.betSequence),
    marketId,
    marketLabel: market.label,
    optionId,
    optionLabel: option.label,
    odds: option.odds,
    stake: round2(stake),
    status: "accepted",
    placedAt: new Date().toISOString(),
  };
  session.bets.unshift(bet);
  recordTransaction(session, "bet_stake", -stake, bet.id);

  const result = { ok: true as const, bet, wallet: { ...session.wallet } };
  if (idempotencyKey) session.appliedIdempotencyKeys.set(`bet:${idempotencyKey}`, result);
  return result;
}

/**
 * Settles a bet. Rejects an already-settled bet outright — a bet can only
 * transition ACCEPTED -> SETTLED once, never SETTLED -> SETTLED again.
 */
export function settleBet(session: Session, betId: string, outcome: "win" | "lose") {
  const bet = session.bets.find((b) => b.id === betId);
  if (!bet) return { error: "Bet not found" as const };
  if (bet.status === "settled") return { error: "Bet has already been settled" as const };

  bet.status = "settled";
  bet.outcome = outcome;
  bet.settledAt = new Date().toISOString();

  if (outcome === "win") {
    const payout = round2(bet.stake * bet.odds);
    bet.payout = payout;
    session.wallet.balance = round2(session.wallet.balance + payout);
    recordTransaction(session, "bet_payout", payout, bet.id);
  } else {
    bet.payout = 0;
  }

  return { ok: true as const, bet, wallet: { ...session.wallet } };
}

export function setDepositLimit(session: Session, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Deposit limit must be greater than zero" as const };
  }
  session.depositLimit = round2(amount);
  return { ok: true as const, depositLimit: session.depositLimit };
}

export function selfExclude(session: Session) {
  session.selfExcluded = true;
  return { ok: true as const };
}

export function serialiseWallet(session: Session) {
  return {
    ...session.wallet,
    depositLimit: session.depositLimit,
    depositedToday: session.depositedToday,
    selfExcluded: session.selfExcluded,
  };
}

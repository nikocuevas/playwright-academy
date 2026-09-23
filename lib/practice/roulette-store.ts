import { cookies } from "next/headers";
import { colorOf, evaluateBet, validateBet, type BetType, type SpinColor } from "./roulette-engine";

/**
 * In-memory session store for the Casino QA Lab's European Roulette practice
 * app.
 *
 * Independent of every other practice app's store (ShopEasy's `store.ts`,
 * the iGaming wallet's `igaming-store.ts`) — its own cookie, its own
 * in-memory map, its own session shape. Same caveats as those: this is
 * deliberately not a database, so data resets on server restart and is not
 * shared across serverless instances. No login is required here — a session
 * and its starting balance auto-provision on first touch, the same way the
 * SQL Lab needs no login.
 */

export const ROULETTE_SESSION_COOKIE = "roulette_session";

export const STARTING_BALANCE = 1000;
export const MAX_BET = 10000;

export type RoundStatus = "READY" | "BET_PLACED" | "COMPLETED" | "FAILED";

export type RoundBet = {
  type: BetType;
  selection?: number;
  stake: number;
};

export type Round = {
  id: string;
  playerId: string;
  bet: RoundBet | null;
  result: number | null;
  color: SpinColor | null;
  payout: number;
  profit: number;
  status: RoundStatus;
  createdAt: string;
};

export type Session = {
  id: string;
  balance: number;
  maxBet: number;
  currentRound: Round;
  history: Round[];
  /** Test-only. Set by POST /api/casino/roulette/test-result, consumed by the next spin. */
  forcedResult: number | null;
  roundSequence: number;
};

type Store = { sessions: Map<string, Session> };

// Survives hot reloads in development.
const globalStore = globalThis as unknown as { __rouletteStore?: Store };
const store: Store = (globalStore.__rouletteStore ??= { sessions: new Map() });

function newSessionId() {
  return `rs-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function makeRoundId(sequence: number) {
  return `R${String(sequence).padStart(3, "0")}`;
}

function freshRound(playerId: string, sequence: number): Round {
  return {
    id: makeRoundId(sequence),
    playerId,
    bet: null,
    result: null,
    color: null,
    payout: 0,
    profit: 0,
    status: "READY",
    createdAt: new Date().toISOString(),
  };
}

function createSession(id: string): Session {
  return {
    id,
    balance: STARTING_BALANCE,
    maxBet: MAX_BET,
    currentRound: freshRound(id, 1),
    history: [],
    forcedResult: null,
    roundSequence: 1,
  };
}

/**
 * Reads the session for the current request, creating its data bucket (and
 * cookie) if this is the first call. No authentication — the cookie alone
 * identifies the (fictional) player.
 */
export async function resolveRouletteSession(): Promise<Session> {
  const jar = await cookies();
  let id = jar.get(ROULETTE_SESSION_COOKIE)?.value;

  if (!id) {
    id = newSessionId();
    jar.set(ROULETTE_SESSION_COOKIE, id, {
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

  return session;
}

export type PlaceBetResult =
  | { ok: true; round: Round; balance: number }
  | { error: string };

/**
 * Places a bet for the current round.
 *
 * The stake is deducted immediately — see the accounting model documented on
 * `evaluateBet` in `roulette-engine.ts`. Rejects a second bet while one is
 * already staged for this round (READY -> BET_PLACED is the only legal
 * transition this function performs); once a round has COMPLETED (or
 * FAILED), placing a bet starts a fresh round rather than being rejected.
 */
export function placeBet(
  session: Session,
  type: string | undefined,
  selection: unknown,
  stake: unknown,
): PlaceBetResult {
  if (session.currentRound.status === "BET_PLACED") {
    return { error: "A bet is already placed — spin it or reset before placing another" };
  }

  const validation = validateBet({ type, selection, stake }, session.balance, session.maxBet);
  if ("error" in validation) return { error: validation.error };

  if (session.currentRound.status === "COMPLETED" || session.currentRound.status === "FAILED") {
    session.roundSequence += 1;
    session.currentRound = freshRound(session.id, session.roundSequence);
  }

  const bet: RoundBet = {
    type: type as BetType,
    selection: selection === undefined || selection === null ? undefined : (selection as number),
    stake: stake as number,
  };

  session.balance -= bet.stake;
  session.currentRound.bet = bet;
  session.currentRound.status = "BET_PLACED";

  return { ok: true, round: session.currentRound, balance: session.balance };
}

export type SpinResult =
  | {
      ok: true;
      roundId: string;
      result: number;
      color: SpinColor;
      bet: RoundBet;
      won: boolean;
      payout: number;
      profit: number;
      balance: number;
    }
  | { error: string };

/**
 * Resolves the current round.
 *
 * The status check and its transition happen synchronously, with no `await`
 * between them — that's what makes two near-simultaneous spin requests safe:
 * whichever request's synchronous section runs first flips the round to
 * COMPLETED before yielding control, so the second one always sees a status
 * that has already moved on and is rejected cleanly instead of double-
 * processing the same round.
 */
export function spin(session: Session): SpinResult {
  if (session.currentRound.status !== "BET_PLACED") {
    return { error: "Place a bet before spinning" };
  }

  const round = session.currentRound;
  round.status = "COMPLETED";

  const result = session.forcedResult !== null ? session.forcedResult : Math.floor(Math.random() * 37);
  session.forcedResult = null;

  const bet = round.bet as RoundBet;
  const { won, profit, payout } = evaluateBet(bet, result);
  const color = colorOf(result);

  round.result = result;
  round.color = color;
  round.payout = payout;
  round.profit = profit;
  session.balance += payout;

  session.history.unshift(round);

  return { ok: true, roundId: round.id, result, color, bet, won, payout, profit, balance: session.balance };
}

export function resetGame(session: Session) {
  session.balance = STARTING_BALANCE;
  session.history = [];
  session.forcedResult = null;
  session.roundSequence += 1;
  session.currentRound = freshRound(session.id, session.roundSequence);
  return { balance: session.balance, status: session.currentRound.status };
}

/** Test-only. See `app/api/casino/roulette/test-result/route.ts`. */
export function setForcedResult(session: Session, result: number) {
  session.forcedResult = result;
}

export function serialiseState(session: Session) {
  const last = session.history[0];
  return {
    balance: session.balance,
    currentBet: session.currentRound.status === "BET_PLACED" ? session.currentRound.bet : null,
    lastResult: last ? { result: last.result, color: last.color } : null,
    status: session.currentRound.status,
    maxBet: session.maxBet,
  };
}

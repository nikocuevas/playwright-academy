# Casino QA Lab: Bug Hunt

Ten controlled, deterministic defects to hunt — the same ten the original
spec for this module asked for. They split cleanly into two kinds, and this
document is honest about why they're taught two different ways.

## Why two different formats

Baking a live, toggleable "break mode" into the shipped roulette app —
reachable at runtime, even behind a test-only gate — adds real risk of
accidental exposure and works directly against this module's other quality
requirement: **the shipped implementation must actually be correct.** So:

- **Seven of the ten bugs are data-level.** They're seeded directly into the
  Casino SQL Lab's dataset (`lib/sql-engine/casino-dataset.ts`) — live,
  queryable, and exactly as reliably reproducible as any seeded-data bug
  elsewhere in this academy (see the iGaming SQL Lab for the same pattern).
  Find them at [`/practice/casino-roulette-sql`](/practice/casino-roulette-sql).
- **Three are live-behavior bugs** — the kind that would come from a
  plausible implementation mistake in the running app, not from bad
  historical data. Rather than actually shipping the mistake, each one below
  shows the realistic *wrong* code next to what this app *actually* ships,
  and a specific exercise: write the Playwright test that would have caught
  it. This is deliberately reviewable and reproducible without ever running
  broken code in production.

## The seven SQL-discoverable bugs

Full detail, exact locations and the exercises that find them are in the
"SQL Validation for Casino Transactions" lesson and
[`content/casino-sql-exercises.ts`](../content/casino-sql-exercises.ts). In
summary: a bet whose stored payout doesn't match its bet type's formula, a
player whose stored balance disagrees with their own transaction history, a
duplicated transaction row, a duplicated round, a bet incorrectly marked won
against a result of 0, a bet accepted past what the player's balance could
have supported, and a `FAILED` round that nonetheless has a stake
transaction recorded against it.

## The three live-behavior bugs

### 1. UI balance differs from API balance

**The plausible mistake** — the UI computes its own "optimistic" balance
instead of trusting the server's response:

```tsx
// WRONG — the UI derives its own number instead of trusting the server
const [balance, setBalance] = useState(1000);

async function onSpin() {
  const res = await fetch('/api/casino/roulette/spin', { method: 'POST' });
  const data = await res.json();
  setBalance((b) => b + data.profit); // recomputes locally instead of using data.balance
}
```

**What this app actually ships** — the UI only ever displays the `balance`
field the server returned, never a value it computed itself:

```tsx
setBalance(data.balance); // the server's own figure, not a local recomputation
```

**Exercise** — write the test from the "UI + API Validation" lesson: act
through the UI, independently `GET /api/casino/roulette/state`, and assert
the two agree. Run it against the wrong version above (in a scratch branch,
if you want to see it fail) to confirm it actually catches the drift.

### 2. Bet history displays an incorrect (stale) status

**The plausible mistake** — the history list is built once, before the spin
resolves, and never refreshed:

```tsx
// WRONG — snapshots history before the spin's result exists
const historySnapshot = useMemo(() => history, []); // captured once, on mount
```

**What this app actually ships** — the bet-history list is re-fetched from
`GET /api/casino/roulette/history` after every spin, so each row reflects
that round's actual, final status:

```tsx
async function onSpin() {
  await postSpin();
  await refreshHistory(); // re-fetch, don't rely on a stale snapshot
}
```

**Exercise** — place a bet, force a losing result, spin, and assert the
first row in `bet-history` shows the correct outcome and payout for *that*
round — not the previous round's values, and not a placeholder.

### 3. Double-clicked Spin creates two rounds

**The plausible mistake** — the status check and the status transition are
separated by an `await`, leaving a window where two near-simultaneous
requests can both pass the check:

```ts
// WRONG — a race window between the check and the write
export function spin(session: Session): SpinResult {
  if (session.currentRound.status !== "BET_PLACED") {
    return { error: "Place a bet before spinning" };
  }
  await persistSomething(); // <-- any await here reopens the race window
  session.currentRound.status = "COMPLETED"; // too late: a second request may have
                                              // already passed the check above
  // ...
}
```

**What this app actually ships** (`lib/practice/roulette-store.ts`) — the
check and the transition happen synchronously, with no `await` between them:

```ts
export function spin(session: Session): SpinResult {
  if (session.currentRound.status !== "BET_PLACED") {
    return { error: "Place a bet before spinning" };
  }
  const round = session.currentRound;
  round.status = "COMPLETED"; // flipped immediately, synchronously — no window
  // ...
}
```

**Exercise** — this one you don't have to imagine: it's the real
concurrency test in `tests/casino/roulette/roulette.edge-cases.spec.ts` and
the "Testing Race Conditions" lesson. Fire two `POST /spin` requests via
`Promise.all` and assert exactly one succeeds and exactly one round lands in
history — against the real, correct implementation, proving the guard
actually works rather than merely trusting the code comment.

## What this teaches, beyond the ten bugs themselves

Bug hunting isn't only "did you find a defect that happens to be present
today." It's the skill of predicting the plausible mistake a change could
introduce, and having a test ready that would catch it the moment it
appears — which is exactly what a regression suite is for. See "Casino
Regression Strategy" for how these three specific scenarios map onto a
broader regression-suite design.

# Casino QA Lab: Roulette Architecture

The European Roulette practice app follows the same layered shape as the rest
of Playwright Academy's practice applications (see [`architecture.md`](architecture.md)),
specialized for a game that moves virtual money on every interaction.

## Layers

```text
UI                    app/(practice)/practice/casino-roulette/ + components/casino/
        ↓
API                   app/api/casino/roulette/*  (REST-style route handlers)
        ↓
Game engine           lib/practice/roulette-engine.ts  (pure functions, no I/O)
        ↓
Persistence           lib/practice/roulette-store.ts  (in-memory session store)
        ↓
Transaction history    session.history: Round[]  (returned by GET .../history)
```

Each layer is deliberately testable — and deliberately tested — on its own:

| Layer | What it's responsible for | What only testing *that layer* catches |
| --- | --- | --- |
| **UI** | Rendering state, collecting input, client-side validation feedback, accessibility | A control that's unreachable by keyboard, or a number that renders differently from what the server actually returned |
| **API** | Contract (status codes, response shape), validation, orchestrating the engine + store | A wrong status code, a malformed error body, or a rule the UI happens to also enforce client-side — so a UI test alone wouldn't notice the server-side copy of the rule is broken |
| **Game engine** (`roulette-engine.ts`) | Color mapping, win/loss evaluation, payout math, bet validation — pure functions, no cookies, no Next.js | A payout formula bug, independent of anything about HTTP or React — the fastest, most direct place to catch a math error |
| **Persistence** (`roulette-store.ts`) | Session state, the state machine, atomic balance updates, the test-only forced-result mechanism | A state-machine bug (an illegal transition succeeding) or a race condition — see the "Testing Race Conditions" lesson |
| **Transaction history** | The append-only record of completed/failed rounds | A round that completed but never got recorded, or got recorded twice |

## Why the game engine is separate from the store and the routes

`roulette-engine.ts` exports pure functions (`colorOf`, `evaluateBet`,
`validateBet`) with no dependency on Next.js, cookies, or the in-memory
session map. This is a deliberate application of "make the game logic
reusable and testable rather than putting all business logic directly in UI
components" (and, just as importantly, not only in route handlers either):

- The payout formula, the color mapping and the validation rules can be
  reasoned about — and unit-tested, if you choose to — with zero HTTP or
  React involved.
- The route handlers (`app/api/casino/roulette/*/route.ts`) stay thin:
  resolve the session, call one store function, translate its result into an
  HTTP response. All the actual game logic lives in one place.
- `roulette-store.ts` calls the engine's functions but owns none of the
  math itself — it owns *state* (the session, the round, the balance) and
  the rules about *when* a transition is legal.

## The accounting model, in one place

Stated once, authoritatively, here (and repeated in the "Testing Bets and
Payouts" lesson and in code comments on `evaluateBet`):

1. Placing a bet deducts the stake from the balance **immediately**.
2. On a win: `profit = stake × multiplier` (35 for a Number bet, 1 for the
   six even-money bets) is the net gain; `payout = stake + profit` is the
   total credited back to the balance (the stake, returned, plus the
   profit).
3. On a loss: both `profit` and `payout` are `0` — the balance simply stays
   at its post-stake-deduction value.
4. Net effect over a full round: `balance_after_round = balance_before_bet + profit`.

## The deterministic test-result mechanism

`POST /api/casino/roulette/test-result` sits outside the normal UI → API →
engine → store flow a real player ever triggers. It writes directly into
`roulette-store.ts`'s `forcedResult` slot, which `spin()` checks before
falling back to `Math.floor(Math.random() * 37)`. It is:

- **Header-gated**, not `NODE_ENV`-gated (see the code comment on
  `app/api/casino/roulette/test-result/route.ts` for why — a `NODE_ENV`
  gate can silently go dark under a production build and break CI).
- **Single-use** — consumed and cleared by the very next spin, so it can
  never silently leak into a round nobody intended to force.
- **Unreachable from the shipped UI** — no button, link or client-side code
  path in `components/casino/` or `app/(practice)/practice/casino-roulette/`
  ever calls it. Only `playwright/pages/RoulettePage.ts`'s `forceResult()`
  helper does, via `page.request`.

## Why each layer is tested separately in this module

A single end-to-end UI click-through proves the happy path renders. It does
not prove the state machine rejects an illegal transition, that two
concurrent requests can't double-spend a balance, that a network failure
doesn't leave a stake deducted with nothing to show for it, or that
*historical* data (the Casino SQL Lab's dataset) reconciles. Each of this
module's lessons and its five Playwright spec files targets one of these
layers specifically, for exactly that reason — see
[`igaming-testing.md`](igaming-testing.md) for the same principle applied to
the sportsbook side of the academy, and [`casino-bug-hunt.md`](casino-bug-hunt.md)
for three live-behavior bug scenarios this architecture is specifically
designed to make testable.

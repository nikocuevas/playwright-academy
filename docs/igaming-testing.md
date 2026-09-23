# iGaming QA strategy

This document is the strategy companion to the **iGaming QA & Online Gambling
Testing** track (`/learn/igaming-qa`). It describes how a QA team would approach
testing an online gambling platform — synthetic data throughout, no real
operators, no real money, no gambling advice. Where a rule depends on
jurisdiction (minimum age, KYC document requirements, self-exclusion duration),
this document treats it as *an example of the kind of requirement a QA team
would need to validate*, not a universal or regulatory statement.

## Why iGaming QA is not UI testing with a casino skin

A UI showing **"Bet placed successfully"** proves exactly one thing: the front
end rendered a success state. It proves nothing about:

- whether the wallet balance was actually debited by the stake,
- whether a `bets` row was persisted,
- whether a `transactions` ledger entry was created for the debit,
- whether a `bet.placed` event was published for downstream systems (risk,
  reporting, the bonus engine),
- whether the bet can be settled later, because nothing above it is real, or
- whether pressing "Place Bet" twice charged the wallet once or twice.

```text
UI test asserts:              Actually happened, or didn't:
┌───────────────────────┐     ┌───────────────────────────────────┐
│ "Bet placed            │     │ wallet.balance -= stake?           │
│  successfully" toast   │ ??? │ bets row inserted?                 │
│  is visible             │────▶│ transactions row inserted?         │
└───────────────────────┘     │ bet.placed event published?        │
                               │ duplicate click ignored?           │
                               └───────────────────────────────────┘
```

A bet-placement test that only asserts the toast is a test of the toast. A bet
placement test that also asserts the wallet balance (API), the bet record
(API or DB), and the transaction ledger (DB) is a test of the feature. This
distinction — and the habit of asking "what does this UI assertion *not*
prove?" — is the throughline of the whole track.

## The test pyramid, for a gambling platform

```text
                    ▲
                   ╱ ╲       E2E (few)
                  ╱───╲      Register → KYC → deposit → bet → settle → withdraw
                 ╱     ╲
                ╱───────╲    Integration (some)
               ╱         ╲   Wallet ↔ ledger, bet ↔ settlement, bonus ↔ wagering
              ╱───────────╲
             ╱             ╲ API (many)
            ╱───────────────╲ POST /wallet/deposit, POST /bets, GET /transactions
           ╱                 ╲
          ╱───────────────────╲ Unit (most)
         ╱ stake validation, odds formatting, limit math, idempotency-key logic ╲
        └─────────────────────────────────────────────────────────────────────┘
```

The shape is the same pyramid the rest of the curriculum teaches
([testing-strategy.md](testing-strategy.md)); what changes is *what sits at
each layer* for a money-moving platform. Financial correctness (does the
ledger balance?) is cheaper and more reliable to prove at the unit/API/DB
layers than by driving a browser through a bet slip twenty times.

## Critical business flows

```text
Player
  │
  ▼
Registration ──▶ Authentication ──▶ KYC / Age Verification ──▶ Geolocation
  │                                                                 │
  ▼                                                                 ▼
Risk / Fraud ◀───────────────────────────────────────────────  Wallet
  │                                                                 │
  ▼                                                                 ▼
Deposit ───────────────────────────────────────────────▶ Casino / Sportsbook
                                                                     │
                                                                     ▼
                                                                    Bet
                                                                     │
                                                                     ▼
                                                               Settlement
                                                                     │
                                                                     ▼
                                                         Wallet / Ledger update
                                                                     │
                                                                     ▼
                                                           Transaction History
```

Supporting systems that sit alongside this spine — each a QA surface in its
own right — include the bonus engine, responsible-gambling controls,
self-exclusion, the payment provider, the KYC provider, the geolocation
provider, the risk engine, notifications, the event/message bus and audit
logging. This is a **representative educational architecture**, not a
description of any specific operator's internal system.

Every one of the flows above is a candidate for a "deep" E2E test — deposit
through settlement, in one journey — but not every variation of it should be.
Risk-based testing (below) decides which few journeys earn a full E2E run and
which are covered at cheaper layers instead.

## Risk-based testing

Not everything can run at every layer for every release. A useful heuristic:

| Question | High risk → test more, test deeper |
| --- | --- |
| Does it touch money? | Deposits, withdrawals, bet stakes, settlement payouts |
| Is it hard to reverse? | A settled bet, a paid-out withdrawal, an activated self-exclusion |
| Does regulation or licensing depend on it? | Age gate, KYC gate, geolocation gate, self-exclusion enforcement |
| Would a duplicate be expensive? | Payment callbacks, settlement callbacks, bonus activation |
| Is the blast radius one player or many? | A pricing/odds bug on a popular market vs. one player's cosmetic issue |

Money-moving and hard-to-reverse flows get unit + API + DB + E2E coverage.
Cosmetic and low-blast-radius flows get UI coverage and stop there. A QA lead
should be able to point at any automated test and say which of these rows
justified it.

## UI vs API validation

| | UI test | API test |
| --- | --- | --- |
| Proves | The interface renders correctly given the underlying state | The endpoint's contract: status codes, payload shape, validation rules |
| Fast? | Slower — real browser, real rendering | Fast — no browser |
| Good for | Confirming the player-visible journey works | Exhaustive edge cases (every rejected stake, every KYC status) that would be tedious through a UI |
| Blind to | What's underneath (see the toast example above) | What the player actually experiences |

The practical rule used throughout this track: drive the *happy path* of a
critical journey through the UI once, and push every edge case (minimum
stake, maximum stake, insufficient balance, suspended market, expired
session, duplicate submission) down to the API layer, where it's cheaper to
run and easier to keep passing.

## Database and ledger validation

A UI or API test tells you what the system *said*. A database query tells
you what the system *did*. For a gambling platform, the ledger is the
system of record for money, and QA should be able to reconcile it
independently of whatever the application layer claims:

```sql
-- Starting balance + deposits - stakes + winnings - withdrawals
-- should equal the wallet's current balance, for every player.
SELECT
    w.player_id,
    w.balance                                      AS stored_balance,
    SUM(CASE WHEN t.type = 'deposit'    THEN t.amount ELSE 0 END)
  - SUM(CASE WHEN t.type = 'bet_stake'  THEN t.amount ELSE 0 END)
  + SUM(CASE WHEN t.type = 'bet_win'    THEN t.amount ELSE 0 END)
  - SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END)  AS calculated_balance
FROM wallets w
JOIN transactions t ON t.player_id = w.player_id
GROUP BY w.player_id, w.balance
HAVING w.balance <> calculated_balance;
```

Any row returned by that query is a reconciliation failure — money the
application believes exists that the ledger cannot account for, or vice
versa. See [SQL for Testers](sql-lab.md) for the query patterns this builds
on, and the iGaming SQL exercises for a dataset with these mismatches seeded
in deliberately.

## Integration testing

The wallet, the bet engine, the bonus engine, the risk engine and the
settlement process are usually separate services or modules communicating
over APIs or events. Integration tests should prove the seams, not just the
endpoints in isolation: does placing a bet that exhausts the wallet actually
prevent a second bet from being accepted concurrently? Does a settled bet's
event reach the ledger, or only the UI? Does bonus wagering progress update
when a *bonus-funded* bet settles, and not when a cash-funded one does?

## Concurrency testing

This is one of the highest-value places to spend QA effort on a financial
platform, because most concurrency bugs are invisible to sequential, single-
request testing. The canonical example:

```text
Wallet balance: £100

Request A: POST /bets { stake: 80 }   ┐
Request B: POST /bets { stake: 80 }   ┘  fired at the same instant

Wrong:  both succeed → wallet now -£60 (impossible balance)
Right:  exactly one succeeds; the other is rejected with "insufficient balance"
```

Other scenarios worth deliberately engineering into a suite: two simultaneous
withdrawal requests, a duplicated deposit-provider callback, a duplicated
settlement callback, a double-clicked "Place Bet" button, simultaneous bonus
activation from two tabs, and a self-exclusion request arriving while a bet
is mid-flight. The fix is usually one of: an idempotency key on the mutating
request, an atomic balance update (a single conditional `UPDATE ... WHERE
balance >= stake`, not a read-then-write), or a database-level constraint
that makes the invalid state impossible to persist in the first place. QA's
job is to prove the race *can* be won safely, not to trust that it probably
won't happen in production. See the **Concurrency & Race Conditions** and
**Idempotency & Duplicate Transactions** lessons for worked examples using
fake currency only.

## Responsible gambling, KYC and geolocation as QA surfaces

These three are easy to treat as "compliance's problem," but each is a
business-critical control with clear pass/fail behaviour QA can — and
should — automate:

- **Responsible gambling**: a player who sets a deposit limit and then
  attempts to exceed it should have the excess deposit rejected, not merely
  warned about.
- **KYC / age verification**: an unverified or under-minimum-age player
  reaching a deposit or bet action should be blocked before money moves, not
  after.
- **Geolocation**: a player whose location resolves to a restricted
  territory should be blocked from registering, depositing or betting,
  independent of what their account's stated address says.

Each of these controls has both a "does it block correctly" test and a "does
it fail closed" test — what happens when the KYC provider or geolocation
provider times out or errors should be defined behaviour, not undefined
behaviour discovered in production.

## Payment, betting and settlement testing

Payment testing covers successful and declined deposits/withdrawals, duplicate
deposit callbacks, withdrawal against insufficient funds, and negative-balance
prevention. Betting testing covers the full state machine (`CREATED →
ACCEPTED → SETTLED`, `CREATED → REJECTED`, `ACCEPTED → VOIDED`, and every
attempted transition that should be rejected) across valid/invalid stakes,
suspended and closed markets, and invalid odds. Settlement testing checks
that a winning bet credits the correct amount to the correct player exactly
once, that a losing bet debits nothing further, that void bets refund the
stake, and — critically — that settlement is idempotent: replaying the same
settlement event must not pay a player twice.

## Regression, smoke, release and production validation

| Stage | Question it answers | Typical scope |
| --- | --- | --- |
| Smoke | Is the build fundamentally alive? | Login, wallet loads, one bet placed and settled, one deposit |
| Regression | Did this change break something unrelated? | Full automated suite across all layers |
| Release | Is this specific release ready to ship? | Regression suite + risk-based manual checks on what actually changed |
| Production validation | Does production actually behave like staging said it would? | Read-only smoke checks (balances, recent settlements) against production data, no synthetic mutations against real money |

Production validation on a gambling platform deserves special care: QA
should default to *read-only* checks in production (querying a reporting
replica, reconciling recent settlements) rather than placing synthetic bets
or moving money against a live, real-money environment. This project's own
practice app and SQL Lab exist precisely so learners can rehearse the
destructive/mutating scenarios (duplicate deposits, race conditions, ledger
mismatches) safely, without ever touching anything real.

## See also

- [testing-strategy.md](testing-strategy.md) — this repository's own suite,
  which the iGaming practice app's tests (`tests/igaming/`) follow the same
  conventions as.
- [sql-lab.md](sql-lab.md) — the SQL engine the iGaming SQL Lab reuses.
- [igaming-test-cases.md](igaming-test-cases.md) — ~100 concrete scenarios
  derived from this strategy.
- [igaming-sample-defects.md](igaming-sample-defects.md) — realistic defects
  this strategy is designed to catch.

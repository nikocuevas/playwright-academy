# iGaming sample defects

Ten realistic defect reports for the fictional iGaming platform used
throughout the **iGaming QA & Online Gambling Testing** track. Every player,
bet, transaction and amount below is synthetic — written as the kind of bug
report these test cases ([igaming-test-cases.md](igaming-test-cases.md)) are
designed to catch, not a report about any real system.

---

## BUG-IG-001 — Duplicate wallet credit on retried deposit callback

**Severity:** Critical · **Priority:** P1

**Steps to Reproduce:**
1. Player `nora.qa@example.test` deposits £50 via the payment provider.
2. The provider's confirmation callback (`POST /webhooks/payments`, reference
   `PAY-REF-99213`) times out on the network hop back to the platform and is
   retried automatically by the provider three seconds later, with the same
   reference.
3. Both callback deliveries reach the platform.

**Expected Result:** The wallet is credited £50 exactly once; the second
delivery of `PAY-REF-99213` is recognised as a duplicate and ignored.

**Actual Result:** The wallet was credited £50 twice (£100 total), and two
`transactions` rows exist with the same `provider_reference`.

**Business Impact:** Direct financial loss — the platform credited £50 that
was never actually captured from the player's payment method a second time.
At scale, this is a systemic loss, not an isolated incident.

**Potential Area of Investigation:** The deposit-callback handler does not
check for an existing `transactions` row with the same `provider_reference`
before crediting the wallet. Needs a uniqueness constraint (or an
upsert-on-reference pattern) at the point the callback is processed, not just
application-level "should be fine" logic.

---

## BUG-IG-002 — Wallet balance goes negative under concurrent bet placement

**Severity:** Critical · **Priority:** P1

**Steps to Reproduce:**
1. Player `mateo.qa@example.test` has a wallet balance of £100.00.
2. Player opens the bet slip in two browser tabs and places an £80 stake bet
   from each tab within the same second.

**Expected Result:** Exactly one bet is accepted (`ACCEPTED`); the other is
rejected with "insufficient balance." Final wallet balance: £20.

**Actual Result:** Both bets were accepted. Final wallet balance: **-£60**.

**Business Impact:** The platform now owes settlement on two bets funded by
money that only existed once — a direct financial exposure that compounds
every time a player discovers they can do this.

**Potential Area of Investigation:** Bet placement reads the balance, then
writes the debit in a separate step (read-then-write), rather than a single
atomic conditional update (`UPDATE wallets SET balance = balance - :stake
WHERE player_id = :id AND balance >= :stake`, checking rows affected). See
the **Concurrency & Race Conditions** lesson for the general pattern.

---

## BUG-IG-003 — Duplicate settlement pays a winning bet twice

**Severity:** Critical · **Priority:** P1

**Steps to Reproduce:**
1. Bet `BET-4471` (player `priya.qa@example.test`, stake £10, odds 3.5) is
   accepted on an event that later resolves as a win.
2. The settlement worker processes the settlement event for `BET-4471`.
3. Due to a consumer redelivery on the message queue, the same settlement
   event is delivered and processed a second time roughly 40 seconds later.

**Expected Result:** `BET-4471` is settled once, crediting £35.00 exactly
once. Replaying the settlement event is a no-op.

**Actual Result:** The wallet was credited £35.00 twice. `bet_settlements`
contains two rows for `BET-4471`.

**Business Impact:** Direct financial loss, and a ledger that no longer
matches "one bet, one settlement" — undermines trust in every other
reconciliation report until fixed.

**Potential Area of Investigation:** Settlement processing has no idempotency
check against `bet_settlements` (e.g. a unique constraint on `bet_id`, or a
guard clause checking `bets.status != 'SETTLED'` before applying the payout)
before crediting the wallet.

---

## BUG-IG-004 — Self-excluded player is able to place a bet

**Severity:** Critical · **Priority:** P1

**Steps to Reproduce:**
1. Player `oliver.qa@example.test` submits a self-exclusion request at
   14:02:10 UTC. `self_exclusions.excluded_at = 2026-09-10T14:02:10Z`.
2. The player had an active session open on a second device before excluding.
3. At 14:03:40 UTC, from the still-open session, the player places a £15 bet.

**Expected Result:** The bet is rejected server-side; self-exclusion is
enforced independent of when the session was originally established.

**Actual Result:** The bet was accepted (`bets.created_at =
2026-09-10T14:03:40Z`, after the exclusion timestamp).

**Business Impact:** A direct player-protection and (in a real system,
regulatory) failure — the entire purpose of self-exclusion is defeated if an
already-open session bypasses it.

**Potential Area of Investigation:** Self-exclusion is checked only at login
time, not on every bet-placement request. The bet-placement handler needs a
self-exclusion check independent of session validity.

---

## BUG-IG-005 — Deposit limit is bypassed via a second payment method

**Severity:** High · **Priority:** P1

**Steps to Reproduce:**
1. Player `sofia.qa@example.test` sets a daily deposit limit of £200.
2. Player deposits £200 via payment method A (limit now fully used).
3. Player deposits a further £150 via payment method B, same calendar day.

**Expected Result:** The second deposit is rejected — the £200 daily limit
is per-player, not per-payment-method.

**Actual Result:** The second deposit succeeded. Total deposited for the day:
£350.

**Business Impact:** Responsible-gambling control failure — a limit a player
explicitly set to protect themselves had no actual effect once a second
payment method was involved.

**Potential Area of Investigation:** Deposit-limit enforcement appears to be
scoped to `(player_id, payment_method_id)` rather than `player_id` alone in
the daily-total query. Needs to aggregate across all payment methods for the
player.

---

## BUG-IG-006 — Registration succeeds from a restricted territory

**Severity:** High · **Priority:** P1

**Steps to Reproduce:**
1. Simulate geolocation resolving to a territory configured as restricted in
   the test environment's policy table.
2. Complete registration with otherwise-valid synthetic details.

**Expected Result:** Registration is blocked before a `players` row is
created.

**Actual Result:** Registration succeeded; the new account is fully created
and reaches the KYC step.

**Business Impact:** A jurisdictional control failure — depending on the
territory, this is the kind of gap that would need remediation before it
reached a real regulated environment.

**Potential Area of Investigation:** The geolocation check appears to run
only on the *login* path, not on the *registration* path — the two flows
likely share a middleware that was only wired into one of them.

---

## BUG-IG-007 — Expired KYC verification still permits gambling activity

**Severity:** High · **Priority:** P1

**Steps to Reproduce:**
1. Player `liam.qa@example.test` was KYC-approved on `2025-03-01`, with the
   verification configured to expire after a fixed period; `expires_at` has
   since passed.
2. Player attempts to place a bet today.

**Expected Result:** The bet is rejected and the player is prompted to
re-verify.

**Actual Result:** The bet was accepted. The authorization check reads
`kyc_verifications.status`, which is still `approved` — it never compares
`expires_at` against the current date.

**Business Impact:** Compliance exposure — an account that should require
re-verification is transacting as if freshly verified.

**Potential Area of Investigation:** Add an `expires_at` check alongside the
`status = 'approved'` check everywhere KYC is gated (bet placement, deposit,
withdrawal), not just at initial approval time.

---

## BUG-IG-008 — Bonus balance miscalculated after a partially-wagered bet is voided

**Severity:** Medium · **Priority:** P2

**Steps to Reproduce:**
1. Player `aisha.qa@example.test` has an active bonus with £40 outstanding
   wagering requirement.
2. Player places a £25 bonus-funded bet that qualifies toward wagering,
   reducing the requirement to £15.
3. The market is voided by the operator (event cancelled) before settlement.
   The £25 stake is refunded to the bonus balance.

**Expected Result:** The wagering requirement reduction from the voided bet
is reversed along with the refund — requirement returns to £40.

**Actual Result:** The stake was refunded to the bonus balance, but the
wagering requirement remained at £15 — the player now has £15 remaining
requirement against a refunded stake that no longer represents any wagering
activity, letting the bonus convert to cash faster than intended.

**Business Impact:** Bonus-cost exposure — bonus funds convert to
withdrawable cash without the player having actually wagered the required
amount.

**Potential Area of Investigation:** The void-handling path refunds the
stake but does not call the same wagering-requirement-reversal logic the
settlement-loss path uses. Likely two code paths that should share one
reversal function and currently don't.

---

## BUG-IG-009 — Transaction ledger mismatch on a large order of concurrent bets

**Severity:** High · **Priority:** P2

**Steps to Reproduce:**
1. Query, for player `emeka.qa@example.test`: starting balance + deposits −
   stakes + winnings − withdrawals, compared against `wallets.balance`.
2. Player placed 6 bets within an 8-second window during a live event
   (rapid in-play betting).

**Expected Result:** Calculated balance from the ledger equals
`wallets.balance` exactly.

**Actual Result:** Calculated balance is £4.50 lower than `wallets.balance`
— one stake debit (`BET-8823`, £4.50) has no corresponding `transactions`
row, even though the bet itself shows `status = ACCEPTED`.

**Business Impact:** A ledger the platform cannot reconcile is a ledger that
cannot be trusted for financial reporting, and this specific gap means the
wallet balance is *overstated* relative to what was actually staked.

**Potential Area of Investigation:** Under rapid concurrent writes, the
bet-acceptance path and the ledger-write path appear to not be wrapped in the
same transaction — a bet can be marked `ACCEPTED` even if the ledger insert
that should accompany it fails silently. Needs both writes in one atomic
transaction, or a reconciliation job that detects and alerts on the gap.

---

## BUG-IG-010 — Settlement event not published for cash-out-then-void sequence

**Severity:** Medium · **Priority:** P2

**Steps to Reproduce:**
1. Player `hana.qa@example.test` partially cashes out a live bet (50% of
   stake settled early).
2. The remaining live portion of the bet is later voided (market cancelled).
3. Check the event/message log for a settlement event covering the void
   portion.

**Expected Result:** A settlement event is published for the voided portion,
so downstream consumers (reporting, risk, the bonus engine's wagering
calculation) see the full lifecycle of the bet.

**Actual Result:** A settlement event was published for the cash-out portion
only. The void refund updated the wallet and the `bets` row, but no event was
published for it — downstream systems that rely on the event stream (rather
than polling the database) under-report this bet's final state.

**Business Impact:** Silent downstream data drift — reporting and the bonus
engine's wagering calculations can diverge from the actual ledger over time,
in a way that is invisible until someone cross-checks the event log against
the database directly.

**Potential Area of Investigation:** The void code path updates state
directly rather than going through the same event-publishing step the
settlement code path uses. Needs a single "bet reached a terminal state"
event-publishing function called from every path that can terminate a bet
(settle, void, cancel), not one per path.

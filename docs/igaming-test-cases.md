# iGaming test case catalog

Approximately 100 concrete QA scenarios for the fictional iGaming platform
used throughout the **iGaming QA & Online Gambling Testing** track. All data
(players, amounts, bet IDs, dates) is synthetic. "Automation Candidate"
states where the case is best proven — not every case should be automated,
and not every automated case belongs at the UI layer.

Companion documents: [igaming-testing.md](igaming-testing.md) (the strategy
these cases implement) and [igaming-sample-defects.md](igaming-sample-defects.md)
(defects these cases are designed to catch).

## Authentication

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-001 | Valid login succeeds | Critical | Verified player `nora.qa@example.test` exists | 1) Go to login 2) Enter valid credentials 3) Submit | Player lands on dashboard; wallet balance loads | UI |
| TC-AUTH-002 | Invalid password is rejected | Critical | Player exists | 1) Enter valid email, wrong password 2) Submit | Generic "invalid credentials" error; no indication of which field was wrong | UI + API |
| TC-AUTH-003 | Account locks after repeated failed logins | High | Player exists, 0 prior failures | 1) Submit wrong password 5 times 2) Attempt correct password | Account is temporarily locked; correct password is also rejected until lockout expires | API |
| TC-AUTH-004 | Session expires after inactivity | Medium | Player logged in | 1) Leave session idle past timeout 2) Attempt a wallet action | Player is redirected to login; no wallet action is performed | UI |
| TC-AUTH-005 | Logout invalidates the session token | High | Player logged in | 1) Logout 2) Replay the previous session's API request | Replayed request is rejected with 401 | API |
| TC-AUTH-006 | Self-excluded player cannot authenticate | Critical | Player is self-excluded | 1) Attempt login with valid credentials | Login is rejected or redirected to a self-exclusion notice; no dashboard access | API + UI |

## Registration

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-REG-001 | New player can register with valid details | Critical | Email not previously used | 1) Fill registration form with valid synthetic data 2) Submit | Account created in `pending_verification` status; confirmation shown | UI |
| TC-REG-002 | Duplicate email is rejected | Critical | Email already registered | 1) Register again with the same email | Registration rejected with "account already exists"; no second `players` row created | API + DB |
| TC-REG-003 | Weak password is rejected client- and server-side | High | — | 1) Submit registration with password `1234` | Rejected with password-policy error; request never reaches account creation | API |
| TC-REG-004 | Required fields are enforced server-side even if UI validation is bypassed | High | — | 1) POST /players with `firstName` omitted via API directly | 400 response; no player row created | API |
| TC-REG-005 | Registration from a restricted territory is blocked | Critical | Geolocation resolves to a restricted territory | 1) Attempt registration | Registration blocked before an account is created; reason not overly specific (avoid leaking which countries are restricted) | API |
| TC-REG-006 | Newly registered account starts with correct default state | High | New registration submitted | 1) Complete registration 2) Query player + wallet records | `players.status = pending_verification`, `wallets.balance = 0`, no KYC record marked approved | DB |

## KYC

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-KYC-001 | Valid identity document is approved | Critical | Player in `pending_verification` | 1) Submit valid synthetic ID document 2) KYC provider approves | `kyc_verifications.status = approved`; player can deposit | API |
| TC-KYC-002 | Invalid/unreadable document is rejected | High | Player pending | 1) Submit unreadable document | Status becomes `rejected`; player notified with next steps | API |
| TC-KYC-003 | Name/DOB mismatch between form and document is flagged | High | Player pending | 1) Submit document with mismatched DOB | Verification routed to manual review, not auto-approved | API |
| TC-KYC-004 | Duplicate identity across two player accounts is detected | Critical | Same synthetic identity used for a second account | 1) Register a second account with the same document identity | Second account flagged for manual review or rejected outright, not silently approved | API + DB |
| TC-KYC-005 | Provider timeout leaves verification pending, not silently approved | High | KYC provider simulated as slow/unavailable | 1) Submit document 2) Provider call times out | Status remains `pending`; player is not granted deposit/bet access | API |
| TC-KYC-006 | Expired verification blocks further gambling activity | Critical | Player was previously approved; verification has since expired | 1) Attempt to place a bet | Bet rejected; player prompted to re-verify | API + DB |
| TC-KYC-007 | Failed-KYC player cannot deposit or bet even with funds present | Critical | Player has `kyc_verifications.status = rejected` and a nonzero wallet balance (e.g. from a prior approved period) | 1) Attempt deposit 2) Attempt bet | Both rejected | API |

## Age Verification

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-AGE-001 | Registration with DOB under the configured minimum age is rejected | Critical | Minimum age configured (example value, jurisdiction-dependent in a real system) | 1) Register with DOB implying under-age | Registration rejected before account creation | API |
| TC-AGE-002 | Registration with DOB exactly at the minimum age succeeds | High | — | 1) Register with DOB exactly at minimum age (e.g. 18th birthday is today) | Registration allowed to proceed to KYC | API |
| TC-AGE-003 | Registration with a future DOB is rejected as invalid input | Medium | — | 1) Submit DOB in the future | Rejected as invalid, not evaluated as "under minimum age" | API |
| TC-AGE-004 | Registration with an implausible DOB (e.g. 150 years old) is rejected | Low | — | 1) Submit an implausible DOB | Rejected with a validation error | API |
| TC-AGE-005 | Age check uses document DOB, not just the form-entered DOB | High | Player submits form DOB above minimum, document DOB below minimum | 1) Complete registration 2) Submit KYC document with conflicting DOB | KYC step flags the mismatch; player is not granted access on form DOB alone | API |

## Geolocation

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-GEO-001 | Player in an allowed territory can access betting/casino | Critical | Geolocation resolves to an allowed territory | 1) Load sportsbook or casino lobby | Content loads normally | API |
| TC-GEO-002 | Player in a restricted territory is blocked from betting | Critical | Geolocation resolves to a restricted territory | 1) Attempt to place a bet | Bet rejected regardless of account status | API |
| TC-GEO-003 | Geolocation provider failure fails closed, not open | Critical | Geolocation provider simulated as unavailable | 1) Attempt a bet while provider is down | Bet is rejected/blocked, not silently allowed | API |
| TC-GEO-004 | Location mismatch between registration address and live geolocation is flagged | Medium | Player's stated address differs from resolved location | 1) Attempt to bet from the mismatched location | Flagged for risk review; behaviour depends on configured policy, but is never "ignored" | API |
| TC-GEO-005 | Rapid location change between sessions is flagged as suspicious | Medium | Two sessions in a short window resolve to implausibly distant locations | 1) Simulate session A location, then session B location shortly after | Risk engine records a flag; does not necessarily auto-block, but must not go unnoticed | API + DB |

## Wallet

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-WAL-001 | Wallet balance reflects sum of cash and bonus components correctly | High | Wallet has both cash and bonus balance | 1) GET /wallet | `balance`, `bonusBalance`, `pendingBalance` are each correct and internally consistent | API |
| TC-WAL-002 | Available balance excludes pending withdrawal amounts | High | A withdrawal is pending | 1) GET /wallet | `availableBalance` is reduced by the pending withdrawal amount | API |
| TC-WAL-003 | Wallet balance can never go negative via bet placement | Critical | Wallet balance is £20 | 1) Attempt a £50 stake bet | Bet rejected; balance unchanged at £20 | API |
| TC-WAL-004 | Wallet balance can never go negative via withdrawal | Critical | Wallet balance is £20 | 1) Attempt to withdraw £50 | Withdrawal rejected; balance unchanged | API |
| TC-WAL-005 | An adjustment (manual credit/debit) is fully traceable in the transaction history | Medium | Support issues a manual wallet adjustment | 1) Apply adjustment 2) GET /transactions | Adjustment appears with a reason code and an identifiable actor, not as an anonymous balance change | API + DB |
| TC-WAL-006 | Wallet balance reconciles against the transaction ledger | Critical | Player has a mixed history of deposits, stakes, wins and withdrawals | 1) Sum all transaction rows 2) Compare to `wallets.balance` | Sums match exactly | DB |
| TC-WAL-007 | Bonus balance is spent before cash balance where policy dictates | Medium | Wallet has both bonus and cash balance | 1) Place a bet smaller than the bonus balance | Bonus balance is debited first per configured policy; verified via the ledger, not just the UI total | API + DB |

## Payments

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-PAY-001 | Successful deposit credits the wallet and creates a ledger entry | Critical | Player verified | 1) POST /wallet/deposit with valid amount | Wallet balance increases by the exact amount; one `transactions` row of type `deposit` is created | API + DB |
| TC-PAY-002 | Declined deposit does not credit the wallet | Critical | Payment provider simulated as declining | 1) POST /wallet/deposit | Wallet balance unchanged; transaction recorded as `declined`, not `completed` | API |
| TC-PAY-003 | Duplicate deposit callback is not applied twice | Critical | A deposit has already been applied | 1) Replay the same provider callback (same reference ID) | Wallet is credited once; the duplicate callback is recognised and ignored/logged, not re-applied | API |
| TC-PAY-004 | Successful withdrawal debits the wallet and creates a ledger entry | Critical | Sufficient balance | 1) POST /wallet/withdraw with valid amount | Balance decreases by the exact amount; one `transactions` row of type `withdrawal` is created | API + DB |
| TC-PAY-005 | Withdrawal fails gracefully when the payment provider errors after debit | High | Provider simulated as failing after the wallet is debited | 1) Trigger the failure path | Wallet debit is reversed or the transaction is left in a reconcilable `pending`/`failed` state — never a silent loss of funds from the ledger's perspective | API + DB |
| TC-PAY-006 | Insufficient funds withdrawal is rejected before contacting the payment provider | High | Balance lower than requested withdrawal | 1) Attempt withdrawal | Rejected immediately with no provider call and no transaction row | API |
| TC-PAY-007 | Two simultaneous withdrawal requests against the same balance do not both succeed | Critical | Balance covers only one of the two requested withdrawals | 1) Fire two withdrawal requests concurrently, each individually valid but not together | Exactly one succeeds; the other is rejected with insufficient funds | API |
| TC-PAY-008 | Deposit amount below the configured minimum is rejected | Medium | Minimum deposit configured | 1) Attempt a deposit below minimum | Rejected with a clear minimum-amount error | API |

## Casino

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-CAS-001 | Game lobby lists only currently available games | High | One game is marked unavailable | 1) Load lobby | Unavailable game is excluded or clearly marked, not offered for launch | UI + API |
| TC-CAS-002 | Launching a game creates a game session record | High | Player verified, funded | 1) Launch a game | A `game_sessions` row is created linked to the player and game | API + DB |
| TC-CAS-003 | A completed game round updates the wallet exactly once | Critical | Active game session | 1) Play a round that results in a win | Wallet is credited once for the round's payout; one `game round` result is recorded | API + DB |
| TC-CAS-004 | A losing round debits only the stake, once | Critical | Active game session | 1) Play a round that results in a loss | Wallet debited by stake only; no double debit | API + DB |
| TC-CAS-005 | Duplicate game-round submission (double click / network retry) is not double-processed | Critical | Active game session | 1) Submit the same round request twice with the same round/idempotency reference | Round is processed once; wallet reflects a single outcome | API |
| TC-CAS-006 | Session expiration during an active round is handled without losing the stake | High | Session near expiry | 1) Start a round 2) Let the session expire before the round resolves | Round either completes and settles correctly, or the stake is safely returned — never silently lost | API + DB |
| TC-CAS-007 | Game interruption (client disconnect mid-round) does not leave wallet state inconsistent | High | Active round | 1) Simulate a disconnect mid-round 2) Reconnect | Wallet and round state are consistent with the actual outcome, queryable and reconcilable | API + DB |

## Betting

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-BET-001 | Valid bet within stake limits is accepted | Critical | Sufficient balance, open market | 1) Place a bet within min/max stake | Bet transitions `CREATED → ACCEPTED`; wallet debited; ledger entry created | API |
| TC-BET-002 | Stake below the minimum is rejected | High | Market open | 1) Place a bet below minimum stake | Bet rejected; wallet unaffected | API |
| TC-BET-003 | Stake above the maximum is rejected | High | Market open | 1) Place a bet above maximum stake | Bet rejected; wallet unaffected | API |
| TC-BET-004 | Bet against insufficient balance is rejected | Critical | Balance below stake | 1) Place a bet exceeding balance | Bet rejected with `CREATED → REJECTED`; no debit | API |
| TC-BET-005 | Bet on a suspended market is rejected | Critical | Market status `suspended` | 1) Place a bet on the suspended market | Bet rejected; market status reflected accurately to the player before submission where possible | API |
| TC-BET-006 | Bet on a closed market is rejected | Critical | Market status `closed` | 1) Place a bet on the closed market | Bet rejected | API |
| TC-BET-007 | Bet submitted with stale/invalid odds is rejected or re-priced per policy | High | Odds changed between display and submission | 1) Submit a bet referencing outdated odds | Bet is rejected or re-quoted per policy, never silently accepted at the old price if that would disadvantage the operator's stated rules | API |
| TC-BET-008 | Duplicate bet submission (double-click) results in exactly one accepted bet | Critical | Sufficient balance for one bet, not two | 1) Submit the identical bet request twice in rapid succession | Exactly one bet is accepted; wallet debited once | API |
| TC-BET-009 | An accepted bet can be voided, refunding the stake exactly once | High | Bet is `ACCEPTED` | 1) Void the bet | Bet becomes `VOIDED`; stake is refunded once; no `VOIDED → VOIDED` re-refund possible | API + DB |
| TC-BET-010 | Invalid state transitions are rejected | High | Bet is already `SETTLED` | 1) Attempt to cancel or void the settled bet | Rejected; state machine does not allow `SETTLED → VOIDED` | API |

## Settlement

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-SET-001 | A winning bet is settled and the correct payout is credited | Critical | Bet `ACCEPTED`, outcome known | 1) Trigger settlement | Bet becomes `SETTLED`; payout = stake × odds, credited exactly once | API + DB |
| TC-SET-002 | A losing bet is settled with no payout | High | Bet `ACCEPTED`, losing outcome | 1) Trigger settlement | Bet becomes `SETTLED`; no wallet credit; ledger reflects loss with no phantom entry | API + DB |
| TC-SET-003 | Replaying the same settlement event does not pay the player twice | Critical | Bet already settled | 1) Re-deliver the same settlement event/callback | Second delivery is recognised as a duplicate and ignored | API |
| TC-SET-004 | A settled bet has a corresponding ledger entry | Critical | Any settled bet | 1) Query `bet_settlements` and `transactions` for the same bet | Every settled bet has a matching transaction row; no orphans in either direction | DB |
| TC-SET-005 | Settlement of a void bet is not double-processed alongside the void refund | High | Bet voided before settlement | 1) Attempt to settle a voided bet | Rejected — a voided bet is not eligible for settlement | API |
| TC-SET-006 | Partial cash-out settles the correct partial amount and leaves the remainder live | Medium | Cash-out enabled for the market | 1) Cash out 50% of a live bet | Wallet credited for the cashed-out portion only; remaining stake still at risk | API + DB |
| TC-SET-007 | A bet stuck in `ACCEPTED` past its event's resolution window is flagged for investigation | Medium | Event resolved, bet not yet settled | 1) Query for accepted bets on resolved events | Query returns the stuck bet; this is the basis of a production-validation check | DB |
| TC-SET-008 | Settlement event publishes correctly for downstream consumers | High | Bet settled | 1) Settle a bet 2) Inspect the published event/message | Event contains bet ID, outcome and payout, and is published exactly once | API |

## Bonuses

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-BON-001 | Eligible player can activate a welcome bonus | High | Player meets eligibility (first deposit, no prior bonus) | 1) Make qualifying deposit 2) Activate bonus | Bonus balance credited; wagering requirement recorded | API + DB |
| TC-BON-002 | Ineligible player cannot activate the same bonus twice | Critical | Player already activated the welcome bonus | 1) Attempt to activate it again | Rejected; bonus balance not credited a second time | API + DB |
| TC-BON-003 | Bonus funds are tracked separately from cash funds | High | Active bonus balance | 1) GET /wallet | `bonusBalance` is distinct from `balance`; a bet funded by bonus is distinguishable in the ledger | API |
| TC-BON-004 | Wagering requirement decreases only for qualifying bets | High | Active bonus with a wagering requirement | 1) Place a bet that qualifies under the bonus terms 2) Place a bet that does not qualify | Only the qualifying bet reduces the outstanding wagering requirement | API + DB |
| TC-BON-005 | Bonus expires and is removed if the wagering requirement is not met in time | Medium | Bonus past its expiry with requirement unmet | 1) Trigger the expiry check | Bonus balance is zeroed/forfeited; player notified; event recorded | API + DB |
| TC-BON-006 | Completing the wagering requirement converts bonus funds to withdrawable cash | High | Wagering requirement fully met | 1) Meet the requirement | Bonus balance converts to cash balance; ledger shows the conversion explicitly | API + DB |
| TC-BON-007 | Bonus abuse pattern (e.g. opposite bets across linked accounts to lock in bonus value) is detectable via data | Medium | Two accounts share a payment instrument/device fingerprint and place opposing bets | 1) Query for correlated accounts with opposing bet patterns on the same market | Query surfaces the pattern for risk review | DB |

## Responsible Gambling

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-RG-001 | Player can set a deposit limit | High | No existing limit | 1) Set a daily deposit limit | Limit recorded and takes effect immediately | API |
| TC-RG-002 | Deposit exceeding the configured limit is rejected | Critical | Deposit limit set below the attempted amount | 1) Attempt a deposit above the limit | Deposit rejected outright, not merely flagged | API |
| TC-RG-003 | Lowering a deposit limit takes effect immediately; raising it is subject to a cooling-off delay | Medium | Existing limit set | 1) Attempt to raise the limit | Increase does not take effect until the cooling-off period elapses; a decrease takes effect immediately | API |
| TC-RG-004 | Loss limit blocks further losses once reached within the period | High | Loss limit configured | 1) Reach the configured loss limit via settled bets 2) Attempt another bet | Further betting is blocked for the remainder of the period | API + DB |
| TC-RG-005 | Wagering limit blocks further stakes once reached within the period | High | Wagering limit configured | 1) Reach the wagering limit 2) Attempt another bet | Further betting blocked for the period | API |
| TC-RG-006 | Session time reminder/restriction triggers at the configured threshold | Medium | Session-length control configured | 1) Remain active past the threshold | Reminder or forced break is triggered per configured policy | UI + API |
| TC-RG-007 | Deposit limit cannot be bypassed via a second payment method | Critical | Deposit limit set; two payment methods available | 1) Deposit up to the limit via method A 2) Attempt further deposit via method B | Second deposit is also rejected — the limit is per-player, not per-payment-method | API |

## Self-Exclusion

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-SE-001 | Player can initiate self-exclusion | High | Player active | 1) Submit a self-exclusion request | `self_exclusions` record created; account access restricted per policy | API + DB |
| TC-SE-002 | Self-excluded player cannot log in | Critical | Self-exclusion active | 1) Attempt login | Login blocked or redirected to an exclusion notice | API + UI |
| TC-SE-003 | Self-excluded player cannot place a bet even via a session started before exclusion took effect | Critical | Player had an active session, then self-excluded from another device | 1) Attempt a bet on the pre-existing session | Bet is rejected; exclusion is enforced server-side, not merely by blocking new logins | API |
| TC-SE-004 | Self-excluded player cannot launch a casino game | Critical | Self-exclusion active | 1) Attempt to launch a game | Blocked | API |
| TC-SE-005 | Self-excluded player cannot deposit | Critical | Self-exclusion active | 1) Attempt a deposit | Blocked | API |
| TC-SE-006 | Self-exclusion cannot be reversed before its minimum enforced duration elapses | High | Self-exclusion set with a minimum duration (policy-dependent) | 1) Attempt to cancel exclusion early | Rejected until the minimum duration has elapsed | API |

## Risk/Fraud

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-RISK-001 | Unusually large or rapid stake pattern raises a risk flag | Medium | Baseline betting pattern established | 1) Simulate a sudden spike in stake size/frequency | A `risk_assessments` row is created for review | DB |
| TC-RISK-002 | High-risk player's withdrawal is routed to manual review, not auto-approved | High | Player flagged high-risk | 1) Request a withdrawal | Withdrawal enters a manual-review state rather than completing automatically | API + DB |
| TC-RISK-003 | Risk engine timeout does not silently approve a flagged transaction | Critical | Risk engine simulated as unavailable | 1) Trigger a transaction requiring a risk check | Transaction is held/queued pending risk review, not approved by default | API |
| TC-RISK-004 | Suspicious transaction (e.g. rapid deposit-withdraw cycling) is detectable via data | Medium | Pattern seeded in test data | 1) Query for players depositing and withdrawing the same amount within a short window repeatedly | Query surfaces the pattern | DB |
| TC-RISK-005 | Manually restricted account is blocked from further deposits and bets | High | Risk team has restricted the account | 1) Attempt deposit 2) Attempt bet | Both blocked | API |
| TC-RISK-006 | A blocked transaction is fully auditable | Medium | A transaction was blocked by the risk engine | 1) Query `audit_logs` for the blocked transaction | Entry exists with reason, timestamp and actor (system/rule) | DB |

## API

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-API-001 | POST /players validates required fields and returns 400 with details on failure | High | — | 1) POST with missing required field | 400 with a field-level error message | API |
| TC-API-002 | POST /bets returns 201 with the created bet's id and status | High | Valid bet request | 1) POST /bets | 201; response body includes `id`, `status: "ACCEPTED"` | API |
| TC-API-003 | POST /bets rejects a request missing an idempotency key where one is required | High | Endpoint requires idempotency key | 1) POST /bets without the key | 400, request rejected before touching the wallet | API |
| TC-API-004 | GET /wallet requires authentication | High | No session | 1) GET /wallet with no auth | 401 | API |
| TC-API-005 | GET /transactions supports pagination and returns consistent ordering | Medium | Player has many transactions | 1) GET /transactions with a page size 2) GET the next page | No duplicate or skipped rows across pages | API |
| TC-API-006 | POST /wallet/deposit and POST /wallet/withdraw enforce the same amount validation rules consistently | Medium | — | 1) Submit a negative amount to each endpoint | Both reject with 400 | API |

## Database

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-DB-001 | No player has a negative wallet balance | Critical | Full dataset | 1) `SELECT * FROM wallets WHERE balance < 0` | Zero rows | DB |
| TC-DB-002 | No duplicate transactions share the same provider reference | Critical | Full dataset | 1) Group `transactions` by `provider_reference` HAVING count > 1 | Zero rows | DB |
| TC-DB-003 | Every `ACCEPTED` bet past its event's resolution has a settlement | High | Full dataset | 1) Find accepted bets on resolved events with no `bet_settlements` row | Zero rows in a healthy system; any row is a defect | DB |
| TC-DB-004 | Every settled bet has a matching ledger transaction | High | Full dataset | 1) Find `bet_settlements` rows with no corresponding `transactions` row | Zero rows | DB |
| TC-DB-005 | No self-excluded player has bets placed after their exclusion timestamp | Critical | Full dataset | 1) Join `self_exclusions` to `bets` where `bets.created_at > self_exclusions.excluded_at` | Zero rows | DB |
| TC-DB-006 | No player with `kyc_verifications.status != approved` has gambling activity | Critical | Full dataset | 1) Join failed/pending KYC players to `bets`/`transactions` | Zero rows | DB |

## Concurrency

| ID | Title | Priority | Preconditions | Steps | Expected Result | Automation Candidate |
| --- | --- | --- | --- | --- | --- | --- |
| TC-CON-001 | Two simultaneous bets that together exceed the balance result in exactly one success | Critical | Balance covers exactly one of two concurrent bet requests | 1) Fire both requests concurrently | One `ACCEPTED`, one `REJECTED`; final balance reflects one debit only | API |
| TC-CON-002 | Duplicate deposit callback fired concurrently is applied once | Critical | — | 1) Fire the same provider callback twice concurrently | Wallet credited once | API |
| TC-CON-003 | Duplicate settlement callback fired concurrently pays out once | Critical | Bet ready to settle | 1) Fire the same settlement event twice concurrently | Payout applied once | API |
| TC-CON-004 | Double-clicking "Place Bet" in the UI results in one bet, not two | High | Sufficient balance for one bet only | 1) Rapidly double-click the bet button | UI disables the button after first click, or the backend idempotency key collapses the duplicate — either way, one bet | UI + API |
| TC-CON-005 | Simultaneous bonus activation from two requests credits the bonus once | High | Player eligible, bonus not yet activated | 1) Fire two activation requests concurrently | Bonus credited once; second request rejected as already-activated | API |
| TC-CON-006 | Self-exclusion submitted while a bet is mid-flight still prevents that bet from completing, or the bet completing does not undo the exclusion | Critical | A bet request and a self-exclusion request race | 1) Fire both concurrently | System reaches a consistent, defensible state — either the bet is rejected under exclusion, or exclusion is applied immediately after — never "exclusion is silently ignored" | API |
| TC-CON-007 | Concurrent wallet reads during a write never observe a torn/partial balance | Medium | A deposit is being processed | 1) Read the wallet balance mid-write | Read returns either the pre- or post-write balance, never an intermediate/inconsistent value | API |

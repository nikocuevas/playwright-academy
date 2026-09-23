import type { Table, Column, Row, SqlValue } from "./dataset";

export type { Table, Column, Row, SqlValue };

/**
 * The iGaming SQL Lab dataset.
 *
 * Thirteen tables modelling a fictional online gambling platform, seeded with
 * data that contains ten deliberate inconsistencies — a negative wallet
 * balance, a duplicated deposit, a settled bet with no settlement record, a
 * win with no payout transaction, a wallet that doesn't reconcile, a
 * self-excluded player who still placed a bet, a failed-KYC player who still
 * gambled, a payment callback applied twice, and a transaction whose amount
 * disagrees with the bet it is supposed to fund. Those are the bugs the
 * iGaming QA Validation exercises ask you to find. Entirely synthetic data —
 * no real players, currency or operator is represented.
 */

const players: Table = {
  name: "players",
  description: "Registered players on the (fictional) platform.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "username", type: "text", description: "Display handle" },
    { name: "email", type: "text", description: "Account email" },
    { name: "dob", type: "date", description: "Date of birth" },
    { name: "country", type: "text", description: "ISO country code" },
    { name: "kyc_status", type: "text", description: "verified | pending | failed" },
    { name: "registered_at", type: "date", description: "Registration date" },
  ],
  rows: [
    { id: 1, username: "alice_w", email: "alice@example.test", dob: "1990-04-12", country: "GB", kyc_status: "verified", registered_at: "2025-09-01" },
    { id: 2, username: "bob_t", email: "bob@example.test", dob: "1985-11-03", country: "GB", kyc_status: "verified", registered_at: "2025-09-10" },
    { id: 3, username: "carla_m", email: "carla@example.test", dob: "1992-02-20", country: "IE", kyc_status: "verified", registered_at: "2025-09-15" },
    { id: 4, username: "dan_r", email: "dan@example.test", dob: "1988-07-08", country: "GB", kyc_status: "verified", registered_at: "2025-09-20" },
    { id: 5, username: "elena_k", email: "elena@example.test", dob: "1995-01-30", country: "MT", kyc_status: "verified", registered_at: "2025-10-01" },
    { id: 6, username: "farid_h", email: "farid@example.test", dob: "1991-05-17", country: "GB", kyc_status: "verified", registered_at: "2025-10-05" },
    { id: 7, username: "gina_s", email: "gina@example.test", dob: "1983-03-25", country: "GB", kyc_status: "verified", registered_at: "2025-10-10" },
    // Failed KYC — should never have been able to gamble. See bets/kyc_verifications.
    { id: 8, username: "harun_a", email: "harun@example.test", dob: "1999-12-01", country: "IE", kyc_status: "failed", registered_at: "2025-10-12" },
    { id: 9, username: "irene_v", email: "irene@example.test", dob: "1994-06-06", country: "GB", kyc_status: "verified", registered_at: "2025-10-18" },
    { id: 10, username: "jamal_o", email: "jamal@example.test", dob: "1990-09-09", country: "MT", kyc_status: "verified", registered_at: "2025-10-22" },
  ],
};

const wallets: Table = {
  name: "wallets",
  description: "One cash wallet per player. `balance` is the stored, authoritative figure.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "currency", type: "text", description: "ISO currency code (fictional GBP-equivalent)" },
    { name: "balance", type: "real", description: "Stored cash balance" },
    { name: "bonus_balance", type: "real", description: "Bonus funds, separate from cash" },
    { name: "pending_balance", type: "real", description: "Funds tied up in a pending withdrawal" },
  ],
  rows: [
    { id: 1, player_id: 1, currency: "GBP", balance: 170, bonus_balance: 0, pending_balance: 0 },
    // Negative balance — should never be possible. A real bug if seen live.
    { id: 2, player_id: 2, currency: "GBP", balance: -15, bonus_balance: 0, pending_balance: 0 },
    { id: 3, player_id: 3, currency: "GBP", balance: 180, bonus_balance: 10, pending_balance: 0 },
    { id: 4, player_id: 4, currency: "GBP", balance: 50, bonus_balance: 0, pending_balance: 0 },
    { id: 5, player_id: 5, currency: "GBP", balance: 160, bonus_balance: 0, pending_balance: 0 },
    // Stored balance (300) does not match the sum of this wallet's transactions (190).
    { id: 6, player_id: 6, currency: "GBP", balance: 300, bonus_balance: 0, pending_balance: 0 },
    { id: 7, player_id: 7, currency: "GBP", balance: 40, bonus_balance: 0, pending_balance: 0 },
    { id: 8, player_id: 8, currency: "GBP", balance: 25, bonus_balance: 0, pending_balance: 0 },
    { id: 9, player_id: 9, currency: "GBP", balance: 35, bonus_balance: 0, pending_balance: 0 },
    { id: 10, player_id: 10, currency: "GBP", balance: 90, bonus_balance: 0, pending_balance: 0 },
  ],
};

const transactions: Table = {
  name: "transactions",
  description: "The wallet ledger. Every balance-affecting event is one row.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "wallet_id", type: "integer", description: "References wallets.id" },
    { name: "bet_id", type: "integer", description: "References bets.id, when this transaction funds or pays out a bet" },
    { name: "type", type: "text", description: "deposit | withdrawal | bet_stake | bet_payout | bonus_credit | adjustment" },
    { name: "amount", type: "real", description: "Signed amount — positive credits the wallet, negative debits it" },
    { name: "status", type: "text", description: "completed | pending | failed" },
    { name: "idempotency_key", type: "text", description: "Client/provider-supplied key that should make retries safe" },
    { name: "created_at", type: "date", description: "Transaction timestamp" },
  ],
  rows: [
    { id: 1, wallet_id: 1, bet_id: null, type: "deposit", amount: 200, status: "completed", idempotency_key: "idem-p1-dep1", created_at: "2025-09-02" },
    { id: 2, wallet_id: 1, bet_id: 1, type: "bet_stake", amount: -30, status: "completed", idempotency_key: "idem-p1-bet1", created_at: "2025-09-08" },
    { id: 3, wallet_id: 2, bet_id: null, type: "deposit", amount: 50, status: "completed", idempotency_key: "idem-p2-dep1", created_at: "2025-09-11" },
    { id: 4, wallet_id: 2, bet_id: 2, type: "bet_stake", amount: -65, status: "completed", idempotency_key: "idem-p2-bet1", created_at: "2025-09-12" },
    // Duplicate charge: same wallet, type, amount and timestamp as row 6, but a
    // different idempotency_key — a real double-charge, not just a retried callback.
    { id: 5, wallet_id: 3, bet_id: null, type: "deposit", amount: 100, status: "completed", idempotency_key: "idem-p3-dep1", created_at: "2025-09-16" },
    { id: 6, wallet_id: 3, bet_id: null, type: "deposit", amount: 100, status: "completed", idempotency_key: "idem-p3-dep2", created_at: "2025-09-16" },
    { id: 7, wallet_id: 3, bet_id: 3, type: "bet_stake", amount: -20, status: "completed", idempotency_key: "idem-p3-bet1", created_at: "2025-09-17" },
    { id: 8, wallet_id: 4, bet_id: null, type: "deposit", amount: 100, status: "completed", idempotency_key: "idem-p4-dep1", created_at: "2025-09-21" },
    { id: 9, wallet_id: 4, bet_id: 4, type: "bet_stake", amount: -50, status: "completed", idempotency_key: "idem-p4-bet1", created_at: "2025-09-22" },
    { id: 10, wallet_id: 5, bet_id: null, type: "deposit", amount: 200, status: "completed", idempotency_key: "idem-p5-dep1", created_at: "2025-10-02" },
    { id: 11, wallet_id: 5, bet_id: 5, type: "bet_stake", amount: -40, status: "completed", idempotency_key: "idem-p5-bet1", created_at: "2025-10-03" },
    // Note: bet 5 settled as a 72-unit win (see bet_settlements) but there is no
    // bet_payout row here crediting wallet 5 — the payout was never applied.
    { id: 12, wallet_id: 6, bet_id: null, type: "deposit", amount: 150, status: "completed", idempotency_key: "idem-p6-dep1", created_at: "2025-10-06" },
    { id: 13, wallet_id: 6, bet_id: null, type: "deposit", amount: 100, status: "completed", idempotency_key: "idem-p6-dep2", created_at: "2025-10-09" },
    { id: 14, wallet_id: 6, bet_id: 6, type: "bet_stake", amount: -60, status: "completed", idempotency_key: "idem-p6-bet1", created_at: "2025-10-10" },
    { id: 15, wallet_id: 7, bet_id: null, type: "deposit", amount: 100, status: "completed", idempotency_key: "idem-p7-dep1", created_at: "2025-10-11" },
    // Placed after this player's self-exclusion started (2025-10-15) — should
    // have been blocked. See self_exclusions and bets.
    { id: 16, wallet_id: 7, bet_id: 7, type: "bet_stake", amount: -60, status: "completed", idempotency_key: "idem-p7-bet1", created_at: "2025-10-21" },
    { id: 17, wallet_id: 8, bet_id: null, type: "deposit", amount: 75, status: "completed", idempotency_key: "idem-p8-dep1", created_at: "2025-10-13" },
    // This player's KYC failed the day before — see kyc_verifications and bets.
    { id: 18, wallet_id: 8, bet_id: 8, type: "bet_stake", amount: -50, status: "completed", idempotency_key: "idem-p8-bet1", created_at: "2025-10-14" },
    // Same idempotency_key as row 20 — the payment provider's callback was
    // processed twice and never deduplicated.
    { id: 19, wallet_id: 9, bet_id: null, type: "deposit", amount: 30, status: "completed", idempotency_key: "idem-p9-shared", created_at: "2025-10-19T10:00:00" },
    // Same idempotency_key as row 19, arriving seconds later — a retried
    // webhook, not a byte-for-byte duplicate row (see the distinction the
    // "duplicate transactions" vs "duplicate callbacks" exercises teach).
    { id: 20, wallet_id: 9, bet_id: null, type: "deposit", amount: 30, status: "completed", idempotency_key: "idem-p9-shared", created_at: "2025-10-19T10:00:04" },
    { id: 21, wallet_id: 9, bet_id: 9, type: "bet_stake", amount: -25, status: "completed", idempotency_key: "idem-p9-bet1", created_at: "2025-10-20" },
    { id: 22, wallet_id: 10, bet_id: null, type: "deposit", amount: 150, status: "completed", idempotency_key: "idem-p10-dep1", created_at: "2025-10-23" },
    // Bet 10's stake is 75, but only 60 was ever debited from the wallet.
    { id: 23, wallet_id: 10, bet_id: 10, type: "bet_stake", amount: -60, status: "completed", idempotency_key: "idem-p10-bet1", created_at: "2025-10-24" },
  ],
};

const bets: Table = {
  name: "bets",
  description: "Sports/event bets. `stake` is what the player agreed to risk.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "market", type: "text", description: "The market description" },
    { name: "stake", type: "real", description: "Agreed stake amount" },
    { name: "odds", type: "real", description: "Decimal odds" },
    { name: "status", type: "text", description: "pending | accepted | settled | void | rejected" },
    { name: "placed_at", type: "date", description: "When the bet was placed" },
  ],
  rows: [
    { id: 1, player_id: 1, market: "Horse Racing - 3:15 York - Win", stake: 30, odds: 3.5, status: "settled", placed_at: "2025-09-08" },
    { id: 2, player_id: 2, market: "Football - Derby - Over 2.5 Goals", stake: 65, odds: 1.5, status: "settled", placed_at: "2025-09-12" },
    { id: 3, player_id: 3, market: "Tennis - Open Final - Match Winner", stake: 20, odds: 2.2, status: "settled", placed_at: "2025-09-17" },
    // Settled with no bet_settlements row — see bet_settlements.
    { id: 4, player_id: 4, market: "Football - Cup Semi-Final - Match Winner", stake: 50, odds: 2.0, status: "settled", placed_at: "2025-09-22" },
    { id: 5, player_id: 5, market: "Tennis - Masters - Match Winner", stake: 40, odds: 1.8, status: "settled", placed_at: "2025-10-03" },
    { id: 6, player_id: 6, market: "Basketball - League Final - Handicap", stake: 60, odds: 2.5, status: "settled", placed_at: "2025-10-10" },
    // Placed after this player's self-exclusion started.
    { id: 7, player_id: 7, market: "eSports - Grand Final - Match Winner", stake: 60, odds: 1.9, status: "accepted", placed_at: "2025-10-21" },
    // Placed by a player whose KYC had already failed.
    { id: 8, player_id: 8, market: "Football - Friendly - Match Winner", stake: 50, odds: 2.1, status: "accepted", placed_at: "2025-10-14" },
    { id: 9, player_id: 9, market: "Tennis - Open Round 1 - Match Winner", stake: 25, odds: 2.0, status: "settled", placed_at: "2025-10-20" },
    // Stake (75) disagrees with the wallet debit recorded for it (60).
    { id: 10, player_id: 10, market: "Football - League Match - Match Winner", stake: 75, odds: 1.6, status: "settled", placed_at: "2025-10-24" },
  ],
};

const betSettlements: Table = {
  name: "bet_settlements",
  description: "The settlement outcome for a bet. A missing row for a settled bet is a defect.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "bet_id", type: "integer", description: "References bets.id" },
    { name: "outcome", type: "text", description: "win | loss | void" },
    { name: "payout", type: "real", description: "Amount owed to the player, 0 for a loss" },
    { name: "settled_at", type: "date", description: "Settlement date" },
  ],
  rows: [
    { id: 1, bet_id: 1, outcome: "loss", payout: 0, settled_at: "2025-09-09" },
    { id: 2, bet_id: 2, outcome: "loss", payout: 0, settled_at: "2025-09-13" },
    { id: 3, bet_id: 3, outcome: "loss", payout: 0, settled_at: "2025-09-18" },
    // Bet 4 has no row here at all — settled in status, but never actually settled.
    // Bet 5 won and a payout was recorded, but no wallet transaction ever paid it out.
    { id: 4, bet_id: 5, outcome: "win", payout: 72, settled_at: "2025-10-04" },
    { id: 5, bet_id: 6, outcome: "loss", payout: 0, settled_at: "2025-10-11" },
    { id: 6, bet_id: 9, outcome: "loss", payout: 0, settled_at: "2025-10-21" },
    { id: 7, bet_id: 10, outcome: "loss", payout: 0, settled_at: "2025-10-25" },
  ],
};

const games: Table = {
  name: "games",
  description: "The casino game catalogue.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "name", type: "text", description: "Display name" },
    { name: "category", type: "text", description: "slots | table | live" },
    { name: "rtp", type: "real", description: "Theoretical return-to-player percentage" },
    { name: "status", type: "text", description: "active | disabled" },
  ],
  rows: [
    { id: 1, name: "Golden Reels", category: "slots", rtp: 96.2, status: "active" },
    { id: 2, name: "Blackjack Classic", category: "table", rtp: 99.5, status: "active" },
    { id: 3, name: "Mega Fortune Spins", category: "slots", rtp: 95.0, status: "active" },
    { id: 4, name: "Live Roulette", category: "live", rtp: 97.3, status: "active" },
    { id: 5, name: "Retired Slot", category: "slots", rtp: 94.0, status: "disabled" },
  ],
};

const gameSessions: Table = {
  name: "game_sessions",
  description: "A player's session inside a single game.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "game_id", type: "integer", description: "References games.id" },
    { name: "started_at", type: "date", description: "Session start" },
    { name: "ended_at", type: "date", description: "Session end, NULL while still open" },
    { name: "rounds_played", type: "integer", description: "Rounds completed in the session" },
  ],
  rows: [
    { id: 1, player_id: 1, game_id: 1, started_at: "2025-09-03T10:00:00", ended_at: "2025-09-03T10:20:00", rounds_played: 40 },
    { id: 2, player_id: 3, game_id: 2, started_at: "2025-09-16T14:00:00", ended_at: "2025-09-16T14:30:00", rounds_played: 15 },
    // Never closed out — a session-timeout / interruption scenario.
    { id: 3, player_id: 6, game_id: 4, started_at: "2025-10-06T20:00:00", ended_at: null, rounds_played: 8 },
    { id: 4, player_id: 9, game_id: 1, started_at: "2025-10-19T09:00:00", ended_at: "2025-10-19T09:05:00", rounds_played: 3 },
  ],
};

const bonuses: Table = {
  name: "bonuses",
  description: "Bonus grants. `amount` sits in a wallet's bonus_balance, separate from cash.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "type", type: "text", description: "welcome | deposit_match | reload" },
    { name: "amount", type: "real", description: "Bonus amount granted" },
    { name: "status", type: "text", description: "active | completed | expired | cancelled" },
    { name: "wagering_requirement", type: "real", description: "Total stake required before cashout" },
    { name: "wagering_completed", type: "real", description: "Stake wagered so far toward the requirement" },
    { name: "expires_at", type: "date", description: "Expiry date" },
  ],
  rows: [
    { id: 1, player_id: 1, type: "welcome", amount: 50, status: "active", wagering_requirement: 500, wagering_completed: 120, expires_at: "2025-12-01" },
    { id: 2, player_id: 3, type: "deposit_match", amount: 20, status: "completed", wagering_requirement: 100, wagering_completed: 100, expires_at: "2025-11-01" },
    { id: 3, player_id: 7, type: "welcome", amount: 30, status: "active", wagering_requirement: 300, wagering_completed: 0, expires_at: "2026-01-15" },
    { id: 4, player_id: 9, type: "reload", amount: 15, status: "cancelled", wagering_requirement: 150, wagering_completed: 40, expires_at: "2025-10-30" },
  ],
};

const kycVerifications: Table = {
  name: "kyc_verifications",
  description: "Identity/age verification checks.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "status", type: "text", description: "verified | pending | failed | manual_review" },
    { name: "provider", type: "text", description: "Third-party verification provider" },
    { name: "submitted_at", type: "date", description: "Submission date" },
    { name: "decided_at", type: "date", description: "Decision date" },
  ],
  rows: [
    { id: 1, player_id: 1, status: "verified", provider: "TrustID", submitted_at: "2025-09-01", decided_at: "2025-09-01" },
    { id: 2, player_id: 2, status: "verified", provider: "TrustID", submitted_at: "2025-09-10", decided_at: "2025-09-11" },
    { id: 3, player_id: 3, status: "verified", provider: "GlobalCheck", submitted_at: "2025-09-15", decided_at: "2025-09-16" },
    { id: 4, player_id: 4, status: "verified", provider: "TrustID", submitted_at: "2025-09-20", decided_at: "2025-09-20" },
    { id: 5, player_id: 5, status: "verified", provider: "GlobalCheck", submitted_at: "2025-10-01", decided_at: "2025-10-02" },
    { id: 6, player_id: 6, status: "verified", provider: "TrustID", submitted_at: "2025-10-05", decided_at: "2025-10-05" },
    { id: 7, player_id: 7, status: "verified", provider: "TrustID", submitted_at: "2025-10-10", decided_at: "2025-10-10" },
    // Failed KYC — this player should be blocked from gambling. See bets.
    { id: 8, player_id: 8, status: "failed", provider: "GlobalCheck", submitted_at: "2025-10-12", decided_at: "2025-10-12" },
    { id: 9, player_id: 9, status: "verified", provider: "TrustID", submitted_at: "2025-10-18", decided_at: "2025-10-19" },
    { id: 10, player_id: 10, status: "verified", provider: "GlobalCheck", submitted_at: "2025-10-22", decided_at: "2025-10-22" },
  ],
};

const responsibleGamblingLimits: Table = {
  name: "responsible_gambling_limits",
  description: "Player-set limits the platform must enforce.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "limit_type", type: "text", description: "deposit | loss | wagering" },
    { name: "amount", type: "real", description: "Limit amount" },
    { name: "period", type: "text", description: "daily | weekly | monthly" },
    { name: "set_at", type: "date", description: "When the limit was set" },
  ],
  rows: [
    { id: 1, player_id: 1, limit_type: "deposit", amount: 500, period: "monthly", set_at: "2025-09-01" },
    { id: 2, player_id: 6, limit_type: "deposit", amount: 200, period: "monthly", set_at: "2025-10-06" },
    { id: 3, player_id: 9, limit_type: "loss", amount: 100, period: "weekly", set_at: "2025-10-18" },
  ],
};

const selfExclusions: Table = {
  name: "self_exclusions",
  description: "Players who have self-excluded. Any activity after `excluded_at` is a defect.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "excluded_at", type: "date", description: "Exclusion start date" },
    { name: "reason", type: "text", description: "Reason code" },
    { name: "ends_at", type: "date", description: "Exclusion end date" },
  ],
  rows: [
    { id: 1, player_id: 7, excluded_at: "2025-10-15", reason: "player_request", ends_at: "2026-10-15" },
  ],
};

const riskAssessments: Table = {
  name: "risk_assessments",
  description: "Risk/fraud engine assessments.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "risk_level", type: "text", description: "low | medium | high" },
    { name: "reason", type: "text", description: "Free-text reason" },
    { name: "assessed_at", type: "date", description: "Assessment date" },
  ],
  rows: [
    { id: 1, player_id: 2, risk_level: "medium", reason: "Rapid deposit and stake pattern", assessed_at: "2025-09-13" },
    { id: 2, player_id: 6, risk_level: "high", reason: "Wallet balance does not reconcile with transaction history", assessed_at: "2025-10-11" },
    { id: 3, player_id: 9, risk_level: "high", reason: "Duplicate payment callback detected", assessed_at: "2025-10-19" },
  ],
};

const auditLogs: Table = {
  name: "audit_logs",
  description: "An append-only record of notable actions across the platform.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "entity_type", type: "text", description: "wallet | bet | kyc | transaction" },
    { name: "entity_id", type: "integer", description: "Id within entity_type's table" },
    { name: "action", type: "text", description: "What happened" },
    { name: "actor", type: "text", description: "system | payment-provider | player-<id>" },
    { name: "created_at", type: "date", description: "When it happened" },
  ],
  rows: [
    { id: 1, entity_type: "wallet", entity_id: 6, action: "balance_adjustment", actor: "system", created_at: "2025-10-10" },
    { id: 2, entity_type: "bet", entity_id: 7, action: "bet_placed", actor: "player-7", created_at: "2025-10-21" },
    { id: 3, entity_type: "kyc", entity_id: 8, action: "kyc_failed", actor: "system", created_at: "2025-10-12" },
    { id: 4, entity_type: "transaction", entity_id: 19, action: "payment_callback_received", actor: "payment-provider", created_at: "2025-10-19" },
    { id: 5, entity_type: "transaction", entity_id: 20, action: "payment_callback_received", actor: "payment-provider", created_at: "2025-10-19" },
  ],
};

export const igamingDatabase: Table[] = [
  players,
  wallets,
  transactions,
  bets,
  betSettlements,
  games,
  gameSessions,
  bonuses,
  kycVerifications,
  responsibleGamblingLimits,
  selfExclusions,
  riskAssessments,
  auditLogs,
];

export function getIgamingTable(name: string): Table | undefined {
  return igamingDatabase.find((t) => t.name.toLowerCase() === name.toLowerCase());
}

export const igamingTableNames = igamingDatabase.map((t) => t.name);

import type { Table, Column, Row, SqlValue } from "./dataset";

export type { Table, Column, Row, SqlValue };

/**
 * The Casino SQL Lab dataset.
 *
 * Four tables modelling the European Roulette practice app's back office:
 * players, rounds, bets and transactions. Seeded with data that contains
 * seven deliberate inconsistencies — a bet whose stored payout disagrees
 * with the payout formula, a player whose stored balance disagrees with
 * their own transaction history, a duplicated payout transaction, a
 * duplicated round (the same spin recorded twice), a bet incorrectly marked
 * a winner against a zero result, a stake accepted past the player's
 * available balance, and a failed round that nonetheless moved money. Those
 * are the bugs the Casino SQL exercises ask you to find. Entirely synthetic
 * virtual-credit data — no real players or currency are represented.
 */

const players: Table = {
  name: "players",
  description: "Registered players in the roulette practice app's back office.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "username", type: "text", description: "Display handle" },
    { name: "balance", type: "real", description: "Stored virtual-credit balance" },
  ],
  rows: [
    { id: 1, username: "alice_r", balance: 970 },
    { id: 2, username: "bob_k", balance: 1890 },
    { id: 3, username: "cara_l", balance: 980 },
    { id: 4, username: "diego_m", balance: 850 },
    { id: 5, username: "elle_p", balance: 2550 },
    // Stored balance (1130) disagrees with the sum of this player's own
    // transactions (1090) — a 40-credit reconciliation bug.
    { id: 6, username: "finn_q", balance: 1130 },
    // A stake was accepted past this player's available balance (round 12) —
    // stored balance reflects it, and it is legitimately negative.
    { id: 7, username: "gus_t", balance: -300 },
    { id: 8, username: "hana_v", balance: 1100 },
    { id: 9, username: "ivy_s", balance: 4400 },
    { id: 10, username: "jax_w", balance: 1200 },
  ],
};

const rounds: Table = {
  name: "rounds",
  description: "One row per roulette spin. `result` is the winning number (0-36), NULL if the round failed before a result was produced.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "game", type: "text", description: "Always 'roulette' in this dataset" },
    { name: "result", type: "integer", description: "Winning number 0-36, NULL for a FAILED round" },
    { name: "status", type: "text", description: "COMPLETED | FAILED" },
    { name: "created_at", type: "date", description: "When the round was recorded" },
  ],
  rows: [
    { id: 1, player_id: 1, game: "roulette", result: 9, status: "COMPLETED", created_at: "2026-01-05T10:00:00" },
    { id: 2, player_id: 1, game: "roulette", result: 3, status: "COMPLETED", created_at: "2026-01-06T11:00:00" },
    { id: 3, player_id: 2, game: "roulette", result: 7, status: "COMPLETED", created_at: "2026-01-08T09:00:00" },
    { id: 4, player_id: 2, game: "roulette", result: 8, status: "COMPLETED", created_at: "2026-01-08T09:15:00" },
    { id: 5, player_id: 3, game: "roulette", result: 5, status: "COMPLETED", created_at: "2026-01-10T14:00:00" },
    { id: 6, player_id: 3, game: "roulette", result: 10, status: "COMPLETED", created_at: "2026-01-10T14:10:00" },
    { id: 7, player_id: 4, game: "roulette", result: 15, status: "COMPLETED", created_at: "2026-01-12T16:00:00" },
    // Failed round — no result was ever produced. See transaction 23: it still
    // debited this player's balance, which it should never do.
    { id: 8, player_id: 4, game: "roulette", result: null, status: "FAILED", created_at: "2026-01-13T16:05:00" },
    { id: 9, player_id: 5, game: "roulette", result: 0, status: "COMPLETED", created_at: "2026-01-15T08:00:00" },
    { id: 10, player_id: 5, game: "roulette", result: 8, status: "COMPLETED", created_at: "2026-01-15T08:20:00" },
    { id: 11, player_id: 6, game: "roulette", result: 17, status: "COMPLETED", created_at: "2026-01-17T12:00:00" },
    { id: 12, player_id: 7, game: "roulette", result: 10, status: "COMPLETED", created_at: "2026-01-18T19:00:00" },
    { id: 13, player_id: 8, game: "roulette", result: 30, status: "COMPLETED", created_at: "2026-01-20T13:00:00" },
    { id: 14, player_id: 9, game: "roulette", result: 22, status: "COMPLETED", created_at: "2026-01-22T17:00:00" },
    { id: 15, player_id: 10, game: "roulette", result: 1, status: "COMPLETED", created_at: "2026-01-25T20:00:00" },
    { id: 16, player_id: 10, game: "roulette", result: 26, status: "COMPLETED", created_at: "2026-01-27T21:00:00" },
    // Duplicate of round 16 — same player, same result, same timestamp. A
    // spin that was recorded twice (see also its duplicated bet/transactions).
    { id: 17, player_id: 10, game: "roulette", result: 26, status: "COMPLETED", created_at: "2026-01-27T21:00:00" },
    // Result 0 with a bet incorrectly marked a High winner — see bets.
    { id: 18, player_id: 8, game: "roulette", result: 0, status: "COMPLETED", created_at: "2026-01-29T13:30:00" },
    { id: 19, player_id: 2, game: "roulette", result: 21, status: "COMPLETED", created_at: "2026-01-30T10:00:00" },
    // A real win — but no transactions were ever recorded for it. See transactions.
    { id: 20, player_id: 5, game: "roulette", result: 4, status: "COMPLETED", created_at: "2026-02-01T08:00:00" },
  ],
};

const bets: Table = {
  name: "bets",
  description: "One row per bet placed on a round.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "round_id", type: "integer", description: "References rounds.id" },
    { name: "bet_type", type: "text", description: "number | red | black | odd | even | low | high" },
    { name: "selection", type: "integer", description: "The chosen number, only for bet_type = 'number'" },
    { name: "stake", type: "real", description: "Amount staked" },
    { name: "payout", type: "real", description: "Amount credited back (stake + profit) on a win, 0 on a loss" },
    { name: "status", type: "text", description: "won | lost" },
  ],
  rows: [
    { id: 1, round_id: 1, bet_type: "red", selection: null, stake: 50, payout: 100, status: "won" },
    { id: 2, round_id: 2, bet_type: "black", selection: null, stake: 80, payout: 0, status: "lost" },
    { id: 3, round_id: 3, bet_type: "number", selection: 7, stake: 20, payout: 720, status: "won" },
    { id: 4, round_id: 4, bet_type: "even", selection: null, stake: 150, payout: 300, status: "won" },
    { id: 5, round_id: 5, bet_type: "low", selection: null, stake: 40, payout: 80, status: "won" },
    { id: 6, round_id: 6, bet_type: "high", selection: null, stake: 60, payout: 0, status: "lost" },
    { id: 7, round_id: 7, bet_type: "odd", selection: null, stake: 150, payout: 300, status: "won" },
    { id: 8, round_id: 9, bet_type: "number", selection: 0, stake: 50, payout: 1800, status: "won" },
    { id: 9, round_id: 10, bet_type: "red", selection: null, stake: 200, payout: 0, status: "lost" },
    { id: 10, round_id: 11, bet_type: "black", selection: null, stake: 90, payout: 180, status: "won" },
    { id: 11, round_id: 12, bet_type: "odd", selection: null, stake: 500, payout: 0, status: "lost" },
    { id: 12, round_id: 13, bet_type: "high", selection: null, stake: 70, payout: 140, status: "won" },
    // Number bet, stake 100 — correct payout is 36 x stake = 3600. Stored as
    // 3500. A payout-mismatch bug.
    { id: 13, round_id: 14, bet_type: "number", selection: 22, stake: 100, payout: 3500, status: "won" },
    { id: 14, round_id: 15, bet_type: "red", selection: null, stake: 50, payout: 100, status: "won" },
    { id: 15, round_id: 16, bet_type: "black", selection: null, stake: 25, payout: 50, status: "won" },
    // Duplicate of bet 15 (see the duplicate round 17).
    { id: 16, round_id: 17, bet_type: "black", selection: null, stake: 25, payout: 50, status: "won" },
    // Result was 0 — neither Low nor High can win on 0. Incorrectly marked a
    // High winner anyway. The payout (60 = 2 x 30) is formula-correct, which
    // is exactly why this bug needs a rules check, not just an arithmetic one.
    { id: 17, round_id: 18, bet_type: "high", selection: null, stake: 30, payout: 60, status: "won" },
    // Lost bet (result 21 is Red, this was a Black bet) with a nonzero payout
    // — a loss can never have a payout. An impossible-payout bug.
    { id: 18, round_id: 19, bet_type: "black", selection: null, stake: 40, payout: 80, status: "lost" },
    // A real win, correctly recorded here — but see transactions: none exist
    // for round 20 at all.
    { id: 19, round_id: 20, bet_type: "black", selection: null, stake: 60, payout: 120, status: "won" },
  ],
};

const transactions: Table = {
  name: "transactions",
  description: "The balance ledger. Every balance-affecting event is one row.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "player_id", type: "integer", description: "References players.id" },
    { name: "round_id", type: "integer", description: "References rounds.id, NULL for a deposit" },
    { name: "type", type: "text", description: "deposit | bet_stake | bet_payout" },
    { name: "amount", type: "real", description: "Signed amount — positive credits the balance, negative debits it" },
    { name: "balance_after", type: "real", description: "Running balance immediately after this transaction" },
    { name: "created_at", type: "date", description: "Transaction timestamp" },
  ],
  rows: [
    // Initial virtual-credit grants. Player 7's is 200, not the usual 1000 —
    // see round 12, where a 500-credit stake was accepted anyway.
    { id: 1, player_id: 1, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 2, player_id: 2, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 3, player_id: 3, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 4, player_id: 4, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 5, player_id: 5, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 6, player_id: 6, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 7, player_id: 7, round_id: null, type: "deposit", amount: 200, balance_after: 200, created_at: "2026-01-01" },
    { id: 8, player_id: 8, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 9, player_id: 9, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },
    { id: 10, player_id: 10, round_id: null, type: "deposit", amount: 1000, balance_after: 1000, created_at: "2026-01-01" },

    { id: 11, player_id: 1, round_id: 1, type: "bet_stake", amount: -50, balance_after: 950, created_at: "2026-01-05T10:00:01" },
    { id: 12, player_id: 1, round_id: 1, type: "bet_payout", amount: 100, balance_after: 1050, created_at: "2026-01-05T10:00:02" },
    { id: 13, player_id: 1, round_id: 2, type: "bet_stake", amount: -80, balance_after: 970, created_at: "2026-01-06T11:00:01" },

    { id: 14, player_id: 2, round_id: 3, type: "bet_stake", amount: -20, balance_after: 980, created_at: "2026-01-08T09:00:01" },
    { id: 15, player_id: 2, round_id: 3, type: "bet_payout", amount: 720, balance_after: 1700, created_at: "2026-01-08T09:00:02" },
    { id: 16, player_id: 2, round_id: 4, type: "bet_stake", amount: -150, balance_after: 1550, created_at: "2026-01-08T09:15:01" },
    { id: 17, player_id: 2, round_id: 4, type: "bet_payout", amount: 300, balance_after: 1850, created_at: "2026-01-08T09:15:02" },

    { id: 18, player_id: 3, round_id: 5, type: "bet_stake", amount: -40, balance_after: 960, created_at: "2026-01-10T14:00:01" },
    { id: 19, player_id: 3, round_id: 5, type: "bet_payout", amount: 80, balance_after: 1040, created_at: "2026-01-10T14:00:02" },
    { id: 20, player_id: 3, round_id: 6, type: "bet_stake", amount: -60, balance_after: 980, created_at: "2026-01-10T14:10:01" },

    { id: 21, player_id: 4, round_id: 7, type: "bet_stake", amount: -150, balance_after: 850, created_at: "2026-01-12T16:00:01" },
    { id: 22, player_id: 4, round_id: 7, type: "bet_payout", amount: 300, balance_after: 1150, created_at: "2026-01-12T16:00:02" },
    // Round 8 FAILED — no bet was ever accepted — yet this stake debit was
    // still applied. The core "failed round that changed the balance" bug.
    { id: 23, player_id: 4, round_id: 8, type: "bet_stake", amount: -300, balance_after: 850, created_at: "2026-01-13T16:05:01" },

    { id: 24, player_id: 5, round_id: 9, type: "bet_stake", amount: -50, balance_after: 950, created_at: "2026-01-15T08:00:01" },
    { id: 25, player_id: 5, round_id: 9, type: "bet_payout", amount: 1800, balance_after: 2750, created_at: "2026-01-15T08:00:02" },
    { id: 26, player_id: 5, round_id: 10, type: "bet_stake", amount: -200, balance_after: 2550, created_at: "2026-01-15T08:20:01" },

    { id: 27, player_id: 6, round_id: 11, type: "bet_stake", amount: -90, balance_after: 910, created_at: "2026-01-17T12:00:01" },
    { id: 28, player_id: 6, round_id: 11, type: "bet_payout", amount: 180, balance_after: 1090, created_at: "2026-01-17T12:00:02" },
    // finn_q's true ledger balance is 1090 (1000 - 90 + 180). The players row
    // above stores 1130 — the reconciliation bug.

    // Stake (500) exceeded this player's available balance (200) and was
    // accepted anyway — the balance went negative as a direct result.
    { id: 29, player_id: 7, round_id: 12, type: "bet_stake", amount: -500, balance_after: -300, created_at: "2026-01-18T19:00:01" },

    { id: 30, player_id: 8, round_id: 13, type: "bet_stake", amount: -70, balance_after: 930, created_at: "2026-01-20T13:00:01" },
    { id: 31, player_id: 8, round_id: 13, type: "bet_payout", amount: 140, balance_after: 1070, created_at: "2026-01-20T13:00:02" },

    { id: 32, player_id: 9, round_id: 14, type: "bet_stake", amount: -100, balance_after: 900, created_at: "2026-01-22T17:00:01" },
    // Matches bet 13's mismatched payout (3500, not the correct 3600) — the
    // ledger and the bet record agree with each other, so this bug is only
    // visible by checking the payout formula, not by reconciling the wallet.
    { id: 33, player_id: 9, round_id: 14, type: "bet_payout", amount: 3500, balance_after: 4400, created_at: "2026-01-22T17:00:03" },

    { id: 34, player_id: 10, round_id: 15, type: "bet_stake", amount: -50, balance_after: 950, created_at: "2026-01-25T20:00:01" },
    { id: 35, player_id: 10, round_id: 15, type: "bet_payout", amount: 100, balance_after: 1050, created_at: "2026-01-25T20:00:02" },
    // Duplicate of transaction 35 — same player, round, type and amount. A
    // payout applied twice.
    { id: 36, player_id: 10, round_id: 15, type: "bet_payout", amount: 100, balance_after: 1150, created_at: "2026-01-25T20:00:04" },
    { id: 37, player_id: 10, round_id: 16, type: "bet_stake", amount: -25, balance_after: 1125, created_at: "2026-01-27T21:00:01" },
    { id: 38, player_id: 10, round_id: 16, type: "bet_payout", amount: 50, balance_after: 1175, created_at: "2026-01-27T21:00:02" },
    // Duplicate round 17's own transactions — a different round_id, so this
    // is not flagged as a duplicate *transaction* (that check is scoped per
    // round), only as part of the duplicate *round* it belongs to.
    { id: 39, player_id: 10, round_id: 17, type: "bet_stake", amount: -25, balance_after: 1150, created_at: "2026-01-27T21:00:03" },
    { id: 40, player_id: 10, round_id: 17, type: "bet_payout", amount: 50, balance_after: 1200, created_at: "2026-01-27T21:00:04" },

    { id: 41, player_id: 8, round_id: 18, type: "bet_stake", amount: -30, balance_after: 1040, created_at: "2026-01-29T13:30:01" },
    { id: 42, player_id: 8, round_id: 18, type: "bet_payout", amount: 60, balance_after: 1100, created_at: "2026-01-29T13:30:02" },

    { id: 43, player_id: 2, round_id: 19, type: "bet_stake", amount: -40, balance_after: 1810, created_at: "2026-01-30T10:00:01" },
    // The round was a loss (result 21 is Red, bet was Black) — this payout
    // should not exist at all. The impossible-payout bug.
    { id: 44, player_id: 2, round_id: 19, type: "bet_payout", amount: 80, balance_after: 1890, created_at: "2026-01-30T10:00:02" },

    // Round 20 was a genuine win (bet 19) but no transactions were ever
    // recorded for it — the missing-transactions bug.
  ],
};

export const casinoDatabase: Table[] = [players, rounds, bets, transactions];

export function getCasinoTable(name: string): Table | undefined {
  return casinoDatabase.find((t) => t.name.toLowerCase() === name.toLowerCase());
}

export const casinoTableNames = casinoDatabase.map((t) => t.name);

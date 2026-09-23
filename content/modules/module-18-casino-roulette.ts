import type { Module } from "../types";

export const casinoRouletteModule: Module = {
  id: "casino-roulette-qa",
  order: 18,
  title: "Casino QA Lab: European Roulette",
  tagline: "A deterministic casino game, built specifically so you can automate it properly",
  summary:
    "A hands-on casino-testing specialization built around one real, playable game: European Roulette with a virtual 1,000-credit balance. You'll automate its UI, its API, its randomness, its concurrency, and its ledger — using a test-only mechanism that forces spin results, so every assertion is deterministic instead of hoping the wheel cooperates. Continues from Module 17's 'Casino / Game Testing' lesson into a full, playable practice app.",
  difficulty: "advanced",
  icon: "CircleDot",
  track: "igaming",
  lessons: [
    {
      id: "cr-fundamentals",
      slug: "casino-qa-fundamentals",
      title: "Casino QA Fundamentals",
      moduleId: "casino-roulette-qa",
      summary:
        "What makes casino-game testing different from testing a form or a cart, and a tour of the Roulette practice app you'll use for the rest of this module.",
      difficulty: "advanced",
      estimatedTime: 12,
      objectives: [
        "Explain what's specifically hard about testing a game with a random outcome and real money on the line",
        "Locate the Roulette practice app's controls and data-testids",
        "Understand why this app has a test-only mechanism for controlling outcomes",
      ],
      sections: [
        {
          kind: "text",
          title: "One game, every technique",
          body: [
            "Module 17's 'Casino / Game Testing' lesson covered casino testing conceptually — lobby, launch, session, round, settlement. This module gives you one real, playable game to apply all of it to: European Roulette, with a synthetic 1,000-credit starting balance, at /practice/casino-roulette.",
            "Roulette is a good teaching vehicle precisely because it's simple to explain and hard to test well: a genuinely random outcome, money that moves immediately on bet placement and again on settlement, seven bet types each with their own win condition and payout, and a UI that will happily show 'WIN' whether or not the backend agrees.",
            "Everything here is virtual-credit only — no real currency, no payment processing, no real gambling. The number is called 'credits' everywhere in the UI and API on purpose.",
          ],
        },
        {
          kind: "table",
          title: "The game, in one table",
          headers: ["Bet type", "Wins when", "Payout multiplier"],
          rows: [
            ["Number", "The spin result equals your chosen number (0-36)", "35:1"],
            ["Red", "The spin result is a red number", "1:1"],
            ["Black", "The spin result is a black number", "1:1"],
            ["Odd", "The spin result is odd (0 is neither)", "1:1"],
            ["Even", "The spin result is even (0 is neither)", "1:1"],
            ["Low", "The spin result is 1-18", "1:1"],
            ["High", "The spin result is 19-36", "1:1"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "0 is green, and it's not Low or High",
          body: [
            "0 belongs to no color group and no Low/High group. It only wins a Number bet on 0 itself. A surprising number of real-world roulette bugs are exactly this: someone's Low/High check used `result <= 18` instead of `result >= 1 && result <= 18`, silently paying out on 0.",
          ],
        },
        {
          kind: "list",
          title: "Where the game's UI exposes state for testing",
          items: [
            "`data-testid=\"balance\"` — the current credit balance",
            "`data-testid=\"winning-number\"` / `\"winning-color\"` — the last spin's result",
            "`data-testid=\"current-bet\"` — the bet staged for the round in progress",
            "`data-testid=\"game-result\"` — the win/loss message region (`aria-live=\"polite\"`, so a screen reader announces it the moment it changes)",
            "`data-testid=\"payout\"` — the credited amount from the last spin",
            "`data-testid=\"bet-history\"` / `\"bet-history-row\"` — the full round history",
            "`data-testid=\"validation-message\"` — the current form validation error, if any",
            "Everything else — bet-type radios, the number/stake inputs, Place Bet/Spin/Reset — is reachable with `getByRole` or `getByLabel`; this app does not add a testid where a semantic locator already works.",
          ],
        },
        {
          kind: "practice",
          href: "/practice/casino-roulette",
          title: "Open the Roulette table",
          body: "Play a few rounds by hand first. Notice exactly when the balance changes — on Place Bet, not on Spin.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "There is a deterministic test mode — and it matters why",
          body: [
            "`POST /api/casino/roulette/test-result` forces the next spin's outcome. It's covered in depth in 'Testing Randomness Deterministically' — for now, just know it exists, that it's header-gated so a real player can never trigger it, and that almost every test in this module uses it instead of gambling on a real random result.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating this like ShopEasy with a spinning wheel",
          body: "A cart total that's briefly wrong is a rendering bug. A balance that's briefly wrong here is the exact defect a real gambling regulator would ask about. Test accordingly.",
        },
        {
          title: "Skipping the 'play it by hand first' step",
          body: "You cannot write good assertions for a UI you haven't actually looked at. Five minutes of manual play saves an hour of guessing at locators.",
        },
      ],
      keyTakeaways: [
        "The balance moves twice per round: once (down) on bet placement, once (up, only on a win) on spin.",
        "0 is green and belongs to neither Low nor High — a common off-by-one source.",
        "A test-only mechanism exists specifically so randomness never has to be tested by hoping.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A player bets on High with a spin result of 0. What should happen?",
          options: [
            { id: "a", text: "It wins — 0 rounds down into range" },
            { id: "b", text: "It loses — 0 is neither Low nor High" },
            { id: "c", text: "The bet is rejected as invalid" },
            { id: "d", text: "It depends on the table's rules" },
          ],
          correct: "b",
          explanation:
            "0 wins nothing except a Number bet placed directly on 0. Any bug that pays out Low/High/Odd/Even on a 0 result is a real, testable defect.",
        },
      ],
    },

    {
      id: "cr-state",
      slug: "understanding-roulette-state",
      title: "Understanding Roulette State",
      moduleId: "casino-roulette-qa",
      summary:
        "The round state machine behind every bet — READY, BET_PLACED, COMPLETED, FAILED — and why QA's job is proving the illegal transitions are actually blocked.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Describe the round state machine and its legal transitions",
        "Read `GET /api/casino/roulette/state` and know what each field means",
        "Design a test for an illegal state transition, not just the happy path",
      ],
      sections: [
        {
          kind: "diagram",
          title: "One round's life cycle",
          ascii: `READY
  │  place bet (valid)
  ▼
BET_PLACED
  │  spin
  ▼
COMPLETED ──▶ (a new bet starts the next round; READY again)

FAILED: a round that never got a valid bet — no balance impact.`,
        },
        {
          kind: "code",
          title: "The state shape",
          language: "ts",
          code: `type Round = {
  id: string;
  playerId: string;
  bet: { type: BetType; selection?: number; stake: number } | null;
  result: number | null;
  color: "red" | "black" | "green" | null;
  payout: number;
  profit: number;
  status: "READY" | "BET_PLACED" | "COMPLETED" | "FAILED";
  createdAt: string;
};`,
        },
        {
          kind: "code",
          title: "GET /api/casino/roulette/state",
          language: "json",
          code: `{
  "balance": 1000,
  "currentBet": null,
  "lastResult": null,
  "status": "READY",
  "maxBet": 10000
}`,
        },
        {
          kind: "list",
          title: "The transitions that must be illegal — and are",
          items: [
            "Spinning while `status` is `READY` (no bet staged) — rejected with a clear error, no balance change.",
            "Placing a second bet while `status` is already `BET_PLACED` — rejected; you spin the first bet or reset, you don't silently overwrite it.",
            "Spinning a round twice — the moment a spin succeeds, `status` becomes `COMPLETED` and a second spin against the same round is rejected (this is also the mechanism that keeps a double-clicked Spin button safe — see 'Testing Race Conditions').",
          ],
        },
        {
          kind: "code",
          title: "Testing an illegal transition, not just the happy path",
          language: "ts",
          code: `import { test, expect } from '../../../playwright/fixtures/test';

test('spinning without a bet is rejected', async ({ page }) => {
  const response = await page.request.post('/api/casino/roulette/spin');
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toMatch(/place a bet/i);
});`,
        },
        {
          kind: "practice",
          href: "/practice/casino-roulette",
          title: "Try to break the state machine by hand",
          body: "Click Spin before placing a bet. Try to click Place Bet twice in a row. Confirm the app's own validation messages match what you'd assert in a test.",
        },
      ],
      commonMistakes: [
        {
          title: "Only testing the READY → BET_PLACED → COMPLETED happy path",
          body: "The state machine's entire value is in the transitions it refuses. A suite with no negative-transition tests hasn't tested the state machine at all.",
        },
        {
          title: "Asserting on UI text instead of the state the UI is meant to reflect",
          body: "A 'Place a bet first' toast proves the UI rendered a message. It doesn't prove the server actually refused the spin. Check both, and prefer the API assertion when in doubt.",
        },
      ],
      keyTakeaways: [
        "A round is READY, BET_PLACED, COMPLETED or FAILED — nothing else, and never two at once.",
        "COMPLETED is a one-way transition per round; a new bet starts a fresh round rather than re-opening the old one.",
        "The interesting tests are the transitions the state machine refuses, not the one it allows.",
      ],
      quiz: [
        {
          id: "q1",
          type: "predict-result",
          prompt:
            "A round is BET_PLACED. You call POST /spin twice, back to back, awaiting each call before making the next. What happens on the second call?",
          options: [
            { id: "a", text: "It spins again and overwrites the first result" },
            { id: "b", text: "It's rejected — the round is already COMPLETED" },
            { id: "c", text: "It queues and runs after a delay" },
            { id: "d", text: "It refunds the stake" },
          ],
          correct: "b",
          explanation:
            "The first call transitions the round to COMPLETED before returning. Awaited sequentially, the second call sees that and is rejected the same way spinning with no bet is.",
        },
      ],
    },

    {
      id: "cr-first-test",
      slug: "your-first-roulette-playwright-test",
      title: "Your First Roulette Playwright Test",
      moduleId: "casino-roulette-qa",
      summary:
        "Using the RoulettePage page object and the test-result mechanism together to write one complete, deterministic bet-to-payout test.",
      difficulty: "intermediate",
      estimatedTime: 15,
      objectives: [
        "Use the RoulettePage page object to place a bet and spin",
        "Force a spin result and assert every field it affects",
        "Explain why business assertions belong in the test, not hidden inside the page object",
      ],
      sections: [
        {
          kind: "text",
          title: "The page object",
          body: [
            "`playwright/pages/RoulettePage.ts` exposes locators and interactions (`selectBetType`, `setBetAmount`, `placeBet`, `spin`, `forceResult`, `getBalance`, ...) but deliberately no assertions. Business rules — what a win should pay, what the balance should become — live in the test, where they're visible and reviewable, not buried inside a helper class.",
          ],
        },
        {
          kind: "code",
          title: "A complete first test",
          language: "ts",
          code: `import { test, expect } from '../../../playwright/fixtures/test';

test('a winning Red bet pays even money and updates the balance', async ({ page, roulettePage }) => {
  await roulettePage.open();
  await expect(roulettePage.balance).toHaveText('1,000 credits');

  await roulettePage.placeBetOf('red', 100);
  await expect(roulettePage.balance).toHaveText('900 credits'); // stake deducted immediately

  await roulettePage.forceResult(1); // 1 is red
  await roulettePage.spin();

  await expect(roulettePage.winningNumber).toHaveText('1');
  await expect(roulettePage.winningColor).toHaveText(/red/i);
  await expect(roulettePage.gameResult).toContainText(/win/i);
  await expect(roulettePage.payout).toHaveText('200'); // stake (100) + profit (100)
  await expect(roulettePage.balance).toHaveText('1,100 credits'); // 1000 original + 100 profit
});`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Notice what this test never does",
          body: [
            "It never asserts 'the wheel spun.' It asserts specific numbers, derived from a specific forced result, checked against the accounting model from the next lesson. That's the whole difference between a demo and a test.",
          ],
        },
        {
          kind: "steps",
          title: "Try it yourself",
          steps: [
            {
              title: "Write a losing bet test",
              body: "Force a result that loses a Black bet. Assert the balance only reflects the deducted stake — nothing credited back.",
            },
            {
              title: "Write a Number bet win",
              body: "Force the exact number you bet on. Assert profit is 35× the stake and payout is 36× the stake.",
            },
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Forgetting `forceResult` must run before `spin`",
          body: "The forced value is consumed by the next spin call — force it, then spin. Calling them out of order just spins a real random result.",
        },
        {
          title: "Hardcoding a 'lucky' number and hoping it wins",
          body: "Without forcing the result, a Number bet wins about 1 time in 37. A test that passes 1 time in 37 isn't a passing test — it's a coin flip with extra steps.",
        },
      ],
      keyTakeaways: [
        "The page object provides interactions and locators; the test provides the assertions.",
        "`forceResult` must be called before the `spin` that should be affected by it.",
        "A good first test already checks number, color, result message, payout and balance — not just one of them.",
      ],
      quiz: [
        {
          id: "q1",
          type: "code-interpretation",
          prompt:
            "In the test above, why does `expect(roulettePage.balance).toHaveText('900 credits')` come before `forceResult`/`spin` at all?",
          options: [
            { id: "a", text: "It's testing that the stake is deducted at bet placement, independent of the spin outcome" },
            { id: "b", text: "It's a typo and should be removed" },
            { id: "c", text: "It's checking the starting balance" },
            { id: "d", text: "It's required by the page object" },
          ],
          correct: "a",
          explanation:
            "It isolates one accounting fact — stake deducted on bet placement — from the win/loss outcome that only the spin determines. If this assertion ever failed, you'd know exactly which half of the round broke.",
        },
      ],
      challenges: ["cr-ch-red-bet"],
    },

    {
      id: "cr-payouts",
      slug: "testing-bets-and-payouts",
      title: "Testing Bets and Payouts",
      moduleId: "casino-roulette-qa",
      summary:
        "The exact accounting model behind every bet, made explicit so you know precisely what to assert — this is the single most-referenced lesson in the module.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "State the accounting model from memory: what `stake`, `profit`, `payout` and `balance` each mean and when they change",
        "Compute the expected profit, payout and balance for any bet type, win or loss",
        "Explain why 'payout' and 'profit' are two different numbers, not the same one",
      ],
      sections: [
        {
          kind: "callout",
          tone: "danger",
          title: "The accounting model — memorize this",
          body: [
            "1. Placing a bet deducts the **stake** immediately: `balance -= stake`. This happens whether the spin later wins or loses.",
            "2. On a win: `profit = stake × multiplier` (35 for Number, 1 for the six even-money types) — this is the **net gain**. `payout = stake + profit` — this is the **total credited back** to the balance, i.e. your stake returned plus your profit. `balance += payout`.",
            "3. On a loss: `profit = 0` and `payout = 0`. The balance simply stays at its post-stake-deduction value — nothing further happens to it.",
            "Net effect of a full round: `balance_after_round = balance_before_bet + profit`. `profit` is always the number that answers 'how much better or worse off am I than before I bet' — `payout` is a settlement-mechanics number, useful for verifying the credit transaction itself, not for judging whether the round was good or bad for the player.",
          ],
        },
        {
          kind: "table",
          title: "Worked examples, starting from a 1,000-credit balance",
          headers: ["Bet", "Stake", "Outcome", "Profit", "Payout", "Balance after bet", "Balance after spin"],
          rows: [
            ["Red", "100", "Win", "100", "200", "900", "1,100"],
            ["Red", "100", "Loss", "0", "0", "900", "900"],
            ["Number 17", "100", "Win", "3,500", "3,600", "900", "4,500"],
            ["Number 17", "100", "Loss", "0", "0", "900", "900"],
            ["High", "250", "Win", "250", "500", "750", "1,250"],
          ],
        },
        {
          kind: "compare",
          title: "A payout assertion bug this exact confusion causes",
          badLabel: "Wrong — assumes payout equals profit",
          bad: `expect(spinResponse.payout).toBe(3500); // this is the PROFIT, not the payout`,
          goodLabel: "Correct — payout includes the returned stake",
          good: `expect(spinResponse.profit).toBe(3500);
expect(spinResponse.payout).toBe(3600); // 3500 profit + 100 stake returned`,
          note: "This single mix-up is common enough in real payout systems that it's worth its own assertion pair every time.",
        },
        {
          kind: "code",
          title: "Asserting the full accounting chain via the API",
          language: "ts",
          code: `test('a Number win pays exactly 35:1 profit on top of the returned stake', async ({ page, roulettePage }) => {
  await roulettePage.open();
  await roulettePage.placeBetOf('number', 100, 17);
  await roulettePage.forceResult(17);

  const response = await page.request.post('/api/casino/roulette/spin');
  const body = await response.json();

  expect(body.won).toBe(true);
  expect(body.profit).toBe(3500);
  expect(body.payout).toBe(3600);
  expect(body.balance).toBe(4500); // 1000 original + 3500 profit
});`,
        },
      ],
      commonMistakes: [
        {
          title: "Treating 'payout' and 'profit' as interchangeable",
          body: "They agree in value only by coincidence at a stake of zero. At any real stake they differ by exactly the stake amount.",
        },
        {
          title: "Computing expected balance from the pre-bet balance instead of the post-stake-deduction balance",
          body: "`balance_after_round = balance_before_bet + profit` is correct and simpler than re-deriving it from `(balance - stake) + payout` — but both must agree, and a test that only checks one hides a bug in the other.",
        },
      ],
      keyTakeaways: [
        "Stake is deducted at bet placement, not at spin.",
        "profit = net gain; payout = stake returned + profit; both are 0 on a loss.",
        "balance_after_round = balance_before_bet + profit — the one invariant every payout test should ultimately check.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "A test bets 200 on Even, forces a losing odd result, and asserts `expect(body.balance).toBe(1000)` starting from a 1000 balance. What's wrong?",
          options: [
            { id: "a", text: "Nothing — a loss doesn't change the balance" },
            { id: "b", text: "The balance should be 800 — the stake was already deducted and nothing is credited back on a loss" },
            { id: "c", text: "The balance should be 1200" },
            { id: "d", text: "Even bets can't lose" },
          ],
          correct: "b",
          explanation:
            "Placing the bet already took the 200-credit stake off the balance. A loss credits nothing back, so the balance stays at 800, not the original 1000.",
        },
        {
          id: "q2",
          type: "predict-result",
          prompt: "Stake 50 on Number 9, forced result 9. What are profit and payout?",
          options: [
            { id: "a", text: "profit 1750, payout 1800" },
            { id: "b", text: "profit 1800, payout 1800" },
            { id: "c", text: "profit 1750, payout 1750" },
            { id: "d", text: "profit 50, payout 1750" },
          ],
          correct: "a",
          explanation: "profit = 50 × 35 = 1750; payout = stake + profit = 50 + 1750 = 1800.",
        },
      ],
      sqlExercises: ["casino-sql-payout-mismatch"],
    },

    {
      id: "cr-deterministic",
      slug: "testing-randomness-deterministically",
      title: "Testing Randomness Deterministically",
      moduleId: "casino-roulette-qa",
      summary:
        "Why you should never write a test that merely hopes the wheel cooperates — and the test-only mechanism built specifically so you never have to.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Explain why asserting directly on a random outcome produces a flaky, low-value test",
        "Use POST /api/casino/roulette/test-result correctly, including its safeguard",
        "Design a test around a forced result that actually exercises every code path a win/loss touches",
      ],
      sections: [
        {
          kind: "compare",
          title: "The core lesson of this module",
          badLabel: "BAD — hoping",
          bad: `await page.getByRole('button', { name: 'Spin' }).click();
await expect(page.getByText('WIN')).toBeVisible(); // fails ~36 spins out of 37`,
          goodLabel: "GOOD — forcing, then verifying everything the win touches",
          good: `await roulettePage.forceResult(17);
await page.getByRole('button', { name: 'Spin' }).click();

await expect(roulettePage.winningNumber).toHaveText('17');
await expect(roulettePage.winningColor).toHaveText(/black/i); // 17 is black
await expect(roulettePage.gameResult).toContainText(/win/i);
await expect(roulettePage.payout).toHaveText(/./); // and the exact expected value
await expect(roulettePage.balance).toHaveText(/./); // and the exact expected value`,
          note: "The BAD version isn't just flaky — even when it happens to pass, it hasn't verified the color, the payout, or the balance at all.",
        },
        {
          kind: "text",
          title: "The mechanism",
          body: [
            "`POST /api/casino/roulette/test-result` with body `{ \"result\": 17 }` forces the outcome of the next spin — and only the next one; it's consumed and cleared the instant that spin runs, so it can never silently affect a later round you forgot about.",
            "It requires the header `X-Test-Mode: enable`. Without it, the endpoint returns 403. Nothing in the shipped UI ever sends that header, so a real player clicking through the app can never reach this route — it exists purely for Playwright's `page.request` API, exactly as `RoulettePage.forceResult()` uses it.",
          ],
        },
        {
          kind: "code",
          title: "What forceResult actually does",
          language: "ts",
          code: `async forceResult(n: number) {
  await this.page.request.post('/api/casino/roulette/test-result', {
    headers: { 'X-Test-Mode': 'enable' },
    data: { result: n },
  });
}`,
        },
        {
          kind: "list",
          title: "Scenarios this unlocks — force any of these directly",
          items: [
            "A specific winning number (e.g. 17, to test a Number bet win)",
            "A specific losing number for the current bet (any number outside your selection/color/range)",
            "0 — to test the green/neither-color/neither-range edge case explicitly, every time",
            "A red result while betting Black (guaranteed loss) and vice versa",
            "The same number twice in a row, across two separate rounds, to test that history renders two distinct rows and not a merged one",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "This is not a player-facing feature",
          body: [
            "If you're ever reviewing a real casino platform's codebase and find an equivalent mechanism without an equivalent safeguard, that's a serious finding — not a convenience.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Running a suite that occasionally fails and calling it 'a bit flaky'",
          body: "A test that asserts on real randomness isn't flaky by accident — it's flaky by design. The fix is `forceResult`, not a retry.",
        },
        {
          title: "Forcing a result but not actually checking it took effect",
          body: "`test-result` returns `{ ok: true, forcedResult: n }` — nothing stops you from also asserting the response, though the spin's own result field is the stronger check.",
        },
      ],
      keyTakeaways: [
        "Never assert directly on an un-forced spin outcome — force it, then assert everything the forced value should affect.",
        "The forced result is single-use and header-gated, by design.",
        "A test-only control endpoint should be safe to leave in shipped code specifically because it can't be reached by a normal user path.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why is `POST /api/casino/roulette/test-result` gated on a header instead of `NODE_ENV`?",
          options: [
            { id: "a", text: "Headers are faster to check than environment variables" },
            { id: "b", text: "A NODE_ENV gate could silently disable the mechanism under a production build, breaking CI runs that test the built app" },
            { id: "c", text: "Headers are more secure than any other gating mechanism" },
            { id: "d", text: "There is no real reason, it's arbitrary" },
          ],
          correct: "b",
          explanation:
            "If a CI pipeline runs `next build && next start` (production mode) before testing, an env-based gate would quietly break every test that relies on it. A header only Playwright ever sends doesn't have that failure mode.",
        },
      ],
      challenges: ["cr-ch-force-red-win"],
    },

    {
      id: "cr-api",
      slug: "api-testing-roulette",
      title: "API Testing Roulette",
      moduleId: "casino-roulette-qa",
      summary:
        "The full endpoint reference, and why a real API test suite checks status codes, schemas and error paths — not only 200 OK.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Know every roulette endpoint, its method, and its response shape",
        "Write API tests that assert status codes and error bodies, not just success",
        "Explain what an API test proves that a UI test doesn't, for this app specifically",
      ],
      sections: [
        {
          kind: "table",
          title: "Endpoint reference",
          headers: ["Method & path", "Purpose", "Success"],
          rows: [
            ["GET /api/casino/roulette/state", "Current balance, staged bet, last result, round status", "200"],
            ["POST /api/casino/roulette/bet", "Stage a bet for the current round", "201"],
            ["POST /api/casino/roulette/spin", "Resolve the staged bet", "200"],
            ["GET /api/casino/roulette/history", "Every completed/failed round for this session", "200"],
            ["POST /api/casino/roulette/reset", "Reset balance to 1,000 and clear history", "200"],
            ["POST /api/casino/roulette/test-result", "TEST-ONLY — force the next spin's result", "200 (403 without the test header)"],
          ],
        },
        {
          kind: "code",
          title: "Spin response shape",
          language: "json",
          code: `{
  "roundId": "R001",
  "result": 17,
  "color": "black",
  "bet": { "type": "number", "selection": 17, "stake": 100 },
  "won": true,
  "payout": 3600,
  "profit": 3500,
  "balance": 4500
}`,
        },
        {
          kind: "code",
          title: "Testing more than 200 OK",
          language: "ts",
          code: `test('betting more than the balance is rejected with a clear error', async ({ page }) => {
  const response = await page.request.post('/api/casino/roulette/bet', {
    data: { type: 'red', stake: 999999 },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toMatch(/exceeds your current balance/i);
});

test('the test-result endpoint refuses a request without the test header', async ({ page }) => {
  const response = await page.request.post('/api/casino/roulette/test-result', {
    data: { result: 17 },
  });
  expect(response.status()).toBe(403);
});`,
        },
        {
          kind: "list",
          title: "What an API test proves here that a UI test alone doesn't",
          items: [
            "The exact numeric fields (`profit`, `payout`, `balance`) without depending on how the UI chooses to format or round them for display",
            "Every validation error message and status code, including ones the UI might not have a distinct visual state for yet",
            "That the test-only endpoint's safeguard actually works, which has no UI at all to check",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "An API suite that never tests a 4xx response",
          body: "If every test in a suite expects 200/201, the suite has never verified a single validation rule actually works.",
        },
        {
          title: "Checking `response.ok()` instead of the exact status code",
          body: "`response.ok()` is true for any 2xx. A route returning 200 when the spec says 201 (or vice versa) will pass a sloppy check and fail a precise one — and precise is what a real API contract needs.",
        },
      ],
      keyTakeaways: [
        "Every roulette endpoint has a documented, testable success shape and failure shape.",
        "A real API suite spends at least as much attention on 4xx paths as on 2xx ones.",
        "The test-result endpoint's 403-without-header behavior is itself a test case, not just an implementation detail.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What status code does a successful POST /api/casino/roulette/bet return?",
          options: [
            { id: "a", text: "200" },
            { id: "b", text: "201 — a new round/bet resource was created" },
            { id: "c", text: "204" },
            { id: "d", text: "202" },
          ],
          correct: "b",
          explanation: "Staging a bet creates a resource (the round's bet), which is exactly what 201 signals — the same convention `POST /api/igaming/bets` uses.",
        },
      ],
      challenges: ["cr-ch-full-lifecycle"],
    },

    {
      id: "cr-network",
      slug: "network-interception",
      title: "Network Interception",
      moduleId: "casino-roulette-qa",
      summary:
        "Using page.route to test how the UI behaves when the backend doesn't — server errors, malformed responses, timeouts and duplicate requests.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Mock a roulette API response with page.route",
        "Test UI resilience to failure modes that are hard to trigger against the real backend",
        "Verify a failed spin request never leaves the balance double-deducted",
      ],
      sections: [
        {
          kind: "text",
          title: "Why mock at all, when the real backend works?",
          body: [
            "The real /api/casino/roulette/spin route is correct and well-behaved. That's exactly why you can't use it to test what the UI does when the backend ISN'T well-behaved — a 500, a truncated response, a request that never resolves. `page.route` lets you manufacture those conditions on demand.",
          ],
        },
        {
          kind: "code",
          title: "Mocking a server error",
          language: "ts",
          code: `test('a 500 from spin surfaces an error, not a false win', async ({ page, roulettePage }) => {
  await roulettePage.open();
  await roulettePage.placeBetOf('red', 100);

  await page.route('**/api/casino/roulette/spin', (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal error' }) }),
  );

  await roulettePage.spin();
  await expect(roulettePage.validationMessage).toBeVisible();
  await expect(roulettePage.gameResult).not.toContainText(/win/i);
});`,
        },
        {
          kind: "code",
          title: "Mocking a malformed response",
          language: "ts",
          code: `await page.route('**/api/casino/roulette/spin', (route) =>
  route.fulfill({ status: 200, body: '{ this is not valid json' }),
);
// The UI should show an error state, not throw an unhandled exception or render "undefined".`,
        },
        {
          kind: "code",
          title: "Simulating a timeout",
          language: "ts",
          code: `await page.route('**/api/casino/roulette/spin', () => new Promise(() => {})); // never resolves
await roulettePage.spin();
// Assert the UI shows a pending/loading state rather than hanging silently or double-submitting.`,
        },
        {
          kind: "text",
          title: "The one that matters most: no double deduction on a failed request",
          body: [
            "A network failure mid-spin is exactly the scenario that produces the 'network failure incorrectly deducts balance' class of bug. Since the real balance deduction happens server-side at bet placement (not client-side on spin), a mocked spin failure — server or network — cannot itself cause a double deduction here. That's the property to test: force a spin failure via `page.route`, then hit the real, unmocked `/api/casino/roulette/state` and confirm the balance reflects exactly one stake deduction, no more.",
          ],
        },
        {
          kind: "code",
          title: "Proving no double deduction after a failed spin",
          language: "ts",
          code: `test('a failed spin request does not deduct the stake twice', async ({ page, roulettePage }) => {
  await roulettePage.open();
  const before = await page.request.get('/api/casino/roulette/state').then((r) => r.json());

  await roulettePage.placeBetOf('black', 100);
  await page.route('**/api/casino/roulette/spin', (route) => route.abort('failed'));
  await roulettePage.spin(); // fails client-side; server never processes a spin at all

  const after = await page.unroute('**/api/casino/roulette/spin')
    .then(() => page.request.get('/api/casino/roulette/state'))
    .then((r) => r.json());

  expect(after.balance).toBe(before.balance - 100); // exactly one stake deduction, from the bet — not two
});`,
        },
      ],
      commonMistakes: [
        {
          title: "Mocking so much of the flow that the test no longer exercises the real app",
          body: "Mock the one call you're testing resilience against. Let everything else — bet placement, the balance read used for the assertion — hit the real backend.",
        },
        {
          title: "Forgetting to unroute before reading real state afterward",
          body: "A route handler you registered stays active for the rest of the test unless you `page.unroute()` it or the test ends — a stale mock can quietly make a later assertion meaningless.",
        },
      ],
      keyTakeaways: [
        "page.route lets you test failure modes the real backend won't reliably produce on demand.",
        "The strongest network-resilience test checks real, unmocked state afterward, not just the mocked response's immediate effect.",
        "Because the stake is deducted server-side at bet placement, a mocked spin-network-failure specifically tests that spin failing doesn't ALSO touch the balance.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why does the 'no double deduction' test check /api/casino/roulette/state instead of trusting the mocked spin response?",
          options: [
            { id: "a", text: "Because the mocked response is fake — it proves nothing about what the real server actually did" },
            { id: "b", text: "Because /state is faster to call" },
            { id: "c", text: "Because spin doesn't return a balance field" },
            { id: "d", text: "There's no real difference" },
          ],
          correct: "a",
          explanation:
            "The whole point of the mock is that the client never got a real answer from the server. Only an unmocked call to a real endpoint can prove what the server's state actually is.",
        },
      ],
      challenges: ["cr-ch-network-no-double-deduction"],
    },

    {
      id: "cr-boundary",
      slug: "negative-and-boundary-testing",
      title: "Negative and Boundary Testing",
      moduleId: "casino-roulette-qa",
      summary:
        "Walking the full bet-validation checklist — every case a real casino platform's QA team would be expected to cover before release.",
      difficulty: "advanced",
      estimatedTime: 18,
      objectives: [
        "Enumerate every validation rule POST /api/casino/roulette/bet enforces",
        "Write boundary tests at the exact edge of a rule, not comfortably inside or outside it",
        "Distinguish a validation error (400, handled) from a crash (unhandled, a real bug)",
      ],
      sections: [
        {
          kind: "table",
          title: "The full validation checklist",
          headers: ["Case", "Example", "Expected"],
          rows: [
            ["Missing bet type", "`{ stake: 100 }`", "400 — 'A bet type is required'"],
            ["Unknown bet type", "`{ type: 'purple', stake: 100 }`", "400 — 'Unknown bet type'"],
            ["Missing stake", "`{ type: 'red' }`", "400 — 'A bet amount is required'"],
            ["Non-numeric stake", "`{ type: 'red', stake: 'lots' }`", "400 — 'Bet amount must be a number'"],
            ["Fractional stake", "`{ type: 'red', stake: 10.5 }`", "400 — fractional credits are not supported"],
            ["Zero stake", "`{ type: 'red', stake: 0 }`", "400 — 'must be greater than zero'"],
            ["Negative stake", "`{ type: 'red', stake: -50 }`", "400 — 'must be greater than zero'"],
            ["Stake over the max bet", "`{ type: 'red', stake: 10001 }`", "400 — max bet is 10,000"],
            ["Stake over the balance", "`{ type: 'red', stake: 1500 }` at balance 1000", "400 — 'exceeds your current balance'"],
            ["Number bet, missing selection", "`{ type: 'number', stake: 100 }`", "400 — selection required"],
            ["Number bet, out-of-range selection", "`{ type: 'number', selection: 37, stake: 100 }`", "400 — 0-36 only"],
            ["Even-money bet with a selection present", "`{ type: 'red', selection: 5, stake: 100 }`", "400 — that type takes no selection"],
            ["Spin with no bet placed", "`POST /spin` at status READY", "400 — 'place a bet before spinning'"],
            ["Second bet while one is already staged", "`POST /bet` at status BET_PLACED", "400 — 'already placed'"],
          ],
        },
        {
          kind: "code",
          title: "A boundary test at the exact edge",
          language: "ts",
          code: `test('the maximum bet is accepted; one credit over is rejected', async ({ page }) => {
  const atLimit = await page.request.post('/api/casino/roulette/bet', {
    data: { type: 'red', stake: 10000 },
  });
  expect(atLimit.status()).toBe(201);

  await page.request.post('/api/casino/roulette/reset'); // clean slate for the next check
  const overLimit = await page.request.post('/api/casino/roulette/bet', {
    data: { type: 'red', stake: 10001 },
  });
  expect(overLimit.status()).toBe(400);
});`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why fractional stakes are rejected here",
          body: [
            "This app's credits are whole numbers by design — it keeps every payout calculation exact (no floating-point rounding surprises in a financial-style flow) and it's a deliberate, testable rule rather than an accident. A `stake: 10.5` request must fail the same predictable way every time.",
          ],
        },
        {
          kind: "compare",
          title: "A validation error is not a crash — verify the difference",
          badLabel: "Only checking the app doesn't crash",
          bad: `await page.request.post('/api/casino/roulette/bet', { data: { type: 'red', stake: -50 } });
// test ends here — "it didn't throw" is not the same as "it validated correctly"`,
          goodLabel: "Checking the specific, correct rejection",
          good: `const response = await page.request.post('/api/casino/roulette/bet', { data: { type: 'red', stake: -50 } });
expect(response.status()).toBe(400);
expect((await response.json()).error).toMatch(/greater than zero/i);`,
        },
      ],
      commonMistakes: [
        {
          title: "Testing 'stake too high' but never 'stake too high AND over the max bet' as two separate rules",
          body: "A stake that exceeds both the balance and the max bet should still return one clear error — but your tests should cover each limit independently, at values that only cross one boundary at a time, so you know which rule actually fired.",
        },
        {
          title: "Skipping the fractional-stake case because 'nobody would type that'",
          body: "Client-side number inputs, copy-pasted values and other clients hitting the API directly all produce exactly this input. If the rule exists, it needs a test.",
        },
      ],
      keyTakeaways: [
        "Every rule in the validation checklist deserves its own test, at the exact boundary where it applies.",
        "A 400 with a clear error is success for a negative test; an unhandled 500 for bad input is a bug.",
        "Rules that look arbitrary (whole-number stakes) are usually deliberate — verify the behavior, don't assume it's a bug.",
      ],
      quiz: [
        {
          id: "q1",
          type: "best-locator",
          prompt:
            "You need to assert the exact validation message shown in the UI after an invalid bet. Which locator is most robust?",
          options: [
            { id: "a", text: "page.locator('.error-text')" },
            { id: "b", text: "page.getByTestId('validation-message')" },
            { id: "c", text: "page.locator('div:nth-child(4)')" },
            { id: "d", text: "page.getByText('Bet amount')" },
          ],
          correct: "b",
          explanation:
            "The dedicated testid is stable across styling changes and doesn't depend on the exact wording — pair it with a regex match on the text for the message content itself.",
        },
      ],
    },

    {
      id: "cr-concurrency",
      slug: "testing-race-conditions",
      title: "Testing Race Conditions",
      moduleId: "casino-roulette-qa",
      summary:
        "Firing two requests at once on purpose, and proving the app's synchronous check-and-transition actually prevents a double-processed round.",
      difficulty: "expert",
      estimatedTime: 18,
      objectives: [
        "Explain why a double-clicked button is really a concurrency test in disguise",
        "Write a test that fires two requests concurrently and asserts only one takes effect",
        "Describe the specific implementation pattern (synchronous check-and-transition) that makes this app's spin endpoint race-safe",
      ],
      sections: [
        {
          kind: "text",
          title: "Where the race actually lives",
          body: [
            "`POST /api/casino/roulette/spin`'s handler reads the session, checks `status === 'BET_PLACED'`, and flips it to `COMPLETED` — all before it does anything else, with no `await` in between the check and the write. That's what makes it safe: whichever of two near-simultaneous requests runs that synchronous section first wins; the other one's check runs against a status that has already moved on, and it's rejected cleanly.",
            "This matters because a naive implementation — check the status, then `await` a database write, then update the status — leaves a window open. Two requests can both pass the check before either has written anything, and both proceed to spin the same round. That's a real, common class of bug in systems that move money.",
          ],
        },
        {
          kind: "code",
          title: "Proving it: two concurrent spins against one bet",
          language: "ts",
          code: `test('two concurrent spin requests never both process the same round', async ({ page, roulettePage }) => {
  await roulettePage.open();
  await roulettePage.placeBetOf('red', 100);

  const [first, second] = await Promise.all([
    page.request.post('/api/casino/roulette/spin'),
    page.request.post('/api/casino/roulette/spin'),
  ]);

  const statuses = [first.status(), second.status()].sort();
  expect(statuses).toEqual([200, 400]); // exactly one succeeds

  const history = await page.request.get('/api/casino/roulette/history').then((r) => r.json());
  expect(history.history).toHaveLength(1); // exactly one round was recorded, not two
});`,
        },
        {
          kind: "code",
          title: "The same idea for a double-clicked Place Bet",
          language: "ts",
          code: `test('two concurrent bet requests cannot both spend the same balance', async ({ page }) => {
  await page.request.post('/api/casino/roulette/reset');

  const [first, second] = await Promise.all([
    page.request.post('/api/casino/roulette/bet', { data: { type: 'red', stake: 800 } }),
    page.request.post('/api/casino/roulette/bet', { data: { type: 'black', stake: 800 } }),
  ]);

  const outcomes = [first.status(), second.status()];
  expect(outcomes).toContain(400); // at least one must be rejected — 1000 balance can't cover both 800 stakes
  const state = await page.request.get('/api/casino/roulette/state').then((r) => r.json());
  expect(state.balance).toBeGreaterThanOrEqual(0); // never negative, whichever one won
});`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Run it more than once",
          body: [
            "A race-condition test that passes once tells you less than one that passes repeatedly — timing-dependent bugs don't always manifest on the first try. Playwright's `--repeat-each` flag is useful here in local investigation, even though a fixed synchronous guard (as this app uses) should pass every time by construction, not by luck.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Simulating a race with two sequential (awaited) calls",
          body: "`await A(); await B();` never actually races anything — B only starts after A has fully finished. Use `Promise.all` (or fire both without awaiting the first) to create genuine concurrency.",
        },
        {
          title: "Asserting 'nothing crashed' instead of asserting the actual invariant",
          body: "The real claim to test is 'exactly one round was recorded' or 'the balance is never negative' — not merely that both requests returned some response.",
        },
      ],
      keyTakeaways: [
        "A synchronous check-and-transition, with no await between them, is what prevents a double-processed round here.",
        "Promise.all is how you create a genuine race in a test — sequential awaits don't.",
        "The invariant to assert is usually 'exactly one of these succeeded' or 'the balance never went negative,' not the individual response codes alone.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "A 'concurrency test' does `await page.request.post(spin); await page.request.post(spin);` and asserts the second one fails. Is this a valid race-condition test?",
          options: [
            { id: "a", text: "Yes, it proves the same thing as Promise.all" },
            { id: "b", text: "No — the two requests never actually overlap, so this only tests the normal single-spin-then-blocked-second-spin behavior, not a race" },
            { id: "c", text: "Yes, because both requests still hit the network" },
            { id: "d", text: "No test involving fetch can ever be sequential" },
          ],
          correct: "b",
          explanation:
            "Awaiting the first call before starting the second guarantees they don't overlap. It's a perfectly good state-machine test (see 'Understanding Roulette State'), just not a concurrency test — those require genuinely simultaneous requests.",
        },
      ],
    },

    {
      id: "cr-ui-api",
      slug: "ui-and-api-validation",
      title: "UI + API Validation",
      moduleId: "casino-roulette-qa",
      summary:
        "Acting through the UI, then verifying the result through the API — the pattern that catches the bugs a UI-only or API-only test each miss on their own.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Perform an action via the UI and independently confirm it via the API in the same test",
        "Explain what this pattern catches that either layer alone would miss",
        "Apply it to the roulette balance specifically",
      ],
      sections: [
        {
          kind: "text",
          title: "The pattern",
          body: [
            "1. Act through the UI — place a bet, force a result, spin.",
            "2. Read the resulting state independently through the API.",
            "3. Assert the two agree.",
            "A UI-only test can pass while the server-side number is wrong, if the UI happens to compute or cache its own display value instead of trusting the server's response. An API-only test can pass while the UI renders something completely different from what the API says. Only checking both, independently, catches either failure.",
          ],
        },
        {
          kind: "code",
          title: "UI action, API verification",
          language: "ts",
          code: `test('the balance shown in the UI always matches the server\\'s own figure', async ({ page, roulettePage }) => {
  await roulettePage.open();
  await roulettePage.placeBetOf('number', 100, 17);
  await roulettePage.forceResult(17);
  await roulettePage.spin();

  const uiBalanceText = await roulettePage.getBalance(); // e.g. "4,500 credits"
  const uiBalance = Number(uiBalanceText.replace(/[^0-9.-]/g, '')); // strip the comma and " credits" suffix

  const apiState = await page.request.get('/api/casino/roulette/state').then((r) => r.json());

  expect(uiBalance).toBe(apiState.balance);
});`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "This is the same idea as module 17's hybrid challenge",
          body: [
            "If you did the 'design a hybrid test for placing a bet' challenge in module 17, you've already applied this pattern once. Here it's specialized to one specific, very checkable number: the balance.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Trusting the UI's own arithmetic instead of the server's response",
          body: "If a test computes 'expected balance' itself and only compares the UI against that computed value, a bug shared by the test's math and the UI's math (e.g. both using `profit` where they meant `payout`) would never be caught. Comparing UI against the independent API response has no such blind spot.",
        },
        {
          title: "Only doing this once, for one bet type",
          body: "The UI/API agreement check is cheap to add to any existing test — treat it as a final assertion you tack onto other tests, not a whole separate suite.",
        },
      ],
      keyTakeaways: [
        "UI-only and API-only tests each have a blind spot the other doesn't share.",
        "The fix is simple: act in the UI, read via the API, assert they agree — not 'assert the UI shows some plausible-looking number.'",
        "This pattern is cheap enough to bolt onto almost any other test in this module.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A UI test asserts the balance display shows '4,500 credits'. What has it NOT proven?",
          options: [
            { id: "a", text: "That the server's actual balance is 4500" },
            { id: "b", text: "That the page rendered" },
            { id: "c", text: "That JavaScript ran" },
            { id: "d", text: "Nothing — it proves everything" },
          ],
          correct: "a",
          explanation:
            "The UI could compute or cache that number independently of the server. Only an independent API read proves the server's own figure actually agrees.",
        },
      ],
      challenges: ["cr-ch-full-lifecycle"],
    },

    {
      id: "cr-sql",
      slug: "sql-validation-for-casino-transactions",
      title: "SQL Validation for Casino Transactions",
      moduleId: "casino-roulette-qa",
      summary:
        "The Casino SQL Lab: a 4-table synthetic ledger with seven seeded reconciliation bugs, queryable with the same SQL engine as every other lab in this academy.",
      difficulty: "advanced",
      estimatedTime: 18,
      objectives: [
        "Read the players/rounds/bets/transactions schema",
        "Write queries that find payout mismatches, duplicate transactions and unreconciled balances",
        "Explain why some casino bugs are only visible in the ledger, never in the UI at all",
      ],
      sections: [
        {
          kind: "diagram",
          title: "The Casino schema",
          ascii: `players ──┬──< rounds ──< bets
          │          │
          │          └──< (transactions reference round_id)
          └──< transactions`,
          caption: "Four tables: players, rounds, bets, transactions — a separate dataset from both the ShopEasy and iGaming SQL Labs.",
        },
        {
          kind: "table",
          title: "Schema",
          headers: ["Table", "Key columns"],
          rows: [
            ["players", "id, username, balance"],
            ["rounds", "id, player_id, game, result, status, created_at"],
            ["bets", "id, round_id, bet_type, selection, stake, payout, status"],
            ["transactions", "id, player_id, round_id, type, amount, balance_after, created_at"],
          ],
        },
        {
          kind: "text",
          title: "Seven bugs that live only in the data",
          body: [
            "This dataset is seeded with the same discipline as the iGaming SQL Lab: specific, deliberate, findable inconsistencies rather than random noise — a payout that doesn't match its bet type's formula, a player whose stored balance disagrees with their own transaction history, a duplicated transaction row, a duplicated round, a bet incorrectly marked won on a result of 0, a bet accepted past what the player's balance could support, and a FAILED round that nonetheless has a stake transaction against it.",
            "None of these are visible from the roulette UI — they live entirely in stored, historical data. That's the point: some defect classes are only ever caught by querying the ledger directly.",
          ],
        },
        {
          kind: "code",
          title: "Finding a payout mismatch",
          language: "sql",
          code: `-- A won Number bet's stored payout should be stake + (stake * 35).
-- A won even-money bet's stored payout should be stake * 2.
SELECT id, bet_type, selection, stake, payout
FROM bets
WHERE status = 'won'
  AND (
    (bet_type = 'number' AND payout <> stake + stake * 35)
    OR (bet_type <> 'number' AND payout <> stake * 2)
  );`,
        },
        {
          kind: "code",
          title: "Finding a round whose transactions don't sum to the player's balance",
          language: "sql",
          code: `SELECT p.id, p.username, p.balance,
       SUM(t.amount) AS transaction_total
FROM players p
JOIN transactions t ON t.player_id = p.id
GROUP BY p.id, p.username, p.balance
HAVING p.balance <> SUM(t.amount);`,
        },
        {
          kind: "practice",
          href: "/practice/casino-roulette-sql",
          title: "Open the Casino SQL Lab",
          body: "All ten exercises are QA-validation style — find the bug, don't just practice syntax.",
        },
      ],
      commonMistakes: [
        {
          title: "Assuming a clean UI means a clean ledger",
          body: "A player's session can look perfectly normal in the app while their historical data — from a since-fixed bug, a past incident, or a bad migration — still contains inconsistencies. Only querying the data finds those.",
        },
        {
          title: "Checking `payout` against `profit` instead of the bet-type-specific formula",
          body: "The payout-mismatch query above branches on `bet_type` specifically because Number and even-money bets have different multipliers — a query that doesn't branch will flag every correct Number-bet payout as 'wrong.'",
        },
      ],
      keyTakeaways: [
        "The Casino SQL Lab is a separate dataset from ShopEasy's and the iGaming Lab's, sharing only the same underlying SQL engine.",
        "Some bug classes (historical inconsistencies, duplicated records) are invisible from the live UI and only findable by querying stored data directly.",
        "A payout-mismatch query must account for each bet type's own multiplier, not assume one formula fits all.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why would a duplicate transaction be invisible to someone only testing through the roulette UI?",
          options: [
            { id: "a", text: "The UI always deduplicates before rendering" },
            { id: "b", text: "The duplicate exists in stored history, not in anything the live session's UI currently displays or was ever shown for" },
            { id: "c", text: "Duplicates can't happen in this app" },
            { id: "d", text: "The UI shows every transaction twice on purpose" },
          ],
          correct: "b",
          explanation:
            "This SQL dataset represents historical data separate from the live in-memory game session — exactly the situation where only a direct data query reveals the problem.",
        },
      ],
      sqlExercises: [
        "casino-sql-all-rounds",
        "casino-sql-winning-bets",
        "casino-sql-losing-bets",
        "casino-sql-payout-mismatch",
        "casino-sql-round-transactions",
        "casino-sql-duplicate-transactions",
        "casino-sql-balance-mismatch",
        "casino-sql-rounds-missing-transactions",
        "casino-sql-impossible-payouts",
        "casino-sql-failed-rounds-balance-change",
      ],
    },

    {
      id: "cr-regression",
      slug: "casino-regression-strategy",
      title: "Casino Regression Strategy",
      moduleId: "casino-roulette-qa",
      summary:
        "A QA-lead-level close: what to automate for a game like this, what to leave manual, and how to design a regression suite that would actually catch the bugs that matter.",
      difficulty: "expert",
      estimatedTime: 20,
      objectives: [
        "Prioritize what to automate for a betting game using risk, not coverage percentage, as the driver",
        "Design a regression suite outline covering functional, negative, boundary, state, API, database, concurrency, network and accessibility concerns",
        "Know where to find this module's three documented live-behavior bug scenarios and what they teach about test design",
      ],
      sections: [
        {
          kind: "text",
          title: "What should you test?",
          body: [
            "Before reading further, actually answer this for yourself: for a game like Roulette — a random outcome, immediate money movement, a public regression risk if it's ever wrong — what categories of testing matter, and roughly how would you prioritize them? Write it down. The quiz below covers the same ground, with the reasoning revealed only after you answer.",
          ],
        },
        {
          kind: "list",
          title: "The categories this module actually covered",
          items: [
            "Functional — does each of the 7 bet types resolve correctly, win and lose?",
            "Negative — is every invalid input rejected with the right error?",
            "Boundary — do the exact edges (max bet, 0-36 range, whole-number stakes) behave correctly?",
            "State transition — are illegal transitions (spin with no bet, second bet while staged) actually blocked?",
            "API — do status codes and response schemas match the contract, for both success and failure?",
            "Database/ledger — does stored, historical data reconcile (no orphaned transactions, no mismatched payouts)?",
            "Concurrency — can two simultaneous requests double-spend a balance or double-process a round?",
            "Network resilience — does a failed or malformed request leave the app in a consistent, non-double-deducted state?",
            "Regression — once each of the above is proven once, is it re-checked automatically on every change?",
            "Accessibility — are all controls reachable by role/label, is the result region announced via aria-live, is focus visible?",
          ],
        },
        {
          kind: "text",
          title: "Risk-based prioritization for a betting game specifically",
          body: [
            "Everything touching money — bet placement, payout calculation, balance updates, duplicate-request safety — sits at the top: it's both high-probability-of-being-tested-in-production (players do this constantly) and high-impact-if-wrong (a wrong balance is a financial and regulatory incident, not a cosmetic bug). State-machine and concurrency tests come next, because they guard the same money-moving paths against the failure modes that only show up under real, uncoordinated usage. UI polish, animation timing and copy are the lowest priority for automation — worth a human glance, not a brittle assertion.",
          ],
        },
        {
          kind: "practice",
          href: "docs/casino-bug-hunt.md",
          title: "The three live-behavior bugs this module documents (not seeded into the running app)",
          body: "UI balance vs. API balance drifting apart, a bet-history row showing a stale status, and a double-clicked Spin button creating two rounds — each with a realistic before/after code snippet and a 'write the test that would have caught this' exercise.",
        },
        {
          kind: "steps",
          title: "Design a regression suite",
          steps: [
            {
              title: "List the money paths first",
              body: "Bet placement (all 7 types), spin/settlement (win and loss, every type), reset. These get the most thorough, most-often-run coverage.",
            },
            {
              title: "Add the guard-rail tests",
              body: "Every validation rule, every illegal state transition, the concurrency tests — these prove the guard rails stay in place as the code changes.",
            },
            {
              title: "Add the ledger checks",
              body: "The Casino SQL Lab's exercises, or an equivalent scheduled query, as a periodic reconciliation check rather than a per-commit one.",
            },
            {
              title: "Decide what stays manual",
              body: "Visual/animation review, exploratory bug-hunting sessions, and anything that changes too often to be worth a brittle automated assertion.",
            },
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Automating by coverage percentage instead of by risk",
          body: "A suite that's 90% UI-click coverage and 0% concurrency/ledger coverage looks thorough and isn't, for a game like this.",
        },
        {
          title: "Treating this module's test suite as 'done' rather than as a living regression suite",
          body: "The actual deliverable of a lesson like this isn't the tests that already exist — it's the judgment to add the right test the next time the game's logic changes.",
        },
      ],
      keyTakeaways: [
        "For a betting game, prioritize by financial/regulatory risk, not by ease of writing the test.",
        "A regression suite for this module spans functional, negative, boundary, state, API, database, concurrency, network and accessibility concerns — not just 'does the button work.'",
        "Some real-world bug classes are best taught as a documented scenario with a 'write the test' exercise, not wired into a live 'break mode' in the shipped app.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "For a betting game like this, which pair of concerns should get the most automated-test investment?",
          options: [
            { id: "a", text: "Animation smoothness and color scheme" },
            { id: "b", text: "Payout/balance correctness and concurrency safety" },
            { id: "c", text: "Page load time and font rendering" },
            { id: "d", text: "The exact wording of the win message" },
          ],
          correct: "b",
          explanation:
            "These are the highest-impact, highest-likelihood-of-recurring-if-broken concerns for a system that moves money on every interaction.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "How would you design a QA strategy for an online gambling platform? (Model answer revealed in the explanation.)",
          options: [
            { id: "a", text: "Automate the UI happy path for every screen, then call it done" },
            { id: "b", text: "Layer risk-based coverage: money-moving flows tested at UI, API and database layers; state machines and concurrency proven directly; a periodic ledger-reconciliation check; a thin, fast smoke suite gating every release; everything else covered proportionally to its actual risk" },
            { id: "c", text: "Rely entirely on manual QA before each release" },
            { id: "d", text: "Test only what QA engineering leadership explicitly asks for" },
          ],
          correct: "b",
          explanation:
            "A senior answer names the layers (UI/API/DB/events), explains why money-moving and state-machine paths get the deepest coverage, and treats the regression suite as a standing asset — not a one-time checklist.",
        },
      ],
      challenges: ["cr-ch-regression-design"],
    },
  ],
};

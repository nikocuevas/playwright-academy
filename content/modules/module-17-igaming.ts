import type { Module } from "../types";

export const igamingModule: Module = {
  id: "igaming-qa",
  order: 17,
  title: "iGaming QA & Online Gambling Testing",
  tagline: "Test the platform where every UI success has a financial claim behind it",
  summary:
    "A specialization for QA engineers moving into online gambling: registration, KYC, geolocation, wallets, betting, casino, settlement, bonuses, responsible gambling, risk, and the API/database/event/concurrency validation that proves a 'Bet placed' screen is actually true. Written for engineers progressing toward QA Engineering Lead. Synthetic players, fake currency, simulated gambling throughout — no real operators, payment providers, or real-money systems are involved.",
  difficulty: "advanced",
  icon: "Dices",
  track: "igaming",
  lessons: [
    {
      id: "ig-intro",
      slug: "introduction-to-igaming-qa",
      title: "Introduction to iGaming QA",
      moduleId: "igaming-qa",
      summary:
        "Why gambling platforms are one of the highest-stakes domains in QA, and what makes them different from testing e-commerce.",
      difficulty: "advanced",
      estimatedTime: 12,
      objectives: [
        "Explain why iGaming QA is a financial-integrity discipline, not just UI testing",
        "Name the regulatory and business pressures that shape test strategy in this domain",
        "Distinguish 'the screen looks right' from 'the platform is correct'",
      ],
      sections: [
        {
          kind: "text",
          title: "Money, real time, and regulation, all at once",
          body: [
            "An e-commerce bug loses a sale. A gambling-platform bug can pay out money that should not have been paid, let a self-excluded player keep gambling, or let a minor register — simultaneously a financial loss, a compliance breach, and a duty-of-care failure.",
            "This track treats iGaming QA as what it actually is on a real platform: a financial-integrity and risk-control discipline that happens to have a UI, not a UI-testing discipline that happens to involve money.",
            "Everything in this track is synthetic: fictional players, fake currency, simulated bets, simulated KYC and geolocation providers. No lesson, challenge, or practice app in this track connects to a real gambling operator, a real payment provider, or a real-money account.",
          ],
        },
        {
          kind: "compare",
          title: "The mental shift this track asks for",
          badLabel: "E-commerce mindset",
          bad: "'Order placed' screen shown → test passes. Occasional financial errors are refunded and forgotten.",
          goodLabel: "iGaming mindset",
          good: "'Bet placed' screen shown → still need to prove wallet, ledger, event and settlement all agree. Financial errors are regulatory incidents, not customer-service tickets.",
          note: "Same UI pattern, very different burden of proof.",
        },
        {
          kind: "list",
          title: "What this track covers",
          items: [
            "The representative architecture of a gambling platform, end to end",
            "Registration, KYC, age verification and geolocation as gating controls",
            "Wallets, deposits, withdrawals and the transaction ledger",
            "Betting, casino/game testing and settlement",
            "Bonuses, responsible gambling and self-exclusion",
            "Risk and fraud testing from a QA (not fraud-analyst) perspective",
            "API, database, event and concurrency testing for money-moving systems",
            "Risk-based strategy and the QA Engineering Lead's view of release readiness",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Jurisdiction disclaimer",
          body: [
            "Where this track mentions ages, limits, or regulatory obligations, treat them as illustrative examples of the kind of rule a QA team validates — not as a statement of any specific jurisdiction's actual law. Real platforms operate under licences with their own exact rules; a QA engineer's job is to test against whatever rules the product actually implements, and to know who to ask when the rule is unclear.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "This track is not gambling advice",
          body: [
            "Nothing here teaches strategies for winning bets or beating odds. The betting and casino content exists purely to give QA engineers realistic system behavior to validate.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating this as 'ShopEasy with a bet button'",
          body: "The money is not the product being sold — it is the state being protected. That changes what 'done testing' means for every flow.",
        },
        {
          title: "Assuming a green UI test is a green business flow",
          body: "This idea recurs through the whole track. A confirmation screen proves the front end rendered a success state, nothing else, until you prove the rest.",
        },
      ],
      keyTakeaways: [
        "iGaming QA is financial-integrity and risk-control testing with a UI on top of it, not the reverse.",
        "Bugs in this domain are simultaneously financial, compliance and player-protection incidents.",
        "Every scenario in this track uses synthetic data — fictional players, fake currency, simulated providers.",
        "Regulatory specifics vary by jurisdiction; the testing principles here are deliberately jurisdiction-agnostic.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What most distinguishes iGaming QA from typical e-commerce QA?",
          options: [
            { id: "a", text: "It requires more UI automation" },
            { id: "b", text: "A UI success screen carries a financial and compliance claim that must be independently verified" },
            { id: "c", text: "It cannot be automated at all" },
            { id: "d", text: "It only involves manual testing" },
          ],
          correct: "b",
          explanation:
            "The core shift this track teaches: in iGaming, 'looks right' and 'is correct' are different questions, and QA is responsible for answering both.",
        },
      ],
    },

    {
      id: "ig-architecture",
      slug: "understanding-an-online-gambling-platform",
      title: "Understanding an Online Gambling Platform",
      moduleId: "igaming-qa",
      summary:
        "A representative, educational architecture for a gambling platform, and the supporting systems around the core flow.",
      difficulty: "advanced",
      estimatedTime: 15,
      objectives: [
        "Draw the core player → bet → settlement flow from memory",
        "Name the supporting systems around that core flow and what each is responsible for",
        "Explain why QA needs to think in systems, not screens",
      ],
      sections: [
        {
          kind: "diagram",
          title: "A representative core flow (educational, not any specific operator's real architecture)",
          ascii: `Player
  |
  v
Registration
  |
  v
Authentication
  |
  v
KYC / Age Verification
  |
  v
Geolocation
  |
  v
Risk / Fraud
  |
  v
Wallet
  |
  v
Deposit
  |
  v
Casino / Sportsbook
  |
  v
Bet
  |
  v
Settlement
  |
  v
Wallet / Ledger
  |
  v
Transaction History`,
          caption:
            "Presented as a teaching model of a typical platform's shape, not a description of any named operator's internal systems.",
        },
        {
          kind: "list",
          title: "Supporting systems around the core flow",
          items: [
            "Bonus engine — grants, tracks wagering progress on, and expires promotional balances",
            "Responsible gambling service — limits, cooling-off, session controls",
            "Self-exclusion service — blocks account activity once a player opts out",
            "Payment provider (simulated) — processes deposits/withdrawals, sends callbacks",
            "KYC provider (simulated) — verifies identity and age",
            "Geolocation provider (simulated) — resolves and validates player location",
            "Risk engine — scores transactions and behavior for fraud/AML signals",
            "Notification service — emails/push/SMS for account and transaction events",
            "Event/message system — publishes domain events (bet placed, bet settled, deposit completed) for other services to consume",
            "Audit logging — an immutable record of who did what, used for disputes and investigations",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Think in systems, not screens",
          body: [
            "A screen is the tip of an iceberg: one request that may touch KYC, risk, wallet, ledger and event systems before it renders a result. QA that only exercises the screen has tested the tip.",
          ],
        },
        {
          kind: "table",
          title: "Who owns what, roughly",
          headers: ["System", "Primary responsibility", "A QA question it raises"],
          rows: [
            ["KYC provider", "Confirms identity and age", "What happens when it times out mid-registration?"],
            ["Geolocation provider", "Confirms player location", "What happens when it disagrees with the player's stated country?"],
            ["Risk engine", "Scores transactions for fraud", "Does a risk-engine failure fail open or fail closed?"],
            ["Wallet service", "Owns the authoritative balance", "Can two requests spend the same balance at once?"],
            ["Event system", "Notifies other services of what happened", "Does every state change publish an event, or only some?"],
          ],
        },
        {
          kind: "text",
          title: "Why the shape matters for test design",
          body: [
            "Every box in the diagram is a place a real platform can disagree with itself: a bet accepted by the sportsbook but never reflected in the wallet, a KYC approval that never reached the registration flow, a geolocation check that ran after the bet was already placed instead of before.",
            "Later lessons test each box in isolation and the seams between them. Keep this diagram in mind whenever a lesson says 'test the whole flow' — it means walking this exact path.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Assuming one box's failure is contained",
          body: "A stalled risk engine can silently block deposits platform-wide. Boxes in this diagram are dependencies, not independent features.",
        },
        {
          title: "Testing the boxes but never the seams",
          body: "Most production incidents live in the gap between two systems agreeing on the same fact (e.g. wallet balance vs. ledger total), not inside either system alone.",
        },
      ],
      keyTakeaways: [
        "The core flow is Player → Registration → Auth → KYC/Age → Geolocation → Risk → Wallet → Deposit → Bet → Settlement → Ledger → History.",
        "Supporting systems (bonus, RG, self-exclusion, payment, KYC, geolocation, risk, notifications, events, audit) surround that flow and each deserves its own test thinking.",
        "This is a teaching model, not a claim about any specific real operator's internal architecture.",
        "Most serious defects live at the seams between systems, not inside a single one.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Where do most serious iGaming defects tend to live, according to this lesson?",
          options: [
            { id: "a", text: "Inside a single well-tested service" },
            { id: "b", text: "In the seams between systems that should agree on the same fact" },
            { id: "c", text: "Only in the UI layer" },
            { id: "d", text: "Only in the payment provider" },
          ],
          correct: "b",
          explanation:
            "A wallet balance that disagrees with the ledger, or a bet accepted but never published as an event, are seam defects — each system did its own job correctly, but they disagree.",
        },
      ],
    },

    {
      id: "ig-registration",
      slug: "player-registration-and-account-lifecycle",
      title: "Player Registration & Account Lifecycle",
      moduleId: "igaming-qa",
      summary:
        "Testing the account creation flow and the states an account moves through afterward.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Identify the validation rules a registration form typically enforces",
        "Map the account lifecycle states a player can be in",
        "Test registration as a gate, not just a form",
      ],
      sections: [
        {
          kind: "text",
          title: "Registration is the first control, not just a form",
          body: [
            "Before a player can deposit a penny, registration has already made several decisions: is this email unique, is this a real person, are they claiming to be old enough, and is the account allowed to exist at all in this jurisdiction. Testing registration means testing those decisions, not just field validation.",
          ],
        },
        {
          kind: "diagram",
          title: "A representative account lifecycle",
          ascii: `PENDING
  |
  v
ACTIVE ------> SUSPENDED ------> ACTIVE
  |                 |
  v                 v
SELF_EXCLUDED   CLOSED`,
          caption: "Exact states and transitions vary by platform; the point is that an account is a state machine, not a boolean.",
        },
        {
          kind: "list",
          title: "Scenarios worth covering",
          items: [
            "Valid registration with all required fields",
            "Duplicate email or duplicate identity document",
            "Weak password rejected, strong password accepted",
            "Registration while under the minimum age (see the KYC/age lesson for the full matrix)",
            "Registration from a restricted territory (see the geolocation lesson)",
            "Partial registration abandoned mid-flow — does the system leave an orphaned PENDING account?",
            "Re-registration attempt with an email tied to a CLOSED or SELF_EXCLUDED account",
          ],
        },
        {
          kind: "compare",
          title: "Field validation vs. account-state validation",
          badLabel: "Field-only test",
          bad: "Submit the form with an invalid email format, assert an inline error appears.",
          goodLabel: "Account-state test",
          good: "Submit the form with a valid email already tied to a self-excluded account, assert the new registration is rejected and the existing account state is unaffected.",
          note: "Both are needed. The second is the one teams under-test.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "PENDING accounts are a common leak",
          body: [
            "A registration that starts but never completes (e.g. the player closes the tab after step 1) can leave a PENDING account holding a reserved email address forever, or — worse — one that can still log in. Ask what a stalled registration actually leaves behind.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing the happy-path form submission",
          body: "The account lifecycle after registration is where the interesting bugs are: suspension, closure, and re-registration edge cases.",
        },
        {
          title: "Not testing what a CLOSED account can still do",
          body: "'Closed' should mean closed. A closed account that can still log in and view balances is a real defect class in this domain.",
        },
      ],
      keyTakeaways: [
        "Registration enforces uniqueness, identity and eligibility decisions before any money is involved.",
        "An account is a state machine (PENDING/ACTIVE/SUSPENDED/SELF_EXCLUDED/CLOSED); test the transitions, not just the states.",
        "Abandoned registrations are a common source of orphaned or exploitable accounts.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why is testing only the registration form's field validation insufficient?",
          options: [
            { id: "a", text: "Field validation is never worth testing" },
            { id: "b", text: "Registration also gates identity, uniqueness and eligibility decisions that outlive the form" },
            { id: "c", text: "Forms cannot be automated" },
            { id: "d", text: "Because passwords are hashed" },
          ],
          correct: "b",
          explanation:
            "Registration is the first business-rule gate in the platform, not just a data-entry form — the account-state consequences matter as much as the inline validation messages.",
        },
      ],
    },

    {
      id: "ig-kyc",
      slug: "age-verification-and-kyc",
      title: "Age Verification & KYC",
      moduleId: "igaming-qa",
      summary:
        "Testing identity verification and age-gating without assuming any one jurisdiction's exact rules.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Enumerate the KYC outcome states a QA suite should cover",
        "Test date-of-birth edge cases precisely",
        "Handle third-party KYC provider failure modes as first-class test scenarios",
      ],
      sections: [
        {
          kind: "text",
          title: "KYC is a verdict pipeline, not a single check",
          body: [
            "Know Your Customer (KYC) verification typically resolves to one of several outcomes, often produced by a third-party provider the platform integrates with. QA needs to test the platform's behavior for every outcome the provider can return — including the ones that are not 'approved' or 'rejected'.",
          ],
        },
        {
          kind: "table",
          title: "KYC outcome states to cover",
          headers: ["Outcome", "What the platform should do"],
          rows: [
            ["Verified", "Unlock the account for deposits/withdrawals per policy"],
            ["Rejected", "Block gambling-related actions, tell the player how to resolve it"],
            ["Pending", "Allow only the actions policy permits pre-verification (often none, or deposit-only)"],
            ["Manual review", "Route to a human queue; account remains in a defined interim state"],
            ["Provider timeout", "Fail safely — usually treated as pending, not silently approved"],
            ["Provider unavailable", "Degrade gracefully; do not default to 'verified'"],
            ["Expired verification", "Require re-verification before further gambling activity"],
          ],
        },
        {
          kind: "list",
          title: "Identity-matching scenarios",
          items: [
            "Valid, matching identity document",
            "Invalid or unreadable document",
            "Date of birth on the document does not match the submitted registration DOB",
            "Duplicate identity — the same document already verified on a different account",
          ],
        },
        {
          kind: "table",
          title: "Age boundary matrix",
          headers: ["Scenario", "Expected"],
          rows: [
            ["DOB puts player under the platform's minimum age", "Rejected"],
            ["DOB puts player exactly at the minimum age (e.g. their birthday is today)", "Accepted"],
            ["DOB puts player comfortably above minimum age", "Accepted"],
            ["DOB is not a real calendar date", "Rejected as invalid input"],
            ["DOB is in the future", "Rejected as invalid input"],
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "The exact boundary is the whole test",
          body: [
            "'Exactly at the minimum age' is the case most suites skip and the one most likely to be off by one. If the rule is age-in-whole-years, a birthday-today test is not optional — it is the test.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Jurisdiction-agnostic by design",
          body: [
            "This lesson deliberately does not state a specific minimum age or a specific jurisdiction's exact KYC requirement. Validate against whatever the product under test actually implements, and confirm that rule with product/compliance rather than assuming it.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating provider timeout as 'approved'",
          body: "A timeout is an unknown, not a yes. Systems that fail open on a KYC timeout have effectively disabled the control.",
        },
        {
          title: "Testing age only 'clearly under' and 'clearly over'",
          body: "Boundary bugs live at the boundary. Skip the exact-minimum-age case and you have not actually tested the rule.",
        },
        {
          title: "Assuming KYC is one-and-done",
          body: "Expired verifications need to force re-verification, not be silently ignored on subsequent logins.",
        },
      ],
      keyTakeaways: [
        "KYC has more outcome states than pass/fail: pending, manual review, provider timeout, provider unavailable, expired.",
        "Provider failures should degrade safely, never silently resolve to 'verified'.",
        "Age testing must include the exact boundary (today's-birthday case), not just clearly-under and clearly-over.",
        "Never hardcode a specific jurisdiction's rule into a general test-design lesson — verify against the product's actual policy.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "A KYC integration treats any provider response other than an explicit 'rejected' as verified, including timeouts. What's the risk?",
          options: [
            { id: "a", text: "Slower response times" },
            { id: "b", text: "A provider outage silently approves every new player, disabling the control" },
            { id: "c", text: "It will reject too many valid players" },
            { id: "d", text: "There is no risk if the timeout is rare" },
          ],
          correct: "b",
          explanation:
            "Defaulting an unknown outcome to 'verified' turns a provider outage into a mass bypass of identity and age verification.",
        },
        {
          id: "q2",
          type: "multiple-choice",
          prompt: "Which age test case is most often missing from real suites?",
          options: [
            { id: "a", text: "A player clearly under the minimum age" },
            { id: "b", text: "A player clearly above the minimum age" },
            { id: "c", text: "A player exactly at the minimum age boundary" },
            { id: "d", text: "A player with no date of birth submitted" },
          ],
          correct: "c",
          explanation:
            "Boundary conditions are where off-by-one errors in age calculation actually surface.",
        },
      ],
    },

    {
      id: "ig-geolocation",
      slug: "geolocation-and-restricted-territories",
      title: "Geolocation & Restricted Territories",
      moduleId: "igaming-qa",
      summary: "Testing location-based access control as a business-critical, frequently-evaluated gate.",
      difficulty: "advanced",
      estimatedTime: 12,
      objectives: [
        "Explain why geolocation is checked continuously, not just at registration",
        "Cover the main geolocation failure and mismatch scenarios",
        "Recognize VPN/proxy detection as its own testable control",
      ],
      sections: [
        {
          kind: "text",
          title: "Geolocation is a gate that reopens, not a one-time check",
          body: [
            "Unlike a document you verify once, location can change mid-session — a player can move, a VPN can toggle on, a network can reroute. Platforms typically re-check location at meaningful points (login, deposit, bet placement), which means QA needs to test the recheck, not just the first check.",
          ],
        },
        {
          kind: "list",
          title: "Scenarios to cover",
          items: [
            "Player in an allowed territory — access granted",
            "Player in a restricted territory — access denied, with a clear reason shown",
            "Player location unknown / cannot be resolved — treated conservatively, not as 'allowed'",
            "Registered address and detected location disagree",
            "VPN or proxy detected — flagged and typically blocked or restricted",
            "Geolocation provider failure or timeout",
          ],
        },
        {
          kind: "table",
          title: "Failure handling: what 'safe' looks like",
          headers: ["Situation", "Unsafe behavior", "Expected behavior"],
          rows: [
            ["Provider times out", "Silently allow access", "Block or degrade the action and surface a retry/support path"],
            ["Location unresolved", "Default to allowed", "Default to restricted until resolved"],
            ["VPN detected mid-session", "Ignore until next login", "Re-evaluate access for the current session"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why this is a business-critical control, not a UX nicety",
          body: [
            "Operating in a territory without the required licence is a compliance and legal exposure, not a cosmetic issue. QA treats geolocation bugs with the same severity as wallet bugs, even though the symptom looks like 'a page didn't load'.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing geolocation at login",
          body: "If the platform re-checks at deposit or bet time, so should the test suite — that's usually where the real control lives.",
        },
        {
          title: "Treating 'unknown location' as equivalent to 'allowed location'",
          body: "Unknown should fail closed. Confusing 'we don't know' with 'it's fine' is a recurring defect pattern in this domain.",
        },
      ],
      keyTakeaways: [
        "Geolocation is typically re-evaluated at multiple points in a session, not just once at login.",
        "Unresolved location and provider failures should fail closed (restrict), never fail open (allow).",
        "VPN/proxy detection is a distinct control worth its own test scenarios.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "When a geolocation provider fails to resolve a player's location, what should QA expect?",
          options: [
            { id: "a", text: "Access is granted by default" },
            { id: "b", text: "Access is restricted or degraded until location is confirmed" },
            { id: "c", text: "The check is skipped entirely" },
            { id: "d", text: "The player is logged out permanently" },
          ],
          correct: "b",
          explanation: "An unresolved location is an unknown, and unknowns should fail closed for a business-critical access control.",
        },
      ],
    },

    {
      id: "ig-wallets",
      slug: "wallets-and-financial-transactions",
      title: "Wallets & Financial Transactions",
      moduleId: "igaming-qa",
      summary: "The wallet's balance types and the transaction ledger that makes them verifiable.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Distinguish balance, available balance, bonus balance and pending balance",
        "Explain the transaction ledger and why QA relies on it",
        "Reconstruct a final balance from a ledger by hand",
      ],
      sections: [
        {
          kind: "text",
          title: "A wallet is not one number",
          body: [
            "A player-facing 'balance' is usually a composite of several tracked figures: cash balance, bonus balance (restricted, wagering-locked funds), and pending balance (funds in flight — a withdrawal being processed, a bet awaiting settlement). Testing 'the balance' without knowing which balance you mean produces false confidence.",
          ],
        },
        {
          kind: "table",
          title: "Balance types",
          headers: ["Balance", "Meaning", "Can it be withdrawn?"],
          rows: [
            ["Cash balance", "The player's own, unrestricted funds", "Yes"],
            ["Bonus balance", "Promotional funds, usually wagering-locked", "No, until wagering requirement is met"],
            ["Pending balance", "Funds in flight (processing withdrawal, unsettled bet)", "No, until it clears"],
            ["Available balance", "What can actually be used right now", "Cash minus anything held/pending"],
          ],
        },
        {
          kind: "text",
          title: "The transaction ledger",
          body: [
            "The ledger is the append-only record of every balance-affecting event. A player's current balance should always be reproducible by replaying their ledger from zero — that reproducibility is exactly what QA uses to validate correctness.",
          ],
        },
        {
          kind: "code",
          title: "The ledger arithmetic",
          language: "text",
          code: `
  Starting balance
+ Deposits
- Bet stakes
+ Winnings
- Withdrawals
+/- Adjustments
= Final balance`,
          caption: "If summing a player's ledger does not equal their reported balance, that gap is a bug — full stop.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Why the ledger matters for QA specifically",
          body: [
            "The UI shows you a number. The ledger shows you how that number was derived. When a balance looks wrong, the ledger is where you find whether the platform disagrees with itself, and exactly where.",
          ],
        },
        {
          kind: "list",
          title: "Ledger-based checks worth automating",
          items: [
            "Sum of a player's transactions equals their reported balance",
            "Every debit has a corresponding, valid reason (stake, withdrawal, adjustment)",
            "No transaction pushes cash balance below zero",
            "Bonus-balance transactions never mix arithmetic with cash-balance transactions",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Testing 'the balance' as a single number",
          body: "Cash, bonus, pending and available balances answer different questions — conflating them hides real defects.",
        },
        {
          title: "Validating the UI balance without checking the ledger",
          body: "A UI can render a stale or optimistic number. The ledger is the source of truth to check it against.",
        },
      ],
      keyTakeaways: [
        "A wallet is composed of at least cash, bonus and pending balances, with available balance derived from them.",
        "The transaction ledger is append-only and should always be able to reproduce the current balance.",
        "Reconciling reported balance against summed ledger transactions is one of the single highest-value QA checks in this domain.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A player's bonus balance is $50 and their wagering requirement is unmet. Can they withdraw it?",
          options: [
            { id: "a", text: "Yes, all balances are withdrawable" },
            { id: "b", text: "No — bonus balance is typically wagering-locked until the requirement is met" },
            { id: "c", text: "Only if support approves it manually every time" },
            { id: "d", text: "Only on weekends" },
          ],
          correct: "b",
          explanation: "Bonus balance is restricted funds by design; that restriction is exactly what wagering-requirement testing exists to verify.",
        },
      ],
      sqlExercises: ["ig-sql-wallet-reconciliation"],
    },

    {
      id: "ig-deposits-withdrawals",
      slug: "deposits-and-withdrawals",
      title: "Deposits & Withdrawals",
      moduleId: "igaming-qa",
      summary: "Testing the money-in and money-out paths, including their failure and duplication modes.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Cover the successful and failing deposit/withdrawal paths",
        "Explain why duplicate-callback handling is a core deposit test, not an edge case",
        "Justify why negative-balance prevention must be tested at the boundary",
      ],
      sections: [
        {
          kind: "list",
          title: "Deposit scenarios",
          items: [
            "Successful deposit — balance and ledger both update, in agreement",
            "Declined deposit (simulated provider decline) — no balance change, no ledger entry",
            "Duplicate deposit — the same deposit submitted or callback delivered twice",
            "Deposit exceeding a configured limit (see the Responsible Gambling lesson)",
          ],
        },
        {
          kind: "list",
          title: "Withdrawal scenarios",
          items: [
            "Successful withdrawal — funds move from available to pending, then clear",
            "Failed withdrawal (simulated provider failure) — funds are returned to available balance, not lost",
            "Withdrawal attempted with insufficient available balance — rejected before any external call",
            "Withdrawal exceeding remaining bonus-locked funds — rejected or capped at what's actually withdrawable",
          ],
        },
        {
          kind: "text",
          title: "Payment callbacks: the deposit is not done when the UI says so",
          body: [
            "Most real integrations are asynchronous: the platform initiates a deposit, and a payment provider later calls back to confirm it. A UI 'Deposit successful' message that fires before the callback is received is an optimistic UI state, not proof of a completed transaction — the callback is.",
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "The duplicate callback is not a hypothetical",
          body: [
            "Provider callbacks over HTTP are commonly retried on timeout, by design, on the provider's side. A platform that credits a wallet again on every retry of the same callback will double-credit players. Handling this correctly (usually via an idempotency key, covered in its own lesson) is not optional hardening — it is table stakes for a payments integration.",
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Negative balances must be impossible, not just unlikely",
          body: [
            "A stake or withdrawal that could ever push cash balance below zero is a critical defect. This must be tested at the exact boundary — stake equal to balance should succeed; stake one unit over balance should fail — not just with an obviously-too-large number.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing the UI's confirmation message",
          body: "Prove the wallet balance, the ledger entry, and (where relevant) the callback-driven confirmation, not just the toast.",
        },
        {
          title: "Testing insufficient-funds only with an absurd amount",
          body: "Testing a $1,000,000 withdrawal against a $50 balance proves little. Test balance vs. balance+1.",
        },
        {
          title: "Never simulating a duplicate callback",
          body: "If your suite has never sent the same payment callback twice, you have not tested the scenario most likely to double-credit a real player.",
        },
      ],
      keyTakeaways: [
        "A deposit is only actually complete when its callback (or equivalent confirmation) has been processed, not when the UI first shows a success state.",
        "Duplicate payment callbacks are a routine occurrence in real integrations and must be handled idempotently.",
        "Negative-balance prevention must be tested exactly at the boundary, not with an arbitrarily large overdraft.",
        "A failed withdrawal must return funds to available balance — 'failed' cannot mean 'funds are now stuck'.",
      ],
      quiz: [
        {
          id: "q1",
          type: "predict-result",
          prompt:
            "A deposit callback for the same transaction ID is delivered twice by the payment provider (a normal retry). What should a correctly-implemented wallet service do?",
          options: [
            { id: "a", text: "Credit the wallet twice — the provider confirmed it twice" },
            { id: "b", text: "Credit the wallet once, recognizing the second callback as a duplicate of an already-applied transaction" },
            { id: "c", text: "Reject both callbacks" },
            { id: "d", text: "Credit the wallet the second time only, ignoring the first" },
          ],
          correct: "b",
          explanation:
            "Idempotent processing means the same confirmed event, however many times it's delivered, has exactly one financial effect.",
        },
      ],
      challenges: ["ig-ch-duplicate-transaction"],
      playground: [],
    },

    {
      id: "ig-betting",
      slug: "betting-and-bet-placement",
      title: "Betting & Bet Placement",
      moduleId: "igaming-qa",
      summary: "The bet state machine, stake limits, and testing invalid transitions on purpose.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Model a bet as a state machine and name its valid transitions",
        "Design stake, odds and market-availability test cases",
        "Deliberately test invalid state transitions, not just valid ones",
      ],
      sections: [
        {
          kind: "diagram",
          title: "Bet state machine",
          ascii: `CREATED --> ACCEPTED --> SETTLED
   |                        |
   v                        v
REJECTED                 VOIDED`,
          caption: "A representative state machine — the exact states and rules a given platform implements should always be confirmed, not assumed.",
        },
        {
          kind: "list",
          title: "Placement scenarios",
          items: [
            "Valid bet on an open market with valid odds — accepted",
            "Stake below the market minimum — rejected",
            "Stake above the market maximum — rejected",
            "Stake exceeding available balance — rejected",
            "Bet on a suspended market — rejected",
            "Bet on a closed/settled market — rejected",
            "Bet submitted with odds that have since changed (stale odds) — handled per the platform's odds-movement policy, not silently accepted at old odds",
            "The exact same bet submitted twice in quick succession — the second is recognized as a duplicate, not placed again",
          ],
        },
        {
          kind: "text",
          title: "Test the transitions you're not supposed to be able to make",
          body: [
            "A state machine is defined as much by what it forbids as by what it allows. A settled bet should never be voidable after payout has occurred; a rejected bet should never later transition to accepted. Prove these directly — attempt the forbidden transition via the API and assert it is refused — rather than only exercising the happy path.",
          ],
        },
        {
          kind: "code",
          title: "Testing an invalid transition via the API",
          language: "ts",
          code: `
test('a settled bet cannot be voided', async ({ request }) => {
  const bet = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-fixture-1', selection: 'home', stake: 10 },
  });
  const { id } = await bet.json();

  // Simulate settlement (test-only helper in the practice environment)
  await request.post(\`/api/igaming/bets/\${id}/settle\`, { data: { result: 'won' } });

  const voidAttempt = await request.post(\`/api/igaming/bets/\${id}/void\`);
  expect(voidAttempt.status()).toBe(409);
});
`,
        },
        {
          kind: "callout",
          tone: "warning",
          title: "A UI that blocks an action is not proof the backend blocks it too",
          body: [
            "Disabling a 'Void' button after settlement in the UI is good UX. It is not a security or integrity control. The state transition must be rejected server-side, and that is what the test above actually proves.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing valid bets",
          body: "The rejection paths — suspended market, bad stake, insufficient balance — are where the real business rules live.",
        },
        {
          title: "Trusting a disabled UI button as a state-transition control",
          body: "Client-side disabling is UX. Server-side rejection is the actual control, and it's the one worth an automated test.",
        },
        {
          title: "Never testing the duplicate bet case",
          body: "Double-clicking 'Place Bet' is one of the most common real-world user actions; if it's never been tested, it's unverified.",
        },
      ],
      keyTakeaways: [
        "Model bets as a state machine: CREATED → ACCEPTED → SETTLED, CREATED → REJECTED, ACCEPTED → VOIDED (representative, not universal).",
        "Stake and market-availability rejections deserve as much test coverage as successful placement.",
        "Deliberately attempting forbidden state transitions is how you prove a state machine is actually enforced, not just modeled.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why test that a settled bet cannot be voided, specifically via the API?",
          options: [
            { id: "a", text: "Because the UI is always wrong" },
            { id: "b", text: "Because a disabled UI button is a UX affordance, not proof the backend enforces the same rule" },
            { id: "c", text: "API tests are always faster, which is the only reason" },
            { id: "d", text: "Because settlement never happens in test environments" },
          ],
          correct: "b",
          explanation: "The state-transition rule only actually holds if the server rejects it, regardless of what the client UI allows a user to attempt.",
        },
      ],
      challenges: ["ig-ch-validate-bet", "ig-ch-insufficient-balance"],
    },

    {
      id: "ig-casino",
      slug: "casino-and-game-testing",
      title: "Casino / Game Testing",
      moduleId: "igaming-qa",
      summary: "Testing casino games as systems integration, not gameplay — lobby, session, round and settlement.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Identify the lifecycle of a casino game session and round",
        "Design tests for interruption and timeout, not just normal play",
        "Explain why casino QA is integration testing, not gambling strategy",
      ],
      sections: [
        {
          kind: "text",
          title: "A round is a transaction with graphics on top",
          body: [
            "From a QA perspective, a casino game round is a financial transaction: a stake is debited, an outcome is determined, a payout (possibly zero) is credited. The visuals are a rendering of that transaction, not a separate thing to test in isolation from it.",
          ],
        },
        {
          kind: "diagram",
          title: "Game session and round lifecycle",
          ascii: `Lobby
  |
  v
Game launch --> Session started
                     |
                     v
              Round started
                     |
                     v
              Round resolved (win / loss)
                     |
                     v
              Session continues or expires`,
        },
        {
          kind: "list",
          title: "Scenarios to cover",
          items: [
            "Game appears in the lobby only when available (not under maintenance, not region-restricted)",
            "Game launches into a valid session",
            "A round completes normally with a win or a loss reflected in the wallet",
            "A round times out mid-play — the stake is either returned or resolved deterministically, never lost silently",
            "The session is interrupted (connection drop, tab closed) mid-round",
            "The session expires from inactivity",
            "The exact same round-start request is submitted twice (duplicate round request)",
            "Settlement of the round is reflected in the wallet and transaction history",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Scope: behavior and integration, not gameplay design",
          body: [
            "This lesson is about verifying that a round's financial outcome is correctly applied, sessions behave predictably under interruption, and duplicate requests don't double-charge or double-pay — not about game mechanics, RNG fairness certification, or play strategy.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "A stalled round must resolve to something, deterministically",
          body: [
            "'The round just hangs' is not an acceptable state for a system holding a player's stake. QA should always be able to answer: if this round never resolves client-side, what happens to the money?",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Testing only games that are working normally",
          body: "Interruption, timeout and duplicate-request handling are where casino integration bugs actually live.",
        },
        {
          title: "Conflating game QA with gameplay/RNG fairness testing",
          body: "This track is about the wallet/session/settlement integration around a game, not certifying the game's randomness.",
        },
      ],
      keyTakeaways: [
        "A game round is a financial transaction; test its debit/outcome/credit sequence like one.",
        "Interruption, timeout and session-expiry handling matter as much as normal play.",
        "Duplicate round-start requests must not double-charge the stake.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "From a QA integration-testing perspective, what is a casino game round?",
          options: [
            { id: "a", text: "A UI animation with no backend implication" },
            { id: "b", text: "A financial transaction: debit stake, determine outcome, credit payout" },
            { id: "c", text: "Something QA cannot meaningfully test" },
            { id: "d", text: "A pure client-side calculation" },
          ],
          correct: "b",
          explanation: "Treating a round as a transaction is what makes it testable with the same rigor as a bet or a withdrawal.",
        },
      ],
    },

    {
      id: "ig-settlement",
      slug: "bet-settlement-and-payouts",
      title: "Bet Settlement & Payouts",
      moduleId: "igaming-qa",
      summary: "Verifying that settlement correctly and exactly once updates every system it should.",
      difficulty: "advanced",
      estimatedTime: 15,
      objectives: [
        "List every system a settlement should affect",
        "Design a settlement test that checks all of them, not just the bet record",
        "Recognize duplicate settlement as a critical-severity defect class",
      ],
      sections: [
        {
          kind: "text",
          title: "Settlement is a fan-out, not a single update",
          body: [
            "Settling a bet is rarely one database write. A correct settlement typically: marks the bet SETTLED with a result, calculates and credits (or does not credit) a payout, writes a ledger transaction for that payout, publishes a settlement event, and makes the result visible in transaction history. Testing settlement means checking all of these agree — not just that the bet record shows the right status.",
          ],
        },
        {
          kind: "list",
          title: "Settlement scenarios",
          items: [
            "Winning bet — payout calculated correctly (stake × odds, or the platform's actual formula) and credited",
            "Losing bet — no payout, bet marked SETTLED with a loss result",
            "Void bet — stake returned, no win/loss applied",
            "Partial cash-out or partial settlement, if the platform supports it",
            "Settlement of a bet that was already settled (duplicate settlement attempt) — rejected, not reapplied",
            "Settlement event published exactly once per settlement",
          ],
        },
        {
          kind: "table",
          title: "What a settlement test should assert",
          headers: ["Layer", "Assertion"],
          rows: [
            ["Bet record", "Status is SETTLED with the correct result"],
            ["Wallet", "Balance reflects the payout (or lack of one)"],
            ["Ledger", "A transaction exists matching the payout amount"],
            ["Event stream", "Exactly one settlement event was published for this bet"],
            ["Transaction history", "The settlement is visible to the player"],
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Duplicate settlement is a critical-severity bug",
          body: [
            "If a settlement job retries (crash-recovery, at-least-once message delivery, manual re-trigger) and settlement is not idempotent, a winning bet can be paid out twice. This is exactly as serious as a duplicate deposit callback, and should be tested the same way: settle, then attempt to settle again, and assert nothing changes the second time.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Asserting only on the bet's status field",
          body: "A bet correctly marked SETTLED with a payout that was never credited to the wallet is still a broken settlement — and the status field alone won't reveal it.",
        },
        {
          title: "Never testing a re-settlement attempt",
          body: "If settlement has never been triggered twice on the same bet in a test, its idempotency is unverified, not proven.",
        },
      ],
      keyTakeaways: [
        "A correct settlement updates the bet record, wallet, ledger, event stream and transaction history in agreement.",
        "Settlement tests should assert across all of those layers, not just the bet's status field.",
        "Duplicate settlement must be a no-op the second time — treat it with the same severity as a duplicate payment callback.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "A test asserts \`GET /bets/{id}\` returns \`status: 'settled', result: 'won'\` after settlement, and calls it done. What is it missing?",
          options: [
            { id: "a", text: "Nothing — the bet status is the source of truth" },
            { id: "b", text: "Confirmation that the wallet, ledger and event stream also reflect the win" },
            { id: "c", text: "A screenshot of the confirmation page" },
            { id: "d", text: "Testing the losing-bet case instead" },
          ],
          correct: "b",
          explanation:
            "The bet status alone does not prove the payout was actually credited, ledgered, or published — settlement's real correctness lives across systems.",
        },
      ],
      challenges: ["ig-ch-settlement-validation"],
    },

    {
      id: "ig-bonuses",
      slug: "bonuses-and-promotions",
      title: "Bonuses & Promotions",
      moduleId: "igaming-qa",
      summary: "Bonus eligibility, wagering requirements, expiry, and the cash-vs-bonus balance distinction.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Explain wagering requirements and how QA verifies progress toward them",
        "Cover bonus lifecycle scenarios end to end",
        "Distinguish cash balance from bonus balance in test assertions",
      ],
      sections: [
        {
          kind: "diagram",
          title: "A representative bonus lifecycle",
          ascii: `ELIGIBLE
   |
   v
ACTIVATED --> WAGERING IN PROGRESS --> COMPLETED (converted to cash)
   |                  |
   v                  v
CANCELLED          EXPIRED`,
        },
        {
          kind: "text",
          title: "Cash balance and bonus balance are different currencies with the same symbol",
          body: [
            "A $20 welcome bonus and a $20 cash balance can look identical in a wallet summary and behave completely differently: one is withdrawable now, the other only after a wagering requirement is met, and possibly only up to a cap. Test assertions must specify which balance they're checking, every time.",
          ],
        },
        {
          kind: "list",
          title: "Scenarios to cover",
          items: [
            "Welcome/deposit bonus activation for an eligible player",
            "Activation attempt by an ineligible player (already claimed, doesn't meet deposit minimum, etc.)",
            "Wagering requirement progress correctly incremented by qualifying bets",
            "Wagering requirement completion converts bonus balance to cash balance",
            "Bonus expiry before wagering requirement is met — bonus (and its unwagered balance) is forfeited per policy",
            "Bonus cancellation by the player or platform",
            "Duplicate activation attempt of the same bonus — rejected, not granted twice",
            "Bonus abuse pattern (e.g. depositing, wagering minimally, withdrawing, repeating) — flagged for risk review, not silently allowed",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Duplicate activation is a real financial leak",
          body: [
            "If activating an already-active bonus a second time re-grants its balance instead of being rejected, that is free money created out of a race condition or a missing idempotency check — treat it with the same seriousness as a duplicate deposit.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "QA's role in bonus-abuse scenarios",
          body: [
            "QA is not the fraud team, but QA should verify that abuse-pattern detection exists and functions — for example, that a risk flag is raised for the deposit-wager-minimally-withdraw-repeat pattern — without needing to design the detection rules itself.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Asserting on 'balance' without specifying cash vs. bonus",
          body: "A test that checks total balance can pass while the cash/bonus split is completely wrong.",
        },
        {
          title: "Never testing bonus expiry",
          body: "An unwagered bonus that survives past its expiry date and remains spendable is a common real defect.",
        },
      ],
      keyTakeaways: [
        "A bonus moves through eligible → activated → wagering-in-progress → completed/cancelled/expired.",
        "Cash balance and bonus balance must be asserted on separately — they follow different rules.",
        "Duplicate bonus activation and missed expiry are the two highest-value bonus defects to test for.",
      ],
      quiz: [
        {
          id: "q1",
          type: "true-false",
          prompt: "A player's bonus balance should always be withdrawable in the same way as their cash balance.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation: "Bonus balance is typically wagering-restricted and only converts to withdrawable cash once its requirement is met.",
        },
      ],
    },

    {
      id: "ig-responsible-gambling",
      slug: "responsible-gambling",
      title: "Responsible Gambling",
      moduleId: "igaming-qa",
      summary: "Testing the player-protection controls that must hold even when they cost the platform revenue.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "List the main responsible-gambling controls a platform typically offers",
        "Design a limit-enforcement test end to end",
        "Explain why RG controls need adversarial, not just happy-path, testing",
      ],
      sections: [
        {
          kind: "list",
          title: "Common responsible-gambling controls",
          items: [
            "Deposit limits (daily/weekly/monthly)",
            "Loss limits",
            "Wagering (stake) limits",
            "Cooling-off periods (temporary, player-initiated break)",
            "Session-length reminders or forced breaks",
            "Reality checks and activity summaries",
          ],
        },
        {
          kind: "steps",
          title: "A limit-enforcement test, end to end",
          steps: [
            { title: "Set the limit", body: "Player sets a deposit limit, e.g. $100/day, via the responsible-gambling settings." },
            { title: "Confirm it applies immediately", body: "A subsequent deposit within the limit succeeds." },
            {
              title: "Attempt to exceed it",
              body: "A deposit that would push the day's total over $100 is rejected before funds move.",
              code: `const res = await request.post('/api/igaming/wallet/deposit', {\n  data: { amount: 60, idempotencyKey: 'dep-2' },\n});\nexpect(res.status()).toBe(422);`,
              language: "ts",
            },
            { title: "Confirm the reduction path is safe", body: "If the player later lowers the limit, existing balance is unaffected, but the new limit applies going forward." },
            { title: "Confirm the increase path has the required friction", body: "Raising a limit typically requires a cooling-off/delay before taking effect — verify that delay is enforced, not just displayed." },
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Test these controls adversarially",
          body: [
            "Responsible-gambling controls are exactly the features a determined user is motivated to work around — rapid limit changes, split deposits just under the threshold, or timing deposits around a reset window. QA should deliberately try to defeat the control, not just confirm it works when used as intended.",
          ],
        },
        {
          kind: "text",
          title: "The business-conflict test",
          body: [
            "A deposit limit blocking a deposit is, financially, the platform turning away revenue. This is precisely why it needs rigorous testing: it is a control that must hold even against the platform's own short-term financial incentive, and that makes it more prone to being quietly weakened than a feature nobody's incentives push against.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only testing that the limit can be set, not that it's enforced",
          body: "A limit that saves correctly but doesn't block a deposit is a settings-page bug pretending to be a working control.",
        },
        {
          title: "Not testing limit changes mid-period",
          body: "Lowering or raising a limit partway through a day/week/month has edge cases (does the new limit apply retroactively? immediately? after a delay?) that need explicit coverage.",
        },
      ],
      keyTakeaways: [
        "Deposit, loss and wagering limits, cooling-off and session controls are the core RG toolkit to test.",
        "A limit-enforcement test must prove the limit blocks the over-threshold action, not just that it can be configured.",
        "Test RG controls adversarially — these are features some users are actively motivated to circumvent.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A player sets a $100/day deposit limit, then attempts a $150 deposit. What should happen?",
          options: [
            { id: "a", text: "The deposit succeeds; limits are advisory" },
            { id: "b", text: "The deposit is rejected before funds move" },
            { id: "c", text: "The deposit succeeds but is flagged for later review" },
            { id: "d", text: "The account is automatically closed" },
          ],
          correct: "b",
          explanation: "A responsible-gambling limit must be a hard, enforced control at the point of the transaction, not an after-the-fact flag.",
        },
      ],
      challenges: ["ig-ch-deposit-limit"],
    },

    {
      id: "ig-self-exclusion",
      slug: "self-exclusion-and-player-protection",
      title: "Self-Exclusion & Player Protection",
      moduleId: "igaming-qa",
      summary: "Verifying a self-excluded player is actually blocked everywhere the platform can reach them.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Enumerate every surface a self-exclusion should block",
        "Test self-exclusion taking effect mid-session, not just at next login",
        "Explain why partial enforcement is worse than no self-exclusion at all",
      ],
      sections: [
        {
          kind: "text",
          title: "Self-exclusion is a promise the whole platform has to keep",
          body: [
            "When a player self-excludes, the platform is making a commitment that touches nearly every subsystem: authentication, betting, casino, wallet, marketing. A self-exclusion that blocks login but still lets a background job send a promotional email is not a partial success — from the player's perspective, and often from a regulatory one, it is a failure.",
          ],
        },
        {
          kind: "table",
          title: "Surfaces to verify for a self-excluded player",
          headers: ["Surface", "Expected behavior"],
          rows: [
            ["Login", "Blocked, with a clear explanation and support path"],
            ["Bet placement", "Blocked, including via the API directly (not just the UI)"],
            ["Casino game launch", "Blocked"],
            ["Deposits", "Blocked"],
            ["Withdrawals", "Allowed where policy permits — self-exclusion typically should not trap a player's own funds"],
            ["Marketing communications", "Suppressed"],
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Test it taking effect mid-session, not just at the next login",
          body: [
            "The scenario the user's own spec calls out explicitly: a player self-excludes while they have an active logged-in session. Does that session get terminated, or does self-exclusion only apply the next time they try to log in? If a self-excluded player can keep betting for the rest of an already-open session, the control has a real gap.",
          ],
        },
        {
          kind: "list",
          title: "Test scenarios",
          items: [
            "Self-excluded player attempts to log in — blocked",
            "Self-excluded player attempts to place a bet via the API directly, bypassing the UI — blocked",
            "Self-excluded player attempts to launch a casino game — blocked",
            "Self-excluded player attempts a deposit — blocked",
            "Self-excluded player attempts a withdrawal — allowed, per typical policy (confirm against the actual product rule)",
            "Self-exclusion applied while a session is already active — the session's further gambling actions are blocked immediately",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Behavior depends on the system and jurisdiction",
          body: [
            "Whether withdrawals remain available, how long an exclusion lasts, and whether it can be reversed early are all product/policy decisions that vary. QA's job is to verify the platform enforces whatever the actual policy says — consistently, everywhere — not to assume a universal rule.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Testing self-exclusion only through the UI",
          body: "If the enforcement lives in a UI guard rather than the API/service layer, a direct API call proves the real gap immediately.",
        },
        {
          title: "Never testing the mid-session case",
          body: "This is the scenario most likely to be missed in implementation and the one most worth a dedicated test.",
        },
      ],
      keyTakeaways: [
        "Self-exclusion must be enforced across login, betting, casino, deposits and marketing — partial enforcement is a real defect, not a minor gap.",
        "Always test enforcement at the API layer directly, not only through the UI.",
        "Self-exclusion applied mid-session must take effect immediately, not only on the next login.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A self-excluded player's session was already active when the exclusion was applied. What should a thorough test verify?",
          options: [
            { id: "a", text: "That the exclusion only applies after the current session ends" },
            { id: "b", text: "That gambling actions in the already-active session are blocked immediately" },
            { id: "c", text: "Nothing — this case is out of scope" },
            { id: "d", text: "That the player is charged a fee" },
          ],
          correct: "b",
          explanation: "A protection control that only applies on the next login leaves an active session as a real gap during exactly the time the player asked to be protected.",
        },
      ],
      challenges: ["ig-ch-self-exclusion"],
    },

    {
      id: "ig-risk-fraud",
      slug: "risk-and-fraud-testing",
      title: "Risk & Fraud Testing",
      moduleId: "igaming-qa",
      summary: "Testing risk-engine integration from a QA perspective, without designing or bypassing fraud controls.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Describe the QA-relevant surface of a risk engine integration",
        "Test risk-engine failure modes as first-class scenarios",
        "Distinguish 'QA verifies the control exists and functions' from 'QA designs fraud rules'",
      ],
      sections: [
        {
          kind: "callout",
          tone: "info",
          title: "Scope of this lesson",
          body: [
            "This lesson covers how QA verifies that risk/fraud controls integrate correctly with the rest of the platform — not how to design fraud-detection rules, and not techniques for evading them. Those are risk/fraud-analyst and security disciplines, not QA test design.",
          ],
        },
        {
          kind: "list",
          title: "QA-relevant scenarios",
          items: [
            "A transaction flagged high-risk is routed to manual review rather than auto-approved",
            "An account marked high-risk has the expected restrictions applied (e.g. withdrawal hold) consistently across surfaces",
            "A risk-engine timeout does not silently default to 'low risk'",
            "A risk-engine outage degrades safely (per policy — often meaning holds/reviews increase, not disappear)",
            "A blocked transaction is clearly reported to the player without leaking sensitive risk-scoring details",
            "Unusual betting behavior (e.g. an anomalous stake pattern in the test dataset) is visible to whatever monitoring/reporting surface consumes it",
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Fail-open risk engines are a recurring defect class",
          body: [
            "The same fail-open/fail-closed principle from the KYC and geolocation lessons applies here with higher stakes: if the risk engine is unreachable, financial transactions should not proceed as though everything scored perfectly safe.",
          ],
        },
        {
          kind: "table",
          title: "QA's actual job here",
          headers: ["QA does", "QA does not do"],
          rows: [
            ["Verify a flagged transaction is held/reviewed as designed", "Design what should trigger a flag"],
            ["Verify a risk-engine outage fails safely", "Reverse-engineer fraud thresholds"],
            ["Verify blocked-transaction messaging doesn't leak internals", "Attempt to launder a transaction past the risk engine as a 'test'"],
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Treating risk-engine testing as fraud-technique testing",
          body: "The QA scope is verifying the integration behaves correctly, not probing for ways to defeat fraud controls.",
        },
        {
          title: "Not testing the risk-engine-unavailable path",
          body: "Like KYC and geolocation, an unreachable risk engine is a routine production event that needs a defined, tested, fail-safe behavior.",
        },
      ],
      keyTakeaways: [
        "QA verifies risk/fraud controls integrate and fail safely — it does not design detection rules or evasion techniques.",
        "Risk-engine timeouts and outages should never silently resolve to 'safe'.",
        "Flagged-transaction handling (hold/review) and consistent restriction application are the core things to verify.",
      ],
      quiz: [
        {
          id: "q1",
          type: "true-false",
          prompt: "Part of iGaming QA's job is to test techniques for evading the platform's fraud controls.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation: "QA verifies the fraud-control integration behaves correctly and fails safely — that is a different job from probing for evasion techniques.",
        },
      ],
    },

    {
      id: "ig-api-testing",
      slug: "api-testing-for-igaming",
      title: "API Testing for iGaming",
      moduleId: "igaming-qa",
      summary: "Applying Playwright API testing to a set of fictional iGaming endpoints.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "Write Playwright API tests against fictional iGaming endpoints",
        "Assert on status codes, response shape and domain-specific error semantics",
        "Combine API setup with UI verification for hybrid tests",
      ],
      sections: [
        {
          kind: "callout",
          tone: "info",
          title: "These endpoints are fictional and educational",
          body: [
            "The endpoints in this lesson (`/players`, `/kyc/verify`, `/wallet/deposit`, `/bets`, etc.) are illustrative examples for practicing API test design, matching the shape of the small practice app in this track. They are not a specification of any real platform's API.",
          ],
        },
        {
          kind: "table",
          title: "Example endpoint surface",
          headers: ["Endpoint", "Purpose"],
          rows: [
            ["POST /players", "Register a new player"],
            ["POST /login", "Authenticate a player"],
            ["POST /kyc/verify", "Submit identity for verification"],
            ["POST /wallet/deposit", "Deposit funds"],
            ["POST /wallet/withdraw", "Withdraw funds"],
            ["POST /bets", "Place a bet"],
            ["POST /bets/{id}/settle", "Settle a bet"],
            ["GET /wallet", "Get current balances"],
            ["GET /transactions", "Get transaction history"],
            ["POST /responsible-gambling/limits", "Set a deposit/loss/wager limit"],
            ["POST /self-exclusion", "Self-exclude the account"],
          ],
        },
        {
          kind: "code",
          title: "Placing a bet and verifying it end to end via API",
          language: "ts",
          code: `
test('a valid bet debits the wallet and appears in history', async ({ request }) => {
  const before = await (await request.get('/api/igaming/wallet')).json();

  const placed = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-fixture-1', selection: 'home', stake: 25 },
  });
  expect(placed.status()).toBe(201);
  const bet = await placed.json();
  expect(bet).toMatchObject({ status: 'accepted', stake: 25 });

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.balance).toBeCloseTo(before.balance - 25, 2);

  const history = await (await request.get('/api/igaming/transactions')).json();
  expect(history.transactions).toContainEqual(
    expect.objectContaining({ type: 'bet_stake', amount: -25 }),
  );
});
`,
        },
        {
          kind: "code",
          title: "Asserting a domain-specific rejection",
          language: "ts",
          code: `
test('a stake below market minimum is rejected', async ({ request }) => {
  const res = await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-fixture-1', selection: 'home', stake: 0.10 },
  });

  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(body.error).toMatch(/minimum stake/i);
});
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Hybrid tests are especially valuable here",
          body: [
            "Placing a bet via the API and then confirming it renders correctly in the transaction-history UI catches a class of bug pure-UI or pure-API tests each miss individually: a correct backend with a broken read path, or a correct UI fed convincingly-wrong data.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Only asserting status codes",
          body: "A 201 with the wrong body, or a 422 with a misleading error message, both pass a status-only assertion while still being wrong.",
        },
        {
          title: "Not asserting the side effects (wallet, ledger, history) alongside the API response",
          body: "The response body proves the request was accepted; it does not by itself prove the platform's state changed correctly.",
        },
      ],
      keyTakeaways: [
        "API tests for financial endpoints should assert both the response and the resulting state (wallet, ledger, history).",
        "Domain-specific rejections (stake too low, insufficient balance) deserve their own explicit test cases with message assertions.",
        "Hybrid API+UI tests catch defects that single-layer tests miss.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why does the bet-placement test in this lesson also check GET /wallet and GET /transactions?",
          options: [
            { id: "a", text: "To make the test slower on purpose" },
            { id: "b", text: "Because the POST /bets response alone doesn't prove the wallet and ledger actually updated" },
            { id: "c", text: "Because /bets always returns an empty body" },
            { id: "d", text: "It's unnecessary — the 201 status is sufficient proof" },
          ],
          correct: "b",
          explanation: "A successful response proves the request was accepted; the side-effect checks prove the platform's state actually changed as a result.",
        },
      ],
      challenges: ["ig-ch-wallet-api", "ig-ch-kyc-response"],
    },

    {
      id: "ig-database-ledger",
      slug: "database-and-ledger-validation",
      title: "Database & Ledger Validation",
      moduleId: "igaming-qa",
      summary: "Using SQL to validate what the UI and API cannot show you: whether the data is actually consistent.",
      difficulty: "advanced",
      estimatedTime: 18,
      objectives: [
        "Read the representative iGaming schema used in this track's SQL Lab",
        "Write reconciliation queries across bets, settlements and the ledger",
        "Explain why database validation is a distinct QA layer from UI and API testing",
      ],
      sections: [
        {
          kind: "diagram",
          title: "A representative iGaming schema",
          ascii: `players ──┬──< wallets
          ├──< kyc_verifications
          ├──< responsible_gambling_limits
          ├──< self_exclusions
          ├──< risk_assessments
          └──< bets ──< bet_settlements
                 │
wallets ──< transactions
                 │
games ──< game_sessions

audit_logs (cross-cutting, references most tables)`,
          caption: "13 tables, seeded with small, fixed, deliberately-inconsistent data for practice queries.",
        },
        {
          kind: "code",
          title: "Bets that were never settled",
          language: "sql",
          code: `
SELECT b.id, b.player_id, b.placed_at
FROM bets b
LEFT JOIN bet_settlements s ON s.bet_id = b.id
WHERE b.status = 'accepted'
  AND s.id IS NULL
  AND b.placed_at < NOW() - INTERVAL '1 day';
`,
          caption: "A bet accepted more than a day ago with no settlement row is very likely stuck.",
        },
        {
          kind: "code",
          title: "Settled bets with no matching ledger entry",
          language: "sql",
          code: `
SELECT s.bet_id, s.result, s.payout
FROM bet_settlements s
LEFT JOIN transactions t
  ON t.reference_id = s.bet_id AND t.type = 'bet_payout'
WHERE s.result = 'won'
  AND s.payout > 0
  AND t.id IS NULL;
`,
          caption: "A won bet with a payout but no corresponding ledger transaction — the wallet may never have actually been credited.",
        },
        {
          kind: "code",
          title: "Self-excluded players with an active bet",
          language: "sql",
          code: `
SELECT e.player_id, b.id AS bet_id, b.placed_at
FROM self_exclusions e
JOIN bets b ON b.player_id = e.player_id
WHERE e.active = true
  AND b.placed_at > e.excluded_at;
`,
          caption: "Every row here is a self-exclusion control that did not hold — see the Self-Exclusion lesson.",
        },
        {
          kind: "text",
          title: "Why this is a distinct validation layer",
          body: [
            "A UI showing 'Bet settled' and an API returning 200 both describe what the platform presented. Only the database shows what was actually persisted and whether every system's record of an event agrees. This lesson's queries are the concrete implementation of the 'prove the whole flow' idea introduced in the very first architecture lesson.",
          ],
        },
        {
          kind: "practice",
          href: "/practice/igaming-sql",
          title: "Open the iGaming SQL Lab",
          body: "A second, separate in-browser SQL environment — the existing SQL Lab and its ShopEasy dataset are untouched — with a 13-table iGaming schema and dedicated reconciliation exercises.",
        },
      ],
      commonMistakes: [
        {
          title: "Trusting the API response as proof of persistence",
          body: "A 200 OK proves the server accepted the request and formed a response; only a database check proves the write actually landed and is internally consistent.",
        },
        {
          title: "Writing a query that finds the problem but not the count",
          body: "A QA-quality reconciliation query returns every violating row, not just confirms 'yes, some exist' — the count and examples are what make a bug report actionable.",
        },
      ],
      keyTakeaways: [
        "Database validation checks whether the platform's own systems agree with each other, which neither UI nor API tests alone can prove.",
        "LEFT JOIN ... IS NULL is the standard idiom for 'this should exist but doesn't' (missing settlement, missing ledger entry).",
        "A settled bet, a wallet update, and a ledger transaction are three separate facts that a correct platform keeps in agreement.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which of these can only be discovered by querying the database, not the API or UI?",
          options: [
            { id: "a", text: "Whether the confirmation screen rendered" },
            { id: "b", text: "Whether a won bet's payout has a matching ledger transaction" },
            { id: "c", text: "Whether the API returned a 200 status" },
            { id: "d", text: "Whether the button was clickable" },
          ],
          correct: "b",
          explanation: "The API and UI can both report success without the underlying ledger entry actually existing — only a direct data check proves it.",
        },
      ],
      sqlExercises: [
        "ig-sql-bets-without-settlement",
        "ig-sql-settled-without-ledger",
        "ig-sql-self-excluded-active-bets",
      ],
      challenges: ["ig-ch-ledger-mismatch"],
    },

    {
      id: "ig-events",
      slug: "events-and-message-flows",
      title: "Events & Message Flows",
      moduleId: "igaming-qa",
      summary: "Why event/message validation is its own QA layer, and what to check when a flow depends on one.",
      difficulty: "advanced",
      estimatedTime: 13,
      objectives: [
        "Explain what a domain event is and why other services depend on it",
        "List the events a typical iGaming flow should publish",
        "Design a test that verifies an event was published, not just that a screen rendered",
      ],
      sections: [
        {
          kind: "text",
          title: "A screen can be right while an event never fires",
          body: [
            "Many gambling-platform flows are event-driven under the hood: a bet placed event triggers risk scoring, a deposit completed event triggers bonus eligibility checks, a bet settled event triggers notifications and reporting. The player-facing screen can render a perfectly correct success message even if the event that downstream systems depend on was never published — because the screen and the event are two separate outputs of the same action.",
          ],
        },
        {
          kind: "list",
          title: "Representative events in this domain",
          items: [
            "player.registered",
            "kyc.verified / kyc.rejected",
            "deposit.completed",
            "withdrawal.completed",
            "bet.placed",
            "bet.settled",
            "bonus.activated / bonus.completed",
            "self_exclusion.activated",
          ],
        },
        {
          kind: "table",
          title: "What can go wrong with an event",
          headers: ["Failure", "Downstream consequence"],
          rows: [
            ["Event never published", "Dependent systems (risk, notifications, bonus engine) never react"],
            ["Event published twice", "Dependent systems may double-process (e.g. double-apply a bonus)"],
            ["Event published with stale/wrong data", "Downstream decisions are made on incorrect information"],
            ["Event published out of order", "A consumer that assumes ordering (e.g. settled-before-placed) misbehaves"],
          ],
        },
        {
          kind: "code",
          title: "Testing that an action published its event (illustrative pattern)",
          language: "ts",
          code: `
test('placing a bet publishes exactly one bet.placed event', async ({ request }) => {
  await request.post('/api/igaming/events/reset-test-log');

  await request.post('/api/igaming/bets', {
    data: { marketId: 'mkt-fixture-1', selection: 'home', stake: 10 },
  });

  const log = await (await request.get('/api/igaming/events/test-log')).json();
  const betPlacedEvents = log.events.filter((e: { type: string }) => e.type === 'bet.placed');
  expect(betPlacedEvents).toHaveLength(1);
});
`,
          caption: "A real platform would assert against its actual message bus/consumer; the pattern — reset, act, assert exactly one event — is what transfers.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The teaching point, restated",
          body: [
            "'The UI said it worked' and 'the event fired' are independent claims. This is the same lesson as settlement and deposit validation, applied to the messaging layer instead of the wallet — verify the thing the rest of the system actually depends on, not just the thing the player sees.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Assuming a working UI implies a working event pipeline",
          body: "They are built and can fail independently. A UI can be entirely decoupled from whether its action published anything downstream systems can consume.",
        },
        {
          title: "Never testing for duplicate events",
          body: "An event published twice for one action is as real a defect class as a duplicate deposit — it just shows up in a different system.",
        },
      ],
      keyTakeaways: [
        "A domain event is a separate output from the same action that renders a UI screen, and can fail independently of it.",
        "Missing, duplicate, stale, or out-of-order events each have distinct downstream consequences worth testing for.",
        "The core pattern — reset the observable log, act, assert exactly one correctly-shaped event — transfers to real message-bus testing.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "A bet-placement UI shows a correct success message. What does this alone prove about the bet.placed event?",
          options: [
            { id: "a", text: "That it was published exactly once" },
            { id: "b", text: "Nothing — the UI and the event are independent outputs of the same action" },
            { id: "c", text: "That it was published at least twice" },
            { id: "d", text: "That downstream risk scoring has already completed" },
          ],
          correct: "b",
          explanation: "A correct UI response does not by itself confirm anything about whether, or how many times, the corresponding domain event was published.",
        },
      ],
    },

    {
      id: "ig-concurrency",
      slug: "concurrency-and-race-conditions",
      title: "Concurrency & Race Conditions",
      moduleId: "igaming-qa",
      summary: "The single most important technical skill in this track: proving money can't be spent twice.",
      difficulty: "advanced",
      estimatedTime: 18,
      objectives: [
        "Explain why race conditions are a financial-integrity issue in this domain, not just a performance issue",
        "Design and reason about a concurrent-request test",
        "Name the mitigations (locking, atomic updates) at a conceptual level, without needing to implement a database engine",
      ],
      sections: [
        {
          kind: "text",
          title: "The canonical example",
          body: [
            "A player has a $100 balance. Two requests arrive at nearly the same instant: Request A stakes $80, Request B stakes $80. If both requests read the $100 balance before either writes back its debit, both can be accepted — and the platform has just allowed $160 of bets against $100 of funds. This is not a hypothetical; it is the default behavior of any system that reads-then-writes a balance without protecting the sequence.",
          ],
        },
        {
          kind: "diagram",
          title: "How the race happens",
          ascii: `Time  Request A               Request B
 t0    read balance = 100
 t1                            read balance = 100
 t2    write balance = 20  (100 - 80)
 t3                            write balance = 20  (100 - 80)

Result: balance = 20, but $160 was staked against $100.`,
        },
        {
          kind: "list",
          title: "Concurrency scenarios worth testing (fake currency only)",
          items: [
            "Two simultaneous bets that together exceed the available balance",
            "Two simultaneous withdrawal requests for the full balance",
            "A duplicate deposit callback delivered concurrently with a withdrawal",
            "A duplicate settlement callback delivered concurrently with a fresh settlement attempt",
            "Double-clicking 'Place Bet' (the UI-level version of the same race)",
            "Simultaneous bonus activation from two requests",
            "Self-exclusion applied at the same moment as an in-flight bet placement",
          ],
        },
        {
          kind: "code",
          title: "Testing the race directly (illustrative pattern)",
          language: "ts",
          code: `
test('two simultaneous bets cannot both spend the same balance', async ({ request }) => {
  // Starting balance is fixed at 100 in the practice fixture.
  const [a, b] = await Promise.all([
    request.post('/api/igaming/bets', { data: { marketId: 'mkt-fixture-1', selection: 'home', stake: 80 } }),
    request.post('/api/igaming/bets', { data: { marketId: 'mkt-fixture-1', selection: 'away', stake: 80 } }),
  ]);

  const statuses = [a.status(), b.status()].sort();
  // Exactly one bet is accepted (201); the other is rejected for insufficient balance (422).
  expect(statuses).toEqual([201, 422]);

  const wallet = await (await request.get('/api/igaming/wallet')).json();
  expect(wallet.balance).toBeGreaterThanOrEqual(0);
});
`,
          caption: "Firing both requests via Promise.all is what actually exercises the race, instead of testing them sequentially.",
        },
        {
          kind: "callout",
          tone: "danger",
          title: "A sequential test proves nothing about this bug class",
          body: [
            "Placing bet A, waiting for its response, then placing bet B, never exercises the race — the two requests never actually overlap. If a race-condition test in your suite awaits each request before sending the next, it is not testing concurrency at all.",
          ],
        },
        {
          kind: "text",
          title: "Mitigations, conceptually",
          body: [
            "Platforms typically prevent this with either optimistic locking (each balance read carries a version; a write only succeeds if the version hasn't changed, otherwise it retries or fails) or pessimistic locking (the balance row is locked for the duration of the read-modify-write), or by making the debit itself an atomic database operation (e.g. an atomic conditional decrement that fails outright if it would go negative, rather than a separate read-then-write). QA does not need to implement any of these — QA needs to prove, empirically, that whichever one is in place actually holds under concurrent load.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Writing 'concurrency tests' that run requests sequentially",
          body: "Sequential awaits never create the overlapping read-then-write window a race condition depends on. Use Promise.all (or equivalent) to actually send requests concurrently.",
        },
        {
          title: "Testing with a balance so large the race can't manifest",
          body: "Two $80 bets against a $10,000 balance will both legitimately succeed. The test needs a balance where the race matters — stakes that together exceed it.",
        },
        {
          title: "Treating a passing concurrency test once as proof",
          body: "Races are timing-dependent; a single green run is weaker evidence than it looks. Running the same concurrent scenario repeatedly (or under load) gives much more confidence.",
        },
      ],
      keyTakeaways: [
        "A race condition here means real money (or fake money standing in for it) potentially spent twice — a financial-integrity bug, not a performance quirk.",
        "Concurrency tests must actually send requests concurrently (e.g. Promise.all), or they don't test the race at all.",
        "The test should assert on the outcome invariant (balance never goes negative, exactly one of two conflicting requests succeeds) rather than which specific request won.",
        "Locking and atomic-update strategies are implementation details; QA's job is to prove the invariant holds under real concurrency, regardless of which one is used.",
      ],
      quiz: [
        {
          id: "q1",
          type: "find-the-bug",
          prompt:
            "A 'race condition test' places bet A, awaits the response, then places bet B, and asserts both succeed with a total stake under the balance. What's wrong with this as a concurrency test?",
          options: [
            { id: "a", text: "Nothing, this correctly tests for a race condition" },
            { id: "b", text: "The two requests never overlap, so the read-then-write race is never actually exercised" },
            { id: "c", text: "It should use three bets instead of two" },
            { id: "d", text: "It should not check the balance at all" },
          ],
          correct: "b",
          explanation:
            "Sequential requests, even ones that happen quickly, give the second request a balance the first has already updated — the race can only occur when both reads happen before either write.",
        },
        {
          id: "q2",
          type: "predict-result",
          prompt:
            "Two $80 bet requests are sent concurrently via Promise.all against a $100 balance on a correctly-implemented system. What should the test observe?",
          options: [
            { id: "a", text: "Both requests succeed" },
            { id: "b", text: "Exactly one request succeeds; the other is rejected for insufficient balance, and the final balance never goes negative" },
            { id: "c", text: "Both requests fail" },
            { id: "d", text: "The server crashes" },
          ],
          correct: "b",
          explanation: "A correctly-implemented system serializes the conflicting debit so only one can succeed against the shared balance, regardless of arrival order.",
        },
      ],
      challenges: ["ig-ch-race-condition"],
      playground: [],
    },

    {
      id: "ig-idempotency",
      slug: "idempotency-and-duplicate-transactions",
      title: "Idempotency & Duplicate Transactions",
      moduleId: "igaming-qa",
      summary: "How platforms make retries safe, and how QA proves it — the direct fix for the concurrency lesson's problem.",
      difficulty: "advanced",
      estimatedTime: 15,
      objectives: [
        "Define idempotency in terms QA can directly test",
        "Design a duplicate-request test using an idempotency key",
        "Connect idempotency to the deposit, settlement and bonus-activation scenarios from earlier lessons",
      ],
      sections: [
        {
          kind: "text",
          title: "Idempotency is the concurrency lesson's actual fix",
          body: [
            "Where the previous lesson proved a race condition can duplicate an effect, this one covers the standard fix: making the operation idempotent, so that performing it more than once with the same identifying key has exactly the same effect as performing it once. This is how payment callbacks, settlement retries, and duplicate submissions are made safe.",
          ],
        },
        {
          kind: "list",
          title: "Where idempotency matters in this domain",
          items: [
            "Payment provider callbacks (deposits/withdrawals) — providers retry on timeout by design",
            "Bet settlement — a settlement job may be retried after a crash",
            "Bonus activation — a duplicate click or retried request should not grant the bonus twice",
            "Bet placement — a double-click on 'Place Bet' should not place two bets",
          ],
        },
        {
          kind: "code",
          title: "The pattern: a client-supplied idempotency key",
          language: "ts",
          code: `
// First deposit: applied, ledger entry created
await request.post('/api/igaming/wallet/deposit', {
  data: { amount: 50, idempotencyKey: 'dep-abc123' },
});

// Same key, submitted again (simulating a retried callback or a double-click):
// no second ledger entry, no second credit — same response as the first.
const retry = await request.post('/api/igaming/wallet/deposit', {
  data: { amount: 50, idempotencyKey: 'dep-abc123' },
});
`,
        },
        {
          kind: "code",
          title: "Testing idempotency directly",
          language: "ts",
          code: `
test('a duplicate deposit with the same idempotency key is applied once', async ({ request }) => {
  const before = await (await request.get('/api/igaming/wallet')).json();
  const key = \`dep-\${Date.now()}\`;

  await request.post('/api/igaming/wallet/deposit', { data: { amount: 50, idempotencyKey: key } });
  await request.post('/api/igaming/wallet/deposit', { data: { amount: 50, idempotencyKey: key } });

  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.balance).toBeCloseTo(before.balance + 50, 2); // +50, not +100

  const history = await (await request.get('/api/igaming/transactions')).json();
  const matching = history.transactions.filter(
    (t: { idempotencyKey?: string }) => t.idempotencyKey === key,
  );
  expect(matching).toHaveLength(1);
});
`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Eventual consistency, briefly",
          body: [
            "Some systems apply an idempotent write asynchronously — the second request might return immediately while the first is still being processed. QA in that setting needs to allow for eventual consistency (poll/retry the assertion briefly) rather than asserting instantaneously, without weakening what's actually being proven: one effect, however many requests arrived.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Testing idempotency by only checking the second response's status code",
          body: "A 200 on the retry proves the endpoint didn't error — it doesn't prove the balance wasn't credited twice. Check the resulting state, as in the example above.",
        },
        {
          title: "Reusing a fresh idempotency key on every 'duplicate' test request",
          body: "That's just two different, legitimately separate deposits. The key must be identical across both calls for this to test the right thing.",
        },
      ],
      keyTakeaways: [
        "Idempotency means repeating an operation with the same key has the same effect as doing it once.",
        "A correct idempotency test asserts on resulting state (balance, transaction count), not just response status codes.",
        "This lesson is the direct fix for the previous one's race condition — asserting one effect from many attempts, not zero races ever occurring.",
      ],
      quiz: [
        {
          id: "q1",
          type: "code-interpretation",
          prompt:
            "In the deposit test above, why does the assertion check `history.transactions.filter(...).length === 1` in addition to the balance?",
          options: [
            { id: "a", text: "It's redundant with the balance check and adds no value" },
            { id: "b", text: "It directly proves only one ledger entry was created, which the balance alone could theoretically mask (e.g. an offsetting error)" },
            { id: "c", text: "To test API pagination" },
            { id: "d", text: "Because balances cannot be trusted at all" },
          ],
          correct: "b",
          explanation:
            "Checking the ledger directly, not just the derived balance, is the same principle as the wallet-reconciliation lesson: verify the record, not only the number it produces.",
        },
      ],
      challenges: ["ig-ch-duplicate-transaction"],
    },

    {
      id: "ig-e2e",
      slug: "end-to-end-igaming-testing",
      title: "End-to-End iGaming Testing",
      moduleId: "igaming-qa",
      summary:
        "The core idea of this entire track, stated directly: a UI success message is a claim, and QA's job is to verify the claim.",
      difficulty: "advanced",
      estimatedTime: 16,
      objectives: [
        "State precisely what a 'Bet placed successfully' screen does and does not prove",
        "Design a genuinely end-to-end test across UI, API, database, ledger and event layers",
        "Explain why layered validation is a test-design decision, not just 'more testing'",
      ],
      sections: [
        {
          kind: "callout",
          tone: "danger",
          title: "The single most important idea in this track",
          body: [
            "A UI test that shows 'Bet placed successfully' proves the front end rendered a success state. It does NOT, by itself, prove: the wallet balance was correctly reduced; the bet was persisted; a transaction was created; an event was published; settlement can occur later; or that a duplicate submission is prevented. Every one of those is a separate claim, and every one needs its own check.",
          ],
        },
        {
          kind: "table",
          title: "One user action, six separate claims",
          headers: ["Claim", "How it's actually verified"],
          rows: [
            ["The UI rendered success", "UI assertion — `expect(page.getByText('Bet placed')).toBeVisible()`"],
            ["The bet was persisted", "API/database check — `GET /bets/{id}` or a direct query"],
            ["The wallet was debited", "API check — `GET /wallet` balance before/after"],
            ["A ledger transaction exists", "Database check — a matching `transactions` row"],
            ["An event was published", "Event/message-log check (see the Events lesson)"],
            ["A duplicate submission is blocked", "A second, identical request is rejected or de-duplicated"],
          ],
        },
        {
          kind: "code",
          title: "A genuinely end-to-end bet-placement test",
          language: "ts",
          code: `
test('placing a bet is correct across every layer', async ({ page, request }) => {
  const before = await (await request.get('/api/igaming/wallet')).json();

  await page.goto('/practice/igaming');
  await page.getByLabel('Stake').fill('25');
  await page.getByRole('button', { name: 'Place bet' }).click();

  // 1. UI claim
  await expect(page.getByText('Bet placed')).toBeVisible();

  // 2. Persistence + wallet claim
  const after = await (await request.get('/api/igaming/wallet')).json();
  expect(after.balance).toBeCloseTo(before.balance - 25, 2);

  // 3. Ledger claim
  const history = await (await request.get('/api/igaming/transactions')).json();
  expect(history.transactions[0]).toMatchObject({ type: 'bet_stake', amount: -25 });

  // 4. Duplicate-submission claim
  await page.getByRole('button', { name: 'Place bet' }).click();
  const final = await (await request.get('/api/igaming/wallet')).json();
  expect(final.balance).toBe(after.balance); // second click did not stake again
});
`,
        },
        {
          kind: "text",
          title: "This is a strategy decision, not a completeness checklist",
          body: [
            "Not every test needs to check all six layers every time — that would be slow and redundant. The skill this lesson teaches is deciding, per flow, which layers actually carry risk for that specific flow, and putting the cheapest reliable check at each layer that matters, rather than defaulting to UI-only coverage everywhere or exhaustive six-layer checks everywhere.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Equating 'end-to-end' with 'through the UI'",
          body: "A true end-to-end test proves the whole business flow is correct — UI, API, data and events — not merely that it can be driven from a browser.",
        },
        {
          title: "Checking every layer on every test regardless of risk",
          body: "The goal is targeted, risk-based layering (see the next lesson), not maximal redundant assertion on every scenario.",
        },
      ],
      keyTakeaways: [
        "'Bet placed successfully' is a UI claim only; wallet, persistence, ledger, event and duplicate-prevention are separate claims needing separate verification.",
        "A genuinely end-to-end test checks the layers that carry real risk for that specific flow.",
        "This idea — verify the claim, not just the message — is the thread connecting every lesson in this track.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Which of the following does a passing 'Bet placed successfully' UI test NOT prove on its own?",
          options: [
            { id: "a", text: "That the button was clicked" },
            { id: "b", text: "That the success text rendered" },
            { id: "c", text: "That the wallet was actually debited and a ledger transaction exists" },
            { id: "d", text: "That the test ran" },
          ],
          correct: "c",
          explanation: "Wallet debit and ledger persistence are separate backend claims that a UI-only test never actually exercises.",
        },
      ],
      challenges: ["ig-ch-layer-design"],
    },

    {
      id: "ig-risk-based-strategy",
      slug: "risk-based-test-strategy",
      title: "Risk-Based Test Strategy",
      moduleId: "igaming-qa",
      summary: "Deciding what deserves the heaviest testing on a platform where not everything can be tested equally.",
      difficulty: "advanced",
      estimatedTime: 14,
      objectives: [
        "Rank iGaming flows by risk using impact and likelihood",
        "Justify automation investment decisions using that ranking",
        "Apply risk-based thinking to a regression suite, not just to new features",
      ],
      sections: [
        {
          kind: "text",
          title: "Not all bugs are equal, and testing time is finite",
          body: [
            "A typo in a footer link and a duplicate-settlement bug that double-pays winning bets are both 'bugs', but they do not deserve the same testing investment. Risk-based testing is the discipline of allocating limited QA time toward the flows where a defect would be most damaging and most likely to occur — explicitly, not by instinct alone.",
          ],
        },
        {
          kind: "table",
          title: "A simple impact × likelihood view of this track's flows",
          headers: ["Flow", "Impact if broken", "Typical likelihood", "Priority"],
          rows: [
            ["Wallet debit/credit correctness", "Severe (financial loss, regulatory)", "Moderate (concurrency-prone)", "Highest"],
            ["Bet settlement idempotency", "Severe (double payout)", "Moderate (retry-prone)", "Highest"],
            ["Self-exclusion enforcement", "Severe (compliance, harm)", "Low-moderate", "Highest"],
            ["Deposit limit enforcement", "High (compliance)", "Low-moderate", "High"],
            ["Bonus wagering calculation", "Moderate (financial, player trust)", "Moderate", "Medium-High"],
            ["Casino lobby filtering", "Low (UX)", "Low", "Lower"],
            ["Cosmetic UI copy", "Very low", "Low", "Lowest"],
          ],
        },
        {
          kind: "list",
          title: "What risk-based thinking changes in practice",
          items: [
            "Automate the flows in the top rows deeply, across UI, API, DB and concurrency layers",
            "Automate lower-risk flows more thinly (smoke-level UI coverage is often enough)",
            "Prioritize regression coverage for areas with a history of incidents, not just areas that are easy to automate",
            "Revisit the ranking when the product changes — a newly-launched bonus type raises that row's likelihood",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Risk-based ≠ skipping low-risk areas entirely",
          body: [
            "Low-risk flows still get tested — just proportionally. The point is deliberate allocation, not neglect.",
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Equal automation depth for every feature regardless of financial/compliance stakes",
          body: "This spreads finite QA capacity thin exactly where a gap is most expensive.",
        },
        {
          title: "Ranking by ease of automation instead of by risk",
          body: "The easiest flow to automate and the riskiest flow to leave under-tested are rarely the same flow.",
        },
      ],
      keyTakeaways: [
        "Risk-based testing allocates QA investment by impact × likelihood, not by instinct or convenience.",
        "In iGaming, wallet correctness, settlement idempotency and self-exclusion enforcement are consistently top-priority flows.",
        "The ranking should be revisited as the product changes, not set once and forgotten.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Why do wallet correctness and settlement idempotency typically rank as the highest-priority flows to test on a gambling platform?",
          options: [
            { id: "a", text: "They are the easiest flows to automate" },
            { id: "b", text: "Their failure impact is severe (financial and regulatory) and their likelihood is elevated by concurrency and retries" },
            { id: "c", text: "They change more often than any other feature" },
            { id: "d", text: "They have no dependencies on other systems" },
          ],
          correct: "b",
          explanation: "Risk-based prioritization combines how bad a failure would be with how likely it is — both factors are high for money-moving, retry-prone flows.",
        },
      ],
    },

    {
      id: "ig-qa-lead",
      slug: "qa-engineering-lead-perspective",
      title: "QA Engineering Lead Perspective",
      moduleId: "igaming-qa",
      summary: "Closing the track from a leadership vantage point: strategy, gates, and a model answer to the defining interview question.",
      difficulty: "expert",
      estimatedTime: 20,
      objectives: [
        "Frame automation decisions as leadership decisions, not just technical ones",
        "Describe quality gates and release-readiness criteria for a gambling platform",
        "Produce a structured, senior-level answer to 'design a QA strategy for this platform'",
      ],
      sections: [
        {
          kind: "list",
          title: "What a QA Engineering Lead owns, beyond individual tests",
          items: [
            "Deciding what to automate, and just as importantly, what not to",
            "Shaping the test pyramid so it reflects this platform's actual risk profile",
            "Identifying and protecting the critical path (registration → KYC → deposit → bet → settlement → withdrawal)",
            "Defining quality gates that block a release, and what evidence satisfies them",
            "Managing flaky tests as a trust problem, not just a maintenance chore",
            "Owning CI/CD test placement — what runs on every PR vs. nightly vs. pre-release",
            "Tracking defect leakage (bugs that escaped to production) as the primary signal of suite effectiveness",
            "Reasoning about coverage in terms of risk covered, not line-count or test-count",
            "Defining what 'release ready' actually means for this product",
            "Being the calm, structured voice during a live production incident",
            "Representing QA in cross-team conversations with product, compliance and engineering",
          ],
        },
        {
          kind: "table",
          title: "A representative test pyramid for this platform",
          headers: ["Layer", "What it covers", "Relative volume"],
          rows: [
            ["Unit", "Ledger arithmetic, wagering-requirement calculation, odds/payout math", "Largest"],
            ["API/integration", "Wallet, bet, settlement, KYC, geolocation endpoints; concurrency scenarios", "Substantial"],
            ["Database validation", "Reconciliation queries, orphan/mismatch detection", "Targeted, scheduled"],
            ["E2E (UI+API hybrid)", "Critical path flows only: registration, deposit, bet, settlement, withdrawal", "Smallest, highest-value"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Quality gates worth defining explicitly",
          body: [
            "Examples: no release without the wallet-reconciliation suite green; no release with an open critical/high defect on the settlement or self-exclusion flows; concurrency tests for any change touching balance mutation; a rollback plan documented for any change to the payment or settlement path.",
          ],
        },
        {
          kind: "text",
          title: "Flaky tests are a trust problem",
          body: [
            "A flaky test on a wallet or settlement suite is worse than no test at all, because a team that has learned to re-run and ignore red will eventually ignore a real failure in the same suite. Treat flake rate on financial-flow suites as an incident-worthy metric, not background noise.",
          ],
        },
        {
          kind: "steps",
          title: "Model answer: \"How would you design a QA strategy for an online gambling platform?\"",
          steps: [
            {
              title: "Start from risk, not from features",
              body: "Rank flows by financial and compliance impact × likelihood (wallet, settlement, self-exclusion, KYC/geolocation, RG limits at the top) before deciding what to automate.",
            },
            {
              title: "Layer validation deliberately",
              body: "For the top-ranked flows, cover unit (arithmetic), API/integration (endpoint behavior + concurrency), database (reconciliation), and a thin layer of true E2E across the critical path — not maximal coverage everywhere.",
            },
            {
              title: "Make financial-integrity checks non-negotiable gates",
              body: "Wallet reconciliation, settlement idempotency, and negative-balance prevention run on every relevant change and block release on failure — treat these the way a payments team treats their own suite.",
            },
            {
              title: "Test the controls that cost the business money",
              body: "Deposit limits, self-exclusion and RG controls get adversarial testing precisely because they're the features easiest to quietly under-test given they reduce short-term revenue.",
            },
            {
              title: "Build in observability for production",
              body: "Automated reconciliation and anomaly checks running against production data (read-only) catch the class of issue no pre-release suite ever will — data drift, edge cases from real traffic patterns.",
            },
            {
              title: "Close the loop with defect leakage",
              body: "Track what escaped to production and feed it back into the risk ranking and the regression suite — the suite should visibly improve after every real incident, not just grow in test count.",
            },
          ],
        },
      ],
      commonMistakes: [
        {
          title: "Answering the strategy question with a list of tools instead of a reasoning process",
          body: "A senior answer explains how priorities were decided, not just which frameworks are used.",
        },
        {
          title: "Treating 'more tests' as the same thing as 'better quality'",
          body: "A large, low-signal suite that nobody trusts is worse than a smaller, high-signal one that gates releases confidently.",
        },
      ],
      keyTakeaways: [
        "A QA Engineering Lead's core job is prioritization under constraint: risk-based automation decisions, not exhaustive coverage.",
        "Quality gates should be explicit and financial-integrity-focused for a platform like this one.",
        "Flaky tests on money-moving suites are a trust and safety issue, not just noise to tolerate.",
        "A senior strategy answer is structured around risk, layered validation, non-negotiable gates, and a feedback loop from production incidents.",
      ],
      quiz: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What most distinguishes a senior-level answer to 'design a QA strategy for this platform' from a junior one?",
          options: [
            { id: "a", text: "Naming more testing tools and frameworks" },
            { id: "b", text: "Explaining a risk-based reasoning process for what gets tested how deeply, and why" },
            { id: "c", text: "Promising 100% test coverage" },
            { id: "d", text: "Focusing exclusively on UI automation" },
          ],
          correct: "b",
          explanation: "Seniority in this answer is demonstrated by the reasoning behind prioritization, not by the size of the toolbox or coverage percentage claimed.",
        },
        {
          id: "q2",
          type: "true-false",
          prompt: "A test suite that grows in test count after every production incident is automatically a sign of a maturing QA strategy.",
          options: [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ],
          correct: "b",
          explanation: "What matters is whether the suite's risk coverage improved in response to what actually leaked — raw test count is a weak proxy for that.",
        },
      ],
    },
  ],
};

# Contributing

Thanks for taking a look. This is a personal project, but it is set up so that
adding content or fixing something is straightforward.

## Development setup

```bash
git clone <repository-url>
cd playwright-academy

npm install
npx playwright install
npm run dev
```

Everything runs locally with no configuration. There is no database and no
required environment variable.

## Checks

Run all four before opening a pull request:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # next build
npx playwright test  # the full suite (starts the dev server itself)
```

`npx playwright test --project=unit` runs just the simulator and SQL engine
tests, which take about two seconds and cover most engine changes.

## Branches and commits

- Branch from `main`: `feature/…`, `fix/…`, `content/…`, `docs/…`
- Write commit subjects in the imperative: *Add locator filtering lesson*, not
  *Added…*
- Keep a commit to one logical change; content and engine changes belong in
  separate commits.

---

## Adding a lesson

Lessons are data, not JSX. Add one to the relevant file in `content/modules/`:

```ts
{
  id: "loc-new-thing",
  slug: "new-thing",
  title: "The new thing",
  moduleId: "locators",
  summary: "One sentence that reads well on a card.",
  difficulty: "intermediate",
  estimatedTime: 12,
  objectives: ["…", "…", "…"],
  sections: [
    { kind: "text", title: "…", body: ["…"] },
    { kind: "code", language: "ts", code: "…", caption: "…" },
    { kind: "compare", bad: "…", good: "…", note: "…" },
    { kind: "callout", tone: "warning", body: ["…"] },
    { kind: "table", headers: ["…"], rows: [["…"]] },
    { kind: "diagram", ascii: "…" },
  ],
  commonMistakes: [{ title: "…", body: "…" }],
  keyTakeaways: ["…", "…"],
  quiz: [ /* … */ ],
}
```

The route, the curriculum listing, the search index and the progress totals all
pick it up automatically — there is nothing else to register.

Section kinds are defined in [`content/types.ts`](content/types.ts). Inside
`body` strings you can use `` `code` ``, `**bold**` and `*emphasis*`.

House style for content:

- Explain *why*, not just *what*. Every rule should come with the failure it
  prevents.
- Prefer a worked example from the practice apps over an invented one.
- `commonMistakes` should be mistakes people actually make.
- Every lesson gets at least one quiz question with a real explanation.

## Adding a quiz question

```ts
{
  id: "q1",
  type: "find-the-bug",         // or multiple-choice, true-false, best-locator…
  prompt: "Why does this fail intermittently?",
  code: "…",                    // optional
  options: [
    { id: "a", text: "…" },
    { id: "b", text: "…" },
  ],
  correct: "b",
  explanation: "Say why the right answer is right *and* why the tempting one is wrong.",
}
```

## Adding a playground scenario

Scenarios live in
[`lib/playwright-simulator/scenarios.ts`](lib/playwright-simulator/scenarios.ts):

```ts
{
  id: "my-scenario",
  group: "Locators",
  title: "…",
  difficulty: "intermediate",
  summary: "…",
  task: ["What the learner must achieve"],
  initialUrl: "/practice/shop",
  mode: "simulated",            // or "reference" if the simulator cannot run it
  challengeId: "ch-my-scenario",
  starterCode: "…",
  solution: "…",
  hints: ["Nudge", "Narrower nudge", "Almost the answer"],
  check: (result) => ({ passed: …, message: "…" }),
}
```

Every `mode: "simulated"` scenario's solution is executed by
`tests/unit/simulator.spec.ts`, so a scenario that does not actually pass will
fail CI. If the simulator cannot run the example, mark it `mode: "reference"` —
the UI then labels it clearly and does not pretend to execute it.

Hints must reveal progressively. The first should orient, the last may be almost
the answer, but none should be the answer.

## Adding a SQL exercise

Add it to [`content/sql-exercises.ts`](content/sql-exercises.ts). Solutions are
executed in `tests/unit/sql-engine.spec.ts`, and the lab checks a learner's
answer by comparing their result set against the solution's — so the solution
must run and must return at least one row.

If your exercise needs SQL the engine does not support, either simplify it or
extend the engine (`lib/sql-engine/`) and add unit tests for the new syntax.

## Extending the simulator

`lib/playwright-simulator/` is deliberately layered:

| File | Responsibility |
| --- | --- |
| `parser.ts` | Statements → chains of calls |
| `locator.ts` | Resolving `getBy*` / `locator` / `filter` / `nth` |
| `actions.ts` | click, fill, check, selectOption… → state transitions |
| `assertions.ts` | Matchers → pass/fail with expected vs. received |
| `runner.ts` | Orchestration, variables, the step log, error shaping |
| `app-state.ts` | The simulated application reducer |
| `screens.ts` | `render(state)` → node tree |

To add an API:

1. Add it to the right engine file and to the relevant `Set` of supported
   methods.
2. Add a unit test in `tests/unit/simulator.spec.ts`, including the failure case.
3. If it is user-facing, add it to `content/api-reference.ts` with
   `simulated: true`.

Unsupported APIs must fail with a message naming what *is* supported. A silent
no-op is worse than an error.

## Adding to a practice application

The practice apps are the system under test, so treat changes carefully:

- Keep every control reachable by role and label. If it is hard to locate, that
  is an accessibility bug, not a test problem.
- Stable hooks (`name`, `data-testid`, labels) must stay stable.
- Unstable hooks (generated ids, `data-session`) must stay unstable — they are
  the teaching device.
- If you change a locator's target, update the page objects in `playwright/pages/`
  and the affected lessons in the same pull request.

## Pull requests

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npx playwright test` passes
- [ ] No `waitForTimeout`, `page.pause()` or `test.only` in committed tests
- [ ] No locator built on a generated id, hashed class or session token
- [ ] New content is cross-linked (lesson → challenge → playground where relevant)
- [ ] No secrets, `.env` files or `playwright/.auth/` contents committed

## Reporting a problem

Include the route or lesson id, what you expected, what happened, and — for test
failures — the trace from `test-results/`.

# Architecture

## Layers

```text
Presentation          app/ + components/
        ↓
Training content      content/                (plain TypeScript data)
        ↓
Practice apps         app/(practice)/ + app/api/
        ↓
Simulation engines    lib/playwright-simulator/ + lib/sql-engine/
        ↓
State                 localStorage + an in-memory server store
```

Each layer only depends downward. The engines import nothing from React; the
content imports nothing from the UI beyond two type aliases.

## Route groups

Next.js route groups separate two products that happen to share a deployment.

| Group | Chrome | Purpose |
| --- | --- | --- |
| `app/(platform)` | Sidebar, global search, theme toggle | The training platform |
| `app/(practice)` | A thin "practice application" warning banner | The systems under test |
| `app/api` | — | REST endpoints backing the practice apps |
| `app/page.tsx` | Its own marketing header | The landing page |

The practice applications deliberately do **not** sit inside the platform shell.
They are meant to feel like separate products you have been asked to automate,
and the visual separation makes the distinction between "the course" and "the
app under test" obvious.

## Content as data

Lessons are TypeScript objects, not MDX or JSX:

```ts
type Lesson = {
  id: string;
  slug: string;
  title: string;
  moduleId: string;
  summary: string;
  difficulty: Difficulty;
  estimatedTime: number;
  objectives: string[];
  sections: Section[];
  commonMistakes: { title: string; body: string }[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  playground?: string[];
  challenges?: string[];
};
```

This buys several things that MDX would not:

- **One source, many surfaces.** The lesson page, the curriculum listing, the
  dashboard's "next lesson", the search index and the progress totals all read
  the same objects.
- **Counting is free.** The landing page's statistics are computed from the
  content, so they cannot drift from reality.
- **Cross-references are checkable.** A lesson names challenge ids and scenario
  ids; both are resolved at render time, so a broken link is a missing card
  rather than a 404.
- **No `dangerouslySetInnerHTML` anywhere.** Inline markup (`` `code` `` and
  `**bold**`) is parsed by a 20-line function into React nodes.

`Section` is a discriminated union (`text`, `code`, `compare`, `callout`,
`list`, `table`, `steps`, `diagram`, `playground`, `practice`), rendered by
`components/lesson/section-renderer.tsx`. Adding a section kind means adding a
variant and a case — the compiler finds every place that needs updating.

## Server components by default

Almost everything is a server component. Client components are confined to the
places that genuinely need interactivity:

- the playground and the SQL lab (editors, execution)
- the quiz, progress controls and the search dialog
- the practice applications' forms and data fetching
- the theme toggle

`CodeBlock` is a client component only because of its copy button, but it is
rendered from server components, so lesson pages ship almost no JavaScript for
their content.

## Practice application state

```text
Browser ──fetch──▶ app/api/* ──▶ lib/practice/store.ts (in-memory Map)
```

The practice apps fetch their data from real HTTP endpoints rather than
importing it directly. That is a deliberate cost: it makes `page.route()`
interception in a real Playwright test genuinely change what renders, which is
the whole point of the network module.

### Two cookies

`lib/practice/store.ts` issues two cookies, and the split matters:

| Cookie | Holds | Saved in storageState? |
| --- | --- | --- |
| `shopeasy_user` | The authenticated identity | Yes |
| `shopeasy_session` | This context's cart, orders and messages | No — cleared by `auth.setup.ts` |

With a single cookie, every test sharing one `storageState` file would also
share one cart. Under parallel workers that produces exactly the "passes alone,
fails in the suite" flakiness the curriculum warns about — it happened during
development of this repository, and the two-cookie split is the fix. Tests start
signed in, with their own empty data bucket.

### Consequences of an in-memory store

Chosen so the platform deploys free with zero configuration. The trade-offs are
real and are stated in the UI and the README: data resets when the server
restarts, and on serverless infrastructure it is not shared between instances.

## Progress tracking

`lib/progress.ts` is a small external store read through `useSyncExternalStore`.
Server render and the first client render both see `emptyProgress`, so there is
no hydration mismatch; a `useHydrated()` helper lets components avoid flashing
"0%" before localStorage is read.

Progress is per-browser by design — there is no account system — and the Progress
page offers export and import so it is not trapped in one machine.

## Design system

Tailwind CSS 4 with tokens defined as CSS custom properties:

```css
:root  { --bg: #f7f8fa; --surface: #ffffff; --accent: #17864a; … }
.dark  { --bg: #0b0e14; --surface: #11151d; --accent: #34d17c; … }

@theme inline { --color-bg: var(--bg); --color-surface: var(--surface); … }
```

Utilities such as `bg-surface`, `text-muted` and `border-line` therefore work in
both themes without duplicated `dark:` variants. Theme selection is applied by an
inline script in `<head>` before first paint, so there is no flash.

Fonts are system stacks. No webfont is fetched, which keeps builds hermetic and
first paint immediate.

## Testing the platform

The platform is covered by its own suite (`tests/platform.spec.ts`) alongside the
practice-app tests. Two properties are enforced in CI that matter for a teaching
repository:

- every playground scenario's published solution actually passes the simulator;
- every SQL exercise's published solution actually runs and returns rows.

Teaching material that silently rots is worse than no material, so it is checked
like code.

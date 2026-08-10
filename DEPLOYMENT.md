# Deployment

Playwright Academy is designed to deploy to Vercel's free tier with no
configuration: no database, no environment variables, no external services.

```text
GitHub
   ↓
Import the repository into Vercel
   ↓
Deploy
```

---

## Deploying to Vercel

1. **Push the repository to GitHub.**

   ```bash
   git add .
   git commit -m "Initial Playwright Academy implementation"
   git push -u origin main
   ```

2. **Import it at [vercel.com/new](https://vercel.com/new).**

3. **Accept the detected settings.** Vercel recognises Next.js and fills in
   everything:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Next.js |
   | Build command | `next build` (default) |
   | Output directory | `.next` (default) |
   | Install command | `npm install` (default) |
   | Node version | 20 or later |

4. **Deploy.** There are no environment variables to add.

Every push to `main` then produces a production deployment, and every pull
request gets its own preview URL.

---

## What works on the deployed site

- The whole training platform: dashboard, curriculum, lessons, quizzes, progress
- The Playwright Playground and its simulated browser
- The Registration practice application
- ShopEasy, including its REST API routes
- The SQL Lab
- Cheat sheets, API reference, the decision helper and the glossary
- Global search

## What needs to run locally

- The real Playwright browser suite (`npx playwright test`)
- UI mode, the Inspector, codegen and the trace viewer

Browsers cannot be launched inside Vercel's serverless runtime, which is exactly
why the platform ships an in-browser simulator for teaching and a real suite for
the repository.

---

## Running the test suite against a deployment

The same suite can be pointed at a deployed environment:

```bash
BASE_URL=https://your-app.vercel.app npx playwright test
```

When `BASE_URL` is set, `playwright.config.ts` does not start a local dev server.

Two caveats when testing a serverless deployment:

- Practice data lives in an in-memory store. Serverless instances do not share
  memory, so a cart created by one request may be invisible to the next. Tests
  that create and then read data can fail for reasons that have nothing to do
  with the application logic.
- Cold starts add latency to the first request, which can make the first test in
  a run look slow.

For reliable results, run the suite against a local server (the default) or a
long-lived container.

---

## Other hosts

Nothing in the project is Vercel-specific. Any platform that can run a Next.js
server works:

```bash
npm ci
npm run build
npm run start        # serves on port 3000
```

Netlify, Render, Fly.io, Railway or a plain Node host will all serve it. A
long-lived server actually behaves *better* than serverless here, because the
in-memory practice store then persists for the life of the process.

---

## Continuous deployment with CI

The GitHub Actions workflow in `.github/workflows/ci.yml` runs typecheck, lint,
build and the full Playwright suite on every push and pull request. Vercel's own
build runs independently.

If you want deployments gated on the tests passing, disable Vercel's automatic
git deployments and add a deploy step to the workflow that runs after the `test`
job succeeds, using the Vercel CLI and a project token.

---

## Post-deployment checklist

- [ ] The landing page renders and the theme toggle works
- [ ] `/learn` lists 16 modules and a lesson page opens
- [ ] `/playground` runs a scenario and the simulated browser updates
- [ ] `/practice/registration` regenerates its attributes
- [ ] `/practice/shop` loads products from `/api/products`
- [ ] Signing in shows *Welcome back, Test User*
- [ ] Checkout produces an `ORD-######` confirmation
- [ ] `/practice/sql` runs the default query and returns rows
- [ ] Progress persists across a reload
- [ ] The mobile layout collapses the sidebar

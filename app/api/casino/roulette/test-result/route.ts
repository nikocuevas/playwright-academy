import { NextResponse } from "next/server";
import { resolveRouletteSession, setForcedResult } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/casino/roulette/test-result — TEST-ONLY. Body: { result: number }.
 *
 * Forces the outcome of the next spin, so an automated test can assert a
 * deterministic result (a specific number, a specific color, a guaranteed
 * win or loss) instead of asserting against real randomness. The forced
 * value is consumed by exactly one spin and then cleared — it cannot
 * silently affect a later round.
 *
 * This is NOT a player-facing feature. Nothing in the shipped roulette UI
 * ever calls this route, so a real player clicking through the app can never
 * reach it. As a second safeguard it also requires the `X-Test-Mode: enable`
 * header — deliberately not gated on `NODE_ENV`, since that could silently
 * go dark under a production build (`next build && next start`) and break a
 * CI run that exercises the built app; a header a real browser session never
 * sends is a simpler, more predictable gate for a mechanism that only
 * Playwright is supposed to use. See docs/casino-roulette-architecture.md.
 */
export async function POST(request: Request) {
  if (request.headers.get("x-test-mode") !== "enable") {
    return NextResponse.json({ error: "Test-only endpoint" }, { status: 403 });
  }

  let body: { result?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = body.result;
  if (typeof result !== "number" || !Number.isInteger(result) || result < 0 || result > 36) {
    return NextResponse.json(
      { error: "result must be a whole number between 0 and 36" },
      { status: 400 },
    );
  }

  const session = await resolveRouletteSession();
  setForcedResult(session, result);

  return NextResponse.json({ ok: true, forcedResult: result });
}

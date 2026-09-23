import { NextResponse } from "next/server";
import { placeBet, resolveRouletteSession } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

/** POST /api/casino/roulette/bet — body: { type, selection?, stake } */
export async function POST(request: Request) {
  const session = await resolveRouletteSession();

  let body: { type?: string; selection?: unknown; stake?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = placeBet(session, body.type, body.selection, body.stake);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { round: result.round, balance: result.balance, status: result.round.status },
    { status: 201 },
  );
}

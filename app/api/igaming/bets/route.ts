import { NextResponse } from "next/server";
import { placeBet, resolveIgamingSession, serialiseWallet } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ bets: session.bets });
}

/** POST /api/igaming/bets — body: { marketId, optionId, stake, idempotencyKey? } */
export async function POST(request: Request) {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { marketId?: string; optionId?: string; stake?: number; idempotencyKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.marketId || !body.optionId) {
    return NextResponse.json(
      { error: "marketId and optionId are required" },
      { status: 400 },
    );
  }

  const result = placeBet(
    session,
    body.marketId,
    body.optionId,
    Number(body.stake),
    body.idempotencyKey,
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { bet: result.bet, wallet: serialiseWallet(session) },
    { status: 201 },
  );
}

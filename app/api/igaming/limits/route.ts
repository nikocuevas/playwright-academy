import { NextResponse } from "next/server";
import { resolveIgamingSession, serialiseWallet, setDepositLimit } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/** POST /api/igaming/limits — body: { depositLimit } — sets a responsible-gambling deposit limit. */
export async function POST(request: Request) {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { depositLimit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = setDepositLimit(session, Number(body.depositLimit));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ wallet: serialiseWallet(session) });
}

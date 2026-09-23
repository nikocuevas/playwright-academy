import { NextResponse } from "next/server";
import {
  deposit,
  resolveIgamingSession,
  serialiseWallet,
  withdraw,
} from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ wallet: serialiseWallet(session) });
}

/** POST /api/igaming/wallet — body: { action: "deposit" | "withdraw", amount, idempotencyKey? } */
export async function POST(request: Request) {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { action?: string; amount?: number; idempotencyKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);

  if (body.action === "deposit") {
    const result = deposit(session, amount, body.idempotencyKey);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(
      { wallet: serialiseWallet(session), transaction: result.transaction },
      { status: 201 },
    );
  }

  if (body.action === "withdraw") {
    const result = withdraw(session, amount);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(
      { wallet: serialiseWallet(session), transaction: result.transaction },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { error: "action must be 'deposit' or 'withdraw'" },
    { status: 400 },
  );
}

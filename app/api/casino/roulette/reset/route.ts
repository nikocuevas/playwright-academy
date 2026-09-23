import { NextResponse } from "next/server";
import { resetGame, resolveRouletteSession } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await resolveRouletteSession();
  const result = resetGame(session);
  return NextResponse.json({ balance: result.balance, status: result.status });
}

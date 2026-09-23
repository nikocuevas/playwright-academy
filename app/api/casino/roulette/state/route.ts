import { NextResponse } from "next/server";
import { resolveRouletteSession, serialiseState } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveRouletteSession();
  return NextResponse.json(serialiseState(session));
}

import { NextResponse } from "next/server";
import { resolveRouletteSession } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveRouletteSession();
  return NextResponse.json({ history: session.history });
}

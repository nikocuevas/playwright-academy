import { NextResponse } from "next/server";
import { resolveIgamingSession } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ transactions: session.transactions });
}

import { NextResponse } from "next/server";
import { resolveSession, signOut } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await resolveSession();
  await signOut(session);
  return NextResponse.json({ ok: true });
}

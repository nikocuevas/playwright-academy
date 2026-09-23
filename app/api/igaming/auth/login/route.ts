import { NextResponse } from "next/server";
import { demoIgamingUser } from "@/lib/practice/igaming-data";
import { resolveIgamingSession, signIn } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/igaming/auth/login
 * Body: { email, password }
 *
 * Training-only authentication: one fictional account, checked in plain text
 * against an in-memory record. Never model a real login on this.
 */
export async function POST(request: Request) {
  const session = await resolveIgamingSession();

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  if (email !== demoIgamingUser.email || password !== demoIgamingUser.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await signIn();
  session.user = {
    id: demoIgamingUser.id,
    email: demoIgamingUser.email,
    username: demoIgamingUser.username,
  };

  return NextResponse.json({ user: session.user });
}

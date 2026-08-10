import { NextResponse } from "next/server";
import { demoUser } from "@/lib/practice/shop-data";
import { resolveSession, signIn } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Training-only authentication: one fictional account, checked in plain text
 * against an in-memory record. Never model a real login on this.
 */
export async function POST(request: Request) {
  const session = await resolveSession();

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

  if (email !== demoUser.email || password !== demoUser.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await signIn();
  session.user = {
    id: demoUser.id,
    email: demoUser.email,
    firstName: demoUser.firstName,
    lastName: demoUser.lastName,
  };

  return NextResponse.json({
    user: { ...session.user, fullName: demoUser.fullName },
  });
}

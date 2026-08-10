import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

/** GET /api/auth/session — who, if anyone, is signed in. */
export async function GET() {
  const session = await resolveSession();

  return NextResponse.json({
    authenticated: Boolean(session.user),
    user: session.user
      ? {
          ...session.user,
          fullName: `${session.user.firstName} ${session.user.lastName}`,
        }
      : null,
  });
}

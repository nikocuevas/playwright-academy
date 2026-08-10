import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveSession();

  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ messages: session.messages });
}

/** POST /api/messages — body: { subject, message, orderNumber? } */
export async function POST(request: Request) {
  const session = await resolveSession();

  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { subject?: string; message?: string; orderNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const subject = body.subject?.trim() ?? "";
  const messageBody = body.message?.trim() ?? "";

  if (!subject || !messageBody) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 },
    );
  }

  const message = {
    id: `MSG-${Date.now().toString().slice(-6)}`,
    subject,
    body: messageBody,
    orderNumber: body.orderNumber,
    status: "open" as const,
    sentAt: new Date().toISOString().slice(0, 10),
  };

  session.messages.unshift(message);

  return NextResponse.json({ message }, { status: 201 });
}

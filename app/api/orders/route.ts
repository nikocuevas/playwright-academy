import { NextResponse } from "next/server";
import { placeOrder, resolveSession } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveSession();

  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ orders: session.orders, total: session.orders.length });
}

/** POST /api/orders — places an order from the current cart. */
export async function POST(request: Request) {
  const session = await resolveSession();

  let body: { shipping?: Record<string, string> } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = placeOrder(session, body.shipping);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { order: result.order, orderNumber: result.order.orderNumber },
    { status: 201 },
  );
}

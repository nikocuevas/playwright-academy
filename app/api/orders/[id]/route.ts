import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await resolveSession();
  const order = session.orders.find((o) => o.orderNumber === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

/** PATCH /api/orders/[id] — body: { status } */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await resolveSession();
  const order = session.orders.find((o) => o.orderNumber === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const allowed = ["Pending", "Paid", "Shipped", "Cancelled"] as const;
  const status = allowed.find((s) => s.toLowerCase() === body.status?.toLowerCase());

  if (!status) {
    return NextResponse.json(
      { error: "Invalid status", allowed },
      { status: 400 },
    );
  }

  order.status = status;
  return NextResponse.json({ order });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await resolveSession();
  const before = session.orders.length;
  session.orders = session.orders.filter((o) => o.orderNumber !== id);

  if (session.orders.length === before) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import {
  addToCart,
  resolveSession,
  serialiseCart,
  setQuantity,
} from "@/lib/practice/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await resolveSession();
  return NextResponse.json({ cart: serialiseCart(session) });
}

/** POST /api/cart — body: { productId, quantity? } */
export async function POST(request: Request) {
  const session = await resolveSession();

  let body: { productId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const result = addToCart(session, body.productId, body.quantity ?? 1);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ cart: serialiseCart(session) }, { status: 201 });
}

/** PATCH /api/cart — body: { productId, quantity } */
export async function PATCH(request: Request) {
  const session = await resolveSession();

  let body: { productId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.productId || typeof body.quantity !== "number") {
    return NextResponse.json(
      { error: "productId and numeric quantity are required" },
      { status: 400 },
    );
  }

  const result = setQuantity(session, body.productId, body.quantity);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ cart: serialiseCart(session) });
}

/** DELETE /api/cart?productId=… — omit productId to empty the cart. */
export async function DELETE(request: Request) {
  const session = await resolveSession();
  const productId = new URL(request.url).searchParams.get("productId");

  if (productId) {
    session.cart = session.cart.filter((line) => line.productId !== productId);
  } else {
    session.cart = [];
  }

  return NextResponse.json({ cart: serialiseCart(session) });
}

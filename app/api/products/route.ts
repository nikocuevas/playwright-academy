import { NextResponse } from "next/server";
import { categories, filterProducts } from "@/lib/practice/shop-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Query: ?q=&category=&sort=price-asc|price-desc|rating
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const query = url.searchParams.get("q") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const sort = url.searchParams.get("sort") ?? undefined;

  const validCategories = categories.map((c) => c.value);
  if (category && !validCategories.includes(category as never)) {
    return NextResponse.json(
      {
        error: "Unknown category",
        allowed: validCategories,
      },
      { status: 400 },
    );
  }

  const products = filterProducts({ query, category, sort });

  return NextResponse.json({
    products,
    total: products.length,
    filters: { query: query ?? null, category: category ?? "all", sort: sort ?? null },
  });
}

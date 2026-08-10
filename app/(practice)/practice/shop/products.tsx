"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Search, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { categories, type Product } from "@/lib/practice/shop-data";
import { useShop } from "@/components/shop/shop-provider";

/**
 * The product grid fetches from /api/products, so `page.route()` interception
 * in a real Playwright test genuinely changes what renders here.
 */
export function ProductGrid() {
  const { addToCart } = useShop();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [submittedQuery, setSubmittedQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState("");
  const [adding, setAdding] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const params = new URLSearchParams();
      if (submittedQuery) params.set("q", submittedQuery);
      if (category !== "all") params.set("category", category);
      if (sort) params.set("sort", sort);

      const response = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorMessage(body.error ?? `Request failed with status ${response.status}`);
        setStatus("error");
        return;
      }

      const body = await response.json();
      setProducts(body.products ?? []);
      setStatus("ready");
    } catch {
      setErrorMessage("Network request failed");
      setStatus("error");
    }
  }, [submittedQuery, category, sort]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Regenerated per render so tests cannot depend on it. */
  const productDomId = React.useCallback((id: string) => {
    const numeric = Number(id.replace(/\D/g, "")) || 1;
    return String(numeric * 823 + Math.floor(Math.random() * 900) + 100);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Six products, deliberately identical “Add to Cart” buttons.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedQuery(query);
          }}
          className="flex flex-wrap items-center gap-2"
          role="search"
        >
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-2.5">
            <Search className="h-3.5 w-3.5 text-faint" aria-hidden />
            <input
              id="product-search"
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-faint"
            />
          </div>

          <label className="sr-only" htmlFor="category-filter">
            Category
          </label>
          <select
            id="category-filter"
            name="category"
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-lg border border-line bg-surface px-2.5 text-sm outline-none"
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="sort-order">
            Sort by
          </label>
          <select
            id="sort-order"
            name="sort"
            aria-label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-lg border border-line bg-surface px-2.5 text-sm outline-none"
          >
            <option value="">Default order</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>

          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {status === "loading" && (
        <div
          data-testid="products-skeleton"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading products"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-xl border border-line bg-surface-2"
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/40 bg-danger-soft p-5"
        >
          <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger">
              Something went wrong loading products
            </p>
            <p className="text-xs text-muted">{errorMessage}</p>
          </div>
          <Button size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {status === "ready" && products.length === 0 && (
        <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
          No products match your search
        </p>
      )}

      {status === "ready" && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              data-product-id={productDomId(product.id)}
              className="flex flex-col rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-semibold">{product.name}</h2>
                {product.badge && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      product.inStock
                        ? "bg-accent-soft text-accent"
                        : "bg-danger-soft text-danger",
                    )}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                {product.blurb}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden />
                <span>
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <p
                data-testid="product-price"
                className="mt-2 font-mono text-lg font-semibold"
              >
                {formatPrice(product.price)}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!product.inStock || adding === product.id}
                  onClick={async () => {
                    setAdding(product.id);
                    await addToCart(product.id);
                    setAdding(null);
                  }}
                >
                  {product.inStock
                    ? adding === product.id
                      ? "Adding…"
                      : "Add to Cart"
                    : "Out of Stock"}
                </Button>
                <Link
                  href={`/practice/shop/product/${product.id}`}
                  className="text-sm text-info underline underline-offset-2"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

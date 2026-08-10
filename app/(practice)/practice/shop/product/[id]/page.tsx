import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProduct, products } from "@/lib/practice/shop-data";
import { AddToCart } from "./add-to-cart";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-faint">
        <Link href="/practice/shop" className="hover:text-fg">
          Products
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-muted">{product.name}</span>
      </nav>

      <article className="rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          {product.badge && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-accent">
              {product.badge}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Star className="h-4 w-4 fill-warn text-warn" aria-hidden />
          {product.rating} · {product.reviews} reviews · {product.category}
        </div>

        <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

        <dl className="mt-5 grid gap-2 sm:grid-cols-3">
          {product.specs.map((spec) => (
            <div key={spec.label} className="rounded-lg border border-line p-3">
              <dt className="text-[11px] uppercase tracking-wider text-faint">
                {spec.label}
              </dt>
              <dd className="mt-0.5 text-sm">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
          <p data-testid="product-price" className="font-mono text-2xl font-semibold">
            {formatPrice(product.price)}
          </p>
          <span
            data-testid="product-availability"
            className={
              product.inStock
                ? "rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
                : "rounded-full bg-danger-soft px-2.5 py-1 text-xs text-danger"
            }
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>

          <AddToCart productId={product.id} inStock={product.inStock} />
        </div>
      </article>
    </div>
  );
}

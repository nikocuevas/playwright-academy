"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-provider";

export function AddToCart({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const { addToCart } = useShop();
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="quantity" className="mb-1.5 block text-xs text-muted">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <Button
        disabled={!inStock || adding}
        onClick={async () => {
          setAdding(true);
          await addToCart(productId, quantity);
          setAdding(false);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2500);
        }}
      >
        {!inStock ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
      </Button>

      {added && (
        <span role="status" data-testid="add-to-cart-confirmation" className="text-sm text-accent">
          Added to your cart
        </span>
      )}
    </div>
  );
}

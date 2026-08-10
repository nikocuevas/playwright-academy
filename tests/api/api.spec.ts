import { test, expect } from "@playwright/test";

/**
 * Pure API tests. Only the `request` fixture is destructured, so Playwright
 * never creates a browser page — these run in milliseconds.
 */
test.describe("Products API", () => {
  test("returns a catalogue with the documented shape", async ({ request }) => {
    const response = await request.get("/api/products");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const { products, total } = await response.json();

    expect(products.length).toBeGreaterThan(0);
    expect(total).toBe(products.length);

    // Assert the shape, not the values: this fails when the contract changes,
    // not when the data does.
    for (const product of products) {
      expect(typeof product.id).toBe("string");
      expect(typeof product.name).toBe("string");
      expect(typeof product.price).toBe("number");
      expect(typeof product.category).toBe("string");
      expect(typeof product.inStock).toBe("boolean");
    }
  });

  test("filters by category", async ({ request }) => {
    const all = await request.get("/api/products");
    const audio = await request.get("/api/products", {
      params: { category: "audio" },
    });

    const allBody = await all.json();
    const audioBody = await audio.json();

    expect(audioBody.products.length).toBeGreaterThan(0);
    expect(audioBody.products.length).toBeLessThan(allBody.products.length);
    expect(
      audioBody.products.every(
        (product: { category: string }) => product.category === "audio",
      ),
    ).toBe(true);
  });

  test("sorts by price ascending", async ({ request }) => {
    const response = await request.get("/api/products", {
      params: { sort: "price-asc" },
    });

    const prices = (await response.json()).products.map(
      (product: { price: number }) => product.price,
    );

    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });

  test("rejects an unknown category", async ({ request }) => {
    const response = await request.get("/api/products", {
      params: { category: "does-not-exist" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Unknown category" });
  });

  test("returns one product by id", async ({ request }) => {
    const response = await request.get("/api/products/p-1001");

    await expect(response).toBeOK();
    expect((await response.json()).product.name).toBe("Wireless Headphones");
  });

  test("returns 404 for an unknown product", async ({ request }) => {
    const response = await request.get("/api/products/does-not-exist");

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ error: "Product not found" });
  });
});

test.describe("Auth API", () => {
  test("rejects bad credentials with 401", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "testuser@example.com", password: "wrong" },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Invalid email or password",
    });
  });

  test("rejects a missing password with 400", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "testuser@example.com" },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe("Cart and orders API", () => {
  test("adds an item, reads the cart and places an order", async ({
    request,
  }) => {
    const added = await request.post("/api/cart", {
      data: { productId: "p-1001", quantity: 2 },
    });
    expect(added.status()).toBe(201);

    const cart = await (await request.get("/api/cart")).json();
    expect(cart.cart.items).toHaveLength(1);
    expect(cart.cart.items[0].quantity).toBe(2);
    expect(cart.cart.total).toBeGreaterThan(cart.cart.subtotal);

    const placed = await request.post("/api/orders", { data: {} });
    expect(placed.status()).toBe(201);

    const { order } = await placed.json();
    expect(order.orderNumber).toMatch(/^ORD-\d{6}$/);
    expect(order.status).toBe("Pending");

    // The order total must equal the sum of its line items — the same
    // reconciliation the SQL Lab exercises perform against the database.
    const calculated = order.items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0,
    );
    expect(order.subtotal).toBeCloseTo(calculated, 2);

    const emptied = await (await request.get("/api/cart")).json();
    expect(emptied.cart.items).toHaveLength(0);
  });

  test("rejects placing an order with an empty cart", async ({ request }) => {
    await request.delete("/api/cart");

    const response = await request.post("/api/orders", { data: {} });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("Cart is empty");
  });

  test("rejects adding an unknown product", async ({ request }) => {
    const response = await request.post("/api/cart", {
      data: { productId: "p-9999" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Product not found" });
  });

  test("rejects adding an out-of-stock product", async ({ request }) => {
    const response = await request.post("/api/cart", {
      data: { productId: "p-1004" },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("out of stock");
  });

  test("returns 404 for an unknown order", async ({ request }) => {
    const response = await request.get("/api/orders/ORD-000000");
    expect(response.status()).toBe(404);
  });
});

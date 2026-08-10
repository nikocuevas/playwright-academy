import { test, expect } from "../../playwright/fixtures/test";

/**
 * Hybrid API + UI: the order is seeded through the API because creating it is
 * a precondition, not the behaviour under test. The cancellation itself goes
 * through the UI, and the result is verified at both layers.
 */
test.describe("Order history", () => {
  test("shows an order created through the API", async ({
    page,
    ordersPage,
  }) => {
    // page.request shares the browser context cookie jar; the standalone
    // `request` fixture would get its own session and create the order
    // somewhere the page cannot see.
    const request = page.request;

    await request.post("/api/cart", {
      data: { productId: "p-1002", quantity: 1 },
    });

    const created = await request.post("/api/orders", {
      data: { shipping: { city: "Toronto" } },
    });
    expect(created.status()).toBe(201);
    const { orderNumber } = await created.json();

    await ordersPage.goto();

    await expect(ordersPage.row(orderNumber)).toBeVisible();
    await expect(ordersPage.status(orderNumber)).toHaveText("Pending");
  });

  test("cancelling in the UI updates the backend", async ({
    page,
    ordersPage,
  }) => {
    const request = page.request;

    await request.post("/api/cart", {
      data: { productId: "p-1003", quantity: 1 },
    });
    const created = await request.post("/api/orders", { data: {} });
    const { orderNumber } = await created.json();

    await ordersPage.goto();
    await ordersPage.cancel(orderNumber);

    // 1. The UI reflects it…
    await expect(ordersPage.status(orderNumber)).toHaveText("Cancelled");

    // 2. …and so does the stored data. A UI can render success while writing
    //    the wrong thing; checking both layers catches that.
    const check = await request.get(`/api/orders/${orderNumber}`);
    expect((await check.json()).order.status).toBe("Cancelled");
  });

  test("a cancelled order cannot be cancelled again", async ({
    page,
    ordersPage,
  }) => {
    const request = page.request;

    await request.post("/api/cart", {
      data: { productId: "p-1006", quantity: 1 },
    });
    const created = await request.post("/api/orders", { data: {} });
    const { orderNumber } = await created.json();

    await request.patch(`/api/orders/${orderNumber}`, {
      data: { status: "Cancelled" },
    });

    await ordersPage.goto();

    await expect(
      ordersPage.row(orderNumber).getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();
  });
});

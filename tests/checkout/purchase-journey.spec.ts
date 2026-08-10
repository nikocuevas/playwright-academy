import { test, expect } from "../../playwright/fixtures/test";
import { paymentDetails, shippingDetails } from "../../playwright/test-data/users";

/**
 * The full journey, kept as one test on purpose: it is the smoke test that
 * proves the critical path works end to end. test.step makes the failure
 * signal specific enough to be useful.
 */
test("customer completes a purchase and contacts support", async ({
  page,
  shopPage,
  cartPage,
  checkoutPage,
  ordersPage,
  messagesPage,
}) => {
  let orderNumber = "";

  await test.step("Add a product to the cart", async () => {
    await shopPage.goto();
    await shopPage.addToCart("Wireless Headphones");
    await expect(shopPage.cartCount).toHaveText("1");
  });

  await test.step("Verify the cart contents", async () => {
    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText("Wireless Headphones");
  });

  await test.step("Fill shipping and payment", async () => {
    await cartPage.checkout.click();
    await expect(checkoutPage.heading).toBeVisible();

    await checkoutPage.fillShipping(shippingDetails);
    await checkoutPage.fillPayment(paymentDetails);
  });

  await test.step("Place the order and capture the number", async () => {
    orderNumber = await checkoutPage.placeOrderAndCapture();
    expect(orderNumber).toMatch(/^ORD-\d{6}$/);
  });

  await test.step("Find the order in the history", async () => {
    await ordersPage.goto();
    await expect(ordersPage.row(orderNumber)).toBeVisible();
    await expect(ordersPage.status(orderNumber)).toHaveText("Pending");
  });

  await test.step("Contact support about the order", async () => {
    await messagesPage.goto();
    await messagesPage.sendMessage(
      `Question about ${orderNumber}`,
      "When will this order ship?",
      orderNumber,
    );

    await expect(messagesPage.success).toBeVisible();
  });

  await test.step("The cart is empty afterwards", async () => {
    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(0);
    await expect(page.getByTestId("cart-count")).toHaveText("0");
  });
});

test.describe("Checkout validation", () => {
  test("requires every shipping and payment field", async ({
    cartWithHeadphones,
    checkoutPage,
  }) => {
    await checkoutPage.goto();
    await checkoutPage.placeOrder.click();

    await expect(cartWithHeadphones.getByText("This field is required").first()).toBeVisible();
    await expect(checkoutPage.confirmationHeading).toBeHidden();
  });

  test("rejects a malformed card number", async ({
    cartWithHeadphones,
    checkoutPage,
  }) => {
    await checkoutPage.goto();
    await checkoutPage.fillShipping(shippingDetails);
    await checkoutPage.fillPayment({ ...paymentDetails, cardNumber: "4111" });
    await checkoutPage.placeOrder.click();

    await expect(
      cartWithHeadphones.getByText("Enter a 15 or 16 digit card number"),
    ).toBeVisible();
    await expect(checkoutPage.confirmationHeading).toBeHidden();
  });

  test("an empty cart cannot be checked out", async ({ page, checkoutPage }) => {
    await page.request.delete("/api/cart");
    await checkoutPage.goto();

    await expect(
      page.getByText("Your cart is empty, so there is nothing to check out."),
    ).toBeVisible();
  });
});

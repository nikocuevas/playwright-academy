import { test, expect } from "../../playwright/fixtures/test";

test.describe("Product browsing", () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.goto();
  });

  test("lists the catalogue", async ({ shopPage }) => {
    await expect(shopPage.heading).toBeVisible();
    await expect(shopPage.productCards).toHaveCount(6);
  });

  test("search narrows the grid", async ({ shopPage }) => {
    await shopPage.searchFor("headphones");

    await expect(shopPage.productCards).toHaveCount(1);
    await expect(shopPage.card("Wireless Headphones")).toBeVisible();
  });

  test("search with no matches shows the empty state", async ({ shopPage }) => {
    await shopPage.searchFor("something that does not exist");

    await expect(shopPage.productCards).toHaveCount(0);
    await expect(shopPage.emptyState).toBeVisible();
  });

  test("category filter applies", async ({ shopPage }) => {
    await shopPage.category.selectOption("audio");

    await expect(shopPage.productCards).toHaveCount(2);
    await expect(shopPage.card("Wireless Headphones")).toBeVisible();
    await expect(shopPage.card("Desk Microphone")).toBeVisible();
  });

  test("sorting by price orders the grid", async ({ page, shopPage }) => {
    await shopPage.sort.selectOption("price-asc");

    // allTextContents() does not auto-wait, so assert the list has settled into
    // the sorted order before reading the values out of it.
    await expect(shopPage.productCards).toHaveCount(6);
    await expect(page.getByTestId("product-price").first()).toHaveText("$42.00");

    const prices = await page.getByTestId("product-price").allTextContents();
    const values = prices.map((text) => Number(text.replace(/[^0-9.]/g, "")));

    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  test("an out-of-stock product cannot be added", async ({ shopPage }) => {
    const tracker = shopPage.card("Fitness Tracker");

    await expect(tracker.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
  });
});

test.describe("Cart", () => {
  test("adds a specific product using chaining and filtering", async ({
    shopPage,
    cartPage,
  }) => {
    await shopPage.goto();
    await shopPage.addToCart("Wireless Headphones");

    await expect(shopPage.cartCount).toHaveText("1");

    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText("Wireless Headphones");
  });

  test("holds several products in order", async ({ shopPage, cartPage }) => {
    await shopPage.goto();
    await shopPage.addToCart("Wireless Headphones");
    await expect(shopPage.cartCount).toHaveText("1");

    await shopPage.addToCart("Mechanical Keyboard");
    await expect(shopPage.cartCount).toHaveText("2");

    await cartPage.goto();
    await expect(cartPage.itemNames).toHaveText([
      "Wireless Headphones",
      "Mechanical Keyboard",
    ]);
  });

  test("changing the quantity updates the badge and the totals", async ({
    cartWithHeadphones: page,
    cartPage,
    shopPage,
  }) => {
    await cartPage.goto();
    await cartPage.increase("Wireless Headphones");

    await expect(cartPage.quantities).toHaveText("2");
    await expect(shopPage.cartCount).toHaveText("2");
    await expect(cartPage.total).toContainText("$");

    // Referenced so the fixture's page is clearly the one under test.
    await expect(page).toHaveURL(/\/cart$/);
  });

  test("removing the last item empties the cart", async ({
    cartWithHeadphones,
    cartPage,
  }) => {
    await cartPage.goto();
    await cartPage.remove("Wireless Headphones");

    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.emptyState).toBeVisible();
    expect(cartWithHeadphones.url()).toContain("/cart");
  });
});

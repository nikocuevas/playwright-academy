import { test, expect } from "../../playwright/fixtures/test";

/**
 * These states are effectively impossible to produce on demand with real data,
 * which is exactly why interception exists.
 */
test.describe("Network interception", () => {
  test("renders exactly the products the API returns", async ({
    page,
    shopPage,
  }) => {
    // Register the route BEFORE navigating — handlers added afterwards miss
    // the requests that already fired.
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        json: {
          products: [
            {
              id: "p-test-a",
              name: "Test Product A",
              category: "audio",
              price: 10,
              rating: 5,
              reviews: 1,
              inStock: true,
              blurb: "First mocked product.",
              description: "",
              specs: [],
            },
            {
              id: "p-test-b",
              name: "Test Product B",
              category: "audio",
              price: 20,
              rating: 4,
              reviews: 2,
              inStock: true,
              blurb: "Second mocked product.",
              description: "",
              specs: [],
            },
          ],
          total: 2,
        },
      });
    });

    await shopPage.goto();

    await expect(shopPage.productCards).toHaveCount(2);
    await expect(page.getByText("Test Product A")).toBeVisible();
  });

  test("shows the empty state when the API returns nothing", async ({
    shopPage,
    page,
  }) => {
    await page.route("**/api/products*", (route) =>
      route.fulfill({ json: { products: [], total: 0 } }),
    );

    await shopPage.goto();

    await expect(shopPage.emptyState).toBeVisible();
    await expect(shopPage.productCards).toHaveCount(0);
  });

  test("shows an error state and recovers on retry", async ({
    page,
    shopPage,
  }) => {
    // `times: 1` makes only the first request fail, so Retry can succeed.
    await page.route(
      "**/api/products*",
      (route) =>
        route.fulfill({ status: 500, json: { error: "Internal Server Error" } }),
      { times: 1 },
    );

    await shopPage.goto();

    await expect(shopPage.errorAlert).toBeVisible();
    await expect(
      page.getByText("Something went wrong loading products"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Retry" }).click();
    await expect(shopPage.productCards).toHaveCount(6);
  });

  test("a slow response reveals the loading state", async ({
    page,
    shopPage,
  }) => {
    await page.route("**/api/products*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });

    const navigation = shopPage.goto();

    await expect(shopPage.skeleton).toBeVisible();
    await navigation;
    await expect(shopPage.productCards.first()).toBeVisible({ timeout: 15_000 });
  });

  test("modifies a real response instead of replacing it", async ({
    page,
    shopPage,
  }) => {
    await page.route("**/api/products*", async (route) => {
      const response = await route.fetch();
      const body = await response.json();

      body.products = body.products.map(
        (product: { name: string; inStock: boolean }) =>
          product.name === "Wireless Headphones"
            ? { ...product, inStock: false }
            : product,
      );

      await route.fulfill({ response, json: body });
    });

    await shopPage.goto();

    await expect(
      shopPage.card("Wireless Headphones").getByRole("button", {
        name: "Out of Stock",
      }),
    ).toBeDisabled();
  });

  test("records the API calls a flow produces", async ({ page, shopPage }) => {
    const calls: string[] = [];

    // Listeners only see events fired after they attach.
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/")) {
        calls.push(`${request.method()} ${url.pathname}`);
      }
    });

    await shopPage.goto();
    await shopPage.addToCart("USB-C Hub");
    await expect(shopPage.cartCount).toHaveText("1");

    expect(calls).toContain("GET /api/products");
    expect(calls).toContain("POST /api/cart");

    await page.request.delete("/api/cart");
  });
});

import { type Locator, type Page } from "@playwright/test";

export class ShopPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly search: Locator;
  readonly searchButton: Locator;
  readonly category: Locator;
  readonly sort: Locator;
  readonly productCards: Locator;
  readonly cartCount: Locator;
  readonly skeleton: Locator;
  readonly errorAlert: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Products", level: 1 });
    this.search = page.getByLabel("Search products");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.category = page.getByLabel("Category");
    this.sort = page.getByLabel("Sort by");
    this.productCards = page.getByRole("article");
    this.cartCount = page.getByTestId("cart-count");
    this.skeleton = page.getByTestId("products-skeleton");
    // Scoped to <main>: Next.js renders its own role="alert" route announcer,
    // so an unscoped getByRole('alert') is ambiguous.
    this.errorAlert = page.locator("main").getByRole("alert");
    this.emptyState = page.getByText("No products match your search");
  }

  async goto() {
    await this.page.goto("/practice/shop");
  }

  /**
   * The card for a named product.
   *
   * `data-product-id` is regenerated on every render, so filtering by the
   * visible name is the only reliable way in.
   */
  card(productName: string): Locator {
    return this.productCards.filter({ hasText: productName });
  }

  async addToCart(productName: string) {
    await this.card(productName)
      .getByRole("button", { name: "Add to Cart" })
      .click();
  }

  async searchFor(term: string) {
    await this.search.fill(term);
    await this.searchButton.click();
  }
}

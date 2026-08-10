import { type Locator, type Page } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly quantities: Locator;
  readonly total: Locator;
  readonly checkout: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Your Cart" });
    this.items = page.getByTestId("cart-item");
    this.itemNames = page.getByTestId("cart-item-name");
    this.quantities = page.getByTestId("cart-item-quantity");
    this.total = page.getByTestId("cart-total");
    this.checkout = page.getByRole("link", { name: "Proceed to Checkout" });
    this.emptyState = page.getByText("Your cart is empty");
  }

  async goto() {
    await this.page.goto("/practice/shop/cart");
  }

  row(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async increase(productName: string) {
    await this.row(productName)
      .getByRole("button", { name: `Increase quantity of ${productName}` })
      .click();
  }

  async remove(productName: string) {
    await this.row(productName)
      .getByRole("button", { name: `Remove ${productName}` })
      .click();
  }
}

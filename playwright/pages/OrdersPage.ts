import { type Locator, type Page } from "@playwright/test";

export class OrdersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly rows: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Your Orders" });
    this.rows = page.getByTestId("order-row");
    this.emptyState = page.getByText("You have no orders yet");
  }

  async goto() {
    await this.page.goto("/practice/shop/orders");
  }

  row(orderNumber: string): Locator {
    return this.rows.filter({ hasText: orderNumber });
  }

  status(orderNumber: string): Locator {
    return this.row(orderNumber).getByTestId("order-status");
  }

  async cancel(orderNumber: string) {
    await this.row(orderNumber).getByRole("button", { name: "Cancel" }).click();
  }
}

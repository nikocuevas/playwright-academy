import { type Locator, type Page } from "@playwright/test";

export type ShippingDetails = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
};

export type PaymentDetails = {
  cardNumber: string;
  expiration: string;
  cvv: string;
};

export class CheckoutPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly placeOrder: Locator;
  readonly confirmationHeading: Locator;
  readonly orderNumber: Locator;
  readonly orderTotal: Locator;
  readonly checkoutTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Checkout" });
    this.placeOrder = page.getByRole("button", { name: "Place Order" });
    this.confirmationHeading = page.getByRole("heading", {
      name: "Order Successful!",
    });
    this.orderNumber = page.getByTestId("order-number");
    this.orderTotal = page.getByTestId("order-total");
    this.checkoutTotal = page.getByTestId("checkout-total");
  }

  async goto() {
    await this.page.goto("/practice/shop/checkout");
  }

  async fillShipping(details: ShippingDetails) {
    await this.page.getByLabel("First Name").fill(details.firstName);
    await this.page.getByLabel("Last Name").fill(details.lastName);
    await this.page.getByLabel("Address").fill(details.address);
    await this.page.getByLabel("City").fill(details.city);
    await this.page.getByLabel("Province").selectOption(details.province);
    await this.page.getByLabel("Postal Code").fill(details.postalCode);
  }

  async fillPayment(details: PaymentDetails) {
    await this.page.getByLabel("Card Number").fill(details.cardNumber);
    await this.page.getByLabel("Expiration").fill(details.expiration);
    await this.page.getByLabel("CVV").fill(details.cvv);
  }

  /** Places the order and returns the generated order number. */
  async placeOrderAndCapture(): Promise<string> {
    await this.placeOrder.click();
    await this.confirmationHeading.waitFor();
    return (await this.orderNumber.innerText()).trim();
  }
}

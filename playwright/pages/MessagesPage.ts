import { type Locator, type Page } from "@playwright/test";

export class MessagesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly relatedOrder: Locator;
  readonly send: Locator;
  readonly success: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Contact Support" });
    this.subject = page.getByLabel("Subject");
    this.message = page.getByLabel("Message", { exact: true });
    this.relatedOrder = page.getByLabel("Related order");
    this.send = page.getByRole("button", { name: "Send Message" });
    this.success = page.getByText("Message sent successfully!");
    this.rows = page.getByTestId("message-row");
  }

  async goto() {
    await this.page.goto("/practice/shop/messages");
  }

  async sendMessage(subject: string, body: string, orderNumber?: string) {
    await this.subject.fill(subject);
    if (orderNumber) await this.relatedOrder.selectOption(orderNumber);
    await this.message.fill(body);
    await this.send.click();
  }
}

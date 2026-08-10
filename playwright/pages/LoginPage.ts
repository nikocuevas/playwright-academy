import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel("Email");
    this.password = page.getByLabel("Password");
    this.submit = page.getByRole("button", { name: "Sign In" });
    // Scoped to the form: Next.js renders its own role="alert" route announcer,
    // so an unscoped getByRole('alert') is ambiguous.
    this.error = page.getByRole("form", { name: "Sign in" }).getByRole("alert");
  }

  async goto() {
    await this.page.goto("/practice/shop/login");
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Waits until the session is genuinely established. */
  async expectSignedIn(fullName: string) {
    await expect(this.page.getByTestId("account-name")).toContainText(fullName);
  }
}

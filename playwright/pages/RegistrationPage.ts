import { type Locator, type Page } from "@playwright/test";

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth: string;
  gender?: "Male" | "Female" | "Other";
  country: string;
  address: string;
  city: string;
  postalCode: string;
};

export class RegistrationPage {
  readonly page: Page;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly dateOfBirth: Locator;
  readonly country: Locator;
  readonly address: Locator;
  readonly city: Locator;
  readonly postalCode: Locator;
  readonly terms: Locator;
  readonly register: Locator;
  readonly regenerate: Locator;
  readonly successHeading: Locator;
  readonly welcome: Locator;

  constructor(page: Page) {
    this.page = page;

    // Every locator here is deliberately built on a stable hook: the label,
    // the role, or the team-owned test id. Nothing uses the generated id.
    this.firstName = page.getByLabel("First Name");
    this.lastName = page.getByLabel("Last Name");
    this.email = page.getByLabel("Email");
    this.phone = page.getByLabel("Phone");
    this.password = page.getByLabel("Password", { exact: true });
    this.confirmPassword = page.getByLabel("Confirm Password");
    this.dateOfBirth = page.getByLabel("Date of Birth");
    this.country = page.getByLabel("Country");
    this.address = page.getByLabel("Address");
    this.city = page.getByLabel("City");
    this.postalCode = page.getByLabel("Postal Code");
    this.terms = page.getByRole("checkbox", { name: /Terms and Conditions/ });
    this.register = page.getByRole("button", { name: "Register" });
    this.regenerate = page.getByRole("button", { name: "Regenerate attributes" });
    this.successHeading = page.getByRole("heading", {
      name: "Registration successful!",
    });
    this.welcome = page.getByTestId("registration-welcome");
  }

  async goto() {
    await this.page.goto("/practice/registration");
  }

  async fillForm(input: RegistrationInput) {
    await this.firstName.fill(input.firstName);
    await this.lastName.fill(input.lastName);
    await this.email.fill(input.email);
    if (input.phone) await this.phone.fill(input.phone);
    await this.password.fill(input.password);
    await this.confirmPassword.fill(input.password);
    await this.dateOfBirth.fill(input.dateOfBirth);
    if (input.gender) {
      await this.page.getByRole("radio", { name: input.gender }).check();
    }
    await this.country.selectOption(input.country);
    await this.address.fill(input.address);
    await this.city.fill(input.city);
    await this.postalCode.fill(input.postalCode);
  }

  async acceptTermsAndSubmit() {
    await this.terms.check();
    await this.register.click();
  }

  errorFor(message: string) {
    return this.page.getByText(message);
  }
}

import type { RegistrationInput } from "../pages/RegistrationPage";

/** The only account the practice app knows about. Entirely fictional. */
export const validUser = {
  email: "testuser@example.com",
  password: "Password123!",
  fullName: "Test User",
};

export const invalidUser = {
  email: "testuser@example.com",
  password: "definitely-not-the-password",
};

/**
 * Unique per run so parallel workers never collide — the pattern real suites
 * need once the app rejects duplicate emails.
 */
export function uniqueEmail(prefix = "qa") {
  const random = Math.random().toString(36).slice(2, 7);
  return `${prefix}+${Date.now()}-${random}@example.com`;
}

export function newRegistration(
  overrides: Partial<RegistrationInput> = {},
): RegistrationInput {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    email: uniqueEmail("registration"),
    phone: "4165550199",
    password: "Password123!",
    dateOfBirth: "1990-12-10",
    gender: "Female",
    country: "CA",
    address: "12 Analytical Way",
    city: "Toronto",
    postalCode: "M5V 2T6",
    ...overrides,
  };
}

export const shippingDetails = {
  firstName: "Test",
  lastName: "User",
  address: "100 Queen St W",
  city: "Toronto",
  province: "ON",
  postalCode: "M5H 2N2",
};

export const paymentDetails = {
  cardNumber: "4111111111111111",
  expiration: "12/29",
  cvv: "123",
};

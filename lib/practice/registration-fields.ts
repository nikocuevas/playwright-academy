/**
 * Field definitions for the Registration practice app.
 *
 * Shared between the real React page and the Playwright simulator's screen
 * model, so the two stay in sync: a locator that works in the simulator works
 * against the real page too.
 */

export type RegistrationFieldType =
  | "text"
  | "email"
  | "tel"
  | "password"
  | "date"
  | "select"
  | "radio"
  | "checkbox";

export type RegistrationField = {
  name: string;
  label: string;
  type: RegistrationFieldType;
  placeholder?: string;
  required: boolean;
  autoComplete?: string;
  options?: { value: string; label: string }[];
  /** Rendered in a two-column row alongside the previous field. */
  half?: boolean;
  hint?: string;
};

export const countries = [
  { value: "", label: "Select a country" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "JP", label: "Japan" },
];

export const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const registrationFields: RegistrationField[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Ada",
    required: true,
    autoComplete: "given-name",
    half: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Lovelace",
    required: true,
    autoComplete: "family-name",
    half: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "416 555 0199",
    required: false,
    autoComplete: "tel",
    hint: "Optional. 10–15 digits.",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    autoComplete: "new-password",
    half: true,
    hint: "At least 8 characters, with a letter and a number.",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    required: true,
    autoComplete: "new-password",
    half: true,
  },
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    required: true,
    half: true,
    hint: "You must be at least 18.",
  },
  {
    name: "gender",
    label: "Gender",
    type: "radio",
    required: false,
    options: genders,
  },
  {
    name: "country",
    label: "Country",
    type: "select",
    required: true,
    options: countries,
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "12 Analytical Way",
    required: true,
    autoComplete: "street-address",
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "Toronto",
    required: true,
    autoComplete: "address-level2",
    half: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    type: "text",
    placeholder: "M5V 2T6",
    required: true,
    autoComplete: "postal-code",
    half: true,
  },
];

export type RegistrationValues = Record<string, string>;

export const emptyRegistrationValues: RegistrationValues =
  Object.fromEntries(registrationFields.map((f) => [f.name, ""]));

/**
 * Validation rules. Returned as a map of field name to error message so both
 * the React form and the simulator can render identical messages.
 */
export function validateRegistration(
  values: RegistrationValues,
  acceptedTerms: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of registrationFields) {
    if (field.required && !values[field.name]?.trim()) {
      errors[field.name] = `${field.label} is required`;
    }
  }

  const email = values.email?.trim() ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  const phone = values.phone?.replace(/\D/g, "") ?? "";
  if (values.phone?.trim() && (phone.length < 10 || phone.length > 15)) {
    errors.phone = "Enter a phone number with 10 to 15 digits";
  }

  const password = values.password ?? "";
  if (password && (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password))) {
    errors.password =
      "Password must be at least 8 characters and include a letter and a number";
  }

  if (values.confirmPassword && values.confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (values.dateOfBirth) {
    const dob = new Date(values.dateOfBirth);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (Number.isNaN(dob.getTime())) {
      errors.dateOfBirth = "Enter a valid date";
    } else if (dob > eighteenYearsAgo) {
      errors.dateOfBirth = "You must be at least 18 years old";
    }
  }

  if (!acceptedTerms) {
    errors.terms = "You must accept the Terms and Conditions";
  }

  return errors;
}

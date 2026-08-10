import { test as base, expect, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { ShopPage } from "../pages/ShopPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrdersPage } from "../pages/OrdersPage";
import { MessagesPage } from "../pages/MessagesPage";

/**
 * Page objects exposed as fixtures.
 *
 * Fixtures own setup and teardown; page objects own interaction. Keeping the
 * two separate is what stops either from turning into a God object.
 */
type Fixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  shopPage: ShopPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  messagesPage: MessagesPage;
  /** A page whose cart already contains one Wireless Headphones. */
  cartWithHeadphones: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
  messagesPage: async ({ page }, use) => {
    await use(new MessagesPage(page));
  },

  cartWithHeadphones: async ({ page }, use) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.addToCart("Wireless Headphones");
    await expect(shop.cartCount).toHaveText("1");

    await use(page);

    // Teardown runs even if the test failed, so the session starts clean next
    // time this worker reuses the same cookie.
    await page.request.delete("/api/cart");
  },
});

export { expect };

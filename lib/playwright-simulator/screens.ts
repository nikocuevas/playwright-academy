import {
  cartTotals,
  filterProducts,
  getProduct,
  products,
  provinces,
} from "@/lib/practice/shop-data";
import {
  countries,
  registrationFields,
} from "@/lib/practice/registration-fields";
import type { SimNode } from "./dom";
import type { SimState } from "./app-state";

/**
 * Screens are pure functions of simulated state. Each returns the root node of
 * the simulated document for the current URL.
 */

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function shopHeader(state: SimState): SimNode {
  const count = state.cart.reduce((sum, l) => sum + l.quantity, 0);
  return {
    key: "shop-header",
    role: "banner",
    variant: "row",
    children: [
      { key: "brand", role: "heading", headingLevel: 1, text: "ShopEasy", variant: "title" },
      {
        key: "nav",
        role: "navigation",
        name: "Main",
        variant: "inline",
        children: [
          {
            key: "nav-shop",
            role: "link",
            text: "Products",
            action: { type: "navigate", payload: { url: "/practice/shop" } },
          },
          {
            key: "nav-cart",
            role: "link",
            text: "Cart",
            action: { type: "navigate", payload: { url: "/practice/shop/cart" } },
          },
          {
            key: "nav-orders",
            role: "link",
            text: "Orders",
            action: { type: "navigate", payload: { url: "/practice/shop/orders" } },
          },
          {
            key: "nav-messages",
            role: "link",
            text: "Messages",
            action: { type: "navigate", payload: { url: "/practice/shop/messages" } },
          },
        ],
      },
      {
        key: "cart-count",
        role: "status",
        testId: "cart-count",
        text: String(count),
        name: `Cart items: ${count}`,
        variant: "badge",
      },
      state.auth
        ? {
            key: "account-name",
            role: "generic",
            testId: "account-name",
            text: `Welcome back, ${state.auth.name}`,
            variant: "muted",
          }
        : {
            key: "sign-in-link",
            role: "link",
            text: "Sign In",
            action: { type: "navigate", payload: { url: "/practice/shop/login" } },
          },
    ],
  };
}

function registrationScreen(state: SimState): SimNode {
  if (state.registrationSubmitted) {
    return {
      key: "registration-success",
      role: "form",
      variant: "page",
      children: [
        {
          key: "success-heading",
          role: "heading",
          headingLevel: 1,
          text: "Registration successful!",
          variant: "success",
        },
        {
          key: "registration-welcome",
          role: "generic",
          testId: "registration-welcome",
          text: `Welcome, ${state.registeredName}.`,
        },
        {
          key: "register-another",
          role: "button",
          text: "Register another account",
          action: { type: "navigate", payload: { url: "/practice/registration" } },
        },
      ],
    };
  }

  const fieldNodes: SimNode[] = [];

  for (const field of registrationFields) {
    const error = state.registrationErrors[field.name];

    if (field.type === "radio") {
      fieldNodes.push({
        key: `group-${field.name}`,
        role: "group",
        name: field.label,
        children: [
          { key: `legend-${field.name}`, role: "generic", text: field.label, variant: "muted" },
          ...(field.options ?? []).map((option) => ({
            key: `radio-${field.name}-${option.value}`,
            role: "radio" as const,
            name: option.label,
            label: option.label,
            field: `${field.name}:${option.value}`,
            checked: state.fields[field.name] === option.value,
            attrs: { name: field.name, value: option.value },
          })),
        ],
      });
      continue;
    }

    if (field.type === "select") {
      fieldNodes.push({
        key: `field-${field.name}`,
        role: "combobox",
        label: field.label,
        name: field.label,
        field: field.name,
        value: state.fields[field.name] ?? "",
        options: field.options ?? countries,
        attrs: { name: field.name },
      });
      continue;
    }

    fieldNodes.push({
      key: `field-${field.name}`,
      role: "textbox",
      label: field.label,
      name: field.label,
      placeholder: field.placeholder,
      testId: `registration-${field.name.toLowerCase()}`,
      inputType:
        field.type === "password"
          ? "password"
          : field.type === "email"
            ? "email"
            : field.type === "tel"
              ? "tel"
              : field.type === "date"
                ? "date"
                : "text",
      field: field.name,
      value: state.fields[field.name] ?? "",
      attrs: { name: field.name },
    });

    if (error) {
      fieldNodes.push({
        key: `error-${field.name}`,
        role: "alert",
        text: error,
        variant: "error",
      });
    }
  }

  return {
    key: "registration-form",
    role: "form",
    name: "Registration",
    variant: "page",
    children: [
      {
        key: "registration-heading",
        role: "heading",
        headingLevel: 1,
        text: "Create your account",
        variant: "title",
      },
      ...fieldNodes,
      {
        key: "terms",
        role: "checkbox",
        name: "Terms and Conditions",
        label: "Terms and Conditions",
        field: "terms",
        checked: Boolean(state.checks.terms),
        attrs: { name: "terms" },
      },
      ...(state.registrationErrors.terms
        ? [
            {
              key: "error-terms",
              role: "alert" as const,
              text: state.registrationErrors.terms,
              variant: "error" as const,
            },
          ]
        : []),
      {
        key: "register-button",
        role: "button",
        text: "Register",
        variant: "primary",
        action: { type: "registration.submit" },
      },
    ],
  };
}

function loginScreen(state: SimState): SimNode {
  return {
    key: "login-page",
    role: "form",
    name: "Sign in",
    variant: "page",
    children: [
      {
        key: "login-heading",
        role: "heading",
        headingLevel: 1,
        text: "Sign in to ShopEasy",
        variant: "title",
      },
      {
        key: "login-email",
        role: "textbox",
        label: "Email",
        name: "Email",
        inputType: "email",
        placeholder: "you@example.com",
        field: "loginEmail",
        value: state.fields.loginEmail ?? "",
        attrs: { name: "email" },
      },
      {
        key: "login-password",
        role: "textbox",
        label: "Password",
        name: "Password",
        inputType: "password",
        field: "loginPassword",
        value: state.fields.loginPassword ?? "",
        attrs: { name: "password" },
      },
      ...(state.loginError
        ? [
            {
              key: "login-error",
              role: "alert" as const,
              text: state.loginError,
              variant: "error" as const,
            },
          ]
        : []),
      {
        key: "login-submit",
        role: "button",
        text: "Sign In",
        variant: "primary",
        action: { type: "login.submit" },
      },
      {
        key: "login-hint",
        role: "generic",
        text: "Demo credentials: testuser@example.com / Password123!",
        variant: "muted",
      },
    ],
  };
}

function shopScreen(state: SimState): SimNode {
  const visible = filterProducts({
    query: state.search,
    category: state.category,
  });

  const cards: SimNode[] = visible.map((product) => ({
    key: `product-${product.id}`,
    role: "article",
    name: product.name,
    attrs: { "data-product-id": pseudoProductId(product.id) },
    variant: "card",
    children: [
      {
        key: `product-name-${product.id}`,
        role: "heading",
        headingLevel: 2,
        text: product.name,
      },
      {
        key: `product-blurb-${product.id}`,
        role: "generic",
        text: product.blurb,
        variant: "muted",
      },
      {
        key: `product-price-${product.id}`,
        role: "generic",
        testId: "product-price",
        text: money(product.price),
        variant: "price",
      },
      {
        key: `product-view-${product.id}`,
        role: "link",
        text: "View details",
        action: {
          type: "navigate",
          payload: { url: `/practice/shop/product/${product.id}` },
        },
      },
      {
        key: `product-add-${product.id}`,
        role: "button",
        text: product.inStock ? "Add to Cart" : "Notify Me",
        variant: "primary",
        disabled: !product.inStock,
        action: { type: "cart.add", payload: { productId: product.id } },
      },
    ],
  }));

  return {
    key: "shop-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      {
        key: "shop-heading",
        role: "heading",
        headingLevel: 1,
        text: "Products",
        variant: "title",
      },
      {
        key: "shop-search",
        role: "searchbox",
        label: "Search products",
        name: "Search products",
        placeholder: "Search products",
        inputType: "search",
        field: "shopSearch",
        value: state.fields.shopSearch ?? "",
        attrs: { name: "q" },
      },
      {
        key: "shop-search-submit",
        role: "button",
        text: "Search",
        action: { type: "search.submit" },
      },
      ...(cards.length > 0
        ? cards
        : [
            {
              key: "no-products",
              role: "generic" as const,
              text: "No products match your search",
              variant: "muted" as const,
            },
          ]),
    ],
  };
}

function productScreen(state: SimState, productId: string): SimNode {
  const product = getProduct(productId);
  if (!product) {
    return notFoundScreen(state.url);
  }

  return {
    key: "product-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      {
        key: "product-title",
        role: "heading",
        headingLevel: 1,
        text: product.name,
        variant: "title",
      },
      {
        key: "product-description",
        role: "generic",
        text: product.description,
      },
      {
        key: "product-detail-price",
        role: "generic",
        testId: "product-price",
        text: money(product.price),
        variant: "price",
      },
      {
        key: "product-detail-add",
        role: "button",
        text: "Add to Cart",
        variant: "primary",
        disabled: !product.inStock,
        action: { type: "cart.add", payload: { productId: product.id } },
      },
      {
        key: "product-back",
        role: "link",
        text: "Back to products",
        action: { type: "navigate", payload: { url: "/practice/shop" } },
      },
    ],
  };
}

function cartScreen(state: SimState): SimNode {
  const totals = cartTotals(state.cart);

  const items: SimNode[] = state.cart.map((line) => {
    const product = getProduct(line.productId)!;
    return {
      key: `cart-item-${line.productId}`,
      role: "row",
      testId: "cart-item",
      name: product.name,
      variant: "row",
      children: [
        {
          key: `cart-name-${line.productId}`,
          role: "cell",
          testId: "cart-item-name",
          text: product.name,
        },
        {
          key: `cart-qty-${line.productId}`,
          role: "cell",
          testId: "cart-item-quantity",
          text: String(line.quantity),
        },
        {
          key: `cart-line-total-${line.productId}`,
          role: "cell",
          text: money(product.price * line.quantity),
        },
        {
          key: `cart-inc-${line.productId}`,
          role: "button",
          text: "Increase quantity",
          action: { type: "cart.increment", payload: { productId: line.productId } },
        },
        {
          key: `cart-remove-${line.productId}`,
          role: "button",
          text: "Remove",
          action: { type: "cart.remove", payload: { productId: line.productId } },
        },
      ],
    };
  });

  return {
    key: "cart-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      { key: "cart-heading", role: "heading", headingLevel: 1, text: "Your Cart", variant: "title" },
      ...(items.length > 0
        ? items
        : [
            {
              key: "cart-empty",
              role: "generic" as const,
              text: "Your cart is empty",
              variant: "muted" as const,
            },
          ]),
      {
        key: "cart-total",
        role: "generic",
        testId: "cart-total",
        text: money(totals.total),
        variant: "price",
      },
      {
        key: "cart-checkout",
        role: "link",
        text: "Proceed to Checkout",
        variant: "primary",
        action: { type: "navigate", payload: { url: "/practice/shop/checkout" } },
      },
    ],
  };
}

const checkoutFields: { field: string; label: string; placeholder?: string }[] = [
  { field: "shipFirstName", label: "First Name" },
  { field: "shipLastName", label: "Last Name" },
  { field: "shipAddress", label: "Address" },
  { field: "shipCity", label: "City" },
  { field: "shipPostalCode", label: "Postal Code" },
  { field: "cardNumber", label: "Card Number", placeholder: "4111 1111 1111 1111" },
  { field: "cardExpiry", label: "Expiration", placeholder: "MM/YY" },
  { field: "cardCvv", label: "CVV", placeholder: "123" },
];

function checkoutScreen(state: SimState): SimNode {
  if (state.lastOrder) {
    return {
      key: "confirmation-page",
      role: "generic",
      variant: "page",
      children: [
        shopHeader(state),
        {
          key: "confirmation-heading",
          role: "heading",
          headingLevel: 1,
          text: "Order Successful!",
          variant: "success",
        },
        {
          key: "order-number",
          role: "generic",
          testId: "order-number",
          text: state.lastOrder.orderNumber,
        },
        {
          key: "order-total",
          role: "generic",
          testId: "order-total",
          text: money(state.lastOrder.total),
        },
        {
          key: "confirmation-orders-link",
          role: "link",
          text: "View Orders",
          action: { type: "navigate", payload: { url: "/practice/shop/orders" } },
        },
      ],
    };
  }

  return {
    key: "checkout-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      { key: "checkout-heading", role: "heading", headingLevel: 1, text: "Checkout", variant: "title" },
      ...checkoutFields.map<SimNode>((f) => ({
        key: `checkout-${f.field}`,
        role: "textbox",
        label: f.label,
        name: f.label,
        placeholder: f.placeholder,
        field: f.field,
        value: state.fields[f.field] ?? "",
        attrs: { name: f.field },
      })),
      {
        key: "checkout-province",
        role: "combobox",
        label: "Province",
        name: "Province",
        field: "shipProvince",
        value: state.fields.shipProvince ?? "",
        options: [{ value: "", label: "Select a province" }, ...provinces],
        attrs: { name: "province" },
      },
      ...(state.registrationErrors.checkout
        ? [
            {
              key: "checkout-error",
              role: "alert" as const,
              text: state.registrationErrors.checkout,
              variant: "error" as const,
            },
          ]
        : []),
      {
        key: "place-order",
        role: "button",
        text: "Place Order",
        variant: "primary",
        disabled: state.cart.length === 0,
        action: { type: "checkout.place" },
      },
    ],
  };
}

function ordersScreen(state: SimState): SimNode {
  return {
    key: "orders-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      { key: "orders-heading", role: "heading", headingLevel: 1, text: "Your Orders", variant: "title" },
      {
        key: "orders-table",
        role: "table",
        name: "Orders",
        variant: "table",
        children: state.orders.map<SimNode>((order) => ({
          key: `order-${order.orderNumber}`,
          role: "row",
          testId: "order-row",
          variant: "row",
          children: [
            {
              key: `order-number-${order.orderNumber}`,
              role: "cell",
              text: order.orderNumber,
            },
            {
              key: `order-date-${order.orderNumber}`,
              role: "cell",
              text: order.placedAt,
            },
            {
              key: `order-total-${order.orderNumber}`,
              role: "cell",
              text: money(order.total),
            },
            {
              key: `order-status-${order.orderNumber}`,
              role: "cell",
              testId: "order-status",
              text: order.status,
            },
            {
              key: `order-cancel-${order.orderNumber}`,
              role: "button",
              text: "Cancel",
              disabled: order.status !== "Pending",
              action: {
                type: "order.cancel",
                payload: { orderNumber: order.orderNumber },
              },
            },
          ],
        })),
      },
    ],
  };
}

function messagesScreen(state: SimState): SimNode {
  return {
    key: "messages-page",
    role: "generic",
    variant: "page",
    children: [
      shopHeader(state),
      {
        key: "messages-heading",
        role: "heading",
        headingLevel: 1,
        text: "Contact Support",
        variant: "title",
      },
      {
        key: "message-subject",
        role: "textbox",
        label: "Subject",
        name: "Subject",
        field: "messageSubject",
        value: state.fields.messageSubject ?? "",
        attrs: { name: "subject" },
      },
      {
        key: "message-body",
        role: "textbox",
        label: "Message",
        name: "Message",
        field: "messageBody",
        value: state.fields.messageBody ?? "",
        attrs: { name: "message" },
      },
      ...(state.registrationErrors.message
        ? [
            {
              key: "message-error",
              role: "alert" as const,
              text: state.registrationErrors.message,
              variant: "error" as const,
            },
          ]
        : []),
      {
        key: "send-message",
        role: "button",
        text: "Send Message",
        variant: "primary",
        action: { type: "message.send" },
      },
      ...(state.messageSent
        ? [
            {
              key: "message-success",
              role: "status" as const,
              testId: "message-success",
              text: "Message sent successfully!",
              variant: "success" as const,
            },
          ]
        : []),
    ],
  };
}

function notFoundScreen(url: string): SimNode {
  return {
    key: "not-found",
    role: "generic",
    variant: "page",
    children: [
      { key: "nf-heading", role: "heading", headingLevel: 1, text: "404 — Page not found" },
      { key: "nf-url", role: "generic", text: url, variant: "muted" },
      {
        key: "nf-known",
        role: "generic",
        variant: "muted",
        text: "Known routes: /practice/registration, /practice/shop, /practice/shop/login, /practice/shop/cart, /practice/shop/checkout, /practice/shop/orders, /practice/shop/messages",
      },
    ],
  };
}

/**
 * Product ids in the DOM are regenerated so learners cannot depend on them —
 * exactly like the real practice app.
 */
function pseudoProductId(productId: string) {
  const base = Number(productId.replace(/\D/g, "")) || 1;
  const jitter = Math.floor((Date.now() / 60000) % 900) + 100;
  return String(base * 823 + jitter);
}

export function render(state: SimState): SimNode {
  const url = state.url;

  if (url === "/practice/registration") return registrationScreen(state);
  if (url === "/practice/shop/login") return loginScreen(state);
  if (url === "/practice/shop") return shopScreen(state);
  if (url.startsWith("/practice/shop/product/")) {
    return productScreen(state, url.split("/").pop() ?? "");
  }
  if (url === "/practice/shop/cart") return cartScreen(state);
  if (url === "/practice/shop/checkout") return checkoutScreen(state);
  if (url === "/practice/shop/orders") return ordersScreen(state);
  if (url === "/practice/shop/messages") return messagesScreen(state);

  return notFoundScreen(url);
}

export const knownRoutes = [
  "/practice/registration",
  "/practice/shop",
  "/practice/shop/login",
  "/practice/shop/cart",
  "/practice/shop/checkout",
  "/practice/shop/orders",
  "/practice/shop/messages",
];

export const allProductNames = products.map((p) => p.name);

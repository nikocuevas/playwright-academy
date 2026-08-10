/**
 * The ShopEasy catalogue.
 *
 * Deliberately fixed and small: every learner sees the same six products, so
 * exercises, solutions and the SQL lab all line up. Prices are in USD.
 */

export type Product = {
  id: string;
  name: string;
  category: "audio" | "peripherals" | "wearables" | "displays";
  price: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  blurb: string;
  description: string;
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    id: "p-1001",
    name: "Wireless Headphones",
    category: "audio",
    price: 249.5,
    rating: 4.6,
    reviews: 318,
    inStock: true,
    badge: "Best Seller",
    blurb: "Over-ear, active noise cancelling, 30-hour battery.",
    description:
      "Over-ear wireless headphones with adaptive noise cancelling, a 30-hour battery and multipoint pairing for two devices at once.",
    specs: [
      { label: "Battery", value: "30 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Weight", value: "254 g" },
    ],
  },
  {
    id: "p-1002",
    name: "Mechanical Keyboard",
    category: "peripherals",
    price: 89.99,
    rating: 4.4,
    reviews: 194,
    inStock: true,
    blurb: "75% layout, hot-swappable switches, PBT keycaps.",
    description:
      "A compact 75% mechanical keyboard with hot-swappable switches, PBT double-shot keycaps and a gasket-mounted plate.",
    specs: [
      { label: "Layout", value: "75%" },
      { label: "Switches", value: "Hot-swappable, tactile" },
      { label: "Connection", value: "USB-C, detachable" },
    ],
  },
  {
    id: "p-1003",
    name: "USB-C Hub",
    category: "peripherals",
    price: 42.0,
    rating: 4.1,
    reviews: 87,
    inStock: true,
    blurb: "7-in-1: HDMI, Ethernet, SD, 100 W passthrough.",
    description:
      "Seven ports in one aluminium body: HDMI 4K60, Gigabit Ethernet, SD and microSD, two USB-A and 100 W power passthrough.",
    specs: [
      { label: "Ports", value: "7" },
      { label: "HDMI", value: "4K @ 60 Hz" },
      { label: "Power", value: "100 W passthrough" },
    ],
  },
  {
    id: "p-1004",
    name: "Fitness Tracker",
    category: "wearables",
    price: 129.95,
    rating: 4.0,
    reviews: 246,
    inStock: false,
    badge: "Out of Stock",
    blurb: "Heart rate, SpO2, sleep staging, 10-day battery.",
    description:
      "A lightweight tracker with continuous heart rate, blood oxygen monitoring, sleep staging and a ten-day battery.",
    specs: [
      { label: "Battery", value: "10 days" },
      { label: "Water resistance", value: "5 ATM" },
      { label: "Sensors", value: "HR, SpO2, accelerometer" },
    ],
  },
  {
    id: "p-1005",
    name: "27-inch Monitor",
    category: "displays",
    price: 399.0,
    rating: 4.7,
    reviews: 412,
    inStock: true,
    badge: "Staff Pick",
    blurb: "4K IPS, 144 Hz, USB-C 90 W, height adjustable.",
    description:
      "A 27-inch 4K IPS panel running at 144 Hz with a single-cable USB-C connection delivering 90 W of charging.",
    specs: [
      { label: "Resolution", value: "3840 × 2160" },
      { label: "Refresh rate", value: "144 Hz" },
      { label: "Panel", value: "IPS, 98% DCI-P3" },
    ],
  },
  {
    id: "p-1006",
    name: "Desk Microphone",
    category: "audio",
    price: 119.0,
    rating: 4.3,
    reviews: 133,
    inStock: true,
    blurb: "Cardioid USB condenser with a zero-latency monitor.",
    description:
      "A cardioid USB condenser microphone with onboard gain, a mute button and zero-latency headphone monitoring.",
    specs: [
      { label: "Pattern", value: "Cardioid" },
      { label: "Sample rate", value: "48 kHz / 24-bit" },
      { label: "Mount", value: "Desk stand + boom thread" },
    ],
  },
];

export const categories = [
  { value: "all", label: "All products" },
  { value: "audio", label: "Audio" },
  { value: "peripherals", label: "Peripherals" },
  { value: "wearables", label: "Wearables" },
  { value: "displays", label: "Displays" },
] as const;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function findProductByName(name: string) {
  const needle = name.trim().toLowerCase();
  return products.find((p) => p.name.toLowerCase() === needle);
}

export function filterProducts({
  query,
  category,
  sort,
}: {
  query?: string;
  category?: string;
  sort?: string;
}) {
  let result = [...products];

  if (query?.trim()) {
    const needle = query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.blurb.toLowerCase().includes(needle) ||
        p.category.includes(needle),
    );
  }

  if (category && category !== "all") {
    result = result.filter((p) => p.category === category);
  }

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return result;
}

/** The only account that exists in the practice app. Entirely fictional. */
export const demoUser = {
  id: "u-1001",
  email: "testuser@example.com",
  password: "Password123!",
  firstName: "Test",
  lastName: "User",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
};

export const provinces = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "ON", label: "Ontario" },
  { value: "QC", label: "Quebec" },
];

export type CartLine = { productId: string; quantity: number };

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => {
    const product = getProduct(line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
}

export const SHIPPING_FLAT_RATE = 9.99;
export const TAX_RATE = 0.13;

export function cartTotals(lines: CartLine[]) {
  const subtotal = round2(cartSubtotal(lines));
  const shipping = lines.length === 0 ? 0 : SHIPPING_FLAT_RATE;
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal, shipping, tax, total: round2(subtotal + shipping + tax) };
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** ORD-###### — deterministic per sequence position so tests stay reproducible. */
export function makeOrderNumber(sequence: number) {
  return `ORD-${(839472 + sequence * 137).toString().slice(0, 6)}`;
}

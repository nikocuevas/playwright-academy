/**
 * The SQL Lab dataset.
 *
 * Seven tables that mirror the ShopEasy domain, seeded with data that contains
 * deliberate inconsistencies — a cancelled order with a completed payment, a
 * payment whose amount disagrees with its order, an orphaned line item and a
 * message pointing at a non-existent order. Those are the bugs the QA
 * validation exercises ask you to find.
 */

export type SqlValue = string | number | null;
export type Row = Record<string, SqlValue>;

export type Column = {
  name: string;
  type: "text" | "integer" | "real" | "date";
  description: string;
};

export type Table = {
  name: string;
  description: string;
  columns: Column[];
  rows: Row[];
};

const users: Table = {
  name: "users",
  description: "Registered ShopEasy customers.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "first_name", type: "text", description: "Given name" },
    { name: "last_name", type: "text", description: "Family name" },
    { name: "email", type: "text", description: "Login email" },
    { name: "phone", type: "text", description: "Optional phone number" },
    { name: "status", type: "text", description: "active | inactive | locked" },
    { name: "created_at", type: "date", description: "Registration date" },
  ],
  rows: [
    { id: 1, first_name: "Test", last_name: "User", email: "testuser@example.com", phone: "4165550199", status: "active", created_at: "2025-11-02" },
    { id: 2, first_name: "Ada", last_name: "Lovelace", email: "ada@example.com", phone: null, status: "active", created_at: "2025-12-14" },
    { id: 3, first_name: "Grace", last_name: "Hopper", email: "grace@example.com", phone: "2125550142", status: "active", created_at: "2026-01-08" },
    { id: 4, first_name: "Alan", last_name: "Turing", email: "alan@example.com", phone: null, status: "inactive", created_at: "2026-01-22" },
    { id: 5, first_name: "Katherine", last_name: "Johnson", email: "katherine@example.com", phone: "7135550110", status: "active", created_at: "2026-02-03" },
    { id: 6, first_name: "Margaret", last_name: "Hamilton", email: "margaret@example.com", phone: "6175550188", status: "locked", created_at: "2026-02-19" },
    { id: 7, first_name: "Barbara", last_name: "Liskov", email: "barbara@example.com", phone: null, status: "active", created_at: "2026-03-05" },
    { id: 8, first_name: "Radia", last_name: "Perlman", email: "radia@example.com", phone: "4255550173", status: "active", created_at: "2026-04-11" },
  ],
};

const products: Table = {
  name: "products",
  description: "The product catalogue.",
  columns: [
    { name: "id", type: "text", description: "Primary key" },
    { name: "name", type: "text", description: "Display name" },
    { name: "category", type: "text", description: "audio | peripherals | wearables | displays" },
    { name: "price", type: "real", description: "Unit price in USD" },
    { name: "in_stock", type: "integer", description: "1 = available, 0 = out of stock" },
    { name: "rating", type: "real", description: "Average customer rating" },
  ],
  rows: [
    { id: "p-1001", name: "Wireless Headphones", category: "audio", price: 249.5, in_stock: 1, rating: 4.6 },
    { id: "p-1002", name: "Mechanical Keyboard", category: "peripherals", price: 89.99, in_stock: 1, rating: 4.4 },
    { id: "p-1003", name: "USB-C Hub", category: "peripherals", price: 42.0, in_stock: 1, rating: 4.1 },
    { id: "p-1004", name: "Fitness Tracker", category: "wearables", price: 129.95, in_stock: 0, rating: 4.0 },
    { id: "p-1005", name: "27-inch Monitor", category: "displays", price: 399.0, in_stock: 1, rating: 4.7 },
    { id: "p-1006", name: "Desk Microphone", category: "audio", price: 119.0, in_stock: 1, rating: 4.3 },
  ],
};

const orders: Table = {
  name: "orders",
  description: "Customer orders. `total` is the stored order total.",
  columns: [
    { name: "id", type: "text", description: "Order number, ORD-######" },
    { name: "user_id", type: "integer", description: "References users.id" },
    { name: "status", type: "text", description: "pending | paid | shipped | cancelled" },
    { name: "total", type: "real", description: "Stored order total in USD" },
    { name: "placed_at", type: "date", description: "Order date" },
  ],
  rows: [
    { id: "ORD-839472", user_id: 1, status: "cancelled", total: 249.5, placed_at: "2026-06-02" },
    { id: "ORD-839609", user_id: 1, status: "shipped", total: 131.99, placed_at: "2026-06-11" },
    { id: "ORD-839746", user_id: 2, status: "paid", total: 399.0, placed_at: "2026-06-15" },
    { id: "ORD-839883", user_id: 3, status: "paid", total: 208.99, placed_at: "2026-06-21" },
    { id: "ORD-840020", user_id: 3, status: "pending", total: 42.0, placed_at: "2026-07-01" },
    { id: "ORD-840157", user_id: 5, status: "shipped", total: 518.5, placed_at: "2026-07-04" },
    { id: "ORD-840294", user_id: 5, status: "cancelled", total: 129.95, placed_at: "2026-07-09" },
    { id: "ORD-840431", user_id: 8, status: "paid", total: 161.99, placed_at: "2026-07-18" },
    // Stored total disagrees with the sum of its line items — a real bug.
    { id: "ORD-840568", user_id: 2, status: "paid", total: 100.0, placed_at: "2026-07-25" },
  ],
};

const orderItems: Table = {
  name: "order_items",
  description: "Line items. One row per product per order.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "order_id", type: "text", description: "References orders.id" },
    { name: "product_id", type: "text", description: "References products.id" },
    { name: "quantity", type: "integer", description: "Units ordered" },
    { name: "unit_price", type: "real", description: "Price at the time of purchase" },
  ],
  rows: [
    { id: 1, order_id: "ORD-839472", product_id: "p-1001", quantity: 1, unit_price: 249.5 },
    { id: 2, order_id: "ORD-839609", product_id: "p-1002", quantity: 1, unit_price: 89.99 },
    { id: 3, order_id: "ORD-839609", product_id: "p-1003", quantity: 1, unit_price: 42.0 },
    { id: 4, order_id: "ORD-839746", product_id: "p-1005", quantity: 1, unit_price: 399.0 },
    { id: 5, order_id: "ORD-839883", product_id: "p-1006", quantity: 1, unit_price: 119.0 },
    { id: 6, order_id: "ORD-839883", product_id: "p-1002", quantity: 1, unit_price: 89.99 },
    { id: 7, order_id: "ORD-840020", product_id: "p-1003", quantity: 1, unit_price: 42.0 },
    { id: 8, order_id: "ORD-840157", product_id: "p-1001", quantity: 1, unit_price: 249.5 },
    { id: 9, order_id: "ORD-840157", product_id: "p-1005", quantity: 1, unit_price: 269.0 },
    { id: 10, order_id: "ORD-840294", product_id: "p-1004", quantity: 1, unit_price: 129.95 },
    { id: 11, order_id: "ORD-840431", product_id: "p-1006", quantity: 1, unit_price: 119.0 },
    { id: 12, order_id: "ORD-840431", product_id: "p-1003", quantity: 1, unit_price: 42.99 },
    { id: 13, order_id: "ORD-840568", product_id: "p-1001", quantity: 2, unit_price: 249.5 },
    // Orphaned: the order it references does not exist.
    { id: 14, order_id: "ORD-999999", product_id: "p-1002", quantity: 1, unit_price: 89.99 },
  ],
};

const payments: Table = {
  name: "payments",
  description: "Payment records, one per paid order.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "order_id", type: "text", description: "References orders.id" },
    { name: "amount", type: "real", description: "Amount captured in USD" },
    { name: "status", type: "text", description: "completed | pending | refunded | failed" },
    { name: "method", type: "text", description: "card | paypal" },
    { name: "paid_at", type: "date", description: "Capture date" },
  ],
  rows: [
    // Cancelled order that was still charged — the headline data bug.
    { id: 1, order_id: "ORD-839472", amount: 249.5, status: "completed", method: "card", paid_at: "2026-06-02" },
    { id: 2, order_id: "ORD-839609", amount: 131.99, status: "completed", method: "card", paid_at: "2026-06-11" },
    { id: 3, order_id: "ORD-839746", amount: 399.0, status: "completed", method: "paypal", paid_at: "2026-06-15" },
    { id: 4, order_id: "ORD-839883", amount: 208.99, status: "completed", method: "card", paid_at: "2026-06-21" },
    { id: 5, order_id: "ORD-840157", amount: 518.5, status: "completed", method: "card", paid_at: "2026-07-04" },
    // Amount does not match the order total.
    { id: 6, order_id: "ORD-840294", amount: 139.95, status: "refunded", method: "card", paid_at: "2026-07-09" },
    { id: 7, order_id: "ORD-840431", amount: 161.99, status: "failed", method: "card", paid_at: "2026-07-18" },
    { id: 8, order_id: "ORD-840568", amount: 499.0, status: "completed", method: "card", paid_at: "2026-07-25" },
  ],
};

const addresses: Table = {
  name: "addresses",
  description: "Shipping addresses.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "user_id", type: "integer", description: "References users.id" },
    { name: "city", type: "text", description: "City" },
    { name: "province", type: "text", description: "Province or state code" },
    { name: "postal_code", type: "text", description: "Postal code" },
    { name: "country", type: "text", description: "ISO country code" },
    { name: "is_default", type: "integer", description: "1 = default address" },
  ],
  rows: [
    { id: 1, user_id: 1, city: "Toronto", province: "ON", postal_code: "M5H 2N2", country: "CA", is_default: 1 },
    { id: 2, user_id: 2, city: "London", province: "ON", postal_code: "N6A 3K7", country: "CA", is_default: 1 },
    { id: 3, user_id: 3, city: "New York", province: "NY", postal_code: "10012", country: "US", is_default: 1 },
    { id: 4, user_id: 3, city: "Boston", province: "MA", postal_code: "02110", country: "US", is_default: 1 },
    { id: 5, user_id: 5, city: "Houston", province: "TX", postal_code: "77002", country: "US", is_default: 1 },
    { id: 6, user_id: 8, city: "Seattle", province: "WA", postal_code: "98101", country: "US", is_default: 0 },
  ],
};

const messages: Table = {
  name: "messages",
  description: "Support messages sent by customers.",
  columns: [
    { name: "id", type: "integer", description: "Primary key" },
    { name: "user_id", type: "integer", description: "References users.id" },
    { name: "order_id", type: "text", description: "References orders.id, may be NULL" },
    { name: "subject", type: "text", description: "Message subject" },
    { name: "status", type: "text", description: "open | answered | closed" },
    { name: "sent_at", type: "date", description: "Send date" },
  ],
  rows: [
    { id: 1, user_id: 1, order_id: "ORD-839472", subject: "Why was my order cancelled?", status: "open", sent_at: "2026-06-03" },
    { id: 2, user_id: 1, order_id: null, subject: "Do you ship internationally?", status: "answered", sent_at: "2026-06-08" },
    { id: 3, user_id: 3, order_id: "ORD-839883", subject: "Missing item in my delivery", status: "open", sent_at: "2026-06-23" },
    { id: 4, user_id: 5, order_id: "ORD-840157", subject: "Request an invoice", status: "closed", sent_at: "2026-07-06" },
    // References an order that does not exist.
    { id: 5, user_id: 8, order_id: "ORD-777777", subject: "Where is my package?", status: "open", sent_at: "2026-07-20" },
  ],
};

export const database: Table[] = [
  users,
  products,
  orders,
  orderItems,
  payments,
  addresses,
  messages,
];

export function getTable(name: string): Table | undefined {
  return database.find((t) => t.name.toLowerCase() === name.toLowerCase());
}

export const tableNames = database.map((t) => t.name);

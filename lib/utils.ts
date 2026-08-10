import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `1234` -> `1,234` */
export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Cents-free currency formatting used across the ShopEasy practice app. */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function percent(done: number, total: number) {
  if (total <= 0) return 0;
  return clamp(Math.round((done / total) * 100), 0, 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Deterministic pseudo-random generator (mulberry32).
 * The practice apps use it so "random looking" ids stay reproducible for a
 * given seed — which is what makes the dynamic-locator exercises fair.
 */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random-looking, seed-stable numeric id such as `input-837462`. */
export function pseudoId(prefix: string, rand: () => number, digits = 6) {
  const max = 10 ** digits;
  const min = 10 ** (digits - 1);
  const value = Math.floor(rand() * (max - min)) + min;
  return `${prefix}-${value}`;
}

/** Random-looking alphanumeric token such as `a83jd92`. */
export function pseudoToken(rand: () => number, length = 7) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(rand() * alphabet.length)];
  }
  return out;
}

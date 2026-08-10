import type { Metadata } from "next";
import { ShopProvider } from "@/components/shop/shop-provider";
import { ShopHeader } from "@/components/shop/shop-header";

export const metadata: Metadata = {
  title: {
    default: "ShopEasy",
    template: "%s · ShopEasy",
  },
  description:
    "A realistic e-commerce practice application for end-to-end Playwright automation.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopProvider>
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </ShopProvider>
  );
}

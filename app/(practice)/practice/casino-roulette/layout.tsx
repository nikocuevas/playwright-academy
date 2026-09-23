import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "European Roulette",
    template: "%s · Casino QA Lab",
  },
  description:
    "A deterministic European Roulette simulator for QA automation practice — virtual credits only, no real gambling, no real money.",
};

export default function CasinoRouletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>;
}

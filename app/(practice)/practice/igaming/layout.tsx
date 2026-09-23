import type { Metadata } from "next";
import { IgamingProvider } from "@/components/igaming/igaming-provider";
import { IgamingHeader } from "@/components/igaming/igaming-header";

export const metadata: Metadata = {
  title: {
    default: "iGaming Practice",
    template: "%s · iGaming Practice",
  },
  description:
    "A simulated online gambling platform for QA automation practice — fake balances, fake bets, no real money.",
};

export default function IgamingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IgamingProvider>
      <IgamingHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </IgamingProvider>
  );
}

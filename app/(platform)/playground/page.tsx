import { Suspense } from "react";
import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playwright Playground",
  description:
    "Write Playwright code and watch it execute against a simulated browser, with Playwright-shaped errors when it fails.",
};

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
          Loading the playground…
        </div>
      }
    >
      <Playground />
    </Suspense>
  );
}

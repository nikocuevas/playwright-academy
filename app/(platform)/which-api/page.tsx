import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { DecisionHelper } from "./decision-helper";

export const metadata: Metadata = {
  title: "Which API should I use?",
  description:
    "An interactive decision helper for choosing the right Playwright method — waits, locators and the layer an assertion belongs at.",
};

export default function WhichApiPage() {
  return (
    <>
      <PageHeader
        title="Which API should I use?"
        description="Answer one question and get a recommendation, the reasoning behind it, and the trap to avoid."
      />
      <PageBody>
        <DecisionHelper />
      </PageBody>
    </>
  );
}

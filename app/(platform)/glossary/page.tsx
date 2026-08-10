import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { GlossaryView } from "./glossary-view";
import { glossary } from "@/content/glossary";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Glossary",
  description: "QA automation vocabulary, defined in plain language.",
};

export default function GlossaryPage() {
  return (
    <>
      <PageHeader
        title="Glossary"
        description="The terms that come up constantly in Playwright and QA automation work."
        meta={<Badge>{glossary.length} terms</Badge>}
      />
      <PageBody>
        <GlossaryView />
      </PageBody>
    </>
  );
}

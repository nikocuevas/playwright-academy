import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { ApiReferenceView } from "./api-reference-view";
import { apiReference } from "@/content/api-reference";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "Page, Locator, Browser, BrowserContext, APIRequestContext, Route, Request, Response, Test and Expect — with examples and common mistakes.",
};

export default function ApiReferencePage() {
  const simulated = apiReference.filter((e) => e.simulated).length;

  return (
    <>
      <PageHeader
        title="API Reference"
        description="The Playwright APIs that matter most, each with its signature, parameters, a worked example and the mistakes people actually make."
        meta={
          <>
            <Badge>{apiReference.length} entries</Badge>
            <Badge tone="violet">{simulated} runnable in the playground</Badge>
          </>
        }
      />
      <PageBody>
        <ApiReferenceView />
      </PageBody>
    </>
  );
}

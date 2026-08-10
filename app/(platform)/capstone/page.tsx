import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { CapstoneTracker } from "./capstone-tracker";
import { Badge } from "@/components/ui/badge";
import { capstoneTasks } from "@/content/capstone";

export const metadata: Metadata = {
  title: "Capstone",
  description:
    "Build the ShopEasy Automation Framework: page objects, fixtures, authentication, API validation, network mocking and CI.",
};

export default function CapstonePage() {
  return (
    <>
      <PageHeader
        title="Capstone: ShopEasy Automation Framework"
        description="Build a production-shaped Playwright suite against the practice applications. Not a folder of recorded scripts — something another engineer could join tomorrow."
        breadcrumb={[{ label: "Learn", href: "/learn" }, { label: "Capstone" }]}
        meta={
          <>
            <Badge tone="danger">Expert</Badge>
            <Badge>{capstoneTasks.length} deliverables</Badge>
          </>
        }
      />
      <PageBody>
        <CapstoneTracker />
      </PageBody>
    </>
  );
}

import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Playwright Academy training overview and next steps.",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Where you are, what is next, and everything you can practise on."
      />
      <PageBody wide>
        <DashboardContent />
      </PageBody>
    </>
  );
}

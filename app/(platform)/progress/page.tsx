import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { ProgressView } from "./progress-view";

export const metadata: Metadata = {
  title: "Progress",
  description: "Track completion across lessons, quizzes, challenges and SQL exercises.",
};

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progress"
        description="Everything you have completed, stored in this browser only."
      />
      <PageBody>
        <ProgressView />
      </PageBody>
    </>
  );
}

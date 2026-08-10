import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/page-header";
import { ChallengeList } from "./challenge-list";
import { challenges } from "@/content/challenges";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Challenges",
  description:
    "Coding challenges with starter code, progressive hints and full solutions.",
};

export default function ChallengesPage() {
  const playgroundCount = challenges.filter((c) => c.venue === "playground").length;

  return (
    <>
      <PageHeader
        title="Challenges"
        description="Some run in the browser playground; the rest are written locally and run with real Playwright. Every one comes with progressive hints and a worked solution."
        meta={
          <>
            <Badge tone="accent">{playgroundCount} in the playground</Badge>
            <Badge tone="info">{challenges.length - playgroundCount} local exercises</Badge>
          </>
        }
      />
      <PageBody>
        <ChallengeList />
      </PageBody>
    </>
  );
}

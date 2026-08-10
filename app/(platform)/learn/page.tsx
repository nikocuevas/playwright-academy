import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-header";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { LessonCompleteBadge } from "@/components/lesson/mark-complete";
import { modules, allLessons, totalEstimatedMinutes } from "@/content/modules";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "Sixteen modules from JavaScript fundamentals to a full QA automation capstone.",
};

const trackLabel: Record<string, string> = {
  foundations: "Foundations",
  core: "Core Playwright",
  architecture: "Architecture",
  integration: "Integration",
  data: "Data",
  capstone: "Capstone",
};

export default function LearnPage() {
  const hours = Math.round(totalEstimatedMinutes / 60);

  const byTrack = modules.reduce<Record<string, typeof modules>>((acc, module) => {
    (acc[module.track] ??= []).push(module);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Curriculum"
        description="Work through it in order, or jump to the module you need. Every lesson ends with common mistakes, key takeaways and a quiz."
        meta={
          <>
            <Badge tone="accent">{modules.length} modules</Badge>
            <Badge>{allLessons.length} lessons</Badge>
            <Badge>
              <Clock className="h-3 w-3" aria-hidden /> ~{hours} hours
            </Badge>
          </>
        }
      />

      <PageBody>
        <div className="space-y-10">
          {Object.entries(byTrack).map(([track, trackModules]) => (
            <section key={track}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
                {trackLabel[track] ?? track}
              </h2>

              <div className="space-y-3">
                {trackModules.map((module) => (
                  <article
                    key={module.id}
                    className="overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    <Link
                      href={`/learn/${module.id}`}
                      className="group flex items-start gap-4 p-5 transition hover:bg-surface-2"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-sm font-semibold text-accent">
                        {module.order}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-semibold group-hover:text-accent">
                            {module.title}
                          </h3>
                          <DifficultyBadge level={module.difficulty} />
                          <Badge>{module.lessons.length} lessons</Badge>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {module.summary}
                        </p>
                      </div>

                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden
                      />
                    </Link>

                    <ul className="divide-y divide-line border-t border-line">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/learn/${module.id}/${lesson.slug}`}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm transition hover:bg-surface-2"
                          >
                            <LessonCompleteBadge lessonId={lesson.id} />
                            <span className="min-w-0 flex-1 truncate">
                              {lesson.title}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-faint">
                              {lesson.estimatedTime}m
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageBody>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Target } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-header";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { LessonCompleteBadge } from "@/components/lesson/mark-complete";
import { getModule, modules } from "@/content/modules";

export function generateStaticParams() {
  return modules.map((item) => ({ moduleId: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}): Promise<Metadata> {
  const { moduleId } = await params;
  const courseModule = getModule(moduleId);
  if (!courseModule) return { title: "Module not found" };

  return { title: courseModule.title, description: courseModule.summary };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const courseModule = getModule(moduleId);
  if (!courseModule) notFound();

  const minutes = courseModule.lessons.reduce((sum, l) => sum + l.estimatedTime, 0);

  return (
    <>
      <PageHeader
        title={courseModule.title}
        description={courseModule.summary}
        breadcrumb={[
          { label: "Curriculum", href: "/learn" },
          { label: courseModule.title },
        ]}
        meta={
          <>
            <DifficultyBadge level={courseModule.difficulty} />
            <Badge>{courseModule.lessons.length} lessons</Badge>
            <Badge>~{minutes} min</Badge>
          </>
        }
      />

      <PageBody>
        <ol className="space-y-3">
          {courseModule.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={`/learn/${courseModule.id}/${lesson.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs text-faint">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold group-hover:text-accent">
                      {lesson.title}
                    </h2>
                    <LessonCompleteBadge lessonId={lesson.id} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {lesson.summary}
                  </p>

                  <ul className="mt-3 space-y-1">
                    {lesson.objectives.slice(0, 3).map((objective) => (
                      <li
                        key={objective}
                        className="flex items-start gap-2 text-xs text-muted"
                      >
                        <Target className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
                        {objective}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DifficultyBadge level={lesson.difficulty} />
                    <Badge>{lesson.estimatedTime} min</Badge>
                    {lesson.quiz.length > 0 && (
                      <Badge tone="info">{lesson.quiz.length} quiz questions</Badge>
                    )}
                  </div>
                </div>

                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      </PageBody>
    </>
  );
}

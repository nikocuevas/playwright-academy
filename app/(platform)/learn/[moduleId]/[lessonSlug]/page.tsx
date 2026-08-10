import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Key, Target, TriangleAlert } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-header";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { SectionRenderer } from "@/components/lesson/section-renderer";
import { Quiz } from "@/components/lesson/quiz";
import { MarkComplete } from "@/components/lesson/mark-complete";
import { RichText } from "@/components/lesson/rich-text";
import {
  getAdjacentLessons,
  getLesson,
  getLessonBySlug,
  getModule,
  modules,
} from "@/content/modules";
import { getChallenge } from "@/content/challenges";
import { getScenario } from "@/lib/playwright-simulator/scenarios";

export function generateStaticParams() {
  return modules.flatMap((item) =>
    item.lessons.map((lesson) => ({
      moduleId: item.id,
      lessonSlug: lesson.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { moduleId, lessonSlug } = await params;
  const lesson = getLessonBySlug(moduleId, lessonSlug);
  if (!lesson) return { title: "Lesson not found" };

  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonSlug: string }>;
}) {
  const { moduleId, lessonSlug } = await params;
  const courseModule = getModule(moduleId);
  const lesson = getLessonBySlug(moduleId, lessonSlug);
  if (!courseModule || !lesson) notFound();

  const { previous, next } = getAdjacentLessons(lesson.id);
  const previousLesson = previous ? getLesson(previous.lessonId) : undefined;
  const nextLesson = next ? getLesson(next.lessonId) : undefined;

  const relatedScenarios = (lesson.playground ?? [])
    .map(getScenario)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const relatedChallenges = (lesson.challenges ?? [])
    .map(getChallenge)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <PageHeader
        title={lesson.title}
        description={lesson.summary}
        breadcrumb={[
          { label: "Curriculum", href: "/learn" },
          { label: courseModule.title, href: `/learn/${courseModule.id}` },
          { label: lesson.title },
        ]}
        actions={<MarkComplete lessonId={lesson.id} />}
        meta={
          <>
            <DifficultyBadge level={lesson.difficulty} />
            <Badge>{lesson.estimatedTime} min</Badge>
            <Badge>Module {courseModule.order}</Badge>
          </>
        }
      />

      <PageBody>
        <article className="space-y-8">
          {/* ------------------------------------------- what you'll learn */}
          <section className="rounded-xl border border-line bg-surface-2 p-5">
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-faint">
              <Target className="h-3.5 w-3.5" aria-hidden />
              What you&apos;ll learn
            </h2>
            <ul className="space-y-1.5">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-sm">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <RichText text={objective} />
                </li>
              ))}
            </ul>
          </section>

          {/* -------------------------------------------------- the lesson */}
          <SectionRenderer sections={lesson.sections} />

          {/* ------------------------------------------------- practice it */}
          {(relatedScenarios.length > 0 || relatedChallenges.length > 0) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                Practise it
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedScenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/playground?scenario=${scenario.id}`}
                    className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      Playground
                    </span>
                    <p className="mt-1 text-sm font-medium group-hover:text-accent">
                      {scenario.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {scenario.summary}
                    </p>
                  </Link>
                ))}

                {relatedChallenges.map((challenge) => (
                  <Link
                    key={challenge.id}
                    href={
                      challenge.venue === "playground"
                        ? `/playground?scenario=${challenge.scenarioId}`
                        : `/challenges#${challenge.id}`
                    }
                    className="group rounded-xl border border-line bg-surface p-4 transition hover:border-info/40"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-info">
                      Challenge
                    </span>
                    <p className="mt-1 text-sm font-medium group-hover:text-info">
                      {challenge.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {challenge.problem}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* --------------------------------------------- common mistakes */}
          {lesson.commonMistakes.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <TriangleAlert className="h-4 w-4 text-warn" aria-hidden />
                Common mistakes
              </h2>
              <ul className="space-y-2">
                {lesson.commonMistakes.map((mistake) => (
                  <li
                    key={mistake.title}
                    className="rounded-xl border border-warn/30 bg-warn-soft p-4"
                  >
                    <p className="text-sm font-semibold">{mistake.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fg/85">
                      <RichText text={mistake.body} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ---------------------------------------------- key takeaways */}
          <section className="rounded-xl border border-accent/30 bg-accent-soft p-5">
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-accent">
              <Key className="h-3.5 w-3.5" aria-hidden />
              Key takeaways
            </h2>
            <ul className="space-y-1.5">
              {lesson.keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex items-start gap-2 text-sm">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <RichText text={takeaway} />
                </li>
              ))}
            </ul>
          </section>

          {/* ----------------------------------------------------- quiz */}
          <Quiz lessonId={lesson.id} questions={lesson.quiz} />

          {/* ------------------------------------------------ completion */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5">
            <div>
              <p className="text-sm font-medium">Finished this lesson?</p>
              <p className="text-xs text-muted">
                Progress is saved in this browser.
              </p>
            </div>
            <MarkComplete lessonId={lesson.id} />
          </div>

          {/* ---------------------------------------------- prev / next */}
          <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
            {previousLesson ? (
              <Link
                href={`/learn/${previousLesson.moduleId}/${previousLesson.slug}`}
                className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40"
              >
                <span className="flex items-center gap-1.5 text-xs text-faint">
                  <ArrowLeft className="h-3 w-3" aria-hidden />
                  Previous
                </span>
                <p className="mt-1 text-sm font-medium group-hover:text-accent">
                  {previousLesson.title}
                </p>
              </Link>
            ) : (
              <span />
            )}

            {nextLesson && (
              <Link
                href={`/learn/${nextLesson.moduleId}/${nextLesson.slug}`}
                className="group rounded-xl border border-line bg-surface p-4 text-right transition hover:border-accent/40"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs text-faint">
                  Next
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
                <p className="mt-1 text-sm font-medium group-hover:text-accent">
                  {nextLesson.title}
                </p>
              </Link>
            )}
          </nav>
        </article>
      </PageBody>
    </>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Circle,
  Database,
  ListChecks,
  Rocket,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ButtonLink } from "@/components/ui/button";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { modules, allLessons, lessonHref } from "@/content/modules";
import { challenges } from "@/content/challenges";
import { sqlExercises } from "@/content/sql-exercises";
import { useHydrated, useProgress } from "@/lib/progress";
import { percent } from "@/lib/utils";

const quickLinks = [
  {
    href: "/playground",
    icon: Braces,
    title: "Playwright Playground",
    body: "Write Playwright code against a simulated browser.",
  },
  {
    href: "/practice/registration",
    icon: ListChecks,
    title: "Registration practice",
    body: "Dynamic ids, validation, and locator strategy.",
  },
  {
    href: "/practice/shop",
    icon: Rocket,
    title: "ShopEasy",
    body: "The full E2E journey, with an API behind it.",
  },
  {
    href: "/practice/sql",
    icon: Database,
    title: "SQL Lab",
    body: "Query seven tables and find the seeded data bugs.",
  },
];

export function DashboardContent() {
  const progress = useProgress();
  const hydrated = useHydrated();

  const lessonsDone = Object.keys(progress.lessons).length;
  const challengesDone = Object.keys(progress.challenges).length;
  const sqlDone = Object.keys(progress.sql).length;
  const quizzesDone = Object.keys(progress.quizzes).length;

  const overall = percent(
    lessonsDone + challengesDone + sqlDone,
    allLessons.length + challenges.length + sqlExercises.length,
  );

  const nextLesson =
    allLessons.find((lesson) => !progress.lessons[lesson.id]) ?? allLessons[0];

  const summary = [
    { label: "Lessons", done: lessonsDone, total: allLessons.length, tone: "accent" as const },
    { label: "Challenges", done: challengesDone, total: challenges.length, tone: "info" as const },
    { label: "SQL exercises", done: sqlDone, total: sqlExercises.length, tone: "violet" as const },
    { label: "Quizzes", done: quizzesDone, total: allLessons.filter((l) => l.quiz.length > 0).length, tone: "warn" as const },
  ];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------ next up */}
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              {hydrated && lessonsDone > 0 ? "Continue where you left off" : "Start here"}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
              {nextLesson.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{nextLesson.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge level={nextLesson.difficulty} />
              <Badge>{nextLesson.estimatedTime} min</Badge>
              <Badge>
                {modules.find((m) => m.id === nextLesson.moduleId)?.title}
              </Badge>
            </div>
          </div>
          <ButtonLink
            href={lessonHref(nextLesson.moduleId, nextLesson.slug)}
            size="lg"
            className="w-full lg:w-auto"
          >
            {hydrated && lessonsDone > 0 ? "Continue" : "Begin"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </div>

        <div className="border-t border-line bg-surface-2 px-6 py-4">
          <ProgressBar
            value={hydrated ? overall : 0}
            label="Overall progress"
            sublabel={`${overall}% complete`}
          />
        </div>
      </Card>

      {/* ------------------------------------------------------ summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">{item.label}</span>
                <span className="font-mono text-sm">
                  <span className="text-fg">{hydrated ? item.done : 0}</span>
                  <span className="text-faint"> / {item.total}</span>
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                size="sm"
                tone={item.tone}
                value={hydrated ? percent(item.done, item.total) : 0}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ------------------------------------------------------ modules */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Curriculum progress</h2>
            <p className="text-sm text-muted">
              {modules.length} modules, {allLessons.length} lessons.
            </p>
          </div>
          <Link
            href="/learn"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {modules.map((module) => {
            const done = module.lessons.filter((l) => progress.lessons[l.id]).length;
            const pct = hydrated ? percent(done, module.lessons.length) : 0;
            const complete = pct === 100;

            return (
              <Link
                key={module.id}
                href={`/learn/${module.id}`}
                className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40"
              >
                <div className="flex items-start gap-3">
                  {complete ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium group-hover:text-accent">
                        {module.order}. {module.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-faint">
                        {hydrated ? done : 0}/{module.lessons.length}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {module.tagline}
                    </p>
                    <ProgressBar className="mt-2" size="sm" value={pct} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------- quick links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Practice environments</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40"
              >
                <Icon className="h-5 w-5 text-accent" aria-hidden />
                <p className="mt-2.5 text-sm font-medium group-hover:text-accent">
                  {link.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{link.body}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------- capstone */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" aria-hidden />
            <CardTitle>Capstone: ShopEasy Automation Framework</CardTitle>
          </div>
          <CardDescription>
            Build a production-shaped Playwright suite covering registration,
            authentication, shopping, checkout, orders, messaging, API validation,
            network mocking and CI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonLink href="/capstone" variant="secondary" size="sm">
            Open the capstone tracker
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}

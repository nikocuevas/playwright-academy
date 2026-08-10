"use client";

import * as React from "react";
import { Download, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockMeter, ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { modules, allLessons } from "@/content/modules";
import { challenges } from "@/content/challenges";
import { sqlExercises } from "@/content/sql-exercises";
import { capstoneTasks } from "@/content/capstone";
import { progressStore, useHydrated, useProgress } from "@/lib/progress";
import { percent } from "@/lib/utils";

export function ProgressView() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [importError, setImportError] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const quizLessons = allLessons.filter((l) => l.quiz.length > 0);

  const areas = [
    {
      label: "Lessons",
      done: Object.keys(progress.lessons).length,
      total: allLessons.length,
    },
    {
      label: "Quizzes",
      done: Object.keys(progress.quizzes).length,
      total: quizLessons.length,
    },
    {
      label: "Challenges",
      done: Object.keys(progress.challenges).length,
      total: challenges.length,
    },
    {
      label: "SQL exercises",
      done: Object.keys(progress.sql).length,
      total: sqlExercises.length,
    },
    {
      label: "Capstone tasks",
      done: Object.keys(progress.capstone).length,
      total: capstoneTasks.length,
    },
  ];

  const quizScores = Object.values(progress.quizzes);
  const totalScore = quizScores.reduce((sum, q) => sum + q.score, 0);
  const totalQuestions = quizScores.reduce((sum, q) => sum + q.total, 0);

  function exportProgress() {
    const blob = new Blob([progressStore.export()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "playwright-academy-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importProgress(file: File) {
    setImportError("");
    try {
      progressStore.import(await file.text());
    } catch {
      setImportError("That file could not be read as progress data.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {areas.map((area) => (
          <Card key={area.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted">{area.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold">
                {hydrated ? area.done : 0}
                <span className="text-base text-faint"> / {area.total}</span>
              </p>
              <ProgressBar
                className="mt-2"
                size="sm"
                value={hydrated ? percent(area.done, area.total) : 0}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">By module</h2>
        <ul className="space-y-3">
          {modules.map((module) => {
            const done = module.lessons.filter((l) => progress.lessons[l.id]).length;
            const value = hydrated ? percent(done, module.lessons.length) : 0;

            return (
              <li key={module.id} className="flex flex-wrap items-center gap-3">
                <span className="w-56 shrink-0 truncate text-sm">
                  {module.order}. {module.title}
                </span>
                <BlockMeter value={value} />
                <span className="font-mono text-xs text-muted">{value}%</span>
                <span className="ml-auto font-mono text-xs text-faint">
                  {hydrated ? done : 0}/{module.lessons.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {hydrated && quizScores.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">Quiz results</h2>
          <p className="mt-1 text-sm text-muted">
            Best score per lesson. Overall: {totalScore}/{totalQuestions} correct.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {allLessons
              .filter((lesson) => progress.quizzes[lesson.id])
              .map((lesson) => {
                const record = progress.quizzes[lesson.id];
                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{lesson.title}</span>
                    <span
                      className={
                        record.score === record.total
                          ? "shrink-0 font-mono text-accent"
                          : "shrink-0 font-mono text-warn"
                      }
                    >
                      {record.score}/{record.total}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-warn/35 bg-warn-soft p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-warn">
          <TriangleAlert className="h-4 w-4" aria-hidden />
          Progress lives in this browser
        </h2>
        <p className="mt-2 text-sm leading-relaxed">
          There is no account system — the platform is designed to deploy to a free
          Vercel plan with no database. Your progress is stored in this browser&apos;s
          localStorage, so it is lost if you clear site data, and it does not follow
          you to another device. Export it if that matters to you.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={exportProgress}>
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export progress
          </Button>

          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Import progress
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            aria-label="Import progress file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importProgress(file);
              event.target.value = "";
            }}
          />

          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (window.confirm("Reset all progress? This cannot be undone.")) {
                progressStore.reset();
              }
            }}
          >
            Reset everything
          </Button>
        </div>

        {importError && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {importError}
          </p>
        )}
      </section>
    </div>
  );
}

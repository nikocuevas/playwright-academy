"use client";

import * as React from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { progressStore, useProgress } from "@/lib/progress";
import type { QuizQuestion } from "@/content/types";

const typeLabel: Record<QuizQuestion["type"], string> = {
  "multiple-choice": "Multiple choice",
  "true-false": "True or false",
  "code-interpretation": "Code interpretation",
  "find-the-bug": "Find the bug",
  "best-locator": "Choose the best locator",
  "correct-wait": "Choose the correct wait",
  "predict-result": "Predict the result",
};

export function Quiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const progress = useProgress();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const previous = progress.quizzes[lessonId];
  const answeredAll = questions.every((q) => answers[q.id]);
  const score = questions.filter((q) => answers[q.id] === q.correct).length;

  function submit() {
    setSubmitted(true);
    progressStore.recordQuiz(lessonId, score, questions.length);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  if (questions.length === 0) return null;

  return (
    <section aria-labelledby="quiz-heading" className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <h2 id="quiz-heading" className="text-[15px] font-semibold tracking-tight">
            Check your understanding
          </h2>
          <p className="text-xs text-muted">
            {questions.length} question{questions.length === 1 ? "" : "s"}
            {previous && ` · best score ${previous.score}/${previous.total}`}
          </p>
        </div>
        {submitted && (
          <span
            className={cn(
              "rounded-full px-3 py-1 font-mono text-sm font-semibold",
              score === questions.length
                ? "bg-accent-soft text-accent"
                : score >= questions.length / 2
                  ? "bg-warn-soft text-warn"
                  : "bg-danger-soft text-danger",
            )}
          >
            {score} / {questions.length}
          </span>
        )}
      </div>

      <ol className="divide-y divide-line">
        {questions.map((question, index) => {
          const chosen = answers[question.id];
          const correct = chosen === question.correct;

          return (
            <li key={question.id} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-xs text-faint">
                  Q{index + 1}
                </span>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                  {typeLabel[question.type]}
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed">{question.prompt}</p>

              {question.code && (
                <CodeBlock
                  code={question.code}
                  language={question.language ?? "ts"}
                  className="my-3"
                />
              )}

              <fieldset className="mt-3 space-y-1.5">
                <legend className="sr-only">{question.prompt}</legend>
                {question.options.map((option) => {
                  const isChosen = chosen === option.id;
                  const isCorrect = option.id === question.correct;

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
                        !submitted &&
                          (isChosen
                            ? "border-accent bg-accent-soft"
                            : "border-line hover:border-line-strong hover:bg-surface-2"),
                        submitted &&
                          isCorrect &&
                          "border-accent bg-accent-soft",
                        submitted &&
                          isChosen &&
                          !isCorrect &&
                          "border-danger bg-danger-soft",
                        submitted && !isChosen && !isCorrect && "border-line opacity-60",
                        submitted && "cursor-default",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={isChosen ?? false}
                        disabled={submitted}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 flex-1 font-mono text-[13px] leading-relaxed">
                        {option.text}
                      </span>
                      {submitted && isCorrect && (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      )}
                      {submitted && isChosen && !isCorrect && (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                      )}
                    </label>
                  );
                })}
              </fieldset>

              {submitted && (
                <div
                  className={cn(
                    "mt-3 rounded-lg border p-3 text-sm leading-relaxed",
                    correct
                      ? "border-accent/35 bg-accent-soft"
                      : "border-warn/35 bg-warn-soft",
                  )}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider">
                    {correct ? "Correct" : "Not quite"}
                  </p>
                  <p>{question.explanation}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
        {!submitted ? (
          <Button onClick={submit} disabled={!answeredAll}>
            Submit answers
          </Button>
        ) : (
          <Button onClick={reset} variant="secondary">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </Button>
        )}
        {!submitted && !answeredAll && (
          <span className="text-xs text-faint">
            Answer every question to submit.
          </span>
        )}
      </div>
    </section>
  );
}

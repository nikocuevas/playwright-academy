"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { tokenClass, tokenize } from "@/lib/highlight";
import { CodeEditor } from "@/components/playground/code-editor";
import { executeSql, type QueryResult } from "@/lib/sql-engine/executor";
import { SqlError } from "@/lib/sql-engine/tokenizer";
import { sqlExerciseGroups, getSqlExercise, type SqlExercise } from "@/content/sql-exercises";
import { progressStore, useProgress } from "@/lib/progress";
import { TableExplorer } from "./table-explorer";
import { SqlResults } from "./sql-results";

const DEFAULT_QUERY = `-- The SQL Lab runs an in-browser SQL engine over a fixed dataset.
-- No database required. SELECT only.

SELECT u.first_name, o.id AS order_id, o.status, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
ORDER BY o.total DESC;`;

type Feedback =
  | { status: "idle" }
  | { status: "correct"; message: string }
  | { status: "incorrect"; message: string };

export function SqlLab() {
  const searchParams = useSearchParams();
  const progress = useProgress();

  const requested = searchParams.get("exercise");
  const [exercise, setExercise] = React.useState<SqlExercise | null>(
    requested ? (getSqlExercise(requested) ?? null) : null,
  );

  const [query, setQuery] = React.useState(
    exercise?.starter ?? exercise?.prompt ? (exercise?.starter ?? "") : DEFAULT_QUERY,
  );
  const [result, setResult] = React.useState<QueryResult | null>(null);
  const [error, setError] = React.useState<{ message: string; hint?: string } | null>(null);
  const [hintsShown, setHintsShown] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>({ status: "idle" });

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const setEditorValue = setQuery;

  function run(sql = query) {
    try {
      const outcome = executeSql(sql);
      setResult(outcome);
      setError(null);
      return outcome;
    } catch (thrown) {
      const sqlError = thrown as SqlError;
      setResult(null);
      setError({
        message: sqlError.message,
        hint: sqlError instanceof SqlError ? sqlError.hint : undefined,
      });
      return null;
    }
  }

  function chooseExercise(next: SqlExercise | null) {
    setExercise(next);
    setEditorValue(next?.starter ?? (next ? "" : DEFAULT_QUERY));
    setResult(null);
    setError(null);
    setHintsShown(0);
    setShowSolution(false);
    setFeedback({ status: "idle" });
  }

  function checkAnswer() {
    if (!exercise) return;

    const mine = run();
    if (!mine) {
      setFeedback({
        status: "incorrect",
        message: "The query did not run. Fix the error above and try again.",
      });
      return;
    }

    let expected: QueryResult;
    try {
      expected = executeSql(exercise.solution);
    } catch {
      setFeedback({ status: "incorrect", message: "Could not verify — reference query failed." });
      return;
    }

    if (exercise.compare === "rowCount") {
      const passed = mine.rowCount === expected.rowCount;
      finish(passed, passed
        ? `Correct — ${mine.rowCount} rows, as expected.`
        : `Expected ${expected.rowCount} rows but the query returned ${mine.rowCount}.`);
      return;
    }

    if (mine.rowCount !== expected.rowCount) {
      setFeedback({
        status: "incorrect",
        message: `Expected ${expected.rowCount} row${expected.rowCount === 1 ? "" : "s"} but got ${mine.rowCount}. Check the filter conditions.`,
      });
      return;
    }

    if (
      exercise.compare === "rowsAndColumns" &&
      JSON.stringify(mine.columns) !== JSON.stringify(expected.columns)
    ) {
      setFeedback({
        status: "incorrect",
        message: `The columns do not match. Expected: ${expected.columns.join(", ")}.`,
      });
      return;
    }

    // Compare the values as sets of rows so column order and aliases can differ.
    const normalise = (rows: QueryResult["rows"]) =>
      rows.map((row) => [...row].map((v) => String(v)).sort().join("|")).sort();

    const passed =
      JSON.stringify(normalise(mine.rows)) === JSON.stringify(normalise(expected.rows));

    finish(
      passed,
      passed
        ? "Correct. Your result matches the expected data exactly."
        : "The row count matches but the values do not. Check which columns you selected.",
    );
  }

  function finish(passed: boolean, message: string) {
    if (passed && exercise) progressStore.completeSql(exercise.id);
    setFeedback({ status: passed ? "correct" : "incorrect", message });
  }

  function insert(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditorValue(`${query}\n${snippet}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = query.slice(0, start) + snippet + query.slice(end);
    setEditorValue(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    });
  }

  return (
    <div className="flex min-h-[75vh] flex-col lg:flex-row">
      {/* ------------------------------------------------------ sidebar */}
      <aside className="scrollbar-thin w-full shrink-0 overflow-y-auto border-b border-line bg-surface p-3 lg:w-72 lg:border-b-0 lg:border-r">
        <TableExplorer onInsert={insert} />

        <div className="mt-6">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Exercises
          </p>

          <button
            type="button"
            onClick={() => chooseExercise(null)}
            className={cn(
              "mb-2 w-full rounded-md px-2 py-1.5 text-left text-[13px]",
              exercise === null
                ? "bg-accent-soft font-medium text-accent"
                : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            Free query
          </button>

          {sqlExerciseGroups.map((group) => (
            <div key={group.group} className="mb-3">
              <p className="mb-1 px-1 text-[11px] text-faint">{group.group}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const done = Boolean(progress.sql[item.id]);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => chooseExercise(item)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px]",
                          exercise?.id === item.id
                            ? "bg-accent-soft font-medium text-accent"
                            : "text-muted hover:bg-surface-2 hover:text-fg",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-line-strong" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* --------------------------------------------------------- main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {exercise && (
          <div className="border-b border-line bg-surface-2 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">{exercise.title}</h2>
              <DifficultyBadge level={exercise.difficulty} />
              <Badge>{exercise.group}</Badge>
              {progress.sql[exercise.id] && <Badge tone="accent">Solved</Badge>}
            </div>
            <p className="mt-1.5 text-sm text-muted">{exercise.prompt}</p>
            <p className="mt-1 text-xs text-faint">Expected: {exercise.expectation}</p>
          </div>
        )}

        {/* editor */}
        <div className="border-b border-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
              SQL Editor
            </span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" onClick={() => run()}>
                <Play className="h-3.5 w-3.5" aria-hidden />
                Run Query
              </Button>
              {exercise && (
                <Button size="sm" variant="secondary" onClick={checkAnswer}>
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Check answer
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditorValue("")}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Clear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditorValue(exercise?.starter ?? (exercise ? "" : DEFAULT_QUERY));
                  setResult(null);
                  setError(null);
                  setFeedback({ status: "idle" });
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </Button>
            </div>
          </div>

          <CodeEditor
            value={query}
            onChange={setQuery}
            onSubmitShortcut={() => run()}
            language="sql"
            ariaLabel="SQL query"
            textareaRef={textareaRef}
            className="min-h-[220px]"
          />

          <p className="border-t border-line bg-surface px-3 py-1.5 text-[11px] text-faint">
            ⌘/Ctrl + Enter to run. SELECT only — the lab is read-only by design.
          </p>
        </div>

        {/* hints and solution */}
        {exercise && (
          <div className="border-b border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setHintsShown((n) => Math.min(n + 1, exercise.hints.length))}
                disabled={hintsShown >= exercise.hints.length}
              >
                <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                {hintsShown === 0
                  ? "Show a hint"
                  : hintsShown >= exercise.hints.length
                    ? "No more hints"
                    : "Next hint"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSolution((v) => !v)}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {showSolution ? "Hide solution" : "Show solution"}
              </Button>
              {showSolution && (
                <Button size="sm" variant="outline" onClick={() => setEditorValue(exercise.solution)}>
                  Load into editor
                </Button>
              )}
            </div>

            {hintsShown > 0 && (
              <ol className="mt-3 space-y-1.5">
                {exercise.hints.slice(0, hintsShown).map((hint, index) => (
                  <li
                    key={hint}
                    className="rounded-lg border border-warn/30 bg-warn-soft px-3 py-2 text-[13px]"
                  >
                    <span className="mr-2 font-mono text-[11px] font-semibold text-warn">
                      Hint {index + 1}
                    </span>
                    {hint}
                  </li>
                ))}
              </ol>
            )}

            {showSolution && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-code-bg p-3 font-mono text-[12px] leading-6">
                <code>
                  {tokenize(exercise.solution, "sql").map((token, i) => (
                    <span key={i} className={tokenClass[token.type]}>
                      {token.text}
                    </span>
                  ))}
                </code>
              </pre>
            )}

            {feedback.status !== "idle" && (
              <p
                className={cn(
                  "mt-3 rounded-lg border px-3 py-2 text-sm",
                  feedback.status === "correct"
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-warn/40 bg-warn-soft text-warn",
                )}
              >
                {feedback.status === "correct" ? "✓ " : "• "}
                {feedback.message}
              </p>
            )}
          </div>
        )}

        {/* results */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto bg-surface">
          <SqlResults result={result} error={error} />
        </div>
      </div>
    </div>
  );
}

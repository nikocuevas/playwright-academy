"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { CodeEditor } from "./code-editor";
import { SimulatedBrowser } from "./simulated-browser";
import { ErrorPanel, ExecutionTimeline } from "./execution-panel";
import { createInitialState } from "@/lib/playwright-simulator/app-state";
import { render } from "@/lib/playwright-simulator/screens";
import { runSimulation, type ExecutionResult } from "@/lib/playwright-simulator/runner";
import {
  getScenario,
  scenarioGroups,
  scenarios,
  type Scenario,
} from "@/lib/playwright-simulator/scenarios";
import { progressStore, useProgress } from "@/lib/progress";

type SubmitState =
  | { status: "idle" }
  | { status: "passed"; message: string }
  | { status: "failed"; message: string };

export function Playground() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const progress = useProgress();

  const requested = searchParams.get("scenario");
  const initialScenario =
    (requested && getScenario(requested)) || scenarios[0];

  const [scenario, setScenario] = React.useState<Scenario>(initialScenario);
  const [code, setCode] = React.useState(initialScenario.starterCode);
  const [result, setResult] = React.useState<ExecutionResult | null>(null);
  const [selectedStep, setSelectedStep] = React.useState<number | null>(null);
  const [hintsShown, setHintsShown] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [submit, setSubmit] = React.useState<SubmitState>({ status: "idle" });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Keep the URL in sync so scenarios are linkable from lessons.
  React.useEffect(() => {
    if (requested !== scenario.id) {
      router.replace(`/playground?scenario=${scenario.id}`, { scroll: false });
    }
    // Only when the scenario itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  const baseline = React.useMemo(
    () => createInitialState(scenario.initialUrl),
    [scenario.initialUrl],
  );

  const activeStep =
    selectedStep !== null
      ? result?.steps.find((s) => s.index === selectedStep)
      : undefined;

  const previewState =
    activeStep?.snapshot ?? result?.finalState ?? baseline;
  const previewDoc = React.useMemo(() => render(previewState), [previewState]);
  const highlight = activeStep?.highlight ?? [];

  function selectScenario(next: Scenario) {
    setScenario(next);
    setCode(next.starterCode);
    setResult(null);
    setSelectedStep(null);
    setHintsShown(0);
    setShowSolution(false);
    setSubmit({ status: "idle" });
    setSidebarOpen(false);
  }

  function run() {
    const outcome = runSimulation(code, scenario.initialUrl);
    setResult(outcome);
    setSelectedStep(
      outcome.steps.length > 0 ? outcome.steps[outcome.steps.length - 1].index : null,
    );
    setSubmit({ status: "idle" });
    return outcome;
  }

  function submitChallenge() {
    const outcome = run();

    if (!outcome.passed) {
      setSubmit({
        status: "failed",
        message: "The test did not pass. Read the failure below and try again.",
      });
      return;
    }

    const check = scenario.check?.(outcome);
    if (check && !check.passed) {
      setSubmit({ status: "failed", message: check.message });
      return;
    }

    if (scenario.challengeId) {
      progressStore.completeChallenge(scenario.challengeId);
    }
    setSubmit({
      status: "passed",
      message: check?.message ?? "Challenge complete.",
    });
  }

  function reset() {
    setCode(scenario.starterCode);
    setResult(null);
    setSelectedStep(null);
    setSubmit({ status: "idle" });
    setShowSolution(false);
  }

  const solved = Boolean(
    scenario.challengeId && progress.challenges[scenario.challengeId],
  );

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {/* ------------------------------------------------------- toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm lg:hidden"
          aria-expanded={sidebarOpen}
        >
          Scenarios
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", sidebarOpen && "rotate-180")}
            aria-hidden
          />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{scenario.title}</h1>
          <p className="truncate text-xs text-muted">{scenario.summary}</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {scenario.mode === "reference" ? (
            <Badge tone="warn">Reference only — run this with real Playwright</Badge>
          ) : (
            <Badge tone="violet">Interactive simulation</Badge>
          )}

          {scenario.mode === "simulated" && (
            <>
              <Button size="sm" onClick={run}>
                <Play className="h-3.5 w-3.5" aria-hidden />
                Run
              </Button>
              {scenario.challengeId && (
                <Button size="sm" variant="secondary" onClick={submitChallenge}>
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Submit
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ---------------------------------------------------- sidebar */}
        <aside
          className={cn(
            "scrollbar-thin w-full shrink-0 overflow-y-auto border-b border-line bg-surface p-3 lg:block lg:w-64 lg:border-b-0 lg:border-r",
            sidebarOpen ? "block" : "hidden",
          )}
          aria-label="Playground scenarios"
        >
          {scenarioGroups.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const done =
                    item.challengeId && progress.challenges[item.challengeId];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectScenario(item)}
                        aria-current={item.id === scenario.id ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition",
                          item.id === scenario.id
                            ? "bg-accent-soft font-medium text-accent"
                            : "text-muted hover:bg-surface-2 hover:text-fg",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-line-strong" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* -------------------------------------------------- main panes */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col xl:flex-row">
          {/* editor + task */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-line xl:border-b-0 xl:border-r">
            <div className="border-b border-line bg-surface-2 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge level={scenario.difficulty} />
                <Badge>{scenario.group}</Badge>
                {solved && <Badge tone="accent">Solved</Badge>}
              </div>
              <ul className="mt-2 space-y-1">
                {scenario.task.map((task) => (
                  <li key={task} className="flex items-start gap-2 text-[13px] text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            <CodeEditor
              value={code}
              onChange={setCode}
              errorLine={result?.error?.line}
              className="min-h-[280px] flex-1 xl:min-h-0"
            />

            <div className="border-t border-line bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setHintsShown((n) => Math.min(n + 1, scenario.hints.length))
                  }
                  disabled={hintsShown >= scenario.hints.length}
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                  {hintsShown === 0
                    ? "Show a hint"
                    : hintsShown >= scenario.hints.length
                      ? "No more hints"
                      : "Next hint"}
                </Button>

                {scenario.solution && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSolution((v) => !v)}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    {showSolution ? "Hide solution" : "Show solution"}
                  </Button>
                )}

                {showSolution && scenario.solution && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCode(scenario.solution)}
                  >
                    Load into editor
                  </Button>
                )}
              </div>

              {hintsShown > 0 && (
                <ol className="mt-3 space-y-1.5">
                  {scenario.hints.slice(0, hintsShown).map((hint, index) => (
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

              {showSolution && scenario.solution && (
                <pre className="scrollbar-thin mt-3 max-h-64 overflow-auto rounded-lg border border-line bg-code-bg p-3 font-mono text-[12px] leading-6 text-code-fg">
                  {scenario.solution}
                </pre>
              )}
            </div>
          </div>

          {/* preview + timeline */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {scenario.mode === "reference" ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <p className="text-sm font-semibold">Not executed here</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    This example uses APIs the browser simulator does not
                    implement — the <code className="font-mono">request</code>{" "}
                    fixture and network interception need a real browser and a
                    real HTTP client.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Copy it into your local suite and run{" "}
                    <code className="font-mono">npx playwright test</code>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-[300px] flex-1 p-3">
                  <SimulatedBrowser
                    document={previewDoc}
                    url={previewState.url}
                    highlight={highlight}
                    className="h-full"
                  />
                </div>

                <div className="scrollbar-thin max-h-[45%] shrink-0 overflow-y-auto border-t border-line bg-surface">
                  <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface-2 px-3 py-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                      Execution log
                    </span>
                    {result && (
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          result.passed ? "text-accent" : "text-danger",
                        )}
                      >
                        {result.passed ? "✓ Test passed" : "✕ Test failed"} ·{" "}
                        {result.durationMs}ms
                      </span>
                    )}
                  </div>

                  <ExecutionTimeline
                    steps={result?.steps ?? []}
                    selectedIndex={selectedStep}
                    onSelect={setSelectedStep}
                  />

                  {result?.error && <ErrorPanel error={result.error} />}

                  {submit.status !== "idle" && (
                    <div
                      className={cn(
                        "border-t p-3 text-sm",
                        submit.status === "passed"
                          ? "border-accent/40 bg-accent-soft text-accent"
                          : "border-warn/40 bg-warn-soft text-warn",
                      )}
                    >
                      {submit.status === "passed" ? "✓ " : "• "}
                      {submit.message}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

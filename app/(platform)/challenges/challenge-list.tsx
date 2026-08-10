"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { challengeTracks, type Challenge } from "@/content/challenges";
import { progressStore, useProgress } from "@/lib/progress";

export function ChallengeList() {
  const [filter, setFilter] = React.useState<string>("all");
  const tracks = ["all", ...challengeTracks.map((t) => t.track)];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tracks.map((track) => (
          <button
            key={track}
            type="button"
            onClick={() => setFilter(track)}
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] transition",
              filter === track
                ? "border-accent bg-accent-soft font-medium text-accent"
                : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {track === "all" ? "All tracks" : track}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {challengeTracks
          .filter((group) => filter === "all" || group.track === filter)
          .map((group) => (
            <section key={group.track}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
                {group.track}
              </h2>
              <div className="space-y-3">
                {group.items.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = useProgress();
  const [hintsShown, setHintsShown] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);

  const done = Boolean(progress.challenges[challenge.id]);

  return (
    <article
      id={challenge.id}
      className="scroll-mt-20 rounded-xl border border-line bg-surface p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-line-strong" aria-hidden />
            )}
            <h3 className="text-[15px] font-semibold">{challenge.title}</h3>
            <DifficultyBadge level={challenge.difficulty} />
            {challenge.venue === "playground" ? (
              <Badge tone="violet">Playground</Badge>
            ) : (
              <Badge tone="info">
                <Terminal className="h-3 w-3" aria-hidden /> Local
              </Badge>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted">
            {challenge.problem}
          </p>
        </div>

        {challenge.venue === "playground" && challenge.scenarioId && (
          <Link
            href={`/playground?scenario=${challenge.scenarioId}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg"
          >
            Solve it
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {challenge.starter && (
        <CodeBlock
          code={challenge.starter}
          title="Starter"
          language={challenge.starter.startsWith("npx") ? "bash" : "ts"}
        />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setHintsShown((n) => Math.min(n + 1, challenge.hints.length))}
          disabled={hintsShown >= challenge.hints.length}
        >
          <Lightbulb className="h-3.5 w-3.5" aria-hidden />
          {hintsShown === 0
            ? "Show a hint"
            : hintsShown >= challenge.hints.length
              ? "No more hints"
              : "Next hint"}
        </Button>

        {challenge.solution && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSolution((v) => !v)}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {showSolution ? "Hide solution" : "Show solution"}
          </Button>
        )}

        {challenge.venue === "local" && (
          <Button
            size="sm"
            variant={done ? "secondary" : "outline"}
            onClick={() =>
              done ? undefined : progressStore.completeChallenge(challenge.id)
            }
            disabled={done}
          >
            {done ? "Marked complete" : "Mark complete"}
          </Button>
        )}
      </div>

      {hintsShown > 0 && (
        <ol className="mt-3 space-y-1.5">
          {challenge.hints.slice(0, hintsShown).map((hint, index) => (
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

      {showSolution && challenge.solution && (
        <>
          <CodeBlock
            code={challenge.solution}
            title="Solution"
            language={challenge.solution.startsWith("npx") ? "bash" : "ts"}
          />
          <p className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-[13px]">
            {challenge.explanation}
          </p>
        </>
      )}
    </article>
  );
}

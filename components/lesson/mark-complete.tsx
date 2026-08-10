"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { progressStore, useHydrated, useProgress } from "@/lib/progress";

export function MarkComplete({ lessonId }: { lessonId: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const done = hydrated && Boolean(progress.lessons[lessonId]);

  return (
    <Button
      variant={done ? "secondary" : "primary"}
      onClick={() =>
        done
          ? progressStore.uncompleteLesson(lessonId)
          : progressStore.completeLesson(lessonId)
      }
      aria-pressed={done}
    >
      {done ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
          Completed
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" aria-hidden />
          Mark complete
        </>
      )}
    </Button>
  );
}

export function LessonCompleteBadge({ lessonId }: { lessonId: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  if (!hydrated || !progress.lessons[lessonId]) return null;

  return (
    <CheckCircle2
      className="h-4 w-4 shrink-0 text-accent"
      aria-label="Completed"
    />
  );
}

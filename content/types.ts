import type { Language } from "@/lib/highlight";
import type { CalloutTone } from "@/components/ui/callout";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Lesson sections are data, not JSX, so content stays framework-agnostic and
 * can be searched, counted and re-rendered by any surface (lesson page,
 * cheat sheet, search index).
 *
 * Inline markup supported inside `body` strings: `code` and **bold**.
 */
export type Section =
  | { kind: "text"; title?: string; body: string[] }
  | {
      kind: "code";
      title?: string;
      language?: Language;
      code: string;
      caption?: string;
      highlightLines?: number[];
      showLineNumbers?: boolean;
    }
  | {
      kind: "compare";
      title?: string;
      bad: string;
      good: string;
      badLabel?: string;
      goodLabel?: string;
      language?: Language;
      note?: string;
    }
  | { kind: "callout"; tone: CalloutTone; title?: string; body: string[] }
  | { kind: "list"; title?: string; ordered?: boolean; items: string[] }
  | { kind: "table"; title?: string; headers: string[]; rows: string[][] }
  | {
      kind: "steps";
      title?: string;
      steps: { title: string; body: string; code?: string; language?: Language }[];
    }
  | { kind: "diagram"; title?: string; ascii: string; caption?: string }
  | {
      kind: "playground";
      scenarioId: string;
      title?: string;
      body?: string;
    }
  | { kind: "practice"; href: string; title: string; body: string };

export type QuizQuestion = {
  id: string;
  type:
    | "multiple-choice"
    | "true-false"
    | "code-interpretation"
    | "find-the-bug"
    | "best-locator"
    | "correct-wait"
    | "predict-result";
  prompt: string;
  code?: string;
  language?: Language;
  options: { id: string; text: string; code?: string }[];
  correct: string;
  explanation: string;
};

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  moduleId: string;
  summary: string;
  difficulty: Difficulty;
  estimatedTime: number; // minutes
  objectives: string[];
  sections: Section[];
  commonMistakes: { title: string; body: string }[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  /** Playground scenario ids that reinforce this lesson. */
  playground?: string[];
  /** Challenge ids that reinforce this lesson. */
  challenges?: string[];
  /** SQL exercise ids (SQL module only). */
  sqlExercises?: string[];
};

export type Module = {
  id: string;
  order: number;
  title: string;
  tagline: string;
  summary: string;
  difficulty: Difficulty;
  /** Lucide icon name, resolved in the UI. */
  icon: string;
  track: "foundations" | "core" | "architecture" | "integration" | "data" | "capstone";
  lessons: Lesson[];
};

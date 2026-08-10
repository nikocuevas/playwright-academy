import { allLessons, modules } from "@/content/modules";
import { apiReference } from "@/content/api-reference";
import { cheatSheets } from "@/content/cheat-sheets";
import { glossary } from "@/content/glossary";
import { challenges } from "@/content/challenges";
import { sqlExercises } from "@/content/sql-exercises";
import { scenarios } from "@/lib/playwright-simulator/scenarios";

export type SearchKind =
  | "Lesson"
  | "Module"
  | "API"
  | "Cheat sheet"
  | "Glossary"
  | "Challenge"
  | "SQL exercise"
  | "Playground";

export type SearchDoc = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Lower-cased haystack used for matching. */
  keywords: string;
};

function build(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const courseModule of modules) {
    docs.push({
      id: `module:${courseModule.id}`,
      kind: "Module",
      title: courseModule.title,
      subtitle: courseModule.tagline,
      href: `/learn/${courseModule.id}`,
      keywords:
        `${courseModule.title} ${courseModule.tagline} ${courseModule.summary}`.toLowerCase(),
    });
  }

  for (const lesson of allLessons) {
    const objectives = lesson.objectives.join(" ");
    const takeaways = lesson.keyTakeaways.join(" ");
    docs.push({
      id: `lesson:${lesson.id}`,
      kind: "Lesson",
      title: lesson.title,
      subtitle: lesson.summary,
      href: `/learn/${lesson.moduleId}/${lesson.slug}`,
      keywords:
        `${lesson.title} ${lesson.summary} ${objectives} ${takeaways}`.toLowerCase(),
    });
  }

  for (const entry of apiReference) {
    docs.push({
      id: `api:${entry.id}`,
      kind: "API",
      title: entry.signature,
      subtitle: entry.summary,
      href: `/api-reference#${entry.id}`,
      keywords:
        `${entry.namespace} ${entry.signature} ${entry.summary} ${entry.commonUse}`.toLowerCase(),
    });
  }

  for (const sheet of cheatSheets) {
    docs.push({
      id: `cheat:${sheet.id}`,
      kind: "Cheat sheet",
      title: sheet.title,
      subtitle: sheet.tagline,
      href: `/cheat-sheet/${sheet.id}`,
      keywords: `${sheet.title} ${sheet.tagline} ${sheet.sections
        .flatMap((s) => s.entries.map((e) => `${e.code} ${e.description}`))
        .join(" ")}`.toLowerCase(),
    });
  }

  for (const term of glossary) {
    docs.push({
      id: `glossary:${term.term}`,
      kind: "Glossary",
      title: term.term,
      subtitle: term.definition,
      href: term.href ?? `/glossary#${term.term.toLowerCase().replace(/\s+/g, "-")}`,
      keywords: `${term.term} ${term.definition} ${term.category}`.toLowerCase(),
    });
  }

  for (const challenge of challenges) {
    docs.push({
      id: `challenge:${challenge.id}`,
      kind: "Challenge",
      title: challenge.title,
      subtitle: challenge.problem.slice(0, 140),
      href: `/challenges#${challenge.id}`,
      keywords: `${challenge.title} ${challenge.problem} ${challenge.track}`.toLowerCase(),
    });
  }

  for (const exercise of sqlExercises) {
    docs.push({
      id: `sql:${exercise.id}`,
      kind: "SQL exercise",
      title: exercise.title,
      subtitle: exercise.prompt,
      href: `/practice/sql?exercise=${exercise.id}`,
      keywords: `${exercise.title} ${exercise.prompt} ${exercise.group} sql`.toLowerCase(),
    });
  }

  for (const scenario of scenarios) {
    docs.push({
      id: `scenario:${scenario.id}`,
      kind: "Playground",
      title: scenario.title,
      subtitle: scenario.summary,
      href: `/playground?scenario=${scenario.id}`,
      keywords: `${scenario.title} ${scenario.summary} ${scenario.group} playground`.toLowerCase(),
    });
  }

  return docs;
}

export const searchIndex: SearchDoc[] = build();

/**
 * Ranked substring search. Small index (a few hundred documents), so a linear
 * scan is faster than shipping a search library to the client.
 */
export function search(query: string, limit = 12): SearchDoc[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const terms = needle.split(/\s+/);

  const scored = searchIndex
    .map((doc) => {
      let score = 0;
      const title = doc.title.toLowerCase();

      for (const term of terms) {
        if (!doc.keywords.includes(term)) return { doc, score: -1 };
        if (title === term) score += 100;
        else if (title.startsWith(term)) score += 40;
        else if (title.includes(term)) score += 20;
        else score += 5;
      }

      // Prefer lessons and API entries over incidental matches.
      if (doc.kind === "Lesson") score += 6;
      if (doc.kind === "API") score += 4;

      return { doc, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.doc);
}

export const searchKindTone: Record<SearchKind, string> = {
  Lesson: "text-accent",
  Module: "text-info",
  API: "text-violet",
  "Cheat sheet": "text-warn",
  Glossary: "text-muted",
  Challenge: "text-accent",
  "SQL exercise": "text-info",
  Playground: "text-violet",
};

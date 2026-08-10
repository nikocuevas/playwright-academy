import type { Lesson, Module } from "../types";

import { jsTsModule } from "./module-01-javascript-typescript";
import { fundamentalsModule } from "./module-02-fundamentals";
import { locatorsModule } from "./module-03-locators";
import { actionsModule } from "./module-04-actions";
import { assertionsModule } from "./module-05-assertions";
import { waitingModule } from "./module-06-waiting";
import { registrationModule } from "./module-07-registration";
import { authModule } from "./module-08-authentication";
import { pomModule } from "./module-09-pom";
import { fixturesModule } from "./module-10-fixtures";
import { apiModule } from "./module-11-api-testing";
import { networkModule } from "./module-12-network";
import { e2eModule } from "./module-13-e2e";
import { debuggingModule } from "./module-14-debugging";
import { sqlModule } from "./module-15-sql";
import { capstoneModule } from "./module-16-capstone";

export const modules: Module[] = [
  jsTsModule,
  fundamentalsModule,
  locatorsModule,
  actionsModule,
  assertionsModule,
  waitingModule,
  registrationModule,
  authModule,
  pomModule,
  fixturesModule,
  apiModule,
  networkModule,
  e2eModule,
  debuggingModule,
  sqlModule,
  capstoneModule,
].sort((a, b) => a.order - b.order);

export const allLessons: Lesson[] = modules.flatMap((m) => m.lessons);

const moduleById = new Map(modules.map((m) => [m.id, m]));
const lessonById = new Map(allLessons.map((l) => [l.id, l]));

export function getModule(id: string): Module | undefined {
  return moduleById.get(id);
}

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function getLessonBySlug(
  moduleId: string,
  slug: string,
): Lesson | undefined {
  return moduleById.get(moduleId)?.lessons.find((l) => l.slug === slug);
}

/** Flat ordered list used for previous/next navigation. */
export const lessonSequence = modules.flatMap((m) =>
  m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id, slug: l.slug })),
);

export function getAdjacentLessons(lessonId: string) {
  const index = lessonSequence.findIndex((l) => l.lessonId === lessonId);
  return {
    previous: index > 0 ? lessonSequence[index - 1] : undefined,
    next:
      index >= 0 && index < lessonSequence.length - 1
        ? lessonSequence[index + 1]
        : undefined,
  };
}

export function lessonHref(moduleId: string, slug: string) {
  return `/learn/${moduleId}/${slug}`;
}

export const totalQuizQuestions = allLessons.reduce(
  (sum, l) => sum + l.quiz.length,
  0,
);

export const totalEstimatedMinutes = allLessons.reduce(
  (sum, l) => sum + l.estimatedTime,
  0,
);

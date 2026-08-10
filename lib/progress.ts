"use client";

import * as React from "react";

/**
 * Progress tracking.
 *
 * Deliberately localStorage-only: the platform has to deploy to Vercel's free
 * tier with zero configuration, so there is no account system and no database.
 * The trade-off (progress is per-browser and can be cleared) is surfaced in the
 * UI on the Progress page.
 */

export const STORAGE_KEY = "playwright-academy:progress:v1";

export type QuizResult = {
  score: number;
  total: number;
  completedAt: string;
};

export type ProgressState = {
  lessons: Record<string, string>; // lessonId -> ISO completedAt
  quizzes: Record<string, QuizResult>; // lessonId -> result
  challenges: Record<string, string>; // challengeId -> ISO completedAt
  sql: Record<string, string>; // sql exercise id -> ISO completedAt
  capstone: Record<string, string>; // capstone task id -> ISO completedAt
  bookmarks: string[];
};

export const emptyProgress: ProgressState = {
  lessons: {},
  quizzes: {},
  challenges: {},
  sql: {},
  capstone: {},
  bookmarks: [],
};

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  if (cache) return cache;
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw
      ? { ...emptyProgress, ...(JSON.parse(raw) as Partial<ProgressState>) }
      : emptyProgress;
  } catch {
    cache = emptyProgress;
  }
  return cache;
}

function write(next: ProgressState) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota or private mode — progress simply will not persist */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const progressStore = {
  get: read,
  set: write,
  reset() {
    write({ ...emptyProgress });
  },
  completeLesson(id: string) {
    const s = read();
    if (s.lessons[id]) return;
    write({ ...s, lessons: { ...s.lessons, [id]: new Date().toISOString() } });
  },
  uncompleteLesson(id: string) {
    const s = read();
    const lessons = { ...s.lessons };
    delete lessons[id];
    write({ ...s, lessons });
  },
  recordQuiz(id: string, score: number, total: number) {
    const s = read();
    const previous = s.quizzes[id];
    if (previous && previous.score >= score) return;
    write({
      ...s,
      quizzes: {
        ...s.quizzes,
        [id]: { score, total, completedAt: new Date().toISOString() },
      },
    });
  },
  completeChallenge(id: string) {
    const s = read();
    if (s.challenges[id]) return;
    write({
      ...s,
      challenges: { ...s.challenges, [id]: new Date().toISOString() },
    });
  },
  completeSql(id: string) {
    const s = read();
    if (s.sql[id]) return;
    write({ ...s, sql: { ...s.sql, [id]: new Date().toISOString() } });
  },
  toggleCapstone(id: string) {
    const s = read();
    const capstone = { ...s.capstone };
    if (capstone[id]) delete capstone[id];
    else capstone[id] = new Date().toISOString();
    write({ ...s, capstone });
  },
  toggleBookmark(id: string) {
    const s = read();
    const bookmarks = s.bookmarks.includes(id)
      ? s.bookmarks.filter((b) => b !== id)
      : [...s.bookmarks, id];
    write({ ...s, bookmarks });
  },
  export(): string {
    return JSON.stringify(read(), null, 2);
  },
  import(json: string) {
    const parsed = JSON.parse(json) as Partial<ProgressState>;
    write({ ...emptyProgress, ...parsed });
  },
};

/**
 * Reads progress with `useSyncExternalStore` so server render and first client
 * render agree (both see `emptyProgress`), avoiding hydration mismatches.
 */
export function useProgress(): ProgressState {
  return React.useSyncExternalStore(subscribe, read, () => emptyProgress);
}

/**
 * True once the client store has hydrated — use to avoid flashing "0%".
 *
 * Implemented with useSyncExternalStore rather than an effect so the server and
 * first client render agree without a cascading re-render.
 */
export function useHydrated() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

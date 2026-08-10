import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-header";
import { cheatSheets } from "@/content/cheat-sheets";

export const metadata: Metadata = {
  title: "Cheat Sheets",
  description:
    "Searchable quick reference for Playwright, locators, assertions, waiting, authentication, API, network and SQL.",
};

export default function CheatSheetIndexPage() {
  return (
    <>
      <PageHeader
        title="Cheat Sheets"
        description="Quick reference, one page per topic. Each entry is searchable from anywhere with ⌘K."
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2">
          {cheatSheets.map((sheet) => {
            const entries = sheet.sections.reduce(
              (sum, section) => sum + section.entries.length,
              0,
            );
            return (
              <Link
                key={sheet.id}
                href={`/cheat-sheet/${sheet.id}`}
                className="group rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold group-hover:text-accent">
                      {sheet.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{sheet.tagline}</p>
                    <p className="mt-3 font-mono text-xs text-faint">
                      {entries} entries · {sheet.sections.length} sections
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}

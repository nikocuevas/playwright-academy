import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * The practice applications get their own chrome so they feel like separate
 * products under test, rather than pages of the training platform.
 */
export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <div className="border-b border-warn/30 bg-warn-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 text-[12px] text-warn">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="font-medium">Practice application</span>
          <span className="text-warn/80">
            Accounts, payments and orders are simulated. Do not enter real
            personal or payment details.
          </span>
          <Link
            href="/dashboard"
            className="ml-auto inline-flex items-center gap-1 font-medium underline underline-offset-2"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden />
            Back to the Academy
          </Link>
        </div>
      </div>

      {children}

      <footer className="mt-12 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-6 text-xs text-muted">
          <Logo className="h-5 w-5" />
          <span>
            A Playwright Academy practice application — built to be automated.
          </span>
          <Link href="/learn" className="ml-auto hover:text-fg">
            Curriculum
          </Link>
          <Link href="/playground" className="hover:text-fg">
            Playground
          </Link>
          <ThemeToggle className="ml-2" />
        </div>
      </footer>
    </div>
  );
}

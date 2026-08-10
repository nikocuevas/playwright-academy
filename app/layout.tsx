import type { Metadata } from "next";
import { themeScript } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Playwright Academy",
    template: "%s · Playwright Academy",
  },
  description:
    "Interactive Playwright JS/TS and QA automation training platform with a browser simulator, realistic E2E practice apps, API testing and SQL labs.",
  applicationName: "Playwright Academy",
  keywords: [
    "Playwright",
    "test automation",
    "QA automation",
    "E2E testing",
    "TypeScript",
    "SQL for testers",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

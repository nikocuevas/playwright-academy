import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody, PageHeader } from "@/components/page-header";
import { cheatSheets, getCheatSheet } from "@/content/cheat-sheets";
import { CheatSheetView } from "./cheat-sheet-view";

export function generateStaticParams() {
  return cheatSheets.map((sheet) => ({ sheetId: sheet.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sheetId: string }>;
}): Promise<Metadata> {
  const { sheetId } = await params;
  const sheet = getCheatSheet(sheetId);
  if (!sheet) return { title: "Cheat sheet not found" };
  return { title: `${sheet.title} cheat sheet`, description: sheet.tagline };
}

export default async function CheatSheetPage({
  params,
}: {
  params: Promise<{ sheetId: string }>;
}) {
  const { sheetId } = await params;
  const sheet = getCheatSheet(sheetId);
  if (!sheet) notFound();

  return (
    <>
      <PageHeader
        title={sheet.title}
        description={sheet.tagline}
        breadcrumb={[
          { label: "Cheat sheets", href: "/cheat-sheet" },
          { label: sheet.title },
        ]}
      />
      <PageBody>
        <CheatSheetView sheet={sheet} />
      </PageBody>
    </>
  );
}

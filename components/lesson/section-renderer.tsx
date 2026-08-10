import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Braces } from "lucide-react";
import { Callout } from "@/components/ui/callout";
import { CodeBlock, GoodBadCompare } from "@/components/ui/code-block";
import { RichText } from "./rich-text";
import type { Section } from "@/content/types";

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <div className="prose-lesson">
      {sections.map((section, index) => (
        <SectionBlock key={index} section={section} />
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-2 text-[17px] font-semibold tracking-tight first:mt-0">
      {children}
    </h3>
  );
}

function SectionBlock({ section }: { section: Section }) {
  switch (section.kind) {
    case "text":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          {section.body.map((paragraph, i) => (
            <p key={i}>
              <RichText text={paragraph} />
            </p>
          ))}
        </section>
      );

    case "code":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          <CodeBlock
            code={section.code}
            language={section.language ?? "ts"}
            caption={section.caption}
            highlightLines={section.highlightLines}
            showLineNumbers={section.showLineNumbers}
          />
        </section>
      );

    case "compare":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          <GoodBadCompare
            bad={section.bad}
            good={section.good}
            badLabel={section.badLabel}
            goodLabel={section.goodLabel}
            language={section.language}
            note={section.note}
          />
        </section>
      );

    case "callout":
      return (
        <Callout tone={section.tone} title={section.title}>
          {section.body.map((paragraph, i) => (
            <p key={i}>
              <RichText text={paragraph} />
            </p>
          ))}
        </Callout>
      );

    case "list":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          {section.ordered ? (
            <ol className="my-3 space-y-1.5 pl-5 [counter-reset:item]">
              {section.items.map((item, i) => (
                <li key={i} className="list-decimal leading-relaxed">
                  <RichText text={item} />
                </li>
              ))}
            </ol>
          ) : (
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      );

    case "table":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          <div className="scrollbar-thin my-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2">
                  {section.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border-b border-line px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wider text-faint"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 align-top leading-relaxed">
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

    case "steps":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          <ol className="my-4 space-y-4">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    <RichText text={step.body} />
                  </p>
                  {step.code && (
                    <CodeBlock
                      code={step.code}
                      language={step.language ?? "bash"}
                      className="mt-2"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case "diagram":
      return (
        <section>
          {section.title && <SectionHeading>{section.title}</SectionHeading>}
          <figure className="my-4 overflow-x-auto rounded-xl border border-line bg-surface-2 p-5">
            <pre className="font-mono text-[12.5px] leading-relaxed text-muted">
              {section.ascii}
            </pre>
            {section.caption && (
              <figcaption className="mt-3 border-t border-line pt-2 text-xs text-faint">
                {section.caption}
              </figcaption>
            )}
          </figure>
        </section>
      );

    case "playground":
      return (
        <Link
          href={`/playground?scenario=${section.scenarioId}`}
          className="my-4 flex items-center gap-3 rounded-xl border border-accent/35 bg-accent-soft p-4 transition hover:border-accent"
        >
          <Braces className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-accent">
              {section.title ?? "Practise this in the playground"}
            </p>
            {section.body && (
              <p className="mt-0.5 text-sm text-fg/80">{section.body}</p>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        </Link>
      );

    case "practice":
      return (
        <Link
          href={section.href}
          className="my-4 flex items-center gap-3 rounded-xl border border-info/35 bg-info-soft p-4 transition hover:border-info"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-info">{section.title}</p>
            <p className="mt-0.5 text-sm text-fg/80">{section.body}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-info" aria-hidden />
        </Link>
      );

    default:
      return null;
  }
}

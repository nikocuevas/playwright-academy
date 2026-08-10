"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { tokenClass, tokenize, type Language } from "@/lib/highlight";

/**
 * A lightweight code editor: a transparent textarea layered over highlighted
 * output. No CodeMirror or Monaco — those would add hundreds of kilobytes for
 * an editor that only needs highlighting, tab handling and line numbers.
 */
export function CodeEditor({
  value,
  onChange,
  errorLine,
  readOnly = false,
  className,
  ariaLabel = "Test code",
  language = "ts",
  onSubmitShortcut,
  textareaRef: externalRef,
}: {
  value: string;
  onChange: (next: string) => void;
  errorLine?: number;
  readOnly?: boolean;
  className?: string;
  ariaLabel?: string;
  language?: Language;
  /** Fired on Cmd/Ctrl+Enter. */
  onSubmitShortcut?: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;
  const preRef = React.useRef<HTMLPreElement>(null);

  const lines = value.split("\n");

  function syncScroll() {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmitShortcut?.();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const { selectionStart, selectionEnd } = textarea;
      const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
      onChange(next);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      });
    }

    if (event.key === "Enter") {
      // Preserve the current line's indentation.
      const { selectionStart } = textarea;
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const indentMatch = value.slice(lineStart, selectionStart).match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : "";
      if (indent) {
        event.preventDefault();
        const next = `${value.slice(0, selectionStart)}\n${indent}${value.slice(selectionStart)}`;
        onChange(next);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + 1 + indent.length;
        });
      }
    }
  }

  return (
    <div className={cn("relative min-h-0 overflow-hidden bg-code-bg", className)}>
      <div className="flex h-full min-h-0">
        {/* gutter */}
        <div
          aria-hidden
          className="scrollbar-thin shrink-0 select-none overflow-hidden border-r border-white/5 bg-black/20 px-2.5 py-3 text-right font-mono text-[13px] leading-6 text-[#4b5364]"
        >
          {lines.map((_, index) => (
            <div
              key={index}
              className={cn(errorLine === index + 1 && "text-danger font-semibold")}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <pre
            ref={preRef}
            aria-hidden
            className="scrollbar-thin pointer-events-none absolute inset-0 overflow-auto whitespace-pre p-3 font-mono text-[13px] leading-6"
          >
            <code>
              {lines.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    errorLine === index + 1 && "-mx-3 bg-danger/15 px-3",
                  )}
                >
                  {tokenize(line || " ", language).map((token, i) => (
                    <span key={i} className={tokenClass[token.type]}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </code>
          </pre>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label={ariaLabel}
            className="scrollbar-thin absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-[13px] leading-6 text-transparent caret-white outline-none"
          />
        </div>
      </div>
    </div>
  );
}

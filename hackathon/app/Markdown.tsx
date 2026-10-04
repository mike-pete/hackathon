"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

// Tailwind's preflight strips list markers and heading styles, so we map the
// common markdown elements back to styled versions here.
const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 text-xl font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
      {children}
    </code>
  ),
};

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}

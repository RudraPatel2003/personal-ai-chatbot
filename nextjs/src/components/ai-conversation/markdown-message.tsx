import { JSX } from "react";
import ReactMarkdown from "react-markdown";

type MarkdownMessageProperties = {
  content: string;
};

export default function MarkdownMessage({
  content,
}: MarkdownMessageProperties): JSX.Element {
  return (
    <div className="prose prose-sm prose-invert max-w-none text-neutral-100">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

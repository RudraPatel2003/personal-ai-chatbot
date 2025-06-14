import { JSX } from "react";
import ReactMarkdown from "react-markdown";

type MarkdownMessageProps = {
  content: string;
};

export default function MarkdownMessage({
  content,
}: MarkdownMessageProps): JSX.Element {
  return (
    <div className="prose prose-sm prose-invert max-w-none text-neutral-100">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

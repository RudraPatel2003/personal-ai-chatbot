import { JSX, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const MESSAGE_UPDATE_SPEED_IN_MS = 3;

type TypingMessageProperties = {
  content: string;
};

export function TypingMessage({
  content,
}: TypingMessageProperties): JSX.Element {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect((): (() => void) | undefined => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((previous) => previous + content[currentIndex]);
        setCurrentIndex((previous) => previous + 1);
      }, MESSAGE_UPDATE_SPEED_IN_MS);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [content, currentIndex]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
    </div>
  );
}

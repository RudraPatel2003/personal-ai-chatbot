import { JSX } from "react";
import ReactMarkdown from "react-markdown";

import { Message } from "@/types";

import { LoadingMessage } from "./loading-message";
import { TypingMessage } from "./typing-message";

type MessageListProperties = {
  messages: Message[];
  isLoading: boolean;
  messagesEndReference: React.RefObject<HTMLDivElement | null>;
};

function getMessageView(
  message: Message,
  messages: Message[],
  index: number,
  isLoading: boolean,
): JSX.Element {
  if (
    message.role === "assistant" &&
    index === messages.length - 1 &&
    isLoading
  ) {
    return <TypingMessage content={message.content} />;
  }

  if (message.role === "assistant") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    );
  }

  return <div>{message.content}</div>;
}

export default function MessageList({
  messages,
  isLoading,
  messagesEndReference,
}: MessageListProperties): JSX.Element {
  return (
    <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`rounded-lg p-4 ${
            message.role === "user"
              ? "ml-auto bg-black text-white"
              : "bg-gray-100 text-black"
          } max-w-[80%]`}
        >
          {getMessageView(message, messages, index, isLoading)}
        </div>
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={messagesEndReference} />
    </div>
  );
}

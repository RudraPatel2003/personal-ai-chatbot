import { JSX } from "react";

import { Message } from "@/types";

import MarkdownMessage from "./markdown-message";
import { TypingMessage } from "./typing-message";

type MessageListProps = {
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
    return <MarkdownMessage content={message.content} />;
  }

  return <div>{message.content}</div>;
}

export default function MessageList({
  messages,
  isLoading,
  messagesEndReference,
}: MessageListProps): JSX.Element {
  return (
    <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`rounded-lg p-4 ${
            message.role === "user"
              ? "ml-auto bg-neutral-800"
              : "bg-neutral-700"
          } max-w-[90%] lg:max-w-[60%]`}
        >
          {getMessageView(message, messages, index, isLoading)}
        </div>
      ))}
      <div ref={messagesEndReference} />
    </div>
  );
}

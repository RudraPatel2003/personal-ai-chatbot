import { JSX } from "react";

import { Message } from "@/hooks/use-message";

import { LoadingMessage } from "./loading-message";
import { TypingMessage } from "./typing-message";

type MessageListProperties = {
  messages: Message[];
  isLoading: boolean;
  messagesEndReference: React.RefObject<HTMLDivElement | null>;
};

export default function MessageList({
  messages,
  isLoading,
  messagesEndReference,
}: MessageListProperties): JSX.Element {
  return (
    <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-lg p-4 ${
            message.role === "user"
              ? "ml-auto bg-black text-white"
              : "bg-gray-100 text-black"
          } max-w-[80%]`}
        >
          {message.role === "assistant" ? (
            <TypingMessage content={message.content} />
          ) : (
            message.content
          )}
        </div>
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={messagesEndReference} />
    </div>
  );
}

"use client";

import { JSX, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessage } from "@/hooks/use-message";

function LoadingMessage(): JSX.Element {
  return (
    <div className="max-w-[80%] rounded-lg bg-gray-100 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></div>
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
}

const MESSAGE_UPDATE_SPEED_IN_MS = 10;

function TypingMessage({ content }: { content: string }): JSX.Element {
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

export default function Home(): JSX.Element {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useMessage();
  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    await sendMessage(input);

    setInput("");
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Local AI Chatbot</h1>
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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} variant="default">
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}

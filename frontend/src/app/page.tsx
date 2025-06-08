"use client";

import { JSX, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  id: string;
  messages: {
    role: string;
    content: string;
  }[];
};

const LoadingSpinner = (): JSX.Element => (
  <div className="flex items-center gap-2 text-gray-500">
    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></div>
    <span className="text-sm">Thinking...</span>
  </div>
);

export default function Home(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert our messages to the format expected by the backend
      const requestMessages = messages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      // Add the new user message
      requestMessages.push({
        role: "user",
        content: input,
      });

      const request: ChatRequest = {
        id: Date.now().toString(),
        messages: requestMessages,
      };

      const response = await fetch(
        "http://localhost:80/api/dotnet/messages/actions/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Create assistant message placeholder
      const assistantMessageId = Date.now().toString();
      setMessages((previous) => [
        ...previous,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the assistant's message with the new chunk
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: assistantMessage }
              : message,
          ),
        );
      }
    } catch (error) {
      console.error("Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-4 ${
              message.role === "user" ? "ml-auto bg-blue-100" : "bg-gray-100"
            } max-w-[80%]`}
          >
            {message.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="max-w-[80%] rounded-lg bg-gray-100 p-4">
            <LoadingSpinner />
          </div>
        )}
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
        <button
          type="submit"
          className={`rounded-md bg-blue-500 px-4 py-2 text-white transition-colors ${
            isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

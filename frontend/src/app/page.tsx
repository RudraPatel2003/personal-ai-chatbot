"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  id: string;
  messages: {
    role: string;
    content: string;
  }[];
}

const LoadingSpinner = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
    <span className="text-sm">Thinking...</span>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert our messages to the format expected by the backend
      const requestMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
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
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the assistant's message with the new chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessage }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) => [
        ...prev,
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
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
            } max-w-[80%]`}
          >
            {message.role === "assistant" ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="p-4 rounded-lg bg-gray-100 max-w-[80%]">
            <LoadingSpinner />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded-md transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

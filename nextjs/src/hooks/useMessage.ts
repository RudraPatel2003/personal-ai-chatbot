import { useState } from "react";

export type Message = {
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

export function useMessage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((previous) => [...previous, userMessage]);
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
        content,
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

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

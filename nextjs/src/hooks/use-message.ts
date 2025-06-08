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

type UseMessageResponse = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
};

async function postMessage(
  existingMessages: Message[],
  content: string,
): Promise<ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>> {
  const requestMessages = existingMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  requestMessages.push({
    role: "user",
    content,
  });

  const request: ChatRequest = {
    id: Date.now().toString(),
    messages: requestMessages,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dotnet/messages/actions/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body.getReader();
}

export function useMessage(): UseMessageResponse {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) {
      return;
    }

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const responseBodyReader = await postMessage(messages, content);

      // Create assistant message placeholder
      let assistantMessage = "";
      const assistantMessageId = Date.now().toString();
      setMessages((previous) => [
        ...previous,
        {
          id: assistantMessageId,
          role: "assistant",
          content: assistantMessage,
        },
      ]);

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await responseBodyReader.read();

        if (done) {
          break;
        }

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

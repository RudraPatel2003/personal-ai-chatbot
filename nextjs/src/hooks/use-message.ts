import { useMutation } from "@tanstack/react-query";
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

type UseMessageHook = {
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

export function useMessage(): UseMessageHook {
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutateAsync: sendMessage, isPending: isLoading } = useMutation({
    mutationFn: async (content: string) => {
      if (!content.trim()) {
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      };

      setMessages((previous) => [...previous, userMessage]);

      try {
        const responseBodyReader = await postMessage(messages, content);

        // Create assistant message placeholder
        let assistantMessage = "";
        const assistantMessageUuid = crypto.randomUUID();

        setMessages((previous) => [
          ...previous,
          {
            id: assistantMessageUuid,
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
              message.id === assistantMessageUuid
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
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, there was an error processing your request.",
          },
        ]);
      }
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

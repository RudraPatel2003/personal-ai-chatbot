import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";

import { messagesApi } from "@/lib/api/messages";
import { Conversation, Message } from "@/types";

import { useConversation } from "./use-conversation";

type UseMessageHook = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
};

export function useMessage(
  conversation: Conversation | undefined,
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
): UseMessageHook {
  const [messages, setMessages] = useState<Message[]>(
    conversation?.messages ?? [],
  );

  const { addMessage } = useConversation();

  const { mutateAsync: sendMessage, isPending: isLoading } = useMutation({
    mutationFn: async (content: string) => {
      if (!content.trim() || !conversation) {
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, userMessage]);

      // Add user message to conversation
      await addMessage({
        conversationId: conversation.id,
        role: "user",
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      });

      try {
        const responseBodyReader = await messagesApi.postMessage(
          messages,
          userMessage,
        );

        // Create assistant message placeholder
        const assistantMessageUuid = crypto.randomUUID();
        let content = "";

        const assistantMessage: Message = {
          id: assistantMessageUuid,
          role: "assistant",
          content,
          createdAt: new Date().toISOString(),
        };

        setMessages((previous) => [...previous, assistantMessage]);

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await responseBodyReader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          content += chunk;

          // Update the assistant's message with the new chunk
          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantMessageUuid
                ? { ...message, content }
                : message,
            ),
          );
        }

        // After the AI message is complete, add it to the conversation
        const assistantMessageInDatabase = await addMessage({
          conversationId: conversation.id,
          role: "assistant",
          content,
          createdAt: assistantMessage.createdAt,
        });

        // Update the conversation in the conversations array
        setConversations((previous) =>
          previous.map((conv) =>
            conv.id === conversation.id
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    userMessage,
                    assistantMessageInDatabase,
                  ],
                }
              : conv,
          ),
        );
      } catch (error) {
        console.error("Error:", error);

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          createdAt: new Date().toISOString(),
        };

        // Add error message to conversation
        const errorMessageInDatabase = await addMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: errorMessage.content,
          createdAt: errorMessage.createdAt,
        });

        setMessages((previous) => [...previous, errorMessageInDatabase]);

        // Update the conversation in the conversations array
        setConversations((previous) =>
          previous.map((conv) =>
            conv.id === conversation.id
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    userMessage,
                    errorMessageInDatabase,
                  ],
                }
              : conv,
          ),
        );
      }
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

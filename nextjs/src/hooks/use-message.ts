import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { messagesApi } from "@/lib/api/messages";
import { Conversation, Message } from "@/types";

import { useConversation } from "./use-conversation";
import useLocalStorage from "./use-local-storage";

const SYSTEM_PROMPT_KEY = "system-prompt";

export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant. \
  You provide accurate, thoughtful, and well-structured responses. \
  You aim to be clear and concise unless the user asks for more detail. \
  You can help with a wide variety of tasks including answering questions, writing, analysis, math, coding, and creative tasks. \
  Provide your response in markdown format.";

type UseMessageHook = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  systemPrompt: string;
  setSystemPrompt: (systemPrompt: string) => void;
};

export function useMessage(
  conversation: Conversation | undefined,
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
): UseMessageHook {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useLocalStorage(
    SYSTEM_PROMPT_KEY,
    DEFAULT_SYSTEM_PROMPT,
  );

  const { addMessage } = useConversation();

  // Only update messages when conversation changes
  useEffect(() => {
    setMessages(conversation?.messages ?? []);
  }, [conversation]);

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

      // Add user message to conversation first
      const userMessageInDatabase = await addMessage({
        conversationId: conversation.id,
        role: "user",
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      });

      // Update local messages with the database version
      setMessages((previous) => [...previous, userMessageInDatabase]);

      try {
        const responseBodyReader = await messagesApi.postMessage(
          messages,
          userMessageInDatabase,
          systemPrompt,
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

        // Add initial empty assistant message
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
                    userMessageInDatabase,
                    assistantMessageInDatabase,
                  ],
                }
              : conv,
          ),
        );

        // Update local messages with the final database version
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageUuid
              ? assistantMessageInDatabase
              : message,
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

        // Update local messages with the error message
        setMessages((previous) => [...previous, errorMessageInDatabase]);

        // Update the conversation in the conversations array
        setConversations((previous) =>
          previous.map((conv) =>
            conv.id === conversation.id
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    userMessageInDatabase,
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
    systemPrompt,
    setSystemPrompt,
  };
}

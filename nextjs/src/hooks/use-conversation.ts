import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversationApi } from "@/api/conversations";
import {
  ChatRequest,
  Conversation,
  CreateConversationRequest,
  Message,
  UpdateConversationRequest,
} from "@/types";

type UseConversationHook = {
  conversations: Conversation[];
  isLoadingConversations: boolean;

  selectedConversation: Conversation | undefined;
  isLoadingSelectedConversation: boolean;

  createConversation: (
    request: CreateConversationRequest,
  ) => Promise<Conversation>;
  isCreatingConversation: boolean;

  updateConversation: (
    request: UpdateConversationRequest,
  ) => Promise<Conversation>;
  isUpdatingConversation: boolean;

  chat: (request: ChatRequest) => Promise<void>;
  isChatting: boolean;

  deleteConversation: (id: string) => Promise<void>;
  isDeletingConversation: boolean;
};

export function useConversation(
  selectedConversationId?: string,
): UseConversationHook {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: conversationApi.findAll,
    initialData: [],
  });

  const {
    data: selectedConversation,
    isLoading: isLoadingSelectedConversation,
  } = useQuery({
    queryKey: ["conversations", selectedConversationId],
    queryFn: () => conversationApi.findById(selectedConversationId!),
    enabled: !!selectedConversationId,
  });

  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useMutation({
      mutationFn: conversationApi.create,
      onSuccess: (data) => {
        queryClient.setQueryData(["conversations"], (old: Conversation[]) => {
          return [...old, data];
        });
      },
    });

  const { mutateAsync: updateConversation, isPending: isUpdatingConversation } =
    useMutation({
      mutationFn: conversationApi.update,
      onSuccess: (data) => {
        queryClient.setQueryData(["conversations"], (old: Conversation[]) => {
          return old.map((conversation) =>
            conversation.id === data.id ? data : conversation,
          );
        });
      },
    });

  const { mutateAsync: chat, isPending: isChatting } = useMutation({
    mutationFn: async (request: ChatRequest) => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected");
      }

      // Optimistically add user and assistant messages to local state
      const newMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: request.userPrompt,
        createdAt: new Date().toISOString(),
      };

      const assistantMessageUuid = crypto.randomUUID();

      const assistantMessage: Message = {
        id: assistantMessageUuid,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["conversations", selectedConversationId],
        (old: Conversation) => {
          return {
            ...old,
            messages: [...old.messages, newMessage, assistantMessage],
          };
        },
      );

      const decoder = new TextDecoder();
      try {
        const reader = await conversationApi.chat(request);

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });

          // Update the assistant message content with the new chunk
          queryClient.setQueryData(
            ["conversations", selectedConversationId],
            (old: Conversation) => {
              return {
                ...old,
                messages: old.messages.map((message) =>
                  message.id === assistantMessageUuid
                    ? { ...message, content: message.content + chunk }
                    : message,
                ),
              };
            },
          );
        }
      } catch (error) {
        console.error("Error during streaming:", error);

        // Update the assistant message to show error
        queryClient.setQueryData(
          ["conversations", selectedConversationId],
          (old: Conversation) => {
            return {
              ...old,
              messages: old.messages.map((message) =>
                message.id === assistantMessageUuid
                  ? {
                      ...message,
                      content:
                        message.content +
                        "\n\n[Error: Failed to complete response. Please try again.]",
                    }
                  : message,
              ),
            };
          },
        );
      }
    },
    onSuccess: async () => {
      // Invalidate the conversation to ensure we have the latest data
      await queryClient.invalidateQueries({
        queryKey: ["conversations", selectedConversationId],
      });
    },
    onError: async (error) => {
      console.error("Chat mutation error:", error);
      // Optionally invalidate to refresh the conversation state
      await queryClient.invalidateQueries({
        queryKey: ["conversations", selectedConversationId],
      });
    },
  });

  const { mutateAsync: deleteConversation, isPending: isDeletingConversation } =
    useMutation({
      mutationFn: conversationApi.delete,
      onSuccess: (_, id) => {
        queryClient.setQueryData(["conversations"], (old: Conversation[]) => {
          return old.filter((conversation) => conversation.id !== id);
        });
      },
    });

  return {
    conversations,
    isLoadingConversations,

    selectedConversation,
    isLoadingSelectedConversation,

    createConversation,
    isCreatingConversation,

    updateConversation,
    isUpdatingConversation,

    chat,
    isChatting,

    deleteConversation,
    isDeletingConversation,
  };
}

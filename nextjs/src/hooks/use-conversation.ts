import { useMutation, useQuery } from "@tanstack/react-query";

import { conversationApi } from "@/lib/api/conversation";
import {
  AddMessageRequest,
  Conversation,
  CreateConversationRequest,
  Message,
  UpdateConversationRequest,
} from "@/types";

type UseConversationHook = {
  fetchedConversations: Conversation[];
  isLoadingConversations: boolean;
  createConversation: (
    request: CreateConversationRequest,
  ) => Promise<Conversation>;
  isCreating: boolean;
  updateConversation: (
    request: UpdateConversationRequest,
  ) => Promise<Conversation>;
  isUpdating: boolean;
  addMessage: (request: AddMessageRequest) => Promise<Message>;
  isAddingMessage: boolean;
  deleteConversation: (id: string) => Promise<void>;
  isDeleting: boolean;
};

export function useConversation(): UseConversationHook {
  const { data: fetchedConversations = [], isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: conversationApi.findAll,
    });

  const { mutateAsync: createConversation, isPending: isCreating } =
    useMutation({
      mutationFn: conversationApi.create,
    });

  const { mutateAsync: updateConversation, isPending: isUpdating } =
    useMutation({
      mutationFn: conversationApi.update,
    });

  const { mutateAsync: addMessage, isPending: isAddingMessage } = useMutation({
    mutationFn: conversationApi.addMessage,
  });

  const { mutateAsync: deleteConversation, isPending: isDeleting } =
    useMutation({
      mutationFn: conversationApi.delete,
    });

  return {
    fetchedConversations,
    isLoadingConversations,
    createConversation,
    isCreating,
    updateConversation,
    isUpdating,
    addMessage,
    isAddingMessage,
    deleteConversation,
    isDeleting,
  };
}

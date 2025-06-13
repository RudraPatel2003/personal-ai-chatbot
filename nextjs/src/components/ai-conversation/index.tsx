"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { JSX, useEffect, useRef, useState } from "react";

import { useConversation } from "@/hooks/use-conversation";
import { useMessage } from "@/hooks/use-message";
import { Conversation } from "@/types";

import { Button } from "../ui/button";
import ConversationSelector from "./conversation-selector";
import MessageList from "./message-list";
import UserInput from "./user-input";

export default function AiConversation(): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();

  const {
    fetchedConversations,
    isLoadingConversations,
    createConversation,
    deleteConversation,
  } = useConversation();

  useEffect(() => {
    if (fetchedConversations) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations]);

  const { messages, sendMessage, isLoading } = useMessage(
    selectedConversation,
    setConversations,
  );

  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = async (): Promise<void> => {
    const newConversation = await createConversation();
    setConversations((previous) => [...previous, newConversation]);
    setSelectedConversation(newConversation);
  };

  const handleDeleteConversation = async (): Promise<void> => {
    if (!selectedConversation) return;
    await deleteConversation(selectedConversation.id);
    setConversations((previous) =>
      previous.filter((c) => c.id !== selectedConversation.id),
    );
    setSelectedConversation(undefined);
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Local AI Chatbot</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {isLoadingConversations ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <ConversationSelector
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {selectedConversation && (
            <Button
              onClick={handleDeleteConversation}
              variant="outline"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {selectedConversation ? (
        <>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndReference={messagesEndReference}
          />
          <UserInput sendMessage={sendMessage} isLoading={isLoading} />
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          Select or create a conversation to start chatting
        </div>
      )}
    </div>
  );
}

"use client";

import { JSX, useEffect, useRef, useState } from "react";

import { useConversation } from "@/hooks/use-conversation";
import { useMessage } from "@/hooks/use-message";
import { Conversation } from "@/types";

import MessageList from "./message-list";
import Sidebar from "./sidebar";
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
    updateConversation,
  } = useConversation();

  useEffect(() => {
    if (!isLoadingConversations) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations]);

  const { messages, sendMessage, isLoading, systemPrompt, setSystemPrompt } =
    useMessage(selectedConversation, setConversations);

  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = async (name: string): Promise<void> => {
    const newConversation = await createConversation({ name });
    setConversations((previous) => [...previous, newConversation]);
    setSelectedConversation(newConversation);
  };

  const handleDeleteConversation = async (
    conversationId: string,
  ): Promise<void> => {
    await deleteConversation(conversationId);
    setConversations((previous) =>
      previous.filter((c) => c.id !== conversationId),
    );
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(undefined);
    }
  };

  const handleUpdateConversation = async (
    conversationId: string,
    name: string,
  ): Promise<void> => {
    await updateConversation({ conversationId, name });
    setConversations((previous) =>
      previous.map((c) => (c.id === conversationId ? { ...c, name } : c)),
    );
  };

  return (
    <div className="flex h-screen bg-neutral-900">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onUpdateConversation={handleUpdateConversation}
        isLoadingConversations={isLoadingConversations}
        systemPrompt={systemPrompt}
        onEditSystemPrompt={setSystemPrompt}
      />

      <main className="flex flex-1 flex-col md:pl-64">
        <div className="mx-auto flex h-full w-[90%] flex-col p-4 lg:w-[60%]">
          <h1 className="mb-6 text-center text-2xl font-bold">LocalGPT</h1>

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
            <div className="flex h-full items-center justify-center text-neutral-400">
              Select or create a conversation to start chatting
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

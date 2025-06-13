"use client";

import { Loader2 } from "lucide-react";
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

  const { fetchedConversations, isLoadingConversations, createConversation } =
    useConversation();

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

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Local AI Chatbot</h1>

      <div className="mb-4 flex items-center justify-between">
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

        <Button
          onClick={handleNewConversation}
          className="rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
        >
          New Conversation
        </Button>
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

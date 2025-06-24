"use client";

import { Loader2 } from "lucide-react";
import { JSX, useEffect, useRef } from "react";

import { useConversation } from "@/hooks/use-conversation";

import Sidebar from "../sidebar";
import MessageList from "./message-list";
import UserInput from "./user-input";

type AiConversationProps = {
  conversationId: string;
};

export default function AiConversation({
  conversationId,
}: AiConversationProps): JSX.Element {
  const {
    selectedConversation,
    isLoadingSelectedConversation,
    chat,
    isChatting,
  } = useConversation(conversationId);

  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  return (
    <div className="flex h-screen bg-neutral-900">
      <Sidebar />

      <main className="flex flex-1 flex-col md:pl-64">
        <div className="mx-auto flex h-full w-[90%] flex-col p-4 lg:w-[60%]">
          <h1 className="mb-6 text-center text-2xl font-bold">
            Personal AI Chatbot
          </h1>

          {selectedConversation && !isLoadingSelectedConversation ? (
            <>
              <MessageList
                messages={selectedConversation?.messages ?? []}
                isChatting={isChatting}
                messagesEndReference={messagesEndReference}
              />
              <UserInput
                conversationId={conversationId}
                chat={chat}
                isChatting={isChatting}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

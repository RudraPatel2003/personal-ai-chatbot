"use client";

import { JSX, useEffect, useRef } from "react";

import { useMessage } from "@/hooks/use-message";

import MessageList from "./message-list";
import UserInput from "./user-input";

export default function Conversation(): JSX.Element {
  const { messages, sendMessage, isLoading } = useMessage();
  const messagesEndReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndReference.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Local AI Chatbot</h1>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndReference={messagesEndReference}
      />
      <UserInput sendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}

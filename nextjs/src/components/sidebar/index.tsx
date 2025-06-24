"use client";

import { useQuery } from "@tanstack/react-query";
import { Menu, Newspaper, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { JSX, useState } from "react";

import { conversationApi } from "@/api/conversations";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types";

import { Button } from "../ui/button";
import ConversationCard from "./conversation-card";
import CreateConversationForm from "./create-conversation-form";
import EditConversationForm from "./edit-conversation-form";
import EditSystemPromptForm from "./edit-system-prompt-form";

export default function Sidebar(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConversation, setEditingConversation] =
    useState<Conversation>();
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: conversationApi.findAll,
    initialData: [],
  });

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform bg-neutral-950 transition-transform duration-200 ease-in-out",
          "border-sidebar-border flex flex-col border-r",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-sidebar-border border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sidebar-foreground text-lg font-semibold">
              Conversations
            </h2>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-4">
                <div className="border-sidebar-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onEdit={setEditingConversation}
                />
              ))
            )}
          </div>
        </div>

        <div className="border-sidebar-border flex flex-col gap-2 border-t p-4">
          <Link href="/logs">
            <Button
              variant="outline"
              className="w-full cursor-pointer justify-start gap-2"
            >
              <Newspaper className="h-4 w-4" />
              View Logs
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-start gap-2"
            onClick={() => setIsEditingSystemPrompt(true)}
          >
            <Settings className="h-4 w-4" />
            Edit System Prompt
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CreateConversationForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {editingConversation && (
        <EditConversationForm
          conversation={editingConversation}
          isOpen={!!editingConversation}
          onClose={() => setEditingConversation(undefined)}
        />
      )}

      {isEditingSystemPrompt && (
        <EditSystemPromptForm
          isOpen={isEditingSystemPrompt}
          onClose={() => setIsEditingSystemPrompt(false)}
        />
      )}
    </>
  );
}

import { Menu, Plus, Trash2 } from "lucide-react";
import { JSX, useState } from "react";

import { cn } from "@/lib/utils";
import { Conversation } from "@/types";

import { Button } from "../ui/button";
import CreateConversationForm from "./create-conversation-form";

type SidebarProps = {
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  setSelectedConversation: (conversation: Conversation | undefined) => void;
  onNewConversation: (name: string) => Promise<void>;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  isLoadingConversations: boolean;
};

export default function Sidebar({
  conversations,
  selectedConversation,
  setSelectedConversation,
  onNewConversation,
  onDeleteConversation,
  isLoadingConversations,
}: SidebarProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform bg-neutral-950 p-4 transition-transform duration-200 ease-in-out",
          "border-sidebar-border border-r",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
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

        <div className="space-y-2">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-4">
              <div className="border-sidebar-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-sidebar-muted-foreground text-center text-sm">
              No conversations
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg p-2 text-sm transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  selectedConversation?.id === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                )}
              >
                <button
                  className="flex-1 truncate text-left"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  {conversation.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="z-10 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-neutral-800"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateConversationForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={onNewConversation}
      />
    </>
  );
}

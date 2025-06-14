import { Menu, Plus } from "lucide-react";
import { JSX, useState } from "react";

import { cn } from "@/lib/utils";
import { Conversation } from "@/types";

import { Button } from "../../ui/button";
import ConversationCard from "./conversation-card";
import CreateConversationForm from "./create-conversation-form";
import EditConversationForm from "./edit-conversation-form";

type SidebarProps = {
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  setSelectedConversation: (conversation: Conversation | undefined) => void;
  onNewConversation: (name: string) => Promise<void>;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onUpdateConversation: (
    conversationId: string,
    newName: string,
  ) => Promise<void>;
  isLoadingConversations: boolean;
};

export default function Sidebar({
  conversations,
  selectedConversation,
  setSelectedConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateConversation,
  isLoadingConversations,
}: SidebarProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConversation, setEditingConversation] =
    useState<Conversation>();

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

        <div className="space-y-2 overflow-y-auto">
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
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onSelect={setSelectedConversation}
                onDelete={onDeleteConversation}
                onEdit={setEditingConversation}
              />
            ))
          )}
        </div>
      </div>

      <CreateConversationForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={onNewConversation}
      />

      {editingConversation && (
        <EditConversationForm
          conversation={editingConversation}
          isOpen={!!editingConversation}
          onClose={() => setEditingConversation(undefined)}
          onSubmit={onUpdateConversation}
        />
      )}
    </>
  );
}

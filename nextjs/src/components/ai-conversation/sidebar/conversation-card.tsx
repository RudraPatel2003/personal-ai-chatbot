import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { JSX } from "react";

import { cn } from "@/lib/utils";
import { Conversation } from "@/types";

import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

type ConversationCardProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  onDelete: (conversationId: string) => Promise<void>;
  onEdit: (conversation: Conversation) => void;
};

export default function ConversationCard({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: ConversationCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-lg p-2 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground",
      )}
    >
      <button
        className="flex-1 truncate text-left"
        onClick={() => onSelect(conversation)}
      >
        {conversation.name}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-neutral-800"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(conversation)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => onDelete(conversation.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JSX } from "react";

import { useConversation } from "@/hooks/use-conversation";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ConversationCardProps = {
  conversation: Conversation;
  onEdit: (conversation: Conversation) => void;
};

export default function ConversationCard({
  conversation,
  onEdit,
}: ConversationCardProps): JSX.Element {
  const router = useRouter();
  const { deleteConversation } = useConversation();
  const pathname = usePathname();

  const isSelected = pathname === `/conversations/${conversation.id}`;

  const handleDelete = async (conversationId: string): Promise<void> => {
    await deleteConversation(conversationId);

    if (isSelected) {
      router.push("/");
    }
  };

  return (
    <Link href={`/conversations/${conversation.id}`}>
      <div
        className={cn(
          "group flex h-auto w-full items-center justify-between rounded-lg p-2 text-sm transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
          isSelected
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground",
        )}
      >
        <Button
          variant="ghost"
          className="flex-1 cursor-pointer justify-start text-left font-normal"
        >
          <span className="truncate">{conversation.name}</span>
        </Button>
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
              onClick={() => handleDelete(conversation.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

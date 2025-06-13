import { Dispatch, JSX, SetStateAction } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Conversation } from "@/types";

type ConversationSelectorProperties = {
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | undefined>>;
};

export default function ConversationSelector({
  conversations,
  selectedConversation,
  setSelectedConversation,
}: ConversationSelectorProperties): JSX.Element {
  return (
    <Select
      value={selectedConversation?.id}
      onValueChange={(value) => {
        const conversation = conversations.find((c) => c.id === value);
        setSelectedConversation(conversation);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a conversation" />
      </SelectTrigger>
      <SelectContent>
        {conversations.map((conversation) => (
          <SelectItem key={conversation.id} value={conversation.id}>
            {conversation.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { ChangeEvent, Dispatch, JSX, SetStateAction } from "react";

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
  const handleSelectConversation = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const conversation = conversations.find((c) => c.id === event.target.value);
    setSelectedConversation(conversation);
  };

  return (
    <select
      className="rounded border p-2"
      value={selectedConversation?.id || ""}
      onChange={handleSelectConversation}
    >
      <option value="">Select a conversation</option>
      {conversations.map((conversation) => (
        <option key={conversation.id} value={conversation.id}>
          {conversation.id}
        </option>
      ))}
    </select>
  );
}

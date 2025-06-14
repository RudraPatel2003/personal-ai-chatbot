import { BaseModel, Message } from ".";

export type Conversation = BaseModel & {
  messages: Message[];
};

export type CreateConversationRequest = {
  name: string;
};

export type UpdateConversationRequest = {
  conversationId: string;
  name: string;
};

export type AddMessageRequest = {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

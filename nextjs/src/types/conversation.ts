import { BaseModel, Message } from ".";

export type Conversation = BaseModel & {
  name: string;
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

export type ChatRequest = {
  conversationId: string;
  systemPrompt: string;
  userPrompt: string;
};

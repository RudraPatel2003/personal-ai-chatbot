import { BaseModel, Message } from ".";

export type Conversation = BaseModel & {
  messages: Message[];
};

export type AddMessageRequest = {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

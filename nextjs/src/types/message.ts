import { BaseModel } from ".";

export type Message = BaseModel & {
  role: "user" | "assistant";
  content: string;
};

export type MessageRequest = {
  systemPrompt: string;
  messages: Message[];
};

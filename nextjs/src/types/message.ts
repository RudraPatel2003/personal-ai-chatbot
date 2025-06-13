import { BaseModel } from ".";

export type Message = BaseModel & {
  role: "user" | "assistant";
  content: string;
};

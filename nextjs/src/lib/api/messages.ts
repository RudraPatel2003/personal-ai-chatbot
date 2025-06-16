import { Message, MessageRequest } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const messagesApi = {
  postMessage: async (
    messages: Message[],
    newMessage: Message,
    systemPrompt: string,
  ): Promise<ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>> => {
    const requestMessages = [...messages, newMessage];

    const request: MessageRequest = {
      messages: requestMessages,
      systemPrompt,
    };

    const response = await fetch(`${API_BASE_URL}/dotnet/messages/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to post message");
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body.getReader();
  },
};

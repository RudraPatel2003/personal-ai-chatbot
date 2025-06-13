import { Message } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const messagesApi = {
  postMessage: async (
    messages: Message[],
    newMessage: Message,
  ): Promise<ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>> => {
    const requestMessages = [...messages, newMessage];

    const response = await fetch(`${API_BASE_URL}/dotnet/messages/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: requestMessages }),
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

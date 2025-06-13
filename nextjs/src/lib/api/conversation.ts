import { AddMessageRequest, Conversation, Message } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const conversationApi = {
  async findAll(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/dotnet/conversations`);

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }

    return response.json();
  },

  async findById(id: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/dotnet/conversations/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }

    return response.json();
  },

  async create(): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/dotnet/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }

    return response.json();
  },

  async addMessage(request: AddMessageRequest): Promise<Message> {
    const response = await fetch(
      `${API_BASE_URL}/dotnet/conversations/${request.conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to add message");
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dotnet/conversations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete conversation");
    }
  },
};

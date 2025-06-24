import {
  ChatRequest,
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
} from "@/types";

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

  async create(request: CreateConversationRequest): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/dotnet/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }

    return response.json();
  },

  async update(request: UpdateConversationRequest): Promise<Conversation> {
    const response = await fetch(
      `${API_BASE_URL}/dotnet/conversations/${request.conversationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update conversation");
    }

    return response.json();
  },

  chat: async (
    request: ChatRequest,
  ): Promise<ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>> => {
    const response = await fetch(
      `${API_BASE_URL}/dotnet/conversations/${request.conversationId}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to post message");
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body.getReader();
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

import { Log } from "@/types/log";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type LogResponse = {
  data: Log[];
  nextCursor: number;
};

export const logsApi = {
  async findAll(cursor = 0): Promise<LogResponse> {
    const response = await fetch(`${API_BASE_URL}/go/logs?cursor=${cursor}`);

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    return response.json();
  },
};

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SYSTEM_PROMPT } from "@/utils/constants/system-prompts";

type SystemPromptStore = {
  systemPrompt: string;
  setSystemPrompt: (systemPrompt: string) => void;
  resetSystemPrompt: () => void;
};

export const useSystemPromptStore = create<SystemPromptStore>()(
  persist(
    (set) => ({
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      setSystemPrompt: (systemPrompt: string): void => set({ systemPrompt }),
      resetSystemPrompt: (): void =>
        set({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),
    }),
    {
      name: "system-prompt-storage",
    },
  ),
);

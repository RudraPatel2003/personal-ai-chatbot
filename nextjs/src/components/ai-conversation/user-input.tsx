import { JSX, useState } from "react";

import { useSystemPromptStore } from "@/hooks/use-system-prompt-store";
import { ChatRequest } from "@/types";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

type UserInputProps = {
  conversationId: string;
  chat: (request: ChatRequest) => Promise<void>;
  isChatting: boolean;
};

export default function UserInput({
  conversationId,
  chat,
  isChatting,
}: UserInputProps): JSX.Element {
  const { systemPrompt } = useSystemPromptStore();

  const [input, setInput] = useState("");

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!input.trim() || isChatting) {
      return;
    }

    await chat({
      conversationId,
      userPrompt: input,
      systemPrompt: systemPrompt,
    });

    setInput("");
  };
  return (
    <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        disabled={isChatting}
      />
      <Button
        type="submit"
        disabled={isChatting}
        variant="default"
        className="cursor-pointer"
      >
        {isChatting ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}

import { JSX, useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

type UserInputProps = {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
};

export default function UserInput({
  sendMessage,
  isLoading,
}: UserInputProps): JSX.Element {
  const [input, setInput] = useState("");

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    await sendMessage(input);

    setInput("");
  };
  return (
    <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} variant="default">
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}

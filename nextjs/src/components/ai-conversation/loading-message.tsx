import { Loader2 } from "lucide-react";
import { JSX } from "react";

export function LoadingMessage(): JSX.Element {
  return (
    <div className="max-w-[80%] rounded-lg bg-neutral-700 p-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
}

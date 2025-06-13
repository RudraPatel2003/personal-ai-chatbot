import { JSX } from "react";

export function LoadingMessage(): JSX.Element {
  return (
    <div className="max-w-[80%] rounded-lg bg-gray-100 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500"></div>
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
}

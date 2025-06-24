import { JSX } from "react";

import Sidebar from "../sidebar";

export default function Homepage(): JSX.Element {
  return (
    <div className="flex h-screen bg-neutral-900">
      <Sidebar />

      <main className="flex flex-1 flex-col md:pl-64">
        <div className="mx-auto flex h-full w-[90%] flex-col p-4 lg:w-[60%]">
          <h1 className="mb-6 text-center text-2xl font-bold">
            Personal AI Chatbot
          </h1>

          <div className="flex h-full items-center justify-center text-neutral-400">
            Select or create a conversation to start chatting
          </div>
        </div>
      </main>
    </div>
  );
}

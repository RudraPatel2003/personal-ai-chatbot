import { JSX } from "react";

import AiConversation from "@/components/ai-conversation";

export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: {
    id: string;
  };
};

export default function ConversationPage({
  params,
}: ConversationPageProps): JSX.Element {
  const { id } = params;

  return <AiConversation conversationId={id} />;
}

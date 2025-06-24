import { JSX } from "react";

import AiConversation from "@/components/ai-conversation";

export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps): Promise<JSX.Element> {
  const { id } = await params;

  return <AiConversation conversationId={id} />;
}

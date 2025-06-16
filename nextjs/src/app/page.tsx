import { JSX } from "react";

import Conversation from "@/components/ai-conversation";

export const dynamic = "force-dynamic";

export default function Home(): JSX.Element {
  return <Conversation />;
}

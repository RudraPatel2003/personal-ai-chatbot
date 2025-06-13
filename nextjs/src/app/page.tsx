import { JSX } from "react";

import Conversation from "@/components/conversation";

export const dynamic = "force-dynamic";

export default function Home(): JSX.Element {
  return <Conversation />;
}

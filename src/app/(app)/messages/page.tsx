import type { Metadata } from "next";
import { Inbox } from "./Inbox";

export const metadata: Metadata = { title: "Tin nhắn" };

export default function MessagesPage() {
  return <Inbox />;
}

import type { Metadata } from "next";
import { TOPICS, topicOf } from "@/lib/exchange";
import { TopicDetail } from "./TopicDetail";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/exchange/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: topicOf(id)?.question ?? "Trao đổi" };
}

export default async function TopicPage({ params }: PageProps<"/exchange/[id]">) {
  const { id } = await params;
  return <TopicDetail id={id} />;
}

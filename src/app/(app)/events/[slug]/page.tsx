import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EVENTS, eventOf } from "@/lib/events";
import { EventView } from "../EventView";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = eventOf(slug);
  return { title: event?.title ?? "Không tìm thấy sự kiện", description: event?.description };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = eventOf(slug);
  if (!event) notFound();
  return <EventView event={event} />;
}

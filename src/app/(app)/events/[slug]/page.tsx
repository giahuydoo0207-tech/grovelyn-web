import type { Metadata } from "next";
import { EVENTS, eventOf } from "@/lib/events";
import { EventView } from "../EventView";
import { LocalEvent } from "./LocalEvent";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = eventOf(slug);
  return { title: event?.title ?? "Sự kiện", description: event?.description };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = eventOf(slug);
  if (!event) return <LocalEvent slug={slug} />;
  return <EventView event={event} />;
}

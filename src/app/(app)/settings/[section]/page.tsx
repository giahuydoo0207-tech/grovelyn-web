import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SECTIONS, sectionOf } from "../sections";
import { SettingsView } from "../SettingsView";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/settings/[section]">): Promise<Metadata> {
  const { section } = await params;
  return { title: `${sectionOf(section)?.label ?? "Cài đặt"} | Cài đặt` };
}

export default async function SettingsPage({ params }: PageProps<"/settings/[section]">) {
  const { section } = await params;
  const s = sectionOf(section);
  if (!s) notFound();
  return <SettingsView section={s.slug} />;
}

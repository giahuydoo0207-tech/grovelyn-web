import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GROUPS, groupOf } from "@/lib/data";
import { GroupHome } from "./GroupHome";

export function generateStaticParams() {
  return GROUPS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/groups/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const group = groupOf(slug);
  return { title: group?.name ?? "Không tìm thấy nhóm", description: group?.description };
}

export default async function GroupPage({ params }: PageProps<"/groups/[slug]">) {
  const { slug } = await params;
  const group = groupOf(slug);
  if (!group) notFound();
  return <GroupHome group={group} />;
}

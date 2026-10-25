import type { Metadata } from "next";
import { GROUPS, groupOf } from "@/lib/data";
import { GroupHome } from "./GroupHome";
import { LocalGroup } from "./LocalGroup";

export function generateStaticParams() {
  return GROUPS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/groups/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const group = groupOf(slug);
  return { title: group?.name ?? "Nhóm", description: group?.description };
}

export default async function GroupPage({ params }: PageProps<"/groups/[slug]">) {
  const { slug } = await params;
  const group = groupOf(slug);
  if (!group) return <LocalGroup slug={slug} />;
  return <GroupHome group={group} />;
}

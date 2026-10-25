import type { Metadata } from "next";
import { PROJECTS, projectOf } from "@/lib/data";
import { ProjectView } from "./ProjectView";
import { LocalProject } from "./LocalProject";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: projectOf(slug)?.title ?? "Dự án" };
}

export default async function ProjectPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const project = projectOf(slug);
  // Không có trong dữ liệu mẫu: có thể là dự án bạn vừa tạo, lưu trên trình duyệt.
  if (!project) return <LocalProject slug={slug} />;
  return <ProjectView project={project} />;
}

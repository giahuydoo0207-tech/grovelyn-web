import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe2, Sprout } from "lucide-react";
import { ME, PROJECTS, projectOf, userOf } from "@/lib/data";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { LikeButton } from "@/components/LikeButton";
import { Embed } from "@/components/project/Embed";
import { FolderCover } from "@/components/project/FolderCover";
import { ProjectLogo } from "@/components/project/ProjectLogo";
import { SaveButton } from "./SaveButton";
import { ProjectStory } from "./ProjectStory";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: projectOf(slug)?.title ?? "Không tìm thấy dự án" };
}

export default async function ProjectPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const project = projectOf(slug);
  if (!project) notFound();
  const owner = userOf(project.owner)!;
  const showcase = showcaseOf(project);
  const phase = currentPhase(showcase.milestones);
  const canEdit = project.owner === ME || project.members.some((m) => m.handle === ME);
  const video = showcase.resources?.video;

  return (
    <div className="flex flex-col gap-10">
      <header className="overflow-hidden rounded-3xl bg-ink text-white">
        <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
          <div className="min-w-0">
            <div className="flex items-center gap-3.5">
              <span className="shrink-0 rounded-2xl bg-white p-1">
                <ProjectLogo title={project.title} logo={showcase.logo} size={52} />
              </span>
              <nav aria-label="Vị trí" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fog">
                <Link href={`/u/${owner.handle}`} className="hover:text-white">
                  {owner.name}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{project.field}</span>
                <span aria-hidden="true">·</span>
                <span>{project.kind}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-ink-line px-2.5 py-0.5 text-xs font-semibold">
                  <Globe2 className="h-3 w-3" aria-hidden="true" /> Công khai
                </span>
              </nav>
            </div>
            <h1 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.045em]">{project.title}</h1>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-fog">{project.summary}</p>
            {showcase.tags.length > 0 && (
              <ul aria-label="Thẻ" className="mt-5 flex flex-wrap gap-2">
                {showcase.tags.map((t) => (
                  <li key={t} className="rounded-full border border-ink-line px-3 py-1 text-sm text-fog">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#hanh-trinh"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-leaf/15 px-4 text-sm font-semibold text-leaf ring-1 ring-leaf/40 hover:bg-leaf/25"
              >
                <Sprout className="h-4 w-4" aria-hidden="true" /> {phaseLabel(phase)} · {showcase.milestones.length} cột mốc
              </a>
              <LikeButton count={project.likes} dark />
              <SaveButton />
            </div>
          </div>
          <div className="min-w-0">
            {video ? (
              <Embed url={video} title={`Video demo ${project.title}`} />
            ) : (
              <div className="rounded-2xl bg-ink-2 px-6 pt-8">
                <FolderCover tone="leaf" title={project.title} logo={showcase.logo} kind={project.kind} height={220} logoSize={96} />
              </div>
            )}
          </div>
        </div>
      </header>

      <ProjectStory project={project} showcase={showcase} canEdit={canEdit} />
    </div>
  );
}

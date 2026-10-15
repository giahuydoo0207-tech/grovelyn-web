import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe2 } from "lucide-react";
import { PROJECTS, QUOTA_MB, projectOf, userOf } from "@/lib/data";
import { ProjectCover } from "@/components/ProjectCover";
import { Avatar } from "@/components/Avatar";
import { LikeButton } from "@/components/LikeButton";
import { SaveButton } from "./SaveButton";
import { ProjectTabs } from "./ProjectTabs";

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
  const usedMb = 42;

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[28px] bg-ink text-white">
        <ProjectCover seed={project.seed} tone="ink" className="absolute inset-y-0 right-0 h-full w-full opacity-70 md:w-2/3" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#06110a_35%,rgba(6,17,10,0.6)_70%,rgba(6,17,10,0.2))]" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-10">
          <nav aria-label="Vị trí" className="flex flex-wrap items-center gap-2 text-sm text-fog">
            <Link href={`/u/${owner.handle}`} className="hover:text-white">
              {owner.handle}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{project.slug}</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-ink-line px-2.5 py-0.5 text-xs font-semibold text-fog">
              <Globe2 className="h-3 w-3" aria-hidden="true" /> Công khai
            </span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-[15px] font-semibold text-leaf">
              {project.field}, {project.kind.toLowerCase()}
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.04em]">
              {project.title}
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-fog">{project.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LikeButton count={project.likes} dark />
            <SaveButton />
            <span className="ml-auto flex items-center gap-2 text-sm text-fog">
              Cập nhật {project.updated}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ProjectTabs project={project} />

        <aside className="flex flex-col gap-4">
          <section className="rounded-[20px] border border-line p-5">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Người làm</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {project.members.map((m) => {
                const u = userOf(m.handle);
                if (!u) return null;
                return (
                  <li key={m.handle} className="flex items-center gap-3">
                    <Avatar initials={u.initials} tone={u.tone} size={40} />
                    <div className="min-w-0">
                      <Link href={`/u/${u.handle}`} className="block truncate font-semibold hover:text-leaf-deep">
                        {u.name}
                      </Link>
                      <p className="truncate text-sm text-moss">{m.part}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="rounded-[20px] border border-line p-5">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Công cụ</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tools.map((t) => (
                <li key={t} className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium">
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[20px] bg-mist p-5">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Dung lượng</h2>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-white"
              role="progressbar"
              aria-valuenow={usedMb}
              aria-valuemin={0}
              aria-valuemax={QUOTA_MB}
              aria-label="Dung lượng đã dùng"
            >
              <div className="h-full rounded-full bg-leaf-deep" style={{ width: `${(usedMb / QUOTA_MB) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-moss">
              Tài khoản của {owner.name.split(" ").pop()} đã dùng {usedMb} MB trên {QUOTA_MB} MB.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

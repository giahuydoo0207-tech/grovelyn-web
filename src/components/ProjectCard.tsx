import Link from "next/link";
import { Heart, MessageCircle, Sprout } from "lucide-react";
import type { Project } from "@/lib/data";
import { userOf } from "@/lib/data";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { ProjectCover } from "./ProjectCover";
import { Avatar } from "./Avatar";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const owner = userOf(project.owner);
  const phase = phaseLabel(currentPhase(showcaseOf(project).milestones));

  return (
    <Link
      href={`/p/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_14px_40px_-18px_rgba(6,17,10,0.35)]"
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/10] lg:aspect-auto lg:flex-1" : "aspect-[16/9]"}`}>
        <ProjectCover
          seed={project.seed}
          tone={project.tone}
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-grow)] group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">
          {project.kind}
        </span>
      </div>
      <div className={`flex flex-col gap-3 ${featured ? "p-6" : "p-5"}`}>
        <span className="text-[13px] font-semibold text-leaf-deep">{project.field}</span>
        <h3
          className={`font-display font-bold leading-tight tracking-[-0.02em] ${featured ? "text-[clamp(1.5rem,2.4vw,2rem)]" : "text-lg"}`}
        >
          {project.title}
        </h3>
        {featured && <p className="max-w-[60ch] text-[15px] leading-relaxed text-moss">{project.summary}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {owner && (
            <span className="flex min-w-0 items-center gap-2 text-sm text-moss">
              <Avatar initials={owner.initials} tone={owner.tone} size={26} />
              <span className="truncate">{owner.name}</span>
            </span>
          )}
          <span className="flex shrink-0 items-center gap-3 text-[13px] text-moss">
            <span className="flex items-center gap-1" title="Lượt thích">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">{project.likes}</span>
              <span className="sr-only">lượt thích</span>
            </span>
            <span className="flex items-center gap-1" title="Bình luận">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">{project.comments}</span>
              <span className="sr-only">bình luận</span>
            </span>
            <span className="flex items-center gap-1 text-leaf-deep" title="Giai đoạn hiện tại">
              <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
              {phase}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

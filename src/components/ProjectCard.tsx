import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/lib/data";
import { contextLabel, userOf } from "@/lib/data";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { FolderCover } from "./project/FolderCover";
import { Avatar } from "./Avatar";

/** Thẻ dự án: bìa hồ sơ ghi dạng đầu ra, rồi lĩnh vực, mức thực hiện, tên, bối cảnh và vai trò của người làm. */
export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const owner = userOf(project.owner);
  const showcase = showcaseOf(project);
  const phase = phaseLabel(currentPhase(showcase.milestones));
  const role = project.members.find((m) => m.handle === project.owner)?.part;

  return (
    <Link
      href={`/p/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_14px_40px_-18px_rgba(6,17,10,0.35)] [&:hover_.folder-logo]:-translate-y-1"
    >
      <div
        className={`bg-mist px-[18px] pt-[22px] ${featured ? "lg:flex lg:flex-1 lg:flex-col" : ""}`}
      >
        {/* Cùng tên với bìa ở trang dự án: bấm thẻ thì bìa trượt và phóng to sang đầu trang. */}
        <ViewTransition
          name={`bia-${project.slug}`}
          share="morph"
          default="none"
        >
          <FolderCover
            tone={project.tone}
            title={project.title}
            logo={showcase.logo}
            kind={project.output}
            height={featured ? 240 : 176}
            logoSize={featured ? 104 : 78}
            fill={featured}
            className={featured ? "lg:flex-1" : ""}
          />
        </ViewTransition>
      </div>
      <div className={`flex flex-col gap-2.5 ${featured ? "p-6" : "p-5"}`}>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="font-semibold text-leaf-deep">{project.field}</span>
          <span className="shrink-0 font-semibold text-moss">{phase}</span>
        </div>
        <h3
          className={`font-display font-bold leading-tight tracking-[-0.02em] ${featured ? "text-[clamp(1.4rem,2.2vw,1.85rem)]" : "text-lg"}`}
        >
          {project.title}
        </h3>
        {featured && (
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-moss">
            {project.summary}
          </p>
        )}
        <dl className="mt-1 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
          <dt className="text-moss">Bối cảnh</dt>
          <dd className="truncate font-semibold">{contextLabel(project)}</dd>
          {owner && (
            <>
              <dt className="text-moss">Người làm</dt>
              <dd className="flex min-w-0 items-center gap-2 font-semibold">
                <Avatar initials={owner.initials} tone={owner.tone} size={22} />
                <span className="truncate">{owner.name}</span>
              </dd>
            </>
          )}
          {role && (
            <>
              <dt className="text-moss">Vai trò</dt>
              <dd className="truncate font-semibold">{role}</dd>
            </>
          )}
        </dl>
      </div>
    </Link>
  );
}

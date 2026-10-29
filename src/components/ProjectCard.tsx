"use client";

import Link from "next/link";
import type { Project } from "@/lib/data";
import { contextLabel, userOf } from "@/lib/data";
import { fieldColor } from "@/lib/palette";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { useTopics } from "@/lib/topicStore";
import { FolderCover } from "./project/FolderCover";
import { Avatar } from "./Avatar";

/** Thẻ dự án: bìa hồ sơ ghi dạng đầu ra kèm phiên bản, lĩnh vực, trạng thái, tóm tắt ngắn, người làm và bối cảnh. */
export function ProjectCard({
  project,
  person,
}: {
  project: Project;
  /** Giữ tương thích với trang hồ sơ. */
  person?: string;
}) {
  void person;
  const owner = userOf(project.owner);
  const showcase = showcaseOf(project);
  const phase = phaseLabel(currentPhase(showcase.milestones));
  const curVer = project.versions[0]?.tag;
  const versionTrail =
    project.versions.length >= 2
      ? [...project.versions].reverse().map((v) => v.tag).join(" · ")
      : null;
  const hasOpenTopic = useTopics().some((t) => t.project === project.slug && t.status === "open");

  return (
    <Link
      href={`/p/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_14px_36px_-18px_rgba(6,17,10,0.32)] [&:hover_.folder-logo]:-translate-y-1"
    >
      <div className="relative bg-mist px-4 pt-5">
        {curVer && (
          <span className="pointer-events-none absolute bottom-2.5 right-6 z-10 rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-ink">
            bản {curVer}
          </span>
        )}
        <FolderCover
          tone={project.tone}
          title={project.title}
          logo={showcase.logo}
          logoSrc={project.local?.logoSrc}
          coverSrc={project.local?.coverSrc}
          kind={project.output}
          height={160}
          logoSize={72}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className="truncate rounded-full px-2.5 py-0.5 font-bold"
            style={{ background: fieldColor(project.field).bg, color: fieldColor(project.field).fg }}
          >
            {project.field}
          </span>
          {hasOpenTopic ? (
            <span className="shrink-0 rounded-full bg-sap px-2.5 py-0.5 font-bold text-leaf-deep">
              Đang mở trao đổi
            </span>
          ) : project.usage === "Đã dùng thực tế" ? (
            <span className="shrink-0 font-bold text-leaf-deep">Đã dùng thực tế</span>
          ) : (
            <span className="shrink-0 font-semibold text-moss">{phase}</span>
          )}
        </div>
        <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-moss">
          {project.summary}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-1">
          {versionTrail && (
            <p className="truncate text-[11px] font-bold tracking-wide tabular-nums text-leaf-deep">
              {versionTrail}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-xs">
            {owner && (
              <span className="flex min-w-0 items-center gap-2 font-semibold text-ink">
                <Avatar initials={owner.initials} tone={owner.tone} handle={owner.handle} size={22} />
                <span className="truncate">{owner.name}</span>
              </span>
            )}
            <span className="shrink-0 font-semibold text-moss">{contextLabel(project)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

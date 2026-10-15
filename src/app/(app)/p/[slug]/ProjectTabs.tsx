"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Box, Download, FileImage, FileSpreadsheet, FileText, FileVideo, Folder, type LucideIcon } from "lucide-react";
import type { Project, ProjectFile } from "@/lib/data";
import { userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";

const TABS = ["Tổng quan", "Tệp", "Phiên bản", "Thảo luận"] as const;
type Tab = (typeof TABS)[number];

const ICON: Record<ProjectFile["kind"], LucideIcon> = {
  folder: Folder,
  pdf: FileText,
  image: FileImage,
  video: FileVideo,
  doc: FileSpreadsheet,
  model: Box,
};

const SAMPLE_THREAD = [
  { author: "thuha", text: "Bản v5 rõ hơn hẳn. Bạn cho thêm sơ đồ hướng gió vào trang đầu PDF nhé.", when: "1 ngày trước" },
  { author: "hoanglong", text: "Giếng trời có tính chống mưa tạt chưa bạn?", when: "20 giờ trước" },
];

export function ProjectTabs({ project }: { project: Project }) {
  const [tab, setTab] = useState<Tab>("Tổng quan");
  const latest = project.versions[0];
  const counts: Partial<Record<Tab, number>> = { "Tệp": project.files.length, "Phiên bản": project.versions.length, "Thảo luận": project.comments };

  return (
    <div className="min-w-0">
      <div role="tablist" aria-label="Nội dung dự án" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              role="tab"
              id={`tab-${t}`}
              aria-selected={on}
              aria-controls="tab-panel"
              onClick={() => setTab(t)}
              className={`relative flex shrink-0 items-center gap-2 pb-3 pt-1 text-[15px] font-semibold transition-colors ${on ? "text-ink" : "text-moss hover:text-ink"}`}
            >
              {t}
              {counts[t] !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${on ? "bg-ink text-white" : "bg-mist text-moss"}`}>{counts[t]}</span>
              )}
              {on && <motion.span layoutId="project-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-leaf" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id="tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="pt-6"
        >
          {tab === "Tổng quan" && (
            <article className="flex max-w-[68ch] flex-col gap-6">
              {project.readme.map((s) => (
                <section key={s.heading}>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">{s.heading}</h2>
                  <p className="mt-2 text-[16px] leading-[1.75] text-ink/85">{s.body}</p>
                </section>
              ))}
            </article>
          )}

          {tab === "Tệp" && (
            <div className="overflow-hidden rounded-[20px] border border-line">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-mist px-4 py-3">
                <p className="text-sm text-moss">
                  Bản mới nhất <strong className="text-ink">{latest?.tag}</strong>: {latest?.note}
                </p>
                <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2">
                  <Download className="h-4 w-4" aria-hidden="true" /> Tải tất cả
                </button>
              </div>
              <ul>
                {project.files.map((file, i) => {
                  const Icon = ICON[file.kind];
                  return (
                    <motion.li
                      key={file.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-line px-4 py-3 text-[15px] transition-colors hover:bg-mist/60 sm:grid-cols-[minmax(0,1fr)_96px_120px]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon
                          className={`h-5 w-5 shrink-0 ${file.kind === "folder" ? "fill-sap text-leaf-deep" : "text-moss"}`}
                          aria-hidden="true"
                        />
                        <a href="#" className="truncate font-medium hover:text-leaf-deep hover:underline">
                          {file.name}
                        </a>
                      </span>
                      <span className="hidden text-sm tabular-nums text-moss sm:block">{file.size ?? ""}</span>
                      <span className="text-right text-sm text-moss">{file.updated}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}

          {tab === "Phiên bản" && (
            <ol className="relative ml-3 flex flex-col gap-6 border-l-2 border-line pl-6">
              {project.versions.map((v, i) => (
                <li key={v.tag} className="relative">
                  <span
                    className={`absolute -left-[35px] top-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full ${i === 0 ? "bg-leaf" : "border-2 border-line bg-white"}`}
                    aria-hidden="true"
                  >
                    {i === 0 && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-lg font-bold">{v.tag}</span>
                    <span className="text-sm text-moss">{v.when}</span>
                    {i === 0 && <span className="rounded-full bg-sap px-2 py-0.5 text-xs font-semibold text-leaf-deep">Mới nhất</span>}
                  </div>
                  <p className="mt-1 text-[15px]">{v.note}</p>
                </li>
              ))}
            </ol>
          )}

          {tab === "Thảo luận" && (
            <div className="flex max-w-2xl flex-col gap-5">
              {SAMPLE_THREAD.map((c) => {
                const u = userOf(c.author);
                if (!u) return null;
                return (
                  <div key={c.text} className="flex gap-3">
                    <Avatar initials={u.initials} tone={u.tone} size={36} />
                    <div className="rounded-2xl rounded-tl-md bg-mist px-4 py-3">
                      <p className="text-sm">
                        <Link href={`/u/${u.handle}`} className="font-semibold hover:text-leaf-deep">
                          {u.name}
                        </Link>{" "}
                        <span className="text-moss">{c.when}</span>
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                );
              })}
              <label className="flex gap-3">
                <span className="sr-only">Viết góp ý</span>
                <textarea
                  rows={2}
                  placeholder="Góp ý cho dự án này"
                  className="min-h-[52px] flex-1 resize-y rounded-2xl border border-line px-4 py-3 text-[15px] outline-none focus:border-ink"
                />
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

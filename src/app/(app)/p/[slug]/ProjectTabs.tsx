"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Box, Download, FileImage, FileSpreadsheet, FileText, FileVideo, Folder, type LucideIcon } from "lucide-react";
import type { Project, ProjectFile } from "@/lib/data";
import { userOf } from "@/lib/data";
import type { Showcase } from "@/lib/showcase";
import { TEMPLATES } from "@/lib/templates";
import { Avatar } from "@/components/Avatar";
import { BeforeAfter } from "@/components/project/BeforeAfter";
import { Embed } from "@/components/project/Embed";
import { Gallery } from "@/components/project/Gallery";
import { Journey } from "@/components/project/Journey";

const TABS = ["Tổng quan", "Hành trình", "Tệp", "Thảo luận"] as const;
type Tab = (typeof TABS)[number];

/** Link "#tep", "#hanh-trinh" mở thẳng đúng tab. */
const HASH: Record<string, Tab> = { "#tong-quan": "Tổng quan", "#hanh-trinh": "Hành trình", "#tep": "Tệp", "#thao-luan": "Thảo luận" };

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

export function ProjectTabs({ project, showcase, canEdit }: { project: Project; showcase: Showcase; canEdit: boolean }) {
  const [tab, setTab] = useState<Tab>("Tổng quan");
  const latest = project.versions[0];
  const counts: Partial<Record<Tab, number>> = { "Hành trình": showcase.milestones.length, "Tệp": project.files.length, "Thảo luận": project.comments };
  const template = TEMPLATES[project.field];
  const facts = template.facts.filter((f) => showcase.facts[f.key]);

  useEffect(() => {
    const sync = () => {
      const next = HASH[window.location.hash];
      if (next) {
        setTab(next);
        document.getElementById("noi-dung-du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className="min-w-0 scroll-mt-24" id="noi-dung-du-an">
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
            <div className="flex flex-col gap-10">
              {facts.length > 0 && (
                <dl className={`grid gap-px overflow-hidden rounded-[20px] border border-line bg-line ${facts.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
                  {facts.map((f) => (
                    <div key={f.key} className="bg-white p-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-moss">{f.label}</dt>
                      <dd className="mt-1.5 font-display text-[17px] font-bold leading-snug tracking-[-0.01em]">{showcase.facts[f.key]}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {showcase.gallery.length > 0 && <Gallery shots={showcase.gallery} />}
              <article className="flex max-w-[68ch] flex-col gap-6">
                {project.readme.map((s) => (
                  <section key={s.heading}>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">{s.heading}</h2>
                    <p className="mt-2 text-[16px] leading-[1.75] text-ink/85">{s.body}</p>
                  </section>
                ))}
              </article>
              {showcase.beforeAfter && (
                <section>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">Trước và sau</h2>
                  <div className="mt-4">
                    <BeforeAfter before={showcase.beforeAfter.before} after={showcase.beforeAfter.after} />
                  </div>
                </section>
              )}
              {showcase.embeds.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">Xem trực tiếp</h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {showcase.embeds.map((e) => (
                      <Embed key={e.url} url={e.url} title={e.title} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === "Hành trình" && <Journey slug={project.slug} seed={showcase.milestones} canEdit={canEdit} />}

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

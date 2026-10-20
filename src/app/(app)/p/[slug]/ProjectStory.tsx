"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Box,
  Code2,
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  Link2,
  Play,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import type { Project, ProjectFile } from "@/lib/data";
import { userOf } from "@/lib/data";
import { currentPhase, PHASES, type ProjectLink, type Resources, type Showcase } from "@/lib/showcase";
import { toEmbed } from "@/lib/embed";
import { TEMPLATES } from "@/lib/templates";
import { Avatar } from "@/components/Avatar";
import { BeforeAfter } from "@/components/project/BeforeAfter";
import { Embed } from "@/components/project/Embed";
import { Gallery } from "@/components/project/Gallery";
import { Journey } from "@/components/project/Journey";

type View = "story" | "resources" | "discussion";

const FILE_ICON: Record<ProjectFile["kind"], LucideIcon> = {
  folder: Folder,
  pdf: FileText,
  image: FileImage,
  video: FileVideo,
  doc: FileSpreadsheet,
  model: Box,
};

export const RESOURCE_META: { key: keyof Resources; label: string; icon: LucideIcon }[] = [
  { key: "demo", label: "Demo", icon: ArrowUpRight },
  { key: "repo", label: "Repo", icon: Code2 },
  { key: "slides", label: "Slides", icon: Presentation },
  { key: "video", label: "Video", icon: Play },
];

const LINK_ICON: Record<ProjectLink["kind"], LucideIcon> = { demo: ArrowUpRight, file: FileText, repo: Code2, other: Link2 };

const SAMPLE_THREAD = [
  { author: "thuha", text: "Bản mới rõ hơn hẳn. Bạn thêm sơ đồ tổng quan vào trang đầu nhé.", when: "1 ngày trước" },
  { author: "hoanglong", text: "Phần này bạn đã thử với người dùng thật chưa?", when: "20 giờ trước" },
];

/** Bỏ "https://" và dấu "/" cuối để hiện link gọn. */
const shortUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const external = (url: string) => /^https?:\/\//.test(url);

interface Chapter {
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Trang dự án kiểu "câu chuyện theo chương": mục lục bên trái, nội dung đọc như một bài kể ở giữa,
 * tài nguyên và giai đoạn ở cột phải. Tài nguyên và Thảo luận mở thay cho phần câu chuyện.
 */
export function ProjectStory({ project, showcase, canEdit }: { project: Project; showcase: Showcase; canEdit: boolean }) {
  const [view, setView] = useState<View>("story");
  const [active, setActive] = useState<string | null>(null);
  const template = TEMPLATES[project.field];
  const facts = template.facts.filter((f) => showcase.facts[f.key]);
  const resources = showcase.resources ?? {};
  const resourceCount = RESOURCE_META.filter((r) => resources[r.key]).length + showcase.links.length + project.files.length;

  const chapters = useMemo<Chapter[]>(() => {
    const list: Chapter[] = project.readme.map((s, i) => ({
      id: `chuong-${i + 1}`,
      title: s.heading,
      body: <p className="text-[17px] leading-[1.8] text-ink/90">{s.body}</p>,
    }));
    if (showcase.gallery.length > 0) list.push({ id: "hinh-anh", title: "Hình ảnh", body: <Gallery shots={showcase.gallery} label="Ảnh chụp dự án" /> });
    if (showcase.beforeAfter)
      list.push({ id: "truoc-sau", title: "Trước và sau", body: <BeforeAfter before={showcase.beforeAfter.before} after={showcase.beforeAfter.after} /> });
    list.push({ id: "hanh-trinh", title: "Hành trình", body: <Journey slug={project.slug} seed={showcase.milestones} canEdit={canEdit} /> });
    if (showcase.embeds.length > 0)
      list.push({
        id: "xem-truc-tiep",
        title: "Xem trực tiếp",
        body: (
          <div className="flex flex-col gap-4">
            {showcase.embeds.map((e) => (
              <Embed key={e.url} url={e.url} title={e.title} />
            ))}
          </div>
        ),
      });
    return list;
  }, [project, showcase, canEdit]);

  // Link "#tai-nguyen", "#thao-luan", "#hanh-trinh", "#tep" mở đúng phần.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (h === "tai-nguyen" || h === "tep") setView("resources");
      else if (h === "thao-luan") setView("discussion");
      else if (chapters.some((c) => c.id === h)) {
        setView("story");
        setActive(h);
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [chapters]);

  // Đánh dấu chương đang đọc trong mục lục.
  useEffect(() => {
    if (view !== "story") return;
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const first = chapters.find((c) => seen.get(c.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const c of chapters) {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [chapters, view]);

  const goChapter = (id: string) => {
    setView("story");
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const goView = (v: View) => {
    setView(v);
    history.replaceState(null, "", v === "story" ? window.location.pathname : `#${v === "resources" ? "tai-nguyen" : "thao-luan"}`);
    requestAnimationFrame(() => document.getElementById("noi-dung-du-an")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const navItem = (label: string, on: boolean, onClick: () => void, num?: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-current={on ? "true" : undefined}
      className={`flex w-full items-baseline gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition-colors ${on ? "bg-sap text-ink" : "text-ink/80 hover:bg-mist"}`}
    >
      {num && <span className="font-display text-[13px] tabular-nums text-leaf-deep">{num}</span>}
      <span className="min-w-0">{label}</span>
    </button>
  );

  return (
    <div id="noi-dung-du-an" className="grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[210px_minmax(0,1fr)_290px] lg:gap-10">
      {/* Mục lục: cột trái trên máy tính, hàng nút cuộn ngang trên điện thoại */}
      <nav aria-label="Trong dự án" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 hidden text-xs font-bold uppercase tracking-[0.06em] text-moss lg:block">Trong dự án</p>
        <ol className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {chapters.map((c, i) => (
            <li key={c.id} className="shrink-0 lg:shrink">
              {navItem(c.title, view === "story" && active === c.id, () => goChapter(c.id), String(i + 1).padStart(2, "0"))}
            </li>
          ))}
          <li className="shrink-0 lg:mt-4 lg:shrink lg:border-t lg:border-line lg:pt-3">
            {navItem(`Tài nguyên (${resourceCount})`, view === "resources", () => goView("resources"))}
          </li>
          <li className="shrink-0 lg:shrink">{navItem(`Thảo luận (${project.comments})`, view === "discussion", () => goView("discussion"))}</li>
        </ol>
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="min-w-0"
        >
          {view === "story" && (
            <>
              {facts.length > 0 && (
                <dl className={`mb-2 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line ${facts.length >= 4 ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
                  {facts.map((f) => (
                    <div key={f.key} className="bg-white p-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-moss">{f.label}</dt>
                      <dd className="mt-1.5 font-display text-[16px] font-bold leading-snug">{showcase.facts[f.key]}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {chapters.map((c, i) => (
                <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-24 border-t border-line py-10 first:border-t-0 first:pt-6">
                  <p className="font-display text-[15px] font-bold text-leaf-deep">Chương {String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`${c.id}-title`} className="mb-5 mt-1 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">
                    {c.title}
                  </h2>
                  {c.body}
                </section>
              ))}
            </>
          )}

          {view === "resources" && (
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="mb-5 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">Demo và tài liệu</h2>
                {RESOURCE_META.some((r) => resources[r.key]) || showcase.links.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {RESOURCE_META.filter((r) => resources[r.key]).map((r) => (
                      <ResourceRow key={r.key} icon={r.icon} label={r.label} url={resources[r.key]!} />
                    ))}
                    {showcase.links.map((l) => (
                      <ResourceRow key={l.label} icon={LINK_ICON[l.kind]} label={l.label} url={l.url} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-moss">Dự án chưa có link demo hay tài liệu.</p>
                )}
              </section>
              <section>
                <h2 className="mb-5 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">Tệp</h2>
                <div id="tep" className="overflow-hidden rounded-[20px] border border-line bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-mist px-4 py-3">
                    <p className="text-sm text-moss">
                      Bản mới nhất <strong className="text-ink">{project.versions[0]?.tag}</strong>: {project.versions[0]?.note}
                    </p>
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2">
                      <Download className="h-4 w-4" aria-hidden="true" /> Tải tất cả
                    </button>
                  </div>
                  <ul>
                    {project.files.map((file) => {
                      const Icon = FILE_ICON[file.kind];
                      return (
                        <li
                          key={file.name}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-line px-4 py-3 text-[15px] hover:bg-mist/60 sm:grid-cols-[minmax(0,1fr)_96px_120px]"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <Icon className={`h-5 w-5 shrink-0 ${file.kind === "folder" ? "fill-sap text-leaf-deep" : "text-moss"}`} aria-hidden="true" />
                            <a href="#" className="truncate font-medium hover:text-leaf-deep hover:underline">
                              {file.name}
                            </a>
                          </span>
                          <span className="hidden text-sm tabular-nums text-moss sm:block">{file.size ?? ""}</span>
                          <span className="text-right text-sm text-moss">{file.updated}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            </div>
          )}

          {view === "discussion" && (
            <section className="flex max-w-2xl flex-col gap-5">
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">Thảo luận</h2>
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
            </section>
          )}
        </motion.article>
      </AnimatePresence>

      <ProjectAside project={project} showcase={showcase} onTimeline={() => goChapter("hanh-trinh")} />
    </div>
  );
}

function ResourceRow({ icon: Icon, label, url }: { icon: LucideIcon; label: string; url: string }) {
  const embeddable = toEmbed(url);
  return (
    <li>
      <a
        href={url}
        {...(external(url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 transition-colors hover:bg-mist"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sap">
          <Icon className="h-5 w-5 text-leaf-deep" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{label}</span>
          <span className="block truncate text-sm text-moss">{shortUrl(url)}</span>
        </span>
        <span className="hidden shrink-0 text-[13px] text-moss sm:block">{embeddable ? `Có thể nhúng: ${embeddable.label}` : "Mở tab mới"}</span>
        <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-moss" aria-hidden="true" />
      </a>
    </li>
  );
}

function ProjectAside({ project, showcase, onTimeline }: { project: Project; showcase: Showcase; onTimeline: () => void }) {
  const resources = showcase.resources ?? {};
  const present = RESOURCE_META.filter((r) => resources[r.key]);
  const reached = PHASES.findIndex((p) => p.id === currentPhase(showcase.milestones));
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      {(present.length > 0 || project.updated) && (
        <section className="rounded-[20px] border border-line bg-white p-5">
          {present.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              {present.map((r) => (
                <a
                  key={r.key}
                  href={resources[r.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line font-bold transition-colors hover:bg-mist"
                >
                  <r.icon className="h-[18px] w-[18px] text-leaf-deep" aria-hidden="true" />
                  {r.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-[13px] text-moss">Cập nhật {project.updated}</p>
        </section>
      )}
      <section className="rounded-[20px] border border-line bg-white p-5">
        <h2 className="font-semibold">Giai đoạn</h2>
        <button type="button" onClick={onTimeline} className="mt-3 block w-full text-left" aria-label="Xem hành trình dự án">
          <ol className="grid grid-cols-3 gap-2">
            {PHASES.map((p, i) => (
              <li key={p.id} className="flex flex-col gap-2">
                <span className={`h-1.5 rounded-full ${i <= reached ? "bg-leaf-deep" : "bg-line"}`} />
                <span className={`text-[13px] font-semibold ${i <= reached ? "text-ink" : "text-moss"}`}>{p.label}</span>
              </li>
            ))}
          </ol>
        </button>
        <h2 className="mt-5 font-semibold">Công nghệ</h2>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {project.tools.map((t) => (
            <li key={t} className="rounded-full bg-mist px-3 py-1 text-[13px] font-semibold">
              {t}
            </li>
          ))}
        </ul>
        {showcase.expertise && showcase.expertise.length > 0 && (
          <>
            <h2 className="mt-5 font-semibold">Chuyên môn</h2>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {showcase.expertise.map((t) => (
                <li key={t} className="rounded-full bg-sap px-3 py-1 text-[13px] font-semibold text-leaf-deep">
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}
        {showcase.tracks && showcase.tracks.length > 0 && (
          <>
            <h2 className="mt-5 font-semibold">Hạng mục dự thi</h2>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {showcase.tracks.map((t) => (
                <li key={t} className="rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-sap">
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <section className="rounded-[20px] border border-line bg-white p-5">
        <h2 className="font-semibold">Người đóng góp</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {project.members.map((m) => {
            const u = userOf(m.handle);
            if (!u) return null;
            return (
              <li key={m.handle} className="flex items-center gap-3">
                <Avatar initials={u.initials} tone={u.tone} size={38} />
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
        <p className="mt-4 text-sm text-moss">
          <Link href={`/explore?nganh=${encodeURIComponent(project.field)}`} className="font-semibold text-leaf-deep hover:underline">
            {project.field}
          </Link>{" "}
          · {project.kind}
        </p>
      </section>
    </aside>
  );
}

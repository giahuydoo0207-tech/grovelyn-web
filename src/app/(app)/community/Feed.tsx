"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ME, POSTS, projectsBy, type Post, userOf } from "@/lib/data";
import { currentPhase, showcaseOf } from "@/lib/showcase";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "./PostCard";

const SORTS = ["Dành cho bạn", "Đang theo dõi"] as const;

/**
 * Trang chủ chỉ hiện các lần Công bố: một phiên bản đã Hoàn tất hoặc Đã triển khai của một dự án công khai.
 * Cập nhật tiến độ nằm trong Hành trình của dự án; câu hỏi cần góp ý nằm ở tab Trao đổi.
 */
export function Feed() {
  const me = userOf(ME)!;
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Dành cho bạn");
  const ready = projectsBy(ME).filter((p) => p.owner === ME && ["final", "shipped"].includes(currentPhase(showcaseOf(p).milestones)));
  const [slug, setSlug] = useState(ready[0]?.slug ?? "");
  const chosen = ready.find((p) => p.slug === slug);
  const box = useRef<HTMLTextAreaElement>(null);

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosen || !text.trim()) return;
    setPosts((p) => [
      { id: `new-${Date.now()}`, author: ME, kind: "Công bố", version: chosen.versions[0]?.tag, project: chosen.slug, when: "vừa xong", text: text.trim(), likes: 0, comments: [], reposts: 0 },
      ...p,
    ]);
    setText("");
    setOpen(false);
  };

  const published = posts.filter((p) => p.kind === "Công bố");
  const shown = sort === "Đang theo dõi" ? published.filter((p) => p.author === ME || p.author === "quocbao") : published;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <form onSubmit={publish} className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={me.initials} tone={me.tone} size={48} />
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setTimeout(() => box.current?.focus(), 60);
            }}
            className="h-12 flex-1 rounded-full border border-[#c9d0c4] px-5 text-left text-[16px] font-semibold text-moss hover:bg-mist"
          >
            Công bố bản mới của dự án
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {ready.length ? (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    Dự án
                    <select value={slug} onChange={(e) => setSlug(e.target.value)} className="h-11 rounded-lg border border-line bg-white px-3 font-semibold outline-none focus:border-ink">
                      {ready.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.title}, bản {p.versions[0]?.tag}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    Bản này có gì mới
                    <textarea
                      ref={box}
                      rows={3}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Hai, ba câu về điều đã thay đổi và ai đã góp ý"
                      className="resize-none rounded-lg border border-line px-3.5 py-3 text-[15px] font-normal leading-relaxed outline-none focus:border-ink"
                    />
                  </label>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => (setOpen(false), setText(""))} className="h-10 rounded-lg px-4 text-sm font-semibold text-moss hover:bg-mist">
                      Huỷ
                    </button>
                    <button type="submit" disabled={!text.trim()} className="h-10 rounded-lg bg-leaf px-5 text-sm font-bold text-ink disabled:opacity-40">
                      Công bố
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-mist px-4 py-3 text-sm leading-relaxed text-moss">
                  Chỉ công bố được dự án ở mức Hoàn tất hoặc Đã triển khai. Dự án đang làm thì{" "}
                  <Link href="/exchange" className="font-semibold text-leaf-deep hover:underline">
                    mở Trao đổi
                  </Link>{" "}
                  để xin góp ý, hoặc{" "}
                  <Link href="/new" className="font-semibold text-leaf-deep hover:underline">
                    tạo dự án mới
                  </Link>
                  .
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="flex items-center gap-2 text-sm">
        <span className="h-px flex-1 bg-[#cdd4c8]" />
        <span className="text-moss">Sắp xếp theo:</span>
        <label className="relative flex items-center font-semibold">
          <span className="sr-only">Sắp xếp bảng tin</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
            className="cursor-pointer appearance-none bg-transparent pr-5 outline-none"
          >
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4" aria-hidden="true" />
        </label>
      </div>

      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

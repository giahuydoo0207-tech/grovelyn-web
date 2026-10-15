"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, MoreHorizontal, Repeat2, Send, ThumbsUp } from "lucide-react";
import type { Post } from "@/lib/data";
import { ME, projectOf, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { REACTIONS } from "./reactions";

const KIND_STYLE: Record<Post["kind"], string> = {
  "Chia sẻ": "bg-mist text-ink",
  "Khoe dự án": "bg-leaf text-ink",
  "Tìm cộng sự": "bg-ink text-white",
  "Cơ hội": "bg-sap text-leaf-deep",
};

export function PostCard({ post }: { post: Post }) {
  const author = userOf(post.author)!;
  const project = post.project ? projectOf(post.project) : undefined;
  const [reaction, setReaction] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState("");
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = REACTIONS.find((r) => r.key === reaction);
  const Icon = current?.icon ?? ThumbsUp;
  const count = post.likes + (reaction ? 1 : 0);

  const showPicker = () => {
    if (hide.current) clearTimeout(hide.current);
    hold.current = setTimeout(() => setPicker(true), 380);
  };
  const leavePicker = () => {
    if (hold.current) clearTimeout(hold.current);
    hide.current = setTimeout(() => setPicker(false), 250);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((c) => [...c, { author: ME, text, when: "vừa xong" }]);
    setDraft("");
  };

  return (
    <article className="rounded-[22px] border border-line bg-white p-5">
      <header className="flex items-center gap-3">
        <Avatar initials={author.initials} tone={author.tone} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/u/${author.handle}`} className="font-semibold hover:text-leaf-deep">
            {author.name}
          </Link>
          <p className="truncate text-sm text-moss">
            {author.role}, {post.when}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KIND_STYLE[post.kind]}`}>{post.kind}</span>
        <button aria-label="Tùy chọn bài viết" className="flex h-10 w-10 items-center justify-center rounded-xl text-moss hover:bg-mist">
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <p className="mt-4 text-[16px] leading-[1.7]">{post.text}</p>

      {post.needs && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Cần tìm">
          {post.needs.map((n) => (
            <li key={n} className="rounded-full border border-line px-3 py-1 text-sm font-medium">
              {n}
            </li>
          ))}
        </ul>
      )}

      {project && (
        <Link
          href={`/p/${project.slug}`}
          className="group mt-4 flex overflow-hidden rounded-2xl border border-line transition-colors hover:border-ink/30"
        >
          <div className="relative w-36 shrink-0 overflow-hidden sm:w-44">
            <ProjectCover seed={project.seed} tone={project.tone} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="min-w-0 p-4">
            <p className="text-[13px] font-semibold text-leaf-deep">
              {project.field}, {project.versions[0]?.tag}, {project.files.length} tệp
            </p>
            <p className="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.02em]">{project.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-moss">{project.summary}</p>
          </div>
        </Link>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-moss">
        <span className="flex items-center gap-1.5">
          <span className="flex -space-x-1" aria-hidden="true">
            {REACTIONS.slice(0, 3).map((r) => (
              <span key={r.key} className="flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white">
                <r.icon className="h-3.5 w-3.5" style={{ color: r.color }} />
              </span>
            ))}
          </span>
          <span className="tabular-nums">{count}</span>
        </span>
        <span>
          {comments.length} bình luận, {post.reposts} lượt đăng lại
        </span>
      </div>

      <div className="mt-3 flex gap-1 border-t border-line pt-2">
        <div
          className="relative flex-1"
          onMouseEnter={showPicker}
          onMouseLeave={leavePicker}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPicker(false);
          }}
          onKeyDown={(e) => e.key === "Escape" && setPicker(false)}
        >
          <button
            type="button"
            aria-pressed={!!reaction}
            onClick={() => setReaction((v) => (v ? null : "like"))}
            onTouchStart={showPicker}
            onTouchEnd={() => hold.current && clearTimeout(hold.current)}
            onFocus={(e) => e.currentTarget.matches(":focus-visible") && setPicker(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors hover:bg-mist"
            style={{ color: current?.color }}
          >
            <motion.span key={reaction ?? "none"} initial={{ scale: reaction ? 0.3 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
              <Icon className="h-[18px] w-[18px]" fill={reaction === "like" ? "currentColor" : "none"} aria-hidden="true" />
            </motion.span>
            {current?.label ?? "Thích"}
          </button>
          <AnimatePresence>
            {picker && (
              <motion.div
                role="toolbar"
                aria-label="Chọn cảm xúc"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="absolute -top-16 left-0 z-20 flex gap-1 rounded-full border border-line bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(6,17,10,0.35)]"
              >
                {REACTIONS.map((r, i) => (
                  <motion.button
                    key={r.key}
                    type="button"
                    aria-label={r.label}
                    title={r.label}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: i * 0.025 } }}
                    whileHover={{ scale: 1.3, y: -4 }}
                    whileFocus={{ scale: 1.3, y: -4 }}
                    onClick={() => {
                      setReaction(r.key);
                      setPicker(false);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist"
                  >
                    <r.icon className="h-5 w-5" style={{ color: r.color }} aria-hidden="true" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors hover:bg-mist"
        >
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" /> Bình luận
        </button>
        {post.kind === "Tìm cộng sự" ? (
          <button
            type="button"
            aria-pressed={joined}
            onClick={() => setJoined((v) => !v)}
            className={`flex h-11 flex-1 items-center justify-center rounded-xl text-[15px] font-semibold transition-colors ${joined ? "bg-sap text-leaf-deep" : "bg-ink text-white hover:bg-ink-2"}`}
          >
            {joined ? "Đã gửi lời xin tham gia" : "Xin tham gia"}
          </button>
        ) : (
          <>
            <button className="hidden h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold hover:bg-mist sm:flex">
              <Repeat2 className="h-[18px] w-[18px]" aria-hidden="true" /> Đăng lại
            </button>
            <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold hover:bg-mist">
              <Send className="h-[18px] w-[18px]" aria-hidden="true" /> Gửi
            </button>
          </>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-4">
              {comments.length === 0 && <p className="text-sm text-moss">Chưa có bình luận. Bạn là người đầu tiên.</p>}
              <AnimatePresence initial={false}>
                {comments.map((c) => {
                  const u = userOf(c.author)!;
                  return (
                    <motion.div key={c.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                      <Avatar initials={u.initials} tone={u.tone} size={32} />
                      <div className="rounded-2xl rounded-tl-md bg-mist px-3.5 py-2.5">
                        <p className="text-sm">
                          <span className="font-semibold">{u.name}</span> <span className="text-moss">{c.when}</span>
                        </p>
                        <p className="text-[15px] leading-relaxed">{c.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <form onSubmit={send} className="flex gap-2">
                <label className="flex-1">
                  <span className="sr-only">Viết bình luận</span>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Viết bình luận"
                    className="h-11 w-full rounded-full border border-line bg-mist px-4 text-[15px] outline-none focus:border-ink focus:bg-white"
                  />
                </label>
                <button type="submit" disabled={!draft.trim()} className="h-11 rounded-full bg-ink px-4 text-sm font-semibold text-white disabled:opacity-40">
                  Gửi
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

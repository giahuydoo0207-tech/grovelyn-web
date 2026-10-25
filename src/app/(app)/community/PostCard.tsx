"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, MoreHorizontal, Repeat2, Send, ThumbsUp } from "lucide-react";
import type { Post } from "@/lib/data";
import { ME, userOf } from "@/lib/data";
import { contributorsOf } from "@/lib/exchange";
import { useTopics } from "@/lib/topicStore";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { MediaGrid } from "@/components/MediaGrid";
import { REACTIONS } from "./reactions";
import { joinRequests, useProject, useUser, reactionsStore, setReaction as saveReaction, updatePost } from "@/lib/stores";

const KIND_STYLE: Record<Post["kind"], string> = {
  "Chia sẻ": "bg-mist text-ink",
  "Công bố": "bg-leaf text-ink",
  "Tìm cộng sự": "bg-ink text-white",
};

export function PostCard({ post }: { post: Post }) {
  const author = useUser(post.author)!;
  const project = useProject(post.project);
  // Cảm xúc, bình luận và lời xin tham gia được lưu trên trình duyệt (lib/stores).
  const reaction = reactionsStore.use()[post.id] ?? null;
  const setReaction = (next: string | null | ((cur: string | null) => string | null)) =>
    saveReaction(post.id, typeof next === "function" ? next(reaction) : next);
  const [picker, setPicker] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const joined = joinRequests.use().includes(post.id);
  const comments = post.comments;
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
    updatePost(post.id, (p) => ({ ...p, comments: [...p.comments, { author: ME, text, when: "vừa xong" }] }));
    setDraft("");
  };

  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <header className="flex items-center gap-3">
        <Avatar initials={author.initials} tone={author.tone} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/u/${author.handle}`} className="font-semibold hover:text-leaf-deep">
            {author.name}
          </Link>
          <p className="truncate text-sm text-moss">
            {author.intro}, {post.when}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KIND_STYLE[post.kind]}`}>
          {post.kind === "Công bố" && post.version ? `Công bố bản ${post.version}` : post.kind}
        </span>
        <button aria-label="Tùy chọn bài viết" className="flex h-10 w-10 items-center justify-center rounded-xl text-moss hover:bg-mist">
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <p className="mt-4 whitespace-pre-line text-[16px] leading-[1.7]">{post.text}</p>
      {post.media && post.media.length > 0 && (
        <div className="mt-3.5">
          <MediaGrid media={post.media} />
        </div>
      )}

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
              {project.output}, {project.context.toLowerCase()}
            </p>
            <p className="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.02em]">{project.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-moss">{project.summary}</p>
          </div>
        </Link>
      )}
      {project && <Credit slug={project.slug} />}

      <div className="mt-4 flex items-center justify-between text-sm text-moss">
        <span className="flex items-center gap-1.5">
          <span className="flex -space-x-1" aria-hidden="true">
            {REACTIONS.slice(0, 3).map((r) => (
              <span key={r.key} className="flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white" style={{ background: r.tint }}>
                <r.icon className="h-3 w-3" style={{ color: r.color }} />
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
                className="absolute -top-16 left-0 z-20 flex gap-1.5 rounded-full border border-line bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(6,17,10,0.35)]"
              >
                {REACTIONS.map((r, i) => {
                  const on = hot === r.key;
                  return (
                    <motion.button
                      key={r.key}
                      type="button"
                      aria-label={r.label}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: on ? -6 : 0, scale: on ? 1.22 : 1, opacity: 1, transition: { delay: on ? 0 : i * 0.025, type: "spring", stiffness: 500, damping: 22 } }}
                      onMouseEnter={() => setHot(r.key)}
                      onMouseLeave={() => setHot(null)}
                      onFocus={() => setHot(r.key)}
                      onBlur={() => setHot(null)}
                      onClick={() => {
                        setReaction(r.key);
                        setPicker(false);
                        setHot(null);
                      }}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150"
                      style={{ background: on ? r.color : r.tint }}
                    >
                      <r.icon className="h-5 w-5" style={{ color: on ? "#fff" : r.color }} aria-hidden="true" />
                      <AnimatePresence>
                        {on && (
                          <motion.span
                            aria-hidden="true"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.12 }}
                            className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                            style={{ background: r.color }}
                          >
                            {r.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
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
            onClick={() => joinRequests.toggle(post.id)}
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

/** Ghi công người có góp ý được áp dụng qua tab Trao đổi. */
function Credit({ slug }: { slug: string }) {
  const people = contributorsOf(slug, useTopics())
    .map((h) => userOf(h))
    .filter((u) => !!u);
  if (!people.length) return null;
  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-moss">
      <span className="flex -space-x-1.5" aria-hidden="true">
        {people.slice(0, 3).map((u) => (
          <span key={u.handle} className="rounded-full ring-2 ring-white">
            <Avatar initials={u.initials} tone={u.tone} size={22} />
          </span>
        ))}
      </span>
      <span>
        Hoàn thiện cùng góp ý của{" "}
        {people.map((u, i) => (
          <span key={u.handle}>
            {i > 0 && (i === people.length - 1 ? " và " : ", ")}
            <Link href={`/u/${u.handle}`} className="font-semibold text-ink hover:underline">
              {u.handle === ME ? "bạn" : u.name}
            </Link>
          </span>
        ))}
      </span>
    </p>
  );
}

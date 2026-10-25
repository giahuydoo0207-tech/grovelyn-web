"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bookmark, Check, Folder, HandHelping, Link2, MessageCircle, MoreHorizontal, Plus, Repeat2, Rocket, SendHorizontal, ThumbsUp, UsersRound } from "lucide-react";
import type { Post } from "@/lib/data";
import { ME, groupOf, userOf } from "@/lib/data";
import { contributorsOf } from "@/lib/exchange";
import { useTopics } from "@/lib/topicStore";
import { Avatar } from "@/components/Avatar";
import { MediaGrid } from "@/components/MediaGrid";
import { REACTIONS } from "./reactions";
import { joinRequests, repostedPosts, savedPosts, useProject, useUser, reactionsStore, setReaction as saveReaction, updatePost } from "@/lib/stores";

/**
 * Mỗi loại bài một dáng thẻ, chỉ dùng màu gốc Grovelyn:
 * - Công bố có ảnh: ảnh tràn đầu thẻ, tên dự án và phiên bản làm tiêu đề lớn.
 * - Tìm cộng sự: thẻ đen, khối "Đang cần" và nút xin tham gia.
 * - Chia sẻ ngắn, không ảnh, không gắn dự án: câu chữ lớn trên nền xanh nhạt.
 * - Còn lại: thẻ trắng.
 * Bình luận hiện ngay dưới bài theo kiểu luồng: các trả lời nối bằng một đường chỉ.
 */
type Look = "plain" | "hero" | "dark" | "quote";

const THEME: Record<Look, { card: string; sub: string; pill: string; line: string; input: string; ring: string }> = {
  plain: { card: "border border-line bg-white", sub: "text-moss", pill: "bg-mist hover:bg-line", line: "bg-line", input: "bg-mist placeholder:text-moss", ring: "ring-white" },
  hero: { card: "border border-line bg-white", sub: "text-moss", pill: "bg-mist hover:bg-line", line: "bg-line", input: "bg-mist placeholder:text-moss", ring: "ring-white" },
  dark: { card: "bg-ink text-white", sub: "text-white/65", pill: "bg-white/[.08] hover:bg-white/[.14]", line: "bg-white/15", input: "bg-white/[.07] text-white placeholder:text-white/50", ring: "ring-[#33433a]" },
  quote: { card: "bg-sap", sub: "text-leaf-deep", pill: "bg-white hover:bg-white/70", line: "bg-leaf-deep/20", input: "bg-white placeholder:text-moss", ring: "ring-white" },
};

const KIND_ICON = { "Chia sẻ": MessageCircle, "Công bố": Rocket, "Tìm cộng sự": UsersRound } as const;

function KindTag({ kind, look, version }: { kind: Post["kind"]; look: Look; version?: string }) {
  const Icon = KIND_ICON[kind];
  const style = kind === "Công bố" ? "bg-sap text-leaf-deep" : kind === "Tìm cộng sự" ? (look === "dark" ? "bg-leaf text-ink" : "bg-ink text-white") : look === "quote" ? "bg-white text-ink" : "bg-mist text-ink";
  return (
    <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-bold ${style}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {kind === "Công bố" && version ? `Công bố bản ${version}` : kind}
    </span>
  );
}

export function PostCard({ post, showGroup = false }: { post: Post; showGroup?: boolean }) {
  const author = useUser(post.author)!;
  const project = useProject(post.project);
  const topics = useTopics();
  const topic = project ? topics.find((t) => t.project === project.slug && t.status === "open") : undefined;
  const group = showGroup && post.group ? groupOf(post.group) : undefined;

  const look: Look =
    post.kind === "Tìm cộng sự"
      ? "dark"
      : post.kind === "Công bố" && post.media?.[0]?.type === "image"
        ? "hero"
        : post.kind === "Chia sẻ" && !post.media?.length && !project && post.text.length <= 160
          ? "quote"
          : "plain";
  const t = THEME[look];

  // Cảm xúc, bình luận, lời xin tham gia và lượt đăng lại được lưu trên trình duyệt (lib/stores).
  const reaction = reactionsStore.use()[post.id] ?? null;
  const setReaction = (next: string | null) => saveReaction(post.id, next);
  const [picker, setPicker] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const joined = joinRequests.use().includes(post.id);
  const reposted = repostedPosts.use().includes(post.id);
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
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

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/community#${post.id}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenu(false);
      }, 1200);
    } catch {}
  };

  const [replying, setReplying] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const openReply = (prefix = "") => {
    setReplying(true);
    setTimeout(() => {
      if (!input.current) return;
      if (prefix) input.current.value = prefix;
      input.current.focus();
    }, 30);
  };

  const saved = savedPosts.use().includes(post.id);
  const accentText = look === "dark" ? "text-leaf" : "text-leaf-deep";
  const action = `flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors max-sm:h-12 max-sm:flex-col max-sm:gap-0.5 max-sm:text-xs ${look === "dark" ? "hover:bg-white/10" : look === "quote" ? "hover:bg-white/60" : "hover:bg-mist"}`;
  const more = (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Tùy chọn bài viết"
        aria-expanded={menu}
        onClick={() => setMenu((v) => !v)}
        onBlur={(e) => !e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null) && setMenu(false)}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${look === "dark" ? "text-white/65 hover:bg-white/10" : "text-moss hover:bg-black/5"}`}
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {menu && (
        <div role="menu" className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-line bg-white p-1 text-ink shadow-[0_12px_32px_-12px_rgba(6,17,10,0.35)]">
          <button type="button" role="menuitem" onClick={() => void share()} className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold hover:bg-mist">
            {copied ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Đã chép liên kết" : "Chép liên kết"}
          </button>
          <button type="button" role="menuitem" onClick={() => savedPosts.toggle(post.id)} className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold hover:bg-mist">
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            {saved ? "Bỏ lưu bài này" : "Lưu bài này"}
          </button>
        </div>
      )}
    </div>
  );

  const header = (withTag: boolean) => (
    <header className="flex items-center gap-3">
      <Link href={`/u/${author.handle}`} aria-hidden="true" tabIndex={-1} className={`rounded-full ${look === "dark" ? "ring-2 ring-[#33433a]" : ""}`}>
        <Avatar initials={author.initials} tone={author.tone} size={44} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px]">
          <Link href={`/u/${author.handle}`} className="font-bold hover:underline">
            {author.name}
          </Link>
          {group && (
            <>
              <span className={t.sub}> trong </span>
              <Link href={`/groups/${group.slug}`} className="font-bold hover:underline">
                {group.name}
              </Link>
            </>
          )}
        </p>
        <p className={`truncate text-[13px] ${t.sub}`}>
          {author.intro}, {post.when}
        </p>
      </div>
      {withTag && <KindTag kind={post.kind} look={look} version={post.version} />}
      {more}
    </header>
  );

  const versions = project ? [...project.versions].reverse().slice(-5) : [];
  const curVer = post.version ?? project?.versions[0]?.tag;

  return (
    <article id={post.id} className={`scroll-mt-24 overflow-hidden rounded-[20px] ${t.card}`}>
      {look === "hero" && (
        <div className="relative">
          <MediaGrid media={post.media!} bleed />
          <span className="pointer-events-none absolute left-4 top-4">
            <KindTag kind={post.kind} look={look} version={post.version} />
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {look === "quote" ? (
          <>
            <div className="flex items-center justify-between">
              <KindTag kind={post.kind} look={look} />
              {more}
            </div>
            <p className="mt-3 font-display text-[24px] font-bold leading-[1.22] tracking-[-0.02em] sm:text-[28px]">“{post.text}”</p>
            <p className="mt-4 flex items-center gap-2.5 text-sm">
              <Avatar initials={author.initials} tone={author.tone} size={32} />
              <span>
                <Link href={`/u/${author.handle}`} className="font-bold hover:underline">
                  {author.name}
                </Link>
                <span className={t.sub}>, {post.when}</span>
              </span>
            </p>
          </>
        ) : (
          <>
            {header(look !== "hero")}
            {look === "hero" && project ? (
              <>
                <Link href={`/p/${project.slug}`} className="mt-4 block font-display text-[22px] font-bold leading-tight tracking-[-0.02em] hover:underline sm:text-[26px]">
                  {project.title}
                  {curVer ? `, bản ${curVer}` : ""}
                </Link>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-moss">{post.text}</p>
              </>
            ) : (
              <p className={`mt-3.5 whitespace-pre-line leading-[1.65] ${look === "dark" ? "text-[17px] font-semibold" : "text-[16px]"}`}>{post.text}</p>
            )}
          </>
        )}

        {look !== "hero" && post.media && post.media.length > 0 && (
          <div className="mt-3.5">
            <MediaGrid media={post.media} />
          </div>
        )}

        {post.kind === "Tìm cộng sự" && (
          <div className={`mt-4 rounded-2xl p-4 ${look === "dark" ? "bg-white/[.06]" : "bg-sap"}`}>
            {post.needs && post.needs.length > 0 && (
              <>
                <p className={`text-[13px] font-bold ${look === "dark" ? "text-leaf" : "text-leaf-deep"}`}>Đang cần {post.needs.length} người</p>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Cần tìm">
                  {post.needs.map((n) => (
                    <li key={n} className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold ${look === "dark" ? "bg-white/10" : "bg-white"}`}>
                      <Plus className={`h-3.5 w-3.5 ${look === "dark" ? "text-leaf" : "text-leaf-deep"}`} aria-hidden="true" />
                      {n}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className={`flex flex-wrap items-center justify-between gap-3 ${post.needs?.length ? "mt-3.5" : ""}`}>
              <span className={`text-[13px] ${t.sub}`}>{joined ? "Chủ bài sẽ nhắn bạn nếu phù hợp." : "Ghi tên đầy đủ vào dự án khi làm xong."}</span>
              {post.author !== ME && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={joined}
                  onClick={() => joinRequests.toggle(post.id)}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors ${joined ? "bg-white/10 text-leaf" : "bg-leaf text-ink hover:brightness-95"}`}
                >
                  {joined && <Check className="h-4 w-4" aria-hidden="true" />}
                  {joined ? "Đã xin tham gia" : "Xin tham gia"}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {look === "hero" && versions.length > 1 && <VersionTrack tags={versions.map((v) => v.tag)} current={curVer} />}

        {project && look !== "hero" && (
          <Link href={`/p/${project.slug}`} className={`group mt-3.5 flex items-center gap-2.5 text-sm ${t.sub}`}>
            <Folder className={`h-4 w-4 shrink-0 ${look === "dark" ? "text-leaf" : "text-leaf-deep"}`} aria-hidden="true" />
            <span className="min-w-0 truncate">
              <span className={`font-bold group-hover:underline ${look === "dark" ? "text-white" : "text-ink"}`}>{project.title}</span>
              {`, ${project.field}${curVer ? `, bản ${curVer}` : ""}`}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
          </Link>
        )}

        {topic && (
          <Link href={`/exchange/${topic.id}`} className={`group mt-2 flex items-center gap-2.5 text-sm ${t.sub}`}>
            <HandHelping className={`h-4 w-4 shrink-0 ${look === "dark" ? "text-leaf" : "text-leaf-deep"}`} aria-hidden="true" />
            <span className="min-w-0 truncate">
              <span className={look === "dark" ? "text-white" : "text-ink"}>Đang mở trao đổi:</span> {topic.question}
            </span>
            <span className={`shrink-0 font-bold group-hover:underline ${look === "dark" ? "text-leaf" : "text-leaf-deep"}`}>Góp ý</span>
          </Link>
        )}
        {project && <Credit slug={project.slug} dark={look === "dark"} />}

        <div className={`mt-4 flex items-center justify-between gap-3 text-[13px] ${t.sub}`}>
          <span className="flex items-center gap-1.5">
            <span className="flex -space-x-1" aria-hidden="true">
              {REACTIONS.slice(0, 3).map((r) => (
                <span key={r.key} className={`flex h-5 w-5 items-center justify-center rounded-full ring-2 ${look === "dark" ? "ring-ink" : look === "quote" ? "ring-sap" : "ring-white"}`} style={{ background: r.tint }}>
                  <r.icon className="h-3 w-3" style={{ color: r.color }} />
                </span>
              ))}
            </span>
            <span className="tabular-nums">{count}</span>
          </span>
          <span className="tabular-nums">
            {post.comments.length} bình luận, {post.reposts + (reposted ? 1 : 0)} lượt đăng lại
          </span>
        </div>

        <div className={`mt-2.5 grid grid-cols-4 gap-1 border-t pt-1.5 ${look === "dark" ? "border-white/15" : look === "quote" ? "border-leaf-deep/20" : "border-line"}`}>
          <div
            className="relative"
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
              onClick={() => setReaction(reaction ? null : "like")}
              onTouchStart={showPicker}
              onTouchEnd={() => hold.current && clearTimeout(hold.current)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setPicker(true)}
              className={action}
              style={{ color: current && look !== "dark" ? current.color : undefined }}
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
          <button type="button" onClick={() => openReply()} className={action}>
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            Bình luận
          </button>
          <button type="button" aria-pressed={reposted} onClick={() => repostedPosts.toggle(post.id)} className={`${action} ${reposted ? accentText : ""}`}>
            <Repeat2 className="h-[18px] w-[18px]" strokeWidth={reposted ? 2.6 : 2} aria-hidden="true" />
            {reposted ? "Đã đăng lại" : "Đăng lại"}
          </button>
          <button type="button" aria-pressed={saved} onClick={() => savedPosts.toggle(post.id)} className={`${action} ${saved ? accentText : ""}`}>
            <Bookmark className="h-[18px] w-[18px]" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            {saved ? "Đã lưu" : "Lưu"}
          </button>
        </div>

        <Thread post={post} look={look} open={replying} onReply={openReply} input={input} />
      </div>
    </article>
  );
}

/** Luồng trò chuyện dưới bài: hai trả lời mới nhất, bấm để xem hết; đường chỉ nối các trả lời với ô trả lời. */
function Thread({ post, look, open, onReply, input }: { post: Post; look: Look; open: boolean; onReply: (prefix?: string) => void; input: React.RefObject<HTMLInputElement | null> }) {
  const t = THEME[look];
  const me = useUser(ME)!;
  const [all, setAll] = useState(false);
  const comments = post.comments;
  const shown = all ? comments : comments.slice(-2);
  const hidden = comments.length - shown.length;
  if (!comments.length && !open) return null;

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("reply") ?? "").trim();
    if (!text) return;
    updatePost(post.id, (p) => ({ ...p, comments: [...p.comments, { author: ME, text, when: "vừa xong" }] }));
    form.reset();
    setAll(true);
  };

  const ownerLabel = post.project ? "Chủ dự án" : "Người đăng";
  const accent = look === "dark" ? "text-leaf" : "text-leaf-deep";

  return (
    <div className={`relative mt-4 border-t pt-1 ${look === "dark" ? "border-white/15" : look === "quote" ? "border-leaf-deep/20" : "border-line"}`}>
      <span aria-hidden="true" className={`absolute bottom-6 left-[17px] top-9 w-0.5 rounded ${t.line}`} />
      {hidden > 0 && (
        <button type="button" onClick={() => setAll(true)} className={`relative mt-3 flex items-center gap-3 text-sm font-bold ${accent} hover:underline`}>
          <span className="flex w-9 justify-center" aria-hidden="true">
            <span className={`h-2.5 w-2.5 rounded-full ${t.line}`} />
          </span>
          Xem thêm {hidden} trả lời
        </button>
      )}
      <AnimatePresence initial={false}>
        {shown.map((c, i) => {
          const u = userOf(c.author);
          if (!u) return null;
          return (
            <motion.div key={`${c.author}-${c.when}-${i}-${c.text.slice(0, 12)}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative mt-3.5 flex gap-3">
              <span className={`h-9 rounded-full ring-[3px] ${t.ring}`}>
                <Avatar initials={u.initials} tone={u.tone} size={36} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${t.sub}`}>
                  <Link href={`/u/${u.handle}`} className={`font-bold hover:underline ${look === "dark" ? "text-white" : "text-ink"}`}>
                    {u.handle === ME ? "Bạn" : u.name}
                  </Link>
                  {c.author === post.author && (
                    <span className={`ml-1.5 inline-flex h-5 items-center rounded-full px-1.5 align-[1px] text-[11px] font-bold ${look === "dark" ? "bg-leaf text-ink" : look === "quote" ? "bg-white text-leaf-deep" : "bg-sap text-leaf-deep"}`}>
                      {ownerLabel}
                    </span>
                  )}{" "}
                  · {c.when}
                </p>
                <p className="mt-0.5 text-[15px] leading-relaxed">{c.text}</p>
                {u.handle !== ME && (
                  <button type="button" onClick={() => onReply(`@${u.name} `)} className={`mt-1 text-xs font-bold ${t.sub} hover:underline`}>
                    Trả lời
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <form onSubmit={send} className="relative mt-3.5 flex items-center gap-3">
        <span className={`h-9 rounded-full ring-[3px] ${t.ring}`}>
          <Avatar initials={me.initials} tone={me.tone} size={36} />
        </span>
        <label className="relative flex-1">
          <span className="sr-only">Trả lời trong luồng</span>
          <input
            ref={input}
            name="reply"
            autoComplete="off"
            placeholder={comments.length ? "Trả lời trong luồng…" : "Viết trả lời đầu tiên…"}
            className={`h-10 w-full rounded-full pl-4 pr-12 text-[15px] outline-none ring-1 ring-transparent focus:ring-current ${t.input}`}
          />
          <button type="submit" aria-label="Gửi trả lời" className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-leaf text-ink hover:brightness-95">
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </label>
      </form>
    </div>
  );
}

/** Các phiên bản của dự án, bản đang công bố được tô xanh. */
function VersionTrack({ tags, current }: { tags: string[]; current?: string }) {
  const at = Math.max(0, tags.indexOf(current ?? ""));
  return (
    <ol aria-label="Các phiên bản" className="mt-4 flex items-center gap-1.5">
      {tags.map((tag, i) => (
        <li key={tag} className={`flex items-center gap-1.5 ${i < tags.length - 1 ? "flex-1" : ""}`}>
          <span
            aria-current={i === at ? "step" : undefined}
            className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              i === at ? "h-7 w-7 bg-leaf text-ink" : i < at ? "h-[22px] w-[22px] bg-ink text-white" : "h-[22px] w-[22px] border border-line bg-white text-moss"
            }`}
          >
            {tag}
          </span>
          {i < tags.length - 1 && <span aria-hidden="true" className={`h-0.5 flex-1 rounded ${i < at ? "bg-ink" : "bg-line"}`} />}
        </li>
      ))}
      <li className="ml-2 whitespace-nowrap text-[13px] font-bold text-leaf-deep">{at === tags.length - 1 ? "Bản mới nhất" : `Bản ${tags[at]}`}</li>
    </ol>
  );
}

/** Ghi công người có góp ý được áp dụng qua tab Trao đổi. */
function Credit({ slug, dark }: { slug: string; dark: boolean }) {
  const people = contributorsOf(slug, useTopics())
    .map((h) => userOf(h))
    .filter((u) => !!u);
  if (!people.length) return null;
  return (
    <p className={`mt-3 flex items-center gap-2 text-sm ${dark ? "text-white/65" : "text-moss"}`}>
      <span className="flex -space-x-1.5" aria-hidden="true">
        {people.slice(0, 3).map((u) => (
          <span key={u.handle} className={`rounded-full ring-2 ${dark ? "ring-ink" : "ring-white"}`}>
            <Avatar initials={u.initials} tone={u.tone} size={22} />
          </span>
        ))}
      </span>
      <span>
        Hoàn thiện cùng góp ý của{" "}
        {people.map((u, i) => (
          <span key={u.handle}>
            {i > 0 && (i === people.length - 1 ? " và " : ", ")}
            <Link href={`/u/${u.handle}`} className={`font-semibold hover:underline ${dark ? "text-white" : "text-ink"}`}>
              {u.handle === ME ? "bạn" : u.name}
            </Link>
          </span>
        ))}
      </span>
    </p>
  );
}

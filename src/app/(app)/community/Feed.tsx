"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ArrowDownUp, ImagePlus, Rocket, UsersRound } from "lucide-react";
import { ME, MY_GROUPS, POST_KINDS, userOf, type PostKind } from "@/lib/data";
import { following, joinedGroups, leftGroups, myGroupsStore, postsStore, useMyProjects, useUser } from "@/lib/stores";
import type { Media } from "@/lib/media";
import { currentPhase, showcaseOf } from "@/lib/showcase";
import { canAnnounce } from "@/lib/model";
import { Avatar } from "@/components/Avatar";
import { MediaPicker } from "@/components/MediaGrid";
import { PostCard } from "./PostCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { Leaves } from "@/components/Leaves";

const TABS = ["Dành cho bạn", "Đang theo dõi", "Nhóm của bạn"] as const;
const SORTS = ["Mới nhất", "Sôi nổi nhất"] as const;
type Filter = "Tất cả" | PostKind;

const PLACEHOLDER: Record<PostKind, string> = {
  "Chia sẻ": "Bạn đang làm gì, vừa học được gì?",
  "Công bố": "Bản này có gì mới, ai đã góp ý",
  "Tìm cộng sự": "Bạn đang làm gì, cần người làm phần nào, trong bao lâu",
};

/**
 * Trang chủ là bảng tin chung: chia sẻ, công bố bản mới, tìm cộng sự, đều đăng kèm ảnh và video được.
 * Công bố chỉ dành cho dự án đã Hoàn tất hoặc đã dùng thực tế. Câu hỏi cần góp ý có chỗ riêng ở tab Trao đổi.
 * Trong một nhóm (`group`), bảng tin chỉ có bài của nhóm đó, và không có Công bố.
 */
export function Feed({ group }: { group?: string } = {}) {
  const kinds: PostKind[] = group ? POST_KINDS.filter((k) => k !== "Công bố") : POST_KINDS;
  const filters: Filter[] = ["Tất cả", ...kinds];
  const me = useUser(ME)!;
  const mine = useMyProjects();
  const ready = mine.filter((p) => p.owner === ME && canAnnounce(currentPhase(showcaseOf(p).milestones), p.usage));

  // Bài đăng lưu trong localStorage: tải lại trang vẫn còn bài bạn vừa đăng.
  const all = postsStore.use();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Dành cho bạn");
  const followed = following.use();
  const joined = joinedGroups.use();
  const left = leftGroups.use();
  const created = myGroupsStore.use();
  const myGroups = [...MY_GROUPS.map((g) => g.slug).filter((g) => !left.includes(g)), ...joined, ...created.map((g) => g.slug)];
  const posts = all.filter((p) =>
    group ? p.group === group : tab === "Nhóm của bạn" ? !!p.group && myGroups.includes(p.group) : !p.group && (tab === "Dành cho bạn" || p.author === ME || followed.includes(p.author)),
  );
  const setPosts = postsStore.set;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PostKind>("Chia sẻ");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [slug, setSlug] = useState("");
  const [needs, setNeeds] = useState("");
  const [filter, setFilter] = useState<Filter>("Tất cả");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Mới nhất");
  const box = useRef<HTMLTextAreaElement>(null);

  const start = (k: PostKind) => {
    setKind(k);
    setSlug(k === "Công bố" ? (ready[0]?.slug ?? "") : "");
    setOpen(true);
    setTimeout(() => box.current?.focus(), 60);
  };
  const reset = () => {
    setOpen(false);
    setText("");
    setMedia([]);
    setNeeds("");
  };

  const project = mine.find((p) => p.slug === slug);
  const blocked = kind === "Công bố" && !ready.length;
  const canPost = !!text.trim() && !blocked && (kind !== "Công bố" || !!project);

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    const list = needs
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    setPosts((p) => [
      {
        id: `new-${Date.now()}`,
        author: ME,
        group,
        kind,
        version: kind === "Công bố" ? project?.versions[0]?.tag : undefined,
        project: project?.slug,
        needs: kind === "Tìm cộng sự" && list.length ? list : undefined,
        media: media.length ? media : undefined,
        when: "vừa xong",
        text: text.trim(),
        likes: 0,
        comments: [],
        reposts: 0,
      },
      ...p,
    ]);
    setFilter("Tất cả");
    if (!group) setTab("Dành cho bạn");
    reset();
  };

  const byKind = filter === "Tất cả" ? posts : posts.filter((p) => p.kind === filter);
  const heat = (p: (typeof posts)[number]) => p.likes + p.comments.length * 3 + p.reposts * 2;
  const shown = sort === "Sôi nổi nhất" ? [...byKind].sort((a, b) => heat(b) - heat(a)) : byKind;
  const countOf = (f: Filter) => (f === "Tất cả" ? posts.length : posts.filter((p) => p.kind === f).length);
  // Một nhóm của bạn có bài mới: chen một dải nhắc vào giữa bảng tin.
  const moment = !group && tab === "Dành cho bạn" && filter === "Tất cả" ? MY_GROUPS.find((g) => g.fresh > 0 && !left.includes(g.slug)) : undefined;
  const momentPeople = moment ? [...new Set(all.filter((p) => p.group === moment.slug).map((p) => p.author))].slice(0, 4) : [];

  const quick = [
    { k: "Chia sẻ" as const, label: "Ảnh hoặc video", short: "Ảnh, video", icon: ImagePlus },
    { k: "Công bố" as const, label: "Công bố bản mới", short: "Công bố", icon: Rocket },
    { k: "Tìm cộng sự" as const, label: "Tìm cộng sự", short: "Cộng sự", icon: UsersRound },
  ].filter((q) => kinds.includes(q.k));

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <form onSubmit={publish} className="relative overflow-hidden rounded-[22px] bg-ink p-4 text-white sm:p-5">
        <Leaves className="pointer-events-none absolute -right-4 top-0 h-full w-[300px] opacity-90" />
        <div className="relative flex items-center gap-3">
          <span className="rounded-full ring-[3px] ring-ink-2">
            <Avatar initials={me.initials} tone={me.tone} handle={me.handle} size={48} />
          </span>
          {open ? (
            <p className="flex-1 font-semibold">{me.name}</p>
          ) : (
            <button
              type="button"
              onClick={() => start("Chia sẻ")}
              className="h-12 min-w-0 flex-1 truncate rounded-full bg-white/10 px-5 text-left text-[16px] text-white/75 transition-colors hover:bg-white/15 sm:max-w-[520px]"
            >
              {group ? "Viết gì đó cho nhóm" : `Khoe gì hôm nay, ${me.name.split(" ").pop()}?`}
            </button>
          )}
        </div>
        {!open && (
          <div className="relative mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] sm:pl-[60px]">
            {quick.map(({ k, label, short, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => start(k)}
                aria-label={label}
                className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/[.06] px-3.5 text-sm font-bold transition-colors hover:bg-white/[.12]"
              >
                <Icon className="h-[18px] w-[18px] text-leaf" aria-hidden="true" /> <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <div className="relative mt-4 flex flex-col gap-3.5 rounded-2xl bg-white p-4 text-ink">
                <fieldset>
                  <legend className="sr-only">Loại bài</legend>
                  <div className="flex flex-wrap gap-2">
                    {kinds.map((k) => (
                      <label
                        key={k}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${
                          kind === k ? "border-ink bg-ink text-white" : "border-line hover:bg-mist"
                        }`}
                      >
                        <input
                          type="radio"
                          name="loai-bai"
                          className="sr-only"
                          checked={kind === k}
                          onChange={() => {
                            setKind(k);
                            if (k === "Công bố" && !ready.some((p) => p.slug === slug)) setSlug(ready[0]?.slug ?? "");
                          }}
                        />
                        {k}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {blocked ? (
                  <p className="rounded-lg bg-mist px-4 py-3 text-sm leading-relaxed text-moss">
                    Công bố dành cho dự án đã Hoàn tất hoặc đã có người dùng thật. Dự án đang làm thì{" "}
                    <Link href="/exchange" className="font-semibold text-leaf-deep hover:underline">
                      mở Trao đổi
                    </Link>{" "}
                    để xin góp ý, hoặc đăng bài Chia sẻ.
                  </p>
                ) : (
                  <>
                    <label className="block">
                      <span className="sr-only">Nội dung</span>
                      <textarea
                        ref={box}
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={PLACEHOLDER[kind]}
                        className="w-full resize-none rounded-lg border border-line px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-ink"
                      />
                    </label>

                    {kind === "Tìm cộng sự" && (
                      <label className="flex flex-col gap-1.5 text-sm font-semibold">
                        Cần tìm
                        <input
                          value={needs}
                          onChange={(e) => setNeeds(e.target.value)}
                          placeholder="Ví dụ: Thiết kế bao bì, Quay dựng video"
                          className="h-11 rounded-lg border border-line px-3.5 text-[15px] font-normal outline-none focus:border-ink"
                        />
                        <span className="text-[13px] font-normal text-moss">Cách nhau bằng dấu phẩy.</span>
                      </label>
                    )}

                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      {kind === "Công bố" ? "Dự án công bố" : "Gắn với dự án"}
                      <select
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="h-11 rounded-lg border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                      >
                        {kind !== "Công bố" && <option value="">Không gắn dự án</option>}
                        {(kind === "Công bố" ? ready : mine).map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.title}
                            {kind === "Công bố" ? `, bản ${p.versions[0]?.tag}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <MediaPicker value={media} onChange={setMedia} />
                  </>
                )}

                <p className="text-[13px] leading-snug text-moss">
                  Đăng việc bạn làm hoặc có quyền chia sẻ, nói rõ phần mình làm. Không quảng cáo thuần tuý, không đăng thông tin mật. Grovelyn không kiểm định nội dung bài đăng.
                </p>
                <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                  <button type="button" onClick={reset} className="h-10 rounded-lg px-4 text-sm font-semibold text-moss hover:bg-mist">
                    Huỷ
                  </button>
                  <button type="submit" disabled={!canPost} className="h-10 rounded-lg bg-leaf px-5 text-sm font-bold text-ink disabled:opacity-40">
                    {kind === "Công bố" ? "Công bố" : "Đăng"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {!group && (
        <div role="tablist" aria-label="Bảng tin" className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setFilter("Tất cả");
              }}
              className={`-mb-px shrink-0 border-b-[3px] pb-2.5 pt-1 text-[16px] font-bold transition-colors ${tab === t ? "border-leaf text-ink" : "border-transparent text-moss hover:text-ink"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div role="group" aria-label="Lọc theo loại bài" className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 font-bold transition-colors ${filter === f ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mist"}`}
            >
              {f}
              <span className={`text-xs tabular-nums ${filter === f ? "text-leaf" : "text-leaf-deep"}`}>{countOf(f)}</span>
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <label className="relative flex items-center gap-1.5 font-semibold text-moss">
          <ArrowDownUp className="pointer-events-none h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Sắp xếp</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className="cursor-pointer appearance-none bg-transparent outline-none">
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {shown.length === 0 && (
        <p className="rounded-[20px] border border-line bg-white px-5 py-8 text-center text-moss">
          {tab === "Đang theo dõi" && !group
            ? "Chưa có bài từ người bạn theo dõi. Vào hồ sơ của ai đó và bấm Theo dõi để thấy bài của họ ở đây."
            : tab === "Nhóm của bạn" && !group
              ? "Nhóm của bạn chưa có bài nào. Vào một nhóm để bắt đầu thảo luận."
              : `Chưa có bài ${filter.toLowerCase()} nào.`}
        </p>
      )}

      <motion.div layout className="flex flex-col gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.flatMap((p, i) => [
            ...(moment && i === 2
              ? [
                  <motion.div key="nhom-moi" layout>
                    <Link
                      href={`/groups/${moment.slug}`}
                      className="flex items-center gap-4 rounded-[20px] border border-line bg-white/60 px-4 py-3.5 transition-colors hover:bg-white sm:px-5"
                    >
                      <Avatar initials={moment.mark} tone={moment.tone} size={48} square />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-moss">{moment.name}, nhóm của bạn</span>
                        <span className="block font-display text-lg font-bold tracking-[-0.02em] sm:text-xl">{moment.fresh} bài mới từ lần cuối bạn ghé</span>
                      </span>
                      <span className="hidden -space-x-2 sm:flex" aria-hidden="true">
                        {momentPeople.map((h) => {
                          const u = userOf(h);
                          return u ? (
                            <span key={h} className="rounded-full ring-2 ring-white">
                              <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={32} />
                            </span>
                          ) : null;
                        })}
                      </span>
                      <span className="hidden h-9 items-center rounded-full border border-line bg-white px-3.5 text-sm font-bold sm:inline-flex">Vào nhóm</span>
                    </Link>
                  </motion.div>,
                ]
              : []),
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <FadeIn>
                <PostCard post={p} showGroup={!group} />
              </FadeIn>
            </motion.div>,
          ])}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

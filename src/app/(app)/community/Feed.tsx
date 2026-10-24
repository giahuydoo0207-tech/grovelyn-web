"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ChevronDown, ImagePlus, Rocket, UsersRound } from "lucide-react";
import { ME, POSTS, POST_KINDS, projectsBy, type Post, type PostKind, userOf } from "@/lib/data";
import type { Media } from "@/lib/media";
import { currentPhase, showcaseOf } from "@/lib/showcase";
import { canAnnounce } from "@/lib/model";
import { Avatar } from "@/components/Avatar";
import { MediaPicker } from "@/components/MediaGrid";
import { PostCard } from "./PostCard";

const SORTS = ["Dành cho bạn", "Đang theo dõi"] as const;
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
  const me = userOf(ME)!;
  const mine = projectsBy(ME);
  const ready = mine.filter((p) => p.owner === ME && canAnnounce(currentPhase(showcaseOf(p).milestones), p.usage));

  const [posts, setPosts] = useState<Post[]>(() => POSTS.filter((p) => (group ? p.group === group : !p.group)));
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PostKind>("Chia sẻ");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [slug, setSlug] = useState("");
  const [needs, setNeeds] = useState("");
  const [filter, setFilter] = useState<Filter>("Tất cả");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Dành cho bạn");
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
    reset();
  };

  const byKind = filter === "Tất cả" ? posts : posts.filter((p) => p.kind === filter);
  const shown = sort === "Đang theo dõi" ? byKind.filter((p) => p.author === ME || p.author === "quocbao" || p.author === "minhkhoa") : byKind;

  const quick = [
    { k: "Chia sẻ" as const, label: "Ảnh, video", short: "Ảnh, video", icon: ImagePlus },
    { k: "Công bố" as const, label: "Công bố bản mới", short: "Công bố", icon: Rocket },
    { k: "Tìm cộng sự" as const, label: "Tìm cộng sự", short: "Cộng sự", icon: UsersRound },
  ].filter((q) => kinds.includes(q.k));

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <form onSubmit={publish} className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={me.initials} tone={me.tone} size={48} />
          {open ? (
            <p className="flex-1 font-semibold">{me.name}</p>
          ) : (
            <button
              type="button"
              onClick={() => start("Chia sẻ")}
              className="h-12 flex-1 rounded-full border border-[#c9d0c4] px-5 text-left text-[16px] font-semibold text-moss hover:bg-mist"
            >
              {group ? "Viết gì đó cho nhóm" : "Bạn đang làm gì?"}
            </button>
          )}
        </div>
        {!open && (
          <div className="mt-2 flex">
            {quick.map(({ k, label, short, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => start(k)}
                aria-label={label}
                className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[14px] font-semibold text-moss hover:bg-mist hover:text-ink sm:gap-2 sm:text-[15px]"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /> <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <div className="mt-4 flex flex-col gap-3.5">
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

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div role="group" aria-label="Lọc theo loại bài" className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 font-semibold transition-colors ${filter === f ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mist"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <label className="relative flex items-center font-semibold">
          <span className="mr-1.5 font-normal text-moss">Sắp xếp:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className="cursor-pointer appearance-none bg-transparent pr-5 outline-none">
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4" aria-hidden="true" />
        </label>
      </div>

      {shown.length === 0 && <p className="rounded-xl border border-line bg-white px-5 py-8 text-center text-moss">Chưa có bài {filter.toLowerCase()} nào.</p>}

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

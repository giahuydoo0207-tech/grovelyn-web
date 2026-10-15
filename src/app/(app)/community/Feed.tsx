"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus } from "lucide-react";
import { ME, POSTS, type Post, type PostKind, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "./PostCard";

const KINDS: { kind: PostKind; hint: string }[] = [
  { kind: "Chia sẻ", hint: "Chia sẻ điều bạn đang làm" },
  { kind: "Khoe dự án", hint: "Kể về dự án bạn vừa cập nhật" },
  { kind: "Tìm cộng sự", hint: "Bạn cần người làm phần nào?" },
];

const FEEDS = ["Dành cho bạn", "Đang theo dõi"] as const;

export function Feed() {
  const me = userOf(ME)!;
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [kind, setKind] = useState<PostKind>("Chia sẻ");
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [feed, setFeed] = useState<(typeof FEEDS)[number]>("Dành cho bạn");

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosts((p) => [
      { id: `new-${Date.now()}`, author: ME, kind, when: "vừa xong", text: text.trim(), likes: 0, comments: [], reposts: 0 },
      ...p,
    ]);
    setText("");
    setFocused(false);
  };

  const shown = feed === "Đang theo dõi" ? posts.filter((p) => p.author === ME || p.author === "quocbao") : posts;
  const hint = KINDS.find((k) => k.kind === kind)?.hint;

  return (
    <div className="mt-8 flex flex-col gap-5">
      <form onSubmit={publish} className="rounded-[22px] border border-line bg-white p-4 transition-shadow focus-within:shadow-[0_12px_40px_-20px_rgba(6,17,10,0.4)]">
        <div className="flex gap-3">
          <Avatar initials={me.initials} tone={me.tone} size={44} />
          <label className="flex-1">
            <span className="sr-only">Nội dung bài đăng</span>
            <motion.textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={hint}
              animate={{ height: focused || text ? 104 : 46 }}
              transition={{ duration: 0.2 }}
              className="w-full resize-none rounded-2xl bg-mist px-4 py-3 text-[16px] leading-relaxed outline-none placeholder:text-moss focus:bg-white focus:ring-1 focus:ring-line"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-[56px]">
          <div role="radiogroup" aria-label="Loại bài" className="no-scrollbar flex max-w-full overflow-x-auto whitespace-nowrap rounded-full bg-mist p-1">
            {KINDS.map((k) => {
              const on = k.kind === kind;
              return (
                <button
                  key={k.kind}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setKind(k.kind)}
                  className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${on ? "text-ink" : "text-moss hover:text-ink"}`}
                >
                  {on && <motion.span layoutId="kind-pill" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  <span className="relative">{k.kind}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-moss hover:bg-mist hover:text-ink">
            <ImagePlus className="h-[18px] w-[18px]" aria-hidden="true" /> Ảnh hoặc video
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={!text.trim()}
            className="ml-auto h-10 rounded-full bg-leaf px-5 text-sm font-bold text-ink transition-opacity disabled:opacity-40"
          >
            Đăng
          </motion.button>
        </div>
      </form>

      <div role="tablist" aria-label="Bảng tin" className="flex gap-6 border-b border-line">
        {FEEDS.map((f) => {
          const on = f === feed;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={on}
              onClick={() => setFeed(f)}
              className={`relative pb-3 text-[15px] font-semibold ${on ? "text-ink" : "text-moss hover:text-ink"}`}
            >
              {f}
              {on && <motion.span layoutId="feed-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-leaf" />}
            </button>
          );
        })}
      </div>

      <motion.div layout className="flex flex-col gap-5">
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

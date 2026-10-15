"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, FolderGit2, ImagePlus, Users } from "lucide-react";
import { ME, POSTS, type Post, type PostKind, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "./PostCard";

const ACTIONS: { kind: PostKind; label: string; short: string; icon: typeof ImagePlus; hint: string }[] = [
  { kind: "Chia sẻ", label: "Ảnh hoặc video", short: "Ảnh", icon: ImagePlus, hint: "Chia sẻ điều bạn đang làm" },
  { kind: "Khoe dự án", label: "Khoe dự án", short: "Dự án", icon: FolderGit2, hint: "Kể về dự án bạn vừa cập nhật" },
  { kind: "Tìm cộng sự", label: "Tìm cộng sự", short: "Cộng sự", icon: Users, hint: "Bạn cần người làm phần nào?" },
];

const SORTS = ["Dành cho bạn", "Đang theo dõi"] as const;

export function Feed() {
  const me = userOf(ME)!;
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [kind, setKind] = useState<PostKind>("Chia sẻ");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Dành cho bạn");
  const box = useRef<HTMLTextAreaElement>(null);

  const start = (k: PostKind) => {
    setKind(k);
    setOpen(true);
    setTimeout(() => box.current?.focus(), 50);
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosts((p) => [{ id: `new-${Date.now()}`, author: ME, kind, when: "vừa xong", text: text.trim(), likes: 0, comments: [], reposts: 0 }, ...p]);
    setText("");
    setOpen(false);
  };

  const shown = sort === "Đang theo dõi" ? posts.filter((p) => p.author === ME || p.author === "quocbao") : posts;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <form onSubmit={publish} className="rounded-2xl border border-line bg-white px-4 pb-2 pt-4">
        <div className="flex items-start gap-3">
          <Avatar initials={me.initials} tone={me.tone} size={48} />
          <label className="flex-1">
            <span className="sr-only">Nội dung bài đăng</span>
            <motion.textarea
              ref={box}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={open ? ACTIONS.find((a) => a.kind === kind)?.hint : "Bắt đầu bài đăng"}
              animate={{ height: open || text ? 112 : 48, borderRadius: open || text ? 16 : 999 }}
              transition={{ duration: 0.2 }}
              className="w-full resize-none border border-[#c9d0c4] bg-white px-5 py-3 text-[16px] font-medium leading-snug outline-none placeholder:font-semibold placeholder:text-moss hover:bg-mist focus:border-ink focus:bg-white"
            />
          </label>
        </div>

        <div className="mt-2 flex flex-wrap items-center">
          {ACTIONS.map((a) => {
            const on = open && a.kind === kind;
            return (
              <button
                key={a.kind}
                type="button"
                aria-pressed={on}
                onClick={() => start(a.kind)}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold transition-colors sm:text-[15px] ${
                  on ? "bg-sap/70 text-leaf-deep" : "text-moss hover:bg-mist hover:text-ink"
                }`}
              >
                <a.icon className="h-5 w-5 text-leaf-deep" aria-hidden="true" />
                <span className="whitespace-nowrap sm:hidden">{a.short}</span>
                <span className="hidden whitespace-nowrap sm:inline">{a.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-end gap-2 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setText("");
                  }}
                  className="h-9 rounded-full px-4 text-sm font-semibold text-moss hover:bg-mist"
                >
                  Hủy
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={!text.trim()}
                  className="h-9 rounded-full bg-leaf px-5 text-sm font-bold text-ink transition-opacity disabled:opacity-40"
                >
                  Đăng
                </motion.button>
              </div>
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

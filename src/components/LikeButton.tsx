"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { likedProjects } from "@/lib/stores";

/** Nút thích: tim bật nảy khi bấm, con số lăn lên hoặc xuống để thấy rõ đã thay đổi. */
export function LikeButton({ id, count, dark = false, size = "md" }: { id: string; count: number; dark?: boolean; size?: "sm" | "md" }) {
  // Lượt thích lưu trên trình duyệt, tải lại trang vẫn còn.
  const liked = likedProjects.use().includes(id);
  const n = count + (liked ? 1 : 0);
  const pad = size === "sm" ? "h-10 px-3 text-sm" : "h-11 px-4 text-[15px]";

  return (
    <button
      type="button"
      aria-pressed={liked}
      onClick={() => likedProjects.toggle(id)}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors ${pad} ${
        liked
          ? "bg-leaf text-ink"
          : dark
            ? "border border-ink-line text-white hover:bg-white/10"
            : "border border-line text-ink hover:bg-mist"
      }`}
    >
      <motion.span
        key={liked ? "on" : "off"}
        initial={{ scale: liked ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 12 }}
        className="flex"
      >
        <Heart className="h-[18px] w-[18px]" fill={liked ? "currentColor" : "none"} aria-hidden="true" />
      </motion.span>
      <span>{liked ? "Đã thích" : "Thích"}</span>
      <span className="relative inline-flex h-5 overflow-hidden tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={n}
            initial={{ y: liked ? 14 : -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: liked ? -14 : 14, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

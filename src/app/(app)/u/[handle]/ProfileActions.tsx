"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, PencilLine } from "lucide-react";

export function ProfileActions({ isMe, name }: { isMe: boolean; name: string }) {
  const [following, setFollowing] = useState(false);

  if (isMe) {
    return (
      <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-[15px] font-semibold hover:bg-mist">
        <PencilLine className="h-4 w-4" aria-hidden="true" /> Chỉnh sửa hồ sơ
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        layout
        type="button"
        aria-pressed={following}
        onClick={() => setFollowing((v) => !v)}
        className={`inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-[15px] font-semibold transition-colors ${
          following ? "bg-mist text-ink" : "bg-ink text-white hover:bg-ink-2"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {following && (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span layout>{following ? "Đang theo dõi" : "Theo dõi"}</motion.span>
      </motion.button>
      <a
        href="#"
        className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-[15px] font-semibold hover:bg-mist"
        title={`Nhắn tin cho ${name} qua Replyn`}
      >
        Nhắn tin
      </a>
    </div>
  );
}

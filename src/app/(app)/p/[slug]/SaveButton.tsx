"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bookmark } from "lucide-react";

export function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((v) => !v)}
      className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors ${
        saved ? "bg-white text-ink" : "border border-ink-line text-white hover:bg-white/10"
      }`}
    >
      <motion.span key={String(saved)} initial={{ y: saved ? -6 : 0 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className="flex">
        <Bookmark className="h-[18px] w-[18px]" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </motion.span>
      {saved ? "Đã lưu" : "Lưu"}
    </button>
  );
}

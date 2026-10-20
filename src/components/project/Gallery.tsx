"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Shot } from "@/lib/showcase";

/** Bộ ảnh dự án: ảnh đầu lớn, các ảnh sau xếp lưới; bấm để xem cỡ lớn, dùng phím mũi tên để chuyển. */
export function Gallery({ shots, label = "Bộ ảnh dự án", compact = false }: { shots: Shot[]; label?: string; compact?: boolean }) {
  const [at, setAt] = useState<number | null>(null);
  const close = useCallback(() => setAt(null), []);
  const step = useCallback((d: number) => setAt((i) => (i === null ? i : (i + d + shots.length) % shots.length)), [shots.length]);

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, close, step]);

  if (shots.length === 0) return null;

  return (
    <>
      {compact ? (
        <ul aria-label={label} className="grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
          {shots.map((s, i) => (
            <li key={`${s.src}-${i}`}>
              <Thumb shot={s} onOpen={() => setAt(i)} ratio="aspect-[4/3]" small />
            </li>
          ))}
        </ul>
      ) : (
        <div aria-label={label} role="group" className="flex flex-col gap-3">
          <Thumb shot={shots[0]} onOpen={() => setAt(0)} ratio={shots.length > 1 ? "aspect-[16/9]" : "aspect-[8/5]"} />
          {shots.length > 1 && (
            <ul className={`grid gap-3 ${shots.length === 2 ? "grid-cols-1" : shots.length === 3 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {shots.slice(1).map((s, i) => (
                <li key={`${s.src}-${i}`}>
                  <Thumb shot={s} onOpen={() => setAt(i + 1)} ratio="aspect-[8/5]" small />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <AnimatePresence>
        {at !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={shots[at].caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col bg-ink/95 p-4 sm:p-8"
            onClick={close}
          >
            <div className="flex items-center justify-between gap-4 text-white">
              <p className="text-sm tabular-nums text-fog">
                {at + 1} / {shots.length}
              </p>
              <button type="button" onClick={close} aria-label="Đóng" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[at].src} alt={shots[at].caption} className="max-h-full max-w-full rounded-xl object-contain" />
              {shots.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Ảnh trước" className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Ảnh sau" className="absolute right-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
            <p className="mt-3 text-center text-[15px] text-white">{shots[at].caption}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Thumb({ shot, onOpen, ratio, small = false }: { shot: Shot; onOpen: () => void; ratio: string; small?: boolean }) {
  return (
    <button type="button" onClick={onOpen} className="group block w-full overflow-hidden rounded-2xl border border-line bg-mist text-left">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng tải lên là data URL */}
      <img
        src={shot.src}
        alt={shot.caption}
        className={`w-full object-cover transition-transform duration-500 ease-[var(--ease-grow)] group-hover:scale-[1.02] ${ratio}`}
      />
      <span className={`block truncate px-3 text-moss ${small ? "py-2 text-xs" : "px-4 py-2.5 text-sm"}`}>{shot.caption}</span>
    </button>
  );
}

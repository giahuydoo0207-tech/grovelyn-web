"use client";

/* eslint-disable @next/next/no-img-element -- ảnh speaker có thể là data URL vừa cắt */

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { speakerInitials, type Speaker } from "@/lib/events";

const TONE: Record<Speaker["tone"], string> = {
  ink: "bg-ink text-leaf",
  leaf: "bg-leaf text-ink",
  sap: "bg-sap text-leaf-deep",
};

export function SpeakerFace({ speaker, size }: { speaker: Speaker; size: number }) {
  if (speaker.photo) {
    return <img src={speaker.photo} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ${TONE[speaker.tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
    >
      {speakerInitials(speaker.name)}
    </span>
  );
}

/** Chọn speaker bằng các nút có tên, khung bên dưới đổi theo. Phím mũi tên trái phải để chuyển. */
export function SpeakerTabs({ speakers }: { speakers: Speaker[] }) {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = speakers[Math.min(i, speakers.length - 1)];
  if (!cur) return null;

  const go = (n: number) => {
    const next = (n + speakers.length) % speakers.length;
    setI(next);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="speaker-h" className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="speaker-h" className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.035em]">
          Speaker
        </h2>
        {speakers.length > 1 && (
          <div role="tablist" aria-label="Chọn speaker" className="no-scrollbar -mx-1 flex max-w-full gap-2.5 overflow-x-auto px-1 py-1">
            {speakers.map((s, k) => {
              const on = k === i;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[k] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`sp-tab-${s.id}`}
                  aria-selected={on}
                  aria-controls="sp-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setI(k)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") go(k + 1);
                    if (e.key === "ArrowLeft") go(k - 1);
                  }}
                  className={`flex h-14 shrink-0 items-center gap-2.5 rounded-full border-2 pl-1.5 pr-4 text-left transition-colors ${
                    on ? "border-leaf-deep bg-white" : "border-line hover:bg-white"
                  }`}
                >
                  <SpeakerFace speaker={s} size={42} />
                  <span>
                    <span className="block text-sm font-bold">{s.name || "Chưa đặt tên"}</span>
                    <span className="text-xs text-moss">{s.role}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div id="sp-panel" role="tabpanel" aria-labelledby={`sp-tab-${cur.id}`} className="mt-6 overflow-hidden rounded-3xl border border-line bg-white p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="grid items-start gap-8 md:grid-cols-[200px_minmax(0,1fr)]"
          >
            <div className="flex justify-center">
              <span className="rounded-full bg-[conic-gradient(#5bd13a_0_70%,#dcf6cf_70%_100%)] p-1.5">
                <span className="block rounded-full ring-[5px] ring-white">
                  <SpeakerFace speaker={cur} size={172} />
                </span>
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-leaf-deep">{cur.role}</p>
              <h3 className="mt-1.5 font-display text-[clamp(1.75rem,3vw,2.15rem)] font-bold tracking-[-0.03em]">{cur.name || "Chưa đặt tên"}</h3>
              {cur.title && <p className="mt-1 font-semibold text-leaf-deep">{cur.title}</p>}
              {cur.bio && <p className="mt-3.5 max-w-[70ch] leading-relaxed text-[#3d4a38]">{cur.bio}</p>}
              {cur.handle && (
                <Link href={`/u/${cur.handle}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-leaf-deep hover:underline">
                  Xem hồ sơ trên Grovelyn
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

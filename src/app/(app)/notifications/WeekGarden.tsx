"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useCalm } from "@/components/Providers";
import { NOTICES, type NoticeKind } from "@/lib/data";
import { KIND } from "./NoticeCenter";

/** Các vị trí lá trên cây (x, y, góc xoay), xếp theo thứ tự mọc để cây đầy đều hai bên. */
const SLOTS: [number, number, number][] = [
  [100, 124, -60], [160, 108, 60], [108, 82, -55], [148, 72, 55], [130, 22, 0],
  [64, 108, -35], [198, 92, 35], [82, 54, -40], [176, 44, 40], [106, 26, -30],
  [84, 117, 20], [178, 101, -20], [96, 70, 25], [162, 62, -25], [118, 40, 20],
];

const PEOPLE: NoticeKind[] = ["like", "comment", "follow", "mention", "milestone", "exchange"];
const LEAF = "M0 -11 C7 -6 7 6 0 11 C-7 6 -7 -6 0 -11 Z";

/** Cây tuần này: mỗi lượt tương tác từ người khác trong 7 ngày là một chiếc lá, màu theo loại. */
export function WeekGarden() {
  const reduce = useCalm();
  const week = NOTICES.filter((n) => n.day !== "earlier" && n.actor && PEOPLE.includes(n.kind));
  const leaves = week.flatMap((n) => Array.from({ length: n.kind === "like" ? 1 + (n.others ?? 0) : 1 }, () => n.kind));
  const counts = PEOPLE.map((k) => ({ k, n: leaves.filter((x) => x === k).length })).filter((c) => c.n > 0);

  return (
    <section aria-labelledby="vuon-tuan" className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="px-4 pt-4">
        <h2 id="vuon-tuan" className="text-[15px] font-bold">
          Vườn tuần này
        </h2>
        <p className="mt-0.5 text-[13px] leading-snug text-moss">Mỗi lượt tương tác với bạn trong 7 ngày là một chiếc lá.</p>
      </div>

      <div className="relative mt-1 bg-gradient-to-b from-white to-mist">
        <svg viewBox="0 0 260 190" className="mx-auto block w-full max-w-[280px]" role="img" aria-label={`Cây có ${leaves.length} lá mới trong tuần`}>
          <ellipse cx="130" cy="180" rx="78" ry="6" fill="#e2e7de" />
          <g fill="none" stroke="#3f5a3a" strokeLinecap="round">
            <path d="M130 180 C128 152 132 122 130 94 C129 72 131 52 130 34" strokeWidth="6" />
            <path d="M130 142 C112 132 92 126 70 114" strokeWidth="3.5" />
            <path d="M130 126 C150 116 172 110 194 98" strokeWidth="3.5" />
            <path d="M130 100 C114 90 100 78 86 62" strokeWidth="3" />
            <path d="M130 86 C146 76 160 64 172 50" strokeWidth="3" />
            <path d="M130 62 C122 52 116 42 110 30" strokeWidth="2.5" />
          </g>
          {SLOTS.map(([x, y, r], i) => {
            const kind = leaves[i];
            const k = kind ? KIND[kind] : undefined;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(1.3)`}>
                {k ? (
                  <motion.g initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 380, damping: 16 }}>
                    <path d={LEAF} fill={k.color} />
                    <path d="M0 -8 V8" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.2" />
                  </motion.g>
                ) : (
                  <path d={LEAF} fill="#e3e9de" />
                )}
              </g>
            );
          })}
        </svg>
        <p className="pb-3 text-center">
          <span className="font-display text-3xl font-extrabold tabular-nums tracking-[-0.03em]">{leaves.length}</span>
          <span className="ml-1.5 text-sm font-semibold text-moss">lá mới</span>
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line px-4 py-3.5 text-[13px]">
        {counts.map(({ k, n }) => (
          <li key={k} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND[k].color }} aria-hidden="true" />
            <span className="flex-1 text-moss">{KIND[k].label}</span>
            <span className="font-bold tabular-nums">{n}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-line bg-mist/60 px-4 py-3.5 text-[13px] leading-snug">
        <p className="font-semibold">Chăm cây</p>
        <p className="mt-0.5 text-moss">
          Có 1 bình luận đang chờ bạn trả lời ở dự án{" "}
          <Link href="/p/dat-ban-ca-phe#thao-luan" className="font-semibold text-leaf-deep hover:underline">
            Ứng dụng đặt bàn
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

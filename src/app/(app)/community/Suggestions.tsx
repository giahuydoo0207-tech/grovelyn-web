"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { ONLINE, ONLINE_TOTAL, userOf } from "@/lib/data";
import { EVENTS, dateParts, placeLine } from "@/lib/events";
import { Avatar } from "@/components/Avatar";

/** Cột phải trang chủ: ai đang online và sự kiện sắp tới. */
export function Suggestions() {
  const [going, setGoing] = useState<string[]>([]);
  const people = ONLINE.map(userOf).filter((u) => u !== undefined);
  const rest = ONLINE_TOTAL - people.length;

  return (
    <aside className="hidden flex-col gap-3 lg:flex lg:sticky lg:top-[88px]">
      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Đang online</h2>
          <span className="text-[13px] text-moss">{ONLINE_TOTAL} người</span>
        </div>
        <ul className="mt-3 flex">
          {people.map((u) => (
            <li key={u.handle} className="-mr-1">
              <Link href={`/u/${u.handle}`} className="relative block rounded-full ring-[3px] ring-white" aria-label={`${u.name}, đang online`}>
                <Avatar initials={u.initials} tone={u.tone} size={40} />
                <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-leaf ring-2 ring-white" />
              </Link>
            </li>
          ))}
          {rest > 0 && (
            <li className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-[13px] font-bold text-moss ring-[3px] ring-white">
              +{rest}
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Sự kiện sắp tới</h2>
          <Link href="/events" className="text-[13px] font-semibold text-leaf-deep hover:underline">
            Xem tất cả
          </Link>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {EVENTS.slice(0, 3).map((e) => {
            const on = going.includes(e.slug);
            const d = dateParts(e.date);
            return (
              <li key={e.slug} className="flex gap-3">
                <span className="flex h-[52px] w-12 shrink-0 flex-col overflow-hidden rounded-xl border border-line text-center" aria-hidden="true">
                  <span className="bg-ink py-0.5 text-[11px] font-bold text-leaf">{d.tag}</span>
                  <span className="flex flex-1 items-center justify-center font-display text-xl font-bold">{d.day}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/events/${e.slug}`} className="block text-sm font-bold leading-snug hover:underline">
                    <span className="sr-only">{d.long}, </span>
                    {e.title}
                  </Link>
                  <p className="text-xs text-moss">
                    {placeLine(e)}, {e.from}, {e.interested + (on ? 1 : 0)} người quan tâm
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={on}
                    onClick={() => setGoing((g) => (on ? g.filter((x) => x !== e.slug) : [...g, e.slug]))}
                    className={`mt-1.5 inline-flex h-[30px] items-center gap-1 rounded-full border px-3 text-xs font-bold transition-colors ${
                      on ? "border-leaf-deep bg-sap text-leaf-deep" : "border-ink bg-white hover:bg-mist"
                    }`}
                  >
                    {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {on ? "Đã quan tâm" : "Quan tâm"}
                  </motion.button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

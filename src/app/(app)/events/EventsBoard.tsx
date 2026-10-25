"use client";

import Link from "next/link";
import { useState } from "react";
import { interestedEvents, myEventsStore } from "@/lib/stores";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { EVENTS as SAMPLE, TODAY, dateParts, placeLine, type CommunityEvent } from "@/lib/events";
import { DateBadge, EventCoverImage } from "./EventView";

const FILTERS = ["Sắp diễn ra", "Tuần này", "Trực tuyến", "Tại chỗ", "Bạn quan tâm"] as const;
type Filter = (typeof FILTERS)[number];

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function InterestButton({ on, onToggle, dark = false }: { on: boolean; onToggle: () => void; dark?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      aria-pressed={on}
      onClick={onToggle}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
        on ? "border-leaf-deep bg-sap text-leaf-deep" : dark ? "border-ink bg-ink text-white" : "border-ink bg-white hover:bg-mist"
      }`}
    >
      {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {on ? "Đã quan tâm" : "Quan tâm"}
    </motion.button>
  );
}

function MonthCalendar({ events, picked, onPick }: { events: CommunityEvent[]; picked: string | null; onPick: (iso: string | null) => void }) {
  const [cursor, setCursor] = useState(TODAY.slice(0, 7));
  const [y, m] = cursor.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const marked = new Set(events.map((e) => e.date));
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setCursor(d.toISOString().slice(0, 7));
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]" aria-live="polite">
          Tháng {m}, {y}
        </h2>
        <span className="flex gap-1">
          <button type="button" aria-label="Tháng trước" onClick={() => shift(-1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-mist">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Tháng sau" onClick={() => shift(1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-mist">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => (
          <span key={w} className="py-1 text-xs font-semibold text-moss">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const iso = `${cursor}-${String(i + 1).padStart(2, "0")}`;
          const has = marked.has(iso);
          const today = iso === TODAY;
          const on = picked === iso;
          const cls = `relative flex h-[34px] items-center justify-center rounded-full text-[13px] tabular-nums ${
            on ? "bg-leaf font-bold text-ink" : today ? "bg-ink font-bold text-white" : iso < TODAY ? "text-fog" : has ? "font-bold" : ""
          }`;
          return has ? (
            <button key={iso} type="button" aria-pressed={on} aria-label={`${dateParts(iso).long}, có sự kiện`} onClick={() => onPick(on ? null : iso)} className={`${cls} hover:bg-sap`}>
              {i + 1}
              <span className={`absolute bottom-[3px] h-[5px] w-[5px] rounded-full ${on ? "bg-ink" : "bg-leaf-deep"}`} aria-hidden="true" />
            </button>
          ) : (
            <span key={iso} className={cls}>
              {i + 1}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-moss">Bấm ngày có chấm để lọc sự kiện trong ngày đó.</p>
    </section>
  );
}

/** Danh sách sự kiện: sự kiện nổi bật, bộ lọc, lưới thẻ, lịch tháng và các sự kiện bạn quan tâm. */
export function EventsBoard() {
  const [filter, setFilter] = useState<Filter>("Sắp diễn ra");
  const [day, setDay] = useState<string | null>(null);
  // Sự kiện quan tâm lưu trên trình duyệt.
  const liked = interestedEvents.use();
  const toggle = interestedEvents.toggle;

  // Sự kiện bạn tạo (lưu trên trình duyệt) cùng sự kiện mẫu.
  const mineEvents = myEventsStore.use();
  const upcoming = [...mineEvents, ...SAMPLE].filter((e) => e.date >= TODAY).sort((a, b) => (a.date + a.from).localeCompare(b.date + b.from));
  const featured = upcoming.find((e) => e.featured);

  const shown = upcoming.filter((e) => {
    if (day) return e.date === day;
    if (filter === "Tuần này") return e.date <= addDays(TODAY, 6);
    if (filter === "Trực tuyến") return e.mode !== "Tại chỗ";
    if (filter === "Tại chỗ") return e.mode !== "Trực tuyến";
    if (filter === "Bạn quan tâm") return liked.includes(e.slug);
    return e.slug !== featured?.slug;
  });

  const mine = upcoming.filter((e) => liked.includes(e.slug));

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        {featured && (
          <article className="grid overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Link href={`/events/${featured.slug}`} className="relative block aspect-[2/1] md:aspect-auto md:min-h-[280px]" aria-label={featured.title}>
              <EventCoverImage event={featured} className="absolute inset-0" />
              <span className="absolute left-4 top-4 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-leaf">Nổi bật</span>
            </Link>
            <div className="flex flex-col p-6">
              <p className="text-sm font-bold text-leaf-deep">
                {dateParts(featured.date).long}, {featured.from} đến {featured.to}
              </p>
              <h2 className="mt-1.5 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em]">
                <Link href={`/events/${featured.slug}`} className="hover:underline">
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-2.5 line-clamp-3 leading-relaxed text-[#3d4a38]">{featured.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-moss">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {placeLine(featured)}
                {featured.group ? `, nhóm ${featured.group.name}` : ""}
              </p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-[13px] text-moss">{featured.interested + (liked.includes(featured.slug) ? 1 : 0)} người quan tâm</span>
                <InterestButton on={liked.includes(featured.slug)} onToggle={() => toggle(featured.slug)} dark />
              </div>
            </div>
          </article>
        )}

        <div role="group" aria-label="Lọc sự kiện" className="flex flex-wrap gap-2">
          {day ? (
            <button type="button" onClick={() => setDay(null)} className="inline-flex h-[38px] items-center gap-2 rounded-full bg-leaf px-4 text-sm font-bold text-ink">
              Ngày {dateParts(day).short}
              <X className="h-4 w-4" aria-label="Bỏ lọc ngày" />
            </button>
          ) : (
            FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`h-[38px] rounded-full border px-4 text-sm font-semibold transition-colors ${
                  filter === f ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mist"
                }`}
              >
                {f}
              </button>
            ))
          )}
        </div>

        <motion.ul layout className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((e) => {
              const on = liked.includes(e.slug);
              const left = e.seats - e.registered;
              return (
                <motion.li key={e.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <article className="h-full overflow-hidden rounded-2xl border border-line bg-white">
                    <Link href={`/events/${e.slug}`} className="relative block aspect-[2/1]" tabIndex={-1} aria-hidden="true">
                      <EventCoverImage event={e} className="absolute inset-0" />
                      <span className="absolute left-3 top-3">
                        <DateBadge iso={e.date} size="sm" />
                      </span>
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold">{e.mode}</span>
                    </Link>
                    <div className="p-4">
                      <p className="text-[13px] font-bold text-leaf-deep">
                        {dateParts(e.date).weekday}, {e.from}
                      </p>
                      <h3 className="mt-1 text-[17px] font-bold leading-snug">
                        <Link href={`/events/${e.slug}`} className="hover:underline">
                          {e.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-[13px] text-moss">{e.group ? `Nhóm ${e.group.name}` : placeLine(e)}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[13px] text-moss">
                          {e.interested + (on ? 1 : 0)} quan tâm{left <= 15 ? `, còn ${left} chỗ` : ""}
                        </span>
                        <InterestButton on={on} onToggle={() => toggle(e.slug)} />
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
        {shown.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#c9d0c4] p-8 text-center text-moss">
            Chưa có sự kiện nào ở đây.{" "}
            <Link href="/events/new" className="font-bold text-leaf-deep hover:underline">
              Tạo sự kiện đầu tiên
            </Link>
          </p>
        )}
      </div>

      <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px]">
        <MonthCalendar events={upcoming} picked={day} onPick={setDay} />
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Bạn đã quan tâm</h2>
          {mine.length ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {mine.map((e) => (
                <li key={e.slug}>
                  <Link href={`/events/${e.slug}`} className="flex items-center gap-2.5 rounded-lg hover:bg-mist">
                    <span className="h-9 w-1.5 shrink-0 rounded-full bg-leaf" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-bold leading-snug">{e.title}</span>
                      <span className="text-xs text-moss">
                        {dateParts(e.date).short}, {e.from}, {e.mode.toLowerCase()}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-moss">Bấm Quan tâm ở một sự kiện để nó hiện ở đây.</p>
          )}
          <p className="mt-3 text-[13px] text-moss">Grovelyn nhắc bạn trước 1 giờ qua thông báo.</p>
        </section>
      </aside>
    </div>
  );
}

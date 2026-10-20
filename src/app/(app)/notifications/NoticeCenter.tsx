"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtSign, CalendarDays, CheckCheck, Eye, MessageCircle, Sprout, ThumbsUp, UserPlus, type LucideIcon } from "lucide-react";
import { NOTICES, projectOf, userOf, type Notice, type NoticeKind } from "@/lib/data";
import { showcaseOf } from "@/lib/showcase";
import { Avatar } from "@/components/Avatar";
import { ProjectLogo } from "@/components/project/ProjectLogo";

export const KIND: Record<NoticeKind, { icon: LucideIcon; color: string; tint: string; label: string }> = {
  like: { icon: ThumbsUp, color: "#1d6b1d", tint: "#dcf6cf", label: "Lượt thích" },
  comment: { icon: MessageCircle, color: "#0369a1", tint: "#e0f2fe", label: "Bình luận" },
  follow: { icon: UserPlus, color: "#7c3aed", tint: "#ede9fe", label: "Theo dõi" },
  mention: { icon: AtSign, color: "#c2690a", tint: "#fef3c7", label: "Nhắc đến" },
  milestone: { icon: Sprout, color: "#0f766e", tint: "#ccfbf1", label: "Cột mốc" },
  view: { icon: Eye, color: "#c2410c", tint: "#ffedd5", label: "Lượt xem" },
  event: { icon: CalendarDays, color: "#e11d48", tint: "#ffe4e6", label: "Sự kiện" },
};

const FILTERS: { id: string; label: string; kinds: NoticeKind[] | null }[] = [
  { id: "all", label: "Tất cả", kinds: null },
  { id: "project", label: "Dự án", kinds: ["like", "milestone"] },
  { id: "talk", label: "Bình luận", kinds: ["comment", "mention"] },
  { id: "people", label: "Người theo dõi", kinds: ["follow"] },
  { id: "chance", label: "Cơ hội", kinds: ["view", "event"] },
];

const DAYS: { id: Notice["day"]; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "Tuần này" },
  { id: "earlier", label: "Trước đó" },
];

/** Nút hành động đi kèm từng loại thông báo. */
const ACTION: Partial<Record<NoticeKind, string>> = {
  comment: "Trả lời",
  mention: "Xem bài viết",
  follow: "Theo dõi lại",
  milestone: "Xem hành trình",
  event: "Xem sự kiện",
  view: "Hoàn thiện hồ sơ",
};

function KindAvatar({ n }: { n: Notice }) {
  const k = KIND[n.kind];
  const u = n.actor ? userOf(n.actor) : undefined;
  return (
    <span className="relative block h-12 w-12 shrink-0">
      {u ? (
        <Avatar initials={u.initials} tone={u.tone} size={48} />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: k.tint, color: k.color }}>
          <k.icon className="h-[22px] w-[22px]" aria-hidden="true" />
        </span>
      )}
      {u && (
        <span
          className="absolute -bottom-0.5 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full text-white ring-2 ring-white"
          style={{ background: k.color }}
        >
          <k.icon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

function NoticeRow({ n, unread, onRead }: { n: Notice; unread: boolean; onRead: () => void }) {
  const u = n.actor ? userOf(n.actor) : undefined;
  const p = n.project ? projectOf(n.project) : undefined;
  const sc = p ? showcaseOf(p) : undefined;
  const action = ACTION[n.kind];
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="relative">
      <div className={`group relative flex gap-3.5 rounded-xl py-3.5 pl-3 pr-3 transition-colors sm:pr-4 ${unread ? "bg-sap/35 hover:bg-sap/50" : "hover:bg-mist"}`}>
        <KindAvatar n={n} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-relaxed">
            <Link href={n.href} onClick={onRead} className="after:absolute after:inset-0 after:rounded-xl">
              {u && <strong className="font-bold">{u.name}</strong>}
              {u && n.others ? ` và ${n.others} người khác` : ""} {n.text}
            </Link>
          </p>
          {n.quote && (
            <p className="mt-2 rounded-lg border-l-[3px] bg-white/80 px-3 py-2 text-[15px] leading-relaxed text-ink/85" style={{ borderColor: KIND[n.kind].color }}>
              {n.quote}
            </p>
          )}
          {p && (
            <span className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-white py-1.5 pl-1.5 pr-3">
              <ProjectLogo title={p.title} logo={sc?.logo} size={26} />
              <span className="truncate text-sm font-semibold">{p.title}</span>
            </span>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-moss">
            <span>{n.when === "hôm qua" ? n.when : `${n.when} trước`}</span>
            {action && (
              <Link
                href={n.href}
                onClick={onRead}
                className="relative z-10 rounded-full border border-line bg-white px-3 py-1 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
              >
                {action}
              </Link>
            )}
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end justify-between">
          {unread ? (
            <button type="button" onClick={onRead} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white" aria-label="Đánh dấu đã đọc" title="Đánh dấu đã đọc">
              <span className="h-2.5 w-2.5 rounded-full bg-leaf-deep" />
            </button>
          ) : (
            <span className="h-8 w-8" />
          )}
        </div>
      </div>
    </motion.li>
  );
}

/** Danh sách thông báo: lọc theo loại, nhóm theo thời gian, đánh dấu đã đọc. */
export function NoticeCenter() {
  const [filter, setFilter] = useState("all");
  const [read, setRead] = useState<Set<string>>(new Set());
  const kinds = FILTERS.find((f) => f.id === filter)!.kinds;
  const shown = NOTICES.filter((n) => !kinds || kinds.includes(n.kind));
  const isUnread = (n: Notice) => n.unread && !read.has(n.id);
  const unreadCount = NOTICES.filter(isUnread).length;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <header className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[clamp(1.6rem,3vw,2rem)] font-bold leading-none tracking-[-0.04em]">Thông báo</h1>
            <p className="mt-1.5 text-sm text-moss" aria-live="polite">
              {unreadCount ? `${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
            </p>
          </div>
          <button
            type="button"
            disabled={!unreadCount}
            onClick={() => setRead(new Set(NOTICES.map((n) => n.id)))}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-leaf-deep transition-colors hover:bg-sap/60 disabled:pointer-events-none disabled:text-moss/60"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> Đánh dấu đã đọc tất cả
          </button>
        </div>
        <div role="tablist" aria-label="Lọc thông báo" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const n = f.kinds ? NOTICES.filter((x) => f.kinds!.includes(x.kind) && isUnread(x)).length : 0;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`}
              >
                {f.label}
                {n > 0 && <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-leaf text-ink" : "bg-sap text-leaf-deep"}`}>{n}</span>}
              </button>
            );
          })}
        </div>
      </header>

      <section role="tabpanel" aria-label="Danh sách thông báo" className="rounded-2xl border border-line bg-white px-2 py-3 sm:px-3">
        {shown.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Sprout className="h-8 w-8 text-leaf-deep" aria-hidden="true" />
            <p className="font-semibold">Chưa có gì ở mục này</p>
            <p className="max-w-[36ch] text-sm text-moss">Đăng dự án hoặc góp ý cho người khác, thông báo sẽ mọc dần ở đây.</p>
          </div>
        )}
        {DAYS.map((d) => {
          const items = shown.filter((n) => n.day === d.id);
          if (!items.length) return null;
          return (
            <div key={d.id} className="mb-1 last:mb-0">
              <h2 className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-[13px] font-bold uppercase tracking-[0.05em] text-moss">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" />
                {d.label}
              </h2>
              <ul className="flex flex-col gap-1">
                <AnimatePresence initial={false}>
                  {items.map((n) => (
                    <NoticeRow key={n.id} n={n} unread={isUnread(n)} onRead={() => setRead((s) => new Set(s).add(n.id))} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}

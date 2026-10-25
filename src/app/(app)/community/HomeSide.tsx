"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, Hash, MessageCircle } from "lucide-react";
import { ONLINE, ONLINE_TOTAL, projectOf, userOf, type Post } from "@/lib/data";
import { EVENTS, TODAY, dateParts, placeLine } from "@/lib/events";
import { useTopics } from "@/lib/topicStore";
import { interestedEvents, myProjectsStore, postsStore } from "@/lib/stores";
import { useChat } from "@/components/chat/ChatProvider";
import { Avatar } from "@/components/Avatar";

const DAY = 86_400_000;
const daysUntil = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / DAY);
const countdown = (n: number) => (n <= 0 ? "Hôm nay" : n === 1 ? "Ngày mai" : `Còn ${n} ngày`);

/** Nhịp cộng đồng: số bài, bình luận và góp ý thật đang có trên bản dùng thử. */
function usePulse() {
  const posts = postsStore.use();
  const topics = useTopics();
  const rows = [
    { label: "bài đăng", n: posts.length },
    { label: "bình luận", n: posts.reduce((s, p) => s + p.comments.length, 0) },
    { label: "góp ý trong Trao đổi", n: topics.reduce((s, t) => s + t.replies.length, 0) },
  ];
  return { total: rows.reduce((s, r) => s + r.n, 0), rows };
}

/** Một dòng ngắn về việc người đó vừa làm, lấy từ bài mới nhất của họ. */
function activityOf(handle: string, posts: Post[], openTopics: string[]): string {
  if (openTopics.includes(handle)) return "Đang mở trao đổi, chờ góp ý";
  const last = posts.find((p) => p.author === handle);
  if (!last) return userOf(handle)?.intro ?? "";
  const title = last.project ? projectOf(last.project)?.title : undefined;
  if (last.kind === "Công bố") return `Vừa công bố ${title ?? "bản mới"}${last.version ? ` ${last.version}` : ""}`;
  if (last.kind === "Tìm cộng sự") return "Đang tìm cộng sự";
  return title ? `Vừa chia sẻ về ${title}` : "Vừa chia sẻ một bài";
}

export function Pulse() {
  const { total, rows } = usePulse();
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section aria-labelledby="nhip" className="rounded-[20px] bg-ink p-[18px] text-white">
      <h2 id="nhip" className="flex items-center gap-2 text-[13px] font-bold text-leaf">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full bg-leaf opacity-60 motion-reduce:animate-none" />
          <span className="relative h-2 w-2 rounded-full bg-leaf" />
        </span>
        Nhịp cộng đồng
      </h2>
      <p className="mt-2 flex items-end gap-3">
        <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums">{total}</span>
        <span className="pb-1 text-[13px] leading-snug text-white/70">bài, bình luận và góp ý đang có</span>
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <li key={r.label}>
            <div className="flex justify-between text-[13px]">
              <span className="text-white/75">{r.label}</span>
              <span className="font-bold tabular-nums">{r.n}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={`h-full rounded-full ${i === 0 ? "bg-leaf" : i === 1 ? "bg-[#a8e58f]" : "bg-sap"}`}
                initial={{ width: 0 }}
                animate={{ width: `${(r.n / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Online() {
  const posts = postsStore.use();
  const openTopics = useTopics()
    .filter((t) => t.status === "open")
    .map((t) => t.lead);
  const { startDirect, openWindow, setActive } = useChat();
  const router = useRouter();
  const people = ONLINE.slice(0, 4)
    .map((h) => userOf(h))
    .filter((u) => !!u);

  const chat = (handle: string) => {
    const id = startDirect(handle);
    if (window.matchMedia("(min-width: 768px)").matches) openWindow(id);
    else {
      setActive(id);
      router.push("/messages");
    }
  };

  return (
    <section className="rounded-[20px] border border-line bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Đang online</h2>
        <span className="text-[13px] text-moss">{ONLINE_TOTAL} người</span>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {people.map((u) => (
          <li key={u.handle} className="flex items-center gap-2.5">
            <Link href={`/u/${u.handle}`} className="relative shrink-0" aria-hidden="true" tabIndex={-1}>
              <Avatar initials={u.initials} tone={u.tone} size={38} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-leaf ring-2 ring-white" />
            </Link>
            <span className="min-w-0 flex-1">
              <Link href={`/u/${u.handle}`} className="block truncate text-sm font-bold hover:underline">
                {u.name}
                <span className="sr-only">, đang online</span>
              </Link>
              <span className="block truncate text-xs text-moss">{activityOf(u.handle, posts, openTopics)}</span>
            </span>
            <button type="button" onClick={() => chat(u.handle)} aria-label={`Nhắn tin cho ${u.name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-leaf-deep hover:bg-sap">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Events() {
  const going = interestedEvents.use();
  const list = EVENTS.filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  return (
    <section className="rounded-[20px] border border-line bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Sự kiện sắp tới</h2>
        <Link href="/events" className="text-[13px] font-semibold text-leaf-deep hover:underline">
          Xem tất cả
        </Link>
      </div>
      <ul className="mt-3.5 flex flex-col gap-3.5">
        {list.map((e) => {
          const on = going.includes(e.slug);
          const d = dateParts(e.date);
          return (
            <li key={e.slug} className="flex gap-3">
              <span aria-hidden="true" className={`flex h-14 w-[52px] shrink-0 flex-col items-center justify-center rounded-xl ${on ? "bg-ink text-white" : "bg-mist"}`}>
                <span className="font-display text-[22px] font-bold leading-none">{d.day}</span>
                <span className={`mt-1 text-[11px] font-bold ${on ? "text-leaf" : "text-moss"}`}>{d.monthName.replace("tháng", "thg")}</span>
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/events/${e.slug}`} className="block text-sm font-bold leading-snug hover:underline">
                  <span className="sr-only">{d.long}, </span>
                  {e.title}
                </Link>
                <p className="truncate text-xs text-moss">
                  {placeLine(e)}, {e.from}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={on}
                    onClick={() => interestedEvents.toggle(e.slug)}
                    className={`inline-flex h-[30px] items-center gap-1 whitespace-nowrap rounded-full px-3 text-xs font-bold transition-colors ${on ? "bg-sap text-leaf-deep" : "border border-line bg-white hover:bg-mist"}`}
                  >
                    {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {on ? "Đã quan tâm" : "Quan tâm"}
                  </motion.button>
                  <span className="whitespace-nowrap text-xs font-bold text-leaf-deep">{countdown(daysUntil(e.date))}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Chủ đề được nói nhiều: gom bài theo bối cảnh hoặc ngành của dự án được gắn. */
function Trending() {
  const posts = postsStore.use();
  const mine = myProjectsStore.use();
  const tally = new Map<string, number>();
  for (const p of posts) {
    if (!p.project) continue;
    const proj = projectOf(p.project) ?? mine.find((m) => m.slug === p.project);
    if (!proj) continue;
    for (const key of new Set([proj.contextNote, proj.field].filter((k): k is string => !!k))) tally.set(key, (tally.get(key) ?? 0) + 1 + p.comments.length);
  }
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!top.length) return null;
  return (
    <section className="rounded-[20px] border border-line bg-white p-4">
      <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Đang được nói nhiều</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {top.map(([name, n]) => (
          <li key={name}>
            <Link href="/explore" className="group flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mist text-leaf-deep">
                <Hash className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold group-hover:underline">{name}</span>
                <span className="text-xs text-moss">{n} bài và bình luận</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Cột phải Trang chủ trên màn hình rộng. */
export function HomeSide() {
  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-[88px] lg:flex">
      <Pulse />
      <Online />
      <Events />
      <Trending />
    </aside>
  );
}

/** Trên điện thoại: một dải gọn trên bảng tin thay cho cột phải. */
export function HomeStrip() {
  const { total } = usePulse();
  const people = ONLINE.slice(0, 4)
    .map((h) => userOf(h))
    .filter((u) => !!u);
  const next = EVENTS.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden">
      <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink pl-3 pr-4 text-sm text-white">
        <span className="h-2 w-2 rounded-full bg-leaf" aria-hidden="true" />
        <strong className="tabular-nums">{total}</strong> hoạt động
      </span>
      <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-4 text-sm">
        <span className="flex -space-x-2" aria-hidden="true">
          {people.map((u) => (
            <span key={u.handle} className="rounded-full ring-2 ring-white">
              <Avatar initials={u.initials} tone={u.tone} size={30} />
            </span>
          ))}
        </span>
        <strong className="tabular-nums">{ONLINE_TOTAL}</strong> đang online
      </span>
      {next && (
        <Link href={`/events/${next.slug}`} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm">
          <strong>{countdown(daysUntil(next.date))}</strong>
          <span className="max-w-[180px] truncate text-moss">{next.title}</span>
        </Link>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Search } from "lucide-react";
import { GROUPS, type Group } from "@/lib/data";
import { GroupCover, GroupMark } from "@/components/GroupVisual";

const TABS = ["Nhóm của bạn", "Khám phá", "Lời mời"] as const;
type Tab = (typeof TABS)[number];

/** Lời mời mẫu: một nhóm bạn được mời nhưng chưa vào. */
const INVITES = ["react-nextjs-vn"];

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

function MemberCard({ g }: { g: Group }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <Link href={`/groups/${g.slug}`} tabIndex={-1} aria-hidden="true" className="block aspect-[3/1]">
        <GroupCover cover={g.cover} seed={g.coverSeed} tone={g.coverTone} />
      </Link>
      <div className="px-4 pb-4">
        <div className="relative -mt-6">
          <GroupMark mark={g.mark} tone={g.tone} size={52} ring={4} />
        </div>
        <h2 className="mt-2.5 text-[17px] font-bold">
          <Link href={`/groups/${g.slug}`} className="hover:underline">
            {g.name}
          </Link>
        </h2>
        <p className="mt-0.5 text-[13px] text-moss">
          {g.privacy}, {g.members.toLocaleString("vi-VN")} thành viên
        </p>
        <div className="mt-3.5 flex items-center justify-between">
          <span className={`text-[13px] font-bold ${g.fresh ? "text-leaf-deep" : "text-moss"}`}>{g.fresh ? `${g.fresh} bài mới` : "Không có bài mới"}</span>
          <Link href={`/groups/${g.slug}`} className="inline-flex h-9 items-center rounded-full border border-ink px-3.5 text-sm font-bold hover:bg-mist">
            Vào nhóm
          </Link>
        </div>
      </div>
    </article>
  );
}

function SuggestCard({ g, state, onJoin }: { g: Group; state: "none" | "joined" | "asked"; onJoin: () => void }) {
  return (
    <article className="flex gap-3.5 rounded-2xl border border-line bg-white p-4">
      <GroupMark mark={g.mark} tone={g.tone} size={56} />
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">
          <Link href={`/groups/${g.slug}`} className="hover:underline">
            {g.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[13px] text-moss">
          {g.privacy}, {g.members.toLocaleString("vi-VN")} thành viên
        </p>
        {g.why && <p className="mt-1.5 text-[13px]">{g.why}</p>}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onJoin}
          disabled={state !== "none"}
          className={`mt-2.5 inline-flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold ${
            state === "none" ? "bg-ink text-white" : "border border-leaf-deep bg-sap text-leaf-deep"
          }`}
        >
          {state !== "none" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          {state === "joined" ? "Đã tham gia" : state === "asked" ? "Đã gửi yêu cầu" : g.privacy === "Riêng tư" ? "Xin vào nhóm" : "Tham gia"}
        </motion.button>
      </div>
    </article>
  );
}

/** Trang Nhóm (bản 1): tab Nhóm của bạn, Khám phá, Lời mời, ô tìm nhóm và phần gợi ý. */
export function GroupsBoard() {
  const [tab, setTab] = useState<Tab>("Nhóm của bạn");
  const [q, setQ] = useState("");
  const [joined, setJoined] = useState<Record<string, "joined" | "asked">>({});

  const match = (g: Group) => !q.trim() || fold(`${g.name} ${g.fields.join(" ")}`).includes(fold(q));
  const isMember = (g: Group) => g.joined || joined[g.slug] === "joined";
  const mine = GROUPS.filter((g) => isMember(g) && match(g));
  const others = GROUPS.filter((g) => !isMember(g) && match(g));
  const invites = GROUPS.filter((g) => INVITES.includes(g.slug) && !isMember(g));
  const join = (g: Group) => setJoined((j) => ({ ...j, [g.slug]: g.privacy === "Riêng tư" && !INVITES.includes(g.slug) ? "asked" : "joined" }));

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <div role="tablist" aria-label="Loại nhóm" className="flex gap-1">
          {TABS.map((t) => {
            const count = t === "Nhóm của bạn" ? mine.length : t === "Lời mời" ? invites.length : 0;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`relative h-11 px-3.5 text-[15px] ${tab === t ? "font-bold" : "font-semibold text-moss hover:text-ink"}`}
              >
                {t}
                {count > 0 && (
                  <span className={`ml-1.5 ${t === "Lời mời" ? "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-leaf-deep px-1 text-[11px] text-white" : "text-moss"}`}>{count}</span>
                )}
                {tab === t && <motion.span layoutId="groups-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
              </button>
            );
          })}
        </div>
        <label className="mb-2 flex h-10 w-full items-center gap-2 rounded-full border border-line bg-white px-3.5 sm:w-[280px]">
          <Search className="h-4 w-4 text-moss" aria-hidden="true" />
          <span className="sr-only">Tìm nhóm</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm nhóm hoặc ngành" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === "Nhóm của bạn" && (
            <>
              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mine.map((g) => (
                  <MemberCard key={g.slug} g={g} />
                ))}
              </section>
              {mine.length === 0 && <p className="mt-5 rounded-2xl border border-dashed border-[#c9d0c4] p-8 text-center text-moss">Không có nhóm nào khớp.</p>}
              {others.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-2xl font-bold tracking-[-0.02em]">Gợi ý cho bạn</h2>
                  <section className="mt-3.5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {others.slice(0, 3).map((g) => (
                      <SuggestCard key={g.slug} g={g} state={joined[g.slug] ?? "none"} onJoin={() => join(g)} />
                    ))}
                  </section>
                </>
              )}
            </>
          )}
          {tab === "Khám phá" && (
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((g) => (
                <SuggestCard key={g.slug} g={g} state={joined[g.slug] ?? "none"} onJoin={() => join(g)} />
              ))}
              {others.length === 0 && <p className="text-moss">Bạn đã ở trong mọi nhóm khớp với tìm kiếm.</p>}
            </section>
          )}
          {tab === "Lời mời" && (
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {invites.map((g) => (
                <SuggestCard key={g.slug} g={{ ...g, why: "Lê Minh Khoa mời bạn vào nhóm" }} state={joined[g.slug] ?? "none"} onJoin={() => join(g)} />
              ))}
              {invites.length === 0 && <p className="text-moss">Không có lời mời nào.</p>}
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

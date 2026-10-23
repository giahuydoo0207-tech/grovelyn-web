"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { FIELDS, ME, projectOf, projectsBy, userOf, type Project } from "@/lib/data";
import { MAX_OPEN_TOPICS, TOPIC_DAYS, TOPIC_KINDS, TOPICS, contributionsBy, ownerOf, type Topic, type TopicKind } from "@/lib/exchange";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { Avatar } from "@/components/Avatar";
import { OpenTopicDialog, ReplyDialog } from "@/components/exchange/Dialogs";
import { TopicMeta } from "@/components/exchange/TopicParts";

const versionsOf = (p: Project) => p.versions.map((v) => v.tag);

function TopicCard({ topic, onReply }: { topic: Topic; onReply: () => void }) {
  const p = projectOf(topic.project)!;
  const owner = userOf(p.owner)!;
  const mine = p.owner === ME;
  const phase = phaseLabel(currentPhase(showcaseOf(p).milestones));
  const taker = topic.replies.length ? userOf(topic.replies[topic.replies.length - 1].author) : undefined;

  return (
    <motion.article layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar initials={owner.initials} tone={owner.tone} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px]">
            <Link href={`/u/${owner.handle}`} className="font-bold hover:underline">
              {mine ? "Bạn" : owner.name}
            </Link>{" "}
            <span className="text-moss">{topic.opened}</span>
          </p>
          <Link href={`/p/${p.slug}#trao-doi`} className="block truncate text-sm font-semibold text-leaf-deep hover:underline">
            {p.title}
          </Link>
        </div>
        <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[13px] font-bold">{phase}</span>
      </div>
      <div className="mt-3.5">
        <TopicMeta topic={topic} />
      </div>
      <h2 className="mt-3 font-display text-xl font-bold leading-snug tracking-[-0.01em]">{topic.question}</h2>
      {topic.detail && <p className="mt-2 line-clamp-2 max-w-[68ch] text-[15px] leading-relaxed text-moss">{topic.detail}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-3.5">
        {topic.status === "active" && taker ? (
          <span className="flex items-center gap-2 text-sm text-moss">
            <Avatar initials={taker.initials} tone={taker.tone} size={26} />
            <span>
              <strong className="text-ink">{taker.handle === ME ? "Bạn" : taker.name}</strong> đang tham gia
              {topic.replies.length > 1 ? ` cùng ${topic.replies.length - 1} người khác` : ""}
            </span>
          </span>
        ) : (
          <span className="text-sm text-moss">Còn {topic.daysLeft} ngày, chưa ai tham gia</span>
        )}
        <span className="flex-1" />
        <Link href={`/p/${p.slug}#trao-doi`} className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[15px] font-bold hover:bg-mist">
          Xem chi tiết
        </Link>
        {!mine && (
          <button type="button" onClick={onReply} className="inline-flex h-10 items-center rounded-lg bg-leaf px-4 text-[15px] font-bold text-ink hover:bg-[#6ee04d]">
            {topic.status === "active" ? "Góp thêm ý" : "Góp ý kiến"}
          </button>
        )}
      </div>
    </motion.article>
  );
}

/** Tab Trao đổi: các chủ đề đang mở của dự án làm dở, lọc theo kiểu trao đổi và ngành. */
export function ExchangeBoard() {
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  const [kind, setKind] = useState<TopicKind | "Tất cả">("Tất cả");
  const [field, setField] = useState<string>("Tất cả");
  const [replying, setReplying] = useState<Topic | null>(null);
  const [opening, setOpening] = useState(false);
  const mine = projectsBy(ME).filter((p) => p.owner === ME);

  const live = topics.filter((t) => t.status !== "done");
  const shown = live.filter((t) => (kind === "Tất cả" || t.kind === kind) && (field === "Tất cả" || projectOf(t.project)?.field === field));
  const myTopics = live.filter((t) => ownerOf(t) === ME);
  const given = contributionsBy(ME);

  const reply = (t: Topic, text: string, credit: boolean) =>
    setTopics((all) =>
      all.map((x) => (x.id === t.id ? { ...x, status: "active", replies: [...x.replies, { id: `r-${Date.now()}`, author: ME, text, when: "vừa xong", credit }] } : x)),
    );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-3">
        <header className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.8rem,3vw,2.2rem)] font-bold leading-none tracking-[-0.04em]">Trao đổi</h1>
              <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-moss">
                Dự án đang làm dở cần thêm một góc nhìn. Góp ý được chủ dự án áp dụng sẽ ghi tên bạn vào dự án.
              </p>
            </div>
            {mine.length > 0 && (
              <button type="button" onClick={() => setOpening(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]">
                <Plus className="h-[18px] w-[18px]" aria-hidden="true" /> Mở trao đổi cho dự án
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Kiểu trao đổi" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
              {(["Tất cả", ...TOPIC_KINDS.map((k) => k.kind)] as const).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => setKind(k)}
                  className={`h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors ${kind === k ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <label className="ml-auto">
              <span className="sr-only">Ngành</span>
              <select value={field} onChange={(e) => setField(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink">
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f === "Tất cả" ? "Tất cả ngành" : f}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((t) => (
            <TopicCard key={t.id} topic={t} onReply={() => setReplying(t)} />
          ))}
        </AnimatePresence>
        {shown.length === 0 && (
          <div className="rounded-xl border border-line bg-white px-6 py-12 text-center">
            <p className="font-semibold">Chưa có chủ đề nào ở mục này</p>
            <p className="mt-1 text-sm text-moss">Thử chọn kiểu trao đổi khác hoặc xem tất cả ngành.</p>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px]">
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Chủ đề của bạn</h2>
          {myTopics.length ? (
            <ul className="mt-2.5 flex flex-col">
              {myTopics.map((t) => (
                <li key={t.id} className="border-t border-line py-2.5 first:border-t-0 first:pt-0">
                  <Link href={`/p/${t.project}#trao-doi`} className="text-[15px] font-semibold leading-snug hover:underline">
                    {t.question}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-moss">
                    {t.replies.length ? `${t.replies.length} góp ý` : "Chưa có góp ý"}, còn {t.daysLeft} ngày
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-moss">Bạn chưa mở chủ đề nào.</p>
          )}
          <p className="mt-2 text-[13px] leading-snug text-moss">
            Mỗi dự án mở được tối đa {MAX_OPEN_TOPICS} chủ đề, tự đóng sau {TOPIC_DAYS} ngày.
          </p>
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Bạn đã góp sức</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            <strong className="font-display text-xl">{given.length}</strong> góp ý được áp dụng trong {new Set(given.map((g) => g.topic.project)).size} dự án.
          </p>
          <Link href={`/u/${ME}#gioi-thieu`} className="mt-2 inline-block text-sm font-bold text-leaf-deep hover:underline">
            Xem trên hồ sơ
          </Link>
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Cách hoạt động</h2>
          <ol className="mt-2 list-decimal pl-[18px] text-sm leading-relaxed text-moss">
            <li>Chọn một chủ đề hợp với bạn.</li>
            <li>Gửi góp ý, tệp hoặc link.</li>
            <li>Chủ dự án áp dụng thì tên bạn vào Người đóng góp và Hành trình của dự án.</li>
          </ol>
        </section>
      </aside>

      {replying && (
        <ReplyDialog
          open={!!replying}
          onClose={() => setReplying(null)}
          topic={replying}
          ownerName={userOf(ownerOf(replying) ?? "")?.name ?? ""}
          onSend={(text, credit) => reply(replying, text, credit)}
        />
      )}
      {mine.length > 0 && (
        <OpenTopicDialog
          open={opening}
          onClose={() => setOpening(false)}
          project={mine[0]}
          choices={mine}
          versionsOf={versionsOf}
          onCreate={(t) => setTopics((all) => [t, ...all])}
        />
      )}
    </div>
  );
}

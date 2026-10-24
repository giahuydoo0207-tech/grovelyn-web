"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { FIELDS, LENSES, ME, projectOf, projectsBy, userOf, type Lens } from "@/lib/data";
import { MAX_OPEN_TOPICS, TOPIC_DAYS, TOPIC_KINDS, canManage, contributionsBy, fitsMe, type Topic, type TopicKind } from "@/lib/exchange";
import { addTopic, updateTopic, useTopics } from "@/lib/topicStore";
import { Avatar } from "@/components/Avatar";
import { OpenTopicDialog, ReplyDialog } from "@/components/exchange/Dialogs";
import { StatusPill, TopicMeta } from "@/components/exchange/TopicParts";

type LensFilter = "Tất cả" | "Hợp với bạn" | Lens;

function TopicCard({ topic, onReply }: { topic: Topic; onReply: () => void }) {
  const p = projectOf(topic.project)!;
  const lead = userOf(topic.lead)!;
  const managed = canManage(topic);
  const n = topic.replies.length;

  return (
    <article className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar initials={lead.initials} tone={lead.tone} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px]">
            <Link href={`/u/${lead.handle}`} className="font-bold hover:underline">
              {lead.handle === ME ? "Bạn" : lead.name}
            </Link>{" "}
            <span className="text-moss">{lead.intro}</span>
          </p>
          <Link href={`/p/${p.slug}`} className="block truncate text-sm font-semibold text-leaf-deep hover:underline">
            {p.title}
          </Link>
        </div>
      </div>
      <div className="mt-3.5">
        <TopicMeta topic={topic} status={false} />
      </div>
      <h2 className="mt-3 font-display text-xl font-bold leading-snug tracking-[-0.01em]">
        <Link href={`/exchange/${topic.id}`} className="hover:underline">
          {topic.question}
        </Link>
      </h2>
      {topic.detail && <p className="mt-2 line-clamp-2 max-w-[68ch] text-[15px] leading-relaxed text-moss">{topic.detail}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-3.5">
        <span className="text-sm text-moss">
          {topic.opened === "vừa xong" ? "Mới mở" : `Mở ${topic.opened}`}, {n ? `${n} góp ý` : "đang chờ góp ý đầu tiên"}
          {topic.outsider && ", người ngoài ngành góp được"}
        </span>
        <span className="flex-1" />
        <Link href={`/exchange/${topic.id}`} className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[15px] font-bold hover:bg-mist">
          Xem chi tiết
        </Link>
        {!managed && (
          <button type="button" onClick={onReply} className="inline-flex h-10 items-center rounded-lg bg-leaf px-4 text-[15px] font-bold text-ink hover:bg-[#6ee04d]">
            Góp ý kiến
          </button>
        )}
      </div>
    </article>
  );
}

/** Tab Trao đổi: chủ đề đang mở của các dự án, lọc theo hình thức, góc nhìn cần nhận và lĩnh vực. */
export function ExchangeBoard() {
  const topics = useTopics();
  const me = userOf(ME)!;
  const [kind, setKind] = useState<TopicKind | "Tất cả">("Tất cả");
  const [lens, setLens] = useState<LensFilter>("Tất cả");
  const [field, setField] = useState<string>("Tất cả");
  const [replying, setReplying] = useState<Topic | null>(null);
  const [opening, setOpening] = useState(false);
  const mine = projectsBy(ME);

  const live = topics.filter((t) => t.status === "open");
  const shown = live.filter(
    (t) =>
      (kind === "Tất cả" || t.kind === kind) &&
      (lens === "Tất cả" || (lens === "Hợp với bạn" ? fitsMe(t) : t.lenses.includes(lens))) &&
      (field === "Tất cả" || projectOf(t.project)?.field === field),
  );
  const closed = topics.filter((t) => t.status === "closed").slice(0, 3);
  const myTopics = live.filter((t) => canManage(t));
  const given = contributionsBy(ME);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-3">
        <header className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.8rem,3vw,2.2rem)] font-bold leading-none tracking-[-0.04em]">Trao đổi</h1>
              <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-moss">
                Dự án đang làm dở cần thêm một góc nhìn. Góp ý được áp dụng sẽ ghi tên bạn vào dự án.
              </p>
            </div>
            {mine.length > 0 && (
              <button type="button" onClick={() => setOpening(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]">
                <Plus className="h-[18px] w-[18px]" aria-hidden="true" /> Mở trao đổi
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Hình thức" className="flex gap-2">
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
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <label>
                <span className="sr-only">Góc nhìn cần nhận</span>
                <select value={lens} onChange={(e) => setLens(e.target.value as LensFilter)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink">
                  <option value="Tất cả">Mọi góc nhìn</option>
                  {me.lenses.length > 0 && <option value="Hợp với bạn">Hợp với bạn</option>}
                  {LENSES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Lĩnh vực</span>
                <select value={field} onChange={(e) => setField(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink">
                  {FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f === "Tất cả" ? "Mọi lĩnh vực" : f}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </header>

        {shown.map((t) => (
          <TopicCard key={t.id} topic={t} onReply={() => setReplying(t)} />
        ))}
        {shown.length === 0 && (
          <div className="rounded-xl border border-line bg-white px-6 py-12 text-center">
            <p className="font-semibold">Chưa có trao đổi nào ở mục này</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm text-moss">
              Thử bỏ bớt bộ lọc, hoặc xem các dự án đã công bố trên{" "}
              <Link href="/community" className="font-semibold text-leaf-deep hover:underline">
                Trang chủ
              </Link>{" "}
              và để lại bình luận.
            </p>
          </div>
        )}

        {closed.length > 0 && (
          <section aria-labelledby="da-dong" className="mt-3">
            <h2 id="da-dong" className="px-1 pb-2 text-sm font-semibold text-moss">
              Đã đóng gần đây
            </h2>
            <ul className="flex flex-col gap-2">
              {closed.map((t) => {
                const applied = t.replies.filter((r) => r.applied).length;
                return (
                  <li key={t.id}>
                    <Link href={`/exchange/${t.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 hover:bg-mist">
                      <StatusPill topic={t} />
                      <span className="min-w-0 flex-1 text-[15px] font-semibold">{t.question}</span>
                      {applied > 0 && <span className="text-sm text-moss">{applied} góp ý được áp dụng</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px]">
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Trao đổi của bạn</h2>
          {myTopics.length ? (
            <ul className="mt-2.5 flex flex-col">
              {myTopics.map((t) => (
                <li key={t.id} className="border-t border-line py-2.5 first:border-t-0 first:pt-0">
                  <Link href={`/exchange/${t.id}`} className="text-[15px] font-semibold leading-snug hover:underline">
                    {t.question}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-moss">
                    {t.replies.length ? `${t.replies.length} góp ý` : "Chưa có góp ý"}, còn {t.daysLeft} ngày
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-moss">Bạn chưa mở trao đổi nào.</p>
          )}
          <p className="mt-2 text-[13px] leading-snug text-moss">
            Mỗi dự án mở tối đa {MAX_OPEN_TOPICS} trao đổi, tự đóng sau {TOPIC_DAYS} ngày.
          </p>
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Bạn có thể góp ý về</h2>
          {me.lenses.length ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {me.lenses.map((l) => (
                <li key={l} className="rounded-full bg-sap px-3 py-1 text-[13px] font-semibold text-leaf-deep">
                  {l}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-moss">Chưa chọn góc nhìn nào.</p>
          )}
          <p className="mt-2.5 text-[13px] leading-snug text-moss">Trao đổi mới cần đúng góc nhìn này sẽ được gửi tới bạn.</p>
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Góp ý của bạn đã được áp dụng</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            <strong className="font-display text-xl">{given.length}</strong> góp ý trong {new Set(given.map((g) => g.topic.project)).size} dự án.
          </p>
          <Link href={`/u/${ME}#gioi-thieu`} className="mt-2 inline-block text-sm font-bold text-leaf-deep hover:underline">
            Xem trên hồ sơ
          </Link>
        </section>
      </aside>

      {replying && (
        <ReplyDialog
          open={!!replying}
          onClose={() => setReplying(null)}
          topic={replying}
          onSend={(text, credit) =>
            updateTopic(replying.id, (x) => ({ ...x, replies: [...x.replies, { id: `r-${Date.now()}`, author: ME, text, when: "vừa xong", credit, answers: [] }] }))
          }
        />
      )}
      {mine.length > 0 && <OpenTopicDialog open={opening} onClose={() => setOpening(false)} project={mine[0]} choices={mine} onCreate={addTopic} />}
    </div>
  );
}

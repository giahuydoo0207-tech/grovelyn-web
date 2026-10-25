"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, CornerDownRight } from "lucide-react";
import { ME, projectOf, userOf } from "@/lib/data";
import {
  CLOSE_REASONS,
  TOPIC_DAYS,
  canManage,
  type CloseReason,
  type Reply,
} from "@/lib/exchange";
import { updateTopic, useTopics } from "@/lib/topicStore";
import { Avatar } from "@/components/Avatar";
import { ReplyDialog } from "@/components/exchange/Dialogs";
import { TopicMeta } from "@/components/exchange/TopicParts";
import { MediaGrid } from "@/components/MediaGrid";
import { AnimatePresence, motion } from "motion/react";

/** Chi tiết một trao đổi. Đây là bản ghi duy nhất: tab Trao đổi và trang dự án đều dẫn về đây. */
export function TopicDetail({ id }: { id: string }) {
  const topics = useTopics();
  const topic = topics.find((t) => t.id === id);
  const [replying, setReplying] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [reason, setReason] = useState<CloseReason>("Đã giải quyết");

  if (!topic) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center">
        <p className="font-display text-2xl font-bold">
          Không tìm thấy trao đổi này
        </p>
        <p className="mt-2 text-moss">
          Trao đổi có thể đã bị xoá, hoặc chỉ tồn tại trong phiên trước.
        </p>
        <Link
          href="/exchange"
          className="mt-5 inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink"
        >
          Về tab Trao đổi
        </Link>
      </div>
    );
  }

  const p = projectOf(topic.project)!;
  const lead = userOf(topic.lead)!;
  const managed = canManage(topic);
  const open = topic.status === "open";
  const latest = p.versions[0]?.tag ?? topic.version;
  const patchReply = (rid: string, fn: (r: Reply) => Reply) =>
    updateTopic(topic.id, (t) => ({
      ...t,
      replies: t.replies.map((r) => (r.id === rid ? fn(r) : r)),
    }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/exchange"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tab Trao đổi
      </Link>

      <article className="rounded-xl border border-line bg-white p-5 sm:p-7">
        <p className="text-sm text-moss">
          Dự án{" "}
          <Link
            href={`/p/${p.slug}`}
            className="font-semibold text-leaf-deep hover:underline"
          >
            {p.title}
          </Link>
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-[-0.03em]">
          {topic.question}
        </h1>
        <div className="mt-4">
          <TopicMeta topic={topic} />
        </div>
        {topic.detail && (
          <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-ink/85">
            {topic.detail}
          </p>
        )}
        {topic.media.length > 0 && (
          <div className="mt-5">
            <MediaGrid media={topic.media} />
          </div>
        )}
        <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-moss">Người phụ trách</dt>
            <dd className="mt-1 flex items-center gap-2 font-semibold">
              <Avatar initials={lead.initials} tone={lead.tone} size={24} />{" "}
              {lead.handle === ME ? "Bạn" : lead.name}
            </dd>
          </div>
          <div>
            <dt className="text-moss">Mở</dt>
            <dd className="mt-1 font-semibold">{topic.opened}</dd>
          </div>
          <div>
            <dt className="text-moss">{open ? "Tự đóng sau" : "Kết thúc"}</dt>
            <dd className="mt-1 font-semibold">
              {open ? `${topic.daysLeft} ngày` : topic.closeReason}
            </dd>
          </div>
        </dl>
        {topic.outsider && (
          <p className="mt-3 text-sm text-moss">
            Người mở muốn nghe cả góc nhìn ngoài ngành.
          </p>
        )}
      </article>

      {managed && open && (
        <section
          aria-label="Quản lý trao đổi"
          className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-5 py-4"
        >
          <p className="mr-auto text-sm text-moss">
            Bạn là người phụ trách. Áp dụng từng góp ý riêng, đóng khi xong.
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="sr-only">Lý do đóng</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as CloseReason)}
              className="h-10 rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
            >
              {CLOSE_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              updateTopic(topic.id, (t) => ({
                ...t,
                status: "closed",
                closeReason: reason,
              }))
            }
            className="h-10 rounded-lg bg-ink px-4 text-sm font-bold text-white hover:bg-ink-2"
          >
            Đóng trao đổi
          </button>
        </section>
      )}

      {managed && !open && (
        <section
          aria-label="Mở lại trao đổi"
          className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-5 py-4"
        >
          <p className="mr-auto text-sm text-moss">
            Trao đổi đã đóng. Bạn là người phụ trách, mở lại được nếu cần thêm
            góp ý.
          </p>
          <button
            type="button"
            onClick={() =>
              updateTopic(topic.id, (t) => ({
                ...t,
                status: "open",
                closeReason: undefined,
                daysLeft: TOPIC_DAYS,
              }))
            }
            className="h-10 rounded-lg border border-line px-4 text-sm font-bold hover:bg-mist"
          >
            Mở lại {TOPIC_DAYS} ngày
          </button>
        </section>
      )}

      <section
        aria-labelledby="gop-y"
        className="rounded-xl border border-line bg-white p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="gop-y" className="font-display text-xl font-bold">
            {topic.replies.length
              ? `${topic.replies.length} góp ý`
              : "Chưa có góp ý"}
          </h2>
          {open && !managed && (
            <button
              type="button"
              onClick={() => setReplying(true)}
              className="inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]"
            >
              Góp ý kiến
            </button>
          )}
        </div>
        {topic.replies.length === 0 && (
          <p className="mt-2 text-[15px] text-moss">
            {managed
              ? "Trao đổi đã được gửi tới những người chọn đúng góc nhìn. Góp ý sẽ hiện ở đây."
              : "Bạn là người đầu tiên góp ý."}
          </p>
        )}
        <ul className="mt-2">
          <AnimatePresence initial={false}>
            {topic.replies.map((r) => {
              const u = userOf(r.author);
              if (!u) return null;
              const mineReply = r.author === ME;
              return (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-3 border-t border-line py-5 first:border-t-0"
                >
                  <Avatar initials={u.initials} tone={u.tone} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px]">
                      <Link
                        href={`/u/${u.handle}`}
                        className="font-bold hover:underline"
                      >
                        {mineReply ? "Bạn" : u.name}
                      </Link>{" "}
                      <span className="text-moss">
                        {u.intro}, {r.when}
                      </span>
                    </p>
                    <p className="mt-1.5 max-w-[66ch] text-base leading-relaxed">
                      {r.text}
                    </p>
                    {r.media && r.media.length > 0 && (
                      <div className="mt-3 max-w-[520px]">
                        <MediaGrid media={r.media} compact />
                      </div>
                    )}

                    {/* Bấm "Đã áp dụng" thì nhãn bật ra ngắn; nhãn có sẵn lúc mở trang thì đứng yên. */}
                    <AnimatePresence initial={false}>
                      {r.applied && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.85, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 26,
                          }}
                          className="mt-2.5 inline-flex origin-left items-center gap-1.5 rounded-md bg-sap px-2.5 py-1 text-[13px] font-bold text-leaf-deep"
                        >
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={3}
                            aria-hidden="true"
                          />{" "}
                          Đã áp dụng vào {r.applied}
                          {!r.credit && (
                            <span className="font-normal">
                              , người góp ý không ghi tên
                            </span>
                          )}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {r.answers.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2.5 border-l-2 border-line pl-4">
                        {r.answers.map((a, i) => {
                          const au = userOf(a.author)!;
                          return (
                            <li key={i} className="text-[15px] leading-relaxed">
                              <span className="font-bold">
                                {au.handle === ME ? "Bạn" : au.name}
                              </span>{" "}
                              <span className="text-sm text-moss">
                                {a.when}
                              </span>
                              <p className="mt-0.5">{a.text}</p>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {managed && !r.applied && (
                        <button
                          type="button"
                          onClick={() =>
                            patchReply(r.id, (x) => ({ ...x, applied: latest }))
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-sm font-bold text-white hover:bg-ink-2"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" /> Đã áp
                          dụng vào {latest}
                        </button>
                      )}
                      {(managed || mineReply) &&
                        open &&
                        r.answers.length < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnswering(answering === r.id ? null : r.id);
                              setAnswer("");
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3.5 text-sm font-bold hover:bg-mist"
                          >
                            <CornerDownRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />{" "}
                            Trả lời
                          </button>
                        )}
                      {mineReply && r.applied && (
                        <button
                          type="button"
                          onClick={() =>
                            patchReply(r.id, (x) => ({
                              ...x,
                              credit: !x.credit,
                            }))
                          }
                          className="inline-flex h-9 items-center rounded-lg px-2 text-sm font-semibold text-moss hover:text-ink"
                        >
                          {r.credit ? "Rút ghi công" : "Ghi tên lại"}
                        </button>
                      )}
                    </div>

                    {answering === r.id && (
                      <form
                        className="mt-3 flex flex-col gap-2 sm:flex-row"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!answer.trim()) return;
                          patchReply(r.id, (x) => ({
                            ...x,
                            answers: [
                              ...x.answers,
                              {
                                author: ME,
                                text: answer.trim(),
                                when: "vừa xong",
                              },
                            ],
                          }));
                          setAnswering(null);
                        }}
                      >
                        <label className="flex-1">
                          <span className="sr-only">Trả lời {u.name}</span>
                          <input
                            autoFocus
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={`Trả lời ${mineReply ? "người phụ trách" : u.name}`}
                            className="h-11 w-full rounded-lg border border-line px-3.5 text-[15px] outline-none focus:border-ink"
                          />
                        </label>
                        <button
                          type="submit"
                          className="h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white hover:bg-ink-2"
                        >
                          Gửi trả lời
                        </button>
                      </form>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </section>

      {replying && (
        <ReplyDialog
          open={replying}
          onClose={() => setReplying(false)}
          topic={topic}
          onSend={(text, credit, media) =>
            updateTopic(topic.id, (t) => ({
              ...t,
              replies: [
                ...t.replies,
                {
                  id: `r-${Date.now()}`,
                  author: ME,
                  text,
                  media,
                  when: "vừa xong",
                  credit,
                  answers: [],
                },
              ],
            }))
          }
        />
      )}
    </div>
  );
}

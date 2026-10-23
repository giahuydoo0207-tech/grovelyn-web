"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { ME, userOf, type Project } from "@/lib/data";
import { MAX_OPEN_TOPICS, STATUS_LABEL, TOPIC_DAYS, topicsOf, type Topic, type TopicStatus } from "@/lib/exchange";
import { Avatar } from "@/components/Avatar";
import { OpenTopicDialog, ReplyDialog } from "./Dialogs";
import { StatusPill, TopicMeta } from "./TopicParts";

const STEPS: TopicStatus[] = ["open", "active", "done"];

/** Mục Trao đổi trên trang dự án: chủ đề đang mở kèm góp ý, chủ đề đã giải quyết thu gọn. */
export function ProjectExchange({ project, canEdit }: { project: Project; canEdit: boolean }) {
  const [topics, setTopics] = useState<Topic[]>(() => topicsOf(project.slug));
  const [opening, setOpening] = useState(false);
  const [replying, setReplying] = useState<Topic | null>(null);
  const live = topics.filter((t) => t.status !== "done");
  const done = topics.filter((t) => t.status === "done");
  const latest = project.versions[0]?.tag ?? "v1";
  const owner = userOf(project.owner);

  const update = (id: string, fn: (t: Topic) => Topic) => setTopics((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  const apply = (t: Topic, replyId: string) =>
    update(t.id, (x) => ({ ...x, status: "done", replies: x.replies.map((r) => (r.id === replyId ? { ...r, applied: latest } : r)) }));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">Trao đổi</h2>
          <p className="mt-1 text-sm text-moss">
            {live.length} đang mở, {done.length} đã giải quyết
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setOpening(true)}
            disabled={live.length >= MAX_OPEN_TOPICS}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d] disabled:cursor-not-allowed disabled:bg-mist disabled:text-moss"
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden="true" /> Mở trao đổi
          </button>
        )}
      </div>
      {canEdit && live.length >= MAX_OPEN_TOPICS && (
        <p className="text-sm text-moss">Dự án đang mở đủ {MAX_OPEN_TOPICS} chủ đề. Giải quyết một chủ đề để mở chủ đề mới.</p>
      )}

      {topics.length === 0 && (
        <div className="rounded-xl border border-line bg-white px-6 py-10 text-center">
          <p className="font-semibold">Dự án chưa mở trao đổi nào</p>
          <p className="mx-auto mt-1 max-w-[44ch] text-sm text-moss">
            {canEdit ? "Đang phân vân điều gì, mở một chủ đề để người cùng ngành cho ý kiến." : "Khi chủ dự án cần góp ý, chủ đề sẽ hiện ở đây."}
          </p>
        </div>
      )}

      {live.map((t) => {
        const reached = STEPS.indexOf(t.status);
        return (
          <article key={t.id} className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <TopicMeta topic={t} />
              <span className="ml-auto text-[13px] text-moss">
                Mở {t.opened}, tự đóng sau {t.daysLeft} ngày
              </span>
            </div>
            <h3 className="mt-3.5 font-display text-2xl font-bold leading-tight tracking-[-0.02em]">{t.question}</h3>
            {t.detail && <p className="mt-2.5 max-w-[66ch] text-base leading-relaxed text-ink/85">{t.detail}</p>}
            <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Tiến độ chủ đề">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-col gap-2" aria-current={i === reached ? "step" : undefined}>
                  <span className={`h-[5px] rounded-full ${i <= reached ? "bg-leaf" : "bg-line"}`} />
                  <span className={`text-[13px] font-bold ${i <= reached ? "text-ink" : "text-moss"}`}>{STATUS_LABEL[s]}</span>
                </li>
              ))}
            </ol>

            <h4 className="mt-6 font-bold">{t.replies.length ? `${t.replies.length} góp ý` : "Chưa có góp ý"}</h4>
            <ul className="mt-1">
              {t.replies.map((r) => {
                const u = userOf(r.author);
                if (!u) return null;
                return (
                  <li key={r.id} className="flex gap-3 border-t border-line py-4 first:mt-2">
                    <Avatar initials={u.initials} tone={u.tone} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px]">
                        <Link href={`/u/${u.handle}`} className="font-bold hover:underline">
                          {u.handle === ME ? "Bạn" : u.name}
                        </Link>{" "}
                        <span className="text-moss">{r.when}</span>
                      </p>
                      <p className="mt-1.5 max-w-[66ch] text-base leading-relaxed">{r.text}</p>
                      {canEdit && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => apply(t, r.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-sm font-bold text-white hover:bg-ink-2">
                            <Check className="h-4 w-4" aria-hidden="true" /> Đã áp dụng vào {latest}
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {!canEdit && (
              <div className="mt-2 flex justify-end border-t border-line pt-4">
                <button type="button" onClick={() => setReplying(t)} className="inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]">
                  {t.replies.length ? "Góp thêm ý" : "Góp ý kiến"}
                </button>
              </div>
            )}
          </article>
        );
      })}

      {done.map((t) => {
        const used = t.replies.find((r) => r.applied);
        const by = used ? userOf(used.author) : undefined;
        return (
          <article key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4">
            <StatusPill status="done" />
            <p className="min-w-0 flex-1 text-[15px]">
              <strong>{t.question}</strong>
              {used && by && (
                <span className="text-moss">
                  {" "}
                  Áp dụng góp ý của {by.handle === ME ? "bạn" : by.name} ở bản {used.applied}.
                </span>
              )}
            </p>
          </article>
        );
      })}

      {canEdit && (
        <OpenTopicDialog
          open={opening}
          onClose={() => setOpening(false)}
          project={project}
          versionsOf={(p) => p.versions.map((v) => v.tag)}
          onCreate={(t) => setTopics((all) => [t, ...all])}
        />
      )}
      {replying && (
        <ReplyDialog
          open={!!replying}
          onClose={() => setReplying(null)}
          topic={replying}
          ownerName={owner?.name ?? ""}
          onSend={(text, credit) =>
            update(replying.id, (x) => ({ ...x, status: "active", replies: [...x.replies, { id: `r-${Date.now()}`, author: ME, text, when: "vừa xong", credit }] }))
          }
        />
      )}
      <p className="text-[13px] text-moss">Mỗi dự án mở được tối đa {MAX_OPEN_TOPICS} chủ đề cùng lúc, chủ đề tự đóng sau {TOPIC_DAYS} ngày nếu chưa giải quyết.</p>
    </section>
  );
}

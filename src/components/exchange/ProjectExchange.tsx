"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Project } from "@/lib/data";
import { MAX_OPEN_TOPICS, TOPIC_DAYS } from "@/lib/exchange";
import { addTopic, useTopics } from "@/lib/topicStore";
import { OpenTopicDialog } from "./Dialogs";
import { StatusPill, TopicMeta } from "./TopicParts";

/** Mục Trao đổi trên trang dự án: chỉ liệt kê và dẫn về trang chi tiết, không tạo hội thoại thứ hai. */
export function ProjectExchange({ project, canEdit }: { project: Project; canEdit: boolean }) {
  const topics = useTopics().filter((t) => t.project === project.slug);
  const [opening, setOpening] = useState(false);
  const live = topics.filter((t) => t.status === "open");
  const closed = topics.filter((t) => t.status === "closed");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em]">Trao đổi</h2>
          <p className="mt-1 text-sm text-moss">
            {live.length} đang mở, {closed.length} đã đóng
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
      {canEdit && live.length >= MAX_OPEN_TOPICS && <p className="text-sm text-moss">Dự án đang mở đủ {MAX_OPEN_TOPICS} trao đổi. Đóng một trao đổi để mở cái mới.</p>}

      {topics.length === 0 && (
        <div className="rounded-xl border border-line bg-white px-6 py-10 text-center">
          <p className="font-semibold">Dự án chưa mở trao đổi nào</p>
          <p className="mx-auto mt-1 max-w-[44ch] text-sm text-moss">
            {canEdit ? "Đang phân vân điều gì, mở một trao đổi để người có đúng góc nhìn cho ý kiến." : "Khi chủ dự án cần góp ý, trao đổi sẽ hiện ở đây."}
          </p>
        </div>
      )}

      {live.map((t) => (
        <Link key={t.id} href={`/exchange/${t.id}`} className="group rounded-xl border border-line bg-white p-5 transition-colors hover:border-ink/30">
          <TopicMeta topic={t} />
          <h3 className="mt-3 font-display text-xl font-bold leading-snug group-hover:underline">{t.question}</h3>
          <p className="mt-2 text-sm text-moss">
            {t.replies.length ? `${t.replies.length} góp ý` : "Chưa có góp ý"}, {t.replies.filter((r) => r.applied).length} đã áp dụng, còn {t.daysLeft} ngày
          </p>
        </Link>
      ))}

      {closed.map((t) => {
        const applied = t.replies.filter((r) => r.applied).length;
        return (
          <Link key={t.id} href={`/exchange/${t.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4 hover:bg-mist">
            <StatusPill topic={t} />
            <span className="min-w-0 flex-1 text-[15px] font-semibold">{t.question}</span>
            {applied > 0 && <span className="text-sm text-moss">{applied} góp ý được áp dụng</span>}
          </Link>
        );
      })}

      {canEdit && <OpenTopicDialog open={opening} onClose={() => setOpening(false)} project={project} onCreate={addTopic} />}
      <p className="text-[13px] text-moss">
        Mỗi dự án mở tối đa {MAX_OPEN_TOPICS} trao đổi cùng lúc, tự đóng sau {TOPIC_DAYS} ngày, gia hạn được một lần.
      </p>
    </section>
  );
}

import { STATUS_LABEL, type Topic, type TopicStatus } from "@/lib/exchange";

const STATUS_STYLE: Record<TopicStatus, { box: string; dot: string }> = {
  open: { box: "bg-sap text-leaf-deep", dot: "bg-leaf" },
  active: { box: "bg-[#fef3c7] text-[#7a4a06]", dot: "bg-[#c2690a]" },
  done: { box: "bg-mist text-moss", dot: "bg-moss" },
};

export function StatusPill({ status }: { status: TopicStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-bold ${s.box}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${s.dot}`} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-md px-2.5 text-[13px] font-semibold ${strong ? "bg-sap text-leaf-deep" : "border border-line bg-white"}`}>
      {children}
    </span>
  );
}

/** Trạng thái, kiểu trao đổi, thời gian và phiên bản của một chủ đề. */
export function TopicMeta({ topic, status }: { topic: Topic; status?: TopicStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill status={status ?? topic.status} />
      <Chip strong>{topic.kind}</Chip>
      <Chip>{topic.time === "Một buổi" ? "Một buổi" : `Khoảng ${topic.time}`}</Chip>
      <Chip>Bản {topic.version}</Chip>
    </div>
  );
}

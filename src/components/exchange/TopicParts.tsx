import type { Topic } from "@/lib/exchange";

export function StatusPill({ topic }: { topic: Pick<Topic, "status" | "closeReason"> }) {
  const open = topic.status === "open";
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-bold ${open ? "bg-sap text-leaf-deep" : "bg-mist text-moss"}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${open ? "bg-leaf" : "bg-moss"}`} aria-hidden="true" />
      {open ? "Đang mở" : `Đã đóng${topic.closeReason ? `: ${topic.closeReason.toLowerCase()}` : ""}`}
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

/** Trạng thái, hình thức, góc nhìn cần nhận và phiên bản của một trao đổi. */
export function TopicMeta({ topic, status = true }: { topic: Topic; status?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status && <StatusPill topic={topic} />}
      <Chip strong>{topic.kind}</Chip>
      {topic.lenses.map((l) => (
        <Chip key={l}>{l}</Chip>
      ))}
      <Chip>Bản {topic.version}</Chip>
    </div>
  );
}

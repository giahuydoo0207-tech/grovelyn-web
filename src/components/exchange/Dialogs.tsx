"use client";

import { useState } from "react";
import { Check, Link2, Paperclip } from "lucide-react";
import { userOf, type Project } from "@/lib/data";
import { TOPIC_DAYS, TOPIC_KINDS, TOPIC_TIMES, type Topic, type TopicKind, type TopicTime } from "@/lib/exchange";
import { Modal } from "./Modal";
import { Chip } from "./TopicParts";

const area = "w-full resize-none rounded-lg border border-[#c9d0c4] bg-white px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-ink";
const lab = "mb-2 block text-sm font-bold";
const pick = (on: boolean) =>
  `cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${
    on ? "border-ink bg-[#eef9e7]" : "border-line bg-white hover:border-ink/40"
  }`;

/** Chủ dự án mở một chủ đề trao đổi. */
export function OpenTopicDialog({
  open,
  onClose,
  project: given,
  choices,
  versionsOf,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  /** Khi mở từ tab Trao đổi: cho chọn dự án nào. */
  choices?: Project[];
  versionsOf: (p: Project) => string[];
  onCreate: (t: Topic) => void;
}) {
  const [project, setProject] = useState(given);
  const versions = versionsOf(project);
  const [question, setQuestion] = useState("");
  const [detail, setDetail] = useState("");
  const [kind, setKind] = useState<TopicKind>("Xin ý kiến");
  const [time, setTime] = useState<TopicTime>("15 phút");
  const [version, setVersion] = useState(versions[0] ?? "v1");
  const chooseProject = (slug: string) => {
    const p = choices?.find((c) => c.slug === slug);
    if (!p) return;
    setProject(p);
    setVersion(versionsOf(p)[0] ?? "v1");
  };
  const [error, setError] = useState(false);

  const submit = () => {
    if (!question.trim()) return setError(true);
    onCreate({
      id: `t-${Date.now()}`,
      project: project.slug,
      kind,
      time,
      version,
      question: question.trim(),
      detail: detail.trim(),
      opened: "vừa xong",
      daysLeft: TOPIC_DAYS,
      status: "open",
      replies: [],
    });
    setQuestion("");
    setDetail("");
    setError(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mở trao đổi"
      subtitle={choices && choices.length > 1 ? undefined : project.title}
      footer={
        <>
          <span className="min-w-[12rem] flex-1 text-[13px] leading-snug text-moss">
            Hiện ở tab Trao đổi và gửi tới người cùng ngành. Tự đóng sau {TOPIC_DAYS} ngày nếu chưa giải quyết.
          </span>
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-line bg-white px-4 font-bold hover:bg-mist">
            Huỷ
          </button>
          <button type="button" onClick={submit} className="h-11 rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]">
            Mở trao đổi
          </button>
        </>
      }
    >
      {choices && choices.length > 1 && (
        <label className="block">
          <span className={lab}>Dự án</span>
          <select value={project.slug} onChange={(e) => chooseProject(e.target.value)} className="h-[46px] w-full rounded-lg border border-[#c9d0c4] bg-white px-3 font-semibold outline-none focus:border-ink">
            {choices.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <div>
        <label htmlFor="td-cau-hoi" className={lab}>
          Bạn muốn trao đổi điều gì?
        </label>
        <textarea
          id="td-cau-hoi"
          rows={2}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
          aria-describedby="td-goi-y"
          placeholder="Ví dụ: Giếng trời nên đặt giữa nhà hay cuối nhà?"
          className={area}
        />
        <p id="td-goi-y" className={`mt-1.5 text-[13px] ${error ? "font-semibold text-[#b42318]" : "text-moss"}`}>
          {error ? "Viết câu hỏi trước khi mở trao đổi." : "Viết thành một câu hỏi cụ thể để mọi người dễ cho ý kiến."}
        </p>
      </div>
      <div>
        <label htmlFor="td-chi-tiet" className={lab}>
          Thêm bối cảnh <span className="font-normal text-moss">(không bắt buộc)</span>
        </label>
        <textarea id="td-chi-tiet" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Bạn đã thử gì, đang phân vân giữa những phương án nào" className={area} />
      </div>
      <fieldset>
        <legend className={lab}>Bạn muốn nhận gì</legend>
        <div className="grid grid-cols-2 gap-2">
          {TOPIC_KINDS.map((k) => (
            <label key={k.kind} className={pick(kind === k.kind)}>
              <input type="radio" name="td-kieu" className="sr-only" checked={kind === k.kind} onChange={() => setKind(k.kind)} />
              {k.kind}
              <span className="mt-0.5 block text-xs font-medium text-moss">{k.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className={lab}>Mất khoảng</legend>
          <div className="flex gap-2">
            {TOPIC_TIMES.map((t) => (
              <label key={t} className={`${pick(time === t)} flex-1 whitespace-nowrap text-center`}>
                <input type="radio" name="td-thoi-gian" className="sr-only" checked={time === t} onChange={() => setTime(t)} />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className={lab}>Gắn với bản</span>
          <select value={version} onChange={(e) => setVersion(e.target.value)} className="h-[46px] w-full rounded-lg border border-[#c9d0c4] bg-white px-3 font-semibold outline-none focus:border-ink">
            {versions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}

/** Người tham gia gửi góp ý cho một chủ đề. */
export function ReplyDialog({
  open,
  onClose,
  topic,
  ownerName,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  topic: Topic;
  ownerName: string;
  onSend: (text: string, credit: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [credit, setCredit] = useState(true);
  const [error, setError] = useState(false);

  const send = () => {
    if (!text.trim()) return setError(true);
    onSend(text.trim(), credit);
    setText("");
    setError(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={540}
      title="Gửi góp ý"
      subtitle="Góp ý được áp dụng sẽ ghi tên bạn vào dự án"
      footer={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-line bg-white px-4 font-bold hover:bg-mist">
            Huỷ
          </button>
          <button type="button" onClick={send} className="h-11 rounded-lg bg-leaf px-4 font-bold text-ink hover:bg-[#6ee04d]">
            Gửi góp ý
          </button>
        </>
      }
    >
      <div className="rounded-lg bg-mist px-4 py-3.5">
        <div className="flex flex-wrap gap-2">
          <Chip strong>{topic.kind}</Chip>
          <Chip>Bản {topic.version}</Chip>
        </div>
        <p className="mt-2.5 font-bold leading-snug">{topic.question}</p>
        <p className="mt-1 text-[13px] text-moss">
          {ownerName} mở, {topic.opened}
        </p>
      </div>
      <div>
        <label htmlFor="gy-noi-dung" className={lab}>
          Góp ý của bạn
        </label>
        <textarea
          id="gy-noi-dung"
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
          className={area}
          placeholder="Nói rõ bạn đề xuất gì và vì sao"
        />
        {error && <p className="mt-1.5 text-[13px] font-semibold text-[#b42318]">Viết góp ý trước khi gửi.</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-bold hover:bg-mist">
          <Paperclip className="h-4 w-4" aria-hidden="true" /> Ảnh hoặc tệp
        </button>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-bold hover:bg-mist">
          <Link2 className="h-4 w-4" aria-hidden="true" /> Link
        </button>
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed">
        <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} className="peer sr-only" />
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border border-[#c9d0c4] bg-white peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-leaf-deep">
          {credit && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
        </span>
        Nếu được áp dụng, ghi tên tôi vào Người đóng góp và Hành trình của dự án
      </label>
    </Modal>
  );
}

export const nameOf = (handle?: string) => (handle ? userOf(handle)?.name ?? handle : "");

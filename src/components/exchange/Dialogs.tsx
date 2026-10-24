"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { LENSES, ME, userOf, type Lens, type Project } from "@/lib/data";
import { MAX_LENSES, TOPIC_DAYS, TOPIC_KINDS, type Topic, type TopicKind } from "@/lib/exchange";
import type { Media } from "@/lib/media";
import { MediaPicker } from "@/components/MediaGrid";
import { Modal } from "./Modal";
import { Chip } from "./TopicParts";

const area = "w-full resize-none rounded-lg border border-[#c9d0c4] bg-white px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-ink";
const lab = "mb-2 block text-sm font-bold";
const pick = (on: boolean) =>
  `cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${
    on ? "border-ink bg-[#eef9e7]" : "border-line bg-white hover:border-ink/40"
  }`;

function Box({ on }: { on: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-leaf-deep ${on ? "border-ink bg-ink" : "border-[#c9d0c4] bg-white"}`}
    >
      {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
    </span>
  );
}

/** Chủ dự án hoặc thành viên mở một trao đổi: bốn ô chính, bối cảnh nằm trong phần mở rộng. */
export function OpenTopicDialog({
  open,
  onClose,
  project: given,
  choices,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  /** Khi mở từ tab Trao đổi: cho chọn dự án nào. */
  choices?: Project[];
  onCreate: (t: Topic) => void;
}) {
  const [project, setProject] = useState(given);
  const versions = project.versions.map((v) => v.tag);
  const [question, setQuestion] = useState("");
  const [detail, setDetail] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [kind, setKind] = useState<TopicKind>("Xin góp ý");
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [outsider, setOutsider] = useState(false);
  const [version, setVersion] = useState(versions[0] ?? "v1");
  const [error, setError] = useState(false);

  const toggleLens = (l: Lens) =>
    setLenses((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : cur.length < MAX_LENSES ? [...cur, l] : cur));

  const submit = () => {
    if (!question.trim()) return setError(true);
    onCreate({
      id: `t-${Date.now()}`,
      project: project.slug,
      kind,
      lenses,
      outsider,
      version,
      question: question.trim(),
      detail: detail.trim(),
      media,
      lead: ME,
      opened: "vừa xong",
      daysLeft: TOPIC_DAYS,
      extended: false,
      status: "open",
      replies: [],
    });
    setQuestion("");
    setDetail("");
    setMedia([]);
    setLenses([]);
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
            Gửi tới người chọn đúng góc nhìn. Tự đóng sau {TOPIC_DAYS} ngày, gia hạn được một lần.
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
          <select
            value={project.slug}
            onChange={(e) => {
              const p = choices.find((c) => c.slug === e.target.value);
              if (!p) return;
              setProject(p);
              setVersion(p.versions[0]?.tag ?? "v1");
            }}
            className="h-[46px] w-full rounded-lg border border-[#c9d0c4] bg-white px-3 font-semibold outline-none focus:border-ink"
          >
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
          Bạn muốn hỏi điều gì?
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
          {error ? "Viết câu hỏi trước khi mở trao đổi." : "Một câu hỏi cụ thể, trả lời được trong một lần đọc."}
        </p>
      </div>
      <div>
        <span className={lab}>
          Ảnh hoặc video của bản đang hỏi <span className="font-normal text-moss">(nên có)</span>
        </span>
        <MediaPicker value={media} onChange={setMedia} label="Thêm ảnh, video" />
      </div>
      <fieldset>
        <legend className={lab}>Hình thức</legend>
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
      <fieldset>
        <legend className={lab}>
          Góc nhìn cần nhận <span className="font-normal text-moss">(tối đa {MAX_LENSES})</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {LENSES.map((l) => {
            const on = lenses.includes(l);
            const full = !on && lenses.length >= MAX_LENSES;
            return (
              <label
                key={l}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${
                  on ? "cursor-pointer border-ink bg-sap/60" : full ? "cursor-not-allowed border-line text-moss/60" : "cursor-pointer border-line hover:bg-mist"
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} disabled={full} onChange={() => toggleLens(l)} />
                {l}
              </label>
            );
          })}
        </div>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm">
          <input type="checkbox" className="peer sr-only" checked={outsider} onChange={(e) => setOutsider(e.target.checked)} />
          <Box on={outsider} />
          Người ngoài ngành cũng góp được
        </label>
      </fieldset>
      <label className="block">
        <span className={lab}>Gắn với bản</span>
        <select value={version} onChange={(e) => setVersion(e.target.value)} className="h-[46px] w-full rounded-lg border border-[#c9d0c4] bg-white px-3 font-semibold outline-none focus:border-ink">
          {versions.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <details className="rounded-lg border border-line px-4 py-3 [&_summary]:cursor-pointer">
        <summary className="text-sm font-bold">Thêm bối cảnh</summary>
        <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Bạn đã thử gì, đang phân vân giữa những phương án nào" aria-label="Bối cảnh" className={`${area} mt-3`} />
      </details>
    </Modal>
  );
}

/** Người tham gia gửi góp ý cho một trao đổi. */
export function ReplyDialog({
  open,
  onClose,
  topic,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  topic: Topic;
  onSend: (text: string, credit: boolean, media: Media[]) => void;
}) {
  const [text, setText] = useState("");
  const [credit, setCredit] = useState(true);
  const [media, setMedia] = useState<Media[]>([]);
  const [error, setError] = useState(false);
  const lead = userOf(topic.lead);

  const send = () => {
    if (!text.trim()) return setError(true);
    onSend(text.trim(), credit, media);
    setText("");
    setMedia([]);
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
          {topic.lenses.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
        <p className="mt-2.5 font-bold leading-snug">{topic.question}</p>
        <p className="mt-1 text-[13px] text-moss">
          {lead?.name} mở, {topic.opened}
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
      <MediaPicker value={media} onChange={setMedia} label="Ảnh hoặc video minh hoạ" />
      <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed">
        <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} className="peer sr-only" />
        <Box on={credit} />
        Nếu được áp dụng, ghi tên tôi vào Người đóng góp và Hành trình của dự án. Rút lại được bất cứ lúc nào.
      </label>
    </Modal>
  );
}

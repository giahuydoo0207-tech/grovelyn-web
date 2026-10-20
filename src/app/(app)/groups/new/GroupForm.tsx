"use client";

/* eslint-disable @next/next/no-img-element -- ảnh người dùng vừa cắt (data URL) */

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ImagePlus, Info, Pencil, Plus, Search, X } from "lucide-react";
import { FIELDS, USERS, ME, type CoverTone, type Field, type GroupPrivacy } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { ImageCropper } from "@/components/ImageCropper";
import { GroupCover, GroupMark, groupInitials } from "@/components/GroupVisual";

const MAX_MB = 25;
const FIELD =
  "h-[46px] w-full rounded-xl border border-[#dfe5da] bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-moss/80 focus:border-leaf-deep focus:ring-2 focus:ring-leaf-deep/20";
const LABEL = "flex flex-col gap-1.5 text-sm font-bold";
const HINT = "text-xs font-medium text-moss";
const AREAS = ["Toàn quốc, sinh hoạt trực tuyến", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];
const SUGGEST_RULES = [
  "Ghi nguồn khi dùng bản vẽ của người khác",
  "Góp ý vào dự án, không vào con người",
  "Không quảng cáo khi chưa được quản trị viên đồng ý",
  "Tìm cộng sự thì ghi rõ thời gian và quyền lợi",
];
const TONES: { tone: CoverTone; label: string }[] = [
  { tone: "ink", label: "Nền đen" },
  { tone: "leaf", label: "Nền lá" },
  { tone: "sap", label: "Nền xanh đậm" },
];
const PERMS = [
  { key: "invite", label: "Thành viên mời được người khác", hint: "Lời mời vẫn cần quản trị viên duyệt nếu nhóm riêng tư." },
  { key: "approvePosts", label: "Bài đăng mới cần duyệt", hint: "Quản trị viên duyệt trong 14 ngày trước khi bài hiện cho mọi người." },
  { key: "attachProjects", label: "Thành viên gắn dự án vào nhóm", hint: "Dự án được gắn hiện ở mục Dự án của nhóm." },
  { key: "createEvents", label: "Thành viên tạo sự kiện cho nhóm", hint: "Tắt nếu chỉ quản trị viên được tổ chức sự kiện." },
] as const;
type PermKey = (typeof PERMS)[number]["key"];

function Head({ n, title, extra, children }: { n: number; title: string; extra?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-xl font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[13px] text-leaf">{n}</span>
        {title}
        {extra}
      </h2>
      {children}
    </div>
  );
}

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-[26px] w-[46px] shrink-0 rounded-full p-[3px] transition-colors ${on ? "justify-end bg-leaf-deep" : "justify-start bg-[#c9d0c4]"}`}
    >
      <motion.span layout className="h-5 w-5 rounded-full bg-white" transition={{ type: "spring", stiffness: 600, damping: 35 }} />
    </button>
  );
}

/**
 * Trang tạo nhóm (bản 2B): cùng kiểu trang tạo sự kiện. Ảnh bìa 3:1 và ảnh đại diện vuông được cắt khung,
 * quy tắc là danh sách từng dòng, thẻ xem trước bên phải đổi ngay khi gõ.
 * Chưa có máy chủ: "Tạo nhóm" chỉ hiện trạng thái đã tạo trên trình duyệt.
 */
export function GroupForm() {
  const [cover, setCover] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [tone, setTone] = useState<CoverTone>("sap");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [area, setArea] = useState(AREAS[0]);
  const [rules, setRules] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<GroupPrivacy>("Công khai");
  const [questions, setQuestions] = useState<string[]>(["Bạn đang học hoặc làm ngành gì?"]);
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({ invite: true, approvePosts: false, attachProjects: true, createEvents: true });
  const [invited, setInvited] = useState<string[]>([]);
  const [who, setWho] = useState("");
  const [crop, setCrop] = useState<{ src: string; target: "cover" | "photo" } | null>(null);
  const [fileError, setFileError] = useState("");
  const [done, setDone] = useState(false);

  const coverInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const pick = (file: File | undefined, target: "cover" | "photo") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFileError("Chỉ nhận tệp ảnh (JPG, PNG, WebP).");
    if (file.size > MAX_MB * 1048576) return setFileError(`Ảnh ${(file.size / 1048576).toFixed(1)} MB, quá giới hạn ${MAX_MB} MB.`);
    setFileError("");
    setCrop({ src: URL.createObjectURL(file), target });
  };
  const closeCrop = () => {
    if (crop) URL.revokeObjectURL(crop.src);
    setCrop(null);
  };

  const mark = groupInitials(name);
  const okIntro = !!name.trim() && !!desc.trim() && fields.length > 0;
  const realRules = rules.filter((r) => r.trim());
  const people = USERS.filter((u) => u.handle !== ME && (!who.trim() || `${u.name} ${u.handle}`.toLowerCase().includes(who.toLowerCase())));

  const nav = [
    { id: "g-anh", label: "Ảnh bìa và đại diện", ok: !!cover, meta: cover ? "" : "tùy chọn" },
    { id: "g-tt", label: "Giới thiệu nhóm", ok: okIntro, meta: `${fields.length}/3 ngành` },
    { id: "g-qt", label: "Quy tắc", ok: realRules.length > 0, meta: `${realRules.length} quy tắc` },
    { id: "g-xem", label: "Ai xem được", ok: true, meta: privacy },
    { id: "g-quyen", label: "Quyền", ok: true, meta: `${Object.values(perms).filter(Boolean).length} bật` },
    { id: "g-moi", label: "Mời người", ok: invited.length > 0, meta: `${invited.length} người` },
  ];

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 overflow-hidden rounded-3xl bg-ink text-white">
        <div className="aspect-[4/1] max-h-[220px] opacity-90">
          <GroupCover cover={cover ?? undefined} seed={23} tone="ink" />
        </div>
        <div className="flex flex-wrap items-end gap-5 px-8 pb-8">
          <div className="-mt-10">
            <GroupMark mark={mark} tone={tone} photo={photo ?? undefined} size={96} ring={5} ringColor="#06110a" />
          </div>
          <div className="min-w-[240px] flex-1">
            <p className="font-display text-3xl font-bold tracking-[-0.03em]">Đã tạo {name}</p>
            <p className="mt-1 text-fog">
              Nhóm {privacy.toLowerCase()}, {fields.join(", ")}. {invited.length ? `Đã gửi ${invited.length} lời mời.` : "Bạn là quản trị viên đầu tiên."}
            </p>
            <p className="mt-1 text-sm text-fog">Bản giao diện: nhóm chưa được lưu lên máy chủ.</p>
          </div>
          <Link href="/groups" className="flex h-12 items-center rounded-xl bg-leaf px-5 font-bold text-ink">
            Về trang Nhóm
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <h1 className="mt-2 font-display text-[clamp(2.2rem,4.4vw,2.5rem)] font-bold leading-none tracking-[-0.035em]">Tạo nhóm</h1>
      <p className="mt-2 text-moss">Nhóm là nơi người cùng ngành làm dự án, hỏi han và tìm cộng sự. Bạn là quản trị viên đầu tiên.</p>

      <input ref={coverInput} type="file" accept="image/*" className="sr-only" aria-label="Chọn ảnh bìa nhóm" onChange={(e) => (pick(e.target.files?.[0], "cover"), (e.target.value = ""))} />
      <input ref={photoInput} type="file" accept="image/*" className="sr-only" aria-label="Chọn ảnh đại diện nhóm" onChange={(e) => (pick(e.target.files?.[0], "photo"), (e.target.value = ""))} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          className="flex min-w-0 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (okIntro) setDone(true);
          }}
        >
          {fileError && (
            <p role="alert" className="flex items-center justify-between rounded-xl bg-[#fdf0ed] px-4 py-3 text-sm font-semibold text-[#b42318]">
              {fileError}
              <button type="button" onClick={() => setFileError("")} aria-label="Đóng thông báo">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </p>
          )}

          <section id="g-anh" className="scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[3/1] bg-[#e8ede4]">
              {cover ? (
                <img src={cover} alt="Ảnh bìa đã chọn" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pick(e.dataTransfer.files[0], "cover");
                  }}
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#eef2ea_0_14px,#e6ebe1_14px_28px)] text-moss"
                >
                  <ImagePlus className="h-8 w-8 text-leaf-deep" aria-hidden="true" />
                  <span className="font-bold text-ink">Thêm ảnh bìa</span>
                  <span className="text-[13px]">Tỉ lệ 3:1, tối đa {MAX_MB} MB</span>
                </button>
              )}
              {cover && (
                <button
                  type="button"
                  aria-label="Đổi ảnh bìa"
                  onClick={() => coverInput.current?.click()}
                  className="absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-mist"
                >
                  <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
              <div className="relative -mt-12 shrink-0">
                <GroupMark mark={mark} tone={tone} photo={photo ?? undefined} size={112} ring={5} />
                <button
                  type="button"
                  aria-label={photo ? "Đổi ảnh đại diện nhóm" : "Tải ảnh đại diện nhóm"}
                  onClick={() => photoInput.current?.click()}
                  className="absolute -bottom-1.5 -right-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white shadow-md hover:bg-mist"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="min-w-[200px] flex-1 pb-1">
                {photo ? (
                  <button type="button" onClick={() => setPhoto(null)} className="text-sm font-bold text-leaf-deep hover:underline">
                    Dùng chữ cái đầu thay cho ảnh
                  </button>
                ) : (
                  <>
                    <p className="text-[15px] font-bold">Chưa có ảnh đại diện?</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={HINT}>Dùng chữ cái đầu với màu</span>
                      {TONES.map((t) => (
                        <button
                          key={t.tone}
                          type="button"
                          aria-label={`Chữ cái đầu, ${t.label}`}
                          aria-pressed={tone === t.tone}
                          onClick={() => setTone(t.tone)}
                          className={`h-7 w-7 rounded-lg ${t.tone === "ink" ? "bg-ink" : t.tone === "leaf" ? "bg-leaf" : "bg-leaf-deep"} ${
                            tone === t.tone ? "ring-2 ring-leaf-deep ring-offset-2" : "ring-1 ring-inset ring-black/10"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section id="g-tt" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <Head n={1} title="Giới thiệu nhóm" />
            <div className="mt-4 flex flex-col gap-4">
              <label className={LABEL}>
                Tên nhóm
                <input className={FIELD} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Kiến trúc xanh Sài Gòn" />
                <span className={`${HINT} text-right tabular-nums`}>{name.length} / 100</span>
              </label>
              <label className={LABEL}>
                Mô tả
                <textarea rows={4} className={`${FIELD} h-auto resize-y py-3 leading-normal`} value={desc} maxLength={2000} onChange={(e) => setDesc(e.target.value)} placeholder="Nhóm này để làm gì, ai nên tham gia" />
                <span className={`${HINT} text-right tabular-nums`}>{desc.length} / 2.000</span>
              </label>
              <fieldset>
                <legend className="text-sm font-bold">
                  Ngành <span className={HINT}>chọn tối đa 3, đã chọn {fields.length}</span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FIELDS.filter((f): f is Field => f !== "Tất cả").map((f) => {
                    const on = fields.includes(f);
                    const off = !on && fields.length >= 3;
                    return (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={on}
                        disabled={off}
                        onClick={() => setFields((l) => (on ? l.filter((x) => x !== f) : [...l, f]))}
                        className={`h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors disabled:opacity-40 ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mist"}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label className={LABEL}>
                Khu vực
                <select className={FIELD} value={area} onChange={(e) => setArea(e.target.value)}>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                <span className={HINT}>Giúp người cùng thành phố tìm thấy nhóm để gặp trực tiếp.</span>
              </label>
            </div>
          </section>

          <section id="g-qt" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <Head n={2} title="Quy tắc" extra={<span className="text-sm font-semibold text-moss">{rules.length} / 10</span>}>
              <button
                type="button"
                disabled={rules.length >= 10}
                onClick={() => setRules((l) => [...l, ""])}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-leaf px-4 text-sm font-bold text-ink hover:bg-[#6ee04d] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                Thêm quy tắc
              </button>
            </Head>
            <p className={`mt-1.5 ${HINT}`}>Mỗi quy tắc một dòng ngắn. Người xin vào nhóm phải đồng ý trước khi tham gia.</p>
            <ol className="mt-3.5 flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {rules.map((r, i) => (
                  <motion.li key={i} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-[30px_minmax(0,1fr)_40px] items-center gap-2.5">
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sap text-[13px] font-bold text-leaf-deep">{i + 1}</span>
                    <input
                      className={FIELD}
                      value={r}
                      maxLength={140}
                      autoFocus={!r}
                      onChange={(e) => setRules((l) => l.map((x, k) => (k === i ? e.target.value : x)))}
                      aria-label={`Quy tắc ${i + 1}`}
                      placeholder="Ví dụ: Ghi nguồn khi dùng bản vẽ của người khác"
                    />
                    <button type="button" aria-label={`Xóa quy tắc ${i + 1}`} onClick={() => setRules((l) => l.filter((_, k) => k !== i))} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#fdf0ed]">
                      <X className="h-4 w-4 text-[#b42318]" aria-hidden="true" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            {SUGGEST_RULES.some((t) => !rules.includes(t)) && rules.length < 10 && (
              <>
                <p className="mt-3.5 text-[13px] font-bold">Gợi ý nhanh</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {SUGGEST_RULES.filter((t) => !rules.includes(t)).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRules((l) => [...l.filter((x) => x.trim()), t].slice(0, 10))}
                      className="h-[34px] rounded-full border border-dashed border-leaf-deep bg-white px-3 text-[13px] font-semibold text-leaf-deep hover:bg-sap/50"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section id="g-xem" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <Head n={3} title="Ai xem được nhóm" />
            <div role="radiogroup" className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["Công khai", "Ai cũng xem được bài đăng và thành viên, kể cả người chưa có tài khoản."],
                  ["Riêng tư", "Chỉ thành viên mới xem được bài đăng. Người ngoài thấy tên và mô tả nhóm."],
                ] as const
              ).map(([k, text]) => {
                const on = privacy === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPrivacy(k)}
                    className={`flex gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${on ? "border-leaf-deep bg-[#f1faec]" : "border-line hover:bg-mist"}`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-leaf-deep" : "border-fog"}`}>
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-leaf-deep" />}
                    </span>
                    <span>
                      <span className="block font-bold">{k}</span>
                      <span className="mt-1 block text-[13px] leading-normal text-[#3d4a38]">{text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-mist px-3.5 py-3 text-[13px] leading-normal text-[#3d4a38]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
              <span>
                <strong className="text-ink">Khả năng tìm thấy:</strong>{" "}
                {privacy === "Riêng tư" ? "Nhóm vẫn hiện khi tìm kiếm, nhưng nội dung chỉ thành viên thấy." : "Nhóm hiện khi tìm kiếm và trên hồ sơ của thành viên."} Nhóm công khai đổi được sang riêng tư sau này, chiều ngược lại thì không.
              </span>
            </p>
            <AnimatePresence initial={false}>
              {privacy === "Riêng tư" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="mt-4 text-sm font-bold">
                    Câu hỏi khi xin vào <span className={HINT}>tối đa 3 câu, quản trị viên đọc trước khi duyệt</span>
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {questions.map((q, i) => (
                      <div key={i} className="flex gap-2">
                        <input className={FIELD} value={q} onChange={(e) => setQuestions((l) => l.map((x, k) => (k === i ? e.target.value : x)))} aria-label={`Câu hỏi ${i + 1}`} />
                        <button type="button" aria-label={`Xóa câu hỏi ${i + 1}`} onClick={() => setQuestions((l) => l.filter((_, k) => k !== i))} className="flex h-[46px] w-10 shrink-0 items-center justify-center rounded-full hover:bg-[#fdf0ed]">
                          <X className="h-4 w-4 text-[#b42318]" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    {questions.length < 3 && (
                      <button type="button" onClick={() => setQuestions((l) => [...l, ""])} className="h-10 self-start rounded-full px-3 text-sm font-bold text-leaf-deep hover:bg-sap/50">
                        + Thêm câu hỏi
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section id="g-quyen" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <Head n={4} title="Quyền của thành viên" />
            <div className="mt-3.5 flex flex-col gap-2">
              {PERMS.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-3.5 rounded-xl bg-mist p-3.5">
                  <span>
                    <span className="block font-bold">{p.label}</span>
                    <span className="text-[13px] leading-normal text-moss">{p.hint}</span>
                  </span>
                  <Switch on={perms[p.key]} label={p.label} onToggle={() => setPerms((x) => ({ ...x, [p.key]: !x[p.key] }))} />
                </div>
              ))}
            </div>
          </section>

          <section id="g-moi" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <Head n={5} title="Mời người vào nhóm" extra={<span className={HINT}>tùy chọn</span>} />
            <label className="mt-3.5 flex h-[46px] items-center gap-2.5 rounded-xl border border-[#dfe5da] px-3.5 focus-within:border-leaf-deep">
              <Search className="h-[18px] w-[18px] text-moss" aria-hidden="true" />
              <span className="sr-only">Tìm người để mời</span>
              <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Tìm theo tên hoặc @tên" className="min-w-0 flex-1 bg-transparent outline-none" />
            </label>
            <ul className="mt-2 flex flex-col">
              {people.map((u) => {
                const on = invited.includes(u.handle);
                return (
                  <li key={u.handle} className="flex items-center gap-3 px-1 py-2">
                    <Avatar initials={u.initials} tone={u.tone} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{u.name}</span>
                      <span className="line-clamp-1 text-[13px] text-moss">{u.headline}</span>
                    </span>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setInvited((l) => (on ? l.filter((x) => x !== u.handle) : [...l, u.handle]))}
                      className={`inline-flex h-[34px] items-center gap-1 rounded-full border px-3.5 text-[13px] font-bold ${on ? "border-leaf-deep bg-sap text-leaf-deep" : "border-ink bg-white hover:bg-mist"}`}
                    >
                      {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      {on ? "Đã mời" : "Mời"}
                    </button>
                  </li>
                );
              })}
              {people.length === 0 && <li className="p-3 text-sm text-moss">Không tìm thấy ai.</li>}
            </ul>
          </section>
        </form>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px]">
          <p className="text-[13px] font-bold text-moss">Xem trước thẻ nhóm</p>
          <article className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="aspect-[3/1] bg-[#e8ede4]">{cover && <img src={cover} alt="" className="h-full w-full object-cover" />}</div>
            <div className="px-4 pb-4">
              <div className="relative -mt-6">
                <GroupMark mark={mark} tone={tone} photo={photo ?? undefined} size={52} ring={4} />
              </div>
              <h3 className="mt-2.5 text-[17px] font-bold">{name.trim() || "Tên nhóm của bạn"}</h3>
              <p className="mt-0.5 text-[13px] text-moss">
                {privacy}
                {fields.length ? `, ${fields.join(", ")}` : ""}, 1 thành viên
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-normal text-[#3d4a38]">{desc.trim() || "Mô tả ngắn sẽ hiện ở đây."}</p>
            </div>
          </article>
          <nav aria-label="Các phần" className="rounded-2xl border border-line bg-white p-2">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold hover:bg-mist">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${n.ok ? "bg-leaf-deep text-white" : "bg-line"}`}>
                  {n.ok && <Check className="h-3 w-3" strokeWidth={3} aria-label="Đã xong" />}
                </span>
                <span className="flex-1">{n.label}</span>
                <span className="text-xs text-moss">{n.meta}</span>
              </a>
            ))}
          </nav>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={!okIntro}
            onClick={() => setDone(true)}
            className="h-[50px] rounded-full bg-leaf text-base font-bold text-ink hover:bg-[#6ee04d] disabled:opacity-50"
          >
            Tạo nhóm
          </motion.button>
          <p className="text-center text-xs text-moss">{okIntro ? "Lời mời được gửi ngay khi nhóm tạo xong." : "Cần tên, mô tả và ít nhất 1 ngành."}</p>
        </aside>
      </div>

      {crop && (
        <ImageCropper
          src={crop.src}
          ratio={crop.target === "cover" ? 3 : 1}
          title={crop.target === "cover" ? "Chỉnh khung ảnh bìa nhóm" : "Chỉnh khung ảnh đại diện nhóm"}
          outputWidth={crop.target === "cover" ? 1500 : 400}
          onCancel={closeCrop}
          onDone={(url) => {
            if (crop.target === "cover") setCover(url);
            else setPhoto(url);
            closeCrop();
          }}
        />
      )}
    </>
  );
}

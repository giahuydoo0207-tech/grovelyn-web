"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Circle, FileText, Globe2, ImagePlus, Lock, UploadCloud, X } from "lucide-react";
import { FIELDS, ME, QUOTA_MB, USERS, userOf, type CoverTone, type Field } from "@/lib/data";
import { toEmbed } from "@/lib/embed";
import { PHASES, type Phase, type Resources } from "@/lib/showcase";
import { TEMPLATES } from "@/lib/templates";
import { Avatar } from "@/components/Avatar";
import { FolderCover } from "@/components/project/FolderCover";
import { ProjectLogo } from "@/components/project/ProjectLogo";

const MAX_FILE_MB = 25;
const MAX_SHOTS = 12;
const MAX_CHIPS = 10;

const input = "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] outline-none focus:border-ink";
const area = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-ink";
const label = "flex flex-col gap-1.5 text-sm font-semibold";

const TONES: { id: CoverTone; name: string; swatch: string }[] = [
  { id: "ink", name: "Đen", swatch: "#06110a" },
  { id: "leaf", name: "Xanh lá", swatch: "#5bd13a" },
  { id: "sap", name: "Xanh nhạt", swatch: "#dcf6cf" },
];

const RES: { key: keyof Resources; name: string; ph: string; hint: string }[] = [
  { key: "demo", name: "Demo", ph: "https://ten-du-an.vercel.app", hint: "Trang chạy thử của dự án" },
  { key: "repo", name: "Repo", ph: "https://github.com/ban/du-an", hint: "Mã nguồn" },
  { key: "slides", name: "Slides", ph: "https://docs.google.com/presentation/d/…", hint: "Hiện ngay trong trang nếu là Google Slides" },
  { key: "video", name: "Video", ph: "https://youtu.be/…", hint: "Hiện ở đầu trang dự án" },
];

interface Picked {
  name: string;
  mb: number;
  tooBig: boolean;
}

interface Shot {
  url: string;
  name: string;
}

function Step({ n, title, hint, children }: { n: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`buoc-${n}`} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-baseline gap-3.5">
        <span className="font-display text-[15px] font-bold tabular-nums text-leaf-deep">{n}</span>
        <div>
          <h2 id={`buoc-${n}`} className="font-display text-[21px] font-bold tracking-[-0.02em]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-moss">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Ô nhập thẻ: gõ rồi Enter hoặc dấu phẩy để thêm. */
function ChipInput({ id, title, value, onChange, placeholder, strong = false }: { id: string; title: string; value: string[]; onChange: (v: string[]) => void; placeholder: string; strong?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().replace(/^#/, "");
    if (t && !value.includes(t) && value.length < MAX_CHIPS) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {title}
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 focus-within:border-ink">
        {value.map((t) => (
          <span key={t} className={`inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1.5 text-sm font-semibold ${strong ? "bg-sap text-leaf-deep" : "bg-mist"}`}>
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Bỏ ${t}`} className="rounded-full p-0.5 hover:bg-white/70">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        {value.length < MAX_CHIPS && (
          <input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            onBlur={add}
            placeholder={value.length ? "" : placeholder}
            className="h-9 min-w-[10rem] flex-1 bg-transparent text-[15px] outline-none"
          />
        )}
      </div>
    </div>
  );
}

/** Tạo hồ sơ dự án theo 7 bước, có xem trước thẻ dự án. Bản giao diện: chưa lưu lên máy chủ. */
export function NewProjectForm() {
  const [title, setTitle] = useState("");
  const [field, setField] = useState<Field>("Công nghệ thông tin");
  const [kind, setKind] = useState("");
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState<CoverTone>("ink");
  const [logoSrc, setLogoSrc] = useState<string | undefined>();
  const [shots, setShots] = useState<Shot[]>([]);
  const [facts, setFacts] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<Record<string, string>>({});
  const [resources, setResources] = useState<Resources>({});
  const [files, setFiles] = useState<Picked[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [tech, setTech] = useState<string[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [myRole, setMyRole] = useState("");
  const [members, setMembers] = useState<{ handle: string; part: string }[]>([]);
  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("concept");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [done, setDone] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const template = TEMPLATES[field];
  const me = userOf(ME)!;

  // Thu hồi ảnh xem trước khi rời trang.
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  const track = (f: File) => {
    const u = URL.createObjectURL(f);
    urls.current.push(u);
    return u;
  };

  const addShots = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/")).slice(0, MAX_SHOTS - shots.length);
    setShots((s) => [...s, ...imgs.map((f) => ({ url: track(f), name: f.name.replace(/\.[^.]+$/, "") }))]);
  };
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => {
      const mb = f.size / 1024 / 1024;
      return { name: f.name, mb, tooBig: mb > MAX_FILE_MB };
    });
    setFiles((cur) => [...cur, ...next.filter((n) => !cur.some((c) => c.name === n.name))]);
  };
  const addMember = () => {
    const h = invite.trim().replace(/^@/, "");
    if (!h) return;
    const u = USERS.find((x) => x.handle === h);
    if (!u) return setInviteError(`Không tìm thấy @${h}.`);
    if (u.handle === ME || members.some((m) => m.handle === h)) return setInviteError(`@${h} đã có trong dự án.`);
    setMembers([...members, { handle: h, part: "" }]);
    setInvite("");
    setInviteError(null);
  };

  const badUrl = (v?: string) => !!v && v.trim() !== "" && !/^https:\/\//.test(v.trim());
  const used = files.filter((f) => !f.tooBig).reduce((s, f) => s + f.mb, 0);

  const checks = [
    { label: "Tên dự án", ok: title.trim().length > 0 },
    { label: "Logo", ok: !!logoSrc },
    { label: "Ảnh chụp dự án", ok: shots.length > 0 },
    { label: "Giới thiệu ngắn", ok: summary.trim().length > 0 },
    { label: "Ít nhất một tài nguyên", ok: Object.values(resources).some((v) => v && v.trim()) },
    { label: "Công nghệ", ok: tech.length > 0 },
  ];
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-ink p-8 text-white">
        <p className="font-display text-3xl font-bold tracking-[-0.03em]">Đã tạo dự án {title || "mới"}</p>
        <p className="mt-2 text-fog">
          Cột mốc đầu tiên “{PHASES.find((p) => p.id === phase)!.label}” đã lưu. Chia sẻ lên Cộng đồng để mọi người góp ý.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/community" className="rounded-xl bg-leaf px-5 py-3 font-bold text-ink">
            Chia sẻ lên Cộng đồng
          </Link>
          <button onClick={() => setDone(false)} className="rounded-xl border border-ink-line px-5 py-3 font-semibold hover:bg-white/10">
            Quay lại chỉnh sửa
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || RES.some((r) => badUrl(resources[r.key]))) return;
        setDone(true);
      }}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <Step n="01" title="Logo, màu bìa và ảnh chụp" hint="Logo đặt trên bìa hồ sơ của dự án; ảnh chụp hiện trong chương Hình ảnh.">
          <div className="flex flex-wrap items-center gap-5">
            <span className="rounded-[20px] bg-white p-1.5 shadow-[0_4px_12px_-6px_rgba(6,17,10,0.35),0_0_0_1px_rgba(6,17,10,0.06)]">
              <ProjectLogo title={title || "Dự án mới"} src={logoSrc} size={80} />
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Logo dự án</p>
              <p className="text-sm text-moss">Ảnh vuông, tối thiểu 256 x 256 px. Chưa có logo thì dùng chữ cái đầu của tên.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => logoInput.current?.click()} className="h-10 rounded-xl border border-line px-4 text-sm font-semibold hover:bg-mist">
                  {logoSrc ? "Đổi logo" : "Tải logo lên"}
                </button>
                {logoSrc && (
                  <button type="button" onClick={() => setLogoSrc(undefined)} className="h-10 rounded-xl px-3 text-sm font-semibold text-moss hover:bg-mist hover:text-ink">
                    Dùng chữ cái đầu
                  </button>
                )}
              </div>
            </div>
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Chọn logo dự án"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoSrc(track(f));
                e.target.value = "";
              }}
            />
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Màu bìa</legend>
            <div className="mt-2 flex gap-2.5">
              {TONES.map((t) => (
                <label key={t.id} className="cursor-pointer">
                  <input type="radio" name="tone" className="peer sr-only" checked={tone === t.id} onChange={() => setTone(t.id)} />
                  <span
                    className="block h-10 w-10 rounded-full border border-line ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-leaf-deep"
                    style={{ background: t.swatch }}
                  />
                  <span className="sr-only">{t.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="mt-6 text-sm font-semibold">Ảnh chụp dự án</p>
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shots.map((s, i) => (
              <li key={s.url} className="relative overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước là object URL */}
                <img src={s.url} alt={s.name} className="aspect-[16/10] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setShots((list) => list.filter((_, j) => j !== i))}
                  aria-label={`Bỏ ảnh ${s.name}`}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
            {shots.length < MAX_SHOTS && (
              <li className={shots.length === 0 ? "col-span-2 sm:col-span-4" : ""}>
                <button
                  type="button"
                  onClick={() => shotInput.current?.click()}
                  className="flex aspect-[16/10] h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-sm font-semibold text-moss hover:border-leaf-deep hover:text-ink data-[empty=true]:aspect-auto data-[empty=true]:py-8"
                  data-empty={shots.length === 0}
                >
                  <ImagePlus className="h-6 w-6" aria-hidden="true" />
                  {shots.length === 0 ? `Thêm ảnh chụp (tối đa ${MAX_SHOTS} ảnh)` : "Thêm ảnh"}
                </button>
              </li>
            )}
          </ul>
          <input
            ref={shotInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Chọn ảnh chụp dự án"
            onChange={(e) => {
              addShots(e.target.files);
              e.target.value = "";
            }}
          />
        </Step>

        <Step n="02" title="Tên và giới thiệu" hint="Một câu nói rõ dự án giải quyết chuyện gì.">
          <div className="flex flex-col gap-4">
            <label className={label}>
              Tên dự án
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Nhà phố 4x16m thông gió tự nhiên" className={input} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Lĩnh vực
                <select value={field} onChange={(e) => setField(e.target.value as Field)} className={input}>
                  {FIELDS.filter((f) => f !== "Tất cả").map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Loại dự án
                <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="Đồ án, dự án dự thi, dự án khách hàng…" className={input} />
              </label>
            </div>
            <label className={label}>
              Giới thiệu ngắn
              <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Dự án giải quyết chuyện gì, bạn làm phần nào" className={area} />
            </label>
          </div>
        </Step>

        <Step n="03" title={`Khung trình bày: ${field}`} hint="Đổi lĩnh vực ở bước 02 thì khung này đổi theo. Bỏ trống phần chưa có.">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={field} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {template.facts.map((f) => (
                  <label key={f.key} className={label}>
                    {f.label}
                    <input value={facts[f.key] ?? ""} onChange={(e) => setFacts({ ...facts, [f.key]: e.target.value })} placeholder={f.placeholder} className={input} />
                  </label>
                ))}
              </div>
              {template.sections.map((s) => (
                <label key={s.heading} className={label}>
                  {s.heading}
                  <textarea rows={2} value={sections[s.heading] ?? ""} onChange={(e) => setSections({ ...sections, [s.heading]: e.target.value })} placeholder={s.prompt} className={area} />
                </label>
              ))}
              {template.beforeAfter && (
                <p className="rounded-xl bg-mist px-4 py-3 text-sm text-moss">
                  Ngành này hay có ảnh <strong className="text-ink">trước và sau</strong>. Đặt tên ảnh có chữ “truoc” và “sau” để trang dự án hiện thanh kéo so sánh.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </Step>

        <Step n="04" title="Tài nguyên" hint="Hiện thành các nút Demo, Repo, Slides, Video ở cột phải trang dự án.">
          <div className="grid gap-4 sm:grid-cols-2">
            {RES.map((r) => {
              const v = resources[r.key] ?? "";
              const emb = v.trim() ? toEmbed(v) : null;
              const bad = badUrl(v);
              return (
                <label key={r.key} className={label}>
                  <span className="flex items-baseline justify-between gap-2">
                    {r.name}
                    <span className={`text-[13px] font-normal ${bad ? "text-[#b42318]" : emb ? "text-leaf-deep" : "text-moss"}`}>
                      {bad ? "Cần bắt đầu bằng https://" : emb ? `Nhúng được: ${emb.label}` : "Không bắt buộc"}
                    </span>
                  </span>
                  <input inputMode="url" value={v} onChange={(e) => setResources({ ...resources, [r.key]: e.target.value })} placeholder={r.ph} className={input} aria-describedby={`goi-y-${r.key}`} />
                  <span id={`goi-y-${r.key}`} className="text-[13px] font-normal text-moss">
                    {r.hint}
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-6 text-sm font-semibold">Tệp dự án</p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="mt-2 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line px-6 py-7 text-center transition-colors hover:bg-mist"
          >
            <UploadCloud className="h-7 w-7 text-leaf-deep" aria-hidden="true" />
            <span className="font-semibold">Kéo thả tệp hoặc bấm để chọn</span>
            <span className="text-sm text-moss">PDF, ảnh, video tới 60 giây, mô hình 3D. Mỗi tệp tối đa {MAX_FILE_MB} MB.</span>
          </button>
          <input ref={fileInput} type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} aria-label="Chọn tệp dự án" />
          {files.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {files.map((f) => (
                <li key={f.name} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${f.tooBig ? "border-[#f4b4a8] bg-[#fdf0ed]" : "border-line"}`}>
                  <FileText className="h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{f.name}</span>
                    <span className={`text-sm ${f.tooBig ? "text-[#b42318]" : "text-moss"}`}>
                      {f.tooBig ? `${f.mb.toFixed(1)} MB, quá giới hạn ${MAX_FILE_MB} MB.` : `${f.mb.toFixed(1)} MB`}
                    </span>
                  </span>
                  <button type="button" aria-label={`Bỏ ${f.name}`} onClick={() => setFiles((cur) => cur.filter((c) => c.name !== f.name))} className="flex h-9 w-9 items-center justify-center rounded-lg text-moss hover:bg-mist">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li className="text-sm text-moss">
                Dự án này dùng {used.toFixed(1)} MB trong {QUOTA_MB} MB của tài khoản.
              </li>
            </ul>
          )}
        </Step>

        <Step n="05" title="Chuyên môn và công nghệ" hint="Doanh nghiệp lọc dự án theo hai mục này.">
          <div className="flex flex-col gap-4">
            <ChipInput id="chuyen-mon" title="Chuyên môn" value={expertise} onChange={setExpertise} placeholder="Phát triển Full-stack, Thiết kế bao bì… (Enter để thêm)" strong />
            <ChipInput id="cong-nghe" title="Công nghệ và công cụ" value={tech} onChange={setTech} placeholder="Next.js, Figma, Revit… (Enter để thêm)" />
            <ChipInput id="hang-muc" title="Hạng mục dự thi (nếu có)" value={tracks} onChange={setTracks} placeholder="Best Product & Business…" />
          </div>
        </Step>

        <Step n="06" title="Người đóng góp" hint="Mỗi người ghi rõ phần mình làm.">
          <ul className="flex flex-col gap-3">
            <li className="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <span className="flex items-center gap-2.5 font-semibold">
                <Avatar initials={me.initials} tone={me.tone} size={36} /> {me.name} (bạn)
              </span>
              <input aria-label="Phần bạn làm" value={myRole} onChange={(e) => setMyRole(e.target.value)} placeholder="Chủ dự án, thiết kế, lập trình…" className={input} />
            </li>
            {members.map((m, i) => {
              const u = userOf(m.handle)!;
              return (
                <li key={m.handle} className="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_44px]">
                  <span className="flex items-center gap-2.5 font-semibold">
                    <Avatar initials={u.initials} tone={u.tone} size={36} /> {u.name}
                  </span>
                  <input
                    aria-label={`Phần ${u.name} làm`}
                    value={m.part}
                    onChange={(e) => setMembers(members.map((x, j) => (j === i ? { ...x, part: e.target.value } : x)))}
                    placeholder="Phần người này làm"
                    className={input}
                  />
                  <button type="button" onClick={() => setMembers(members.filter((_, j) => j !== i))} aria-label={`Bỏ ${u.name}`} className="flex h-11 w-11 items-center justify-center rounded-xl text-moss hover:bg-mist">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex gap-2">
            <label htmlFor="moi-nguoi" className="sr-only">
              Mời người cùng làm
            </label>
            <input
              id="moi-nguoi"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMember();
                }
              }}
              placeholder="@tên người cùng làm"
              className={input}
            />
            <button type="button" onClick={addMember} className="h-12 shrink-0 rounded-xl border border-line px-4 font-semibold hover:bg-mist">
              Mời
            </button>
          </div>
          {inviteError && <p className="mt-2 text-sm text-[#b42318]">{inviteError}</p>}
        </Step>

        <Step n="07" title="Giai đoạn và quyền riêng tư" hint="Giai đoạn là cột mốc đầu tiên trong chương Hành trình.">
          <fieldset>
            <legend className="sr-only">Giai đoạn hiện tại</legend>
            <div className="grid grid-cols-3 gap-2">
              {PHASES.map((p) => (
                <label key={p.id} className={`cursor-pointer rounded-xl border px-3 py-3 text-center transition-colors ${phase === p.id ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}>
                  <input type="radio" name="phase" className="sr-only" checked={phase === p.id} onChange={() => setPhase(p.id)} />
                  <span className="block font-semibold">{p.label}</span>
                  <span className="hidden text-xs text-moss sm:block">{p.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="sr-only">Ai xem được</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "public", icon: Globe2, title: "Công khai", hint: "Mọi người và doanh nghiệp đều xem được" },
                  { v: "private", icon: Lock, title: "Chỉ mình tôi", hint: "Lưu riêng, công khai lúc nào cũng được" },
                ] as const
              ).map((o) => {
                const on = visibility === o.v;
                return (
                  <label key={o.v} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${on ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}>
                    <input type="radio" name="visibility" checked={on} onChange={() => setVisibility(o.v)} className="sr-only" />
                    <o.icon className="mt-0.5 h-5 w-5 text-leaf-deep" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{o.title}</span>
                      <span className="text-sm text-moss">{o.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Step>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.06em] text-moss">Xem trước thẻ dự án</p>
        <article className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="bg-mist px-[18px] pt-[22px]">
            <FolderCover tone={tone} title={title || "Dự án mới"} logoSrc={logoSrc} kind={kind || undefined} height={176} logoSize={78} />
          </div>
          <div className="flex flex-col gap-2 p-5">
            <div className="flex justify-between gap-3 text-[13px]">
              <span className="font-semibold text-leaf-deep">{field}</span>
              <span className="font-semibold text-leaf-deep">{PHASES.find((p) => p.id === phase)!.label}</span>
            </div>
            <h3 className="font-display text-lg font-bold leading-tight tracking-[-0.02em]">{title || "Tên dự án của bạn"}</h3>
            <dl className="mt-1 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <dt className="text-moss">Công nghệ</dt>
              <dd className="truncate font-semibold">{tech.length ? tech.slice(0, 3).join(", ") : "Chưa có"}</dd>
              <dt className="text-moss">Người làm</dt>
              <dd className="flex items-center gap-2 font-semibold">
                <Avatar initials={me.initials} tone={me.tone} size={22} /> {me.name}
              </dd>
            </dl>
          </div>
        </article>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">Mức đầy đủ của hồ sơ dự án</p>
            <p className="font-display text-lg font-extrabold text-leaf-deep">{pct}%</p>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Mức đầy đủ của hồ sơ dự án">
            <div className="h-full rounded-full bg-leaf transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {checks.map((c) => (
              <li key={c.label} className={`flex items-center gap-2 ${c.ok ? "" : "text-moss"}`}>
                {c.ok ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Circle className="h-4 w-4 text-line" aria-hidden="true" />}
                {c.label}
              </li>
            ))}
          </ul>
        </section>

        <button type="submit" className="h-12 rounded-xl bg-leaf font-bold text-ink hover:bg-[#6ee04d]">
          Tạo dự án
        </button>
        <button type="button" onClick={() => setDraftSaved(true)} className="h-11 rounded-xl border border-line bg-white font-semibold hover:bg-mist">
          Lưu nháp
        </button>
        {draftSaved && (
          <p role="status" className="text-center text-sm text-moss">
            Đã lưu nháp trên trình duyệt này.
          </p>
        )}
      </aside>
    </form>
  );
}

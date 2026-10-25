"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Circle, FileText, Globe2, ImagePlus, Lock, Plus, UploadCloud, X } from "lucide-react";
import { FIELDS, ME, QUOTA_MB, USERS, userOf, type CoverTone, type Field, type Project, type ProjectFile } from "@/lib/data";
import { compressImage } from "@/lib/localMedia";
import { slugify } from "@/lib/slug";
import { persisted } from "@/lib/persist";
import { myProjectsStore, postsStore } from "@/lib/stores";
import { toEmbed } from "@/lib/embed";
import { CONTEXTS, LAYOUTS, OUTPUTS, USAGES, canAnnounce, layoutOf, levelHint, sectionsFor, type Context, type Layout, type Output, type Usage } from "@/lib/model";
import { PROGRESS, phaseLabel, type Phase } from "@/lib/showcase";
import { Avatar } from "@/components/Avatar";
import { FolderCover } from "@/components/project/FolderCover";
import { ProjectLogo } from "@/components/project/ProjectLogo";
import { ImageCropper } from "@/components/ImageCropper";

const MAX_FILE_MB = 25;
const MAX_SHOTS = 12;
const MAX_CHIPS = 10;

const input = "h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] font-normal outline-none focus:border-ink";
const area = "w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] font-normal leading-relaxed outline-none focus:border-ink";
const label = "flex flex-col gap-1.5 text-sm font-semibold";
const optional = <span className="font-normal text-moss">(không bắt buộc)</span>;

/** Bản nháp của form, lưu trên trình duyệt để quay lại làm tiếp. */
interface Draft {
  title: string;
  summary: string;
  field: Field | "";
  output: Output | "";
  context: Context | "";
  contextNote: string;
  usage: Usage | "";
  myRole: string;
  tools: string[];
  phase: Phase;
  sections: Record<string, string>;
}
const draftStore = persisted<Draft | null>("project-draft", null);

const fileKind = (name: string): ProjectFile["kind"] => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["skp", "rvt", "dwg", "obj", "fbx", "stl", "blend"].includes(ext)) return "model";
  return "doc";
};

const TONES: { id: CoverTone; name: string; swatch: string }[] = [
  { id: "ink", name: "Đen", swatch: "#06110a" },
  { id: "leaf", name: "Xanh lá", swatch: "#5bd13a" },
  { id: "sap", name: "Xanh nhạt", swatch: "#dcf6cf" },
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

interface LinkRow {
  id: number;
  label: string;
  url: string;
}

function Part({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`phan-${n}`} className="rounded-xl border border-line bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-display text-[15px] font-bold tabular-nums text-leaf-deep">{n}</span>
        <div>
          <h2 id={`phan-${n}`} className="font-display text-[21px] font-bold tracking-[-0.02em]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-moss">{hint}</p>
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Ô nhập thẻ: gõ rồi Enter hoặc dấu phẩy để thêm. */
function ChipInput({ id, title, value, onChange, placeholder }: { id: string; title: React.ReactNode; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
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
      <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 focus-within:border-ink">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-mist py-1 pl-3 pr-1.5 text-sm font-semibold">
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

/**
 * Tạo dự án theo ba phần: đây là gì, nội dung, bạn làm gì. Chỉ hỏi bắt buộc những gì ngành nào cũng có;
 * đề mục theo mẫu trình bày chỉ là gợi ý. Bản giao diện: chưa lưu lên máy chủ.
 */
export function NewProjectForm() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [field, setField] = useState<Field | "">("");
  const [output, setOutput] = useState<Output | "">("");
  const [context, setContext] = useState<Context | "">("");
  const [contextNote, setContextNote] = useState("");
  const [usage, setUsage] = useState<Usage | "">("");
  const [layout, setLayout] = useState<Layout | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [tone, setTone] = useState<CoverTone>("ink");
  const [logoSrc, setLogoSrc] = useState<string | undefined>();
  const [coverSrc, setCoverSrc] = useState<string | undefined>();
  // Ảnh gốc để căn chỉnh lại bìa nhiều lần mà không bị mờ dần; mở khung căn chỉnh khi có `cropping`.
  const [coverOriginal, setCoverOriginal] = useState<string | undefined>();
  const [cropping, setCropping] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [files, setFiles] = useState<Picked[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([{ id: 1, label: "", url: "" }]);
  const [myRole, setMyRole] = useState("");
  const [members, setMembers] = useState<{ handle: string; part: string }[]>([]);
  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("draft");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<null | "saved" | "published">(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");
  const draft = draftStore.use();
  const logoInput = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const me = userOf(ME)!;

  const autoLayout: Layout = output ? layoutOf(output) : "case";
  const shownLayout = layout ?? autoLayout;

  // Ảnh được thu nhỏ rồi lưu dạng data URL, để dự án mở lại sau khi tải trang vẫn còn ảnh.
  const addShots = async (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/")).slice(0, MAX_SHOTS - shots.length);
    const next = await Promise.all(imgs.map(async (f) => ({ url: await compressImage(f), name: f.name.replace(/\.[^.]+$/, "") })));
    setShots((s) => [...s, ...next]);
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

  const badUrl = (v: string) => v.trim() !== "" && !/^https:\/\//.test(v.trim());
  const filledLinks = links.filter((l) => l.url.trim() && !badUrl(l.url));
  const used = files.filter((f) => !f.tooBig).reduce((s, f) => s + f.mb, 0);

  const hasContent =
    shots.length > 0 || files.some((f) => !f.tooBig) || filledLinks.length > 0 || Object.values(sections).some((v) => v.trim().length > 0);
  /** Đủ để lưu, để công khai và mở Trao đổi. Không cần xong 100%. */
  const required = [
    { label: "Tên dự án", ok: title.trim().length > 0 },
    { label: "Một câu giới thiệu", ok: summary.trim().length > 0 },
    { label: "Lĩnh vực và dạng đầu ra", ok: !!field && !!output },
    { label: "Vai trò của bạn", ok: myRole.trim().length > 0 },
  ];
  /** Thêm cho lần công bố lên Trang chủ. */
  const forPublish = [
    { label: "Có nội dung để xem: bài viết, ảnh, tệp hoặc liên kết", ok: hasContent },
    { label: "Hoàn tất, hoặc đã dùng thực tế", ok: canAnnounce(phase, usage || undefined) },
    { label: "Để Công khai", ok: visibility === "public" },
  ];
  const ready = required.every((r) => r.ok);
  const canPublish = ready && forPublish.every((r) => r.ok);
  const publishHint = canPublish
    ? "Bản v1 sẽ hiện trên Trang chủ. Hãy chắc bạn có quyền chia sẻ, và đã ẩn thông tin khách hàng hoặc tài liệu nội bộ."
    : "Chưa công bố cũng được: lưu dự án rồi mở Trao đổi để xin góp ý.";

  const submit = (publish: boolean) => {
    setTried(true);
    if (!ready || links.some((l) => badUrl(l.url)) || (publish && !canPublish)) {
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const slug = slugify(title);
    const project: Project = {
      slug,
      title: title.trim(),
      summary: summary.trim(),
      field: field as Field,
      output: output as Output,
      context: context || "Dự án cá nhân",
      contextNote: contextNote.trim() || undefined,
      usage: usage || undefined,
      owner: ME,
      members: [{ handle: ME, part: myRole.trim() }, ...members.map((m) => ({ handle: m.handle, part: m.part.trim() || "Thành viên" }))],
      tools,
      files: files.filter((f) => !f.tooBig).map((f) => ({ name: f.name, kind: fileKind(f.name), size: `${f.mb.toFixed(1).replace(".", ",")} MB`, updated: "vừa xong" })),
      versions: [{ tag: "v1", note: "Bản đầu tiên", when: "vừa xong" }],
      likes: 0,
      comments: 0,
      tone,
      seed: Math.floor(Math.random() * 90) + 5,
      updated: "vừa xong",
      readme: sectionsFor(shownLayout, phase)
        .map((sec) => ({ heading: sec.heading, body: (sections[sec.heading] ?? "").trim() }))
        .filter((sec) => sec.body),
      local: {
        phase,
        gallery: shots.map((sh) => ({ src: sh.url, caption: sh.name })),
        links: filledLinks.map((l) => ({ label: l.label.trim() || "Liên kết", url: l.url.trim(), kind: "other" as const })),
        logoSrc,
        coverSrc,
      },
    };
    // Lưu dự án vào trình duyệt; công bố thì thêm bài Công bố lên Trang chủ.
    myProjectsStore.set((all) => [project, ...all]);
    const published = publish && canPublish;
    if (published)
      postsStore.set((all) => [
        { id: `cb-${slug}`, author: ME, kind: "Công bố", version: "v1", project: slug, when: "vừa xong", text: summary.trim(), likes: 0, comments: [], reposts: 0 },
        ...all,
      ]);
    draftStore.set(null);
    setSavedSlug(slug);
    setDone(published ? "published" : "saved");
  };

  const saveDraft = () => {
    draftStore.set({ title, summary, field, output, context, contextNote, usage, myRole, tools, phase, sections });
    setDraftSaved(true);
  };
  const loadDraft = (d: Draft) => {
    setTitle(d.title);
    setSummary(d.summary);
    setField(d.field);
    setOutput(d.output);
    setContext(d.context);
    setContextNote(d.contextNote);
    setUsage(d.usage);
    setMyRole(d.myRole);
    setTools(d.tools);
    setPhase(d.phase);
    setSections(d.sections);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-ink p-8 text-white">
        <p className="font-display text-3xl font-bold tracking-[-0.03em]">{done === "published" ? `Đã công bố ${title} bản v1` : `Đã lưu ${title}`}</p>
        <p className="mt-2 max-w-[56ch] text-fog">
          {done === "published"
            ? "Bản v1 đã lên Trang chủ. Lần sau có bản mới, bấm Công bố bản mới trên trang dự án."
            : "Dự án nằm trong hồ sơ của bạn. Khi xong bản trình bày, bấm Công bố để đưa lên Trang chủ, hoặc mở Trao đổi để xin góp ý ngay bây giờ."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/p/${savedSlug}`} className="rounded-lg bg-leaf px-5 py-3 font-bold text-ink">
            Xem dự án
          </Link>
          <Link href={done === "published" ? "/community" : "/exchange"} className="rounded-lg border border-ink-line px-5 py-3 font-semibold hover:bg-white/10">
            {done === "published" ? "Xem trên Trang chủ" : "Mở trao đổi"}
          </Link>
          <button onClick={() => window.location.reload()} className="rounded-lg px-5 py-3 font-semibold text-fog hover:bg-white/10">
            Tạo dự án khác
          </button>
        </div>
      </motion.div>
    );
  }

  const miss = (ok: boolean) => tried && !ok;

  return (
    <form className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]" onSubmit={(e) => (e.preventDefault(), submit(false))} noValidate>
      <div className="flex min-w-0 flex-col gap-5">
        {draft && !title && !draftSaved && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4">
            <p className="mr-auto text-[15px]">
              Bạn có bản nháp chưa xong{draft.title ? `: ${draft.title}` : ""}.
            </p>
            <button type="button" onClick={() => loadDraft(draft)} className="h-10 rounded-lg bg-ink px-4 text-sm font-bold text-white hover:bg-ink-2">
              Mở lại bản nháp
            </button>
            <button type="button" onClick={() => draftStore.set(null)} className="h-10 rounded-lg px-3 text-sm font-semibold text-moss hover:bg-mist">
              Bỏ nháp
            </button>
          </div>
        )}
        <Part n={1} title="Đây là gì" hint="Ba lựa chọn dưới đây giúp người xem hiểu đúng dự án của bạn, dù họ khác ngành.">
          <label className={label}>
            Tên dự án
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={miss(!!title.trim())} placeholder="Ví dụ: Nhà phố 4x16m thông gió tự nhiên" className={input} />
          </label>
          <label className={label}>
            Một câu giới thiệu
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              aria-invalid={miss(!!summary.trim())}
              maxLength={160}
              placeholder="Dự án giải quyết chuyện gì, cho ai"
              className={input}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={label}>
              Lĩnh vực
              <select value={field} onChange={(e) => setField(e.target.value as Field)} aria-invalid={miss(!!field)} className={input}>
                <option value="" disabled>
                  Chọn lĩnh vực
                </option>
                {FIELDS.filter((f) => f !== "Tất cả").map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              Dạng đầu ra
              <select
                value={output}
                onChange={(e) => {
                  setOutput(e.target.value as Output);
                  setLayout(null);
                }}
                aria-invalid={miss(!!output)}
                className={input}
              >
                <option value="" disabled>
                  Bạn đang công bố gì
                </option>
                {OUTPUTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              <span>Bối cảnh {optional}</span>
              <select value={context} onChange={(e) => setContext(e.target.value as Context)} className={input}>
                <option value="">Chưa chọn</option>
                {CONTEXTS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="-mt-2 text-[13px] text-moss">
            {output ? `${output}: ${OUTPUTS.find((o) => o.id === output)!.examples}.` : "Dạng đầu ra là thứ bạn làm ra: thiết kế, phần mềm, báo cáo, chiến dịch…"}
          </p>
          {context && (
            <label className={label}>
              <span>Ghi rõ hơn {optional}</span>
              <input
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                maxLength={60}
                placeholder={context === "Học tập" ? "Ví dụ: Đồ án tốt nghiệp, Học phần Marketing căn bản" : context === "Công việc" ? "Ví dụ: Làm cho một quán cà phê ở Quận 3" : "Tên cuộc thi, tổ chức hoặc chương trình"}
                className={input}
              />
            </label>
          )}
          <details className="rounded-lg border border-line px-4 py-3 [&_summary]:cursor-pointer">
            <summary className="text-sm">
              <span className="font-semibold">Mẫu trình bày: {LAYOUTS[shownLayout].name}</span>
              <span className="text-moss"> {output && !layout ? "(tự chọn theo dạng đầu ra)" : ""}. Đổi mẫu</span>
            </summary>
          <fieldset className="mt-3">
            <legend className="sr-only">Mẫu trình bày</legend>
            <p className="mt-1 text-[13px] text-moss">{output ? `Gợi ý theo dạng ${output.toLowerCase()}. Đổi được nếu không hợp.` : "Chọn dạng đầu ra để nhận gợi ý."}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(Object.keys(LAYOUTS) as Layout[]).map((k) => {
                const on = shownLayout === k;
                return (
                  <label
                    key={k}
                    className={`cursor-pointer rounded-lg border px-3.5 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${on ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}
                  >
                    <input type="radio" name="layout" className="sr-only" checked={on} onChange={() => setLayout(k)} />
                    <span className="block text-sm font-bold">
                      {LAYOUTS[k].name}
                      {k === autoLayout && output && <span className="ml-1.5 font-normal text-leaf-deep">gợi ý</span>}
                    </span>
                    <span className="mt-0.5 block text-xs text-moss">{LAYOUTS[k].hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          </details>
        </Part>

        <Part n={2} title="Nội dung" hint="Viết thẳng ở đây hoặc thêm ảnh, tệp, liên kết. Đề mục chỉ là gợi ý, bỏ trống phần chưa có.">
          <div>
            <p className="text-sm font-semibold">Ảnh</p>
            <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shots.map((s, i) => (
                <li key={s.url} className="relative overflow-hidden rounded-lg border border-line">
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
                    data-empty={shots.length === 0}
                    className="flex aspect-[16/10] h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line text-sm font-semibold text-moss hover:border-leaf-deep hover:text-ink data-[empty=true]:aspect-auto data-[empty=true]:py-7"
                  >
                    <ImagePlus className="h-6 w-6" aria-hidden="true" />
                    {shots.length === 0 ? `Thêm ảnh: bản vẽ, ảnh chụp, ấn phẩm (tối đa ${MAX_SHOTS})` : "Thêm ảnh"}
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
              aria-label="Chọn ảnh dự án"
              onChange={(e) => {
                addShots(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div>
            <p className="text-sm font-semibold">Tệp</p>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="mt-2 flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-line px-6 py-6 text-center transition-colors hover:bg-mist"
            >
              <UploadCloud className="h-6 w-6 text-leaf-deep" aria-hidden="true" />
              <span className="font-semibold">Kéo thả tệp hoặc bấm để chọn</span>
              <span className="text-sm text-moss">Báo cáo PDF, hồ sơ thuyết trình, bảng tính, video ngắn. Mỗi tệp tối đa {MAX_FILE_MB} MB.</span>
            </button>
            <input ref={fileInput} type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} aria-label="Chọn tệp dự án" />
            {files.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {files.map((f) => (
                  <li key={f.name} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${f.tooBig ? "border-[#f4b4a8] bg-[#fdf0ed]" : "border-line"}`}>
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
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Liên kết</legend>
            <p className="mt-1 text-[13px] text-moss">Đặt tên tùy ý: Bản demo, Hồ sơ thuyết trình, Bài đăng chiến dịch… Link YouTube, Google Slides, Figma hiện ngay trong trang.</p>
            <ul className="mt-2 flex flex-col gap-2">
              {links.map((l, i) => {
                const emb = l.url.trim() ? toEmbed(l.url) : null;
                const bad = badUrl(l.url);
                return (
                  <li key={l.id} className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)_44px]">
                    <input
                      aria-label={`Tên liên kết ${i + 1}`}
                      value={l.label}
                      onChange={(e) => setLinks(links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))}
                      placeholder="Tên liên kết"
                      className={input}
                    />
                    <div>
                      <input
                        aria-label={`Địa chỉ liên kết ${i + 1}`}
                        inputMode="url"
                        value={l.url}
                        aria-invalid={bad}
                        onChange={(e) => setLinks(links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))}
                        placeholder="https://"
                        className={input}
                      />
                      {(bad || emb) && (
                        <p className={`mt-1 text-[13px] ${bad ? "text-[#b42318]" : "text-leaf-deep"}`}>{bad ? "Cần bắt đầu bằng https://" : `Hiện trong trang: ${emb!.label}`}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setLinks(links.length > 1 ? links.filter((x) => x.id !== l.id) : [{ id: Date.now(), label: "", url: "" }])}
                      aria-label={`Bỏ liên kết ${i + 1}`}
                      className="flex h-12 w-11 items-center justify-center rounded-lg text-moss hover:bg-mist"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            {links.length < 8 && (
              <button type="button" onClick={() => setLinks([...links, { id: Date.now(), label: "", url: "" }])} className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-leaf-deep hover:bg-sap/50">
                <Plus className="h-4 w-4" aria-hidden="true" /> Thêm liên kết
              </button>
            )}
          </fieldset>

          <div className="flex flex-col gap-4 border-t border-line pt-5">
            <p className="text-sm text-moss">
              Đề mục gợi ý của mẫu <strong className="text-ink">{LAYOUTS[shownLayout].name}</strong>
            </p>
            {sectionsFor(shownLayout, phase).map((s) => (
              <label key={s.heading} className={label}>
                <span>
                  {s.heading} {optional}
                </span>
                <textarea rows={2} value={sections[s.heading] ?? ""} onChange={(e) => setSections({ ...sections, [s.heading]: e.target.value })} placeholder={s.prompt} className={area} />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-line pt-5">
            <span className="rounded-2xl bg-white p-1.5 shadow-[0_4px_12px_-6px_rgba(6,17,10,0.35),0_0_0_1px_rgba(6,17,10,0.06)]">
              <ProjectLogo title={title || "Dự án mới"} src={logoSrc} size={64} />
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Logo và bìa {optional}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => logoInput.current?.click()} className="h-10 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-mist">
                  {logoSrc ? "Đổi logo" : "Tải logo lên"}
                </button>
                {logoSrc && (
                  <button type="button" onClick={() => setLogoSrc(undefined)} className="h-10 rounded-lg px-3 text-sm font-semibold text-moss hover:bg-mist hover:text-ink">
                    Dùng chữ cái đầu
                  </button>
                )}
                <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
                {TONES.map((t) => (
                  <label key={t.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      className="peer sr-only"
                      checked={!coverSrc && tone === t.id}
                      onChange={() => {
                        setTone(t.id);
                        setCoverSrc(undefined);
                      }}
                    />
                    <span
                      className="block h-9 w-9 rounded-full border border-line ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-leaf-deep"
                      style={{ background: t.swatch }}
                    />
                    <span className="sr-only">Màu bìa {t.name}</span>
                  </label>
                ))}
                {/* Ô thứ tư: ảnh bìa. Bấm để chọn ảnh sản phẩm, bản vẽ… phủ kín bìa thay cho màu. */}
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  aria-pressed={!!coverSrc}
                  aria-label={coverSrc ? "Đổi ảnh bìa" : "Dùng ảnh làm bìa"}
                  className={`relative flex h-9 items-center gap-1.5 overflow-hidden rounded-full border border-line px-3 text-sm font-semibold ring-offset-2 hover:bg-mist ${coverSrc ? "w-9 px-0 ring-2 ring-ink" : ""}`}
                  style={coverSrc ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  {!coverSrc && (
                    <>
                      <ImagePlus className="h-4 w-4" aria-hidden="true" /> Ảnh bìa
                    </>
                  )}
                </button>
                {coverSrc && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCropping(coverOriginal ?? coverSrc)}
                      className="h-9 rounded-lg border border-line px-3 text-sm font-semibold hover:bg-mist"
                    >
                      Căn chỉnh
                    </button>
                    <button type="button" onClick={() => setCoverSrc(undefined)} className="h-9 rounded-lg px-2.5 text-sm font-semibold text-moss hover:bg-mist hover:text-ink">
                      Bỏ ảnh bìa
                    </button>
                  </>
                )}
              </div>
              <p className="text-[13px] text-moss">
                Ảnh bìa phủ kín bìa thư mục, ví dụ ảnh sản phẩm hoặc phối cảnh. Kéo và phóng to để chọn phần muốn hiện. Có ảnh bìa thì logo không hiện trên bìa.
              </p>
              {cropping && (
                <ImageCropper
                  src={cropping}
                  // Gần đúng tỉ lệ thân bìa trên thẻ dự án và trang dự án, để phần đã chọn hiện gần như nguyên vẹn.
                  ratio={2.2}
                  title="Căn chỉnh ảnh bìa"
                  outputWidth={1400}
                  onCancel={() => setCropping(null)}
                  onDone={(url) => {
                    setCoverSrc(url);
                    setCropping(null);
                  }}
                />
              )}
            </div>
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Chọn ảnh bìa dự án"
              onChange={(e) => {
                const f = e.target.files?.[0];
                // Giữ bản lớn làm ảnh gốc rồi mở khung căn chỉnh ngay.
                if (f)
                  void compressImage(f, 2400, 0.9).then((src) => {
                    setCoverOriginal(src);
                    setCropping(src);
                  });
                e.target.value = "";
              }}
            />
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Chọn logo dự án"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void compressImage(f, 400).then(setLogoSrc);
                e.target.value = "";
              }}
            />
          </div>
        </Part>

        <Part n={3} title="Bạn làm gì" hint="Người xem cần biết phần nào là của bạn, và dự án đã đi tới đâu.">
          <label className={label}>
            Vai trò của bạn
            <input
              value={myRole}
              onChange={(e) => setMyRole(e.target.value)}
              aria-invalid={miss(!!myRole.trim())}
              placeholder="Ví dụ: Thiết kế chính, dựng phối cảnh. Hoặc: Lên kế hoạch, phân tích số liệu"
              className={input}
            />
          </label>

          <div>
            <p className="text-sm font-semibold">Người cùng làm {optional}</p>
            {members.length > 0 && (
              <ul className="mt-2 flex flex-col gap-2">
                {members.map((m, i) => {
                  const u = userOf(m.handle)!;
                  return (
                    <li key={m.handle} className="grid items-center gap-2 sm:grid-cols-[200px_minmax(0,1fr)_44px]">
                      <span className="flex items-center gap-2.5 font-semibold">
                        <Avatar initials={u.initials} tone={u.tone} size={32} /> {u.name}
                      </span>
                      <input
                        aria-label={`Phần ${u.name} làm`}
                        value={m.part}
                        onChange={(e) => setMembers(members.map((x, j) => (j === i ? { ...x, part: e.target.value } : x)))}
                        placeholder="Phần người này làm"
                        className={input}
                      />
                      <button type="button" onClick={() => setMembers(members.filter((_, j) => j !== i))} aria-label={`Bỏ ${u.name}`} className="flex h-11 w-11 items-center justify-center rounded-lg text-moss hover:bg-mist">
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
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
              <button type="button" onClick={addMember} className="h-12 shrink-0 rounded-lg border border-line px-4 font-semibold hover:bg-mist">
                Mời
              </button>
            </div>
            {inviteError && <p className="mt-2 text-sm text-[#b42318]">{inviteError}</p>}
          </div>

          <ChipInput id="cong-cu" title={<>Công cụ {optional}</>} value={tools} onChange={setTools} placeholder="Revit, Figma, Excel, Next.js… (Enter để thêm)" />

          <fieldset>
            <legend className="text-sm font-semibold">Tiến độ</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROGRESS.map(({ id, label: name }) => {
                const on = phase === id;
                return (
                  <label key={id} className={`cursor-pointer rounded-lg border px-3 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${on ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}>
                    <input type="radio" name="phase" className="sr-only" checked={on} onChange={() => setPhase(id)} />
                    <span className="block font-semibold">{name}</span>
                    <span className="mt-0.5 block text-xs text-moss">{output ? levelHint(output, id) : PROGRESS.find((p) => p.id === id)!.hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className={label}>
            <span>Đã đưa vào dùng chưa? {optional}</span>
            <select value={usage} onChange={(e) => setUsage(e.target.value as Usage | "")} className={input}>
              <option value="">Không nói</option>
              {USAGES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <span className="text-[13px] font-normal text-moss">Ví dụ: ứng dụng đang có người dùng, nhà đã thi công, chiến dịch đã chạy.</span>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold">Ai xem được</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { v: "public", icon: Globe2, title: "Công khai", hint: "Ai cũng xem được trang dự án" },
                  { v: "private", icon: Lock, title: "Chỉ mình tôi", hint: "Lưu riêng, công khai lúc nào cũng được" },
                ] as const
              ).map((o) => {
                const on = visibility === o.v;
                return (
                  <label key={o.v} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${on ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}>
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
        </Part>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <p className="text-sm font-semibold text-moss">Xem trước thẻ dự án</p>
        <article className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="bg-mist px-[18px] pt-[22px]">
            <FolderCover tone={tone} title={title || "Dự án mới"} logoSrc={logoSrc} coverSrc={coverSrc} kind={output || undefined} height={176} logoSize={78} />
          </div>
          <div className="flex flex-col gap-2 p-5">
            <div className="flex justify-between gap-3 text-[13px]">
              <span className="font-semibold text-leaf-deep">{field || "Lĩnh vực"}</span>
              <span className="font-semibold text-moss">{phaseLabel(phase)}</span>
            </div>
            <h3 className="font-display text-lg font-bold leading-tight tracking-[-0.02em]">{title || "Tên dự án của bạn"}</h3>
            <dl className="mt-1 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <dt className="text-moss">Bối cảnh</dt>
              <dd className="truncate font-semibold">{contextNote.trim() || context || "Chưa chọn"}</dd>
              <dt className="text-moss">Người làm</dt>
              <dd className="flex items-center gap-2 font-semibold">
                <Avatar initials={me.initials} tone={me.tone} size={22} /> {me.name}
              </dd>
              <dt className="text-moss">Vai trò</dt>
              <dd className="truncate font-semibold">{myRole || "Chưa điền"}</dd>
            </dl>
          </div>
        </article>

        <section className="rounded-xl border border-line bg-white p-5" aria-labelledby="bat-buoc">
          <p id="bat-buoc" className="font-semibold">
            Để lưu và mở Trao đổi
          </p>
          <Checklist items={required} tried={tried} />
          <p className="mt-4 font-semibold">Thêm để công bố lên Trang chủ</p>
          <Checklist items={forPublish} tried={false} />
        </section>

        <button type="submit" className="h-12 rounded-lg bg-ink font-bold text-white hover:bg-ink-2">
          Lưu dự án
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={!canPublish}
          aria-describedby="cong-bo-goi-y"
          className="h-12 rounded-lg bg-leaf font-bold text-ink hover:bg-[#6ee04d] disabled:cursor-not-allowed disabled:bg-mist disabled:text-moss"
        >
          Lưu và công bố bản v1
        </button>
        <p id="cong-bo-goi-y" className="-mt-1 text-[13px] leading-snug text-moss">
          {publishHint}
        </p>
        <button type="button" onClick={saveDraft} className="h-11 rounded-lg border border-line bg-white font-semibold hover:bg-mist">
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

function Checklist({ items, tried }: { items: { label: string; ok: boolean }[]; tried: boolean }) {
  return (
    <ul className="mt-2.5 flex flex-col gap-1.5 text-sm">
      {items.map((c) => (
        <li key={c.label} className={`flex items-start gap-2 ${c.ok ? "" : tried ? "font-semibold text-[#b42318]" : "text-moss"}`}>
          {c.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-line" aria-hidden="true" />}
          {c.label}
        </li>
      ))}
    </ul>
  );
}

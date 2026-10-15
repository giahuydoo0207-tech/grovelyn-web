"use client";

/* eslint-disable @next/next/no-img-element -- ảnh người dùng vừa chọn (blob/data URL) */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Camera, Check, Eye, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { MY_GROUPS as GROUPS, ME, userOf } from "@/lib/data";
import {
  EVENT_MODES,
  SESSION_KINDS,
  SPEAKER_ROLES,
  TODAY,
  dateParts,
  speakerInitials,
  type CommunityEvent,
  type EventMode,
  type Session,
  type SessionKind,
  type Speaker,
} from "@/lib/events";
import { ImageCropper } from "@/components/ImageCropper";
import { EventView } from "../EventView";

const MAX_MB = 25;
const FIELD =
  "h-[46px] w-full rounded-xl border border-[#dfe5da] bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-moss/80 focus:border-leaf-deep focus:ring-2 focus:ring-leaf-deep/20";
const AREA = `${FIELD} h-auto resize-y py-2.5 leading-normal`;
const LABEL = "flex flex-col gap-1.5 text-sm font-bold";
const HINT = "text-xs font-medium text-moss";
const TONES: Speaker["tone"][] = ["ink", "leaf", "sap"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toTime = (x: number) => `${String(Math.floor(x / 60) % 24).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
let uid = 0;
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${uid++}`;

type CropTarget = { kind: "cover" } | { kind: "speaker"; id: string };

function SectionHead({ n, title, extra, children }: { n: number; title: string; extra?: React.ReactNode; children?: React.ReactNode }) {
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

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={onClick} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-leaf px-4 text-sm font-bold text-ink hover:bg-[#6ee04d]">
      <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
      {children}
    </motion.button>
  );
}

/**
 * Trang tạo sự kiện (bản 5): điền theo đúng thứ tự trang chi tiết hiện ra.
 * Speaker và lịch trình thêm, xóa, đổi thứ tự được. Ảnh bìa và ảnh speaker được cắt khung trước khi lưu.
 * Chưa có máy chủ: "Đăng sự kiện" chỉ hiện trạng thái đã đăng trên trình duyệt.
 */
export function EventForm() {
  const me = userOf(ME)!;
  const [title, setTitle] = useState("");
  const [accent, setAccent] = useState("");
  const [description, setDescription] = useState("");
  const [groupSlug, setGroupSlug] = useState(GROUPS[2]?.slug ?? "");
  const [date, setDate] = useState(addDays(TODAY, 7));
  const [from, setFrom] = useState("19:00");
  const [to, setTo] = useState("21:00");
  const [mode, setMode] = useState<EventMode>("Tại chỗ");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  const [link, setLink] = useState("");
  const [venuePhotos, setVenuePhotos] = useState<string[]>([]);
  const [seats, setSeats] = useState(50);
  const [fee, setFee] = useState("Miễn phí");
  const [language, setLanguage] = useState("Tiếng Việt");
  const [asks, setAsks] = useState({ fields: true, question: true, profile: true, approve: false });
  const [cover, setCover] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [agenda, setAgenda] = useState<Session[]>([]);
  const [crop, setCrop] = useState<{ src: string; target: CropTarget } | null>(null);
  const [fileError, setFileError] = useState("");
  const [view, setView] = useState<"edit" | "preview" | "done">("edit");
  const [tried, setTried] = useState(false);

  const coverInput = useRef<HTMLInputElement>(null);
  const speakerInput = useRef<HTMLInputElement>(null);
  const venueInput = useRef<HTMLInputElement>(null);
  const pendingSpeaker = useRef<string | null>(null);

  // Giải phóng ảnh địa điểm khi rời trang (ảnh bị bỏ thì giải phóng ngay lúc bỏ).
  const photosRef = useRef<string[]>([]);
  useEffect(() => {
    photosRef.current = venuePhotos;
  }, [venuePhotos]);
  useEffect(() => () => photosRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const group = GROUPS.find((g) => g.slug === groupSlug);
  const accentOk = !accent || title.toLowerCase().includes(accent.toLowerCase());
  const timeOk = toMin(to) > toMin(from);

  const pickImage = (file: File | undefined, target: CropTarget) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFileError("Chỉ nhận tệp ảnh (JPG, PNG, WebP).");
    if (file.size > MAX_MB * 1024 * 1024) return setFileError(`Ảnh ${(file.size / 1048576).toFixed(1)} MB, quá giới hạn ${MAX_MB} MB.`);
    setFileError("");
    setCrop({ src: URL.createObjectURL(file), target });
  };

  const closeCrop = () => {
    if (crop) URL.revokeObjectURL(crop.src);
    setCrop(null);
  };

  const patchSpeaker = (id: string, p: Partial<Speaker>) => setSpeakers((l) => l.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const patchSession = (id: string, p: Partial<Session>) => setAgenda((l) => l.map((a) => (a.id === id ? { ...a, ...p } : a)));
  const moveUp = <T,>(list: T[], i: number) => {
    if (i === 0) return list;
    const l = list.slice();
    [l[i - 1], l[i]] = [l[i], l[i - 1]];
    return l;
  };

  const addSpeaker = () =>
    setSpeakers((l) => [...l, { id: newId("sp"), name: "", role: l.length ? "Chủ đề" : "Chia sẻ chính", title: "", bio: "", tone: TONES[l.length % TONES.length] }]);
  const addSession = () =>
    setAgenda((l) => {
      const start = l.length ? l[l.length - 1].to : from;
      return [...l, { id: newId("ss"), from: start, to: toTime(toMin(start) + 15), kind: (l.length ? "Chủ đề" : "Đón khách") as SessionKind, title: "", note: "", speakers: [] }];
    });
  const nextStart = agenda.length ? agenda[agenda.length - 1].to : from;

  const event: CommunityEvent = useMemo(
    () => ({
      slug: "ban-nhap",
      title,
      accent: accent || undefined,
      description,
      date,
      from,
      to,
      mode,
      venue: mode === "Trực tuyến" ? undefined : { name: venueName || "Chưa có địa điểm", address: address || "Chưa có địa chỉ", directions, photos: venuePhotos.map((src, i) => ({ src, alt: `Ảnh địa điểm ${i + 1}` })) },
      seats,
      registered: 0,
      interested: 0,
      fee,
      language,
      host: ME,
      group: group ? { name: group.name, mark: group.mark, tone: group.tone } : undefined,
      cover: cover ?? undefined,
      coverSeed: 21,
      coverTone: "ink",
      speakers,
      agenda,
      asks,
    }),
    [title, accent, description, date, from, to, mode, venueName, address, directions, venuePhotos, seats, fee, language, group, cover, speakers, agenda, asks],
  );

  const problems = [
    !title.trim() && "Đặt tên sự kiện",
    !description.trim() && "Viết mô tả",
    !timeOk && "Giờ kết thúc phải sau giờ bắt đầu",
    mode !== "Trực tuyến" && !address.trim() && "Điền địa chỉ",
    mode !== "Tại chỗ" && !link.trim() && "Điền link tham gia",
    speakers.some((s) => !s.name.trim()) && "Đặt tên cho mọi speaker",
    agenda.some((a) => !a.title.trim()) && "Đặt tiêu đề cho mọi mục lịch trình",
  ].filter(Boolean) as string[];

  const overlaps = agenda.map((a, i) => i > 0 && toMin(a.from) < toMin(agenda[i - 1].to));

  const nav = [
    { id: "s-anh", label: "Ảnh bìa", ok: !!cover, meta: cover ? "" : "tùy chọn" },
    { id: "s-tt", label: "Nội dung chính", ok: !!title.trim() && !!description.trim() && accentOk, meta: "" },
    { id: "s-tg", label: "Thời gian và địa điểm", ok: timeOk && (mode === "Trực tuyến" || !!address.trim()) && (mode === "Tại chỗ" || !!link.trim()), meta: mode },
    { id: "s-sp", label: "Speaker", ok: speakers.length > 0 && speakers.every((s) => s.name.trim() && s.bio.trim()), meta: `${speakers.length} người` },
    { id: "s-lt", label: "Lịch trình", ok: agenda.length > 0 && agenda.every((a) => a.title.trim()) && !overlaps.some(Boolean), meta: `${agenda.length} mục` },
    { id: "s-dk", label: "Đăng ký", ok: seats > 0, meta: `${seats} chỗ` },
  ];

  const publish = () => {
    setTried(true);
    if (problems.length) {
      setView("edit");
      return;
    }
    setView("done");
  };

  if (view === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-3xl bg-ink p-8 text-white sm:p-10">
        <p className="font-display text-3xl font-bold tracking-[-0.03em]">Đã đăng {title}</p>
        <p className="mt-2 text-fog">
          {dateParts(date).long}, {from} đến {to}. Thành viên nhóm {group?.name ?? "của bạn"} sẽ nhận thông báo.
        </p>
        <p className="mt-1 text-sm text-fog">Bản giao diện: sự kiện chưa được lưu lên máy chủ.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setView("preview")} className="h-12 rounded-xl bg-leaf px-5 font-bold text-ink">
            Xem trang sự kiện
          </button>
          <Link href="/events" className="flex h-12 items-center rounded-xl border border-ink-line px-5 font-semibold hover:bg-white/10">
            Về trang Sự kiện
          </Link>
        </div>
      </motion.div>
    );
  }

  if (view === "preview") {
    return (
      <div>
        <div className="sticky top-[72px] z-20 mx-auto mt-4 flex max-w-[1180px] flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4 text-leaf" aria-hidden="true" />
            Đang xem trước, người khác chưa thấy trang này
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView("edit")} className="h-10 rounded-full border border-ink-line px-4 text-sm font-semibold hover:bg-white/10">
              Quay lại sửa
            </button>
            <button type="button" onClick={publish} className="h-10 rounded-full bg-leaf px-4 text-sm font-bold text-ink">
              Đăng sự kiện
            </button>
          </div>
        </div>
        <div className="mt-6">
          <EventView event={event} preview />
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-2 font-display text-[clamp(2.2rem,4.4vw,2.5rem)] font-bold leading-none tracking-[-0.035em]">Tạo sự kiện</h1>
      <p className="mt-2 text-moss">Điền theo đúng thứ tự trang sự kiện sẽ hiện ra.</p>

      <input ref={coverInput} type="file" accept="image/*" className="sr-only" aria-label="Chọn ảnh bìa" onChange={(e) => (pickImage(e.target.files?.[0], { kind: "cover" }), (e.target.value = ""))} />
      <input
        ref={speakerInput}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Chọn ảnh speaker"
        onChange={(e) => {
          const id = pendingSpeaker.current;
          if (id) pickImage(e.target.files?.[0], { kind: "speaker", id });
          e.target.value = "";
        }}
      />
      <input
        ref={venueInput}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label="Chọn ảnh địa điểm"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/") && f.size <= MAX_MB * 1048576);
          setVenuePhotos((l) => [...l, ...files.map((f) => URL.createObjectURL(f))].slice(0, 4));
          e.target.value = "";
        }}
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form
          className="flex min-w-0 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            publish();
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

          <section id="s-anh" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={1} title="Ảnh bìa" />
            <p className={`mt-1.5 ${HINT}`}>Tỉ lệ 2:1, tối đa {MAX_MB} MB. Ô ngày tự hiện ở góc dưới theo ngày bạn chọn.</p>
            <div className="relative mt-3.5 aspect-[2/1] overflow-hidden rounded-2xl bg-mist">
              {cover ? (
                <img src={cover} alt="Ảnh bìa đã chọn" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pickImage(e.dataTransfer.files[0], { kind: "cover" });
                  }}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c9d0c4] text-moss hover:bg-sap/40"
                >
                  <ImagePlus className="h-9 w-9 text-leaf-deep" aria-hidden="true" />
                  <span className="font-semibold text-ink">Kéo thả ảnh hoặc bấm để chọn</span>
                  <span className="text-sm">Chọn xong bạn kéo và phóng to cho vừa khung</span>
                </button>
              )}
              <span className="pointer-events-none absolute bottom-4 left-4">
                <span className="block w-14 overflow-hidden rounded-xl bg-white text-center shadow-md" aria-hidden="true">
                  <span className="block bg-ink py-0.5 text-[11px] font-bold text-leaf">{dateParts(date).tag}</span>
                  <span className="block pb-1 font-display text-[22px] font-bold leading-tight">{dateParts(date).day}</span>
                </span>
              </span>
              {cover && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button type="button" onClick={() => coverInput.current?.click()} className="h-9 rounded-full bg-white px-3.5 text-[13px] font-bold shadow">
                    Đổi ảnh
                  </button>
                  <button type="button" onClick={() => setCover(null)} className="h-9 rounded-full bg-ink/75 px-3.5 text-[13px] font-bold text-white">
                    Bỏ ảnh
                  </button>
                </div>
              )}
            </div>
          </section>

          <section id="s-tt" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={2} title="Nội dung chính" />
            <p className={`mt-1.5 ${HINT}`}>Hiện ở bên trái, cạnh khung đăng ký.</p>
            <div className="mt-4 flex flex-col gap-4">
              <label className={LABEL}>
                Tổ chức bởi
                <select className={FIELD} value={groupSlug} onChange={(e) => setGroupSlug(e.target.value)}>
                  {GROUPS.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      Nhóm {g.name}
                    </option>
                  ))}
                  <option value="">Cá nhân {me.name}</option>
                </select>
              </label>
              <label className={LABEL}>
                Tên sự kiện
                <input className={FIELD} value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Làm portfolio cho người trái ngành" aria-invalid={tried && !title.trim()} />
              </label>
              <label className={LABEL}>
                Cụm chữ tô xanh
                <input className={FIELD} value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="Để trống nếu không cần" aria-invalid={!accentOk} aria-describedby="accent-hint" />
                <span id="accent-hint" className={accentOk ? HINT : "text-xs font-semibold text-[#b42318]"}>
                  {accentOk ? "Lấy 1 đến 3 chữ có trong tên, ví dụ: trái ngành" : "Cụm này không có trong tên sự kiện."}
                </span>
              </label>
              <label className={LABEL}>
                Mô tả
                <textarea rows={4} className={AREA} value={description} maxLength={400} onChange={(e) => setDescription(e.target.value)} placeholder="Buổi này giải quyết chuyện gì, ai nên đến" aria-invalid={tried && !description.trim()} />
                <span className={`${HINT} text-right tabular-nums`}>{description.length} / 400</span>
              </label>
            </div>
          </section>

          <section id="s-tg" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={3} title="Thời gian và địa điểm" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className={LABEL}>
                Ngày
                <input className={FIELD} type="date" min={TODAY} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
              </label>
              <label className={LABEL}>
                Bắt đầu
                <input className={FIELD} type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className={LABEL}>
                Kết thúc
                <input className={FIELD} type="time" value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!timeOk} />
              </label>
            </div>
            {!timeOk && <p className="mt-2 text-sm font-semibold text-[#b42318]">Giờ kết thúc phải sau giờ bắt đầu.</p>}

            <fieldset className="mt-4">
              <legend className="text-sm font-bold">Hình thức</legend>
              <div role="radiogroup" className="mt-2 inline-flex gap-1 rounded-full bg-mist p-1">
                {EVENT_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={`relative h-[38px] rounded-full px-4 text-sm font-bold transition-colors ${mode === m ? "text-white" : "text-moss hover:text-ink"}`}
                  >
                    {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                    <span className="relative">{m}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <AnimatePresence initial={false}>
              {mode !== "Trực tuyến" && (
                <motion.div key="place" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className={LABEL}>
                      Tên địa điểm
                      <input className={FIELD} value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Ví dụ: Xưởng Lá Coworking" />
                    </label>
                    <label className={LABEL}>
                      Địa chỉ
                      <input className={FIELD} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường, tỉnh thành" aria-invalid={tried && !address.trim()} />
                    </label>
                  </div>
                  <label className={`${LABEL} mt-3`}>
                    Hướng dẫn đến nơi
                    <input className={FIELD} value={directions} onChange={(e) => setDirections(e.target.value)} placeholder="Tầng mấy, gửi xe ở đâu" />
                  </label>
                  <p className="mt-4 text-sm font-bold">
                    Ảnh địa điểm <span className={HINT}>tối đa 4 ảnh, hiện ở cuối trang</span>
                  </p>
                  <ul className="mt-2 grid grid-cols-4 gap-2.5">
                    {venuePhotos.map((src, i) => (
                      <li key={src} className="relative">
                        <img src={src} alt={`Ảnh địa điểm ${i + 1}`} className="aspect-[3/4] w-full rounded-xl object-cover" />
                        <button
                          type="button"
                          aria-label={`Bỏ ảnh ${i + 1}`}
                          onClick={() => {
                            URL.revokeObjectURL(src);
                            setVenuePhotos((l) => l.filter((x) => x !== src));
                          }}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-white"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                    {venuePhotos.length < 4 && (
                      <li>
                        <button
                          type="button"
                          onClick={() => venueInput.current?.click()}
                          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#c9d0c4] text-[13px] font-semibold text-moss hover:bg-sap/40"
                        >
                          <Plus className="h-5 w-5" aria-hidden="true" />
                          Thêm ảnh
                        </button>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            {mode !== "Tại chỗ" && (
              <label className={`${LABEL} mt-4`}>
                Link tham gia
                <input className={FIELD} type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." aria-invalid={tried && !link.trim()} />
                <span className={HINT}>Chỉ người đã đăng ký mới thấy link.</span>
              </label>
            )}
          </section>

          <section id="s-sp" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={4} title="Speaker" extra={<span className="text-sm font-semibold text-moss">{speakers.length}</span>}>
              <AddButton onClick={addSpeaker}>Thêm speaker</AddButton>
            </SectionHead>
            <p className={`mt-1.5 ${HINT}`}>Mỗi speaker có ảnh đại diện tròn và đoạn giới thiệu ngắn.</p>
            <ul className="mt-4 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {speakers.map((s, i) => (
                  <motion.li key={s.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                    <article className="grid gap-4 rounded-2xl border border-line bg-[#fbfcfa] p-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            pendingSpeaker.current = s.id;
                            speakerInput.current?.click();
                          }}
                          aria-label={s.photo ? `Đổi ảnh của ${s.name || "speaker"}` : `Tải ảnh cho ${s.name || "speaker"}`}
                          className="group relative h-24 w-24 rounded-full"
                        >
                          {s.photo ? (
                            <span className="block h-full w-full rounded-full bg-leaf p-1">
                              <img src={s.photo} alt="" className="h-full w-full rounded-full object-cover ring-[3px] ring-white" />
                            </span>
                          ) : (
                            <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-[#c9d0c4] bg-white text-xs font-semibold text-moss group-hover:bg-sap/40">
                              <Camera className="h-[22px] w-[22px]" aria-hidden="true" />
                              Tải ảnh
                            </span>
                          )}
                        </button>
                        <span className={`${HINT} text-center`}>{s.photo ? "Bấm để đổi ảnh" : "Ảnh vuông, cắt tròn"}</span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-3">
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <label className={LABEL}>
                            Tên
                            <input className={FIELD} value={s.name} onChange={(e) => patchSpeaker(s.id, { name: e.target.value })} placeholder="Họ và tên" aria-invalid={tried && !s.name.trim()} />
                          </label>
                          <label className={LABEL}>
                            Vai trò
                            <select className={FIELD} value={s.role} onChange={(e) => patchSpeaker(s.id, { role: e.target.value })}>
                              {SPEAKER_ROLES.map((r) => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <label className={LABEL}>
                          Chức danh
                          <input className={FIELD} value={s.title} onChange={(e) => patchSpeaker(s.id, { title: e.target.value })} placeholder="Ví dụ: Thiết kế nhận diện, nhóm Freelance thiết kế" />
                        </label>
                        <label className={LABEL}>
                          Giới thiệu ngắn
                          <textarea rows={3} maxLength={280} className={AREA} value={s.bio} onChange={(e) => patchSpeaker(s.id, { bio: e.target.value })} placeholder="2 đến 3 câu: người này là ai, vì sao nên nghe" />
                          <span className={`${HINT} text-right tabular-nums`}>{s.bio.length} / 280</span>
                        </label>
                        <div className="flex justify-end gap-1">
                          {i > 0 && (
                            <button type="button" onClick={() => setSpeakers((l) => moveUp(l, i))} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-moss hover:bg-mist">
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                              Lên
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSpeakers((l) => l.filter((x) => x.id !== s.id));
                              setAgenda((l) => l.map((a) => ({ ...a, speakers: a.speakers.filter((w) => w !== s.id) })));
                            }}
                            className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-bold text-[#b42318] hover:bg-[#fdf0ed]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </article>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {speakers.length === 0 && <p className="mt-3 rounded-2xl border border-dashed border-[#c9d0c4] p-5 text-center text-sm text-moss">Chưa có speaker. Bấm Thêm speaker để bắt đầu.</p>}
          </section>

          <section id="s-lt" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={5} title="Lịch trình" extra={<span className="text-sm font-semibold text-moss">{agenda.length}</span>}>
              <AddButton onClick={addSession}>Thêm mục</AddButton>
            </SectionHead>
            <p className={`mt-1.5 ${HINT}`}>Mục mới tự nối tiếp giờ kết thúc của mục trước, mặc định 15 phút.</p>
            <ol className="mt-4">
              <AnimatePresence initial={false}>
                {agenda.map((a, i) => (
                  <motion.li key={a.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                    <span className="flex flex-col items-center" aria-hidden="true">
                      <span className={`h-[22px] w-0.5 ${i === 0 ? "bg-transparent" : "bg-[#d6ddd1]"}`} />
                      <span className={`h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${a.kind === "Chia sẻ chính" || a.kind === "Chủ đề" ? "bg-leaf-deep" : a.kind === "Thảo luận" ? "bg-leaf" : "bg-fog"}`} />
                      <span className={`w-0.5 flex-1 ${i === agenda.length - 1 ? "bg-transparent" : "bg-[#d6ddd1]"}`} />
                    </span>
                    <div className={`mb-3 rounded-2xl border bg-[#fbfcfa] p-3.5 ${overlaps[i] ? "border-[#f4b4a8]" : "border-line"}`}>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[110px_110px_minmax(0,1fr)]">
                        <label className={LABEL}>
                          Từ
                          <input className={FIELD} type="time" value={a.from} onChange={(e) => patchSession(a.id, { from: e.target.value })} />
                        </label>
                        <label className={LABEL}>
                          Đến
                          <input className={FIELD} type="time" value={a.to} onChange={(e) => patchSession(a.id, { to: e.target.value })} />
                        </label>
                        <label className={`${LABEL} col-span-2 sm:col-span-1`}>
                          Loại phiên
                          <select className={FIELD} value={a.kind} onChange={(e) => patchSession(a.id, { kind: e.target.value as SessionKind })}>
                            {SESSION_KINDS.map((k) => (
                              <option key={k}>{k}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {overlaps[i] && <p className="mt-2 text-[13px] font-semibold text-[#b42318]">Mục này bắt đầu trước khi mục trên kết thúc.</p>}
                      <label className={`${LABEL} mt-2.5`}>
                        Tiêu đề
                        <input className={FIELD} value={a.title} onChange={(e) => patchSession(a.id, { title: e.target.value })} placeholder="Ví dụ: Chọn 3 dự án để khoe" aria-invalid={tried && !a.title.trim()} />
                      </label>
                      <label className={`${LABEL} mt-2.5`}>
                        Nội dung
                        <textarea rows={2} className={AREA} value={a.note} onChange={(e) => patchSession(a.id, { note: e.target.value })} placeholder="Một đến hai câu về phần này" />
                      </label>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-sm font-bold">Speaker</span>
                        {speakers.length === 0 && <span className={HINT}>Thêm speaker ở mục 4 để gắn vào đây</span>}
                        {speakers.map((s) => {
                          const on = a.speakers.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => patchSession(a.id, { speakers: on ? a.speakers.filter((w) => w !== s.id) : [...a.speakers, s.id] })}
                              className={`inline-flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-3 text-[13px] font-semibold transition-colors ${on ? "border-leaf-deep bg-sap" : "border-line bg-white hover:bg-mist"}`}
                            >
                              {s.photo ? (
                                <img src={s.photo} alt="" className="h-6 w-6 rounded-full object-cover" />
                              ) : (
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${s.tone === "ink" ? "bg-ink text-leaf" : s.tone === "leaf" ? "bg-leaf text-ink" : "bg-sap text-leaf-deep"}`}>
                                  {speakerInitials(s.name)}
                                </span>
                              )}
                              {s.name || "Chưa đặt tên"}
                              {on && <Check className="h-3.5 w-3.5 text-leaf-deep" aria-hidden="true" />}
                            </button>
                          );
                        })}
                        <span className="flex-1" />
                        {i > 0 && (
                          <button type="button" onClick={() => setAgenda((l) => moveUp(l, i))} className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-semibold text-moss hover:bg-mist">
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            Lên
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setAgenda((l) => l.filter((x) => x.id !== a.id))}
                          className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-bold text-[#b42318] hover:bg-[#fdf0ed]"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            <button type="button" onClick={addSession} className="mt-1 h-11 w-full rounded-[14px] border-2 border-dashed border-[#c9d0c4] text-sm font-bold text-leaf-deep hover:bg-sap/40">
              Thêm mục lúc {nextStart}
            </button>
          </section>

          <section id="s-dk" className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <SectionHead n={6} title="Đăng ký" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className={LABEL}>
                Số chỗ
                <input className={FIELD} type="number" min={1} max={2000} value={seats} onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))} />
              </label>
              <label className={LABEL}>
                Phí
                <select className={FIELD} value={fee === "Miễn phí" ? fee : "Có phí"} onChange={(e) => setFee(e.target.value === "Miễn phí" ? "Miễn phí" : "50.000 đồng")}>
                  <option>Miễn phí</option>
                  <option>Có phí</option>
                </select>
              </label>
              <label className={LABEL}>
                Ngôn ngữ
                <select className={FIELD} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>Tiếng Việt</option>
                  <option>Tiếng Anh</option>
                  <option>Song ngữ</option>
                </select>
              </label>
            </div>
            {fee !== "Miễn phí" && (
              <label className={`${LABEL} mt-3`}>
                Mức phí
                <input className={FIELD} value={fee} onChange={(e) => setFee(e.target.value)} />
              </label>
            )}
            <p className="mt-4 text-sm font-bold">Hỏi thêm trong form</p>
            <p className={HINT}>Họ tên, email, số điện thoại luôn có. Bật thêm nếu cần.</p>
            <div className="mt-2.5 flex flex-col gap-2">
              {(
                [
                  ["fields", "Ngành hiện tại và ngành muốn sang"],
                  ["question", "Cho gửi câu hỏi cho speaker"],
                  ["profile", "Cho gửi kèm hồ sơ Grovelyn"],
                  ["approve", "Duyệt người đăng ký trước khi nhận"],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-3.5 py-3">
                  <span className="text-sm font-semibold">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={asks[k]}
                    aria-label={label}
                    onClick={() => setAsks((x) => ({ ...x, [k]: !x[k] }))}
                    className={`flex h-[26px] w-[46px] shrink-0 rounded-full p-[3px] transition-colors ${asks[k] ? "justify-end bg-leaf-deep" : "justify-start bg-[#c9d0c4]"}`}
                  >
                    <motion.span layout className="h-5 w-5 rounded-full bg-white" transition={{ type: "spring", stiffness: 600, damping: 35 }} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </form>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px]">
          <nav aria-label="Các phần" className="rounded-[20px] border border-line bg-white p-2.5">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex h-[42px] items-center gap-2.5 rounded-[10px] px-2.5 text-sm font-semibold hover:bg-mist">
                <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${n.ok ? "bg-leaf-deep text-white" : "bg-line"}`}>
                  {n.ok && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-label="Đã xong" />}
                </span>
                <span className="flex-1">{n.label}</span>
                <span className="text-xs text-moss">{n.meta}</span>
              </a>
            ))}
          </nav>
          {tried && problems.length > 0 && (
            <div role="alert" className="rounded-2xl bg-[#fdf0ed] p-4 text-sm text-[#b42318]">
              <p className="font-bold">Còn thiếu trước khi đăng</p>
              <ul className="mt-1.5 list-disc pl-4">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" onClick={() => setView("preview")} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full border border-ink bg-white font-bold hover:bg-mist">
            <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
            Xem trước trang
          </button>
          <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={publish} className="h-[50px] rounded-full bg-leaf text-base font-bold text-ink hover:bg-[#6ee04d]">
            Đăng sự kiện
          </motion.button>
        </aside>
      </div>

      {crop && (
        <ImageCropper
          src={crop.src}
          ratio={crop.target.kind === "cover" ? 2 : 1}
          round={crop.target.kind === "speaker"}
          title={crop.target.kind === "cover" ? "Chỉnh khung ảnh bìa" : "Chỉnh khung ảnh speaker"}
          outputWidth={crop.target.kind === "cover" ? 1600 : 400}
          onCancel={closeCrop}
          onDone={(url) => {
            const t = crop.target;
            if (t.kind === "cover") setCover(url);
            else patchSpeaker(t.id, { photo: url });
            closeCrop();
          }}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ImagePlus, Link2, Plus, Sprout, X } from "lucide-react";
import { ME, userOf } from "@/lib/data";
import { toEmbed } from "@/lib/embed";
import { PHASES, currentPhase, phaseLabel, type Milestone, type Phase, type Shot } from "@/lib/showcase";
import { Avatar } from "@/components/Avatar";
import { Embed } from "./Embed";
import { Gallery } from "./Gallery";

const MAX_SHOTS = 4;
const storageKey = (slug: string) => `grovelyn-journey-v1:${slug}`;

function loadLocal(slug: string): Milestone[] {
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const list = raw ? (JSON.parse(raw) as Milestone[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveLocal(slug: string, list: Milestone[]): boolean {
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** Thu nhỏ ảnh về tối đa 1280px để lưu được trong trình duyệt (bản giao diện chưa có kho lưu trữ). */
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not an image"));
    };
    image.src = url;
  });
}

/**
 * Hành trình dự án: các cột mốc từ ý tưởng tới bản cuối, để người xem thấy dự án lớn lên thế nào chứ không chỉ kết quả.
 * Người làm dự án đăng thêm cột mốc ngay tại đây.
 */
export function Journey({ slug, seed, canEdit }: { slug: string; seed: Milestone[]; canEdit: boolean }) {
  const [local, setLocal] = useState<Milestone[]>([]);
  const [composing, setComposing] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    // Đọc sau khi mount: server không có localStorage.
    const id = window.setTimeout(() => setLocal(loadLocal(slug)), 0);
    return () => window.clearTimeout(id);
  }, [slug]);

  const all = [...local, ...seed];
  const now = currentPhase(all);
  const reached = PHASES.findIndex((p) => p.id === now);

  const add = (m: Milestone) => {
    const next = [m, ...local];
    setLocal(next);
    setUnsaved(!saveLocal(slug, next));
    setComposing(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Mức thực hiện của dự án" className="rounded-2xl bg-mist p-5">
        <ol className="grid grid-cols-3 gap-x-2 gap-y-4">
          {PHASES.map((p, i) => {
            const done = i <= reached;
            return (
              <li key={p.id} className="flex flex-col gap-2">
                <span className={`h-1.5 rounded-full ${done ? "bg-leaf-deep" : "bg-line"}`} />
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {i < reached ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : i === reached ? <Sprout className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : null}
                  <span className={done ? "text-ink" : "text-moss"}>{p.label}</span>
                  {i === reached && <span className="sr-only">(đang ở giai đoạn này)</span>}
                </span>
                <span className="hidden text-xs text-moss sm:block">{p.hint}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {canEdit && !composing && (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-line px-5 py-4 text-left transition-colors hover:border-leaf-deep hover:bg-sap/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-ink">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-semibold">Cập nhật cột mốc</span>
            <span className="text-sm text-moss">Dự án vừa tiến thêm bước nào? Đăng ảnh, ghi chú hoặc link Figma, YouTube, Drive.</span>
          </span>
        </button>
      )}
      {unsaved && (
        <p role="status" className="rounded-xl bg-[#fff4e5] px-4 py-3 text-sm text-[#7a4b00]">
          Trình duyệt hết chỗ lưu ảnh. Cột mốc vẫn hiện nhưng sẽ mất khi tải lại trang.
        </p>
      )}
      <AnimatePresence>{composing && <Composer current={now} onCancel={() => setComposing(false)} onAdd={add} />}</AnimatePresence>

      <ol className="relative ml-3 flex flex-col gap-10 border-l-2 border-line pl-7">
        {all.map((m, i) => {
          const author = m.by ? userOf(m.by) : undefined;
          const firstOfPhase = all.findIndex((x) => x.phase === m.phase) === i;
          return (
            <motion.li key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }} className="relative">
              <span
                className={`absolute -left-[39px] top-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full ${i === 0 ? "bg-leaf" : "border-2 border-line bg-white"}`}
                aria-hidden="true"
              >
                {i === 0 && <span className="h-2 w-2 rounded-full bg-ink" />}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.phase === "final" ? "bg-ink text-white" : m.phase === "draft" ? "bg-sap text-leaf-deep" : "bg-mist text-moss"}`}>
                  {phaseLabel(m.phase)}
                </span>
                {m.version && <span className="font-display text-sm font-bold">{m.version}</span>}
                <span className="text-sm text-moss">{m.when}</span>
                {i === 0 && <span className="text-xs font-semibold text-leaf-deep">Mới nhất</span>}
              </div>
              <h3 className={`mt-2 font-display font-bold tracking-[-0.02em] ${firstOfPhase ? "text-xl" : "text-lg"}`}>{m.title}</h3>
              {m.note && <p className="mt-1.5 max-w-[64ch] text-[15px] leading-relaxed text-ink/85">{m.note}</p>}
              {author && (
                <p className="mt-2 flex items-center gap-2 text-sm text-moss">
                  <Avatar initials={author.initials} tone={author.tone} size={22} /> {author.name}
                </p>
              )}
              {m.shots && m.shots.length > 0 && (
                <div className="mt-4">
                  <Gallery compact shots={m.shots} label={`Ảnh của cột mốc ${m.title}`} />
                </div>
              )}
              {m.embed && (
                <div className="mt-4 max-w-xl">
                  <Embed url={m.embed} title={m.title} />
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function Composer({ current, onCancel, onAdd }: { current: Phase; onCancel: () => void; onAdd: (m: Milestone) => void }) {
  const [phase, setPhase] = useState<Phase>(current);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const embed = link.trim() ? toEmbed(link) : null;
  const badLink = link.trim() !== "" && !embed && !/^https:\/\//.test(link.trim());

  const pick = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const room = MAX_SHOTS - shots.length;
    const chosen = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length > room) setError(`Mỗi cột mốc tối đa ${MAX_SHOTS} ảnh.`);
    try {
      const added = await Promise.all(chosen.map(async (f) => ({ src: await shrink(f), caption: f.name.replace(/\.[^.]+$/, "") })));
      setShots((s) => [...s, ...added]);
    } catch {
      setError("Có tệp không đọc được như ảnh.");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || badLink) return;
        onAdd({
          id: `local-${Date.now()}`,
          phase,
          title: title.trim(),
          note: note.trim(),
          when: "vừa xong",
          shots,
          embed: link.trim() || undefined,
          by: ME,
        });
      }}
      className="flex flex-col gap-5 rounded-2xl border border-line p-5 sm:p-6"
      aria-label="Cập nhật cột mốc"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.02em]">Cột mốc mới</h3>
        <button type="button" onClick={onCancel} aria-label="Hủy" className="flex h-10 w-10 items-center justify-center rounded-full text-moss hover:bg-mist hover:text-ink">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Mức thực hiện</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PHASES.map((p) => (
            <label key={p.id} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${phase === p.id ? "border-ink bg-sap/50" : "border-line hover:bg-mist"}`}>
              <input type="radio" name="phase" className="sr-only" checked={phase === p.id} onChange={() => setPhase(p.id)} />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm font-semibold">
        Tiêu đề
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Chốt mặt bằng tầng 2"
          className="h-12 rounded-xl border border-line px-4 text-[15px] font-normal outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Thay đổi gì, vì sao
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi ngắn điều bạn đã thử, góp ý nhận được và lý do chỉnh"
          className="rounded-xl border border-line px-4 py-3 text-[15px] font-normal leading-relaxed outline-none focus:border-ink"
        />
      </label>

      <div>
        <p className="text-sm font-semibold">Ảnh</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {shots.map((s, i) => (
            <div key={i} className="relative h-20 w-28 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.caption} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setShots((list) => list.filter((_, j) => j !== i))}
                aria-label={`Bỏ ảnh ${s.caption}`}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {shots.length < MAX_SHOTS && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-semibold text-moss hover:border-leaf-deep hover:text-ink"
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" /> Thêm ảnh
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" aria-label="Chọn ảnh cho cột mốc" onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
        {error && <p className="mt-2 text-sm text-[#b42318]">{error}</p>}
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold">
        <span className="flex items-center gap-1.5"><Link2 className="h-4 w-4" aria-hidden="true" /> Link nhúng (không bắt buộc)</span>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          inputMode="url"
          placeholder="Dán link Figma, YouTube, Google Drive hoặc file PDF"
          className="h-12 rounded-xl border border-line px-4 text-[15px] font-normal outline-none focus:border-ink"
        />
        {embed && <span className="text-sm font-normal text-leaf-deep">Sẽ nhúng {embed.label} ngay trong cột mốc.</span>}
        {link.trim() && !embed && !badLink && <span className="text-sm font-normal text-moss">Không nhúng được, sẽ hiện như link thường.</span>}
        {badLink && <span className="text-sm font-normal text-[#b42318]">Link cần bắt đầu bằng https://</span>}
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="h-12 rounded-xl bg-leaf px-6 font-bold text-ink hover:bg-[#6ee04d]">
          Đăng cột mốc
        </button>
        <button type="button" onClick={onCancel} className="h-12 rounded-xl px-5 font-semibold text-moss hover:bg-mist hover:text-ink">
          Hủy
        </button>
      </div>
      <p className="text-xs text-moss">Bản giao diện: cột mốc lưu trong trình duyệt này.</p>
    </motion.form>
  );
}

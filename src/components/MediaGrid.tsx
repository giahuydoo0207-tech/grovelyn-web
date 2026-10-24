"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Play, X } from "lucide-react";
import { MAX_MEDIA, MAX_VIDEO_MB, type Media } from "@/lib/media";

/**
 * Lưới ảnh và video: một tấm thì to, hai tấm chia đôi, ba tấm trở lên thì tấm đầu to.
 * Bấm vào để xem lớn; video phát ngay trong lưới hoặc trong khung xem lớn.
 */
export function MediaGrid({ media, compact = false }: { media: Media[]; compact?: boolean }) {
  const [view, setView] = useState<number | null>(null);
  if (!media.length) return null;
  const shown = media.slice(0, 4);
  const more = media.length - shown.length;
  const h = compact ? "h-[150px]" : "h-[260px] sm:h-[340px]";
  const layout =
    shown.length === 1 ? "grid-cols-1" : shown.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2 [&>*:first-child]:row-span-2";

  return (
    <>
      <div className={`grid gap-1 overflow-hidden rounded-xl border border-line bg-mist ${layout} ${h}`}>
        {shown.map((m, i) => (
          <button
            key={m.src + i}
            type="button"
            onClick={() => setView(i)}
            aria-label={`${m.type === "video" ? "Xem video" : "Xem ảnh"}: ${m.alt}`}
            className="group relative h-full min-h-0 w-full overflow-hidden bg-white"
          >
            {m.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng tải lên là blob:, không qua next/image được
              <img src={m.src} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            ) : (
              <>
                {m.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.poster} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={m.src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-ink/15">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg">
                    <Play className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden="true" />
                  </span>
                </span>
              </>
            )}
            {more > 0 && i === shown.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/55 font-display text-2xl font-bold text-white">+{more}</span>
            )}
          </button>
        ))}
      </div>
      {view !== null && <Viewer media={media} index={view} onIndex={setView} onClose={() => setView(null)} />}
    </>
  );
}

function Viewer({ media, index, onIndex, onClose }: { media: Media[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const m = media[index];
  const n = media.length;

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && n > 1) onIndex((index + 1) % n);
      if (e.key === "ArrowLeft" && n > 1) onIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, n, onClose, onIndex]);

  const nav = "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white";
  return (
    <div role="dialog" aria-modal="true" aria-label={m.alt} className="fixed inset-0 z-50 flex flex-col bg-[rgba(6,17,10,0.96)]" onClick={onClose}>
      <div className="flex items-center gap-3 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <p className="min-w-0 flex-1 truncate text-[15px]">{m.alt}</p>
        {n > 1 && (
          <span className="text-sm tabular-nums text-white/70">
            {index + 1}/{n}
          </span>
        )}
        <button type="button" autoFocus onClick={onClose} aria-label="Đóng" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        <div className="flex h-full w-full max-w-5xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {m.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.src} alt={m.alt} className="max-h-full max-w-full rounded-lg bg-white object-contain" />
          ) : (
            <video key={m.src} src={m.src} poster={m.poster} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg bg-black" />
          )}
        </div>
        {n > 1 && (
          <>
            <button type="button" aria-label="Trước" onClick={(e) => (e.stopPropagation(), onIndex((index - 1 + n) % n))} className={`${nav} left-3`}>
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Sau" onClick={(e) => (e.stopPropagation(), onIndex((index + 1) % n))} className={`${nav} right-3`}>
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Chọn ảnh và video từ máy. Bản demo giữ tệp trong phiên bằng blob:, chưa tải lên máy chủ. */
export function MediaPicker({ value, onChange, label = "Thêm ảnh hoặc video" }: { value: Media[]; onChange: (m: Media[]) => void; label?: string }) {
  const [warn, setWarn] = useState("");
  const room = MAX_MEDIA - value.length;

  const add = (files: FileList | null) => {
    if (!files) return;
    const next: Media[] = [];
    let skipped = "";
    for (const f of Array.from(files)) {
      const video = f.type.startsWith("video/");
      if (!video && !f.type.startsWith("image/")) {
        skipped = "Chỉ nhận ảnh hoặc video.";
        continue;
      }
      if (video && f.size > MAX_VIDEO_MB * 1024 * 1024) {
        skipped = `Video tối đa ${MAX_VIDEO_MB} MB.`;
        continue;
      }
      if (next.length >= room) {
        skipped = `Tối đa ${MAX_MEDIA} tệp.`;
        break;
      }
      next.push({ type: video ? "video" : "image", src: URL.createObjectURL(f), alt: f.name.replace(/\.[^.]+$/, "") });
    }
    setWarn(skipped);
    if (next.length) onChange([...value, ...next]);
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((m, i) => (
            <li key={m.src} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-mist">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.src} alt={m.alt} className="h-full w-full object-cover" />
              ) : (
                <>
                  <video src={m.src} poster={m.poster} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-ink/75 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> Video
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Bỏ ${m.alt}`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-ink shadow hover:bg-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {room > 0 && (
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-bold hover:bg-mist has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep">
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> {label}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <p className={`mt-1.5 text-[13px] ${warn ? "font-semibold text-[#b42318]" : "text-moss"}`}>
        {warn || `Tối đa ${MAX_MEDIA} tệp, video dưới ${MAX_VIDEO_MB} MB. Bản demo chỉ giữ tệp trong phiên này.`}
      </p>
    </div>
  );
}

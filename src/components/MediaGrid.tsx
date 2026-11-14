"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ImagePlus, Play, X } from "lucide-react";
import { MAX_MEDIA, MAX_VIDEO_MB, MEDIA_LAYOUTS, resolveLayout, type Media, type MediaLayout } from "@/lib/media";
import { compressImageSized, saveBlob, useMediaSrc } from "@/lib/localMedia";

/** Ảnh hoặc video có thể là đường dẫn thường, data URL, hoặc `idb:` (video lưu trong trình duyệt). */
function Img({ src, alt, className, style }: { src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const url = useMediaSrc(src);
  // eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng lưu trên trình duyệt, không qua next/image được
  return url ? <img src={url} alt={alt} className={className} style={style} draggable={false} /> : <span className={`block bg-mist ${className ?? ""}`} aria-hidden="true" />;
}

function Vid({ src, poster, className, controls = false }: { src: string; poster?: string; className?: string; controls?: boolean }) {
  const url = useMediaSrc(src);
  const still = useMediaSrc(poster);
  if (!url) return <span className={`block bg-ink ${className ?? ""}`} aria-hidden="true" />;
  return controls ? (
    <video key={url} src={url} poster={still} controls autoPlay playsInline className={className} />
  ) : (
    <video src={url} poster={still} muted playsInline preload="metadata" className={className} />
  );
}

/**
 * Lưới ảnh và video: một tấm thì to, hai tấm chia đôi. Từ ba tấm có ba cách chia (xem MediaLayout):
 * người đăng chọn, hoặc tự chọn theo tỉ lệ ảnh đầu. Bấm vào để xem lớn, kéo hoặc chụm để phóng ảnh.
 */
export { Img as LocalImg };

/** Lớp lưới cho từng cách chia khi không biết kích thước ảnh. `shown` là số tấm đang hiện (tối đa 4). */
function gridOf(shown: number, layout: Exclude<MediaLayout, "auto">, bleed: boolean, compact: boolean): { grid: string; h: string } {
  const H = (tall: string, wide: string, even: string) => (compact ? "h-[150px]" : layout === "wide" ? wide : layout === "even" ? even : tall);
  if (shown === 1) return { grid: "grid-cols-1", h: compact ? "h-[150px]" : bleed ? "h-[260px] sm:h-[360px]" : "h-[260px] sm:h-[340px]" };
  if (shown === 2)
    return layout === "wide"
      ? { grid: "grid-cols-1 grid-rows-2", h: compact ? "h-[150px]" : "h-[400px] sm:h-[480px]" }
      : { grid: "grid-cols-2", h: compact ? "h-[150px]" : "h-[240px] sm:h-[300px]" };
  if (shown === 3) {
    if (layout === "wide") return { grid: "grid-cols-2 grid-rows-[3fr_2fr] [&>*:first-child]:col-span-2", h: H("", "h-[360px] sm:h-[440px]", "") };
    if (layout === "even") return { grid: "grid-cols-3", h: H("", "", "h-[180px] sm:h-[220px]") };
    return { grid: "grid-cols-2 grid-rows-2 [&>*:first-child]:row-span-2", h: H("h-[260px] sm:h-[340px]", "", "") };
  }
  if (layout === "wide") return { grid: "grid-cols-3 grid-rows-[3fr_2fr] [&>*:first-child]:col-span-3", h: H("", "h-[380px] sm:h-[460px]", "") };
  if (layout === "even") return { grid: "grid-cols-2 grid-rows-2", h: H("", "", "h-[340px] sm:h-[420px]") };
  return { grid: "grid-cols-3 grid-rows-3 [&>*:first-child]:col-span-2 [&>*:first-child]:row-span-3", h: H("h-[280px] sm:h-[360px]", "", "") };
}

/**
 * Khi biết kích thước mọi ảnh: chia cột, hàng theo đúng tỉ lệ từng tấm và đặt tỉ lệ khung cho cả lưới,
 * để ảnh hiện trọn thay vì bị cắt. Chỉ cắt nhẹ khi khung quá cao hoặc quá dẹt (giới hạn 4:5 đến 2:1).
 */
function fitOf(media: Media[], layout: Exclude<MediaLayout, "auto">): { grid: string; style: React.CSSProperties } | null {
  if (media.some((m) => !m.w || !m.h || m.type !== "image")) return null;
  const r = media.map((m) => m.w! / m.h!);
  const fr = (xs: number[]) => xs.map((x) => `${x.toFixed(3)}fr`).join(" ");
  const n = r.length;
  let grid = "";
  let cols: number[] | null = null;
  let rows: number[] | null = null;
  let aspect = 1;
  if (n === 1) {
    grid = "grid-cols-1";
    aspect = r[0];
  } else if (n === 2) {
    if (layout === "wide") {
      grid = "grid-cols-1";
      rows = [1 / r[0], 1 / r[1]];
      aspect = 1 / (rows[0] + rows[1]);
    } else {
      cols = [r[0], r[1]];
      aspect = r[0] + r[1];
    }
  } else {
    const small = r.slice(1);
    const k = small.length; // số tấm nhỏ xếp cạnh tấm to
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    if (layout === "even" && n === 3) {
      cols = r;
      aspect = sum(r);
    } else if (layout === "even") {
      grid = "grid-rows-2";
      cols = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      aspect = (cols[0] + cols[1]) / 2;
    } else if (layout === "wide") {
      // Tấm to chiếm cả hàng trên; hàng dưới chia cột theo tỉ lệ từng tấm nhỏ nên cùng chiều cao mà không cắt.
      grid = k === 2 ? "[&>*:first-child]:col-span-2" : "[&>*:first-child]:col-span-3";
      cols = small;
      rows = [1 / r[0], 1 / sum(small)];
      aspect = 1 / (rows[0] + rows[1]);
    } else {
      // Tấm to chiếm cả cột trái; cột phải chia hàng theo tỉ lệ từng tấm nhỏ nên cùng chiều rộng mà không cắt.
      grid = k === 2 ? "[&>*:first-child]:row-span-2" : "[&>*:first-child]:row-span-3";
      rows = small.map((x) => 1 / x);
      cols = [r[0], 1 / sum(rows)];
      aspect = cols[0] + cols[1];
    }
  }
  const style: React.CSSProperties = { aspectRatio: String(Math.min(layout === "even" ? 2.8 : 2, Math.max(0.8, aspect))) };
  if (cols) style.gridTemplateColumns = fr(cols);
  if (rows) style.gridTemplateRows = fr(rows);
  return { grid, style };
}

/** `bleed`: tràn hết bề ngang thẻ, không bo góc, không viền (ảnh đầu thẻ Công bố). */
export function MediaGrid({ media, layout, compact = false, bleed = false }: { media: Media[]; layout?: MediaLayout; compact?: boolean; bleed?: boolean }) {
  const [view, setView] = useState<number | null>(null);
  if (!media.length) return null;
  const shown = media.slice(0, 4);
  const more = media.length - shown.length;
  const kind = resolveLayout(media, layout, media.map((m) => m.src.slice(0, 40)).join("|"));
  const fit = compact ? null : fitOf(shown, kind);
  const fixed = fit ? null : gridOf(shown.length, kind, bleed, compact);

  return (
    <>
      <div
        className={`grid gap-1 overflow-hidden bg-mist ${bleed ? "" : "rounded-xl border border-line"} ${fit ? fit.grid : `${fixed!.grid} ${fixed!.h}`}`}
        style={fit?.style}
      >
        {shown.map((m, i) => (
          <button
            key={m.src + i}
            type="button"
            onClick={() => setView(i)}
            aria-label={`${m.type === "video" ? "Xem video" : "Xem ảnh"}: ${m.alt}`}
            className="group relative h-full min-h-0 w-full overflow-hidden bg-white"
          >
            {m.type === "image" ? (
              <Img src={m.src} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            ) : (
              <>
                {m.poster ? <Img src={m.poster} alt="" className="h-full w-full object-cover" /> : <Vid src={m.src} className="h-full w-full object-cover" />}
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
      {/* Đưa ra body để không bị thẻ bài (có hiệu ứng transform) giữ lại trong khung của nó. */}
      {view !== null && createPortal(<Viewer media={media} index={view} onIndex={setView} onClose={() => setView(null)} />, document.body)}
    </>
  );
}

/** Hình thu nhỏ cho từng cách chia, vẽ bằng ô xám, không dùng icon. */
function LayoutThumb({ id, n }: { id: MediaLayout; n: number }) {
  const cell = "rounded-[2px] bg-current";
  if (id === "auto") return <span className="block h-5 w-7 rounded-[3px] border border-dashed border-current" aria-hidden="true" />;
  if (id === "even")
    return (
      <span className={`grid h-5 w-7 gap-px ${n >= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-3"}`} aria-hidden="true">
        {Array.from({ length: n >= 4 ? 4 : 3 }, (_, i) => <span key={i} className={cell} />)}
      </span>
    );
  if (id === "wide")
    return (
      <span className="grid h-5 w-7 grid-cols-2 grid-rows-[3fr_2fr] gap-px" aria-hidden="true">
        <span className={`${cell} col-span-2`} />
        <span className={cell} />
        <span className={cell} />
      </span>
    );
  return (
    <span className="grid h-5 w-7 grid-cols-2 grid-rows-2 gap-px" aria-hidden="true">
      <span className={`${cell} row-span-2`} />
      <span className={cell} />
      <span className={cell} />
    </span>
  );
}

/** Chọn cách chia lưới khi bài có từ 3 ảnh. */
export function LayoutPicker({ media, value, onChange }: { media: Media[]; value: MediaLayout; onChange: (l: MediaLayout) => void }) {
  if (media.length < 3) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-moss">Cách xếp ảnh</span>
      <div role="radiogroup" aria-label="Cách xếp ảnh" className="flex flex-wrap gap-1.5">
        {MEDIA_LAYOUTS.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] font-bold transition-colors ${on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"}`}
            >
              <LayoutThumb id={o.id} n={media.length} />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Ảnh trong khung xem lớn: chụm hai ngón hoặc lăn chuột để phóng, kéo để xem phần bị khuất,
 * bấm đúp để phóng hoặc thu về. Không hiện số, không có nút. Chưa phóng thì vuốt ngang để chuyển ảnh.
 */
function ZoomImage({ src, alt, onSwipe }: { src: string; alt: string; onSwipe?: (dir: 1 | -1) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  // Bản mới nhất của transform để các handler đọc, không chờ render.
  const live = useRef(t);
  const update = (n: { s: number; x: number; y: number }) => {
    live.current = n;
    setT(n);
  };
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ s: number; x: number; y: number; d: number; mx: number; my: number; px: number; py: number } | null>(null);
  const lastTap = useRef(0);

  const MIN = 1;
  const MAX = 4;
  const clamp = (n: { s: number; x: number; y: number }) => {
    const el = box.current;
    const s = Math.min(MAX, Math.max(MIN, n.s));
    if (s === 1 || !el) return { s, x: 0, y: 0 };
    const img = el.firstElementChild as HTMLElement | null;
    const w = (img?.offsetWidth ?? el.clientWidth) * s;
    const h = (img?.offsetHeight ?? el.clientHeight) * s;
    const bx = Math.max(0, (w - el.clientWidth) / 2);
    const by = Math.max(0, (h - el.clientHeight) / 2);
    return { s, x: Math.min(bx, Math.max(-bx, n.x)), y: Math.min(by, Math.max(-by, n.y)) };
  };
  /** Phóng tới tỉ lệ `s` quanh điểm (cx, cy) tính từ tâm khung. */
  const zoomAt = (s: number, cx: number, cy: number, from = live.current) => {
    const k = s / from.s;
    return clamp({ s, x: cx - (cx - from.x) * k, y: cy - (cy - from.y) * k });
  };
  const center = (clientX: number, clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return { cx: clientX - r.left - r.width / 2, cy: clientY - r.top - r.height / 2 };
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDrag(true);
    const list = [...ptrs.current.values()];
    const cur = live.current;
    if (list.length === 2) {
      const [a, b] = list;
      const { cx, cy } = center((a.x + b.x) / 2, (a.y + b.y) / 2);
      start.current = { ...cur, d: Math.hypot(a.x - b.x, a.y - b.y), mx: cx, my: cy, px: 0, py: 0 };
    } else {
      start.current = { ...cur, d: 0, mx: 0, my: 0, px: e.clientX, py: e.clientY };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId) || !start.current) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const list = [...ptrs.current.values()];
    const st = start.current;
    if (list.length >= 2) {
      const [a, b] = list;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const { cx, cy } = center((a.x + b.x) / 2, (a.y + b.y) / 2);
      const s = Math.min(MAX, Math.max(MIN, (st.s * d) / (st.d || 1)));
      update(zoomAt(s, cx, cy, { s: st.s, x: st.x + (cx - st.mx), y: st.y + (cy - st.my) }));
    } else if (st.s > 1) {
      update(clamp({ s: st.s, x: st.x + (e.clientX - st.px), y: st.y + (e.clientY - st.py) }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const st = start.current;
    const was = ptrs.current.size;
    ptrs.current.delete(e.pointerId);
    if (st && was === 1 && st.s === 1 && onSwipe && e.pointerType !== "mouse") {
      const dx = e.clientX - st.px;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - st.py)) onSwipe(dx < 0 ? 1 : -1);
    }
    // Bấm đúp hoặc chạm đúp: tự đếm ở đây cho mọi loại con trỏ, không dùng dblclick vì trình duyệt phát cả hai khi chạm.
    if (st && was === 1) {
      const moved = Math.hypot(e.clientX - st.px, e.clientY - st.py) > 8;
      const now = e.timeStamp;
      if (!moved && now - lastTap.current < 300) {
        toggle(e.clientX, e.clientY);
        lastTap.current = 0;
      } else lastTap.current = moved ? 0 : now;
    }
    // Còn một ngón sau khi chụm: tiếp tục kéo từ vị trí hiện tại.
    const rest = [...ptrs.current.entries()];
    if (rest.length === 1) start.current = { ...live.current, d: 0, mx: 0, my: 0, px: rest[0][1].x, py: rest[0][1].y };
    else if (rest.length === 0) {
      start.current = null;
      setDrag(false);
    }
  };
  const toggle = (clientX: number, clientY: number) => {
    const { cx, cy } = center(clientX, clientY);
    update(live.current.s > 1 ? { s: 1, x: 0, y: 0 } : zoomAt(2.5, cx, cy));
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Lăn chuột để phóng; đăng ký thủ công để chặn cuộn trang (React đặt wheel là passive).
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const cx = e.clientX - r.left - r.width / 2;
      const cy = e.clientY - r.top - r.height / 2;
      const s = Math.min(MAX, Math.max(MIN, live.current.s * Math.exp(-e.deltaY * 0.0022)));
      update(zoomAt(s, cx, cy));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- zoomAt đọc qua ref, không đổi theo render
  }, []);

  return (
    <div
      ref={box}
      className={`flex h-full w-full touch-none select-none items-center justify-center overflow-hidden ${t.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDragStart={(e) => e.preventDefault()}
    >
      <Img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded-lg bg-white object-contain will-change-transform"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: drag ? "none" : "transform 120ms ease-out" }}
      />
    </div>
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
        <p className="min-w-0 flex-1 truncate text-[15px]">
          {m.alt}
          {m.type === "image" && <span className="ml-2 hidden text-[13px] text-white/55 sm:inline">Lăn chuột hoặc bấm đúp để phóng</span>}
        </p>
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
            <ZoomImage key={m.src} src={m.src} alt={m.alt} onSwipe={n > 1 ? (d) => onIndex((index + d + n) % n) : undefined} />
          ) : (
            <Vid src={m.src} poster={m.poster} controls className="max-h-full max-w-full rounded-lg bg-black" />
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

/** Chọn ảnh và video từ máy. Ảnh được thu nhỏ, video lưu vào IndexedDB, nên tải lại trang vẫn còn. */
export function MediaPicker({ value, onChange, label = "Thêm ảnh hoặc video" }: { value: Media[]; onChange: (m: Media[]) => void; label?: string }) {
  const [warn, setWarn] = useState("");
  const [busy, setBusy] = useState(false);
  const room = MAX_MEDIA - value.length;

  const add = async (files: FileList | null) => {
    if (!files) return;
    const picked: File[] = [];
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
      if (picked.length >= room) {
        skipped = `Tối đa ${MAX_MEDIA} tệp.`;
        break;
      }
      picked.push(f);
    }
    setWarn(skipped);
    if (!picked.length) return;
    setBusy(true);
    try {
      const next = await Promise.all(
        picked.map(async (f): Promise<Media> => {
          const alt = f.name.replace(/\.[^.]+$/, "");
          if (f.type.startsWith("video/")) return { type: "video", src: await saveBlob(f), alt };
          const { src, w, h } = await compressImageSized(f);
          return { type: "image", src, alt, w, h };
        }),
      );
      onChange([...value, ...next]);
    } catch {
      setWarn("Không đọc được tệp này. Thử tệp khác.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((m, i) => (
            <li key={m.src} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-mist">
              {m.type === "image" ? (
                <Img src={m.src} alt={m.alt} className="h-full w-full object-cover" />
              ) : (
                <>
                  <Vid src={m.src} poster={m.poster} className="h-full w-full object-cover" />
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
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> {busy ? "Đang xử lý…" : label}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <p className={`mt-1.5 text-[13px] ${warn ? "font-semibold text-[#b42318]" : "text-moss"}`}>
        {warn || `Tối đa ${MAX_MEDIA} tệp, video dưới ${MAX_VIDEO_MB} MB. Tệp được lưu trên trình duyệt này.`}
      </p>
    </div>
  );
}

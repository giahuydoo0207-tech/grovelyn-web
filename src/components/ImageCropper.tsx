"use client";

/* eslint-disable @next/next/no-img-element -- ảnh từ blob: URL của người dùng, next/image không xử lý được */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";

interface Props {
  /** Ảnh gốc, thường là URL.createObjectURL(file). */
  src: string;
  /** Tỉ lệ rộng/cao của khung, ví dụ 2 cho ảnh bìa 2:1, 1 cho avatar. */
  ratio: number;
  round?: boolean;
  title?: string;
  /** Chiều rộng ảnh xuất ra (px). Ảnh được nén sang WebP. */
  outputWidth: number;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Khung cắt ảnh: kéo để chọn phần giữ lại, thanh trượt để phóng to, phím mũi tên để dịch từng chút.
 * Phần ngoài khung bị làm mờ và sẽ bị cắt khi bấm "Dùng ảnh này".
 */
export function ImageCropper({ src, ratio, round = false, title = "Chỉnh khung ảnh", outputWidth, onCancel, onDone }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; u: number; v: number } | null>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [stageW, setStageW] = useState(640);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ u: 0.5, v: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = src;
  }, [src]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStageW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Esc để đóng, đưa con trỏ vào hộp thoại khi mở.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const stageH = Math.round(stageW * 0.565);
  let fw = round || ratio === 1 ? Math.min(stageH * 0.8, 440) : stageW * 0.92;
  let fh = fw / ratio;
  if (fh > stageH * 0.86) {
    fh = stageH * 0.86;
    fw = fh * ratio;
  }
  const fx = (stageW - fw) / 2;
  const fy = (stageH - fh) / 2;

  const base = natural ? Math.max(fw / natural.w, fh / natural.h) : 1;
  const scale = base * zoom;
  const W = natural ? natural.w * scale : fw;
  const H = natural ? natural.h * scale : fh;
  const u = clamp(center.u, fw / 2 / W, 1 - fw / 2 / W);
  const v = clamp(center.v, fh / 2 / H, 1 - fh / 2 / H);
  const ox = fx + fw / 2 - u * W;
  const oy = fy + fh / 2 - v * H;

  const nudge = useCallback(
    (dx: number, dy: number) => setCenter({ u: clamp(u + dx / W, fw / 2 / W, 1 - fw / 2 / W), v: clamp(v + dy / H, fh / 2 / H, 1 - fh / 2 / H) }),
    [u, v, W, H, fw, fh],
  );

  const exportCrop = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    setBusy(true);
    const outW = outputWidth;
    const outH = Math.round(outW / ratio);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setBusy(false);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (u * W - fw / 2) / scale, (v * H - fh / 2) / scale, fw / scale, fh / scale, 0, 0, outW, outH);
    let url = canvas.toDataURL("image/webp", 0.85);
    if (!url.startsWith("data:image/webp")) url = canvas.toDataURL("image/jpeg", 0.85);
    onDone(url);
  };

  const previewW = ratio === 1 ? 96 : 280;
  const ps = previewW / fw;
  const imgStyle = (l: number, t: number, w: number, h: number) => ({ left: l, top: t, width: w, height: h });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="max-h-full w-full max-w-[1040px] overflow-y-auto rounded-[22px] bg-white p-5 shadow-2xl outline-none sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="crop-title" className="font-display text-[22px] font-bold tracking-[-0.02em]">
            {title}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Đóng" className="flex h-10 w-10 items-center justify-center rounded-full bg-mist hover:bg-line">
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={stageRef}
          tabIndex={0}
          role="application"
          aria-label="Vùng ảnh. Kéo hoặc dùng phím mũi tên để dịch ảnh"
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, u, v };
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            setCenter({ u: d.u - (e.clientX - d.x) / W, v: d.v - (e.clientY - d.y) / H });
          }}
          onPointerUp={() => {
            drag.current = null;
            setDragging(false);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
          }}
          onKeyDown={(e) => {
            const map: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
            const k = map[e.key];
            if (!k) return;
            e.preventDefault();
            nudge(k[0], k[1]);
          }}
          className={`relative mt-4 w-full touch-none select-none overflow-hidden rounded-2xl bg-[#0b1a10] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ height: stageH }}
        >
          {natural && (
            <>
              <img src={src} alt="" draggable={false} className="pointer-events-none absolute max-w-none opacity-30" style={imgStyle(ox, oy, W, H)} />
              <div
                className={`pointer-events-none absolute overflow-hidden ring-2 ring-white ${round ? "rounded-full" : "rounded-xl"}`}
                style={{ left: fx, top: fy, width: fw, height: fh }}
              >
                <img src={src} alt="" draggable={false} className="absolute max-w-none" style={imgStyle(ox - fx, oy - fy, W, H)} />
                {dragging && (
                  <div aria-hidden="true">
                    <span className="absolute inset-y-0 left-1/3 w-px bg-white/70" />
                    <span className="absolute inset-y-0 left-2/3 w-px bg-white/70" />
                    <span className="absolute inset-x-0 top-1/3 h-px bg-white/70" />
                    <span className="absolute inset-x-0 top-2/3 h-px bg-white/70" />
                  </div>
                )}
              </div>
            </>
          )}
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white">
            {round ? "Khung tròn" : `Khung ${ratio}:1`}
          </span>
        </div>

        <div className="mt-3.5 flex items-center gap-3">
          <button type="button" aria-label="Thu nhỏ" onClick={() => setZoom((z) => clamp(z - 0.25, 1, 3))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line hover:bg-mist">
            <Minus className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <label className="flex flex-1 items-center">
            <span className="sr-only">Phóng to</span>
            <input type="range" min={100} max={300} value={Math.round(zoom * 100)} onChange={(e) => setZoom(Number(e.target.value) / 100)} className="w-full accent-leaf-deep" />
          </label>
          <button type="button" aria-label="Phóng to" onClick={() => setZoom((z) => clamp(z + 0.25, 1, 3))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line hover:bg-mist">
            <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <span className="w-12 text-right text-sm font-bold tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setCenter({ u: 0.5, v: 0.5 });
            }}
            className="hidden h-10 rounded-full px-3 text-sm font-bold text-leaf-deep hover:bg-mist sm:block"
          >
            Đặt lại
          </button>
        </div>
        <p className="mt-1.5 text-[13px] text-moss">Kéo ảnh để chọn phần muốn giữ, dùng thanh trượt để phóng to. Phần mờ bên ngoài sẽ bị cắt.</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
          <div
            className={`relative shrink-0 overflow-hidden bg-[#0b1a10] ${round ? "rounded-full" : "rounded-[10px]"}`}
            style={{ width: previewW, height: previewW / ratio }}
            aria-hidden="true"
          >
            {natural && <img src={src} alt="" className="absolute max-w-none" style={imgStyle((ox - fx) * ps, (oy - fy) * ps, W * ps, H * ps)} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Xem trước</p>
            <p className="text-[13px] text-moss">Ảnh được nén sang WebP khi lưu.</p>
          </div>
          <button type="button" onClick={onCancel} className="h-11 rounded-xl px-4 font-semibold text-moss hover:bg-mist">
            Hủy
          </button>
          <button type="button" onClick={exportCrop} disabled={!natural || busy} className="h-11 rounded-xl bg-leaf px-5 font-bold text-ink disabled:opacity-50">
            Dùng ảnh này
          </button>
        </div>
      </motion.div>
    </div>
  );
}

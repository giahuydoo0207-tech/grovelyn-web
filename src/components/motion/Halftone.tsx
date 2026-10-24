"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Ảnh in chấm: ảnh hiện lên dưới dạng các chấm tròn (đậm thì chấm to), như bản in báo.
 * Đưa chuột vào thì các chấm mở ra thành ảnh thật. Trên điện thoại không có hover nên ảnh tự mở sau khi chấm vẽ xong.
 * Người dùng bật "giảm chuyển động" thì thấy ảnh thật ngay.
 */
export function Halftone({
  src,
  alt,
  ratio = 16 / 10,
  cell = 9,
  ink = "#06110a",
  paper = "#f2f5ef",
}: {
  src: string;
  alt: string;
  ratio?: number;
  /** Khoảng cách giữa hai chấm, tính bằng px CSS. */
  cell?: number;
  ink?: string;
  paper?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hovered, setOpen] = useState(false);
  const still = !!useReducedMotion();
  const open = still || hovered;

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const touch = !matchMedia("(hover: hover)").matches;
    if (still) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = false;
    const img = new Image();
    img.src = src;

    const draw = () => {
      const w = el.clientWidth;
      const h = Math.round(w / ratio);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = w * dpr;
      cv.height = h * dpr;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Đọc độ sáng của ảnh ở độ phân giải bằng lưới chấm.
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const probe = document.createElement("canvas");
      probe.width = cols;
      probe.height = rows;
      const pc = probe.getContext("2d", { willReadFrequently: true });
      if (!pc) return;
      pc.drawImage(img, 0, 0, cols, rows);
      const px = pc.getImageData(0, 0, cols, rows).data;
      const dark: number[] = [];
      for (let i = 0; i < cols * rows; i++) {
        const lum = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
        dark.push(1 - lum);
      }

      const t0 = performance.now();
      const span = 1100;
      const frame = (now: number) => {
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = ink;
        let done = true;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            // Sóng chấm đi từ góc dưới trái lên, như cây mọc.
            const delay = ((x / cols) * 0.55 + (1 - y / rows) * 0.45) * 600;
            const k = Math.min(1, Math.max(0, (now - t0 - delay) / (span - 600)));
            if (k < 1) done = false;
            const r = (cell / 2) * Math.sqrt(Math.max(0.04, dark[y * cols + x])) * 0.95 * k;
            if (r < 0.3) continue;
            ctx.beginPath();
            ctx.arc(x * cell + cell / 2, y * cell + cell / 2, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (!done) raf = requestAnimationFrame(frame);
        else if (touch) timer = setTimeout(() => setOpen(true), 900);
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        if (img.complete) draw();
        else img.onload = draw;
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [src, ratio, cell, ink, paper, still]);

  return (
    <div
      ref={box}
      role="img"
      aria-label={alt}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen(true)}
      className="relative w-full cursor-pointer overflow-hidden rounded-xl border border-line bg-mist"
      style={{ aspectRatio: String(ratio) }}
    >
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh SVG trong public, cần cùng kích thước với lưới chấm */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-[opacity,clip-path] duration-700 ease-out"
        style={{
          opacity: open ? 1 : 0,
          clipPath: open ? "circle(150% at 0% 100%)" : "circle(0% at 0% 100%)",
        }}
      />
    </div>
  );
}

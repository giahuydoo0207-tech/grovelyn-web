"use client";

/**
 * Hiệu ứng "mọc chữ" của Grovelyn, dựng trên ascii-reveal của Quan Hoang (MIT, xem src/vendor/ascii-reveal/NOTICE.md).
 * Phần riêng ở đây: màu Grovelyn, kiểu ký tự "Mầm" dùng chữ tiếng Việt có dấu, và linh vật cái cây trong logo.
 */
import { useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { AsciiReveal, type AsciiRevealHandle, type AsciiRevealProps } from "@/vendor/ascii-reveal";
import type { MascotDraw, Preset } from "@/vendor/ascii-reveal/core";

/** Kiểu "Mầm": hạt nhỏ dày dần thành chữ, lúc xáo trộn chạy qua chữ cái tiếng Việt có dấu. */
export const MAM: Preset = {
  ramp: " .·:;+*•",
  scramble: "ăâđêôơưáàảãạấầẩẫậếềểễệốồổỗộớờởỡợứừửữựíìỉĩịýỳỷỹỵ",
  mode: "ramp",
  color: "source",
  cells: [22, 15, 11, 8, 6],
  tick: 70,
  accentGlyphs: true,
};

/** Màu Grovelyn cho hiệu ứng: chữ xáo trộn màu lá đậm, khoảnh khắc chữ chạm chỗ loé xanh lá. */
export const GROVE_VARS = {
  "--ascii-accent": "#1d6b1d",
  "--ascii-flash": "#5bd13a",
  "--ascii-skeleton": "#9fb59a",
  "--ascii-mascot": "#1d6b1d",
  "--ascii-font": 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
} as CSSProperties;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp(v), 3);

/**
 * Linh vật lúc chờ tải: cái cây trong logo Grovelyn tự mọc lên. Rễ lan ra, thân vươn lên, hai cành tách,
 * rồi ba chiếc lá nhú ra và đung đưa. Lặp lại mỗi ~3,2 giây.
 */
export const sprout: MascotDraw = (ctx, w, h, t, color) => {
  const loop = 3.2;
  const k = (t % loop) / 2.2; // 0..1.45: mọc trong 2,2 giây, giữ nguyên phần còn lại
  const s = Math.min(w, h) / 32;
  const ox = w / 2 - 16 * s;
  const oy = h / 2 - 16 * s;
  const P = (x: number, y: number) => [ox + x * s, oy + y * s] as const;
  const sway = Math.sin(t * 2.4) * 0.6;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3.2 * s;

  const seg = (a: readonly [number, number], b: readonly [number, number], p: number) => {
    if (p <= 0) return;
    const e = ease(p);
    ctx.beginPath();
    ctx.moveTo(...P(...a));
    ctx.lineTo(...P(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e));
    ctx.stroke();
  };

  // Rễ: hai đường mạch toả sang hai bên.
  const r = (k - 0) / 0.25;
  seg([16, 30], [12, 30], r);
  seg([12, 30], [4, 30], r - 0.5);
  seg([16, 30], [20, 30], r);
  seg([20, 30], [28, 30], r - 0.5);
  // Thân.
  seg([16, 30], [16 + sway * 0.3, 3], (k - 0.15) / 0.45);
  // Hai cành.
  seg([16, 19], [10 + sway, 14], (k - 0.45) / 0.2);
  seg([10 + sway, 14], [10 + sway, 8], (k - 0.6) / 0.15);
  seg([16, 16], [22 + sway, 11], (k - 0.5) / 0.2);
  seg([22 + sway, 11], [22 + sway, 5], (k - 0.65) / 0.15);
  // Ba chiếc lá nhú ra.
  const leaf = (x: number, y: number, size: number, p: number) => {
    if (p <= 0) return;
    const pop = ease(p) * (1 + Math.sin(clamp(p) * Math.PI) * 0.25);
    ctx.beginPath();
    ctx.arc(...P(x, y), size * s * pop, 0, Math.PI * 2);
    ctx.fill();
  };
  leaf(10 + sway, 7, 3.4, (k - 0.75) / 0.15);
  leaf(22 + sway, 4.5, 3.4, (k - 0.8) / 0.15);
  leaf(16 + sway * 0.3, 3, 2.8, (k - 0.85) / 0.15);
};

type GroveRevealProps = Omit<AsciiRevealProps, "preset"> & {
  /** Hiện nút "Chạy lại" nhỏ ở góc, để trình diễn. */
  replay?: string;
};

const noop = () => () => {};
/** Nút "Chạy lại" chỉ hiện khi mở trang với ?trinh-chieu, để người xem thường không thấy nút lạ. */
const usePresenting = () => useSyncExternalStore(noop, () => new URLSearchParams(location.search).has("trinh-chieu"), () => false);

/** Bọc AsciiReveal với kiểu Mầm, màu Grovelyn và linh vật cái cây. */
export function GroveReveal({ replay, style, children, mascot = sprout, ...rest }: GroveRevealProps) {
  const ref = useRef<AsciiRevealHandle>(null);
  const presenting = usePresenting();
  return (
    <div className="relative">
      <AsciiReveal ref={ref} preset={MAM} mascot={mascot} style={{ ...GROVE_VARS, ...style }} {...rest}>
        {children}
      </AsciiReveal>
      {replay && presenting && (
        <button
          type="button"
          onClick={() => ref.current?.reveal()}
          className="absolute -top-1 right-0 inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-moss hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {replay}
        </button>
      )}
    </div>
  );
}

/** Minh hoạ lúc dữ liệu đang tải: cái cây mọc trong khung, rồi nội dung hiện ra. */
export function LoadingPreview({ children, label = "Xem lúc đang tải" }: { children: ReactNode; label?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <AsciiReveal preset={MAM} mascot={sprout} loading={loading} revealOnMount={false} style={GROVE_VARS}>
        {children}
      </AsciiReveal>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2600);
        }}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-bold hover:bg-mist disabled:text-moss"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> {loading ? "Đang tải…" : label}
      </button>
    </div>
  );
}

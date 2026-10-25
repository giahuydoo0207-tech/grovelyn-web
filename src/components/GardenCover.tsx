import { GARDEN, type Hue } from "@/lib/palette";

/** Số ngẫu nhiên cố định theo seed, để server và trình duyệt vẽ giống nhau. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HUES: Hue[] = ["leaf", "sun", "clay", "sky", "lilac", "rose", "leaf", "moss"];

/**
 * Ảnh bìa mặc định của hồ sơ: một luống vườn nhiều màu, mỗi người một kiểu theo seed.
 * Dùng khi người dùng chưa có ảnh bìa, để hồ sơ vẫn đẹp mà không phải tìm ảnh.
 */
export function GardenCover({ seed, className = "" }: { seed: number; className?: string }) {
  const r = rng(seed * 97 + 13);
  const leaves = Array.from({ length: 34 }, (_, i) => {
    const hue = HUES[Math.floor(r() * HUES.length)];
    const x = (i / 34) * 1240 - 20 + r() * 40;
    const y = 30 + r() * 200;
    const s = 14 + r() * 30;
    return { hue, x, y, s, rot: r() * 180 - 90, round: r() > 0.62 };
  });
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" className={className}>
      <rect width="1200" height="260" fill="#f4f8ef" />
      <path d="M0 210 C200 170 380 240 600 200 S1000 160 1200 205 V260 H0 Z" fill="#e6f3dc" />
      <path d="M-20 150 C180 110 330 190 560 140 S980 90 1220 140" fill="none" stroke="#cfe6c2" strokeWidth="2" />
      {leaves.map((l, i) =>
        l.round ? (
          <circle key={i} cx={l.x} cy={l.y} r={l.s * 0.45} fill={GARDEN[l.hue].solid} opacity=".85" />
        ) : (
          <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
            <path d={`M0 ${-l.s} C${l.s * 0.62} ${-l.s * 0.4} ${l.s * 0.62} ${l.s * 0.4} 0 ${l.s} C${-l.s * 0.62} ${l.s * 0.4} ${-l.s * 0.62} ${-l.s * 0.4} 0 ${-l.s} Z`} fill={GARDEN[l.hue].solid} opacity=".9" />
            <path d={`M0 ${-l.s * 0.8} V${l.s * 0.8}`} stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.4" />
          </g>
        ),
      )}
    </svg>
  );
}

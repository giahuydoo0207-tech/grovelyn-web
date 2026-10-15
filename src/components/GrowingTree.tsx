"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Cây mạch điện: tán rộng gồm nhiều đường mạch đi ngang rồi bẻ góc 45° lên trên, kết thúc bằng vòng tròn;
 * rễ là các đường mạch nằm ngang trải hết chiều rộng. Hình được sinh theo một hạt giống cố định
 * nên server và trình duyệt vẽ giống hệt nhau.
 *
 * Khi tải trang: rễ lan ra, thân mọc lên, cành mọc dần từ dưới lên, lá và chấm sáng nở cuối cùng.
 */

const W = 1000;
const H = 640;
const CX = W / 2;
const BASE = 560;
const TRUNK_TOP = 170;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Nửa bề rộng của tán (hình elip) ở độ cao y.
const canopyHalf = (y: number) => {
  const cy = 300;
  const rx = 440;
  const ry = 260;
  const t = (y - cy) / ry;
  return t >= 1 || t <= -1 ? 0 : rx * Math.sqrt(1 - t * t);
};

interface Branch {
  d: string;
  end: [number, number];
  delay: number;
  ring: boolean;
}

const r = rng(20261015);

const BRANCHES: Branch[] = Array.from({ length: 56 }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const level = Math.floor(i / 2) / 27; // 0 ở gốc tán, 1 ở ngọn
  const y0 = Math.round(470 - level * 290 + (r() - 0.5) * 14);
  const lane = (i % 6) + 1;
  const x0 = CX + side * lane * 3;
  // Leo cao hơn và chạy ngang ngắn hơn để tán trông như cây, không thành lưới ngang.
  const climb = 70 + r() * 210;
  const ye = Math.max(48, Math.round(y0 - climb));
  const room = canopyHalf(ye) * 0.94;
  const off = Math.max(30, Math.round(room * (0.15 + r() * 0.85)));
  const k = Math.min(26, Math.max(10, Math.round((y0 - ye) * 0.3)));
  const xe = CX + side * off;
  const xa = xe - side * k;
  // Một số nhánh có thêm đoạn ngắn nằm ngang ở đầu cho giống mạch in.
  const tail = r() > 0.72 ? side * (14 + Math.round(r() * 22)) : 0;
  const d = `M${x0} ${y0}H${xa}L${xe} ${y0 - k}V${ye}${tail ? `h${tail}` : ""}`;
  return { d, end: [xe + tail, ye], delay: 1.0 + level * 1.6 + r() * 0.15, ring: r() > 0.35 };
});

const LEAVES = BRANCHES.filter((_, i) => i % 3 === 0).flatMap((b, i) => {
  const [x, y] = b.end;
  return [-40, 30].map((a, j) => ({
    key: `${i}-${j}`,
    cx: x + (j === 0 ? -14 : 14),
    cy: y - 10 - j * 4,
    angle: a,
    delay: b.delay + 0.45,
    light: (i + j) % 2 === 0,
  }));
});

const DOTS = Array.from({ length: 70 }, () => {
  const y = 50 + r() * 470;
  const half = canopyHalf(y) * 1.05;
  return { x: CX + (r() * 2 - 1) * half, y, s: 1.4 + r() * 2.2, delay: 2.2 + r() * 1.2 };
}).filter((p) => Math.abs(p.x - CX) > 10);

// Rễ: các đường mạch song song trải ngang từ gốc ra hai mép.
const ROOTS = Array.from({ length: 6 }, (_, j) =>
  [-1, 1].map((side) => {
    const y = BASE + 8 + j * 12;
    const bend = 28 + j * 22;
    return `M${CX + side * (4 + j * 3)} ${BASE - 10}V${y - 14}L${CX + side * (4 + j * 3 + 14)} ${y}H${side > 0 ? CX + bend + 60 + j * 30 : CX - bend - 60 - j * 30}L${side > 0 ? CX + bend + 72 + j * 30 : CX - bend - 72 - j * 30} ${y + 6}H${side > 0 ? W : 0}`;
  }),
).flat();

const TRUNK = [-8, 0, 8].map((dx) => `M${CX + dx} ${BASE}V${TRUNK_TOP + Math.abs(dx) * 4}`);

export function GrowingTree({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (delay: number, duration: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { delay, duration, ease: [0.22, 1, 0.36, 1] as const },
        };
  const pop = (delay: number) =>
    reduce
      ? { initial: false as const }
      : { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay, type: "spring" as const, stiffness: 380, damping: 16 } };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className={className} role="img" aria-label="Cây mạch điện của Grovelyn đang lớn lên">
      <g stroke="#2b5a2b" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ROOTS.map((d, i) => (
          <motion.path key={d} d={d} {...draw((i % 6) * 0.06, 0.9)} />
        ))}
      </g>

      {!reduce &&
        ROOTS.filter((_, i) => i % 3 === 0).map((d, i) => (
          <motion.path
            key={`p-${d}`}
            d={d}
            stroke="#5bd13a"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="18 900"
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: [0, -920], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 3.4 + i * 0.7, duration: 3, repeat: Infinity, repeatDelay: 2.4, ease: "linear" }}
          />
        ))}

      <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
        {TRUNK.map((d, i) => (
          <motion.path key={d} d={d} {...draw(0.45 + i * 0.05, 0.9)} />
        ))}
      </g>

      <g stroke="#5bd13a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {BRANCHES.map((b) => (
          <motion.path key={b.d} d={b.d} {...draw(b.delay, 0.6)} />
        ))}
      </g>

      {BRANCHES.map((b) => (
        <motion.circle
          key={`n-${b.d}`}
          cx={b.end[0]}
          cy={b.end[1]}
          r={b.ring ? 5 : 3.2}
          fill={b.ring ? "#06110a" : "#b9f09d"}
          stroke={b.ring ? "#5bd13a" : "none"}
          strokeWidth="2"
          style={{ transformOrigin: `${b.end[0]}px ${b.end[1]}px`, transformBox: "view-box" }}
          {...pop(b.delay + 0.5)}
        />
      ))}

      {LEAVES.map((l) => (
        <motion.ellipse
          key={l.key}
          cx={l.cx}
          cy={l.cy}
          rx="4.5"
          ry="9"
          fill={l.light ? "#b9f09d" : "#5bd13a"}
          transform={`rotate(${l.angle} ${l.cx} ${l.cy})`}
          style={{ transformOrigin: `${l.cx}px ${l.cy}px`, transformBox: "view-box" }}
          {...pop(l.delay)}
        />
      ))}

      {DOTS.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.s}
          fill="#5bd13a"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: p.delay, duration: 0.6 }}
        />
      ))}
    </svg>
  );
}

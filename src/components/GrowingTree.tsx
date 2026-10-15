"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Khoảnh khắc chính của trang mở đầu: rễ mạch điện lan ra, thân mọc lên, cành tách ra rồi lá nở.
 * Chạy đúng một lần khi tải trang; sau đó chỉ còn một nhịp sáng nhẹ chạy dọc rễ.
 */
const ROOTS = [
  "M300 560H200L170 590H40",
  "M300 560H400L430 590H560",
  "M300 560H250L230 540H110",
  "M300 560H350L370 540H500",
];

const BRANCHES = [
  { d: "M300 480H232L196 444V372", end: [196, 372], delay: 1.0 },
  { d: "M300 430H372L410 392V316", end: [410, 316], delay: 1.15 },
  { d: "M300 370H246L210 334V262", end: [210, 262], delay: 1.3 },
  { d: "M300 320H352L388 284V206", end: [388, 206], delay: 1.45 },
  { d: "M300 268H272L250 246V176", end: [250, 176], delay: 1.6 },
  { d: "M300 250V128", end: [300, 128], delay: 1.7 },
];

// Lá: các chiếc lá nhỏ quanh đầu cành, xoay khác nhau để tán cây trông tự nhiên.
const LEAVES = BRANCHES.flatMap((b, i) =>
  [-38, 0, 38, 76, -76].map((angle, j) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const dist = 26 + ((i + j) % 3) * 8;
    return {
      key: `${i}-${j}`,
      cx: b.end[0] + Math.cos(rad) * dist,
      cy: b.end[1] + Math.sin(rad) * dist,
      angle,
      delay: b.delay + 0.35 + j * 0.05,
      light: (i + j) % 3 === 0,
    };
  }),
);

export function GrowingTree({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (delay: number, duration = 0.7) =>
    reduce
      ? { initial: { pathLength: 1 }, animate: { pathLength: 1 } }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { delay, duration, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <svg viewBox="0 0 600 600" className={className} role="img" aria-label="Cây Grovelyn đang lớn lên từ rễ mạch điện">
      {ROOTS.map((d, i) => (
        <motion.path key={d} d={d} stroke="#2b5a2b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" {...draw(i * 0.08, 0.6)} />
      ))}

      {/* Nhịp sáng chạy dọc rễ, bắt đầu sau khi cây mọc xong. */}
      {!reduce &&
        ROOTS.map((d, i) => (
          <motion.path
            key={`pulse-${d}`}
            d={d}
            stroke="#5bd13a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="14 400"
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: [0, -420], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 3 + i * 0.6, duration: 2.4, repeat: Infinity, repeatDelay: 2.2, ease: "linear" }}
          />
        ))}

      <motion.path d="M300 560V250" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" {...draw(0.45, 0.8)} />

      {BRANCHES.map((b) => (
        <g key={b.d}>
          <motion.path d={b.d} stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...draw(b.delay, 0.55)} />
          <motion.circle
            cx={b.end[0]}
            cy={b.end[1]}
            r="7"
            fill="#5bd13a"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: b.delay + 0.5, type: "spring", stiffness: 420, damping: 14 }}
            style={{ transformOrigin: `${b.end[0]}px ${b.end[1]}px` }}
          />
        </g>
      ))}

      {LEAVES.map((l) => (
        <motion.ellipse
          key={l.key}
          cx={l.cx}
          cy={l.cy}
          rx="7"
          ry="13"
          fill={l.light ? "#b9f09d" : "#5bd13a"}
          transform={`rotate(${l.angle} ${l.cx} ${l.cy})`}
          initial={reduce ? false : { opacity: 0, scale: 0.2 }}
          animate={{ opacity: 0.95, scale: 1 }}
          transition={{ delay: l.delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${l.cx}px ${l.cy}px`, transformBox: "view-box" }}
        />
      ))}
    </svg>
  );
}

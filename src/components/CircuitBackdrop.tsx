"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Lớp đường mạch mờ phía sau khung đăng ký. Màu rất gần nền tối nên không làm rối chữ trong khung trắng;
 * thỉnh thoảng một nhịp sáng chạy dọc một đường.
 */
const TRACES = [
  "M0 90H160l40 40h220l30-30h260",
  "M0 180H90l30 30h300l40-40h120",
  "M120 0V60l40 40v120l-30 30v140",
  "M700 0V110l-40 40v90l40 40v130",
  "M760 260H560l-40 40H300l-30 30H0",
  "M0 420H140l40-40h190l30 30h400",
  "M220 560v-80l40-40h200l40 40v120",
  "M760 520H620l-30 30H420l-40-40H180l-40 40H0",
  "M600 660v-60l30-30h130",
  "M0 640h90l30-30h160",
];

const NODES: [number, number][] = [
  [160, 90],
  [420, 130],
  [120, 210],
  [520, 140],
  [660, 150],
  [300, 300],
  [370, 420],
  [260, 480],
  [460, 480],
  [590, 550],
  [630, 570],
  [140, 550],
];

export function CircuitBackdrop({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 760 700" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <g stroke="#16301f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {NODES.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#06110a" stroke="#1f4a2b" strokeWidth="2" />
      ))}
      {!reduce &&
        TRACES.filter((_, i) => i % 2 === 0).map((d, i) => (
          <motion.path
            key={`p-${d}`}
            d={d}
            stroke="#5bd13a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="16 1200"
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: [0, -1200], opacity: [0, 0.8, 0.8, 0] }}
            transition={{ delay: 1.5 + i * 1.3, duration: 4.5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
          />
        ))}
    </svg>
  );
}

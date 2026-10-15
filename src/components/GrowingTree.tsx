"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Cây mạch điện. Thân là một bó đường mạch song song mọc từ mặt đất; mỗi đường tách khỏi thân ở một độ cao
 * khác nhau, rẽ chéo 45° ra ngoài rồi đi tiếp lên trên hoặc sang ngang, mọc thêm nhánh con, lá, vòng tròn
 * và dây rủ xuống. Mọi đường đều bắt đầu từ mặt đất nên hiệu ứng vẽ nét trông như cây đang lớn lên.
 * Hình sinh theo hạt giống cố định nên server và trình duyệt vẽ giống hệt nhau.
 */

const W = 1000;
const H = 680;
const CX = 500;
const GROUND = 610;
const SPEED = 420; // px mỗi giây khi vẽ nét

type Pt = [number, number];
type EndKind = "ring" | "dot" | "leaf" | "none";

interface Trace {
  d: string;
  len: number;
  delay: number;
  dur: number;
  end: Pt;
  angle: number; // hướng đoạn cuối, độ
  kind: EndKind;
  main: boolean;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const r = rng(1015);

const inCanopy = ([x, y]: Pt) => ((x - CX) / 430) ** 2 + ((y - 330) / 300) ** 2 <= 1;
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const toD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
const lengthOf = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);

/** Đi từ p theo hướng (dx, dy) tối đa `len` px, lùi lại cho tới khi còn nằm trong tán. */
function step(p: Pt, dx: number, dy: number, len: number, free = false): Pt {
  const n = Math.hypot(dx, dy);
  for (let l = len; l > 6; l -= 6) {
    const q: Pt = [p[0] + (dx / n) * l, p[1] + (dy / n) * l];
    if (free || inCanopy(q)) return q;
  }
  return [p[0] + (dx / n) * 6, p[1] + (dy / n) * 6];
}

/** Điểm nằm ở khoảng cách `at` tính từ đầu đường gấp khúc. */
function pointAt(pts: Pt[], at: number): Pt {
  let left = at;
  for (let i = 1; i < pts.length; i++) {
    const seg = dist(pts[i - 1], pts[i]);
    if (left <= seg) {
      const t = left / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    left -= seg;
  }
  return pts[pts.length - 1];
}

const angleOf = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const pickEnd = (): EndKind => {
  const v = r();
  return v < 0.4 ? "leaf" : v < 0.75 ? "ring" : "dot";
};

const TRACES: Trace[] = [];

function addTwigs(parent: Pt[], parentDelay: number, side: number, from: number, count: number) {
  const total = lengthOf(parent);
  for (let t = 0; t < count; t++) {
    const at = from + (total - from) * (0.25 + r() * 0.7);
    const q = pointAt(parent, at);
    const delay = parentDelay + at / SPEED;
    const kind = r();
    let pts: Pt[];
    let end: EndKind;
    if (kind < 0.22) {
      // Dây rủ xuống, cuối là vòng tròn.
      pts = [q, step(q, 0, 1, 22 + r() * 40, true)];
      end = "ring";
    } else if (kind < 0.55) {
      const a = step(q, side, -1, 18 + r() * 40);
      pts = [q, a, step(a, 0, -1, 14 + r() * 40)];
      end = pickEnd();
    } else if (kind < 0.8) {
      const a = step(q, side, 0, 20 + r() * 50);
      pts = r() > 0.5 ? [q, a, step(a, side, -1, 14 + r() * 26)] : [q, a];
      end = pickEnd();
    } else {
      pts = [q, step(q, 0, -1, 20 + r() * 50)];
      end = pickEnd();
    }
    const len = lengthOf(pts);
    TRACES.push({
      d: toD(pts),
      len,
      delay,
      dur: Math.max(0.25, len / SPEED),
      end: pts[pts.length - 1],
      angle: angleOf(pts[pts.length - 2], pts[pts.length - 1]),
      kind: end,
      main: false,
    });
  }
}

// Thân: 15 đường song song. Đường càng ở mép càng tách sớm (thấp), đường giữa lên tới ngọn.
for (let k = -7; k <= 7; k++) {
  const side = Math.sign(k) || (r() > 0.5 ? 1 : -1);
  const a = Math.abs(k);
  const x = CX + k * 6;
  const peel = 470 - (7 - a) * 46 + (r() - 0.5) * 18;
  const pts: Pt[] = [
    [x + k * 1.6, GROUND],
    [x, GROUND - 26],
    [x, peel],
  ];
  if (k === 0) {
    pts.push([x, 70]);
  } else {
    const p1 = step(pts[2], side, -1, 60 + r() * 120);
    pts.push(p1);
    const v = r();
    const p2 = v < 0.45 ? step(p1, side, 0, 40 + r() * 120) : v < 0.8 ? step(p1, 0, -1, 30 + r() * 110) : step(p1, side, -1, 30 + r() * 70);
    pts.push(p2);
    if (r() > 0.5) pts.push(step(p2, 0, -1, 20 + r() * 50));
  }
  const len = lengthOf(pts);
  const delay = 0.35 + (7 - a) * 0.03;
  TRACES.push({
    d: toD(pts),
    len,
    delay,
    dur: len / SPEED,
    end: pts[pts.length - 1],
    angle: angleOf(pts[pts.length - 2], pts[pts.length - 1]),
    kind: k === 0 ? "leaf" : pickEnd(),
    main: true,
  });
  const fromTrunk = GROUND - peel + 26;
  addTwigs(pts, delay, side, fromTrunk, k === 0 ? 0 : 2 + Math.floor(r() * 3));
}

// Ngọn: vài nhánh nhỏ tỏa ra từ đỉnh thân.
for (const side of [-1, 1]) {
  for (let i = 0; i < 3; i++) {
    const y = 110 + i * 46;
    const q: Pt = [CX, y];
    const a = step(q, side, -1, 30 + r() * 50);
    const pts: Pt[] = [q, a, step(a, 0, -1, 16 + r() * 30)];
    const len = lengthOf(pts);
    TRACES.push({
      d: toD(pts),
      len,
      delay: 0.35 + (GROUND - y) / SPEED,
      dur: len / SPEED,
      end: pts[2],
      angle: -90,
      kind: pickEnd(),
      main: false,
    });
  }
}

const DOTS = Array.from({ length: 80 }, () => {
  const p: Pt = [CX + (r() * 2 - 1) * 440, 40 + r() * 520];
  return { p, s: 1.2 + r() * 2, delay: 2.6 + r() * 1.6, o: 0.3 + r() * 0.5 };
}).filter((d) => inCanopy(d.p) && Math.abs(d.p[0] - CX) > 50);

// Mặt đất: một đường ngang có các nút, rễ ngắn tỏa ra hai bên gốc.
const GROUND_LINE = `M60 ${GROUND + 24}H940`;
const GROUND_NODES = [140, 260, 360, 640, 740, 860];
const ROOTS = [-1, 1].flatMap((side) =>
  [0, 1, 2, 3].map((j) => {
    const x0 = CX + side * (10 + j * 6);
    return `M${x0} ${GROUND}L${x0 + side * (14 + j * 10)} ${GROUND + 14 + j * 2}H${x0 + side * (40 + j * 34)}`;
  }),
);

const LEAF = "M0 0C5-6 13-7 22 0C13 7 5 6 0 0Z";

export function GrowingTree({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (t: Trace) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { delay: t.delay, duration: t.dur, ease: "linear" as const },
        };
  const pop = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { delay, type: "spring" as const, stiffness: 360, damping: 15 },
        };
  const pulses = TRACES.filter((t) => t.main).filter((_, i) => i % 3 === 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className={className} role="img" aria-label="Cây mạch điện của Grovelyn đang lớn lên">
      <defs>
        <filter id="tree-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="tree-halo" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#5bd13a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#5bd13a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={CX} cy={330} rx={460} ry={320} fill="url(#tree-halo)" />

      <g stroke="#2f6b2a" strokeWidth="2" fill="none" strokeLinecap="round">
        <motion.path d={GROUND_LINE} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        {ROOTS.map((d, i) => (
          <motion.path key={d} d={d} stroke="#4aa83a" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 + i * 0.03, duration: 0.5 }} />
        ))}
      </g>
      {GROUND_NODES.map((x, i) => (
        <motion.circle key={x} cx={x} cy={GROUND + 24} r="4" fill="#3b8a33" {...pop(0.4 + i * 0.05)} style={{ transformOrigin: `${x}px ${GROUND + 24}px`, transformBox: "view-box" }} />
      ))}

      <g filter="url(#tree-glow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {TRACES.map((t) => (
          <motion.path key={t.d} d={t.d} stroke={t.main ? "#8fe36c" : "#5bd13a"} strokeWidth={t.main ? 2.2 : 1.6} {...draw(t)} />
        ))}
      </g>

      {/* Tín hiệu chạy từ gốc lên ngọn theo vài nhánh chính. */}
      {!reduce &&
        pulses.map((t, i) => (
          <motion.path
            key={`pulse-${t.d}`}
            d={t.d}
            pathLength={1}
            stroke="#e9ffd9"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="0.04 1"
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: [0, -1], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 4 + i * 0.9, duration: 2.6, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }}
          />
        ))}

      <g filter="url(#tree-glow)">
        {TRACES.map((t) => {
          const [x, y] = t.end;
          const at = t.delay + t.dur;
          const origin = { transformOrigin: `${x}px ${y}px`, transformBox: "view-box" as const };
          if (t.kind === "leaf")
            return (
              <motion.g key={`e-${t.d}`} style={origin} {...pop(at)}>
                <path d={LEAF} transform={`translate(${x} ${y}) rotate(${t.angle})`} fill="#5bd13a" fillOpacity="0.35" stroke="#a6ef86" strokeWidth="1.4" />
              </motion.g>
            );
          if (t.kind === "ring")
            return <motion.circle key={`e-${t.d}`} cx={x} cy={y} r="4.2" fill="#06110a" stroke="#a6ef86" strokeWidth="1.6" style={origin} {...pop(at)} />;
          if (t.kind === "dot") return <motion.circle key={`e-${t.d}`} cx={x} cy={y} r="2.6" fill="#c9f7b3" style={origin} {...pop(at)} />;
          return null;
        })}
      </g>

      {DOTS.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.p[0]}
          cy={d.p[1]}
          r={d.s}
          fill="#8fe36c"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: d.o }}
          transition={{ delay: d.delay, duration: 0.8 }}
        />
      ))}
    </svg>
  );
}

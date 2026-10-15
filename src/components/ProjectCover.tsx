import type { CoverTone } from "@/lib/data";

/**
 * Ảnh bìa tạm cho dự án chưa có ảnh: một tán cây mạch điện vẽ theo `seed`, nên mỗi dự án có hình riêng
 * nhưng lần nào render cũng giống nhau.
 */
const TONES: Record<CoverTone, { bg: string; line: string; node: string; dim: string }> = {
  ink: { bg: "#06110a", line: "#2b5a2b", node: "#5bd13a", dim: "#163020" },
  leaf: { bg: "#5bd13a", line: "#1d6b1d", node: "#06110a", dim: "#47b52a" },
  sap: { bg: "#dcf6cf", line: "#7fbf6a", node: "#1d6b1d", dim: "#c6ecb5" },
};

function rand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function ProjectCover({ seed, tone, className = "" }: { seed: number; tone: CoverTone; className?: string }) {
  const c = TONES[tone];
  const r = rand(seed);
  const trunkX = 120 + Math.round(r() * 160);
  const branches = Array.from({ length: 5 }, (_, i) => {
    const y = 150 - i * 22 - Math.round(r() * 8);
    const dir = i % 2 === 0 ? -1 : 1;
    const len = 50 + Math.round(r() * 70);
    const rise = 18 + Math.round(r() * 20);
    return { y, dir, len, rise };
  });
  const traces = Array.from({ length: 4 }, (_, i) => {
    const y = 172 + i * 9;
    const start = Math.round(r() * 120);
    return `M${start} ${y}h${60 + Math.round(r() * 80)}l8 -8h${40 + Math.round(r() * 120)}`;
  });

  return (
    <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Ảnh bìa dự án">
      <rect width="400" height="210" fill={c.bg} />
      {traces.map((d, i) => (
        <path key={i} d={d} stroke={c.dim} strokeWidth="2" fill="none" strokeLinecap="round" />
      ))}
      <path d={`M${trunkX} 210V40`} stroke={c.line} strokeWidth="3" strokeLinecap="round" />
      {branches.map((b, i) => {
        const endX = trunkX + b.dir * b.len;
        const endY = b.y - b.rise;
        return (
          <g key={i}>
            <path
              d={`M${trunkX} ${b.y}L${trunkX + b.dir * (b.len - 16)} ${b.y - b.rise + 6}L${endX} ${endY}`}
              stroke={c.line}
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={endX} cy={endY} r={i === 0 ? 6 : 4.5} fill={c.node} />
          </g>
        );
      })}
      <circle cx={trunkX} cy={38} r="6" fill={c.node} />
    </svg>
  );
}

/**
 * Lá và chấm trang trí trên nền đen, chỉ dùng các sắc xanh của Grovelyn.
 * Vị trí sinh từ một hạt giống cố định nên server và trình duyệt vẽ giống hệt nhau.
 */
const GREENS = ["#5bd13a", "#dcf6cf", "#1d6b1d"];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shapes(seed: number, w: number, h: number, n: number) {
  const r = rand(seed);
  return Array.from({ length: n }, () => {
    const x = r() * w;
    const y = r() * h;
    const c = GREENS[Math.floor(r() * GREENS.length)];
    const o = 0.55 + r() * 0.45;
    if (r() < 0.55) {
      const s = 7 + r() * 9;
      const a = Math.round(r() * 360);
      return { kind: "leaf" as const, x, y, c, o, s, a };
    }
    return { kind: "dot" as const, x, y, c, o, s: 2 + r() * 3, a: 0 };
  });
}

const W = 300;
const H = 170;
const ITEMS = shapes(21, W, H, 34);

export function Leaves({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className}>
      {ITEMS.map((it, i) =>
        it.kind === "leaf" ? (
          <path
            key={i}
            d={`M0 0c${(it.s * 0.6).toFixed(1)} -${(it.s * 0.5).toFixed(1)} ${(it.s * 1.4).toFixed(1)} -${(it.s * 0.5).toFixed(1)} ${(it.s * 2).toFixed(1)} 0c-${(it.s * 0.6).toFixed(1)} ${(it.s * 0.5).toFixed(1)} -${(it.s * 1.4).toFixed(1)} ${(it.s * 0.5).toFixed(1)} -${(it.s * 2).toFixed(1)} 0z`}
            fill={it.c}
            opacity={it.o.toFixed(2)}
            transform={`translate(${it.x.toFixed(0)} ${it.y.toFixed(0)}) rotate(${it.a})`}
          />
        ) : (
          <circle key={i} cx={it.x.toFixed(0)} cy={it.y.toFixed(0)} r={it.s.toFixed(1)} fill={it.c} opacity={it.o.toFixed(2)} />
        ),
      )}
    </svg>
  );
}

import type { CoverTone } from "@/lib/data";

const STYLE: Record<CoverTone, string> = {
  ink: "bg-ink text-leaf",
  leaf: "bg-leaf text-ink",
  sap: "bg-sap text-leaf-deep",
};

export function Avatar({ initials, tone, size = 40, ring = false }: { initials: string; tone: CoverTone; size?: number; ring?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ${STYLE[tone]} ${ring ? "ring-4 ring-white" : ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}

import Link from "next/link";

/** Dấu hiệu Grovelyn: một cái cây có rễ là đường mạch điện. */
export function Mark({ size = 28, color = "currentColor", leaf = "var(--color-leaf)" }: { size?: number; color?: string; leaf?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 30V13M16 19l-6-5V8M16 16l6-5V5M16 13V3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 30h8l2-2M28 30h-8l-2-2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="10" cy="7" r="2.4" fill={leaf} />
      <circle cx="22" cy="4.5" r="2.4" fill={leaf} />
      <circle cx="16" cy="3" r="2" fill={leaf} />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/community"
      className={`flex items-center gap-2 rounded-lg ${dark ? "text-white" : "text-ink"}`}
      aria-label="Grovelyn, về Trang chủ"
    >
      <Mark size={28} />
      <span className="font-display text-[22px] font-bold tracking-[-0.03em]">Grovelyn</span>
    </Link>
  );
}

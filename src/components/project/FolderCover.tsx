import type { CoverTone } from "@/lib/data";
import { ProjectLogo, type LogoKey } from "./ProjectLogo";

const TONE: Record<CoverTone, { back: string; front: string; line: string; tab: string }> = {
  ink: { back: "#12201a", front: "#1b2e22", line: "#5bd13a", tab: "#dcf6cf" },
  leaf: { back: "#47b52a", front: "#5bd13a", line: "#06110a", tab: "#06110a" },
  sap: { back: "#c6ecb5", front: "#dcf6cf", line: "#1d6b1d", tab: "#06110a" },
};

/**
 * Bìa dự án kiểu bìa hồ sơ: tab ghi loại dự án, logo dự án đặt chính giữa mặt trước như nhãn in sẵn.
 * `height` là chiều cao bìa; logo tự canh giữa phần mặt trước.
 */
export function FolderCover({
  tone,
  title,
  logo,
  logoSrc,
  kind,
  height = 196,
  logoSize = 84,
  className = "",
  fill = false,
}: {
  tone: CoverTone;
  title: string;
  logo?: LogoKey;
  logoSrc?: string;
  kind?: string;
  height?: number;
  logoSize?: number;
  className?: string;
  /** Cho phép bìa giãn cao hơn (dùng với className flex-1), `height` thành chiều cao tối thiểu. */
  fill?: boolean;
}) {
  const c = TONE[tone];
  const pad = Math.max(4, Math.round(logoSize * 0.06));
  const box = logoSize + pad * 2;
  return (
    <div className={`relative ${className}`} style={fill ? { minHeight: height } : { height }}>
      <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 22 C0 10 8 4 20 4 H150 C164 4 170 22 186 22 H382 C394 22 400 30 400 42 V200 H0 Z" fill={c.back} />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[80%] w-full">
        <path d="M0 26 C110 2 290 2 400 26 V200 H0 Z" fill={c.front} />
        <path d="M22 36 C130 16 270 16 378 36" fill="none" stroke={c.line} strokeOpacity=".35" strokeWidth="1.5" />
      </svg>
      {kind && (
        <span
          className="absolute left-3.5 max-w-[34%] truncate text-[11px] font-bold uppercase tracking-[0.04em] opacity-85"
          style={{ top: Math.max(2, Math.round(height * 0.025)), color: c.tab }}
        >
          {kind}
        </span>
      )}
      <span
        className="folder-logo absolute left-1/2 rounded-[20px] bg-white shadow-[0_4px_12px_-6px_rgba(6,17,10,0.35),0_0_0_1px_rgba(6,17,10,0.06)] transition-transform duration-300 ease-[var(--ease-grow)]"
        style={{ top: "63%", marginTop: -Math.round(box / 2), marginLeft: -Math.round(box / 2), padding: pad }}
      >
        <ProjectLogo title={title} logo={logo} src={logoSrc} size={logoSize} />
      </span>
    </div>
  );
}

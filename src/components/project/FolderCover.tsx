import type { CoverTone } from "@/lib/data";
import { ProjectLogo, type LogoKey } from "./ProjectLogo";

const TONE: Record<
  CoverTone,
  { back: string; front: string; line: string; tab: string }
> = {
  ink: { back: "#12201a", front: "#1b2e22", line: "#5bd13a", tab: "#dcf6cf" },
  leaf: { back: "#47b52a", front: "#5bd13a", line: "#06110a", tab: "#06110a" },
  sap: { back: "#c6ecb5", front: "#dcf6cf", line: "#1d6b1d", tab: "#06110a" },
};

/**
 * Bìa dự án kiểu bìa hồ sơ: tab ghi loại dự án, logo dự án đặt chính giữa mặt trước như nhãn in sẵn.
 * `height` là chiều cao bìa; logo tự canh giữa phần mặt trước. Tab co giãn theo nhãn, chữ dài thì cắt bằng dấu ba chấm.
 * Có `coverSrc` thì ảnh phủ kín thân bìa đúng một lần (giữ nguyên khung đã căn chỉnh), mép bìa trước chỉ vẽ
 * bằng đường sáng và phần phía trên hơi tối, không lặp ảnh. Có ảnh thì không đặt logo che ảnh.
 */
export function FolderCover({
  tone,
  title,
  logo,
  logoSrc,
  coverSrc,
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
  /** Ảnh bìa: ảnh sản phẩm, bản vẽ… phủ toàn bộ bìa thay cho màu. */
  coverSrc?: string;
  kind?: string;
  height?: number;
  logoSize?: number;
  className?: string;
  /** Cho phép bìa giãn cao hơn (dùng với className flex-1), `height` thành chiều cao tối thiểu. */
  fill?: boolean;
}) {
  const c = coverSrc ? { ...TONE.ink, tab: "#ffffff" } : TONE[tone];
  const photo = coverSrc
    ? {
        backgroundImage: `url("${coverSrc}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  const pad = Math.max(4, Math.round(logoSize * 0.06));
  const box = logoSize + pad * 2;
  // Bìa lớn (thẻ nổi bật, trang dự án) dùng tab và chữ lớn hơn để cân với khung.
  const big = logoSize >= 96;
  const tab = kind ? (big ? 38 : 24) : Math.max(12, Math.round(height * 0.12));
  return (
    <div
      className={`relative ${className}`}
      style={fill ? { minHeight: height } : { height }}
    >
      {/* Thân sau và tab dựng bằng px nên góc bo không phình theo bề ngang, tab co theo độ dài chữ. */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{
          top: tab,
          borderTopRightRadius: big ? 14 : 10,
          background: c.back,
        }}
      >
        {photo && <div className="absolute inset-0" style={photo} />}
      </div>
      <div
        className="absolute left-0 top-0 flex max-w-[calc(100%-2.5rem)]"
        style={{ height: tab + 1 }}
      >
        <span
          className={`flex min-w-0 items-center ${big ? "rounded-tl-[14px] pl-5 pr-2" : "rounded-tl-[10px] pl-3.5 pr-1.5"}`}
          style={{ background: c.back, color: c.tab }}
        >
          {kind && (
            <span
              className={`truncate pt-px font-bold uppercase tracking-[0.04em] opacity-90 ${big ? "text-[14px] leading-[20px]" : "text-[11px] leading-[16px]"}`}
            >
              {kind}
            </span>
          )}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 30 20"
          preserveAspectRatio="none"
          className="h-full shrink-0"
          style={{ width: Math.round(tab * 1.4) }}
        >
          <path d="M0 0 H4 C14 0 16 20 30 20 V21 H0 Z" fill={c.back} />
        </svg>
      </div>
      {photo ? (
        <>
          {/* Phần thân sau lộ ra phía trên mép bìa trước: phủ tối nhẹ để thấy hai lớp, ảnh vẫn liền một tấm. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bg-ink/30"
            style={{
              top: tab,
              bottom: "80%",
              borderTopRightRadius: big ? 14 : 10,
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-[80%] w-full"
          >
            <path
              d="M0 0 H400 V26 C290 2 110 2 0 26 Z"
              fill="#06110a"
              fillOpacity=".3"
            />
            <path
              d="M0 26 C110 2 290 2 400 26"
              fill="none"
              stroke="#fff"
              strokeOpacity=".9"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[80%] w-full"
        >
          <path d="M0 26 C110 2 290 2 400 26 V200 H0 Z" fill={c.front} />
          <path
            d="M22 36 C130 16 270 16 378 36"
            fill="none"
            stroke={c.line}
            strokeOpacity=".35"
            strokeWidth="1.5"
          />
        </svg>
      )}
      {!coverSrc && (
        <span
          className="folder-logo absolute left-1/2 bg-white shadow-[0_4px_12px_-6px_rgba(6,17,10,0.35),0_0_0_1px_rgba(6,17,10,0.06)] transition-transform duration-300 ease-[var(--ease-grow)]"
          style={{
            top: "63%",
            marginTop: -Math.round(box / 2),
            marginLeft: -Math.round(box / 2),
            padding: pad,
            borderRadius: Math.round(logoSize * 0.18) + pad,
          }}
        >
          <ProjectLogo
            title={title}
            logo={logo}
            src={logoSrc}
            size={logoSize}
          />
        </span>
      )}
    </div>
  );
}

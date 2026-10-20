/**
 * Logo dự án. Bản giao diện chưa có ảnh tải lên nên dùng vài logo mẫu tự vẽ (không phải logo thật của ai);
 * dự án không có logo thì hiện chữ cái đầu của tên.
 */
export type LogoKey = "nova" | "nha" | "tra" | "datban" | "robot" | "nuocep";

const LOGOS: Record<LogoKey, { bg: string; art: React.ReactNode }> = {
  nova: {
    bg: "#06110a",
    art: (
      <>
        <path d="M30 70V30l40 40V30" stroke="#5bd13a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="74" cy="26" r="6" fill="#dcf6cf" />
      </>
    ),
  },
  nha: {
    bg: "#dcf6cf",
    art: (
      <>
        <path d="M22 52 50 28l28 24v24H22z" fill="none" stroke="#1d6b1d" strokeWidth="6" strokeLinejoin="round" />
        <path d="M44 76V60h12v16" fill="none" stroke="#1d6b1d" strokeWidth="6" />
        <path d="M14 44c10-4 18-4 26 0" stroke="#5bd13a" strokeWidth="5" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  tra: {
    bg: "#3a5f8a",
    art: <path d="M24 62c0-12 14-14 18-6 4-16 30-14 30 4 8-2 12 4 10 10H24z" fill="none" stroke="#fdf7ec" strokeWidth="6" strokeLinejoin="round" />,
  },
  datban: {
    bg: "#f4ede2",
    art: (
      <>
        <path d="M28 40h38v18a19 19 0 0 1-38 0z" fill="#b5743a" />
        <path d="M66 46h6a8 8 0 0 1 0 16h-6" fill="none" stroke="#b5743a" strokeWidth="5" />
        <path d="M38 24c0 6 6 6 6 12M50 22c0 6 6 6 6 12" stroke="#b5743a" strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  robot: {
    bg: "#12201a",
    art: (
      <>
        <rect x="28" y="34" width="44" height="34" rx="9" fill="none" stroke="#5bd13a" strokeWidth="6" />
        <circle cx="42" cy="51" r="4" fill="#5bd13a" />
        <circle cx="58" cy="51" r="4" fill="#5bd13a" />
        <path d="M50 34V22" stroke="#5bd13a" strokeWidth="5" strokeLinecap="round" />
        <circle cx="50" cy="20" r="5" fill="#dcf6cf" />
      </>
    ),
  },
  nuocep: {
    bg: "#fff1dc",
    art: (
      <>
        <circle cx="50" cy="50" r="26" fill="#f28c28" />
        <circle cx="50" cy="50" r="19" fill="#ffd29a" />
        <path d="M50 31v38M31 50h38M37 37l26 26M63 37 37 63" stroke="#f28c28" strokeWidth="3" />
      </>
    ),
  },
};

const initialsOf = (title: string) =>
  title
    .split(/[\s:–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** `src` là logo người dùng tải lên (ảnh); không có thì dùng logo mẫu theo `logo`, rồi tới chữ cái đầu. */
export function ProjectLogo({ title, logo, src, size = 64 }: { title: string; logo?: LogoKey; src?: string; size?: number }) {
  const radius = Math.round(size * 0.18);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- ảnh logo người dùng chọn là object URL
    return <img src={src} alt={`Logo ${title}`} width={size} height={size} className="block object-cover" style={{ borderRadius: radius, width: size, height: size }} />;
  }
  const mark = logo ? LOGOS[logo] : undefined;
  return (
    <svg role="img" aria-label={`Logo ${title}`} width={size} height={size} viewBox="0 0 100 100" className="block" style={{ borderRadius: radius }}>
      <rect width="100" height="100" rx="18" fill={mark?.bg ?? "#dcf6cf"} />
      {mark ? (
        mark.art
      ) : (
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="800" fill="#1d6b1d" fontFamily="Bricolage Grotesque Variable, sans-serif">
          {initialsOf(title)}
        </text>
      )}
    </svg>
  );
}

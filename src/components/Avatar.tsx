import type { CoverTone } from "@/lib/data";
import { PersonAvatar } from "./PersonAvatar";

const STYLE: Record<CoverTone, string> = {
  ink: "bg-ink text-leaf",
  leaf: "bg-leaf text-ink",
  sap: "bg-sap text-leaf-deep",
};

export function Avatar({
  initials,
  tone,
  size = 40,
  ring = false,
  square = false,
  handle,
  showStatus = true,
}: {
  initials: string;
  tone: CoverTone;
  size?: number;
  ring?: boolean;
  /** Ô bo góc thay cho hình tròn, dùng cho nhóm. */
  square?: boolean;
  /** Có tài khoản thì hiện ảnh đại diện người đó chọn (nhân vật, ảnh thật hoặc chữ cái đầu) và trạng thái. */
  handle?: string;
  showStatus?: boolean;
}) {
  if (handle && !square) return <PersonAvatar handle={handle} initials={initials} size={size} ring={ring} showStatus={showStatus} />;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${square ? "rounded-lg" : "rounded-full"} font-display font-bold ${STYLE[tone]} ${ring ? "ring-4 ring-white" : ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}

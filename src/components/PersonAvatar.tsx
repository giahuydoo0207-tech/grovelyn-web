"use client";

import { BookOpen, Check, Coffee, Laptop, Search, type LucideIcon } from "lucide-react";
import type { CoverTone } from "@/lib/data";
import type { Status } from "@/lib/character";
import { useLook, type Look } from "@/lib/look";
import { CharacterArt } from "./CharacterArt";
import { LocalImg } from "./MediaGrid";

const TONE: Record<CoverTone, string> = {
  ink: "bg-ink text-leaf",
  leaf: "bg-leaf text-ink",
  sap: "bg-sap text-leaf-deep",
};

export const STATUS_ICON: Record<Exclude<Status, "Không hiện">, LucideIcon> = {
  "Đang làm việc": Laptop,
  "Đang học": BookOpen,
  "Nghỉ giải lao": Coffee,
  "Tìm cộng sự": Search,
  "Sẵn sàng nhận việc": Check,
};

/**
 * Ảnh đại diện của một người: nhân vật tự phối (mặc định), ảnh thật hoặc chữ cái đầu, kèm trạng thái.
 * Ảnh lớn (từ 96px) vẽ đồ vật trong tay; ảnh nhỏ chỉ có huy hiệu ở góc.
 */
export function PersonAvatar({
  handle,
  initials,
  size,
  ring = false,
  showStatus = true,
  preview,
}: {
  handle: string;
  initials: string;
  size: number;
  ring?: boolean;
  showStatus?: boolean;
  /** Xem trước bản đang chỉnh (chưa lưu). */
  preview?: Look;
}) {
  const saved = useLook(handle);
  const look = preview ?? saved;
  const big = size >= 96;
  const status = showStatus ? look.status : "Không hiện";
  const drawn = look.mode === "character" && look.character.style === "cartoon" && big;
  const Icon = status !== "Không hiện" ? STATUS_ICON[status] : null;
  const badge = Icon && size >= 28 && !drawn;
  const b = Math.max(14, Math.round(size * 0.36));

  let face;
  if (look.mode === "photo" && look.photo) face = <LocalImg src={look.photo} alt="" className="h-full w-full object-cover" />;
  else if (look.mode === "initials")
    face = (
      <span className={`flex h-full w-full items-center justify-center font-display font-bold ${TONE[look.initialsTone]}`} style={{ fontSize: Math.round(size * 0.36) }}>
        {initials}
      </span>
    );
  else face = <CharacterArt c={look.character} close={size <= 48} status={big ? status : null} className="block h-full w-full" />;

  return (
    <span aria-hidden="true" title={status !== "Không hiện" ? status : undefined} className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className={`block h-full w-full overflow-hidden rounded-full ${ring ? "ring-4 ring-white" : ""} ${status === "Sẵn sàng nhận việc" && !drawn && size >= 40 ? "outline outline-[3px] outline-offset-[-3px] outline-leaf-deep" : ""}`}
      >
        {face}
      </span>
      {/* Huy hiệu công việc nằm góc trái dưới, góc phải dưới để dành cho chấm đang online. */}
      {badge && (
        <span
          className={`absolute -bottom-0.5 -left-0.5 flex items-center justify-center rounded-full ring-2 ring-white ${status === "Sẵn sàng nhận việc" ? "bg-leaf-deep text-white" : "bg-ink text-leaf"}`}
          style={{ width: b, height: b }}
        >
          <Icon style={{ width: Math.round(b * 0.6), height: Math.round(b * 0.6) }} strokeWidth={2.6} />
        </span>
      )}
    </span>
  );
}

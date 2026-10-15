/* eslint-disable @next/next/no-img-element -- ảnh nhóm có thể là data URL vừa cắt */

import type { CoverTone } from "@/lib/data";
import { ProjectCover } from "./ProjectCover";

const MARK: Record<CoverTone, string> = {
  ink: "bg-ink text-leaf",
  leaf: "bg-leaf text-ink",
  sap: "bg-leaf-deep text-white",
};

/** Ảnh bìa nhóm: ảnh đã cắt nếu có, không thì tán cây mạch điện theo seed. */
export function GroupCover({ cover, seed, tone, className = "" }: { cover?: string; seed: number; tone: CoverTone; className?: string }) {
  return cover ? (
    <img src={cover} alt="" className={`h-full w-full object-cover ${className}`} />
  ) : (
    <ProjectCover seed={seed} tone={tone} className={`h-full w-full ${className}`} />
  );
}

/** Ảnh đại diện vuông bo góc của nhóm: ảnh nếu có, không thì chữ cái đầu. */
export function GroupMark({
  mark,
  tone,
  photo,
  size = 52,
  ring = 0,
  ringColor = "#ffffff",
}: {
  mark: string;
  tone: CoverTone;
  photo?: string;
  size?: number;
  ring?: number;
  ringColor?: string;
}) {
  const radius = Math.round(size * 0.24);
  const style = { width: size, height: size, borderRadius: radius, boxShadow: ring ? `0 0 0 ${ring}px ${ringColor}` : undefined };
  return photo ? (
    <img src={photo} alt="" className="shrink-0 object-cover" style={style} />
  ) : (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center font-display font-bold ${MARK[tone]}`} style={{ ...style, fontSize: Math.round(size * 0.34) }}>
      {mark}
    </span>
  );
}

export const groupInitials = (name: string) => {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "?";
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
};

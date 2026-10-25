"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { ME } from "@/lib/data";
import { useLook } from "@/lib/look";
import { GardenCover } from "@/components/GardenCover";
import { LocalImg } from "@/components/MediaGrid";

/** Ảnh bìa hồ sơ: ảnh người dùng tải lên hoặc luống vườn. Chủ hồ sơ có nút đổi ảnh bìa. */
export function ProfileCover({ handle, seed }: { handle: string; seed: number }) {
  const cover = useLook(handle).cover;
  return (
    <div className="relative h-32 sm:h-44">
      {cover?.kind === "photo" ? (
        <LocalImg src={cover.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <GardenCover seed={cover?.kind === "garden" ? cover.seed : seed} className="absolute inset-0 h-full w-full" />
      )}
      {handle === ME && (
        <Link
          href="/settings/account#anh-bia"
          className="absolute right-3 top-3 inline-flex h-9 items-center gap-2 rounded-full bg-ink/75 px-3.5 text-[13px] font-bold text-white backdrop-blur hover:bg-ink"
        >
          <Camera className="h-4 w-4" aria-hidden="true" /> Đổi ảnh bìa
        </Link>
      )}
    </div>
  );
}

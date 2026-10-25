"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, X } from "lucide-react";
import { ME } from "@/lib/data";
import { useLook } from "@/lib/look";
import { GardenCover } from "@/components/GardenCover";
import { LocalImg } from "@/components/MediaGrid";

/** Ảnh bìa hồ sơ: ảnh người dùng tải lên hoặc luống vườn. Bấm vào ảnh tải lên để xem toàn bộ ảnh gốc. */
export function ProfileCover({
  handle,
  seed,
}: {
  handle: string;
  seed: number;
}) {
  const cover = useLook(handle).cover;
  const [open, setOpen] = useState(false);
  const photo = cover?.kind === "photo" ? cover : null;

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative aspect-[2/1] max-h-[420px] w-full sm:aspect-[3/1]">
      {photo ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Xem toàn bộ ảnh bìa"
          className="absolute inset-0 block cursor-zoom-in"
        >
          <LocalImg
            src={photo.src}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
      ) : (
        <GardenCover
          seed={cover?.kind === "garden" ? cover.seed : seed}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {handle === ME && (
        <Link
          href="/settings/account#anh-bia"
          className="absolute right-3 top-3 inline-flex h-9 items-center gap-2 rounded-full bg-ink/75 px-3.5 text-[13px] font-bold text-white backdrop-blur hover:bg-ink"
        >
          <Camera className="h-4 w-4" aria-hidden="true" /> Đổi ảnh bìa
        </Link>
      )}
      {open &&
        photo &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ảnh bìa"
            className="fixed inset-0 z-[60] flex flex-col bg-ink"
            onClick={() => setOpen(false)}
          >
            <div className="flex justify-end p-3">
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-8">
              <LocalImg
                src={photo.original ?? photo.src}
                alt="Ảnh bìa, toàn bộ ảnh gốc"
                className="h-full w-full object-contain"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

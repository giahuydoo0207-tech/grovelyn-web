"use client";

import { useState } from "react";
import { ExternalLink, FileText, HardDrive, PenTool, Play } from "lucide-react";
import { toEmbed, type EmbedProvider } from "@/lib/embed";

const ICON: Record<EmbedProvider, typeof Play> = { youtube: Play, figma: PenTool, drive: HardDrive, pdf: FileText };

/**
 * Nội dung nhúng (YouTube, Figma, Google Drive, PDF). Chỉ tải iframe khi người xem bấm, để trang nhẹ và không
 * gửi gì cho dịch vụ bên ngoài trước khi người xem muốn xem. Link không nhúng được thì hiện như link thường.
 */
export function Embed({ url, title }: { url: string; title: string }) {
  const info = toEmbed(url);
  const [open, setOpen] = useState(false);

  if (!info) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-leaf-deep hover:underline">
        {title} <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  const Icon = ICON[info.provider];
  const ratio = info.ratio === "video" ? "aspect-video" : "aspect-[4/5] sm:aspect-[4/3]";

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-white text-ink">
      <div className={`relative bg-mist ${open ? ratio : "h-52"}`}>
        {open ? (
          <iframe
            src={info.src}
            title={title}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-ink"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-semibold">Xem {info.label} ngay trong trang</span>
            <span className="max-w-[40ch] px-4 text-sm text-moss">Nội dung chỉ được tải khi bạn bấm.</span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
          <span className="truncate">{title}</span>
          <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-moss">{info.label}</span>
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-moss hover:text-ink">
          Mở riêng <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

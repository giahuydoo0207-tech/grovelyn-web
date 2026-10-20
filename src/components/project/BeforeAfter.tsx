"use client";

import { useState } from "react";
import type { Shot } from "@/lib/showcase";

/** So sánh trước/sau bằng thanh kéo; dùng được bằng bàn phím vì là ô range thật. */
export function BeforeAfter({ before, after }: { before: Shot; after: Shot }) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="overflow-hidden rounded-2xl border border-line">
      <div className="relative aspect-[8/5] select-none bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after.src} alt={after.caption} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before.src} alt={before.caption} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(6,17,10,0.25)]" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-ink shadow-md">
            ⇆
          </span>
        </div>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">Trước</span>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-leaf px-3 py-1 text-xs font-semibold text-ink">Sau</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Kéo để so sánh trước và sau"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="grid grid-cols-2 gap-3 border-t border-line px-4 py-3 text-sm text-moss">
        <span>{before.caption}</span>
        <span className="text-right">{after.caption}</span>
      </figcaption>
    </figure>
  );
}

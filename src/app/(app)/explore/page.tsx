import type { Metadata } from "next";
import { Suspense } from "react";
import { PROJECTS } from "@/lib/data";
import { ExploreGrid } from "./ExploreGrid";

export const metadata: Metadata = { title: "Khám phá" };

export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.045em]">
            Dự án đang lớn lên
          </h1>
          <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-moss">
            Bản vẽ, mã nguồn, kế hoạch, mô hình. Xem cách mọi người ở mọi ngành làm ra sản phẩm thật.
          </p>
        </div>
        <p className="text-sm text-moss">
          <span className="font-display text-2xl font-bold tabular-nums text-ink">{PROJECTS.length}</span> dự án mới cập nhật
        </p>
      </header>
      <Suspense fallback={<div className="h-[60vh] rounded-2xl bg-mist" aria-hidden="true" />}>
        <ExploreGrid />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PROJECTS } from "@/lib/data";
import { ExploreGrid } from "./ExploreGrid";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-none tracking-[-0.04em]">
            Dự án đang lớn lên
          </h1>
          <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-moss sm:text-base">
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

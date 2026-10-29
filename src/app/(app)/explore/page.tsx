import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreGrid } from "./ExploreGrid";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-[clamp(1.625rem,2.6vw,2.125rem)] font-bold leading-tight tracking-[-0.03em]">
          Dự án đang lớn lên
        </h1>
        <p className="text-sm text-moss sm:text-[15px]">
          Bản vẽ, mã nguồn, kế hoạch, mô hình. Xem cách mọi người ở mọi ngành làm ra sản phẩm thật.
        </p>
      </header>
      <Suspense fallback={<div className="h-[60vh] rounded-2xl bg-mist" aria-hidden="true" />}>
        <ExploreGrid />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { SavedGrid } from "./SavedGrid";

export const metadata: Metadata = { title: "Đã lưu" };

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.04em]">Đã lưu</h1>
        <p className="mt-2 max-w-[52ch] text-moss">Bài đăng và dự án bạn bấm Lưu để xem lại sau. Chỉ mình bạn thấy danh sách này.</p>
      </header>
      <SavedGrid />
    </div>
  );
}

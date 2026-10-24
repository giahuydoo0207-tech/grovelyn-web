import type { Metadata } from "next";
import { ExchangeBoard } from "./ExchangeBoard";

export const metadata: Metadata = { title: "Trao đổi" };

/** Tab Trao đổi: nơi dự án đang làm dở nhận góp ý. Bảng tin chung nằm ở Trang chủ. */
export default function ExchangePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ExchangeBoard />
    </div>
  );
}

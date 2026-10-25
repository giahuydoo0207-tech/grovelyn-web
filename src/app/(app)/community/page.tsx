import type { Metadata } from "next";
import { Feed } from "./Feed";
import { HomeRail } from "./HomeRail";
import { HomeSide, HomeStrip } from "./HomeSide";

export const metadata: Metadata = { title: "Trang chủ" };

/**
 * Trang chủ sau khi đăng nhập: thanh icon bên trái, bảng tin một cột ở giữa (mỗi loại bài một dáng thẻ,
 * bình luận hiện theo luồng), cột phải là nhịp cộng đồng, người online, sự kiện và chủ đề được nói nhiều.
 */
export default function CommunityPage() {
  return (
    <div className="grid items-start gap-6 md:grid-cols-[84px_minmax(0,1fr)] lg:grid-cols-[84px_minmax(0,1fr)_320px]">
      <h1 className="sr-only">Trang chủ Grovelyn</h1>
      <HomeRail />
      <div className="mx-auto flex w-full min-w-0 max-w-[700px] flex-col gap-4">
        <HomeStrip />
        <Feed />
      </div>
      <HomeSide />
    </div>
  );
}

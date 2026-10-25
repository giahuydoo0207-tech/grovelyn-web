import type { Metadata } from "next";
import { Feed } from "./Feed";
import { HomeSide, HomeStrip } from "./HomeSide";

export const metadata: Metadata = { title: "Trang chủ" };

/**
 * Trang chủ sau khi đăng nhập (thanh icon bên trái nằm ở layout chung): bảng tin một cột ở giữa (mỗi loại bài một dáng thẻ,
 * bình luận hiện theo luồng), cột phải là người online, sự kiện và chủ đề được nói nhiều.
 */
export default function CommunityPage() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <h1 className="sr-only">Trang chủ Grovelyn</h1>
      <div className="mx-auto flex w-full min-w-0 max-w-[700px] flex-col gap-4">
        <HomeStrip />
        <Feed />
      </div>
      <HomeSide />
    </div>
  );
}

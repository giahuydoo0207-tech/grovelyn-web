import type { Metadata } from "next";
import { Feed } from "./Feed";
import { Suggestions } from "./Suggestions";

export const metadata: Metadata = { title: "Cộng đồng" };

export default function CommunityPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,640px)_330px] lg:justify-center">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.2rem)] font-bold leading-none tracking-[-0.045em]">Cộng đồng</h1>
        <p className="mt-3 text-[17px] text-moss">Khoe tiến độ, tìm người làm cùng, hỏi khi bí.</p>
        <Feed />
      </div>
      <Suggestions />
    </div>
  );
}

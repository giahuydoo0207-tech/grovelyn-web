import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { GroupsBoard } from "./GroupsBoard";

export const metadata: Metadata = { title: "Nhóm" };

export default function GroupsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,4.4vw,2.5rem)] font-bold leading-none tracking-[-0.035em]">Nhóm</h1>
          <p className="mt-2 text-moss">Nơi người cùng ngành làm dự án, hỏi han và tìm cộng sự với nhau.</p>
        </div>
        <Link href="/groups/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-leaf px-5 font-bold text-ink hover:bg-[#6ee04d]">
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.6} aria-hidden="true" />
          Tạo nhóm
        </Link>
      </div>
      <GroupsBoard />
    </div>
  );
}

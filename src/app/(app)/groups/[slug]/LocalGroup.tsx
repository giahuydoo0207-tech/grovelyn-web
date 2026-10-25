"use client";

import Link from "next/link";
import { useGroup } from "@/lib/stores";
import { GroupHome } from "./GroupHome";

/** Nhóm bạn tạo trong bản dùng thử, đọc từ trình duyệt. */
export function LocalGroup({ slug }: { slug: string }) {
  const group = useGroup(slug);
  if (!group)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy nhóm</h1>
        <p className="mt-2 text-moss">Nhóm có thể đã bị xoá, hoặc được tạo trên một trình duyệt khác.</p>
        <Link href="/groups" className="mt-5 inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink">
          Về trang Nhóm
        </Link>
      </div>
    );
  return <GroupHome group={group} />;
}

"use client";

import Link from "next/link";
import { useEvent } from "@/lib/stores";
import { EventView } from "../EventView";

/** Sự kiện bạn tạo trong bản dùng thử, đọc từ trình duyệt. */
export function LocalEvent({ slug }: { slug: string }) {
  const event = useEvent(slug);
  if (!event)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy sự kiện</h1>
        <p className="mt-2 text-moss">Sự kiện có thể đã bị xoá, hoặc được tạo trên một trình duyệt khác.</p>
        <Link href="/events" className="mt-5 inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink">
          Về trang Sự kiện
        </Link>
      </div>
    );
  return <EventView event={event} />;
}

import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EventsBoard } from "./EventsBoard";

export const metadata: Metadata = { title: "Sự kiện" };

export default function EventsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,4.4vw,2.5rem)] font-bold leading-none tracking-[-0.035em]">Sự kiện</h1>
          <p className="mt-2 text-moss">Buổi góp ý, workshop và ngày hội do cộng đồng tự tổ chức.</p>
        </div>
        <Link href="/events/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-leaf px-5 font-bold text-ink hover:bg-[#6ee04d]">
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.6} aria-hidden="true" />
          Tạo sự kiện
        </Link>
      </div>
      <EventsBoard />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, Mail, Settings2 } from "lucide-react";
import { ME, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { NoticeCenter } from "./NoticeCenter";
import { WeekGarden } from "./WeekGarden";

export const metadata: Metadata = { title: "Thông báo" };

/** Thông báo: hồ sơ và cài đặt bên trái, danh sách ở giữa, cây tương tác của tuần bên phải. */
export default function NotificationsPage() {
  const me = userOf(ME)!;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <aside className="hidden flex-col gap-3 md:flex md:sticky md:top-[88px]">
        <Link href={`/u/${me.handle}`} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3 transition-colors hover:bg-mist">
          <Avatar initials={me.initials} tone={me.tone} size={40} />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold">{me.name}</span>
            <span className="text-[13px] text-moss">Xem hồ sơ của bạn</span>
          </span>
        </Link>

        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">Quản lý thông báo</h2>
          <ul className="mt-3 flex flex-col gap-2.5 text-[13px]">
            <li className="flex items-center gap-2.5">
              <BellRing className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
              <span className="flex-1">Trong ứng dụng</span>
              <span className="font-semibold text-leaf-deep">Bật</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
              <span className="flex-1">Tóm tắt qua email</span>
              <span className="font-semibold text-moss">Mỗi tuần</span>
            </li>
          </ul>
          <Link
            href="/settings/notifications"
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold transition-colors hover:bg-mist"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Xem cài đặt
          </Link>
        </section>
      </aside>

      <NoticeCenter />

      <aside className="hidden lg:sticky lg:top-[88px] lg:block">
        <WeekGarden />
      </aside>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, BriefcaseBusiness, CalendarDays, Flag, Newspaper, Users, type LucideIcon } from "lucide-react";
import { MY_GROUPS, ME, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { Feed } from "./Feed";
import { Suggestions } from "./Suggestions";

export const metadata: Metadata = { title: "Trang chủ" };

const SHORTCUTS: { href: string; label: string; icon: LucideIcon; count?: number; filled?: boolean }[] = [
  { href: "/explore", label: "Đã lưu", icon: Bookmark, filled: true },
  { href: "/groups", label: "Nhóm", icon: Users, count: MY_GROUPS.filter((g) => g.fresh > 0).length },
  { href: "/community", label: "Bản tin", icon: Newspaper },
  { href: "/events", label: "Sự kiện", icon: CalendarDays, count: 2 },
  { href: "/community", label: "Thử thách", icon: Flag },
  { href: "/explore", label: "Cơ hội", icon: BriefcaseBusiness },
];

/** Trang chủ sau khi đăng nhập: lối tắt và nhóm bên trái, bảng tin ở giữa, người online và sự kiện bên phải. */
export default function CommunityPage() {
  const me = userOf(ME)!;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <h1 className="sr-only">Trang chủ Grovelyn</h1>

      <aside className="hidden flex-col gap-3 md:flex md:sticky md:top-[88px]">
        <Link href={`/u/${me.handle}`} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3 transition-colors hover:bg-mist">
          <Avatar initials={me.initials} tone={me.tone} size={40} />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold">{me.name}</span>
            <span className="text-[13px] text-moss">Xem hồ sơ của bạn</span>
          </span>
        </Link>

        <nav aria-label="Lối tắt" className="rounded-2xl border border-line bg-white p-1.5">
          {SHORTCUTS.map(({ href, label, icon: Icon, count, filled }) => (
            <Link key={label} href={href} className="flex h-11 items-center gap-3 rounded-[10px] px-2.5 text-[15px] font-semibold transition-colors hover:bg-mist">
              <Icon className="h-[22px] w-[22px]" fill={filled ? "currentColor" : "none"} strokeWidth={2} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {count ? (
                <span className="rounded-full bg-sap px-2 py-0.5 text-xs font-bold tabular-nums text-leaf-deep">
                  {count}
                  <span className="sr-only"> mục mới</span>
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <section className="rounded-2xl border border-line bg-white p-3.5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold">Nhóm của bạn</h2>
            <Link href="/groups" className="text-[13px] font-semibold text-leaf-deep hover:underline">
              Tất cả
            </Link>
          </div>
          <ul className="mt-2.5 flex flex-col gap-1">
            {MY_GROUPS.map((g) => (
              <li key={g.slug}>
                <Link href={`/groups/${g.slug}`} className="-mx-1.5 flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-mist">
                  <Avatar initials={g.mark} tone={g.tone} size={36} square />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">{g.name}</span>
                    <span className="text-xs text-moss">
                      {g.members} thành viên{g.fresh ? `, ${g.fresh} bài mới` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <Feed />

      <Suggestions />
    </div>
  );
}

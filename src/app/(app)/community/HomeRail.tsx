"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, HandHelping, House, Plus, Users, type LucideIcon } from "lucide-react";
import { GROUPS, ME, MY_GROUPS } from "@/lib/data";
import { joinedGroups, leftGroups, myGroupsStore, useUser } from "@/lib/stores";
import { Avatar } from "@/components/Avatar";

const ITEMS: { href: string; label: string; icon: LucideIcon; count?: number; here?: boolean }[] = [
  { href: "/community", label: "Trang chủ", icon: House, here: true },
  { href: "/saved", label: "Đã lưu", icon: Bookmark },
  { href: "/groups", label: "Nhóm", icon: Users, count: MY_GROUPS.filter((g) => g.fresh > 0).length },
  { href: "/events", label: "Sự kiện", icon: CalendarDays, count: 2 },
  { href: "/exchange", label: "Trao đổi", icon: HandHelping, count: 4 },
];

/** Thanh icon dọc bên trái Trang chủ: hồ sơ, lối tắt và các nhóm của bạn dạng ô vuông. */
export function HomeRail() {
  const me = useUser(ME)!;
  const left = leftGroups.use();
  const joined = joinedGroups.use();
  const created = myGroupsStore.use();
  const groups = [
    ...MY_GROUPS.filter((g) => !left.includes(g.slug)),
    ...GROUPS.filter((g) => joined.includes(g.slug) && !g.joined),
    ...created,
  ];

  return (
    <aside className="hidden md:sticky md:top-[88px] md:block">
      <nav aria-label="Lối tắt" className="flex flex-col items-stretch gap-1">
        <Link href={`/u/${me.handle}`} aria-label="Hồ sơ của bạn" className="mx-auto mb-2 rounded-full transition-transform hover:scale-105">
          <Avatar initials={me.initials} tone={me.tone} size={48} />
        </Link>
        {ITEMS.map(({ href, label, icon: Icon, count, here }) => (
          <Link
            key={href}
            href={href}
            aria-current={here ? "page" : undefined}
            className={`relative flex flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-bold transition-colors ${here ? "bg-ink text-white" : "text-ink hover:bg-white"}`}
          >
            <Icon className={`h-[22px] w-[22px] ${here ? "text-leaf" : ""}`} aria-hidden="true" />
            {label}
            {count ? (
              <span className="absolute right-3 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf-deep px-1 text-[11px] text-white ring-2 ring-mist">
                {count}
                <span className="sr-only"> mục mới</span>
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mx-2 my-3 h-px bg-line" />
      <p className="text-center text-[11px] font-bold text-moss">Nhóm</p>
      <ul className="mt-2 flex flex-col items-center gap-2.5">
        {groups.map((g) => (
          <li key={g.slug}>
            <Link href={`/groups/${g.slug}`} title={g.name} aria-label={`${g.name}${g.fresh ? `, ${g.fresh} bài mới` : ""}`} className="relative block rounded-xl transition-transform hover:scale-105">
              <Avatar initials={g.mark} tone={g.tone} size={44} square />
              {g.fresh > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-leaf ring-2 ring-mist" />}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/groups" aria-label="Tìm hoặc tạo nhóm" className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-[#c9d0c4] text-moss hover:bg-white">
            <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </aside>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, FolderGit2, Hash, Users } from "lucide-react";
import { ME, projectsBy, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { Feed } from "./Feed";
import { Suggestions } from "./Suggestions";

export const metadata: Metadata = { title: "Trang chủ" };

/** Trang chủ sau khi đăng nhập, bố cục ba cột như LinkedIn: hồ sơ, bảng tin, gợi ý. */
export default function CommunityPage() {
  const me = userOf(ME)!;
  const mine = projectsBy(ME).length;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <h1 className="sr-only">Trang chủ Grovelyn</h1>

      <aside className="hidden flex-col gap-3 md:flex md:sticky md:top-[88px]">
        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="relative h-16">
            <ProjectCover seed={42} tone="ink" className="absolute inset-0 h-full w-full" />
          </div>
          <div className="px-4 pb-4">
            <div className="relative z-10 -mt-9">
              <Avatar initials={me.initials} tone={me.tone} size={72} ring />
            </div>
            <Link href={`/u/${me.handle}`} className="mt-2 block font-display text-lg font-bold tracking-[-0.02em] hover:underline">
              {me.name}
            </Link>
            <p className="mt-0.5 text-sm leading-snug text-ink/80">{me.headline}</p>
            <p className="mt-1 text-[13px] text-moss">{me.location}</p>
          </div>
          <dl className="border-t border-line px-4 py-3 text-sm">
            <div className="flex justify-between py-1">
              <dt className="text-moss">Người theo dõi</dt>
              <dd className="font-semibold tabular-nums text-leaf-deep">{me.followers}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-moss">Dự án</dt>
              <dd className="font-semibold tabular-nums text-leaf-deep">{mine}</dd>
            </div>
          </dl>
          <Link href={`/u/${me.handle}`} className="block border-t border-line px-4 py-3 text-sm font-semibold hover:bg-mist">
            Hoàn thiện hồ sơ để doanh nghiệp tìm thấy bạn
          </Link>
        </section>

        <nav aria-label="Lối tắt" className="rounded-2xl border border-line bg-white py-2">
          {[
            { href: `/u/${me.handle}`, label: "Dự án của tôi", icon: FolderGit2 },
            { href: "/explore", label: "Đã lưu", icon: Bookmark },
            { href: "/explore?q=timcongsu", label: "Tìm cộng sự", icon: Users },
            { href: "/explore?q=doantotnghiep", label: "Chủ đề theo dõi", icon: Hash },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-mist">
              <Icon className="h-[18px] w-[18px] text-moss" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <Feed />

      <Suggestions />
    </div>
  );
}

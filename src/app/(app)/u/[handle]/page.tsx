import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { ME, USERS, projectOf, projectsBy, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { GardenCover } from "@/components/GardenCover";
import { ProfileActions } from "./ProfileActions";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileStats } from "./ProfileStats";
import { ProfileSide } from "./ProfileSide";
import { MyText } from "./MyText";

export function generateStaticParams() {
  return USERS.map((u) => ({ handle: u.handle }));
}

export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  return { title: userOf(handle)?.name ?? "Không tìm thấy" };
}

/**
 * Hồ sơ: ai đây (đầu trang), họ làm ra gì (tab Dự án, mặc định), họ giúp ai (tab Đóng góp).
 * Ảnh bìa mặc định là một luống vườn nhiều màu riêng cho mỗi người, không bắt người dùng tìm ảnh.
 */
export default async function ProfilePage({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const user = userOf(handle);
  if (!user) notFound();

  const projects = projectsBy(user.handle);
  const pinned = user.pinned.map(projectOf).filter((p) => p !== undefined);
  const isMe = user.handle === ME;
  const seed = [...user.handle].reduce((s, c) => s + c.charCodeAt(0), 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="relative h-32 sm:h-44">
          <GardenCover seed={seed} className="absolute inset-0 h-full w-full" />
        </div>
        <div className="flex flex-col gap-4 px-5 pb-6 sm:px-8">
          <div className="relative z-10 -mt-12 flex flex-wrap items-end justify-between gap-4">
            <Avatar initials={user.initials} tone={user.tone} size={104} ring />
            <ProfileActions isMe={isMe} name={user.name} handle={user.handle} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-none tracking-[-0.04em]">
              <MyText handle={user.handle} field="name" />
            </h1>
            <p className="max-w-[62ch] text-[17px] leading-relaxed text-ink/85">
              <MyText handle={user.handle} field="headline" />
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-moss">
              <span className="font-semibold text-ink">{user.intro}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <MyText handle={user.handle} field="location" />
              </span>
              <span aria-hidden="true">·</span>
              <span>@{user.handle}</span>
            </p>
          </div>
          <ProfileStats handle={user.handle} projects={projects.length} followers={user.followers} follows={user.following} />
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ProfileTabs user={user} pinned={pinned} projects={projects} isMe={isMe} />
        <ProfileSide user={user} isMe={isMe} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { ME, POSTS, USERS, projectOf, projectsBy, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { ProfileActions } from "./ProfileActions";
import { ProfileTabs } from "./ProfileTabs";

export function generateStaticParams() {
  return USERS.map((u) => ({ handle: u.handle }));
}

export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  return { title: userOf(handle)?.name ?? "Không tìm thấy" };
}

export default async function ProfilePage({ params }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const user = userOf(handle);
  if (!user) notFound();

  const projects = projectsBy(user.handle);
  const pinned = user.pinned.map(projectOf).filter((p) => p !== undefined);
  // Bài trong nhóm chỉ hiện trong nhóm, không lên hồ sơ (nhóm riêng tư chỉ thành viên xem được).
  const posts = POSTS.filter((p) => p.author === user.handle && !p.group);
  const isMe = user.handle === ME;
  const seed = [...user.handle].reduce((s, c) => s + c.charCodeAt(0), 0);

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-3xl border border-line">
        <div className="relative h-40 sm:h-52">
          <ProjectCover seed={seed} tone="ink" className="absolute inset-0 h-full w-full" />
        </div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:px-8">
          <div className="relative z-10 -mt-14 flex flex-wrap items-end justify-between gap-4">
            <Avatar initials={user.initials} tone={user.tone} size={112} ring />
            <ProfileActions isMe={isMe} name={user.name} handle={user.handle} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-none tracking-[-0.04em]">{user.name}</h1>
            </div>
            <p className="max-w-[60ch] text-[17px] leading-relaxed text-ink/85">{user.headline}</p>
            {user.lenses.length > 0 && (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-moss">Có thể góp ý về</span>
                {user.lenses.map((l) => (
                  <span key={l} className="rounded-full bg-sap px-3 py-1 font-semibold text-leaf-deep">
                    {l}
                  </span>
                ))}
              </p>
            )}
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss">
              <span>@{user.handle}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {user.location}
              </span>
              <span>{user.intro}</span>
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              ["dự án", projects.length],
              ["bài đăng", posts.length],
              ["người theo dõi", user.followers],
              ["đang theo dõi", user.following],
            ].map(([label, n]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-xl font-bold tabular-nums">{n}</dd>
                <span className="text-sm text-moss" aria-hidden="true">
                  {label}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProfileTabs user={user} pinned={pinned} projects={projects} posts={posts} isMe={isMe} />
    </div>
  );
}

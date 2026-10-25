"use client";

import { ME } from "@/lib/data";
import { following, myProjectsStore, postsStore } from "@/lib/stores";

/** Số dự án, bài đăng, người theo dõi: tính cả những gì bạn vừa làm (lưu trên trình duyệt). */
export function ProfileStats({ handle, projects, followers, follows }: { handle: string; projects: number; followers: number; follows: number }) {
  const posts = postsStore.use().filter((p) => p.author === handle && !p.group).length;
  const mine = myProjectsStore.use().length;
  const followed = following.use();
  const isMe = handle === ME;
  const rows: [string, number][] = [
    ["dự án", projects + (isMe ? mine : 0)],
    ["bài đăng", posts],
    ["người theo dõi", followers + (!isMe && followed.includes(handle) ? 1 : 0)],
    ["đang theo dõi", follows + (isMe ? followed.length : 0)],
  ];
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2">
      {rows.map(([label, n]) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <dt className="sr-only">{label}</dt>
          <dd className="font-display text-xl font-bold tabular-nums">{n}</dd>
          <span className="text-sm text-moss" aria-hidden="true">
            {label}
          </span>
        </div>
      ))}
    </dl>
  );
}

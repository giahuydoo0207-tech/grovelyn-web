"use client";

import Link from "next/link";
import { useState } from "react";
import { projectOf } from "@/lib/data";
import { myProjectsStore, postsStore, savedPosts, savedProjects } from "@/lib/stores";
import { ProjectCard } from "@/components/ProjectCard";
import { PostCard } from "../community/PostCard";

const TABS = ["Bài đăng", "Dự án"] as const;

/** Bài đăng và dự án bạn đã bấm Lưu, đọc từ trình duyệt. */
export function SavedGrid() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Bài đăng");
  const mine = myProjectsStore.use();
  const projects = savedProjects
    .use()
    .map((s) => projectOf(s) ?? mine.find((p) => p.slug === s))
    .filter((p) => p !== undefined);
  const all = postsStore.use();
  const saved = savedPosts.use();
  // Bài lưu sau cùng hiện trước.
  const posts = [...saved]
    .reverse()
    .map((id) => all.find((p) => p.id === id))
    .filter((p) => p !== undefined);
  const count = { "Bài đăng": posts.length, "Dự án": projects.length };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Loại mục đã lưu" className="flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px flex items-center gap-2 border-b-[3px] pb-2.5 text-[16px] font-bold transition-colors ${tab === t ? "border-leaf text-ink" : "border-transparent text-moss hover:text-ink"}`}
          >
            {t}
            <span className={`text-sm tabular-nums ${tab === t ? "text-leaf" : "text-leaf-deep"}`}>{count[t]}</span>
          </button>
        ))}
      </div>

      {tab === "Bài đăng" ? (
        posts.length ? (
          <div className="flex max-w-[700px] flex-col gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} showGroup />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-moss">
            Chưa lưu bài đăng nào. Bấm Lưu dưới một bài ở{" "}
            <Link href="/community" className="font-semibold text-leaf-deep hover:underline">
              Trang chủ
            </Link>{" "}
            để xem lại sau.
          </p>
        )
      ) : projects.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-moss">
          Chưa lưu dự án nào.{" "}
          <Link href="/explore" className="font-semibold text-leaf-deep hover:underline">
            Xem Sản phẩm
          </Link>
        </p>
      )}
    </div>
  );
}

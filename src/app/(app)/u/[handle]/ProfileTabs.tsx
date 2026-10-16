"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pin } from "lucide-react";
import type { Post, Project, User } from "@/lib/data";
import { ProjectCard } from "@/components/ProjectCard";
import { PostCard } from "../../community/PostCard";

const TABS = ["Dự án", "Bài đăng", "Giới thiệu"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({
  user,
  pinned,
  projects,
  posts,
  isMe,
}: {
  user: User;
  pinned: Project[];
  projects: Project[];
  posts: Post[];
  isMe: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Dự án");

  // Liên kết "#bai-dang" (từ menu tài khoản) mở thẳng tab Bài đăng.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#bai-dang") setTab("Bài đăng");
    };
    const raf = requestAnimationFrame(sync);
    window.addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  const others = projects.filter((p) => !pinned.some((q) => q.slug === p.slug));

  return (
    <div id="bai-dang" className="scroll-mt-24">
      <div role="tablist" aria-label="Hồ sơ" className="flex gap-6 border-b border-line">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-[15px] font-semibold ${on ? "text-ink" : "text-moss hover:text-ink"}`}
            >
              {t}
              {on && <motion.span layoutId="profile-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-leaf" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pt-6"
        >
          {tab === "Dự án" && (
            <div className="flex flex-col gap-8">
              {projects.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-line p-8">
                  <p className="font-display text-xl font-bold">{isMe ? "Bạn chưa có dự án nào" : "Chưa có dự án công khai"}</p>
                  {isMe && (
                    <>
                      <p className="mt-2 max-w-[50ch] text-moss">Đăng dự án đầu tiên, kể cả khi còn dang dở. Phiên bản sau sẽ cho thấy bạn tiến bộ thế nào.</p>
                      <Link href="/new" className="mt-4 inline-block rounded-xl bg-leaf px-5 py-3 font-bold text-ink hover:bg-[#6ee04d]">
                        Tạo dự án
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
              {pinned.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.02em]">
                    <Pin className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> Đã ghim
                  </h2>
                  <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {pinned.map((p) => (
                      <li key={p.slug}>
                        <ProjectCard project={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {others.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Dự án khác</h2>
                  <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {others.map((p) => (
                      <li key={p.slug}>
                        <ProjectCard project={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {tab === "Bài đăng" && (
            <div className="flex max-w-2xl flex-col gap-5">
              {posts.length === 0 ? <p className="text-moss">Chưa có bài đăng nào.</p> : posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}

          {tab === "Giới thiệu" && (
            <div className="grid gap-5 md:grid-cols-2">
              <section className="rounded-[20px] border border-line p-6 md:col-span-2">
                <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Về {user.name.split(" ").pop()}</h2>
                <p className="mt-2 max-w-[70ch] text-[16px] leading-[1.75]">{user.about}</p>
              </section>
              <section className="rounded-[20px] border border-line p-6">
                <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Kỹ năng</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {user.skills.map((s) => (
                    <li key={s} className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-[20px] border border-line p-6">
                <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Kinh nghiệm và học vấn</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {[...user.experience, ...user.education].map((e) => (
                    <li key={e.title + e.where}>
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-moss">
                        {e.where}, {e.when}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

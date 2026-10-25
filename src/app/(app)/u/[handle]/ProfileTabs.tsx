"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Building2, Handshake, Check, Circle, Code2, Eye, FolderKanban, GraduationCap, Shield, Text as TextIcon, Briefcase, ChevronRight, type LucideIcon } from "lucide-react";
import { Pin } from "lucide-react";
import type { Project, User } from "@/lib/data";
import { myProjectsStore, postsStore } from "@/lib/stores";
import { ProjectCard } from "@/components/ProjectCard";
import { FolderCover } from "@/components/project/FolderCover";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { contributionsBy } from "@/lib/exchange";
import { useTopics } from "@/lib/topicStore";
import { contextLabel, projectOf, userOf } from "@/lib/data";
import { PostCard } from "../../community/PostCard";

const TABS = ["Dự án", "Bài đăng", "Giới thiệu"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({
  user,
  pinned,
  projects: given,
  isMe,
}: {
  user: User;
  pinned: Project[];
  projects: Project[];
  isMe: boolean;
}) {
  // Bài đăng và dự án mới của bạn lưu trên trình duyệt; bài trong nhóm không lên hồ sơ.
  const posts = postsStore.use().filter((p) => p.author === user.handle && !p.group);
  const mine = myProjectsStore.use();
  const projects = isMe ? [...mine, ...given] : given;
  const [tab, setTab] = useState<Tab>("Dự án");

  // Liên kết "#bai-dang" (từ menu tài khoản) mở thẳng tab Bài đăng.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#bai-dang") setTab("Bài đăng");
      if (window.location.hash === "#gioi-thieu") setTab("Giới thiệu");
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
                <div className="rounded-2xl border border-dashed border-line p-8">
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
                        <ProjectCard project={p} person={user.handle} />
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
                        <ProjectCard project={p} person={user.handle} />
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

          {tab === "Giới thiệu" && <AboutTab user={user} projects={[...pinned, ...others]} isMe={isMe} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectionHead({ icon: Icon, title, right }: { icon: LucideIcon; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold tracking-[-0.02em]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sap">
          <Icon className="h-[18px] w-[18px] text-leaf-deep" aria-hidden="true" />
        </span>
        {title}
      </h2>
      {right}
    </div>
  );
}

const card = "rounded-2xl border border-line bg-white p-6";

/** Tab Giới thiệu, sắp theo hồ sơ nghề nghiệp của Nova Mobile: giới thiệu, portfolio, kinh nghiệm, học vấn, kỹ năng. */
function AboutTab({ user, projects, isMe }: { user: User; projects: Project[]; isMe: boolean }) {
  const featured = projects.slice(0, 3);
  const checks = [
    { label: "Giới thiệu", done: user.about.trim().length > 0 },
    { label: "Kỹ năng", done: user.skills.length > 0 },
    { label: "Portfolio", done: projects.length > 0 },
    { label: "Kinh nghiệm", done: user.experience.length > 0 },
    { label: "Học vấn", done: user.education.length > 0 },
    { label: "Chứng chỉ", done: false },
  ];
  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  const missing = checks.filter((c) => !c.done);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <section className={card}>
          <SectionHead icon={TextIcon} title="Giới thiệu" />
          <p className="max-w-[70ch] text-[16px] leading-[1.75]">{user.about}</p>
        </section>

        <section className={card}>
          <SectionHead icon={FolderKanban} title="Portfolio nổi bật" />
          {featured.length === 0 ? (
            <p className="text-moss">{isMe ? "Ghim một dự án để hiện ở đây." : "Chưa có dự án công khai."}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {featured.map((p) => {
                const sc = showcaseOf(p);
                const phase = currentPhase(sc.milestones);
                const role = p.members.find((m) => m.handle === user.handle)?.part;
                return (
                  <li key={p.slug} className="grid gap-5 rounded-2xl border border-line bg-[#fbfcfa] p-4 sm:grid-cols-[176px_minmax(0,1fr)]">
                    <div className="rounded-xl bg-mist px-3 pt-3.5">
                      <FolderCover tone={p.tone} title={p.title} logo={sc.logo} logoSrc={p.local?.logoSrc} coverSrc={p.local?.coverSrc} height={100} logoSize={46} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.01em]">{p.title}</h3>
                          {role && <p className="mt-0.5 text-sm font-semibold text-leaf-deep">{role}</p>}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${phase === "final" ? "bg-ink text-sap" : phase === "draft" ? "bg-[#fff4e0] text-[#8a5300]" : "bg-mist text-moss"}`}
                        >
                          {phaseLabel(phase)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink/80">{p.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                        <ul className="flex flex-wrap gap-1.5">
                          {[p.output, contextLabel(p)].map((t) => (
                            <li key={t} className="rounded-lg border border-line px-2.5 py-1 text-[13px] font-semibold">
                              {t}
                            </li>
                          ))}
                        </ul>
                        <Link href={`/p/${p.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-leaf-deep hover:underline">
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> Xem dự án
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {user.experience.length > 0 && (
          <section className={card}>
            <SectionHead icon={Briefcase} title="Kinh nghiệm" />
            <Timeline items={user.experience} />
          </section>
        )}

        <GivenSection handle={user.handle} />

        <section className={card}>
          <SectionHead icon={GraduationCap} title="Học vấn và chứng chỉ" />
          <ul className="flex flex-col gap-3">
            {user.education.map((e) => (
              <li key={e.title + e.where} className="flex gap-4 rounded-2xl border border-line bg-[#fbfcfa] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-[17px] font-bold">{e.title}</p>
                  <p className="mt-0.5 text-[15px] text-ink/80">
                    {e.where} · {e.when}
                  </p>
                  <p className="mt-1.5 text-[13px] text-moss">Thông tin do người dùng tự khai</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">Mức độ hoàn thiện hồ sơ</p>
            <p className="font-display text-[22px] font-extrabold text-leaf-deep">{pct}%</p>
          </div>
          <div
            className="mt-2.5 h-2 overflow-hidden rounded-full bg-mist"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mức độ hoàn thiện hồ sơ"
          >
            <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-3.5 flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
              {checks.filter((c) => c.done).map((c) => c.label.toLowerCase()).join(", ").replace(/^./, (m) => m.toUpperCase())}
            </li>
            {missing.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-moss">
                <Circle className="h-4 w-4 text-line" aria-hidden="true" />
                {c.label === "Chứng chỉ" ? "Thêm chứng chỉ để người xem hiểu thêm về bạn" : `Thêm ${c.label.toLowerCase()}`}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <SectionHead icon={Code2} title="Kỹ năng" />
          <ul className="flex flex-wrap gap-2">
            {user.skills.map((s, i) => (
              <li key={s} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${i === 0 ? "bg-ink text-sap" : "bg-mist"}`}>
                {s}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist">
            <Shield className="h-5 w-5 text-moss" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Chưa xếp hạng</span>
            <span className="block text-[13px] text-moss">Uy tín tăng dần qua đánh giá sau mỗi dự án</span>
          </span>
          <ChevronRight className="h-5 w-5 text-moss" aria-hidden="true" />
        </div>

        {isMe && (
          <section className="flex gap-3 rounded-2xl bg-ink p-5 text-white">
            <Eye className="mt-0.5 h-5 w-5 shrink-0 text-leaf" aria-hidden="true" />
            <div>
              <p className="font-semibold">Hiển thị: Mọi người</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fog">Email, số điện thoại và địa chỉ không xuất hiện trong hồ sơ này.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Timeline({ items }: { items: User["experience"] }) {
  return (
    <ol className="relative">
      {items.map((e, i) => (
        <li key={e.title + e.where} className="relative pb-5 pl-8 last:pb-0">
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-leaf shadow-[0_0_0_4px_#dcf6cf]" aria-hidden="true" />
          {i < items.length - 1 && <span className="absolute bottom-0 left-1.5 top-6 w-0.5 bg-line" aria-hidden="true" />}
          <p className="font-semibold">{e.title}</p>
          <p className="mt-0.5 text-sm font-semibold text-leaf-deep">
            {e.where} · {e.when}
          </p>
          {e.note && <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/** Góp ý của người này đã được chủ dự án khác áp dụng (lấy từ tab Trao đổi). */
function GivenSection({ handle }: { handle: string }) {
  const given = contributionsBy(handle, useTopics());
  if (!given.length) return null;
  return (
    <section className={card}>
      <SectionHead icon={Handshake} title="Đã góp sức" right={<span className="text-sm text-moss">{given.length} góp ý được áp dụng</span>} />
      <ul className="flex flex-col">
        {given.map(({ topic, reply }) => {
          const p = projectOf(topic.project)!;
          return (
            <li key={reply.id} className="border-t border-line py-3.5 first:border-t-0 first:pt-0">
              <Link href={`/p/${p.slug}#trao-doi`} className="font-bold hover:underline">
                {p.title}
              </Link>
              <p className="mt-0.5 text-sm leading-relaxed text-moss">
                {topic.question} Áp dụng ở bản {reply.applied}, dự án của {userOf(p.owner)?.name}.
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] text-moss">Chỉ tính góp ý đã được chủ dự án xác nhận áp dụng.</p>
    </section>
  );
}

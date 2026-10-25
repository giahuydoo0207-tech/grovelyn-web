"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Check,
  FolderGit2,
  Globe2,
  Images,
  Lock,
  MapPin,
  MessageCircle,
  Share2,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { interestedEvents, postsStore, useGroupStatus } from "@/lib/stores";
import { ONLINE, ONLINE_TOTAL, PROJECTS, USERS, userOf, type Group } from "@/lib/data";
import { EVENTS, dateParts } from "@/lib/events";
import { Avatar } from "@/components/Avatar";
import { GroupCover, GroupMark } from "@/components/GroupVisual";
import { ProjectCard } from "@/components/ProjectCard";
import { Feed } from "../../community/Feed";
import { PostCard } from "../../community/PostCard";

type Tab = "Thảo luận" | "Dự án của nhóm" | "Tìm cộng sự" | "Sự kiện" | "Thành viên" | "Ảnh và file";

/**
 * Trang chi tiết nhóm (bản 4): ảnh bìa và avatar vuông, rồi bố cục ba cột như trang Cộng đồng.
 * Cột trái là các mục của nhóm, giữa là nội dung mục đang chọn, phải là người online, sự kiện và quy tắc.
 */
export function GroupHome({ group }: { group: Group }) {
  const [tab, setTab] = useState<Tab>("Thảo luận");
  // Tham gia nhóm và sự kiện sẽ đi lưu trên trình duyệt.
  const [status, setStatus] = useGroupStatus(group.slug, group.joined);
  const going = interestedEvents.use();
  const [copied, setCopied] = useState(false);

  const projects = PROJECTS.filter((p) => group.fields.includes(p.field));
  const seekers = postsStore.use().filter((p) => p.group === group.slug && p.kind === "Tìm cộng sự");
  const events = EVENTS.filter((e) => e.group?.name === group.name);
  const admins = group.admins.map(userOf).filter((u) => u !== undefined);
  const online = ONLINE.map(userOf).filter((u) => u !== undefined);
  const locked = group.privacy === "Riêng tư" && status !== "member";

  const menu: { label: Tab; icon: LucideIcon; count?: number }[] = [
    { label: "Thảo luận", icon: MessageCircle, count: group.fresh },
    { label: "Dự án của nhóm", icon: FolderGit2, count: projects.length },
    { label: "Tìm cộng sự", icon: Users, count: seekers.length },
    { label: "Sự kiện", icon: CalendarDays, count: events.length },
    { label: "Thành viên", icon: UserRound },
    { label: "Ảnh và file", icon: Images },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const joinLabel = status === "member" ? "Đã tham gia" : status === "asked" ? "Đã gửi yêu cầu" : group.privacy === "Riêng tư" ? "Xin vào nhóm" : "Tham gia nhóm";

  return (
    <div>
      <section className="mx-auto max-w-[1232px]">
        <div className="-mt-6 aspect-[4/1] max-h-[300px] overflow-hidden rounded-b-2xl bg-ink">
          <GroupCover cover={group.cover} seed={group.coverSeed} tone={group.coverTone} />
        </div>
        <div className="flex flex-wrap items-end gap-4 px-2 sm:px-6">
          <div className="-mt-12 shrink-0">
            <GroupMark mark={group.mark} tone={group.tone} size={112} ring={5} ringColor="#f2f5ef" />
          </div>
          <div className="min-w-[240px] flex-1 pb-0.5">
            <h1 className="font-display text-[clamp(1.75rem,3.4vw,2.15rem)] font-bold leading-tight tracking-[-0.03em]">{group.name}</h1>
            <p className="mt-1 text-[15px] text-moss">
              Nhóm {group.privacy.toLowerCase()}, {group.fields.join(", ")}, {group.members.toLocaleString("vi-VN")} thành viên
            </p>
          </div>
          <div className="flex gap-2 pb-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              aria-pressed={status === "member"}
              onClick={() => setStatus(status === "member" ? "none" : status === "asked" ? "none" : group.privacy === "Riêng tư" ? "asked" : "member")}
              className={`inline-flex h-[42px] items-center gap-1.5 rounded-full px-[18px] text-[15px] font-bold ${
                status === "none" ? "bg-leaf text-ink hover:bg-[#6ee04d]" : "border border-[#c9d0c4] bg-white hover:bg-mist"
              }`}
            >
              {status !== "none" && <Check className="h-4 w-4" aria-hidden="true" />}
              {joinLabel}
            </motion.button>
            {status === "member" && (
              <button type="button" className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#c9d0c4] bg-white px-4 text-[15px] font-bold hover:bg-mist">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Mời
              </button>
            )}
            <button
              type="button"
              onClick={share}
              aria-label={copied ? "Đã sao chép link nhóm" : "Sao chép link nhóm"}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#c9d0c4] bg-white hover:bg-mist"
            >
              {copied ? <Check className="h-[18px] w-[18px] text-leaf-deep" aria-hidden="true" /> : <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-[1232px] grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
        <aside className="flex min-w-0 flex-col gap-3 md:sticky md:top-[88px]">
          <nav aria-label="Mục của nhóm" className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 md:flex-col md:overflow-visible">
            {menu.map(({ label, icon: Icon, count }) => {
              const on = tab === label;
              return (
                <button
                  key={label}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setTab(label)}
                  className={`flex h-11 shrink-0 items-center gap-3 rounded-lg px-2.5 text-left text-[15px] transition-colors ${on ? "bg-sap font-bold" : "font-semibold hover:bg-mist"}`}
                >
                  <Icon className={`h-[22px] w-[22px] ${on ? "text-leaf-deep" : ""}`} aria-hidden="true" />
                  <span className="flex-1 whitespace-nowrap">{label}</span>
                  {count ? <span className="rounded-full bg-sap px-2 py-0.5 text-xs font-bold tabular-nums text-leaf-deep">{count}</span> : null}
                </button>
              );
            })}
          </nav>

          <section className="hidden rounded-2xl border border-line bg-white p-3.5 md:block">
            <h2 className="text-sm font-bold">Về nhóm</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#3d4a38]">{group.description}</p>
            <ul className="mt-3 flex flex-col gap-2 text-[13px] text-[#3d4a38]">
              <li className="flex items-center gap-2">
                {group.privacy === "Riêng tư" ? <Lock className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Globe2 className="h-4 w-4 text-leaf-deep" aria-hidden="true" />}
                {group.privacy === "Riêng tư" ? "Riêng tư, chỉ thành viên xem bài" : "Công khai, ai cũng xem được"}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
                {group.area}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
                Lập ngày {dateParts(group.founded).short}/{group.founded.slice(0, 4)}
              </li>
            </ul>
            <p className="mt-3 text-xs font-bold text-moss">Quản trị viên</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex">
                {admins.map((u, i) => (
                  <span key={u.handle} className={`rounded-full ring-2 ring-white ${i ? "-ml-3" : ""}`}>
                    <Avatar initials={u.initials} tone={u.tone} size={30} />
                  </span>
                ))}
              </span>
              <span className="text-[13px] text-[#3d4a38]">{admins.map((u) => u.name.split(" ").slice(-2).join(" ")).join(", ")}</span>
            </div>
          </section>
        </aside>

        <div className="min-w-0">
          {locked ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <Lock className="mx-auto h-8 w-8 text-leaf-deep" aria-hidden="true" />
              <p className="mt-3 font-display text-xl font-bold">Nhóm riêng tư</p>
              <p className="mt-1 text-moss">
                {status === "asked" ? "Yêu cầu đã gửi. Quản trị viên sẽ duyệt sớm." : "Xin vào nhóm để xem bài đăng, dự án và thành viên."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {tab === "Thảo luận" && <Feed group={group.slug} />}
                {tab === "Dự án của nhóm" &&
                  (projects.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projects.map((p) => (
                        <ProjectCard key={p.slug} project={p} />
                      ))}
                    </div>
                  ) : (
                    <Empty text="Chưa có dự án nào được gắn vào nhóm." />
                  ))}
                {tab === "Tìm cộng sự" && (
                  <div className="flex flex-col gap-3">
                    {seekers.length === 0 && (
                      <p className="rounded-xl border border-line bg-white px-5 py-8 text-center text-moss">Nhóm chưa có bài Tìm cộng sự nào. Đăng ở tab Thảo luận, chọn loại Tìm cộng sự.</p>
                    )}
                    {seekers.map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                  </div>
                )}
                {tab === "Sự kiện" &&
                  (events.length ? (
                    <ul className="flex flex-col gap-3">
                      {events.map((e) => (
                        <li key={e.slug}>
                          <Link href={`/events/${e.slug}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 hover:bg-mist">
                            <DateTile iso={e.date} />
                            <span>
                              <span className="block font-bold">{e.title}</span>
                              <span className="text-sm text-moss">
                                {dateParts(e.date).weekday}, {e.from}, {e.mode.toLowerCase()}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Empty text="Nhóm chưa có sự kiện." action={{ href: "/events/new", label: "Tạo sự kiện cho nhóm" }} />
                  ))}
                {tab === "Thành viên" && (
                  <ul className="grid gap-2 rounded-2xl border border-line bg-white p-2 sm:grid-cols-2">
                    {USERS.map((u) => (
                      <li key={u.handle}>
                        <Link href={`/u/${u.handle}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-mist">
                          <Avatar initials={u.initials} tone={u.tone} size={44} />
                          <span className="min-w-0">
                            <span className="block font-bold">
                              {u.name}
                              {group.admins.includes(u.handle) && <span className="ml-1.5 rounded-full bg-sap px-2 py-0.5 text-[11px] font-bold text-leaf-deep">Quản trị</span>}
                            </span>
                            <span className="line-clamp-1 text-[13px] text-moss">{u.headline}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "Ảnh và file" && <Empty text="Ảnh và file trong bài đăng của nhóm sẽ gom về đây." />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <aside className="hidden flex-col gap-3 lg:sticky lg:top-[88px] lg:flex">
          <section className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Đang online</h2>
              <span className="text-[13px] text-moss">{ONLINE_TOTAL} người</span>
            </div>
            <ul className="mt-3 flex">
              {online.map((u) => (
                <li key={u.handle} className="-mr-1">
                  <Link href={`/u/${u.handle}`} className="relative block rounded-full ring-[3px] ring-white" aria-label={`${u.name}, đang online`}>
                    <Avatar initials={u.initials} tone={u.tone} size={40} />
                    <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-leaf ring-2 ring-white" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Sự kiện của nhóm</h2>
              {group.perms.createEvents && status === "member" && (
                <Link href="/events/new" className="text-[13px] font-bold text-leaf-deep hover:underline">
                  Tạo
                </Link>
              )}
            </div>
            {events.length ? (
              <ul className="mt-3 flex flex-col gap-3">
                {events.map((e) => {
                  const on = going.includes(e.slug);
                  return (
                    <li key={e.slug} className="flex gap-3">
                      <DateTile iso={e.date} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/events/${e.slug}`} className="block text-sm font-bold leading-snug hover:underline">
                          {e.title}
                        </Link>
                        <p className="text-xs text-moss">
                          {dateParts(e.date).weekday} {e.from}, còn {e.seats - e.registered} chỗ
                        </p>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => interestedEvents.toggle(e.slug)}
                          className={`mt-1.5 inline-flex h-[30px] items-center gap-1 rounded-full border px-3 text-xs font-bold ${on ? "border-leaf-deep bg-sap text-leaf-deep" : "border-ink bg-white hover:bg-mist"}`}
                        >
                          {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          {on ? "Đã quan tâm" : "Quan tâm"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-moss">Chưa có sự kiện sắp tới.</p>
            )}
          </section>

          {group.rules.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-4">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Quy tắc nhóm</h2>
              <ol className="mt-2.5 flex flex-col gap-2">
                {group.rules.map((r, i) => (
                  <li key={r} className="flex gap-2.5 text-[13px] leading-normal">
                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-sap text-[11px] font-bold text-leaf-deep">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function DateTile({ iso }: { iso: string }) {
  const d = dateParts(iso);
  return (
    <span className="flex h-[52px] w-12 shrink-0 flex-col overflow-hidden rounded-xl border border-line text-center" aria-hidden="true">
      <span className="bg-ink py-0.5 text-[11px] font-bold text-leaf">{d.tag}</span>
      <span className="flex flex-1 items-center justify-center font-display text-xl font-bold">{d.day}</span>
    </span>
  );
}

function Empty({ text, action }: { text: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9d0c4] p-10 text-center text-moss">
      {text}
      {action && (
        <Link href={action.href} className="mt-2 block font-bold text-leaf-deep hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}

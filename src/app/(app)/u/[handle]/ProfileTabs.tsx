"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Handshake, Check, Circle, Eye, GraduationCap, Text as TextIcon, Briefcase, type LucideIcon } from "lucide-react";
import { Pin } from "lucide-react";
import type { Project, User } from "@/lib/data";
import { myProjectsStore, postsStore } from "@/lib/stores";
import { ProjectCard } from "@/components/ProjectCard";
import { FolderCover } from "@/components/project/FolderCover";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { contributionsBy } from "@/lib/exchange";
import { useTopics } from "@/lib/topicStore";
import { contextLabel, projectOf, userOf } from "@/lib/data";
import { GARDEN, fieldColor, type Hue } from "@/lib/palette";
import { PostCard } from "../../community/PostCard";

const TABS = ["Dự án", "Đóng góp", "Bài đăng", "Giới thiệu"] as const;
type Tab = (typeof TABS)[number];
const HASH: Record<string, Tab> = { "#du-an": "Dự án", "#dong-gop": "Đóng góp", "#bai-dang": "Bài đăng", "#gioi-thieu": "Giới thiệu" };

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
  const given2 = contributionsBy(user.handle, useTopics());
  const [tab, setTab] = useState<Tab>("Dự án");
  const [field, setField] = useState("Tất cả");
  const [output, setOutput] = useState("Tất cả");

  // Liên kết "#dong-gop", "#bai-dang"… mở thẳng đúng tab.
  useEffect(() => {
    const sync = () => {
      const t = HASH[window.location.hash];
      if (t) setTab(t);
    };
    const raf = requestAnimationFrame(sync);
    window.addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  // Nổi bật: tối đa 3 dự án do người dùng ghim; dự án bạn vừa tạo được đưa lên nếu chưa ghim gì.
  const featured = (pinned.length ? pinned : projects).slice(0, 3);
  const fields = [...new Set(projects.map((p) => p.field))];
  const outputs = [...new Set(projects.map((p) => p.output))];
  const shown = projects.filter((p) => (field === "Tất cả" || p.field === field) && (output === "Tất cả" || p.output === output));
  const count: Record<Tab, number | undefined> = { "Dự án": projects.length, "Đóng góp": given2.length, "Bài đăng": posts.length, "Giới thiệu": undefined };

  return (
    <div id="bai-dang" className="min-w-0 scroll-mt-24">
      <div role="tablist" aria-label="Hồ sơ" className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-white p-1.5">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors ${on ? "bg-ink text-white" : "text-moss hover:bg-mist hover:text-ink"}`}
            >
              {t}
              {count[t] !== undefined && (
                <span className={`text-sm font-bold tabular-nums ${on ? "text-leaf" : "text-leaf-deep"}`}>{count[t]}</span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="pt-5">
        {tab === "Dự án" && (
          <div className="flex flex-col gap-8">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8">
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

            {featured.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.02em]">
                  <Pin className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> Dự án nổi bật
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {featured.map((p) => (
                    <FeaturedRow key={p.slug} project={p} handle={user.handle} />
                  ))}
                </ul>
              </section>
            )}

            {/* Chỉ hiện khi còn dự án ngoài phần nổi bật, tránh lặp lại cùng một danh sách. */}
            {projects.length > featured.length && (
              <section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Tất cả dự án</h2>
                  <div className="flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="loc-linh-vuc">
                      Lĩnh vực
                    </label>
                    <select id="loc-linh-vuc" value={field} onChange={(e) => setField(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink">
                      <option>Tất cả</option>
                      {fields.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor="loc-dau-ra">
                      Dạng đầu ra
                    </label>
                    <select id="loc-dau-ra" value={output} onChange={(e) => setOutput(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-ink">
                      <option value="Tất cả">Mọi dạng đầu ra</option>
                      {outputs.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {fields.length > 1 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Lĩnh vực">
                    {fields.map((f) => {
                      const c = fieldColor(f);
                      const on = field === f;
                      return (
                        <li key={f}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => setField(on ? "Tất cả" : f)}
                            className="rounded-full px-3 py-1 text-[13px] font-bold ring-ink transition-shadow aria-pressed:ring-2"
                            style={{ background: c.bg, color: c.fg }}
                          >
                            {f} · {projects.filter((p) => p.field === f).length}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {shown.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-line bg-white px-5 py-6 text-center text-moss">Không có dự án nào khớp bộ lọc.</p>
                ) : (
                  <ul className="mt-4 grid gap-5 sm:grid-cols-2">
                    {shown.map((p) => (
                      <li key={p.slug}>
                        <ProjectCard project={p} person={user.handle} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}

        {tab === "Đóng góp" && <GivenSection handle={user.handle} isMe={isMe} />}

        {tab === "Bài đăng" && (
          <div className="flex flex-col gap-5">
            {posts.length === 0 ? <p className="rounded-xl border border-line bg-white px-5 py-6 text-moss">Chưa có bài đăng nào.</p> : posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}

        {tab === "Giới thiệu" && <AboutTab user={user} projects={projects} isMe={isMe} />}
      </div>
    </div>
  );
}

/** Một dự án nổi bật: bìa bên trái, nền nhạt theo màu lĩnh vực. */
function FeaturedRow({ project: p, handle }: { project: Project; handle: string }) {
  const sc = showcaseOf(p);
  const phase = currentPhase(sc.milestones);
  const role = p.members.find((m) => m.handle === handle)?.part;
  const c = fieldColor(p.field);
  return (
    <li className="grid gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-5">
      <Link href={`/p/${p.slug}`} className="rounded-xl px-3 pt-3.5" style={{ background: c.bg }} aria-label={`Xem ${p.title}`}>
        <FolderCover tone={p.tone} title={p.title} logo={sc.logo} logoSrc={p.local?.logoSrc} coverSrc={p.local?.coverSrc} height={112} logoSize={50} />
      </Link>
      <div className="flex min-w-0 flex-col py-1 pr-2">
        <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
          <span className="rounded-full px-2.5 py-0.5" style={{ background: c.bg, color: c.fg }}>
            {p.field}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 ${phase === "final" ? "bg-ink text-sap" : phase === "draft" ? "bg-[#fff1c2] text-[#765600]" : "bg-mist text-moss"}`}>{phaseLabel(phase)}</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-[-0.01em]">
          <Link href={`/p/${p.slug}`} className="hover:underline">
            {p.title}
          </Link>
        </h3>
        {role && <p className="text-sm font-semibold text-leaf-deep">{role}</p>}
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-ink/80">{p.summary}</p>
        <p className="mt-auto pt-2 text-[13px] text-moss">
          {p.output} · {contextLabel(p)}
        </p>
      </div>
    </li>
  );
}

function SectionHead({ icon: Icon, title, right, hue = "leaf" }: { icon: LucideIcon; title: string; right?: React.ReactNode; hue?: Hue }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold tracking-[-0.02em]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: GARDEN[hue].bg }}>
          <Icon className="h-[18px] w-[18px]" style={{ color: GARDEN[hue].fg }} aria-hidden="true" />
        </span>
        {title}
      </h2>
      {right}
    </div>
  );
}

const card = "rounded-2xl border border-line bg-white p-6";

/** Tab Giới thiệu: giới thiệu dài, kinh nghiệm, học vấn. Phần hoàn thiện hồ sơ chỉ chủ hồ sơ thấy. */
function AboutTab({ user, projects, isMe }: { user: User; projects: Project[]; isMe: boolean }) {
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
    <div className="flex flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-5">
        <section className={card}>
          <SectionHead icon={TextIcon} title="Giới thiệu" hue="lilac" />
          <p className="max-w-[70ch] text-[16px] leading-[1.75]">{user.about}</p>
        </section>

        {user.experience.length > 0 && (
          <section className={card}>
            <SectionHead icon={Briefcase} title="Kinh nghiệm" hue="sun" />
            <Timeline items={user.experience} />
          </section>
        )}

        <section className={card}>
          <SectionHead icon={GraduationCap} title="Học vấn và chứng chỉ" hue="sky" />
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
        {isMe && (
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
        )}

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

/** Đóng góp: góp ý của người này đã được chủ dự án áp dụng và người góp ý đồng ý ghi tên. */
function GivenSection({ handle, isMe }: { handle: string; isMe: boolean }) {
  const given = contributionsBy(handle, useTopics());
  if (!given.length)
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-8">
        <p className="font-display text-xl font-bold">Chưa có đóng góp được ghi nhận</p>
        <p className="mt-2 max-w-[52ch] text-moss">
          {isMe ? "Góp ý ở tab Trao đổi. Khi chủ dự án áp dụng góp ý của bạn, nó sẽ hiện ở đây." : "Khi chủ dự án áp dụng góp ý của người này, đóng góp sẽ hiện ở đây."}
        </p>
        {isMe && (
          <Link href="/exchange" className="mt-4 inline-block rounded-xl bg-leaf px-5 py-3 font-bold text-ink hover:bg-[#6ee04d]">
            Vào Trao đổi
          </Link>
        )}
      </div>
    );
  return (
    <section className={card}>
      <SectionHead icon={Handshake} title="Góp ý đã được áp dụng" hue="clay" right={<span className="text-sm text-moss">{given.length} góp ý</span>} />
      <ul className="flex flex-col gap-3">
        {given.map(({ topic, reply }) => {
          const p = projectOf(topic.project);
          if (!p) return null;
          const c = fieldColor(p.field);
          return (
            <li key={reply.id} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                <span className="rounded-full px-2.5 py-0.5" style={{ background: c.bg, color: c.fg }}>
                  {p.field}
                </span>
                <span className="rounded-full bg-sap px-2.5 py-0.5 text-leaf-deep">Áp dụng ở bản {reply.applied}</span>
              </div>
              <Link href={`/exchange/${topic.id}`} className="mt-2 block font-bold leading-snug hover:underline">
                {topic.question}
              </Link>
              <p className="mt-1 text-sm text-moss">
                Dự án{" "}
                <Link href={`/p/${p.slug}`} className="font-semibold text-ink hover:underline">
                  {p.title}
                </Link>{" "}
                của {userOf(p.owner)?.name}
              </p>
              <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink/80">{reply.text}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] text-moss">Chỉ tính góp ý đã được chủ dự án xác nhận áp dụng và người góp ý đồng ý ghi tên.</p>
    </section>
  );
}

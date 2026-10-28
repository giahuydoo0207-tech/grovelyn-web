"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FIELDS, ME, PROJECTS as SAMPLE, USERS, userOf } from "@/lib/data";
import { myProjectsStore, prefsStore } from "@/lib/stores";
import { showcaseOf } from "@/lib/showcase";
import { OUTPUTS, type Output } from "@/lib/model";
import { Avatar } from "@/components/Avatar";
import { ProjectCard } from "@/components/ProjectCard";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();

export function ExploreGrid() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const prefs = prefsStore.use();
  // Dự án bạn tạo (lưu trên trình duyệt) đứng đầu, rồi tới dự án mẫu.
  const PROJECTS = [...myProjectsStore.use(), ...SAMPLE];
  const fromLink = params.get("nganh");
  const [field, setField] = useState<(typeof FIELDS)[number]>(() =>
    FIELDS.find((f) => f === fromLink) ?? "Tất cả",
  );

  const [output, setOutput] = useState<Output | "Tất cả">("Tất cả");
  // Chỉ hiện dạng đầu ra có ít nhất một dự án, để bộ lọc không có lựa chọn rỗng.
  const outputs = OUTPUTS.map((o) => o.id).filter((o) => PROJECTS.some((p) => p.output === o));

  const needle = norm(q.trim());
  const people = needle
    ? USERS.map((u) => (u.handle === ME ? { ...u, name: prefs.name, headline: prefs.headline, location: prefs.location } : u)).filter((u) =>
        norm([u.name, u.handle, u.intro, u.headline, u.location, ...u.skills, ...u.lenses].join(" ")).includes(needle),
      )
    : [];

  const list = (() => {
    return PROJECTS.filter((p) => (field === "Tất cả" || p.field === field) && (output === "Tất cả" || p.output === output)).filter((p) => {
      if (!needle) return true;
      const owner = userOf(p.owner)?.name ?? "";
      return norm([p.title, p.summary, p.field, p.output, p.context, owner, ...p.tools, ...showcaseOf(p).tags].join(" ")).includes(needle);
    });
  })();

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Lọc theo ngành" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FIELDS.map((f) => {
          const on = f === field;
          return (
            <button
              key={f}
              role="radio"
              aria-checked={on}
              onClick={() => setField(f)}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors ${on ? "text-white" : "text-moss hover:text-ink"}`}
            >
              {on && (
                <motion.span
                  layoutId="field-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{f}</span>
            </button>
          );
        })}
      </div>

      <label className="-mt-2 flex items-center gap-2.5 text-sm text-moss">
        Dạng đầu ra
        <select value={output} onChange={(e) => setOutput(e.target.value as Output | "Tất cả")} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-ink">
          <option value="Tất cả">Tất cả</option>
          {outputs.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>

      {q && (
        <p className="text-[15px] text-moss">
          Kết quả cho <strong className="text-ink">“{q}”</strong>.{" "}
          <Link href="/explore" className="font-semibold text-leaf-deep hover:underline">
            Xóa tìm kiếm
          </Link>
        </p>
      )}

      {people.length > 0 && (
        <section aria-label="Mọi người phù hợp" className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Mọi người</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((u) => (
              <li key={u.handle}>
                <Link
                  href={`/u/${u.handle}`}
                  className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4 transition-colors hover:bg-mist"
                >
                  <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold group-hover:underline">
                      {u.name} <span className="font-normal text-moss">@{u.handle}</span>
                    </span>
                    <span className="block truncate text-xs text-moss">{u.intro}</span>
                    {u.skills.length > 0 && (
                      <span className="mt-1 block truncate text-xs font-semibold text-leaf-deep">
                        {u.skills.slice(0, 3).join(" · ")}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-10">
          <p className="font-display text-2xl font-bold tracking-[-0.02em]">Chưa có dự án nào ở đây</p>
          <p className="max-w-[48ch] text-moss">Thử ngành khác, hoặc là người đầu tiên đăng dự án cho ngành này.</p>
          <Link href="/new" className="mt-2 rounded-xl bg-leaf px-5 py-3 font-bold text-ink hover:bg-[#6ee04d]">
            Tạo dự án
          </Link>
        </div>
      ) : (
        <motion.ul layout className="grid auto-rows-auto grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={true}>
            {list.map((p, i) => {
              const featured = i === 0 && field === "Tất cả" && output === "Tất cả" && !q;
              return (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  className={featured ? "sm:col-span-2 lg:row-span-2" : ""}
                >
                  <ProjectCard project={p} featured={featured} />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

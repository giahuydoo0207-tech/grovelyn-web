"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { FIELDS, ME, PROJECTS as SAMPLE, USERS, userOf } from "@/lib/data";
import { myProjectsStore, prefsStore } from "@/lib/stores";
import { showcaseOf } from "@/lib/showcase";
import { useTopics } from "@/lib/topicStore";
import { OUTPUTS, type Output } from "@/lib/model";
import { Avatar } from "@/components/Avatar";
import { ProjectCard } from "@/components/ProjectCard";

const SORTS = ["Mới cập nhật", "Nhiều phiên bản nhất"] as const;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();

export function ExploreGrid() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const prefs = prefsStore.use();
  const openTopics = useTopics().filter((t) => t.status === "open");
  const openSlugs = new Set(openTopics.map((t) => t.project));
  // Dự án bạn tạo (lưu trên trình duyệt) đứng đầu, rồi tới dự án mẫu.
  const PROJECTS = [...myProjectsStore.use(), ...SAMPLE];
  const fromLink = params.get("nganh");
  const [field, setField] = useState<(typeof FIELDS)[number]>(() =>
    FIELDS.find((f) => f === fromLink) ?? "Tất cả",
  );

  const [output, setOutput] = useState<Output | "Tất cả">("Tất cả");
  const [onlyReal, setOnlyReal] = useState(false);
  const [onlyExchange, setOnlyExchange] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Mới cập nhật");
  // Chỉ hiện dạng đầu ra có ít nhất một dự án, để bộ lọc không có lựa chọn rỗng.
  const outputs = OUTPUTS.map((o) => o.id).filter((o) => PROJECTS.some((p) => p.output === o));

  const needle = norm(q.trim());
  const people = needle
    ? USERS.map((u) => (u.handle === ME ? { ...u, name: prefs.name, headline: prefs.headline, location: prefs.location } : u)).filter((u) =>
        norm([u.name, u.handle, u.intro, u.headline, u.location, ...u.skills, ...u.lenses].join(" ")).includes(needle),
      )
    : [];

  const countOfField = (f: (typeof FIELDS)[number]) =>
    f === "Tất cả" ? PROJECTS.length : PROJECTS.filter((p) => p.field === f).length;

  const list = (() => {
    const filtered = PROJECTS.filter(
      (p) =>
        (field === "Tất cả" || p.field === field) &&
        (output === "Tất cả" || p.output === output) &&
        (!onlyReal || p.usage === "Đã dùng thực tế") &&
        (!onlyExchange || openSlugs.has(p.slug)),
    ).filter((p) => {
      if (!needle) return true;
      const owner = userOf(p.owner)?.name ?? "";
      return norm([p.title, p.summary, p.field, p.output, p.context, owner, ...p.tools, ...showcaseOf(p).tags].join(" ")).includes(needle);
    });
    return sort === "Nhiều phiên bản nhất" ? [...filtered].sort((a, b) => b.versions.length - a.versions.length) : filtered;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Lọc theo ngành" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FIELDS.map((f) => {
          const on = f === field;
          return (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setField(f)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-bold transition-colors ${
                on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"
              }`}
            >
              <span>{f}</span>
              <span className={`text-xs tabular-nums ${on ? "text-leaf" : "text-leaf-deep"}`}>{countOfField(f)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-moss">
            Dạng đầu ra
            <select
              value={output}
              onChange={(e) => setOutput(e.target.value as Output | "Tất cả")}
              className="h-9 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-ink"
            >
              <option value="Tất cả">Tất cả</option>
              {outputs.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={onlyReal}
            onClick={() => setOnlyReal((v) => !v)}
            className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
              onlyReal ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"
            }`}
          >
            Đã dùng thực tế
          </button>
          <button
            type="button"
            aria-pressed={onlyExchange}
            onClick={() => setOnlyExchange((v) => !v)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
              onlyExchange ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"
            }`}
          >
            Đang mở trao đổi
          </button>
        </div>

        <label className="relative flex items-center gap-1.5 font-semibold text-moss hover:text-ink">
          <ArrowDownUp className="pointer-events-none h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Sắp xếp</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className="cursor-pointer appearance-none bg-transparent outline-none">
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

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
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

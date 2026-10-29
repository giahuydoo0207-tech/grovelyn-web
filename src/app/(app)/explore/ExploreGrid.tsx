"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowDownUp, X } from "lucide-react";
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
  const [lastLink, setLastLink] = useState(fromLink);
  const [field, setField] = useState<(typeof FIELDS)[number]>(() =>
    FIELDS.find((f) => f === fromLink) ?? "Tất cả",
  );
  if (fromLink !== lastLink) {
    setLastLink(fromLink);
    setField(FIELDS.find((f) => f === fromLink) ?? "Tất cả");
  }

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
      <div className="no-scrollbar -mx-4 flex items-center justify-between gap-2 overflow-x-auto border-b border-line px-4 pb-3 text-sm sm:mx-0 sm:px-0">
        <div className="flex shrink-0 items-center gap-2">
          <label className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white pl-3.5 pr-2.5 text-[13px] text-moss focus-within:border-ink">
            <span>Dạng đầu ra</span>
            <select
              value={output}
              onChange={(e) => setOutput(e.target.value as Output | "Tất cả")}
              className="cursor-pointer bg-transparent font-bold text-ink outline-none"
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
            className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
              onlyReal ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"
            }`}
          >
            Đã dùng thực tế
          </button>
          <button
            type="button"
            aria-pressed={onlyExchange}
            onClick={() => setOnlyExchange((v) => !v)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
              onlyExchange ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mist"
            }`}
          >
            Đang mở trao đổi
          </button>
        </div>

        <label className="relative inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink hover:bg-mist">
          <ArrowDownUp className="pointer-events-none h-3.5 w-3.5 text-moss" aria-hidden="true" />
          <span className="sr-only">Sắp xếp</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className="cursor-pointer appearance-none bg-transparent outline-none">
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {field !== "Tất cả" && (
        <div className="flex items-center">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white pl-3.5 pr-1.5 text-[13px] font-bold text-ink">
            Ngành: {field}
            <button
              type="button"
              aria-label="Bỏ lọc ngành"
              onClick={() => setField("Tất cả")}
              className="flex h-5 w-5 items-center justify-center rounded-full text-moss transition-colors hover:bg-mist hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        </div>
      )}

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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-white px-6 py-7">
          <div className="flex flex-col gap-1">
            <p className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Chưa có dự án nào ở đây</p>
            <p className="text-sm text-moss">Thử đổi bộ lọc, hoặc đăng dự án đầu tiên của bạn vào mục này.</p>
          </div>
          <Link href="/new" className="inline-flex h-10 shrink-0 items-center rounded-xl bg-leaf px-4 text-sm font-bold text-ink transition-colors hover:bg-[#6ee04d]">
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

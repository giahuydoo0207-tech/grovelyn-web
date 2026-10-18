"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FIELDS, PROJECTS, userOf } from "@/lib/data";
import { showcaseOf } from "@/lib/showcase";
import { ProjectCard } from "@/components/ProjectCard";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

export function ExploreGrid() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const fromLink = params.get("nganh");
  const [field, setField] = useState<(typeof FIELDS)[number]>(() =>
    FIELDS.find((f) => f === fromLink) ?? "Tất cả",
  );

  const list = useMemo(() => {
    const needle = norm(q.trim());
    return PROJECTS.filter((p) => field === "Tất cả" || p.field === field).filter((p) => {
      if (!needle) return true;
      const owner = userOf(p.owner)?.name ?? "";
      return norm([p.title, p.summary, p.field, owner, ...p.tools, ...showcaseOf(p).tags].join(" ")).includes(needle);
    });
  }, [field, q]);

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

      {q && (
        <p className="text-[15px] text-moss">
          Kết quả cho <strong className="text-ink">“{q}”</strong>.{" "}
          <Link href="/explore" className="font-semibold text-leaf-deep hover:underline">
            Xóa tìm kiếm
          </Link>
        </p>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-[20px] border border-dashed border-line p-10">
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
              const featured = i === 0 && field === "Tất cả" && !q;
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { ME, PROJECTS, USERS, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";

const TAGS = ["doantotnghiep", "timcongsu", "thuctap", "portfolio"];

export function Suggestions() {
  const [following, setFollowing] = useState<string[]>([]);
  const people = USERS.filter((u) => u.handle !== ME && u.handle !== "quocbao").slice(0, 3);
  const top = [...PROJECTS].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <aside className="hidden flex-col gap-3 lg:flex lg:sticky lg:top-[88px]">
      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Dự án nổi bật tuần này</h2>
        <ol className="mt-2 flex flex-col">
          {top.map((p) => (
            <li key={p.slug}>
              <Link href={`/p/${p.slug}`} className="-mx-2 block rounded-lg px-2 py-2 hover:bg-mist">
                <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
                <span className="text-[13px] text-moss">
                  {p.field}, {p.likes} lượt thích
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/explore" className="mt-1 inline-block text-sm font-semibold text-leaf-deep hover:underline">
          Xem tất cả dự án
        </Link>
      </section>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Người nên theo dõi</h2>
        <ul className="mt-3 flex flex-col gap-4">
          {people.map((u) => {
            const on = following.includes(u.handle);
            return (
              <li key={u.handle} className="flex items-start gap-3">
                <Avatar initials={u.initials} tone={u.tone} size={44} />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${u.handle}`} className="block truncate text-[15px] font-semibold hover:underline">
                    {u.name}
                  </Link>
                  <p className="line-clamp-2 text-[13px] leading-snug text-moss">{u.headline}</p>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFollowing((f) => (on ? f.filter((h) => h !== u.handle) : [...f, u.handle]))}
                    className={`mt-2 inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                      on ? "border-line bg-mist text-moss" : "border-ink text-ink hover:bg-mist"
                    }`}
                  >
                    {on ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                    {on ? "Đang theo dõi" : "Theo dõi"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-ink p-4 text-white">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Chủ đề sôi nổi</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <li key={t}>
              <Link href={`/explore?q=${t}`} className="inline-block rounded-full border border-ink-line px-3 py-1.5 text-sm font-medium text-leaf hover:bg-white/10">
                #{t}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-2 text-xs leading-relaxed text-moss">
        Grovelyn đang thử nghiệm. Góp ý gửi về {userOf(ME)?.name ?? "nhóm phát triển"}.
      </p>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { USERS, ME } from "@/lib/data";
import { Avatar } from "@/components/Avatar";

const TAGS = ["doantotnghiep", "timcongsu", "thuctap", "portfolio"];

export function Suggestions() {
  const [following, setFollowing] = useState<string[]>([]);
  const people = USERS.filter((u) => u.handle !== ME && u.handle !== "quocbao").slice(0, 3);

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-[22px] border border-line p-5">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Người nên theo dõi</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {people.map((u) => {
            const on = following.includes(u.handle);
            return (
              <li key={u.handle} className="flex items-center gap-3">
                <Avatar initials={u.initials} tone={u.tone} size={40} />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${u.handle}`} className="block truncate text-[15px] font-semibold hover:text-leaf-deep">
                    {u.name}
                  </Link>
                  <p className="truncate text-sm text-moss">{u.role}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFollowing((f) => (on ? f.filter((h) => h !== u.handle) : [...f, u.handle]))}
                  className={`h-9 shrink-0 rounded-full px-3.5 text-sm font-semibold transition-colors ${on ? "bg-mist text-moss" : "bg-ink text-white hover:bg-ink-2"}`}
                >
                  {on ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="rounded-[22px] bg-ink p-5 text-white">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Chủ đề sôi nổi tuần này</h2>
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
    </aside>
  );
}

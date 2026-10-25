"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";
import { prefsStore, type Prefs } from "@/lib/stores";
import { Bell, Eye, LifeBuoy, LockKeyhole, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ME, userOf } from "@/lib/data";
import { SECTIONS, type SectionSlug } from "./sections";

const ICONS: Record<SectionSlug, LucideIcon> = {
  account: UserRound,
  security: ShieldCheck,
  visibility: Eye,
  privacy: LockKeyhole,
  notifications: Bell,
  help: LifeBuoy,
};

export type { Prefs } from "@/lib/stores";

const me = userOf(ME)!;

const Ctx = createContext<{ prefs: Prefs; set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void } | null>(null);

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs phải nằm trong SettingsShell");
  return v;
}

/** Khung trang Cài đặt: cột mục bên trái (thanh cuộn ngang trên điện thoại), nội dung bên phải. */
export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Cài đặt lưu trên trình duyệt, tải lại trang vẫn giữ.
  const prefs = prefsStore.use();
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => prefsStore.set((p) => ({ ...p, [k]: v }));

  return (
    <Ctx.Provider value={{ prefs, set }}>
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-[88px]">
          <div className="flex items-center gap-3 px-1 pb-4">
            <Avatar initials={me.initials} tone={me.tone} handle={me.handle} size={44} />
            <div className="min-w-0">
              <h1 className="font-display text-[26px] font-bold leading-none tracking-[-0.03em]">Cài đặt</h1>
              <p className="mt-1 truncate text-sm text-moss">{prefs.name}</p>
            </div>
          </div>
          <nav aria-label="Mục cài đặt" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:p-2">
            {SECTIONS.map((s) => {
              const on = pathname === `/settings/${s.slug}`;
              const Icon = ICONS[s.slug];
              return (
                <Link
                  key={s.slug}
                  href={`/settings/${s.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors lg:rounded-xl lg:border-0 lg:px-3 lg:py-2.5 ${
                    on ? "border-ink bg-ink text-white lg:bg-sap lg:text-ink" : "border-line bg-white hover:bg-mist"
                  }`}
                >
                  <span
                    className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg lg:flex ${on ? "bg-leaf text-ink" : "bg-mist text-moss"}`}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap lg:whitespace-normal">{s.label}</span>
                    <span className={`hidden text-xs font-normal lg:block ${on ? "text-moss" : "text-moss"}`}>{s.desc}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Ctx.Provider>
  );
}

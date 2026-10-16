"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Globe,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  NotebookPen,
  Settings,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { ME, userOf } from "@/lib/data";
import { signOut } from "@/app/auth-actions";

interface Entry {
  href: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
}

const ACCOUNT: Entry[] = [
  { href: "/settings/account", label: "Cài đặt và quyền riêng tư", icon: Settings },
  { href: "/settings/help", label: "Trợ giúp", icon: LifeBuoy },
  { href: "/settings/account#ngon-ngu", label: "Ngôn ngữ", hint: "Tiếng Việt", icon: Globe },
];

const MANAGE: Entry[] = [
  { href: `/u/${ME}#bai-dang`, label: "Bài đăng và hoạt động", icon: NotebookPen },
  { href: `/u/${ME}`, label: "Dự án của bạn", icon: FolderKanban },
];

/**
 * Menu tài khoản mở từ avatar "Tôi" trên thanh trên cùng.
 * Gồm thẻ người dùng, nhóm Tài khoản, nhóm Quản lý và nút Đăng xuất.
 */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const me = userOf(ME)!;
  const [open, setOpen] = useState(false);
  const [leaving, startLeaving] = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();

  // Chuyển trang thì đóng menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = pathname === `/u/${ME}` || pathname.startsWith("/settings");

  const row =
    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[15px] font-medium transition-colors";

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label="Tài khoản của bạn"
        className={
          compact
            ? "flex items-center gap-0.5 rounded-full"
            : `relative flex h-16 min-w-[56px] flex-col items-center justify-center gap-1 px-1.5 transition-colors xl:min-w-[60px] ${
                active || open ? "text-ink" : "text-moss hover:text-ink"
              }`
        }
      >
        <span className="flex items-center">
          <Avatar initials={me.initials} tone={me.tone} size={compact ? 34 : 24} />
          {compact && <ChevronDown className={`h-4 w-4 text-moss transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />}
        </span>
        {!compact && (
          <span className="hidden items-center gap-0.5 whitespace-nowrap text-xs leading-none md:flex">
            <span className="hidden xl:inline">Tôi</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.4} aria-hidden="true" />
          </span>
        )}
        {!compact && active && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Tài khoản"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(320px,calc(100vw-24px))] origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_50px_-12px_rgba(6,17,10,0.28)]"
          >
            {/* Thẻ người dùng: dải ảnh bìa tối, avatar đè lên mép. */}
            <div className="relative">
              <div className="h-12 bg-ink" aria-hidden="true">
                <svg viewBox="0 0 320 48" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                  <path d="M0 38h70l10-10h90l8 8h142M40 22h60l8-8h70" stroke="#213328" strokeWidth="2" fill="none" />
                  <circle cx="178" cy="14" r="3" fill="#5bd13a" />
                  <circle cx="80" cy="28" r="2.5" fill="#5bd13a" />
                </svg>
              </div>
              <div className="px-4 pb-3.5">
                <div className="-mt-6">
                  <Avatar initials={me.initials} tone={me.tone} size={52} ring />
                </div>
                <p className="mt-1.5 text-base font-bold leading-tight">{me.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-moss">{me.headline}</p>
              </div>
            </div>

            <div className="border-t border-line p-2">
              <p className="px-2.5 pb-1 pt-1.5 text-xs font-bold uppercase tracking-[0.06em] text-moss">Tài khoản</p>
              {ACCOUNT.map((e) => (
                <Link key={e.label} href={e.href} role="menuitem" className={`${row} text-ink hover:bg-mist`}>
                  <e.icon className="h-[18px] w-[18px] shrink-0 text-moss" aria-hidden="true" />
                  <span className="flex-1">{e.label}</span>
                  {e.hint && <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-moss">{e.hint}</span>}
                </Link>
              ))}
            </div>

            <div className="border-t border-line p-2">
              <p className="px-2.5 pb-1 pt-1.5 text-xs font-bold uppercase tracking-[0.06em] text-moss">Quản lý</p>
              {MANAGE.map((e) => (
                <Link key={e.label} href={e.href} role="menuitem" className={`${row} text-ink hover:bg-mist`}>
                  <e.icon className="h-[18px] w-[18px] shrink-0 text-moss" aria-hidden="true" />
                  <span className="flex-1">{e.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-line p-2">
              <button
                type="button"
                role="menuitem"
                disabled={leaving}
                onClick={() => startLeaving(() => signOut())}
                className={`${row} text-[#b42318] hover:bg-[#fdecea] disabled:opacity-60`}
              >
                {leaving ? (
                  <LoaderCircle className="h-[18px] w-[18px] shrink-0 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                )}
                {leaving ? "Đang đăng xuất" : "Đăng xuất"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

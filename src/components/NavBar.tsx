"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Compass,
  HandHelping,
  House,
  MessageCircleMore,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Mark } from "./Logo";
import { NOTICES } from "@/lib/data";
import { readNotices } from "@/lib/stores";
import { useChat } from "./chat/ChatProvider";
import { UserMenu } from "./UserMenu";

interface Item {
  href: string;
  label: string;
  icon?: LucideIcon;
  match: (p: string) => boolean;
  badge?: number;
}


/** Trao đổi đứng riêng cạnh ô tìm kiếm: nơi dự án làm dở nhận góp ý, tách khỏi Trang chủ. */
const EXCHANGE: Item = {
  href: "/exchange",
  label: "Trao đổi",
  icon: HandHelping,
  match: (p) => p.startsWith("/exchange"),
};

const ITEMS: Item[] = [
  {
    href: "/community",
    label: "Trang chủ",
    icon: House,
    match: (p) => p.startsWith("/community"),
  },
  {
    href: "/explore",
    label: "Khám phá",
    icon: Compass,
    match: (p) => p.startsWith("/explore") || p.startsWith("/p/"),
  },
  {
    href: "/new",
    label: "Tạo dự án",
    icon: Plus,
    match: (p) => p.startsWith("/new"),
  },
  {
    href: "/messages",
    label: "Nhắn tin",
    icon: MessageCircleMore,
    match: (p) => p.startsWith("/messages"),
  },
  {
    href: "/notifications",
    label: "Thông báo",
    icon: Bell,
    match: (p) => p.startsWith("/notifications"),
  },
];

function NavLink({
  item,
  active,
  compact,
}: {
  item: Item;
  active: boolean;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const body = (
    <>
      <span className="relative flex h-6 items-center justify-center">
        {Icon && (
          <Icon
            className="h-6 w-6"
            strokeWidth={active ? 2.4 : 1.9}
            aria-hidden="true"
          />
        )}
        {item.badge ? (
          <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf-deep px-1 text-[11px] font-bold text-white ring-2 ring-white">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span
        className={
          compact
            ? "text-[11px] leading-none"
            : "hidden whitespace-nowrap text-xs leading-none xl:block"
        }
      >
        {item.label}
      </span>
      {active && (
        <motion.span
          layoutId={compact ? "tab-active" : "nav-active"}
          className={`absolute bg-ink ${compact ? "inset-x-4 top-0 h-[3px] rounded-b-full" : "inset-x-0 -bottom-px h-[2px]"}`}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
    </>
  );
  const cls = `relative flex flex-col items-center justify-center gap-1 transition-colors ${
    compact ? "h-full flex-1 pt-1" : "h-16 min-w-[56px] px-1.5 xl:min-w-[60px]"
  } ${active ? "text-ink" : "text-moss hover:text-ink"}`;

  return (
    <Link
      href={item.href}
      className={cls}
      aria-current={active ? "page" : undefined}
      aria-label={
        item.badge
          ? `${item.label}, ${item.badge} ${item.href === "/exchange" ? "chủ đề đang mở" : "chưa đọc"}`
          : item.label
      }
    >
      {body}
    </Link>
  );
}

/**
 * Thanh điều hướng trên cùng như LinkedIn: logo bên trái, tìm kiếm ở giữa, các mục bên phải.
 * Dưới 768px các mục chuyển xuống thanh tab cố định ở đáy màn hình.
 */
export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const { unreadCount } = useChat();
  const read = readNotices.use();
  const noticeCount = NOTICES.filter((n) => n.unread && !read.includes(n.id)).length;
  const items = ITEMS.map((i) =>
    i.href === "/messages" ? { ...i, badge: unreadCount } : i.href === "/notifications" ? { ...i, badge: noticeCount } : i,
  );

  useEffect(() => {
    // Phím "/" đưa con trỏ vào ô tìm kiếm, trừ khi đang gõ trong ô khác.
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) &&
        !t.isContentEditable
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 md:gap-6">
          <Link
            href="/community"
            className="flex items-center gap-2 justify-self-start rounded-lg"
            aria-label="Grovelyn, về Trang chủ"
          >
            <Mark size={30} />
            <span className="hidden font-display text-[22px] font-bold tracking-[-0.03em] sm:inline">
              Grovelyn
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-[520px] items-center gap-3">
            <div className="hidden md:flex">
              <NavLink item={EXCHANGE} active={EXCHANGE.match(pathname)} />
            </div>
            <span
              className="hidden h-7 w-px bg-line md:block"
              aria-hidden="true"
            />
            <form
              role="search"
              className="min-w-0 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                const q = input.current?.value.trim();
                router.push(
                  q ? `/explore?q=${encodeURIComponent(q)}` : "/explore",
                );
              }}
            >
              <label className="flex h-10 w-full items-center gap-2.5 rounded-full bg-mist px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-ink">
                <Search
                  className="h-[18px] w-[18px] shrink-0 text-moss"
                  aria-hidden="true"
                />
                <span className="sr-only">Tìm dự án, người hoặc kỹ năng</span>
                <input
                  ref={input}
                  type="search"
                  placeholder="Tìm dự án, người, kỹ năng"
                  className="w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-moss"
                />
                <kbd className="hidden rounded-md border border-line bg-white px-1.5 text-xs text-moss lg:block">
                  /
                </kbd>
              </label>
            </form>
          </div>

          <nav
            aria-label="Điều hướng chính"
            className="hidden justify-self-end md:flex"
          >
            {items.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={item.match(pathname)}
              />
            ))}
            <UserMenu />
          </nav>
          <div className="justify-self-end md:hidden">
            <UserMenu compact />
          </div>
        </div>
      </header>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {[items[0], items[1], EXCHANGE, ...items.slice(2)].map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={item.match(pathname)}
            compact
          />
        ))}
      </nav>
    </>
  );
}

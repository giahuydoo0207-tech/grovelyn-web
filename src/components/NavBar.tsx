"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bell,
  Folder,
  HandHelping,
  House,
  MessageCircleMore,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Mark } from "./Logo";
import { Avatar } from "./Avatar";
import { ME, NOTICES, PROJECTS, USERS, userOf } from "@/lib/data";
import { myProjectsStore, prefsStore, readNotices } from "@/lib/stores";
import { showcaseOf } from "@/lib/showcase";
import { useChat } from "./chat/ChatProvider";
import { UserMenu } from "./UserMenu";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();

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
    label: "Sản phẩm",
    icon: Folder,
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const mine = myProjectsStore.use();
  const prefs = prefsStore.use();
  const { unreadCount } = useChat();
  const read = readNotices.use();
  const noticeCount = NOTICES.filter((n) => n.unread && !read.includes(n.id)).length;
  const items = ITEMS.map((i) =>
    i.href === "/messages" ? { ...i, badge: unreadCount } : i.href === "/notifications" ? { ...i, badge: noticeCount } : i,
  );

  const trimmed = query.trim();
  const needle = norm(trimmed);
  const allProjects = [...mine, ...PROJECTS];
  const allUsers = USERS.map((u) =>
    u.handle === ME ? { ...u, name: prefs.name, headline: prefs.headline, location: prefs.location } : u,
  );

  const matchedProjects = needle
    ? allProjects
        .filter((p) => {
          const owner = userOf(p.owner)?.name ?? "";
          return norm([p.title, p.summary, p.field, p.output, p.context, owner, ...p.tools, ...showcaseOf(p).tags].join(" ")).includes(needle);
        })
        .slice(0, 3)
    : [];

  const matchedUsers = needle
    ? allUsers
        .filter((u) => norm([u.name, u.handle, u.intro, u.headline, u.location, ...u.skills, ...u.lenses].join(" ")).includes(needle))
        .slice(0, 3)
    : [];

  const options = needle
    ? [
        ...matchedProjects.map((p) => ({ id: `goi-y-du-an-${p.slug}`, href: `/p/${p.slug}` })),
        ...matchedUsers.map((u) => ({ id: `goi-y-nguoi-${u.handle}`, href: `/u/${u.handle}` })),
        { id: "goi-y-tat-ca", href: `/explore?q=${encodeURIComponent(trimmed)}` },
      ]
    : [];
  const showPopup = open && needle.length > 0;

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
              className="relative min-w-0 flex-1"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setOpen(false);
                  setActiveIndex(-1);
                }
              }}
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
                setActiveIndex(-1);
                router.push(
                  trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore",
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
                  role="combobox"
                  aria-expanded={showPopup}
                  aria-controls="goi-y-tim-kiem"
                  aria-autocomplete="list"
                  aria-activedescendant={showPopup && activeIndex >= 0 ? options[activeIndex]?.id : undefined}
                  value={query}
                  onFocus={() => setOpen(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      if (open) {
                        e.preventDefault();
                        setOpen(false);
                        setActiveIndex(-1);
                      }
                      return;
                    }
                    if (!needle || !options.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!open) {
                        setOpen(true);
                        setActiveIndex(0);
                      } else {
                        setActiveIndex((i) => (i + 1) % options.length);
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (!open) {
                        setOpen(true);
                        setActiveIndex(options.length - 1);
                      } else {
                        setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
                      }
                    } else if (e.key === "Enter" && showPopup && activeIndex >= 0 && options[activeIndex]) {
                      e.preventDefault();
                      const target = options[activeIndex].href;
                      setOpen(false);
                      setActiveIndex(-1);
                      router.push(target);
                    }
                  }}
                  placeholder="Tìm dự án, người, kỹ năng"
                  className="w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-moss"
                />
                <kbd className="hidden rounded-md border border-line bg-white px-1.5 text-xs text-moss lg:block">
                  /
                </kbd>
              </label>

              {showPopup && (
                <div
                  id="goi-y-tim-kiem"
                  role="listbox"
                  aria-label="Gợi ý tìm kiếm"
                  className="fixed inset-x-3 top-[60px] z-40 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-[0_12px_32px_-12px_rgba(6,17,10,0.35)] sm:absolute sm:inset-x-0 sm:top-12"
                >
                  {matchedProjects.length === 0 && matchedUsers.length === 0 ? (
                    <p className="px-2.5 py-3 text-xs text-moss">
                      Không tìm thấy dự án hay người nào khớp với “{trimmed}”.
                    </p>
                  ) : (
                    <>
                      {matchedProjects.length > 0 && (
                        <div>
                          <p className="px-2.5 py-1 text-xs font-bold text-moss" aria-hidden="true">
                            Dự án
                          </p>
                          {matchedProjects.map((p, idx) => {
                            const active = activeIndex === idx;
                            const ver = p.versions[0]?.tag;
                            return (
                              <Link
                                key={p.slug}
                                id={`goi-y-du-an-${p.slug}`}
                                role="option"
                                aria-selected={active}
                                href={`/p/${p.slug}`}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                  setOpen(false);
                                  setActiveIndex(-1);
                                }}
                                className={`flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${active ? "bg-mist" : "hover:bg-mist"}`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mist text-leaf-deep">
                                    <Folder className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-ink">{p.title}</span>
                                    <span className="block truncate text-xs text-moss">
                                      {p.field} · {userOf(p.owner)?.name ?? p.owner}
                                    </span>
                                  </span>
                                </span>
                                {ver && (
                                  <span className="shrink-0 rounded-full bg-sap px-2 py-0.5 text-xs font-bold text-leaf-deep">
                                    bản {ver}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {matchedProjects.length > 0 && matchedUsers.length > 0 && (
                        <div className="my-1.5 h-px bg-line" aria-hidden="true" />
                      )}

                      {matchedUsers.length > 0 && (
                        <div>
                          <p className="px-2.5 py-1 text-xs font-bold text-moss" aria-hidden="true">
                            Mọi người
                          </p>
                          {matchedUsers.map((u, i) => {
                            const idx = matchedProjects.length + i;
                            const active = activeIndex === idx;
                            return (
                              <Link
                                key={u.handle}
                                id={`goi-y-nguoi-${u.handle}`}
                                role="option"
                                aria-selected={active}
                                href={`/u/${u.handle}`}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                  setOpen(false);
                                  setActiveIndex(-1);
                                }}
                                className={`flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${active ? "bg-mist" : "hover:bg-mist"}`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={32} />
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-ink">
                                      {u.name} <span className="font-normal text-moss">@{u.handle}</span>
                                    </span>
                                    <span className="block truncate text-xs text-moss">{u.intro}</span>
                                  </span>
                                </span>
                                <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-ink">
                                  Xem hồ sơ
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-1 border-t border-line pt-1.5">
                    <Link
                      id="goi-y-tat-ca"
                      role="option"
                      aria-selected={activeIndex === options.length - 1}
                      href={`/explore?q=${encodeURIComponent(trimmed)}`}
                      onMouseEnter={() => setActiveIndex(options.length - 1)}
                      onClick={() => {
                        setOpen(false);
                        setActiveIndex(-1);
                      }}
                      className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-leaf-deep transition-colors ${
                        activeIndex === options.length - 1 ? "bg-mist" : "hover:bg-mist"
                      }`}
                    >
                      <span className="truncate">Xem tất cả kết quả cho “{trimmed}”</span>
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
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

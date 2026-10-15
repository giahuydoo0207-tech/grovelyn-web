"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Bell, Compass, MessagesSquare, Plus, UserRound, type LucideIcon } from "lucide-react";
import { ME, NOTICES } from "@/lib/data";

interface DockItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  primary?: boolean;
  badge?: number;
}

const unread = NOTICES.filter((n) => n.unread).length;

const ITEMS: DockItem[] = [
  { href: "/explore", label: "Khám phá", icon: Compass, match: (p) => p.startsWith("/explore") || p.startsWith("/p/") },
  { href: "/community", label: "Cộng đồng", icon: MessagesSquare, match: (p) => p.startsWith("/community") },
  { href: "/new", label: "Tạo dự án", icon: Plus, match: (p) => p.startsWith("/new"), primary: true },
  { href: "/notifications", label: "Thông báo", icon: Bell, match: (p) => p.startsWith("/notifications"), badge: unread },
  { href: `/u/${ME}`, label: "Hồ sơ", icon: UserRound, match: (p) => p === `/u/${ME}` },
];

const BASE = 48;
const PEAK = 66;

function DockButton({ item, mouseX, active }: { item: DockItem; mouseX: MotionValue<number>; active: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hint, setHint] = useState(false);
  const reduce = useReducedMotion();

  // Khoảng cách từ con trỏ tới tâm nút: càng gần nút càng phóng to, như dock của macOS.
  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !Number.isFinite(x)) return Infinity;
    return x - (box.left + box.width / 2);
  });
  const target = useTransform(distance, [-140, 0, 140], [BASE, reduce ? BASE : PEAK, BASE], { clamp: true });
  const size = useSpring(target, { mass: 0.15, stiffness: 220, damping: 16 });
  const Icon = item.icon;

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hint && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute -top-11 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[13px] font-medium text-white shadow-lg"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span style={{ width: size, height: size }} className="flex items-end justify-center">
        <Link
          ref={ref}
          href={item.href}
          aria-label={item.label}
          aria-current={active ? "page" : undefined}
          onMouseEnter={() => setHint(true)}
          onMouseLeave={() => setHint(false)}
          onFocus={() => setHint(true)}
          onBlur={() => setHint(false)}
          className={`relative flex h-full w-full items-center justify-center rounded-2xl transition-colors ${
            item.primary
              ? "bg-leaf text-ink hover:bg-[#6ee04d]"
              : active
                ? "bg-white/12 text-white"
                : "text-fog hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon className="h-[45%] w-[45%]" strokeWidth={item.primary ? 2.6 : 2} aria-hidden="true" />
          {item.badge ? (
            <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf px-1 text-[11px] font-bold text-ink">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </motion.span>
      {active && !item.primary ? (
        <motion.span layoutId="dock-dot" className="absolute -bottom-2 h-1 w-1 rounded-full bg-leaf" />
      ) : null}
    </div>
  );
}

/** Dock nổi ở đáy màn hình, thay cho sidebar. Trên điện thoại vẫn giữ nguyên như thanh điều hướng của app. */
export function Dock() {
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);

  return (
    <nav aria-label="Điều hướng chính" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-2 rounded-[26px] border border-ink-line bg-ink/95 px-3 pb-3 pt-3 shadow-[0_18px_50px_-12px_rgba(6,17,10,0.55)] backdrop-blur"
      >
        {ITEMS.map((item) => (
          <DockButton key={item.href} item={item} mouseX={mouseX} active={item.match(pathname)} />
        ))}
      </motion.div>
    </nav>
  );
}

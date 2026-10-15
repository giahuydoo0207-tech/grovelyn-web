"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { ME, userOf } from "@/lib/data";

/** Thanh trên mỏng: logo, ô tìm kiếm, tài khoản. Điều hướng chính nằm ở dock bên dưới. */
export function TopBar() {
  const me = userOf(ME)!;
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Phím "/" đưa con trỏ vào ô tìm kiếm, trừ khi đang gõ trong ô khác.
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-white/85 backdrop-blur transition-colors ${scrolled ? "border-line" : "border-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <form
          role="search"
          className="ml-auto flex w-full max-w-md items-center sm:mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.current?.value.trim();
            router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
          }}
        >
          <label className="flex h-11 w-full items-center gap-2.5 rounded-full border border-line bg-mist px-4 transition-colors focus-within:border-ink focus-within:bg-white">
            <Search className="h-[18px] w-[18px] text-moss" aria-hidden="true" />
            <span className="sr-only">Tìm dự án, người hoặc kỹ năng</span>
            <input
              ref={input}
              type="search"
              placeholder="Tìm kiếm"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-moss"
            />
            <kbd className="hidden rounded-md border border-line bg-white px-1.5 text-xs text-moss sm:block">/</kbd>
          </label>
        </form>
        <Link href={`/u/${me.handle}`} className="shrink-0 rounded-full" aria-label="Hồ sơ của bạn">
          <Avatar initials={me.initials} tone={me.tone} size={38} />
        </Link>
      </div>
    </header>
  );
}

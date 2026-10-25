"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellOff, ChevronUp, Maximize2, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ME, userOf } from "@/lib/data";
import { Composer, ConvAvatar, MessageList } from "./ChatParts";
import { lookOf, previewOf, useChat } from "./ChatProvider";

const SHADOW = "shadow-[0_-4px_30px_rgba(6,17,10,0.18)]";

function ChatWindow({ id, open, index }: { id: string; open: boolean; index: number }) {
  const { convOf, toggleWindow, closeWindow, setActive } = useChat();
  const conv = convOf(id);
  if (!conv) return null;
  const l = lookOf(conv);
  return (
    <section
      aria-label={`Trò chuyện với ${l.name}`}
      // Cửa sổ thứ hai chỉ hiện khi màn hình đủ rộng.
      className={`${index > 0 ? "hidden xl:flex" : "flex"} w-[328px] flex-col overflow-hidden rounded-t-2xl bg-white ${SHADOW} ${open ? "h-[440px]" : "h-[54px]"}`}
    >
      <div className={`flex h-[54px] shrink-0 items-center gap-1 pl-3 pr-2 ${open ? "bg-ink text-white" : "bg-white text-ink"}`}>
        <button
          type="button"
          onClick={() => toggleWindow(id)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left"
        >
          <ConvAvatar conv={conv} size={34} ring={open ? "ring-ink" : "ring-white"} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{l.name}</span>
            <span className="block truncate text-xs opacity-75">{l.status}</span>
          </span>
        </button>
        <Link
          href="/messages"
          onClick={() => {
            setActive(id);
            closeWindow(id);
          }}
          aria-label="Mở trong trang Tin nhắn"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => closeWindow(id)}
          aria-label={`Đóng trò chuyện với ${l.name}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${open ? "hover:bg-white/10" : "hover:bg-mist"}`}
        >
          <X className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <>
          <MessageList conv={conv} compact />
          <Composer convId={id} compact label={`Tin nhắn cho ${l.name}`} />
        </>
      )}
    </section>
  );
}

/**
 * Hộp chat nổi ở góc phải dưới, có trên mọi trang trừ trang Tin nhắn.
 * Chỉ hiện từ màn hình md trở lên; trên điện thoại dùng trang Tin nhắn.
 */
export function ChatDock() {
  const pathname = usePathname();
  const { convs, wins, openWindow, listOpen, setListOpen, unreadCount, muted } = useChat();
  if (pathname.startsWith("/messages")) return null;
  const me = userOf(ME)!;

  return (
    <div className="pointer-events-none fixed bottom-0 right-6 z-40 hidden items-end gap-3 md:flex">
      {wins
        .slice()
        .reverse()
        .map((w, i, arr) => (
          <div key={w.id} className="pointer-events-auto">
            <ChatWindow id={w.id} open={w.open} index={arr.length - 1 - i} />
          </div>
        ))}

      <section
        aria-label="Danh sách tin nhắn"
        className={`pointer-events-auto flex w-[320px] flex-col overflow-hidden rounded-t-2xl bg-white ${SHADOW} ${listOpen ? "h-[480px]" : "h-[54px]"}`}
      >
        <button
          type="button"
          onClick={() => setListOpen(!listOpen)}
          aria-expanded={listOpen}
          className="flex h-[54px] shrink-0 items-center gap-2.5 border-b border-line px-3.5 text-left"
        >
          <span className="relative">
            <Avatar initials={me.initials} tone={me.tone} handle={me.handle} size={32} />
            <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-leaf ring-2 ring-white" aria-hidden="true" />
          </span>
          <span className="flex-1 text-[15px] font-bold">Tin nhắn</span>
          {unreadCount > 0 && (
            <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-leaf-deep px-1.5 text-xs font-bold text-white">
              {unreadCount}
              <span className="sr-only"> cuộc trò chuyện chưa đọc</span>
            </span>
          )}
          <ChevronUp className={`h-[18px] w-[18px] transition-transform ${listOpen ? "rotate-180" : ""}`} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {listOpen && (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
              {convs.map((c) => {
                const l = lookOf(c);
                const unread = c.unread > 0;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openWindow(c.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left hover:bg-mist"
                    >
                      <ConvAvatar conv={c} size={42} />
                      <span className="min-w-0 flex-1">
                        <span className={`flex items-center gap-1 text-sm ${unread ? "font-bold" : "font-medium"}`}>
                          <span className="truncate">{l.name}</span>
                          {muted.includes(c.id) && <BellOff className="h-3.5 w-3.5 shrink-0 text-moss" aria-label="Đã tắt thông báo" />}
                        </span>
                        <span className={`block truncate text-xs ${unread ? "font-bold text-ink" : "text-moss"}`}>{previewOf(c)}</span>
                      </span>
                      {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-leaf-deep" aria-label="Chưa đọc" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/messages"
              onClick={() => setListOpen(false)}
              className="flex h-11 shrink-0 items-center justify-center border-t border-line text-sm font-bold text-leaf-deep hover:bg-mist"
            >
              Mở trang Tin nhắn
            </Link>
          </>
        )}
      </section>
    </div>
  );
}

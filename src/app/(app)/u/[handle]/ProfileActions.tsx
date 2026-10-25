"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Link2, MessageCircleMore, PencilLine } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import { following as followStore } from "@/lib/stores";

export function ProfileActions({ isMe, name, handle }: { isMe: boolean; name: string; handle: string }) {
  const following = followStore.use().includes(handle);
  const { startDirect, openWindow, setActive } = useChat();
  const router = useRouter();

  if (isMe) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href="/settings/account" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-3.5 text-[15px] font-semibold text-white hover:bg-ink-2 sm:h-11 sm:px-4">
          <PencilLine className="h-4 w-4" aria-hidden="true" /> Chỉnh sửa hồ sơ
        </Link>
        <ShareButton />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        layout
        type="button"
        aria-pressed={following}
        onClick={() => followStore.toggle(handle)}
        className={`inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-[15px] font-semibold transition-colors ${
          following ? "bg-mist text-ink" : "bg-ink text-white hover:bg-ink-2"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {following && (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span layout>{following ? "Đang theo dõi" : "Theo dõi"}</motion.span>
      </motion.button>
      <button
        type="button"
        onClick={() => {
          const id = startDirect(handle);
          // Màn hình rộng mở cửa sổ chat nổi ngay tại trang, điện thoại chuyển sang trang Tin nhắn.
          if (window.matchMedia("(min-width: 768px)").matches) {
            openWindow(id);
          } else {
            setActive(id);
            router.push("/messages");
          }
        }}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-5 text-[15px] font-semibold hover:bg-mist"
        aria-label={`Nhắn tin cho ${name}`}
      >
        <MessageCircleMore className="h-4 w-4" aria-hidden="true" /> Nhắn tin
      </button>
      <ShareButton />
    </div>
  );
}

/** Sao chép đường dẫn hồ sơ để gửi cho người khác. */
function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href.split("#")[0]);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3.5 text-[15px] font-semibold hover:bg-mist sm:h-11 sm:px-4"
      aria-label="Chia sẻ hồ sơ"
    >
      {copied ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{copied ? "Đã sao chép" : "Chia sẻ hồ sơ"}</span>
      <span className="sm:hidden">{copied ? "Đã chép" : "Chia sẻ"}</span>
    </button>
  );
}

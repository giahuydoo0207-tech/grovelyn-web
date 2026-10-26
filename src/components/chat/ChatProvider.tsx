"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ME, ONLINE, projectOf, userOf, type CoverTone } from "@/lib/data";
import { CONVERSATIONS, imagesOf, nowLabel, type ChatMessage, type Conversation } from "@/lib/chat";
import { persisted } from "@/lib/persist";

/** Tin nhắn và cuộc trò chuyện đã tắt thông báo, lưu trên trình duyệt. */
// Đổi khoá khi thêm ghim, trả lời và cụm ảnh để bản lưu cũ không thiếu dữ liệu mẫu mới.
const convStore = persisted<Conversation[]>("conversations-v2", CONVERSATIONS);
const mutedStore = persisted<string[]>("muted", []);
const setConvs = convStore.set;
const setMuted = mutedStore.set;

export interface DockWindow {
  id: string;
  open: boolean;
}

/** Thông tin hiển thị của một cuộc trò chuyện: tên, avatar, trạng thái, liên kết. */
export interface ConvLook {
  name: string;
  initials: string;
  tone: CoverTone;
  /** Tài khoản của người kia (chat riêng), để hiện đúng ảnh đại diện họ chọn. */
  handle?: string;
  square: boolean;
  online: boolean;
  status: string;
  href?: string;
  linkLabel?: string;
}

export function lookOf(c: Conversation): ConvLook {
  if (c.kind === "group") {
    return {
      name: c.name ?? "Nhóm",
      initials: c.mark ?? "N",
      tone: c.tone ?? "ink",
      square: true,
      online: false,
      status: c.about ?? `${c.members?.length ?? 0} thành viên`,
      href: c.groupSlug ? `/groups/${c.groupSlug}` : undefined,
      linkLabel: c.groupSlug ? "Xem nhóm" : undefined,
    };
  }
  const u = userOf(c.with ?? "");
  const online = ONLINE.includes(c.with ?? "");
  return {
    name: u?.name ?? "Người dùng",
    initials: u?.initials ?? "?",
    tone: u?.tone ?? "sap",
    handle: u?.handle,
    square: false,
    online,
    status: online ? "Đang hoạt động" : (c.lastSeen ?? "Không hoạt động"),
    href: u ? `/u/${u.handle}` : undefined,
    linkLabel: "Xem hồ sơ",
  };
}

/** Tên gọi ngắn (tên cuối) của người gửi trong nhóm. */
export const shortName = (handle: string) => (handle === ME ? "Bạn" : (userOf(handle)?.name.split(" ").pop() ?? handle));

/** Dòng xem trước tin cuối ở danh sách. */
export function previewOf(c: Conversation) {
  const m = c.messages[c.messages.length - 1];
  if (!m) return "Chưa có tin nhắn";
  const who = m.from === ME ? "Bạn: " : c.kind === "group" ? `${shortName(m.from)}: ` : "";
  const n = imagesOf(m).length;
  const body = m.text ?? (m.project ? `Đã chia sẻ ${projectOf(m.project)?.title ?? "một dự án"}` : n ? (n > 1 ? `Đã gửi ${n} ảnh` : "Đã gửi một ảnh") : "Đã gửi một tệp");
  return who + body;
}

interface ChatState {
  convs: Conversation[];
  convOf: (id: string) => Conversation | undefined;
  send: (id: string, msg: Omit<ChatMessage, "id" | "from" | "at">) => void;
  markRead: (id: string) => void;
  /** Thả hoặc bỏ tim một tin. */
  toggleHeart: (id: string, msgId: string) => void;
  /** Ghim hoặc bỏ ghim một tin. */
  togglePin: (id: string, msgId: string) => void;
  /** Ghim cuộc trò chuyện lên đầu danh sách. */
  togglePinConv: (id: string) => void;
  muted: string[];
  toggleMute: (id: string) => void;
  /** Cuộc trò chuyện đang mở ở trang Tin nhắn. */
  active: string;
  setActive: (id: string) => void;
  /** Mở (hoặc tạo) chat riêng với một người, trả về id. */
  startDirect: (handle: string) => string;
  /** Số cuộc trò chuyện còn tin chưa đọc (không tính cuộc đã tắt thông báo). */
  unreadCount: number;
  wins: DockWindow[];
  openWindow: (id: string) => void;
  toggleWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  listOpen: boolean;
  setListOpen: (v: boolean) => void;
}

const Ctx = createContext<ChatState | null>(null);

/** Tối đa 2 cửa sổ chat nổi cùng lúc, mở thêm thì cửa sổ cũ nhất tự đóng. */
const MAX_WINDOWS = 2;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const convs = convStore.use();
  const muted = mutedStore.use();
  const [active, setActive] = useState(CONVERSATIONS[0].id);
  const [wins, setWins] = useState<DockWindow[]>([]);
  const [listOpen, setListOpen] = useState(false);

  const convOf = useCallback((id: string) => convs.find((c) => c.id === id), [convs]);

  const send = useCallback<ChatState["send"]>((id, msg) => {
    setConvs((all) => {
      const at = nowLabel();
      const next = all.map((c) =>
        c.id === id
          ? {
              ...c,
              typing: undefined,
              unread: 0,
              when: at,
              messages: [...c.messages, { ...msg, id: `${id}-${Date.now()}-${c.messages.length}`, from: ME, at }],
            }
          : c,
      );
      // Cuộc vừa nhắn đưa lên đầu danh sách.
      const i = next.findIndex((c) => c.id === id);
      return i > 0 ? [next[i], ...next.slice(0, i), ...next.slice(i + 1)] : next;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setConvs((all) => (all.some((c) => c.id === id && c.unread) ? all.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) : all));
  }, []);

  const editMsg = useCallback((id: string, msgId: string, fn: (m: ChatMessage) => ChatMessage) => {
    setConvs((all) => all.map((c) => (c.id === id ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) } : c)));
  }, []);

  const toggleHeart = useCallback(
    (id: string, msgId: string) => editMsg(id, msgId, (m) => ({ ...m, liked: !m.liked, hearts: Math.max(0, (m.hearts ?? 0) + (m.liked ? -1 : 1)) })),
    [editMsg],
  );

  const togglePin = useCallback((id: string, msgId: string) => editMsg(id, msgId, (m) => ({ ...m, pinned: !m.pinned })), [editMsg]);

  const togglePinConv = useCallback((id: string) => {
    setConvs((all) => all.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  }, []);

  const toggleMute = useCallback((id: string) => {
    setMuted((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }, []);

  const startDirect = useCallback(
    (handle: string) => {
      const found = convs.find((c) => c.kind === "direct" && c.with === handle);
      if (found) return found.id;
      const id = handle;
      setConvs((all) => [{ id, kind: "direct", with: handle, unread: 0, when: "Mới", messages: [] }, ...all]);
      return id;
    },
    [convs],
  );

  const openWindow = useCallback(
    (id: string) => {
      setWins((w) => (w.some((x) => x.id === id) ? w.map((x) => (x.id === id ? { ...x, open: true } : x)) : [{ id, open: true }, ...w].slice(0, MAX_WINDOWS)));
      markRead(id);
    },
    [markRead],
  );

  const toggleWindow = useCallback(
    (id: string) => {
      setWins((w) => w.map((x) => (x.id === id ? { ...x, open: !x.open } : x)));
      markRead(id);
    },
    [markRead],
  );

  const closeWindow = useCallback((id: string) => setWins((w) => w.filter((x) => x.id !== id)), []);

  const unreadCount = convs.filter((c) => c.unread > 0 && !muted.includes(c.id)).length;

  // React Compiler tự ghi nhớ giá trị này.
  const value: ChatState = { convs, convOf, send, markRead, toggleHeart, togglePin, togglePinConv, muted, toggleMute, active, setActive, startDirect, unreadCount, wins, openWindow, toggleWindow, closeWindow, listOpen, setListOpen };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useChat phải nằm trong ChatProvider");
  return v;
}

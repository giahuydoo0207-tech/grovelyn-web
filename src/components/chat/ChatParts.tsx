"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  FolderOpen,
  Heart,
  ImageIcon,
  Paperclip,
  Pin,
  PinOff,
  Plus,
  Reply,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { ME, userOf } from "@/lib/data";
import { useMyProjects, useProject } from "@/lib/stores";
import { MAX_IMAGES, imagesOf, type ChatMessage, type Conversation } from "@/lib/chat";
import { lookOf, shortName, useChat } from "./ChatProvider";
import { compressImage } from "@/lib/localMedia";

/** Avatar cuộc trò chuyện: tròn cho người, bo góc cho nhóm, chấm xanh khi đang online. */
export function ConvAvatar({ conv, size = 48, ring = "ring-white" }: { conv: Conversation; size?: number; ring?: string }) {
  const l = lookOf(conv);
  const dot = Math.max(10, Math.round(size * 0.27));
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar initials={l.initials} tone={l.tone} handle={l.handle} size={size} square={l.square} />
      {l.online && <span className={`absolute bottom-0 right-0 rounded-full bg-leaf ring-2 ${ring}`} style={{ width: dot, height: dot }} aria-hidden="true" />}
    </span>
  );
}

/** id phần tử của một tin, để nhảy tới khi bấm tin ghim hoặc trích dẫn. */
export const msgDomId = (scope: string, convId: string, msgId: string) => `tin-${scope}-${convId}-${msgId}`;

/** Cuộn tới một tin và nháy nền để mắt dễ tìm. */
export function jumpTo(scope: string, convId: string, msgId: string) {
  const el = document.getElementById(msgDomId(scope, convId, msgId));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.dataset.flash = "1";
  window.setTimeout(() => delete el.dataset.flash, 1400);
}

/** Tóm tắt một tin trong một dòng: chữ, ảnh, tệp hay dự án. */
export function snippetOf(m: ChatMessage) {
  const n = imagesOf(m).length;
  if (m.text) return m.text;
  if (n) return n > 1 ? `${n} ảnh` : "Ảnh";
  if (m.file) return m.file.name;
  return "Dự án";
}

function ProjectBubble({ slug, compact }: { slug: string; compact?: boolean }) {
  const p = useProject(slug);
  if (!p) return null;
  return (
    <Link href={`/p/${p.slug}`} className={`block overflow-hidden rounded-2xl border border-line bg-white text-ink transition hover:border-fog ${compact ? "w-[220px]" : "w-[280px]"}`}>
      <ProjectCover seed={p.seed} tone={p.tone} className={`block w-full ${compact ? "h-[84px]" : "h-[110px]"}`} />
      <span className="block px-3 py-2.5">
        <span className="block text-xs font-bold text-leaf-deep">
          {p.field}, v{p.versions.length}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[15px] font-bold leading-snug">{p.title}</span>
        <span className="mt-0.5 block text-xs text-moss">{userOf(p.owner)?.name}</span>
      </span>
    </Link>
  );
}

/** Ảnh trong chat có thể là đường dẫn mẫu hoặc data URL người dùng vừa gửi nên dùng thẻ img. */
function Shot({ src, className, more, onOpen, label }: { src: string; className: string; more?: number; onOpen: () => void; label: string }) {
  return (
    <button type="button" onClick={onOpen} aria-label={label} className={`relative block overflow-hidden bg-mist ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover transition hover:scale-[1.02]" />
      {more ? <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-xl font-bold text-white">+{more}</span> : null}
    </button>
  );
}

/** Cụm ảnh: 1 ảnh lớn, 2 ảnh cạnh nhau, từ 3 ảnh là 1 lớn và 2 nhỏ, ảnh cuối ghi số ảnh còn lại. */
export function Album({ srcs, compact, onOpen }: { srcs: string[]; compact?: boolean; onOpen: (i: number) => void }) {
  const n = srcs.length;
  const label = (i: number) => `Xem ảnh ${i + 1} trên ${n}`;
  if (n === 1)
    return (
      <button type="button" onClick={() => onOpen(0)} aria-label="Xem ảnh" className="block overflow-hidden rounded-[18px] border border-line bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={srcs[0]} alt="" className={`block object-cover ${compact ? "max-h-44 max-w-[220px]" : "max-h-72 max-w-[min(320px,70vw)]"}`} />
      </button>
    );
  if (n === 2) {
    const s = compact ? "h-[110px] w-[110px]" : "h-[150px] w-[150px] sm:h-[170px] sm:w-[170px]";
    return (
      <div className="flex gap-1">
        {srcs.map((src, i) => (
          <Shot key={i} src={src} onOpen={() => onOpen(i)} label={label(i)} className={`${s} rounded-[18px]`} />
        ))}
      </div>
    );
  }
  const big = compact ? "h-[150px] w-[136px]" : "h-[180px] w-[170px] sm:h-[200px] sm:w-[200px]";
  const small = compact ? "h-[73px] w-[84px]" : "h-[88px] w-[104px] sm:h-[98px] sm:w-[118px]";
  return (
    <div className="flex gap-1">
      <Shot src={srcs[0]} onOpen={() => onOpen(0)} label={label(0)} className={`${big} rounded-[18px]`} />
      <div className="flex flex-col gap-1">
        <Shot src={srcs[1]} onOpen={() => onOpen(1)} label={label(1)} className={`${small} rounded-[14px]`} />
        <Shot src={srcs[2]} onOpen={() => onOpen(2)} label={label(2)} more={n - 3} className={`${small} rounded-[14px]`} />
      </div>
    </div>
  );
}

/** Xem ảnh toàn màn hình, chuyển ảnh bằng phím mũi tên, Esc để đóng. */
export function Lightbox({ srcs, start, onClose }: { srcs: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const n = srcs.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [n, onClose]);
  const nav = "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20";
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Xem ảnh" className="fixed inset-0 z-[70] flex flex-col bg-ink" onClick={onClose}>
      <div className="flex h-16 shrink-0 items-center justify-between px-4 text-white">
        <span className="text-sm font-bold">{n > 1 ? `${i + 1} / ${n}` : "Ảnh"}</span>
        <button type="button" onClick={onClose} aria-label="Đóng" className={nav}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 pb-6">
        {n > 1 && (
          <button
            type="button"
            aria-label="Ảnh trước"
            className={`${nav} hidden sm:flex`}
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v - 1 + n) % n);
            }}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={srcs[i]} alt={`Ảnh ${i + 1}`} onClick={(e) => e.stopPropagation()} className="max-h-full min-w-0 max-w-full rounded-xl object-contain" />
        {n > 1 && (
          <button
            type="button"
            aria-label="Ảnh sau"
            className={`${nav} hidden sm:flex`}
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v + 1) % n);
            }}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
      {n > 1 && (
        <div className="no-scrollbar flex shrink-0 justify-center gap-2 overflow-x-auto px-4 pb-5" onClick={(e) => e.stopPropagation()}>
          {srcs.map((src, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Ảnh ${k + 1}`} aria-current={k === i} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg ${k === i ? "ring-2 ring-leaf" : "opacity-60 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

function Quote({ m, dark, onJump }: { m: ChatMessage; dark: boolean; onJump: () => void }) {
  return (
    <button
      type="button"
      onClick={onJump}
      className={`mb-1.5 flex w-full min-w-0 items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-left text-[14.5px] ${dark ? "bg-white/10 text-white/75 hover:bg-white/15" : "bg-mist text-moss hover:bg-line"}`}
    >
      <Reply className={`h-3.5 w-3.5 shrink-0 ${dark ? "text-leaf" : "text-leaf-deep"}`} aria-hidden="true" />
      <span className="min-w-0 truncate">
        <strong className={dark ? "text-white" : "text-ink"}>{m.from === ME ? "Bạn" : userOf(m.from)?.name.split(" ").slice(-2).join(" ")}</strong>: {snippetOf(m)}
      </span>
    </button>
  );
}

function ToolBar({ m, conv, onReply, mine, show }: { m: ChatMessage; conv: Conversation; onReply: () => void; mine: boolean; show: boolean }) {
  const { toggleHeart, togglePin } = useChat();
  const [copied, setCopied] = useState(false);
  const b = "flex h-8 w-8 items-center justify-center rounded-[9px] text-moss hover:bg-mist hover:text-ink";
  return (
    <div
      className={`absolute top-1/2 z-[5] -translate-y-1/2 items-center gap-0.5 rounded-xl border border-line bg-white p-[3px] shadow-[0_6px_18px_-8px_rgba(6,17,10,0.3)] ${mine ? "right-full mr-2" : "left-full ml-2"} ${show ? "flex max-md:static max-md:mt-0.5 max-md:w-fit max-md:translate-y-0" : "hidden md:group-hover/msg:flex md:group-focus-within/msg:flex"}`}
    >
      <button type="button" className={b} onClick={onReply} aria-label="Trả lời" title="Trả lời">
        <Reply className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={b} onClick={() => toggleHeart(conv.id, m.id)} aria-label={m.liked ? "Bỏ tim" : "Thả tim"} aria-pressed={!!m.liked} title="Thả tim">
        <Heart className={`h-4 w-4 ${m.liked ? "fill-leaf-deep text-leaf-deep" : ""}`} aria-hidden="true" />
      </button>
      <button type="button" className={b} onClick={() => togglePin(conv.id, m.id)} aria-label={m.pinned ? "Bỏ ghim" : "Ghim tin"} title={m.pinned ? "Bỏ ghim" : "Ghim tin"}>
        {m.pinned ? <PinOff className="h-4 w-4" aria-hidden="true" /> : <Pin className="h-4 w-4" aria-hidden="true" />}
      </button>
      {m.text && (
        <button
          type="button"
          className={b}
          aria-label={copied ? "Đã chép" : "Chép tin"}
          title={copied ? "Đã chép" : "Chép tin"}
          onClick={() => {
            void navigator.clipboard?.writeText(m.text ?? "").then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

/** Danh sách tin nhắn có gom nhóm theo người gửi, dùng cho trang Tin nhắn và cửa sổ nổi. */
export function MessageList({
  conv,
  compact = false,
  scope,
  onReply,
}: {
  conv: Conversation;
  compact?: boolean;
  /** Phân biệt cùng một cuộc trò chuyện mở ở trang và ở cửa sổ nổi. */
  scope: string;
  onReply: (msgId: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const msgs = conv.messages;
  const group = conv.kind === "group";
  const [view, setView] = useState<{ srcs: string[]; i: number } | null>(null);
  // Điện thoại không có hover: chạm vào tin để hiện thanh thao tác.
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv.id, msgs.length]);

  // Khung bị ẩn lúc render (cột chat trên điện thoại) thì cuộn xuống cuối khi nó hiện ra.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let hidden = el.clientHeight === 0;
    const ro = new ResizeObserver(() => {
      if (hidden && el.clientHeight > 0) el.scrollTop = el.scrollHeight;
      hidden = el.clientHeight === 0;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const last = msgs[msgs.length - 1];
  const lastMine = last?.from === ME ? last : undefined;
  const typer = conv.typing ? userOf(conv.typing) : undefined;
  // Bản dùng thử: trong nhóm, ai không đang gõ coi như đã xem tin cuối của bạn.
  const readers = group ? (conv.members ?? []).filter((h) => h !== ME && h !== conv.typing) : [];
  const byId = new Map(msgs.map((m) => [m.id, m]));

  return (
    <div
      ref={box}
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden ${compact ? "gap-1 p-3" : "gap-1.5 px-4 pb-4 pt-5 sm:px-8"}`}
      role="log"
      aria-live="polite"
      aria-label={`Tin nhắn với ${lookOf(conv).name}`}
    >
      {!compact && msgs.length > 0 && (
        <p className="mb-2 flex items-center gap-3.5 text-xs font-semibold text-moss">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          Hôm nay
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </p>
      )}
      {msgs.length === 0 && (
        <div className="m-auto max-w-[260px] text-center">
          <ConvAvatar conv={conv} size={compact ? 52 : 72} />
          <p className="mt-3 font-bold">{lookOf(conv).name}</p>
          <p className="mt-1 text-sm text-moss">Chưa có tin nhắn nào. Gửi lời chào để bắt đầu.</p>
        </div>
      )}
      {/* Tin có sẵn lúc mở cuộc trò chuyện đứng yên; tin mới gửi hoặc nhận thì trượt nhẹ lên. */}
      <AnimatePresence key={conv.id} initial={false}>
        {msgs.map((m, i) => {
          const mine = m.from === ME;
          const prev = msgs[i - 1];
          const next = msgs[i + 1];
          const firstOfRun = !prev || prev.from !== m.from;
          const lastOfRun = !next || next.from !== m.from;
          const u = userOf(m.from);
          const avSize = compact ? 26 : 34;
          const shots = imagesOf(m);
          const quoted = m.replyTo ? byId.get(m.replyTo) : undefined;
          const round = mine ? (lastOfRun ? "rounded-[18px] rounded-br-md" : "rounded-[18px] rounded-r-md") : firstOfRun ? "rounded-[18px] rounded-bl-md" : "rounded-[18px] rounded-l-md";
          const bubble = mine ? "bg-ink text-white" : "border border-line bg-white text-ink";
          const showMeta = lastOfRun || m.hearts || m.pinned;
          return (
            <motion.div
              key={m.id}
              id={msgDomId(scope, conv.id, m.id)}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ transformOrigin: mine ? "bottom right" : "bottom left" }}
              className={`flex scroll-my-6 items-end gap-2.5 rounded-2xl transition-colors duration-700 data-[flash]:bg-pin ${mine ? "justify-end" : "justify-start"} ${firstOfRun && i ? "mt-3" : ""}`}
            >
              {!mine && (lastOfRun && u ? <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={avSize} /> : <span style={{ width: avSize }} className="shrink-0" aria-hidden="true" />)}
              <div className={`flex min-w-0 flex-col gap-1 ${mine ? "items-end" : "items-start"} ${compact ? "max-w-[82%]" : "max-w-[80%] lg:max-w-[66%]"}`}>
                {group && !mine && firstOfRun && <span className="ml-1 text-[13.5px] font-semibold text-moss">{u?.name ?? m.from}</span>}
                <div
                  className="group/msg relative flex max-w-full flex-col gap-1"
                  style={{ alignItems: mine ? "flex-end" : "flex-start" }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button, a")) return;
                    setPicked((p) => (p === m.id ? null : m.id));
                  }}
                >
                  {shots.length > 0 && <Album srcs={shots} compact={compact} onOpen={(k) => setView({ srcs: shots, i: k })} />}
                  {m.text && (
                    <div className={`max-w-full whitespace-pre-wrap break-words ${bubble} ${round} ${compact ? "px-3 py-2 text-[15px]" : "px-4 py-2.5 text-[17px]"} leading-snug`}>
                      {quoted && <Quote m={quoted} dark={mine} onJump={() => jumpTo(scope, conv.id, quoted.id)} />}
                      {m.text}
                    </div>
                  )}
                  {m.project && <ProjectBubble slug={m.project} compact={compact} />}
                  {m.file && (
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 rounded-2xl border border-line bg-white py-2.5 pl-2.5 pr-3.5 text-ink hover:border-fog">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sap">
                        <FileText className="h-5 w-5 text-leaf-deep" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-bold">{m.file.name}</span>
                        <span className="text-[13px] text-moss">{m.file.size} · Bấm để xem trước</span>
                      </span>
                    </a>
                  )}
                  {!compact && <ToolBar m={m} conv={conv} mine={mine} show={picked === m.id} onReply={() => onReply(m.id)} />}
                </div>
                {compact && picked === m.id && (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => onReply(m.id)} className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-bold hover:bg-mist">
                      Trả lời
                    </button>
                  </div>
                )}
                {showMeta && (
                  <span className={`mx-1 flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? "text-xs" : "text-[13px]"} text-moss ${mine ? "justify-end" : ""}`}>
                    {lastOfRun && <span>{m.at}</span>}
                    {shots.length > 1 && lastOfRun && <span>· {shots.length} ảnh</span>}
                    {m.pinned && (
                      <span className="inline-flex items-center gap-1 font-semibold text-pin-ink">
                        <Pin className="h-3 w-3" aria-hidden="true" />
                        Đã ghim
                      </span>
                    )}
                    {m.hearts ? (
                      <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-sap px-2 font-bold text-leaf-deep">
                        <Heart className="h-3 w-3 fill-leaf-deep" aria-hidden="true" />
                        {m.hearts}
                        <span className="sr-only">lượt thả tim</span>
                      </span>
                    ) : null}
                    {m === lastMine &&
                      (group ? (
                        readers.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            Đã xem bởi
                            <span className="inline-flex pl-1">
                              {readers.slice(0, 3).map((h) => {
                                const r = userOf(h);
                                return r ? (
                                  <span key={h} className="-ml-1 rounded-full ring-2 ring-white" title={r.name}>
                                    <Avatar initials={r.initials} tone={r.tone} handle={h} size={16} />
                                  </span>
                                ) : null;
                              })}
                            </span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-leaf-deep">
                          <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Đã xem
                        </span>
                      ))}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {typer && (
        <p className={`mt-2 flex items-center gap-2.5 text-[14px] text-moss ${compact ? "" : ""}`}>
          <Avatar initials={typer.initials} tone={typer.tone} handle={typer.handle} size={compact ? 22 : 26} />
          <span className="inline-flex gap-[3px] rounded-full bg-mist px-2.5 py-2" aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-leaf" style={{ animationDelay: `${d * 140}ms` }} />
            ))}
          </span>
          {shortName(typer.handle)} đang gõ…
        </p>
      )}
      {view && <Lightbox srcs={view.srcs} start={view.i} onClose={() => setView(null)} />}
    </div>
  );
}

const sizeLabel = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const COMMANDS = [
  { key: "anh", icon: ImageIcon, hint: "Gửi ảnh, tối đa 10 ảnh" },
  { key: "tep", icon: Paperclip, hint: "Gửi tệp" },
  { key: "duan", icon: FolderOpen, hint: "Gắn một dự án của bạn" },
  { key: "ghim", icon: Pin, hint: "Ghim tin bạn vừa gửi" },
] as const;
type Command = (typeof COMMANDS)[number]["key"];

/** Ô soạn tin nổi: chữ nhiều dòng, cụm ảnh chờ gửi, trả lời trích dẫn, lệnh gõ "/" và chia sẻ dự án. */
export function Composer({
  convId,
  compact = false,
  label,
  placeholder,
  replyTo,
  onCancelReply,
}: {
  convId: string;
  compact?: boolean;
  label: string;
  placeholder: string;
  replyTo?: ChatMessage;
  onCancelReply: () => void;
}) {
  const { send, convOf, togglePin } = useChat();
  const [draft, setDraft] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(false);
  const [cmdIdx, setCmdIdx] = useState(0);
  const [note, setNote] = useState("");
  const imgInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const mine = useMyProjects();

  // Đổi cuộc trò chuyện thì xoá nháp, ảnh chờ và đóng bảng chọn.
  const [lastConv, setLastConv] = useState(convId);
  if (lastConv !== convId) {
    setLastConv(convId);
    setDraft("");
    setShots([]);
    setPicker(false);
    setNote("");
  }

  // Ô chữ cao dần theo nội dung, tối đa khoảng 6 dòng.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, compact ? 96 : 150)}px`;
  }, [draft, compact]);

  useEffect(() => {
    if (replyTo) area.current?.focus();
  }, [replyTo]);

  const slash = /^\/\S*$/.test(draft) ? draft.slice(1).toLowerCase() : null;
  const cmds = slash === null ? [] : COMMANDS.filter((c) => c.key.startsWith(slash));
  const room = MAX_IMAGES - shots.length;

  const addImages = async (files: File[]) => {
    const pics = files.filter((f) => f.type.startsWith("image/"));
    if (!pics.length) return;
    if (pics.length > room) setNote(`Mỗi lần gửi tối đa ${MAX_IMAGES} ảnh, đã bỏ bớt ${pics.length - room} ảnh.`);
    setBusy(true);
    // Thu nhỏ ảnh rồi lưu cùng tin nhắn, tải lại trang vẫn còn.
    const out = await Promise.all(pics.slice(0, Math.max(0, room)).map((f) => compressImage(f, 1280)));
    setShots((s) => [...s, ...out].slice(0, MAX_IMAGES));
    setBusy(false);
    area.current?.focus();
  };

  const run = (c: Command) => {
    setDraft("");
    if (c === "anh") imgInput.current?.click();
    if (c === "tep") fileInput.current?.click();
    if (c === "duan") setPicker(true);
    if (c === "ghim") {
      const lastMine = [...(convOf(convId)?.messages ?? [])].reverse().find((m) => m.from === ME);
      if (lastMine) {
        togglePin(convId, lastMine.id);
        setNote(lastMine.pinned ? "Đã bỏ ghim tin vừa gửi." : "Đã ghim tin vừa gửi.");
      } else setNote("Bạn chưa gửi tin nào để ghim.");
    }
  };

  const submit = () => {
    if (cmds.length) return run(cmds[Math.min(cmdIdx, cmds.length - 1)].key);
    const text = draft.trim();
    if (!text && !shots.length) return;
    send(convId, { ...(text ? { text } : {}), ...(shots.length ? { images: shots } : {}), ...(replyTo ? { replyTo: replyTo.id } : {}) });
    setDraft("");
    setShots([]);
    setNote("");
    onCancelReply();
  };

  const ib = `flex shrink-0 items-center justify-center rounded-[10px] text-moss transition hover:bg-mist hover:text-ink ${compact ? "h-8 w-8" : "h-9 w-9"}`;
  const canSend = !busy && (!!draft.trim() || shots.length > 0);
  const thumb = compact ? "h-12 w-12" : "h-16 w-16";

  return (
    <div className={`shrink-0 ${compact ? "border-t border-line p-2" : "px-3 pb-3 sm:px-6 sm:pb-5"}`}>
      <form
        className={`relative bg-white ${compact ? "" : "rounded-[22px] border border-line px-3 pb-2 pt-3 shadow-[0_18px_40px_-22px_rgba(6,17,10,0.35)] sm:pl-4"}`}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void addImages([...e.dataTransfer.files]);
        }}
      >
        <input
          ref={imgInput}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void addImages([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) send(convId, { file: { name: f.name, size: sizeLabel(f.size) } });
            e.target.value = "";
          }}
        />

        {cmds.length > 0 && (
          <div role="listbox" aria-label="Lệnh nhanh" className="absolute bottom-[calc(100%+10px)] left-0 z-20 w-[min(330px,100%)] rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(6,17,10,0.35)]">
            <p className="px-2.5 py-1.5 text-xs font-bold text-moss">Lệnh nhanh</p>
            {cmds.map((c, k) => (
              <button
                key={c.key}
                type="button"
                role="option"
                aria-selected={k === cmdIdx}
                onMouseEnter={() => setCmdIdx(k)}
                onClick={() => run(c.key)}
                className={`flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left ${k === cmdIdx ? "bg-sap" : ""}`}
              >
                <c.icon className="h-[17px] w-[17px] shrink-0 text-leaf-deep" aria-hidden="true" />
                <span className="font-mono text-[13px] font-bold">/{c.key}</span>
                <span className="truncate text-[13px] text-moss">{c.hint}</span>
              </button>
            ))}
          </div>
        )}

        {picker && (
          <div className="absolute bottom-[calc(100%+10px)] left-0 z-20 w-[min(320px,100%)] rounded-2xl border border-line bg-white p-2 shadow-[0_18px_40px_-18px_rgba(6,17,10,0.35)]">
            <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
              <p className="text-xs font-bold text-moss">Gắn dự án của bạn</p>
              <button type="button" onClick={() => setPicker(false)} aria-label="Đóng" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-mist">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {mine.map((p) => (
              <button
                key={p.slug}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left hover:bg-mist"
                onClick={() => {
                  send(convId, { project: p.slug });
                  setPicker(false);
                }}
              >
                <ProjectCover seed={p.seed} tone={p.tone} className="h-9 w-9 shrink-0 overflow-hidden rounded-lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{p.title}</span>
                  <span className="text-xs text-moss">{p.field}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {replyTo && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-mist py-1.5 pl-3 pr-1.5 text-[14.5px]">
            <Reply className="h-3.5 w-3.5 shrink-0 text-leaf-deep" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-moss">
              Trả lời <strong className="text-ink">{replyTo.from === ME ? "chính bạn" : userOf(replyTo.from)?.name}</strong>: {snippetOf(replyTo)}
            </span>
            <button type="button" onClick={onCancelReply} aria-label="Huỷ trả lời" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-line">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {(shots.length > 0 || busy) && (
          <div className="no-scrollbar -mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pt-1.5">
            {shots.map((src, k) => (
              <span key={k} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Ảnh chờ gửi ${k + 1}`} className={`${thumb} rounded-xl object-cover`} />
                <button
                  type="button"
                  aria-label={`Bỏ ảnh ${k + 1}`}
                  onClick={() => setShots((s) => s.filter((_, j) => j !== k))}
                  className="absolute -right-1.5 -top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-ink text-white"
                >
                  <X className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </button>
              </span>
            ))}
            {busy && <span className={`${thumb} shrink-0 animate-pulse rounded-xl bg-mist`} aria-label="Đang xử lý ảnh" />}
            {room > 0 && !busy && (
              <button type="button" onClick={() => imgInput.current?.click()} aria-label="Thêm ảnh" className={`${thumb} flex shrink-0 items-center justify-center rounded-xl border-[1.5px] border-dashed border-line text-moss hover:bg-mist`}>
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className={compact ? "flex items-end gap-1" : ""}>
          {compact && (
            <button type="button" className={ib} aria-label="Gửi ảnh" onClick={() => imgInput.current?.click()}>
              <ImageIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
          <label htmlFor={inputId} className="sr-only">
            {label}
          </label>
          <textarea
            id={inputId}
            ref={area}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setCmdIdx(0);
              setNote("");
            }}
            onPaste={(e) => {
              const files = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
              if (files.length) {
                e.preventDefault();
                void addImages(files);
              }
            }}
            onKeyDown={(e) => {
              if (cmds.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                setCmdIdx((v) => (v + (e.key === "ArrowDown" ? 1 : cmds.length - 1)) % cmds.length);
              }
              if (e.key === "Escape") {
                if (cmds.length) setDraft("");
                else if (replyTo) onCancelReply();
              }
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={shots.length ? "Thêm chú thích cho ảnh…" : placeholder}
            autoComplete="off"
            aria-autocomplete="list"
            className={`block w-full resize-none bg-transparent leading-snug outline-none placeholder:text-moss focus-visible:outline-none ${compact ? "min-h-9 flex-1 rounded-[18px] bg-mist px-3.5 py-2 text-[15px]" : "min-h-[30px] px-1 text-[17px]"}`}
          />
          {compact && (
            <button type="submit" aria-label="Gửi" disabled={!canSend} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf text-ink transition hover:brightness-95 disabled:opacity-50">
              <ArrowUp className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
            </button>
          )}
        </div>

        {!compact && (
          <div className="mt-1.5 flex items-center gap-0.5">
            <button type="button" className={ib} aria-label="Đính kèm tệp" title="Đính kèm tệp" onClick={() => fileInput.current?.click()}>
              <Paperclip className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${ib} ${shots.length ? "bg-sap text-leaf-deep" : ""}`}
              aria-label="Gửi ảnh"
              title="Gửi ảnh"
              onClick={() => imgInput.current?.click()}
            >
              <ImageIcon className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>
            <button type="button" className={`${ib} ${picker ? "bg-sap text-leaf-deep" : ""}`} aria-label="Gắn dự án" title="Gắn dự án" aria-expanded={picker} onClick={() => setPicker((v) => !v)}>
              <FolderOpen className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>
            <span className="ml-auto mr-2.5 hidden truncate text-xs text-moss sm:block" aria-live="polite">
              {note || (shots.length ? `${shots.length} ảnh · tối đa ${MAX_IMAGES} ảnh mỗi lần · Enter để gửi` : "Gõ / để gửi ảnh, tệp, gắn dự án · Enter để gửi")}
            </span>
            {note && <span className="ml-auto mr-2 truncate text-xs text-moss sm:hidden">{note}</span>}
            <button
              type="submit"
              aria-label="Gửi"
              disabled={!canSend}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf text-ink transition hover:brightness-95 disabled:opacity-50 ${note ? "" : "ml-auto sm:ml-0"}`}
            >
              <ArrowUp className="h-[19px] w-[19px]" strokeWidth={2.6} aria-hidden="true" />
            </button>
          </div>
        )}
        {compact && note && <p className="px-1 pt-1 text-xs text-moss">{note}</p>}
      </form>
    </div>
  );
}

/** Dải tin ghim dưới đầu khung chat: hiện tin ghim mới nhất, bấm để nhảy tới, bấm tiếp để lùi về tin ghim trước. */
export function PinnedBar({ conv, scope, compact = false }: { conv: Conversation; scope: string; compact?: boolean }) {
  const pins = conv.messages.filter((m) => m.pinned);
  const [step, setStep] = useState(0);
  if (!pins.length) return null;
  const at = Math.min(step, pins.length - 1);
  const m = pins[pins.length - 1 - at];
  return (
    <button
      type="button"
      onClick={() => {
        jumpTo(scope, conv.id, m.id);
        setStep((at + 1) % pins.length);
      }}
      title="Bấm để tới tin ghim"
      className={`flex w-full shrink-0 items-center gap-2.5 border-b border-line bg-pin text-left hover:brightness-[0.98] ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-[13.5px] sm:px-6"}`}
    >
      <Pin className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0 text-pin-ink`} aria-hidden="true" />
      {!compact && <strong className="shrink-0 text-pin-ink">Đã ghim</strong>}
      <span className="min-w-0 flex-1 truncate text-moss">{snippetOf(m)}</span>
      {pins.length > 1 && <span className="shrink-0 font-bold text-pin-ink">{compact ? `${at + 1}/${pins.length}` : `${pins.length} tin ghim`}</span>}
    </button>
  );
}

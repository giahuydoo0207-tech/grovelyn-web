"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FileText,
  FolderOpen,
  Heart,
  ImageIcon,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { ME, userOf } from "@/lib/data";
import { useMyProjects, useProject } from "@/lib/stores";
import type { Conversation } from "@/lib/chat";
import { lookOf, shortName, useChat } from "./ChatProvider";
import { compressImage } from "@/lib/localMedia";

/** Avatar cuộc trò chuyện: tròn cho người, bo góc cho nhóm, chấm xanh khi đang online. */
export function ConvAvatar({
  conv,
  size = 48,
  ring = "ring-white",
}: {
  conv: Conversation;
  size?: number;
  ring?: string;
}) {
  const l = lookOf(conv);
  const dot = Math.max(10, Math.round(size * 0.27));
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar
        initials={l.initials}
        tone={l.tone}
        size={size}
        square={l.square}
      />
      {l.online && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-leaf ring-2 ${ring}`}
          style={{ width: dot, height: dot }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

function ProjectBubble({ slug, compact }: { slug: string; compact?: boolean }) {
  const p = useProject(slug);
  if (!p) return null;
  return (
    <Link
      href={`/p/${p.slug}`}
      className={`block overflow-hidden rounded-2xl border border-line bg-white text-ink transition hover:border-fog ${compact ? "w-[220px]" : "w-[280px]"}`}
    >
      <ProjectCover
        seed={p.seed}
        tone={p.tone}
        className={`block w-full ${compact ? "h-[84px]" : "h-[110px]"}`}
      />
      <span className="block px-3 py-2.5">
        <span className="block text-xs font-bold text-leaf-deep">
          {p.field}, v{p.versions.length}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[15px] font-bold leading-snug">
          {p.title}
        </span>
      </span>
    </Link>
  );
}

/** Danh sách tin nhắn có gom nhóm theo người gửi, dùng cho trang Tin nhắn và cửa sổ nổi. */
export function MessageList({
  conv,
  compact = false,
}: {
  conv: Conversation;
  compact?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const msgs = conv.messages;
  const group = conv.kind === "group";

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
  const seen = !group && last?.from === ME;
  const typer = conv.typing ? userOf(conv.typing) : undefined;

  return (
    <div
      ref={box}
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${compact ? "gap-1 p-3" : "gap-1.5 px-4 py-4 sm:px-6"}`}
      role="log"
      aria-live="polite"
      aria-label={`Tin nhắn với ${lookOf(conv).name}`}
    >
      {!compact && msgs.length > 0 && (
        <p className="mb-1.5 self-center rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-moss">
          Hôm nay
        </p>
      )}
      {msgs.length === 0 && (
        <div className="m-auto max-w-[260px] text-center">
          <ConvAvatar conv={conv} size={compact ? 52 : 72} />
          <p className="mt-3 font-bold">{lookOf(conv).name}</p>
          <p className="mt-1 text-sm text-moss">
            Chưa có tin nhắn nào. Gửi lời chào để bắt đầu.
          </p>
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
          const bubble = mine ? "bg-ink text-white" : "bg-mist text-ink";
          const avSize = compact ? 26 : 30;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ transformOrigin: mine ? "bottom right" : "bottom left" }}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${firstOfRun && i ? "mt-2.5" : ""}`}
            >
              {!mine &&
                (lastOfRun && u ? (
                  <Avatar initials={u.initials} tone={u.tone} size={avSize} />
                ) : (
                  <span
                    style={{ width: avSize }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                ))}
              <div
                className={`flex min-w-0 flex-col ${mine ? "items-end" : "items-start"} ${compact ? "max-w-[80%]" : "max-w-[78%] lg:max-w-[62%]"}`}
              >
                {group && !mine && firstOfRun && (
                  <span className="mb-0.5 ml-1 text-xs font-bold text-moss">
                    {u?.name ?? m.from}
                  </span>
                )}
                {m.text && (
                  <p
                    className={`whitespace-pre-wrap break-words ${bubble} ${compact ? "rounded-2xl px-3 py-2 text-sm" : "rounded-2xl px-3.5 py-2.5 text-[15px]"} leading-snug`}
                  >
                    {m.text}
                  </p>
                )}
                {m.project && (
                  <ProjectBubble slug={m.project} compact={compact} />
                )}
                {m.file && (
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 ${bubble}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                      <FileText
                        className="h-[18px] w-[18px] text-leaf-deep"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">
                        {m.file.name}
                      </span>
                      <span className="text-xs opacity-75">{m.file.size}</span>
                    </span>
                  </a>
                )}
                {m.image && (
                  // Ảnh người dùng vừa chọn là object URL nên không qua next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt="Ảnh đã gửi"
                    className={`rounded-2xl border border-line object-cover ${compact ? "max-h-40 max-w-[200px]" : "max-h-64 max-w-[280px]"}`}
                  />
                )}
                {(lastOfRun || m.hearts) && (
                  <span className="mx-1.5 mt-1 flex items-center gap-1.5">
                    {m.hearts ? (
                      <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-line bg-white px-1.5 text-xs font-bold">
                        <Heart
                          className="h-3 w-3 fill-leaf-deep text-leaf-deep"
                          aria-hidden="true"
                        />
                        {m.hearts}
                        <span className="sr-only">lượt thích</span>
                      </span>
                    ) : null}
                    {lastOfRun && (
                      <span className="text-[11px] text-moss">{m.at}</span>
                    )}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {seen && <p className="mr-1.5 self-end text-[11px] text-moss">Đã xem</p>}
      {typer && (
        <p
          className={`mt-1.5 flex items-center gap-1.5 text-[13px] text-moss ${compact ? "ml-8" : "ml-[38px]"}`}
        >
          <span
            className="inline-flex gap-[3px] rounded-full bg-mist px-2.5 py-2"
            aria-hidden="true"
          >
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog"
                style={{ animationDelay: `${d * 140}ms` }}
              />
            ))}
          </span>
          {shortName(typer.handle)} đang soạn tin
        </p>
      )}
    </div>
  );
}

const sizeLabel = (b: number) =>
  b >= 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(b / 1024))} KB`;

/** Ô soạn tin: chữ, ảnh, tệp và chia sẻ dự án của bạn. */
export function Composer({
  convId,
  compact = false,
  label,
}: {
  convId: string;
  compact?: boolean;
  label: string;
}) {
  const { send } = useChat();
  const [draft, setDraft] = useState("");
  const [picker, setPicker] = useState(false);
  const imgInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const mine = useMyProjects();

  // Đổi cuộc trò chuyện thì xoá nháp và đóng bảng chọn dự án.
  const [lastConv, setLastConv] = useState(convId);
  if (lastConv !== convId) {
    setLastConv(convId);
    setDraft("");
    setPicker(false);
  }

  const ib = `flex shrink-0 items-center justify-center rounded-full text-moss transition hover:bg-mist hover:text-ink ${compact ? "h-9 w-9" : "h-10 w-10"}`;

  return (
    <form
      className={`relative flex shrink-0 items-center gap-1.5 border-t border-line ${compact ? "p-2" : "px-3 py-3 sm:px-4"}`}
      onSubmit={(e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text) return;
        send(convId, { text });
        setDraft("");
      }}
    >
      <input
        ref={imgInput}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          // Thu nhỏ ảnh rồi lưu cùng tin nhắn, tải lại trang vẫn còn.
          if (f) void compressImage(f, 1280).then((src) => send(convId, { image: src }));
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
          if (f)
            send(convId, { file: { name: f.name, size: sizeLabel(f.size) } });
          e.target.value = "";
        }}
      />
      {!compact && (
        <button
          type="button"
          className={ib}
          aria-label="Đính kèm tệp"
          onClick={() => fileInput.current?.click()}
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className={ib}
        aria-label="Gửi ảnh"
        onClick={() => imgInput.current?.click()}
      >
        <ImageIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      {!compact && (
        <button
          type="button"
          className={`${ib} ${picker ? "bg-sap text-leaf-deep" : ""}`}
          aria-label="Chia sẻ dự án"
          aria-expanded={picker}
          onClick={() => setPicker((v) => !v)}
        >
          <FolderOpen className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {picker && (
        <div className="absolute bottom-full left-3 z-10 mb-2 w-[300px] rounded-2xl border border-line bg-white p-2 shadow-[0_12px_40px_rgba(6,17,10,0.16)]">
          <p className="px-2 pb-1.5 pt-1 text-xs font-bold text-moss">
            Chia sẻ dự án của bạn
          </p>
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
              <ProjectCover
                seed={p.seed}
                tone={p.tone}
                className="h-9 w-9 shrink-0 rounded-lg"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {p.title}
                </span>
                <span className="text-xs text-moss">{p.field}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={compact ? "Aa" : "Viết tin nhắn"}
        autoComplete="off"
        className={`min-w-0 flex-1 rounded-full border border-transparent bg-mist outline-none transition focus:border-ink focus:bg-white focus-visible:outline-none ${compact ? "h-9 px-3.5 text-sm" : "h-11 px-[18px] text-[15px]"}`}
      />
      <button
        type="submit"
        aria-label="Gửi"
        disabled={!draft.trim()}
        className={`flex shrink-0 items-center justify-center rounded-full bg-leaf text-ink transition hover:brightness-95 disabled:opacity-50 ${compact ? "h-9 w-9" : "h-11 w-11"}`}
      >
        <SendHorizontal
          className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"}
          strokeWidth={2.4}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}

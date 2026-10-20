"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bell, BellOff, FileText, PanelRightClose, PanelRightOpen, Search, SquarePen, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { Composer, ConvAvatar, MessageList } from "@/components/chat/ChatParts";
import { lookOf, previewOf, useChat } from "@/components/chat/ChatProvider";
import { ME, USERS, projectOf, userOf } from "@/lib/data";
import { fold, type Conversation } from "@/lib/chat";

const FILTERS = ["Tất cả", "Cá nhân", "Nhóm", "Chưa đọc"] as const;
type Filter = (typeof FILTERS)[number];

const keep = (f: Filter, c: Conversation) =>
  f === "Tất cả" || (f === "Cá nhân" && c.kind === "direct") || (f === "Nhóm" && c.kind === "group") || (f === "Chưa đọc" && c.unread > 0);

function InfoPanel({ conv, onClose }: { conv: Conversation; onClose: () => void }) {
  const { muted, toggleMute } = useChat();
  const l = lookOf(conv);
  const isMuted = muted.includes(conv.id);
  const images = conv.messages.filter((m) => m.image);
  const files = conv.messages.filter((m) => m.file);
  const projects = [...new Set(conv.messages.flatMap((m) => (m.project ? [m.project] : [])))].map(projectOf).filter((p) => p !== undefined);

  return (
    <>
      <div className="-mt-1 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-moss">Thông tin</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Ẩn thông tin"
          title="Ẩn thông tin"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col items-center text-center">
        <ConvAvatar conv={conv} size={84} />
        <p className="mt-3 text-[17px] font-bold">{l.name}</p>
        <p className="mt-0.5 text-[13px] text-moss">{conv.kind === "group" ? l.status : (userOf(conv.with ?? "")?.headline ?? l.status)}</p>
        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
          {l.href && (
            <Link href={l.href} className="flex h-9 items-center rounded-full border border-ink px-3.5 text-[13px] font-bold hover:bg-mist">
              {l.linkLabel}
            </Link>
          )}
          <button
            type="button"
            aria-pressed={isMuted}
            onClick={() => toggleMute(conv.id)}
            className={`flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-bold ${isMuted ? "bg-mist" : "bg-white hover:bg-mist"}`}
          >
            {isMuted ? <BellOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Bell className="h-3.5 w-3.5" aria-hidden="true" />}
            {isMuted ? "Đã tắt thông báo" : "Tắt thông báo"}
          </button>
        </div>
      </div>

      {conv.kind === "group" && conv.members && (
        <>
          <h3 className="mb-2 mt-6 text-[13px] font-bold text-moss">Thành viên</h3>
          <ul className="flex flex-col gap-2">
            {conv.members.map((h, i) => {
              const u = userOf(h);
              if (!u) return null;
              return (
                <li key={h}>
                  <Link href={`/u/${h}`} className="flex items-center gap-2.5 rounded-lg hover:underline">
                    <Avatar initials={u.initials} tone={u.tone} size={32} />
                    <span className="flex-1 truncate text-sm font-semibold">{h === ME ? "Bạn" : u.name}</span>
                    {i === 0 && <span className="text-[11px] text-moss">Tạo nhóm</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h3 className="mb-2 mt-6 text-[13px] font-bold text-moss">Ảnh và file đã gửi</h3>
      {images.length === 0 && files.length === 0 ? (
        <p className="text-sm text-moss">Chưa có ảnh hay file nào.</p>
      ) : (
        <>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.image} alt="Ảnh đã gửi" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
          <ul className="mt-1.5 flex flex-col gap-1">
            {files.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-xl p-1.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sap">
                  <FileText className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{m.file!.name}</span>
                  <span className="text-xs text-moss">{m.file!.size}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {projects.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 text-[13px] font-bold text-moss">Dự án được nhắc tới</h3>
          <ul className="flex flex-col gap-1.5">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={`/p/${p.slug}`} className="flex items-center gap-2.5 rounded-xl bg-mist p-2 hover:bg-sap">
                  <ProjectCover seed={p.seed} tone={p.tone} className="h-9 w-9 shrink-0 overflow-hidden rounded-lg" />
                  <span className="min-w-0 truncate text-sm font-bold">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function NewChat({ onPick, onClose }: { onPick: (handle: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const people = USERS.filter((u) => u.handle !== ME && fold(u.name + " " + u.headline).includes(fold(q.trim())));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="new-chat-title" className="font-display text-xl font-bold">
            Tin nhắn mới
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist">
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-mist px-3.5">
          <Search className="h-4 w-4 text-moss" aria-hidden="true" />
          <span className="sr-only">Tìm người</span>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc ngành" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <ul className="mt-2 max-h-[50vh] overflow-y-auto">
          {people.map((u) => (
            <li key={u.handle}>
              <button type="button" onClick={() => onPick(u.handle)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-mist">
                <Avatar initials={u.initials} tone={u.tone} size={40} />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{u.name}</span>
                  <span className="block truncate text-xs text-moss">{u.headline}</span>
                </span>
              </button>
            </li>
          ))}
          {people.length === 0 && <li className="p-3 text-sm text-moss">Không tìm thấy ai.</li>}
        </ul>
      </div>
    </div>
  );
}

/** Hộp thư 3 cột: danh sách, cuộc trò chuyện, thông tin. Điện thoại thì xem từng cột một. */
export function Inbox() {
  const { convs, convOf, active, setActive, markRead, muted, startDirect } = useChat();
  const [filter, setFilter] = useState<Filter>("Tất cả");
  const [q, setQ] = useState("");
  // Cột thông tin bên phải ẩn sẵn, bấm nút ở đầu khung chat để mở.
  const [info, setInfo] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [creating, setCreating] = useState(false);

  const conv = convOf(active) ?? convs[0];

  useEffect(() => {
    markRead(conv.id);
  }, [conv.id, conv.unread, markRead]);

  const list = useMemo(() => {
    const term = fold(q.trim());
    return convs.filter((c) => keep(filter, c) && (!term || fold(lookOf(c).name).includes(term)));
  }, [convs, filter, q]);

  const open = (id: string) => {
    setActive(id);
    setMobileChat(true);
  };

  const l = lookOf(conv);
  const infoClass = info ? "flex" : "hidden";

  return (
    // Phủ kín màn hình dưới thanh trên cùng; điện thoại chừa chỗ cho thanh tab ở đáy.
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] top-16 z-20 flex overflow-hidden bg-white md:bottom-0">
      <section
        aria-label="Cuộc trò chuyện"
        className={`${mobileChat ? "hidden" : "flex"} w-full min-w-0 flex-col border-line md:flex md:w-[300px] md:shrink-0 md:border-r lg:w-[340px] 2xl:w-[380px]`}
      >
        <div className="flex items-center justify-between px-[18px] pb-2.5 pt-[18px]">
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Tin nhắn</h1>
          <button
            type="button"
            onClick={() => setCreating(true)}
            aria-label="Tạo cuộc trò chuyện"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-mist hover:bg-line"
          >
            <SquarePen className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
        <label className="mx-[18px] flex h-10 items-center gap-2 rounded-full bg-mist px-3.5">
          <Search className="h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
          <span className="sr-only">Tìm tin nhắn</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm người hoặc nhóm" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div role="tablist" aria-label="Lọc cuộc trò chuyện" className="no-scrollbar flex gap-1.5 overflow-x-auto px-[18px] pb-2 pt-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`h-8 shrink-0 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
                filter === f ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mist"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-1">
          {list.map((c) => {
            const cl = lookOf(c);
            const on = c.id === conv.id;
            const unread = c.unread > 0 && !on;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  aria-current={on ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${on ? "bg-sap" : "hover:bg-mist"}`}
                >
                  <ConvAvatar conv={c} size={48} ring={on ? "ring-sap" : "ring-white"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`flex min-w-0 items-center gap-1 text-[15px] ${unread ? "font-bold" : "font-semibold"}`}>
                        <span className="truncate">{cl.name}</span>
                        {muted.includes(c.id) && <BellOff className="h-3.5 w-3.5 shrink-0 text-moss" aria-label="Đã tắt thông báo" />}
                      </span>
                      <span className={`shrink-0 text-xs ${unread ? "font-bold text-leaf-deep" : "text-moss"}`}>{c.when}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`truncate text-[13px] ${unread ? "font-bold text-ink" : "text-moss"}`}>{previewOf(c)}</span>
                      {unread && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-leaf-deep px-1.5 text-[11px] font-bold text-white">
                          {c.unread}
                          <span className="sr-only"> tin chưa đọc</span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-moss">Không có cuộc trò chuyện nào.</li>}
        </ul>
      </section>

      <section aria-label={`Trò chuyện với ${l.name}`} className={`${mobileChat ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-line px-3 sm:px-[18px]">
          <button
            type="button"
            onClick={() => setMobileChat(false)}
            aria-label="Quay lại danh sách"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-mist md:hidden"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <ConvAvatar conv={conv} size={42} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold">{l.name}</span>
            <span className={`block truncate text-[13px] ${l.online ? "text-leaf-deep" : "text-moss"}`}>{l.status}</span>
          </span>
          <button
            type="button"
            onClick={() => setInfo((v) => !v)}
            aria-label={info ? "Ẩn thông tin" : "Hiện thông tin"}
            title={info ? "Ẩn thông tin" : "Hiện thông tin"}
            aria-expanded={info}
            aria-controls="thong-tin-tro-chuyen"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${info ? "bg-sap text-leaf-deep" : "hover:bg-mist"}`}
          >
            {info ? <PanelRightClose className="h-5 w-5" aria-hidden="true" /> : <PanelRightOpen className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <MessageList conv={conv} />
        <Composer convId={conv.id} label={`Tin nhắn cho ${l.name}`} />
      </section>

      <aside
        id="thong-tin-tro-chuyen"
        aria-label="Thông tin cuộc trò chuyện"
        className={`${infoClass} absolute inset-y-0 right-0 z-10 w-[300px] max-w-full 2xl:w-[340px] flex-col overflow-y-auto border-l border-line bg-white px-[18px] py-5 shadow-[-12px_0_40px_rgba(6,17,10,0.12)] lg:static lg:shrink-0 lg:shadow-none`}
      >
        <InfoPanel conv={conv} onClose={() => setInfo(false)} />
      </aside>

      {creating && (
        <NewChat
          onClose={() => setCreating(false)}
          onPick={(h) => {
            open(startDirect(h));
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

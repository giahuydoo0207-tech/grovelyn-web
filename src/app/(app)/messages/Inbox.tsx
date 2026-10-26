"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bell, BellOff, FileText, FolderOpen, PanelRight, Pin, PinOff, Search, SquarePen, User, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ProjectCover } from "@/components/ProjectCover";
import { Composer, ConvAvatar, Lightbox, MessageList, PinnedBar, jumpTo, snippetOf } from "@/components/chat/ChatParts";
import { lookOf, previewOf, useChat } from "@/components/chat/ChatProvider";
import { ME, ONLINE, USERS, projectOf, userOf } from "@/lib/data";
import { EVENTS } from "@/lib/events";
import { useLook } from "@/lib/look";
import { fold, imagesOf, type Conversation } from "@/lib/chat";

const FILTERS = ["Tất cả", "Cá nhân", "Nhóm", "Chưa đọc"] as const;
type Filter = (typeof FILTERS)[number];

const keep = (f: Filter, c: Conversation) =>
  f === "Tất cả" || (f === "Cá nhân" && c.kind === "direct") || (f === "Nhóm" && c.kind === "group") || (f === "Chưa đọc" && c.unread > 0);

const SCOPE = "trang";

/** Dòng trạng thái dưới tên ở đầu khung chat. */
function statusLine(c: Conversation) {
  if (c.kind !== "group") return lookOf(c).status;
  const members = c.members ?? [];
  const on = members.filter((h) => h === ME || ONLINE.includes(h)).length;
  return `${members.length} thành viên · ${on} đang hoạt động`;
}

function SideHead({ title, more }: { title: string; more?: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-[0.06em] text-moss">
      {title}
      {more !== undefined && <span className="normal-case tracking-normal text-leaf-deep">{more}</span>}
    </h3>
  );
}

function RoundAction({ label, icon: Icon, onClick, href, on }: { label: string; icon: typeof Bell; onClick?: () => void; href?: string; on?: boolean }) {
  const inner = (
    <>
      <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${on ? "bg-sap text-leaf-deep" : "bg-mist group-hover:bg-line"}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      {label}
    </>
  );
  const cls = "group flex w-[68px] flex-col items-center gap-1 text-center text-xs font-bold";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-pressed={on} className={cls}>
      {inner}
    </button>
  );
}

function MemberRow({ handle }: { handle: string }) {
  const u = userOf(handle);
  const look = useLook(handle);
  if (!u) return null;
  const sub = look.status !== "Không hiện" ? look.status : ONLINE.includes(handle) || handle === ME ? "Đang hoạt động" : u.headline;
  return (
    <li>
      <Link href={`/u/${handle}`} className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-mist">
        <span className="relative">
          <Avatar initials={u.initials} tone={u.tone} handle={handle} size={34} />
          {(ONLINE.includes(handle) || handle === ME) && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-leaf ring-2 ring-white" aria-hidden="true" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-bold">{handle === ME ? `${u.name.split(" ").slice(-2).join(" ")} (bạn)` : u.name}</span>
          <span className="block truncate text-xs text-moss">{sub}</span>
        </span>
      </Link>
    </li>
  );
}

function InfoPanel({ conv, onClose }: { conv: Conversation; onClose: () => void }) {
  const { muted, toggleMute, togglePinConv } = useChat();
  const [view, setView] = useState<number | null>(null);
  const l = lookOf(conv);
  const group = conv.kind === "group";
  const isMuted = muted.includes(conv.id);
  const pins = conv.messages.filter((m) => m.pinned);
  const images = conv.messages.flatMap(imagesOf);
  const files = conv.messages.filter((m) => m.file);
  const project = conv.project ? projectOf(conv.project) : undefined;
  const shared = [...new Set(conv.messages.flatMap((m) => (m.project ? [m.project] : [])))].filter((s) => s !== conv.project).map(projectOf).filter((p) => p !== undefined);
  const event = conv.event ? EVENTS.find((e) => e.slug === conv.event) : undefined;
  // Ảnh mới nhất trước; ô cuối ghi số ảnh còn lại.
  const newest = [...images].reverse();
  const shown = newest.slice(0, 6);
  const hidden = images.length - shown.length;

  return (
    <>
      <div className="flex justify-end xl:hidden">
        <button type="button" onClick={onClose} aria-label="Ẩn thông tin" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist">
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col items-center text-center">
        {group ? <ConvAvatar conv={conv} size={84} /> : <Avatar initials={l.initials} tone={l.tone} handle={l.handle} size={116} />}
        <p className="mt-3 font-display text-[19px] font-bold leading-tight">{l.name}</p>
        <p className="mt-1 text-[13px] text-moss">{group ? (conv.about ?? l.status) : (userOf(conv.with ?? "")?.headline ?? l.status)}</p>
        <div className="mt-3.5 flex justify-center gap-1">
          {group ? (
            project && <RoundAction label="Dự án" icon={FolderOpen} href={`/p/${project.slug}`} />
          ) : (
            l.href && <RoundAction label="Hồ sơ" icon={User} href={l.href} />
          )}
          <RoundAction label={isMuted ? "Bật báo" : "Tắt báo"} icon={isMuted ? BellOff : Bell} on={isMuted} onClick={() => toggleMute(conv.id)} />
          <RoundAction label={conv.pinned ? "Bỏ ghim" : "Ghim chat"} icon={conv.pinned ? PinOff : Pin} on={conv.pinned} onClick={() => togglePinConv(conv.id)} />
        </div>
      </div>
      <div className="mt-4 h-px bg-line" />

      {group && project && (
        <>
          <SideHead title="Dự án" more={<Link href={`/p/${project.slug}`}>Mở</Link>} />
          {/* Dải phiên bản: cũ bên trái, mới nhất tô xanh bên phải. */}
          <Link href={`/p/${project.slug}`} className="block rounded-2xl bg-mist p-3 hover:bg-sap">
            <span className="block text-sm font-bold">{project.title}</span>
            <span className="mt-2.5 flex items-center gap-1.5" aria-label={`${project.versions.length} phiên bản`}>
              {[...project.versions.slice(0, 4)].reverse().map((v, i, arr) => {
                const lastOne = i === arr.length - 1;
                return (
                  <span key={v.tag} className={`flex items-center gap-1.5 ${lastOne ? "" : "flex-1"}`}>
                    <span className={`flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${lastOne ? "h-[26px] min-w-[26px] bg-leaf px-1 text-ink" : "h-5 min-w-5 bg-ink px-1 text-white"}`}>{v.tag}</span>
                    {!lastOne && <span className="h-0.5 flex-1 bg-ink" />}
                  </span>
                );
              })}
            </span>
          </Link>
        </>
      )}

      {group && conv.members && (
        <>
          <SideHead title="Thành viên" more={conv.members.length} />
          <ul className="flex flex-col gap-0.5">
            {conv.members.map((h) => (
              <MemberRow key={h} handle={h} />
            ))}
          </ul>
        </>
      )}

      {pins.length > 0 && (
        <>
          <SideHead title="Tin đã ghim" more={pins.length} />
          <ul className="flex flex-col gap-1.5">
            {pins.map((m) => {
              const u = userOf(m.from);
              return (
                <li key={m.id}>
                  <button type="button" onClick={() => jumpTo(SCOPE, conv.id, m.id)} className="flex w-full items-center gap-2 rounded-xl bg-pin px-2.5 py-2 text-left hover:brightness-[0.98]">
                    {u && <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={22} />}
                    <span className="min-w-0 truncate text-[13px]">{snippetOf(m)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <SideHead title={group ? "Ảnh" : "Ảnh và tệp"} more={images.length ? images.length : undefined} />
      {images.length === 0 && (group || files.length === 0) ? (
        <p className="text-sm text-moss">Chưa có ảnh{group ? "" : " hay tệp"} nào.</p>
      ) : (
        images.length > 0 && (
          <div className={`grid gap-1.5 ${group ? "grid-cols-4" : "grid-cols-3"}`}>
            {shown.map((src, k) => (
              <button key={k} type="button" onClick={() => setView(images.length - 1 - k)} aria-label={`Xem ảnh ${k + 1}`} className="relative aspect-square overflow-hidden rounded-[10px] bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {k === shown.length - 1 && hidden > 0 && <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-sm font-bold text-white">+{hidden}</span>}
              </button>
            ))}
          </div>
        )
      )}

      {(group ? files.length > 0 : files.length > 0) && (
        <>
          {group && <SideHead title="Tệp đã gửi" more={files.length} />}
          <ul className={`flex flex-col gap-1.5 ${group ? "" : "mt-2"}`}>
            {files.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-xl border border-line px-2.5 py-2">
                <FileText className="h-[17px] w-[17px] shrink-0 text-leaf-deep" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{m.file!.name}</span>
                <span className="shrink-0 text-xs text-moss">{m.file!.size}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {shared.length > 0 && (
        <>
          <SideHead title={group ? "Dự án được nhắc tới" : "Dự án chung"} />
          <ul className="flex flex-col gap-1.5">
            {shared.map((p) => (
              <li key={p.slug}>
                <Link href={`/p/${p.slug}`} className="flex items-center gap-2.5 rounded-xl bg-mist p-2 hover:bg-sap">
                  <ProjectCover seed={p.seed} tone={p.tone} className="h-9 w-9 shrink-0 overflow-hidden rounded-lg" />
                  <span className="min-w-0 truncate text-[13.5px] font-bold">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {event && (
        <>
          <SideHead title="Sắp tới" />
          <Link href={`/events/${event.slug}`} className="flex items-center gap-2.5 rounded-xl border border-line p-2.5 hover:bg-mist">
            <span className="flex h-11 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-ink font-display text-base font-bold leading-none text-white">
              {Number(event.date.slice(8))}
              <span className="mt-0.5 text-[9px] text-leaf">thg {Number(event.date.slice(5, 7))}</span>
            </span>
            <span className="min-w-0 text-[13px]">
              <span className="line-clamp-2 font-bold leading-snug">{event.title}</span>
              <span className="text-moss">
                {event.from} · {group ? "Cả nhóm quan tâm" : "Cả hai cùng quan tâm"}
              </span>
            </span>
          </Link>
        </>
      )}
      {view !== null && <Lightbox srcs={images} start={view} onClose={() => setView(null)} />}
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
      <div role="dialog" aria-modal="true" aria-labelledby="new-chat-title" className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={40} />
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

function ConvRow({ c, on, onOpen }: { c: Conversation; on: boolean; onOpen: () => void }) {
  const { muted } = useChat();
  const cl = lookOf(c);
  const unread = c.unread > 0 && !on;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-current={on ? "true" : undefined}
        className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${on ? "bg-white ring-2 ring-leaf" : "hover:bg-white"}`}
      >
        <ConvAvatar conv={c} size={48} ring="ring-white" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={`flex min-w-0 items-center gap-1 text-base ${unread ? "font-bold" : "font-semibold"}`}>
              <span className="truncate">{cl.name}</span>
              {muted.includes(c.id) && <BellOff className="h-3.5 w-3.5 shrink-0 text-moss" aria-label="Đã tắt thông báo" />}
            </span>
            <span className={`shrink-0 text-xs ${unread ? "font-bold text-leaf-deep" : "text-moss"}`}>{c.when}</span>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className={`truncate text-[14px] ${unread ? "font-bold text-ink" : "text-moss"}`}>{previewOf(c)}</span>
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
}

/** Hộp thư 3 cột: danh sách (ghim và gần đây), cuộc trò chuyện, thông tin. Điện thoại thì xem từng cột một. */
export function Inbox() {
  const { convs, convOf, active, setActive, markRead, muted, toggleMute, startDirect } = useChat();
  const [filter, setFilter] = useState<Filter>("Tất cả");
  const [q, setQ] = useState("");
  // null: tự theo màn hình (màn rộng mở sẵn cột thông tin, màn hẹp ẩn).
  const [info, setInfo] = useState<boolean | null>(null);
  const [mobileChat, setMobileChat] = useState(false);
  const [creating, setCreating] = useState(false);
  const [reply, setReply] = useState<{ conv: string; msg: string } | null>(null);

  const conv = convOf(active) ?? convs[0];

  useEffect(() => {
    markRead(conv.id);
  }, [conv.id, conv.unread, markRead]);

  const list = useMemo(() => {
    const term = fold(q.trim());
    return convs.filter((c) => keep(filter, c) && (!term || fold(lookOf(c).name).includes(term)));
  }, [convs, filter, q]);
  const pinned = list.filter((c) => c.pinned);
  const recent = list.filter((c) => !c.pinned);

  const open = (id: string) => {
    setActive(id);
    setMobileChat(true);
  };

  const l = lookOf(conv);
  const infoClass = info === null ? "hidden xl:flex" : info ? "flex" : "hidden";
  const toggleInfo = () => setInfo((v) => (v === null ? !window.matchMedia("(min-width: 1280px)").matches : !v));
  const infoOpen = info ?? false;
  const replyTo = reply?.conv === conv.id ? conv.messages.find((m) => m.id === reply.msg) : undefined;
  const isMuted = muted.includes(conv.id);
  const head = (t: string, icon?: boolean) => (
    <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-moss">
      {icon && <Pin className="h-3 w-3" aria-hidden="true" />}
      {t}
    </p>
  );

  return (
    // Phủ kín màn hình dưới thanh trên cùng; điện thoại chừa chỗ cho thanh tab ở đáy.
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] top-16 z-20 flex overflow-hidden bg-white md:bottom-0 md:left-24">
      <section
        aria-label="Cuộc trò chuyện"
        className={`${mobileChat ? "hidden" : "flex"} w-full min-w-0 flex-col border-line bg-mist md:flex md:w-[300px] md:shrink-0 md:border-r lg:w-[340px]`}
      >
        <div className="flex items-center justify-between px-[18px] pb-3 pt-[18px]">
          <h1 className="font-display text-[26px] font-bold tracking-[-0.03em]">Tin nhắn</h1>
          <button type="button" onClick={() => setCreating(true)} aria-label="Tạo cuộc trò chuyện" title="Tin nhắn mới" className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white hover:bg-ink-2">
            <SquarePen className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
        <label className="mx-3 flex h-[42px] items-center gap-2.5 rounded-xl border border-line bg-white px-3.5">
          <Search className="h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
          <span className="sr-only">Tìm tin nhắn</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm người hoặc nhóm" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-moss" />
        </label>
        <div role="tablist" aria-label="Lọc cuộc trò chuyện" className="mx-3 mt-3 flex gap-1 rounded-xl bg-[#e6ebe2] p-1">
          {FILTERS.map((f) => {
            const n = f === "Chưa đọc" ? convs.filter((c) => c.unread > 0 && c.id !== conv.id).length : 0;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`h-8 flex-1 whitespace-nowrap rounded-[9px] text-[13px] font-bold transition-colors ${filter === f ? "bg-white shadow-[0_1px_2px_rgba(6,17,10,0.1)]" : "text-moss hover:text-ink"}`}
              >
                {f}
                {n > 0 && ` ${n}`}
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-2">
          {pinned.length > 0 && (
            <>
              {head("Đã ghim", true)}
              <ul className="flex flex-col gap-0.5">
                {pinned.map((c) => (
                  <ConvRow key={c.id} c={c} on={c.id === conv.id} onOpen={() => open(c.id)} />
                ))}
              </ul>
            </>
          )}
          {recent.length > 0 && (
            <>
              {pinned.length > 0 && head("Gần đây")}
              <ul className="flex flex-col gap-0.5">
                {recent.map((c) => (
                  <ConvRow key={c.id} c={c} on={c.id === conv.id} onOpen={() => open(c.id)} />
                ))}
              </ul>
            </>
          )}
          {list.length === 0 && <p className="px-3 py-6 text-center text-sm text-moss">Không có cuộc trò chuyện nào.</p>}
        </div>
      </section>

      <section aria-label={`Trò chuyện với ${l.name}`} className={`${mobileChat ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-line px-3 sm:px-6">
          <button type="button" onClick={() => setMobileChat(false)} aria-label="Quay lại danh sách" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-mist md:hidden">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <ConvAvatar conv={conv} size={44} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lg font-bold">{l.name}</span>
            <span className={`block truncate text-sm ${l.online ? "font-semibold text-leaf-deep" : "text-moss"}`}>{statusLine(conv)}</span>
          </span>
          <button
            type="button"
            onClick={() => toggleMute(conv.id)}
            aria-pressed={isMuted}
            aria-label={isMuted ? "Bật thông báo" : "Tắt thông báo"}
            title={isMuted ? "Bật thông báo" : "Tắt thông báo"}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isMuted ? "bg-mist text-ink" : "text-moss hover:bg-mist hover:text-ink"}`}
          >
            {isMuted ? <BellOff className="h-[19px] w-[19px]" aria-hidden="true" /> : <Bell className="h-[19px] w-[19px]" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={toggleInfo}
            aria-label="Thông tin cuộc trò chuyện"
            title="Thông tin"
            aria-expanded={info ?? undefined}
            aria-controls="thong-tin-tro-chuyen"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              info === null ? "text-moss hover:bg-mist xl:bg-ink xl:text-white xl:hover:bg-ink-2" : infoOpen ? "bg-ink text-white hover:bg-ink-2" : "text-moss hover:bg-mist hover:text-ink"
            }`}
          >
            <PanelRight className="h-[19px] w-[19px]" aria-hidden="true" />
          </button>
        </div>
        <PinnedBar key={conv.id} conv={conv} scope={SCOPE} />
        <MessageList conv={conv} scope={SCOPE} onReply={(msg) => setReply({ conv: conv.id, msg })} />
        <Composer
          convId={conv.id}
          label={`Tin nhắn cho ${l.name}`}
          placeholder={conv.kind === "group" ? `Nhắn vào ${l.name}…` : `Nhắn cho ${l.name.split(" ").slice(-2).join(" ")}…`}
          replyTo={replyTo}
          onCancelReply={() => setReply(null)}
        />
      </section>

      <aside
        id="thong-tin-tro-chuyen"
        aria-label="Thông tin cuộc trò chuyện"
        className={`${infoClass} no-scrollbar absolute inset-y-0 right-0 z-10 w-[320px] max-w-full flex-col overflow-y-auto border-l border-line bg-white px-[18px] py-5 shadow-[-12px_0_40px_rgba(6,17,10,0.12)] xl:static xl:shrink-0 xl:shadow-none`}
      >
        <InfoPanel key={conv.id} conv={conv} onClose={() => setInfo(false)} />
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

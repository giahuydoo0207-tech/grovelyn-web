/* eslint-disable @next/next/no-img-element -- ảnh bìa có thể là data URL vừa cắt ở trang tạo sự kiện */

import Link from "next/link";
import { CalendarDays, Globe2, MapPin, Ticket } from "lucide-react";
import { userOf } from "@/lib/data";
import { dateParts, type CommunityEvent } from "@/lib/events";
import { ProjectCover } from "@/components/ProjectCover";
import { Avatar } from "@/components/Avatar";
import { RegisterForm } from "./RegisterForm";
import { SpeakerTabs } from "./SpeakerTabs";
import { CopyAddress } from "./CopyAddress";

/** Tên sự kiện với cụm `accent` tô xanh, nếu cụm đó có trong tên. */
function Title({ title, accent }: { title: string; accent?: string }) {
  const at = accent ? title.toLowerCase().indexOf(accent.toLowerCase()) : -1;
  if (!accent || at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-leaf-deep">{title.slice(at, at + accent.length)}</span>
      {title.slice(at + accent.length)}
    </>
  );
}

export function DateBadge({ iso, size = "lg" }: { iso: string; size?: "sm" | "lg" }) {
  const d = dateParts(iso);
  const lg = size === "lg";
  return (
    <span
      className={`block overflow-hidden bg-white text-center ${lg ? "w-[84px] rounded-2xl shadow-[0_0_0_5px_#f2f5ef,0_6px_16px_rgba(6,17,10,0.18)]" : "w-12 rounded-xl shadow-[0_2px_8px_rgba(6,17,10,0.2)]"}`}
      aria-hidden="true"
    >
      <span className={`block bg-ink font-bold text-leaf ${lg ? "py-1 text-[15px]" : "py-0.5 text-[11px]"}`}>{d.tag}</span>
      <span className={`block font-display font-bold ${lg ? "pb-2 pt-1 text-[38px] leading-none" : "pb-1 pt-0.5 text-xl leading-none"}`}>{d.day}</span>
    </span>
  );
}

export function EventCoverImage({ event, className = "" }: { event: Pick<CommunityEvent, "cover" | "coverSeed" | "coverTone">; className?: string }) {
  return event.cover ? (
    <img src={event.cover} alt="" className={`h-full w-full object-cover ${className}`} />
  ) : (
    <ProjectCover seed={event.coverSeed} tone={event.coverTone} className={`h-full w-full ${className}`} />
  );
}

/**
 * Trang chi tiết sự kiện (bản 4C): ảnh bìa và ô ngày, nội dung cạnh khung đăng ký, speaker, lịch trình, địa điểm.
 * Dùng chung cho trang thật và phần xem trước ở trang tạo sự kiện.
 */
export function EventView({ event, preview = false }: { event: CommunityEvent; preview?: boolean }) {
  const d = dateParts(event.date);
  const host = userOf(event.host);
  const onSite = event.mode !== "Trực tuyến" && event.venue;
  const speakerName = (id: string) => event.speakers.find((s) => s.id === id)?.name;

  const facts = [
    { icon: CalendarDays, k: "Thời gian", v: `${d.long}, ${event.from} đến ${event.to}` },
    { icon: MapPin, k: "Địa điểm", v: onSite ? `${event.venue!.name}${event.mode === "Kết hợp" ? ", có phát trực tuyến" : ""}` : "Trực tuyến, link gửi khi đăng ký" },
    { icon: Globe2, k: "Ngôn ngữ", v: event.language },
    { icon: Ticket, k: "Phí", v: event.fee },
  ];

  return (
    <article className="mx-auto max-w-[1180px]">
      <div className="-mt-6 aspect-[2/1] max-h-[480px] w-full overflow-hidden rounded-b-2xl bg-ink">
        <EventCoverImage event={event} />
      </div>

      <section aria-label="Thông tin và đăng ký" className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="sm:px-2">
          <div className="-mt-12">
            <DateBadge iso={event.date} />
          </div>
          {event.group && <p className="mt-6 text-[15px] font-bold text-leaf-deep">Nhóm {event.group.name}, buổi gặp {d.monthName}</p>}
          <h1 className="mt-2.5 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
            <Title title={event.title || "Chưa đặt tên sự kiện"} accent={event.accent} />
          </h1>
          {event.description && <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-[#3d4a38]">{event.description}</p>}

          <div className="mt-6 border-t border-[#dfe5da] pt-5">
            <p className="text-[13px] font-bold text-moss">Tổ chức bởi</p>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {event.group && (
                <span className="flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-3.5 text-sm font-bold">
                  <Avatar initials={event.group.mark} tone={event.group.tone} size={28} square />
                  {event.group.name}
                </span>
              )}
              {host && (
                <Link href={`/u/${host.handle}`} className="flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-3.5 text-sm font-bold hover:bg-mist">
                  <Avatar initials={host.initials} tone={host.tone} size={28} />
                  {host.name}
                </Link>
              )}
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-3.5">
            {facts.map(({ icon: Icon, k, v }) => (
              <li key={k} className="flex items-center gap-3 text-base font-semibold">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sap">
                  <Icon className="h-[18px] w-[18px] text-leaf-deep" aria-hidden="true" />
                </span>
                <span>
                  <span className="font-medium text-moss">{k}</span> {v}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <RegisterForm event={event} preview={preview} />
      </section>

      {event.speakers.length > 0 && <SpeakerTabs speakers={event.speakers} />}

      {event.agenda.length > 0 && (
        <section aria-labelledby="agenda-h" className="mt-20">
          <h2 id="agenda-h" className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.035em]">
            Lịch trình
          </h2>
          <ol className="mt-6">
            {event.agenda.map((a, i) => {
              const who = a.speakers.map(speakerName).filter(Boolean).join(", ");
              const main = a.kind === "Chia sẻ chính" || a.kind === "Chủ đề";
              return (
                <li key={a.id} className="grid grid-cols-[64px_20px_minmax(0,1fr)] gap-3 sm:grid-cols-[112px_28px_minmax(0,1fr)] sm:gap-4">
                  <span className="pt-5 text-right">
                    <span className="block text-[17px] font-bold tabular-nums">{a.from}</span>
                    <span className="text-[13px] tabular-nums text-moss">đến {a.to}</span>
                  </span>
                  <span className="flex flex-col items-center" aria-hidden="true">
                    <span className={`h-[26px] w-0.5 ${i === 0 ? "bg-transparent" : "bg-[#d6ddd1]"}`} />
                    <span className={`h-4 w-4 shrink-0 rounded-full ring-[5px] ring-mist ${main ? "bg-leaf-deep" : a.kind === "Thảo luận" ? "bg-leaf" : a.kind === "Mở đầu" ? "bg-ink" : "bg-fog"}`} />
                    <span className={`w-0.5 flex-1 ${i === event.agenda.length - 1 ? "bg-transparent" : "bg-[#d6ddd1]"}`} />
                  </span>
                  <div className="mb-3.5 rounded-2xl border border-line bg-white px-5 py-4 sm:px-6">
                    <p className="text-xs font-bold text-leaf-deep">{a.kind}</p>
                    <h3 className="mt-1 text-lg font-bold leading-snug sm:text-xl">{a.title || "Chưa đặt tiêu đề"}</h3>
                    {who && (
                      <p className="mt-1.5 text-sm text-moss">
                        Speaker: <strong className="text-leaf-deep">{who}</strong>
                      </p>
                    )}
                    {a.note && <p className="mt-2.5 border-t border-[#edf1ea] pt-2.5 leading-relaxed text-[#3d4a38]">{a.note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {onSite && (
        <section aria-labelledby="venue-h" className="mt-20">
          <h2 id="venue-h" className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.035em]">
            Địa điểm
          </h2>
          <div className={`mt-6 grid items-center gap-8 ${event.venue!.photos.length ? "lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]" : ""}`}>
            <div>
              <h3 className="text-2xl font-bold">{event.venue!.name}</h3>
              <p className="mt-1.5 leading-relaxed">{event.venue!.address}</p>
              {event.venue!.directions && <p className="mt-3 text-sm leading-relaxed text-moss">{event.venue!.directions}</p>}
              <CopyAddress text={`${event.venue!.name}, ${event.venue!.address}`} />
            </div>
            {event.venue!.photos.length > 0 && (
              <ul aria-label="Ảnh địa điểm do người tổ chức đăng" className="grid grid-cols-2 items-start gap-3.5 sm:grid-cols-4">
                {event.venue!.photos.map((p, k) => (
                  <li key={p.src} className={k % 2 ? "sm:mt-5" : ""}>
                    <img src={p.src} alt={p.alt} className="aspect-[3/4] w-full rounded-2xl object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {preview && (
        <p className="mt-10 text-center text-sm text-moss">
          Đây là bản xem trước. Người khác chỉ thấy trang này sau khi bạn đăng.
        </p>
      )}
    </article>
  );
}

import type { CommunityEvent } from "./events";
import { placeLine } from "./events";

/** Tạo tệp .ics để người dùng thêm sự kiện vào lịch (Google, Apple, Outlook đều đọc được). */
export function eventIcs(e: Pick<CommunityEvent, "slug" | "title" | "description" | "date" | "from" | "to" | "mode" | "venue">) {
  const day = e.date.replaceAll("-", "");
  const t = (hhmm: string) => `${day}T${hhmm.replace(":", "")}00`;
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);
  const where = e.venue && e.mode !== "Trực tuyến" ? `${e.venue.name}, ${e.venue.address}` : placeLine(e);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grovelyn//Su kien//VI",
    "BEGIN:VEVENT",
    `UID:${e.slug}@grovelyn`,
    `DTSTART;TZID=Asia/Ho_Chi_Minh:${t(e.from)}`,
    `DTEND;TZID=Asia/Ho_Chi_Minh:${t(e.to)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(where)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(e: Parameters<typeof eventIcs>[0]) {
  const blob = new Blob([eventIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.slug || "su-kien"}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

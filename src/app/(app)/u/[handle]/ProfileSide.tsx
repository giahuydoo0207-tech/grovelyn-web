import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LENS_HINT, type User } from "@/lib/data";
import { GARDEN, lensColor } from "@/lib/palette";

const box = "rounded-2xl border border-line bg-white p-5";

/** Cột phải của hồ sơ: đang làm gì, góp ý được về gì, kỹ năng, liên kết. Mỗi khối một màu điểm nhấn nhỏ. */
export function ProfileSide({ user, isMe }: { user: User; isMe: boolean }) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
      <section className={box}>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: GARDEN.leaf.solid }} aria-hidden="true" />
          Đang làm gì
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink/85">{user.about}</p>
      </section>

      {user.lenses.length > 0 && (
        <section className={box}>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GARDEN.sky.solid }} aria-hidden="true" />
            Mình có thể góp ý về
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {user.lenses.map((l) => {
              const c = lensColor(l);
              return (
                <li key={l} className="rounded-xl px-3.5 py-2.5" style={{ background: c.bg }}>
                  <span className="block text-[15px] font-bold" style={{ color: c.fg }}>
                    {l}
                  </span>
                  <span className="block text-[13px] text-ink/70">{LENS_HINT[l]}</span>
                </li>
              );
            })}
          </ul>
          <Link href="/exchange" className="mt-3 inline-block text-sm font-semibold text-leaf-deep hover:underline">
            Xem trao đổi đang cần góc nhìn này
          </Link>
        </section>
      )}

      {user.skills.length > 0 && (
        <section className={box}>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GARDEN.sun.solid }} aria-hidden="true" />
            Công cụ và kỹ năng
          </h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {user.skills.map((s) => (
              <li key={s} className="rounded-lg bg-mist px-2.5 py-1 text-[13px] font-semibold">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(user.links?.length || isMe) && (
        <section className={box}>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GARDEN.clay.solid }} aria-hidden="true" />
            Liên kết
          </h2>
          {user.links?.length ? (
            <ul className="mt-2.5 flex flex-col">
              {user.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border-t border-line py-2.5 text-[15px] font-semibold first:border-t-0 hover:text-leaf-deep">
                    <span className="min-w-0">
                      {l.label}
                      <span className="block truncate text-[13px] font-normal text-moss">{l.url.replace(/^https?:\/\//, "")}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-moss">Thêm website hoặc hồ sơ ở nơi khác để người xem tìm hiểu thêm về bạn.</p>
          )}
        </section>
      )}
    </aside>
  );
}

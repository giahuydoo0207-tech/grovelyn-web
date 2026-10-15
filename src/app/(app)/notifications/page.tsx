import type { Metadata } from "next";
import Link from "next/link";
import { NOTICES, userOf } from "@/lib/data";
import { Avatar } from "@/components/Avatar";

export const metadata: Metadata = { title: "Thông báo" };

export default function NotificationsPage() {
  const unread = NOTICES.filter((n) => n.unread);
  const read = NOTICES.filter((n) => !n.unread);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.2rem)] font-bold leading-none tracking-[-0.045em]">Thông báo</h1>
      {[
        { title: "Mới", items: unread },
        { title: "Trước đó", items: read },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <section key={group.title} className="mt-8">
              <h2 className="text-sm font-semibold text-moss">{group.title}</h2>
              <ul className="mt-3 flex flex-col">
                {group.items.map((n) => {
                  const u = userOf(n.actor)!;
                  return (
                    <li key={n.id}>
                      <Link href={n.href} className={`flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-mist ${n.unread ? "bg-sap/35" : ""}`}>
                        <Avatar initials={u.initials} tone={u.tone} size={44} />
                        <p className="flex-1 text-[15px] leading-relaxed">
                          <strong>{u.name}</strong>
                          {n.others ? ` và ${n.others} người khác` : ""} {n.text}
                          <span className="block text-sm text-moss">{n.when}</span>
                        </p>
                        {n.unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-leaf-deep" aria-label="Chưa đọc" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import { ME, USERS } from "@/lib/data";
import { closeFriends } from "@/lib/stores";
import { Modal } from "@/components/exchange/Modal";
import { Avatar } from "@/components/Avatar";

/** Chọn bạn thân: người trong danh sách này xem được các bài bạn đặt chế độ "Bạn thân". */
export function CloseFriendsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const chosen = closeFriends.use();
  const others = USERS.filter((u) => u.handle !== ME);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bạn thân"
      subtitle={chosen.length ? `${chosen.length} người xem được bài chế độ Bạn thân của bạn.` : "Chọn những người được xem bài chế độ Bạn thân."}
      width={480}
      footer={
        <button type="button" onClick={onClose} className="ml-auto inline-flex h-10 items-center rounded-xl bg-leaf px-5 text-sm font-bold text-ink hover:bg-[#6ee04d]">
          Xong
        </button>
      }
    >
      <ul className="-my-1 flex flex-col">
        {others.map((u) => {
          const on = chosen.includes(u.handle);
          return (
            <li key={u.handle}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => closeFriends.toggle(u.handle)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-mist"
              >
                <Avatar initials={u.initials} tone={u.tone} handle={u.handle} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{u.name}</span>
                  <span className="block truncate text-sm text-moss">{u.intro}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-leaf-deep bg-leaf-deep text-white" : "border-line bg-white"}`}
                >
                  {on && <Check className="h-4 w-4" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

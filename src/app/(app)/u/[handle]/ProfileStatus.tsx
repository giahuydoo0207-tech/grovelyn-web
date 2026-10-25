"use client";

import { useLook } from "@/lib/look";
import { STATUS_ICON } from "@/components/PersonAvatar";

/** Nhãn trạng thái cạnh tên trên hồ sơ (Đang học, Sẵn sàng nhận việc…). */
export function ProfileStatus({ handle }: { handle: string }) {
  const status = useLook(handle).status;
  if (status === "Không hiện") return null;
  const Icon = STATUS_ICON[status];
  const ready = status === "Sẵn sàng nhận việc";
  return (
    <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold ${ready ? "bg-leaf-deep text-white" : "bg-sap text-leaf-deep"}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {status}
    </span>
  );
}

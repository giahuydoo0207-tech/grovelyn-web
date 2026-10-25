"use client";

import { useUser } from "@/lib/stores";

/** Tên, dòng giới thiệu hoặc nơi sống; với tài khoản của bạn thì lấy bản đã sửa trong Cài đặt. */
export function MyText({ handle, field }: { handle: string; field: "name" | "headline" | "location" }) {
  return <>{useUser(handle)?.[field]}</>;
}

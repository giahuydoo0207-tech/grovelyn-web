"use client";

import { usePathname } from "next/navigation";
import { MotionConfig, useReducedMotion } from "motion/react";

/**
 * Hiệu ứng chỉ dành cho ba trang dùng hằng ngày: Trang chủ, Trao đổi và Nhắn tin.
 * Trang khác vẫn có mờ dần nhỏ cho menu, hộp thoại, nhưng không trượt, phóng to hay vẽ trang trí.
 */
const LIVELY = ["/community", "/exchange", "/messages"];
export const isLively = (path: string) => LIVELY.some((r) => path === r || path.startsWith(`${r}/`));

/** True khi trang hiện tại không được có hiệu ứng trang trí, hoặc người dùng bật giảm chuyển động. */
export function useCalm() {
  const path = usePathname();
  const reduce = useReducedMotion();
  return !isLively(path) || !!reduce;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <MotionConfig reducedMotion={isLively(path) ? "user" : "always"}>{children}</MotionConfig>;
}

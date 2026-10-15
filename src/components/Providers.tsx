"use client";

import { MotionConfig } from "motion/react";

/** Tôn trọng cài đặt "giảm chuyển động" của hệ điều hành cho mọi hiệu ứng Motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

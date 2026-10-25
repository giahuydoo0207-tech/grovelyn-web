"use client";

import { motion } from "motion/react";
import { useCalm } from "@/components/Providers";

/**
 * Hiện từ hơi mờ sang rõ, trượt nhẹ lên, khi lần đầu cuộn tới. Chỉ chạy một lần.
 * Chỉ có tác dụng ở Trang chủ, Trao đổi và Nhắn tin; trang khác (ví dụ bảng tin trong Nhóm) hiện thẳng.
 */
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const calm = useCalm();
  if (calm) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Hiện từ hơi mờ sang rõ, trượt nhẹ lên, khi lần đầu cuộn tới. Chỉ chạy một lần.
 * Dùng `delay` để các phần tử trong một nhóm hiện lần lượt.
 */
export function FadeIn({ children, delay = 0, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" }) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduce ? 0.2 : 0.32, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

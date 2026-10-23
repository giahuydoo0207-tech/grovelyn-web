"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

/** Hộp thoại nhỏ: Esc để đóng, khoá cuộn trang, trả focus về chỗ cũ khi đóng. */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 600,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  width?: number;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("textarea, input, button")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_60px_-24px_rgba(6,17,10,0.45)] sm:rounded-2xl"
            style={{ maxWidth: width }}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
              <div>
                <h2 id="modal-title" className="font-display text-2xl font-bold tracking-[-0.02em]">
                  {title}
                </h2>
                {subtitle && <p className="mt-1 text-sm text-moss">{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Đóng" className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-moss hover:bg-mist hover:text-ink">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-line bg-[#fafbf9] px-5 py-4 sm:px-6">{footer}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

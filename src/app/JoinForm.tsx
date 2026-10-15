"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Mail } from "lucide-react";
import type { Role } from "@/lib/data";

const ROLES: { value: Role; hint: string }[] = [
  { value: "Sinh viên", hint: "Lưu và khoe dự án" },
  { value: "Freelancer", hint: "Portfolio để nhận việc" },
  { value: "Doanh nghiệp", hint: "Tìm người qua dự án" },
];

type Step = "form" | "code" | "done";

/**
 * Đăng ký không mật khẩu: nhập email và mã mời, nhận mã 6 số, nhập mã là vào.
 * Bản giao diện: chưa gửi email thật, mã nào đủ 6 số cũng qua.
 */
export function JoinForm() {
  const [step, setStep] = useState<Step>("form");
  const [role, setRole] = useState<Role>("Sinh viên");
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Nhập email đúng dạng, ví dụ ban@email.com.");
    if (invite.trim().length < 4) return setError("Nhập mã mời bạn được gửi. Chưa có mã thì hỏi người đã mời bạn.");
    setError("");
    setStep("code");
    setTimeout(() => boxes.current[0]?.focus(), 250);
  };

  const typeDigit = (i: number, v: string) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length > 1) {
      // Dán cả mã 6 số vào một ô.
      const next = digits.slice(0, 6).split("");
      setCode((c) => c.map((_, k) => next[k] ?? ""));
      if (next.length === 6) setStep("done");
      return;
    }
    const next = [...code];
    next[i] = digits;
    setCode(next);
    if (digits && i < 5) boxes.current[i + 1]?.focus();
    if (next.every(Boolean)) setStep("done");
  };

  return (
    <div className="w-full max-w-[420px]">
      <AnimatePresence mode="wait" initial={false}>
        {step === "form" && (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-5"
          >
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em]">Tham gia Grovelyn</h2>
              <p className="mt-2 text-[15px] text-moss">
                Đã có tài khoản?{" "}
                <Link href="/explore" className="font-semibold text-leaf-deep underline-offset-4 hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>

            <button
              type="button"
              className="flex h-12 items-center justify-center gap-3 rounded-xl border border-line font-semibold transition-colors hover:bg-mist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 01-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z" />
                <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0012 23z" />
                <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 010-4.3V7.1H2.1a11 11 0 000 9.8l3.7-2.7z" />
                <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 002.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
              </svg>
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-3 text-sm text-moss">
              <span className="h-px flex-1 bg-line" />
              hoặc dùng email
              <span className="h-px flex-1 bg-line" />
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
                className="h-12 rounded-xl border border-line px-4 text-[15px] font-normal outline-none transition-colors focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Mã mời
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value.toUpperCase())}
                placeholder="GROVE-2026"
                autoComplete="off"
                className="h-12 rounded-xl border border-line px-4 text-[15px] font-normal tracking-wide outline-none transition-colors focus:border-ink"
              />
            </label>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">Bạn tham gia với tư cách</legend>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const on = r.value === role;
                  return (
                    <label
                      key={r.value}
                      className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-left transition-colors ${
                        on ? "border-ink bg-sap/60" : "border-line hover:bg-mist"
                      }`}
                    >
                      <input type="radio" name="role" value={r.value} checked={on} onChange={() => setRole(r.value)} className="sr-only" />
                      <span className="text-[15px] font-semibold">{r.value}</span>
                      <span className="text-xs leading-snug text-moss">{r.hint}</span>
                      {on && (
                        <motion.span
                          layoutId="role-check"
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-leaf"
                        >
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </motion.span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <AnimatePresence>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-[#b42318]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="h-13 rounded-xl bg-leaf py-3.5 text-base font-bold text-ink transition-colors hover:bg-[#6ee04d]"
            >
              Gửi mã xác nhận
            </motion.button>
            <p className="text-[13px] leading-relaxed text-moss">
              Không cần mật khẩu. Tài khoản doanh nghiệp được duyệt trước khi dùng.
            </p>
          </motion.form>
        )}

        {step === "code" && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sap text-leaf-deep">
              <Mail className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em]">Kiểm tra email</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-moss">
                Mã 6 số đã gửi tới <strong className="text-ink">{email}</strong>. Mã hết hạn sau 10 phút.
              </p>
            </div>
            <fieldset>
              <legend className="sr-only">Mã xác nhận 6 số</legend>
              <div className="flex gap-2">
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      boxes.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    aria-label={`Số thứ ${i + 1}`}
                    value={d}
                    onChange={(e) => typeDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !d && i > 0) boxes.current[i - 1]?.focus();
                    }}
                    className="h-14 w-full min-w-0 rounded-xl border border-line text-center font-display text-2xl font-bold outline-none transition-colors focus:border-ink focus:bg-sap/40"
                  />
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={() => setStep("form")} className="self-start text-sm font-semibold text-leaf-deep hover:underline">
              Đổi email
            </button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col items-start gap-5"
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-ink"
            >
              <Check className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
            </motion.span>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em]">Chào mừng tới Grovelyn</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-moss">
                Bạn tham gia với tư cách {role.toLowerCase()}. Bước tiếp theo là điền hồ sơ, hoặc xem dự án của mọi người trước.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/u/giahuy" className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition-colors hover:bg-ink-2">
                Điền hồ sơ
              </Link>
              <Link href="/explore" className="rounded-xl border border-line px-5 py-3 font-semibold transition-colors hover:bg-mist">
                Xem dự án
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

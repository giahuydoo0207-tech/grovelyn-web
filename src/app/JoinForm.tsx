"use client";

import { useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle, LogOut, Mail } from "lucide-react";
import type { Role } from "@/lib/data";
import { signIn } from "./auth-actions";

const ROLES: { value: Role; hint: string }[] = [
  { value: "Sinh viên", hint: "Lưu và khoe dự án" },
  { value: "Freelancer", hint: "Portfolio để nhận việc" },
  { value: "Doanh nghiệp", hint: "Tìm người qua dự án" },
];

type Step = "form" | "code" | "role" | "done";
const STEPS: Step[] = ["form", "code", "role"];

/**
 * Tham gia hoặc đăng nhập không mật khẩu.
 * Tham gia: email và mã mời, mã 6 số gửi về email, chọn vai trò. Đăng nhập: email rồi mã 6 số.
 * Bản giao diện: chưa gửi email thật, mã nào đủ 6 số cũng qua; phiên đăng nhập lưu bằng cookie.
 */
export function JoinForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const signedOut = params.has("da-dang-xuat");
  // Bị chuyển về từ một trang bên trong hoặc vừa đăng xuất thì mở sẵn khung đăng nhập.
  const [mode, setMode] = useState<"join" | "login">(next || signedOut ? "login" : "join");
  const [pending, startTransition] = useTransition();
  const enter = (to?: string) => startTransition(() => signIn(to ?? next));
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
    if (mode === "join" && invite.trim().length < 4) return setError("Nhập mã mời bạn được gửi. Chưa có mã thì hỏi người đã mời bạn.");
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
      if (next.length === 6) codeDone();
      return;
    }
    const next = [...code];
    next[i] = digits;
    setCode(next);
    if (digits && i < 5) boxes.current[i + 1]?.focus();
    if (next.every(Boolean)) codeDone();
  };

  // Đủ mã: đăng nhập thì vào luôn, tham gia thì sang bước chọn vai trò.
  function codeDone() {
    if (mode === "login") enter();
    else setStep("role");
  }

  return (
    <div className="w-full">
      {signedOut && step === "form" && (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-medium">
          <LogOut className="h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
          Bạn đã đăng xuất. Hẹn gặp lại.
        </p>
      )}
      {step !== "done" && mode === "join" && (
        <ol className="mb-6 flex gap-1.5" aria-label="Các bước tham gia">
          {STEPS.map((s, i) => {
            const reached = STEPS.indexOf(step) >= i;
            return (
              <li key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-line" aria-current={s === step ? "step" : undefined}>
                <motion.span
                  className="block h-full rounded-full bg-leaf-deep"
                  initial={false}
                  animate={{ width: reached ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="sr-only">Bước {i + 1}</span>
              </li>
            );
          })}
        </ol>
      )}
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
            className="flex flex-col gap-4"
          >
            <div>
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em]">
                {mode === "join" ? "Tham gia Grovelyn" : "Đăng nhập"}
              </h2>
              <p className="mt-2 text-[15px] text-moss">
                {mode === "join" ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "join" ? "login" : "join");
                    setError("");
                  }}
                  className="font-semibold text-leaf-deep underline-offset-4 hover:underline"
                >
                  {mode === "join" ? "Đăng nhập" : "Tham gia bằng mã mời"}
                </button>
              </p>
            </div>

            <button
              type="button"
              onClick={() => enter()}
              disabled={pending}
              className="flex h-12 items-center justify-center gap-3 rounded-xl border border-line font-semibold transition-colors hover:bg-mist disabled:opacity-60"
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
            {mode === "join" && (
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
            )}

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
              {mode === "join" ? "Gửi mã xác nhận" : "Gửi mã đăng nhập"}
            </motion.button>
            <p className="text-[13px] leading-relaxed text-moss">
              Không cần mật khẩu. Mã xác nhận sẽ gửi về email này.
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
            {pending ? (
              <p role="status" className="flex items-center gap-2 text-sm font-semibold text-leaf-deep">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Đang đăng nhập
              </p>
            ) : (
              <button type="button" onClick={() => setStep("form")} className="self-start text-sm font-semibold text-leaf-deep hover:underline">
                Đổi email
              </button>
            )}
          </motion.div>
        )}

        {step === "role" && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-5"
          >
            <div>
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em]">Bạn dùng Grovelyn để làm gì?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-moss">Chọn một vai trò. Đổi lại được trong phần cài đặt.</p>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Vai trò</legend>
              <div className="flex flex-col gap-2">
                {ROLES.map((r) => {
                  const on = r.value === role;
                  return (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep ${
                        on ? "border-ink bg-sap/60" : "border-line hover:bg-mist"
                      }`}
                    >
                      <input type="radio" name="role" value={r.value} checked={on} onChange={() => setRole(r.value)} className="sr-only" />
                      <span
                        aria-hidden="true"
                        className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-ink" : "border-line"}`}
                      >
                        {on && (
                          <motion.span
                            layoutId="role-check"
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-leaf"
                            transition={{ type: "spring", stiffness: 500, damping: 32 }}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </motion.span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-[15px] font-semibold">{r.value}</span>
                        <span className="text-sm text-moss">{r.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {role === "Doanh nghiệp" && (
              <p className="rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-moss">
                Tài khoản doanh nghiệp được duyệt trước khi xem hồ sơ ứng viên, thường trong một ngày.
              </p>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep("done")}
              className="rounded-xl bg-leaf py-3.5 text-base font-bold text-ink transition-colors hover:bg-[#6ee04d]"
            >
              Tiếp tục
            </motion.button>
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
                Bạn tham gia với tư cách {role.toLowerCase()}. Vào xem mọi người đang làm gì, hồ sơ điền sau cũng được.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => enter()}
                className="rounded-xl bg-leaf px-5 py-3 font-bold text-ink transition-colors hover:bg-[#6ee04d] disabled:opacity-60"
              >
                Vào Grovelyn
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => enter("/u/giahuy")}
                className="rounded-xl border border-line px-5 py-3 font-semibold transition-colors hover:bg-mist disabled:opacity-60"
              >
                Điền hồ sơ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

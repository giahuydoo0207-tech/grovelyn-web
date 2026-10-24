"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, Check, Star } from "lucide-react";
import { ME, userOf } from "@/lib/data";
import type { CommunityEvent } from "@/lib/events";
import { downloadIcs } from "@/lib/ics";

const FIELD =
  "h-[46px] w-full rounded-xl border border-[#cfe3c4] bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-moss/80 focus:border-leaf-deep focus:ring-2 focus:ring-leaf-deep/20";

/** Bản giao diện: email mẫu của tài khoản đang đăng nhập. */
const ME_EMAIL = "giahuy@grovelyn.vn";

/**
 * Khung đăng ký cạnh nội dung sự kiện. Họ tên, email, số điện thoại luôn có, các câu hỏi khác bật theo `event.asks`.
 * Chưa có máy chủ nên đăng ký chỉ đổi trạng thái trên trình duyệt.
 */
export function RegisterForm({ event, preview = false }: { event: CommunityEvent; preview?: boolean }) {
  const me = userOf(ME)!;
  const [done, setDone] = useState(false);
  const [interested, setInterested] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const left = Math.max(0, event.seats - event.registered - (done ? 1 : 0));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ""))) {
      setError("Số điện thoại gồm 10 số, bắt đầu bằng 0.");
      return;
    }
    setError("");
    setDone(true);
  };

  return (
    <div className="rounded-3xl bg-[#e6f4dc] p-6 sm:p-7 lg:mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{done ? "Bạn đã giữ chỗ" : "Đăng ký giữ chỗ"}</h2>
        <span className="rounded-full bg-white px-2.5 py-1 text-[13px] font-bold tabular-nums text-leaf-deep">
          Còn {left} trên {event.seats} chỗ
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="flex items-start gap-2 leading-relaxed text-[#3d4a38]">
              <Check className="mt-1 h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
              {event.asks.approve
                ? "Người tổ chức sẽ duyệt và báo kết quả qua email."
                : `Vé và lời nhắc trước 1 giờ được gửi về ${ME_EMAIL}.`}
            </p>
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-white"
            >
              <CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" />
              Thêm vào lịch
            </button>
            <button type="button" onClick={() => setDone(false)} className="mt-2 h-10 w-full rounded-full text-sm font-semibold text-moss hover:bg-white/60">
              Hủy đăng ký
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={false} exit={{ opacity: 0 }}>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#3d4a38]">
              <Check className="h-[15px] w-[15px] text-leaf-deep" aria-hidden="true" />
              Đã điền sẵn từ hồ sơ Grovelyn của bạn
            </p>
            <div className="mt-4 grid gap-x-3.5 gap-y-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Họ và tên
                <input className={FIELD} defaultValue={me.name} required autoComplete="name" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Email
                <input className={FIELD} type="email" defaultValue={ME_EMAIL} required autoComplete="email" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Số điện thoại
                <input
                  className={FIELD}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="09xx xxx xxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "phone-err" : undefined}
                />
                {error && (
                  <span id="phone-err" className="text-xs font-semibold text-[#b42318]">
                    {error}
                  </span>
                )}
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Bạn đang là
                <select className={FIELD} defaultValue={me.intro.startsWith("Sinh viên") ? "Sinh viên" : "Người đi làm"}>
                  <option>Sinh viên</option>
                  <option>Người đi làm</option>
                  <option>Khác</option>
                </select>
              </label>
              {event.asks.fields && (
                <>
                  <label className="flex flex-col gap-1.5 text-sm font-bold">
                    Ngành hiện tại
                    <input className={FIELD} defaultValue="Công nghệ thông tin" />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-bold">
                    Ngành muốn sang
                    <input className={FIELD} placeholder="Ví dụ: Thiết kế" />
                  </label>
                </>
              )}
              {event.asks.question && (
                <label className="flex flex-col gap-1.5 text-sm font-bold sm:col-span-2">
                  Câu hỏi cho speaker
                  <textarea rows={4} className={`${FIELD} h-auto resize-y py-3 leading-normal`} placeholder="Câu nhiều người hỏi giống nhau sẽ được trả lời trước" />
                </label>
              )}
              {event.asks.profile && (
                <label className="flex items-start gap-2.5 text-sm leading-normal text-[#3d4a38] sm:col-span-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-leaf-deep" />
                  Gửi kèm đường dẫn hồ sơ Grovelyn để speaker có thể chọn xem trực tiếp trong buổi
                </label>
              )}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-[#3d4a38]">
              Khi đăng ký, bạn đồng ý cho người tổ chức nhận tên, email và số điện thoại để gửi thông tin buổi này, theo{" "}
              <Link href="#" className="underline">
                Điều khoản
              </Link>{" "}
              và{" "}
              <Link href="#" className="underline">
                Chính sách riêng tư
              </Link>{" "}
              của Grovelyn.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={preview || left === 0}
              className="mt-4 h-[54px] w-full rounded-full bg-ink text-base font-bold text-white disabled:opacity-60"
            >
              {left === 0 ? "Đã hết chỗ" : event.asks.approve ? "Gửi đăng ký" : "Đăng ký"}
            </motion.button>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={interested}
                onClick={() => setInterested((x) => !x)}
                className={`inline-flex h-[42px] items-center justify-center gap-1.5 rounded-full border text-sm font-bold transition-colors ${
                  interested ? "border-leaf-deep bg-white text-leaf-deep" : "border-[#b9d6a9] hover:bg-white/60"
                }`}
              >
                <Star className="h-4 w-4" fill={interested ? "currentColor" : "none"} aria-hidden="true" />
                {interested ? "Đã quan tâm" : "Quan tâm"}
              </button>
              <button
                type="button"
                onClick={() => !preview && downloadIcs(event)}
                className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-full border border-[#b9d6a9] text-sm font-bold hover:bg-white/60"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Thêm vào lịch
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

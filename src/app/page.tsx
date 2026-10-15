import type { Metadata } from "next";
import { GrowingTree } from "@/components/GrowingTree";
import { CircuitBackdrop } from "@/components/CircuitBackdrop";
import { Mark } from "@/components/Logo";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Tham gia" };

export default function Landing() {
  return (
    <div className="grid min-h-screen bg-ink text-white lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {/* Bên trái: chữ ở trên, cây ở dưới, hai phần tách riêng không chồng lên nhau. */}
      <section className="flex min-w-0 flex-col px-6 pt-8 sm:px-10 lg:px-14 lg:pt-12">
        <div className="flex items-center gap-2">
          <Mark size={32} color="#ffffff" />
          <span className="font-display text-2xl font-bold tracking-[-0.03em]">Grovelyn</span>
        </div>

        <div className="mt-12 lg:mt-16">
          <h1 className="font-display text-[clamp(2.2rem,7vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em] lg:whitespace-nowrap lg:text-[clamp(2rem,3.05vw,3.6rem)]">
            Nơi dự án của bạn lớn lên.
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-fog">
            Lưu trữ, chia sẻ và trưng bày dự án ở mọi ngành, từ bản vẽ kiến trúc đến kế hoạch marketing. Doanh nghiệp tìm
            thấy bạn qua những gì bạn thật sự làm ra.
          </p>
        </div>

        <div className="relative mt-8 h-[300px] sm:h-[380px] lg:mt-10 lg:h-auto lg:min-h-[340px] lg:flex-1">
          <GrowingTree className="absolute inset-0 h-full w-full" />
        </div>
      </section>

      {/* Bên phải: nền tối có lớp đường mạch mờ, khung đăng ký trắng nằm giữa. */}
      <section className="relative flex items-center justify-center overflow-hidden bg-ink-2 px-5 py-12 sm:px-10 lg:py-16">
        <CircuitBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative w-full max-w-[500px] rounded-[28px] bg-white p-7 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:p-9">
          <JoinForm />
        </div>
      </section>
    </div>
  );
}

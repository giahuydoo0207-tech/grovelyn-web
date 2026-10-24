import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GrowingTree } from "@/components/GrowingTree";
import { CircuitBackdrop } from "@/components/CircuitBackdrop";
import { Mark } from "@/components/Logo";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Tham gia" };

export default function Landing() {
  return (
    <div className="grid min-h-dvh bg-ink text-white lg:h-dvh lg:min-h-[640px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {/* Bên trái: chữ ở trên, cây ở dưới, hai phần tách riêng không chồng lên nhau. */}
      <section className="flex min-h-0 min-w-0 flex-col px-6 pt-8 sm:px-10 lg:px-14 lg:pt-10">
        <div className="flex items-center gap-2">
          <Mark size={32} color="#ffffff" />
          <span className="font-display text-2xl font-bold tracking-[-0.03em]">Grovelyn</span>
        </div>

        <div className="mt-10 lg:mt-[clamp(1.5rem,6vh,4rem)]">
          <h1 className="font-display text-[clamp(2.2rem,7vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em] lg:whitespace-nowrap lg:text-[clamp(2rem,3.05vw,3.6rem)]">
            Nơi dự án của bạn lớn lên.
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-fog">
            Trưng bày việc bạn làm. Cùng nhau làm tốt hơn. Từ bản vẽ kiến trúc, báo cáo thị trường đến một ứng dụng, ngành nào cũng đăng và nhận góp ý được.
          </p>
          <Link href="/demo" className="mt-5 inline-flex items-center gap-2 font-semibold text-leaf underline-offset-4 hover:underline">
            Xem bản demo không cần đăng ký <span lang="en" className="font-normal text-fog">Open the demo</span>
          </Link>
        </div>

        <div className="relative mt-6 h-[340px] sm:h-[420px] lg:mt-4 lg:h-auto lg:min-h-0 lg:flex-1">
          <GrowingTree className="absolute inset-0 h-full w-full" />
        </div>
      </section>

      {/* Bên phải: nền tối có lớp đường mạch mờ, khung đăng ký trắng nằm giữa. */}
      <section className="relative flex items-center justify-center overflow-hidden bg-ink-2 px-5 py-12 sm:px-10 lg:py-8">
        <CircuitBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-7 text-ink sm:p-8 lg:max-h-full lg:overflow-y-auto shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <Suspense>
            <JoinForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { GrowingTree } from "@/components/GrowingTree";
import { Mark } from "@/components/Logo";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Tham gia" };

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative flex flex-col gap-10 overflow-hidden bg-ink px-6 py-8 text-white sm:px-10 lg:h-screen lg:w-[55%] lg:px-14 lg:py-12">
        <div className="relative z-10 flex items-center gap-2">
          <Mark size={32} color="#ffffff" />
          <span className="font-display text-2xl font-bold tracking-[-0.03em]">Grovelyn</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-[clamp(2.6rem,5.4vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.04em]">
            Nơi dự án của bạn lớn lên.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-fog">
            Lưu trữ, chia sẻ và trưng bày dự án ở mọi ngành, từ bản vẽ kiến trúc đến kế hoạch marketing. Doanh nghiệp tìm
            thấy bạn qua những gì bạn thật sự làm ra.
          </p>
        </div>

        <div className="relative -mx-6 flex min-h-0 flex-1 items-end justify-center sm:-mx-10 lg:-mx-14">
          <GrowingTree className="pointer-events-none h-auto max-h-[46vh] w-full max-w-[520px] lg:max-h-[50vh]" />
        </div>

        <p className="relative z-10 text-sm text-fog">Đang thử nghiệm với 200 người đầu tiên. Tham gia bằng mã mời.</p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <JoinForm />
      </section>
    </div>
  );
}

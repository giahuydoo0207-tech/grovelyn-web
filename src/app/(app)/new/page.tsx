import type { Metadata } from "next";
import { NewProjectForm } from "./NewProjectForm";

export const metadata: Metadata = { title: "Tạo dự án" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 sm:p-8">
      <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-bold leading-none tracking-[-0.045em]">Tạo dự án</h1>
      <p className="mt-3 max-w-[56ch] text-[17px] text-moss">
        Đăng cả khi còn dang dở. Mỗi lần tải bản mới lên, bản cũ vẫn được giữ lại để người xem thấy bạn tiến bộ.
      </p>
      <NewProjectForm />
    </div>
  );
}

import type { Metadata } from "next";
import { NewProjectForm } from "./NewProjectForm";

export const metadata: Metadata = { title: "Tạo dự án" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.2rem)] font-bold leading-none tracking-[-0.045em]">Tạo dự án</h1>
      <p className="mt-3 max-w-[56ch] text-[17px] text-moss">
        Đăng cả khi còn dang dở. Mỗi lần tải bản mới lên, bản cũ vẫn được giữ lại để người xem thấy bạn tiến bộ.
      </p>
      <NewProjectForm />
    </div>
  );
}

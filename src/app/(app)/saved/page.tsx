import type { Metadata } from "next";
import Link from "next/link";
import { projectOf } from "@/lib/data";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = { title: "Đã lưu" };

/** Dự án bạn bấm Lưu trên trang dự án. Dữ liệu mẫu. */
const SAVED = ["nha-pho-thong-gio", "chuoi-cung-ung-ca-phe", "robot-phan-loai-rac"];

export default function SavedPage() {
  const projects = SAVED.map((s) => projectOf(s)).filter((p) => p !== undefined);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.04em]">Đã lưu</h1>
        <p className="mt-2 max-w-[52ch] text-moss">Dự án bạn bấm Lưu để xem lại sau. Chỉ mình bạn thấy danh sách này.</p>
      </header>
      {projects.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-moss">
          Chưa lưu dự án nào.{" "}
          <Link href="/explore" className="font-semibold text-leaf-deep hover:underline">
            Vào Khám phá
          </Link>
        </p>
      )}
    </div>
  );
}

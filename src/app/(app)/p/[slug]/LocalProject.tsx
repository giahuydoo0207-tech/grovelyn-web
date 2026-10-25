"use client";

import Link from "next/link";
import { useProject } from "@/lib/stores";
import { ProjectView } from "./ProjectView";

/** Dự án bạn tạo trong bản dùng thử: đọc từ trình duyệt rồi hiện như dự án thường. */
export function LocalProject({ slug }: { slug: string }) {
  const project = useProject(slug);
  if (!project)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy dự án</h1>
        <p className="mt-2 text-moss">Dự án có thể đã bị xoá, hoặc được tạo trên một trình duyệt khác.</p>
        <Link href="/explore" className="mt-5 inline-flex h-11 items-center rounded-lg bg-leaf px-4 font-bold text-ink">
          Về Khám phá
        </Link>
      </div>
    );
  return <ProjectView project={project} />;
}

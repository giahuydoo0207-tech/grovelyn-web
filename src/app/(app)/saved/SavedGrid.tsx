"use client";

import Link from "next/link";
import { projectOf } from "@/lib/data";
import { myProjectsStore, savedProjects } from "@/lib/stores";
import { ProjectCard } from "@/components/ProjectCard";

/** Dự án bạn đã bấm Lưu, đọc từ trình duyệt. */
export function SavedGrid() {
  const mine = myProjectsStore.use();
  const projects = savedProjects
    .use()
    .map((s) => projectOf(s) ?? mine.find((p) => p.slug === s))
    .filter((p) => p !== undefined);
  if (!projects.length)
    return (
      <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-moss">
        Chưa lưu dự án nào.{" "}
        <Link href="/explore" className="font-semibold text-leaf-deep hover:underline">
          Vào Khám phá
        </Link>
      </p>
    );
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug}>
          <ProjectCard project={p} />
        </li>
      ))}
    </ul>
  );
}

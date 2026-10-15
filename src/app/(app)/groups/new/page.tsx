import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GroupForm } from "./GroupForm";

export const metadata: Metadata = { title: "Tạo nhóm" };

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <Link href="/groups" className="inline-flex items-center gap-1 text-sm font-semibold text-moss hover:text-ink">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Nhóm
      </Link>
      <GroupForm />
    </div>
  );
}

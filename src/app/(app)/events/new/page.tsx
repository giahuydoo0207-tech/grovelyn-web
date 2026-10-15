import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EventForm } from "./EventForm";

export const metadata: Metadata = { title: "Tạo sự kiện" };

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-moss hover:text-ink">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Sự kiện
      </Link>
      <EventForm />
    </div>
  );
}

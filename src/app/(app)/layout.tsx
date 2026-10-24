import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatDock } from "@/components/chat/ChatDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="min-h-dvh bg-mist">
        <a
          href="#noi-dung"
          className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Bỏ qua để tới nội dung
        </a>
        <p className="bg-ink px-4 py-1.5 text-center text-[13px] text-fog">
          Bản thử nghiệm: người dùng, dự án và số liệu là dữ liệu mẫu.{" "}
          <Link href="/demo#trang-thai" className="font-semibold text-leaf underline-offset-2 hover:underline">
            Phần nào đã chạy thật
          </Link>
        </p>
        <NavBar />
        <main
          id="noi-dung"
          className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-12"
        >
          {children}
        </main>
        <ChatDock />
      </div>
    </ChatProvider>
  );
}

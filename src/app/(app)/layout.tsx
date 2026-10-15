import { TopBar } from "@/components/TopBar";
import { Dock } from "@/components/Dock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua để tới nội dung
      </a>
      <TopBar />
      <main id="noi-dung" className="mx-auto w-full max-w-7xl px-4 pb-36 pt-8 sm:px-6">
        {children}
      </main>
      <Dock />
    </>
  );
}

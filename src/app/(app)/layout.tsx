import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-mist">
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua để tới nội dung
      </a>
      <NavBar />
      <main id="noi-dung" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
        {children}
      </main>
    </div>
  );
}

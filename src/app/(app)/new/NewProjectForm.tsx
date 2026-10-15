"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Globe2, Lock, UploadCloud, X } from "lucide-react";
import { FIELDS, QUOTA_MB } from "@/lib/data";

const MAX_FILE_MB = 25;

interface Picked {
  name: string;
  mb: number;
  tooBig: boolean;
}

/** Bản giao diện: tệp chỉ được liệt kê trên trình duyệt, chưa tải lên đâu cả. */
export function NewProjectForm() {
  const [files, setFiles] = useState<Picked[]>([]);
  const [drag, setDrag] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [title, setTitle] = useState("");
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => {
      const mb = f.size / 1024 / 1024;
      return { name: f.name, mb, tooBig: mb > MAX_FILE_MB };
    });
    setFiles((cur) => [...cur, ...next.filter((n) => !cur.some((c) => c.name === n.name))]);
  };

  const used = files.filter((f) => !f.tooBig).reduce((s, f) => s + f.mb, 0);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-[24px] bg-ink p-8 text-white">
        <p className="font-display text-3xl font-bold tracking-[-0.03em]">Đã tạo dự án {title || "mới"}</p>
        <p className="mt-2 text-fog">Phiên bản v1 đã lưu. Chia sẻ lên Cộng đồng để mọi người góp ý.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/community" className="rounded-xl bg-leaf px-5 py-3 font-bold text-ink">
            Chia sẻ lên Cộng đồng
          </Link>
          <button onClick={() => setDone(false)} className="rounded-xl border border-ink-line px-5 py-3 font-semibold hover:bg-white/10">
            Tạo dự án khác
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      className="mt-8 flex flex-col gap-7"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label className="flex flex-col gap-2 font-semibold">
        Tên dự án
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Nhà phố 4x16m thông gió tự nhiên"
          className="h-12 rounded-xl border border-line px-4 font-normal outline-none focus:border-ink"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-semibold">
          Ngành
          <select className="h-12 rounded-xl border border-line bg-white px-3 font-normal outline-none focus:border-ink">
            {FIELDS.filter((f) => f !== "Tất cả").map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          Loại dự án
          <input placeholder="Đồ án, dự án khách hàng, nghiên cứu…" className="h-12 rounded-xl border border-line px-4 font-normal outline-none focus:border-ink" />
        </label>
      </div>

      <label className="flex flex-col gap-2 font-semibold">
        Giới thiệu ngắn
        <textarea
          rows={3}
          placeholder="Dự án giải quyết chuyện gì, bạn làm phần nào"
          className="rounded-xl border border-line px-4 py-3 font-normal leading-relaxed outline-none focus:border-ink"
        />
      </label>

      <div>
        <p className="font-semibold">Tệp dự án</p>
        <motion.button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(e.dataTransfer.files);
          }}
          animate={{ scale: drag ? 1.01 : 1 }}
          className={`mt-2 flex w-full flex-col items-center gap-3 rounded-[22px] border-2 border-dashed px-6 py-10 text-center transition-colors ${
            drag ? "border-leaf-deep bg-sap/50" : "border-line hover:bg-mist"
          }`}
        >
          <motion.span animate={{ y: drag ? -6 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
            <UploadCloud className="h-9 w-9 text-leaf-deep" aria-hidden="true" />
          </motion.span>
          <span className="font-semibold">{drag ? "Thả tệp vào đây" : "Kéo thả tệp hoặc bấm để chọn"}</span>
          <span className="text-sm text-moss">
            PDF, ảnh, video tới 60 giây, mô hình 3D. Mỗi tệp tối đa {MAX_FILE_MB} MB, ảnh và video được nén tự động.
          </span>
        </motion.button>
        <input ref={input} type="file" multiple className="sr-only" onChange={(e) => add(e.target.files)} aria-label="Chọn tệp dự án" />

        <ul className="mt-3 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {files.map((f) => (
              <motion.li
                key={f.name}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${f.tooBig ? "border-[#f4b4a8] bg-[#fdf0ed]" : "border-line"}`}>
                  <FileText className="h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{f.name}</span>
                    <span className={`text-sm ${f.tooBig ? "text-[#b42318]" : "text-moss"}`}>
                      {f.tooBig ? `${f.mb.toFixed(1)} MB, quá giới hạn ${MAX_FILE_MB} MB. Nén lại hoặc chia nhỏ tệp.` : `${f.mb.toFixed(1)} MB`}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Bỏ ${f.name}`}
                    onClick={() => setFiles((cur) => cur.filter((c) => c.name !== f.name))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-moss hover:bg-mist"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {files.length > 0 && (
          <p className="mt-2 text-sm text-moss">
            Dự án này dùng {used.toFixed(1)} MB trong {QUOTA_MB} MB của tài khoản.
          </p>
        )}
      </div>

      <fieldset>
        <legend className="font-semibold">Ai xem được</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              { v: "public", icon: Globe2, title: "Công khai", hint: "Mọi người và doanh nghiệp đều xem được" },
              { v: "private", icon: Lock, title: "Chỉ mình tôi", hint: "Lưu trữ riêng, công khai lúc nào cũng được" },
            ] as const
          ).map((o) => {
            const on = visibility === o.v;
            return (
              <label
                key={o.v}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${on ? "border-ink bg-sap/40" : "border-line hover:bg-mist"}`}
              >
                <input type="radio" name="visibility" checked={on} onChange={() => setVisibility(o.v)} className="sr-only" />
                <o.icon className="mt-0.5 h-5 w-5 text-leaf-deep" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">{o.title}</span>
                  <span className="text-sm text-moss">{o.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="h-12 rounded-xl bg-leaf px-6 font-bold text-ink hover:bg-[#6ee04d]">
          Tạo dự án
        </motion.button>
        <Link href="/community" className="flex h-12 items-center rounded-xl px-5 font-semibold text-moss hover:bg-mist hover:text-ink">
          Hủy
        </Link>
      </div>
    </form>
  );
}

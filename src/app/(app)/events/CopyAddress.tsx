"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyAddress({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      className="mt-4 inline-flex h-[42px] items-center gap-2 rounded-full border border-ink bg-white px-4 text-sm font-bold hover:bg-mist"
    >
      {done ? <Check className="h-4 w-4 text-leaf-deep" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{done ? "Đã sao chép" : "Sao chép địa chỉ"}</span>
    </button>
  );
}

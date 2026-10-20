import { Heart, Laugh, Lightbulb, Rocket, ShieldCheck, ThumbsUp, Wrench, type LucideIcon } from "lucide-react";

/**
 * Bảy cảm xúc giữ nguyên từ cộng đồng Nova. "Đang xây" và "Bứt phá" hợp với việc khoe dự án.
 * color: màu icon, cũng là nền khi rê chuột (chữ trắng đọc được); tint: nền nhạt lúc bình thường.
 */
export const REACTIONS: { key: string; label: string; icon: LucideIcon; color: string; tint: string }[] = [
  { key: "like", label: "Thích", icon: ThumbsUp, color: "#1d6b1d", tint: "#dcf6cf" },
  { key: "love", label: "Yêu thích", icon: Heart, color: "#e11d48", tint: "#ffe4e6" },
  { key: "haha", label: "Haha", icon: Laugh, color: "#c2690a", tint: "#fef3c7" },
  { key: "trust", label: "Tin cậy", icon: ShieldCheck, color: "#0f766e", tint: "#ccfbf1" },
  { key: "build", label: "Đang xây", icon: Wrench, color: "#c2410c", tint: "#ffedd5" },
  { key: "insight", label: "Hay", icon: Lightbulb, color: "#0369a1", tint: "#e0f2fe" },
  { key: "launch", label: "Bứt phá", icon: Rocket, color: "#7c3aed", tint: "#ede9fe" },
];

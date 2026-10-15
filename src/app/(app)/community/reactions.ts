import { Heart, Laugh, Lightbulb, Rocket, ShieldCheck, ThumbsUp, Wrench, type LucideIcon } from "lucide-react";

/** Bảy cảm xúc giữ nguyên từ cộng đồng Nova. "Đang xây" và "Bứt phá" hợp với việc khoe dự án. */
export const REACTIONS: { key: string; label: string; icon: LucideIcon; color: string }[] = [
  { key: "like", label: "Thích", icon: ThumbsUp, color: "#1d6b1d" },
  { key: "love", label: "Yêu thích", icon: Heart, color: "#d92d5b" },
  { key: "haha", label: "Haha", icon: Laugh, color: "#b7791f" },
  { key: "trust", label: "Tin cậy", icon: ShieldCheck, color: "#15803d" },
  { key: "build", label: "Đang xây", icon: Wrench, color: "#c2410c" },
  { key: "insight", label: "Hay", icon: Lightbulb, color: "#0e7490" },
  { key: "launch", label: "Bứt phá", icon: Rocket, color: "#7c3aed" },
];

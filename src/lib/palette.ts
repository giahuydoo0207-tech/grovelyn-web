import type { Field, Lens } from "./data";

/**
 * Bảng màu "khu vườn": lá vẫn là màu chính của Grovelyn, thêm nắng, đất, trời, hoa tím, hoa hồng và rêu
 * để phân biệt lĩnh vực và góc nhìn. Mỗi màu có nền nhạt (bg), chữ đậm đủ tương phản trên nền đó (fg)
 * và màu đặc để vẽ (solid). Chỉ dùng cho điểm nhấn nhỏ, nền trang vẫn trắng và xám lá.
 */
export type Hue = "leaf" | "sun" | "clay" | "sky" | "lilac" | "rose" | "moss";

export const GARDEN: Record<Hue, { bg: string; fg: string; solid: string }> = {
  leaf: { bg: "#dcf6cf", fg: "#1d6b1d", solid: "#5bd13a" },
  sun: { bg: "#fff1c2", fg: "#765600", solid: "#f2c13a" },
  clay: { bg: "#fde3d6", fg: "#97401d", solid: "#e8875f" },
  sky: { bg: "#ddeffb", fg: "#1b5687", solid: "#6bb3e8" },
  lilac: { bg: "#ebe6fd", fg: "#4f3ca3", solid: "#a491ee" },
  rose: { bg: "#fde4ec", fg: "#962a52", solid: "#ea7aa0" },
  moss: { bg: "#e5ecde", fg: "#3b4735", solid: "#8aa17a" },
};

export const FIELD_HUE: Record<Field, Hue> = {
  "Công nghệ thông tin": "sky",
  "Thiết kế": "lilac",
  "Kiến trúc": "clay",
  Marketing: "sun",
  "Kinh doanh và tài chính": "leaf",
  "Kỹ thuật": "moss",
  "Truyền thông": "rose",
};

export const LENS_HUE: Record<Lens, Hue> = {
  "Nội dung và lập luận": "sun",
  "Cách trình bày": "lilac",
  "Giải pháp và tính khả thi": "leaf",
  "Trải nghiệm sử dụng": "sky",
  "Phương pháp và dữ liệu": "clay",
};

export const fieldColor = (f: string) => GARDEN[FIELD_HUE[f as Field] ?? "moss"];
export const lensColor = (l: string) => GARDEN[LENS_HUE[l as Lens] ?? "leaf"];

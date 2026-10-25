/**
 * Nhân vật đại diện: ảnh đại diện mặc định của mọi người, tự phối theo phong cách ăn mặc của mình,
 * vẽ kiểu hoạt hình (nét mực, có đổ bóng) hoặc điểm ảnh. Không cần đăng ảnh thật nên giữ được quyền riêng tư.
 */

export type CharacterStyle = "cartoon" | "pixel";

export const HAIRS = ["Ngắn", "Đầu đinh", "Mái dài", "Tóc dài", "Búi", "Xoăn"] as const;
export const OUTFITS = ["Áo thun", "Sơ mi", "Hoodie", "Blazer", "Áo len"] as const;
export const EXTRAS = ["Kính", "Kính râm", "Mũ lưỡi trai", "Mũ len", "Tai nghe", "Khuyên tai"] as const;
export const EMOTIONS = ["Cười nhe răng", "Mỉm cười", "Nháy mắt", "Ngạc nhiên", "Tự tin", "Suy nghĩ"] as const;
export const STATUSES = ["Không hiện", "Đang làm việc", "Đang học", "Nghỉ giải lao", "Tìm cộng sự", "Sẵn sàng nhận việc"] as const;

export type Hair = (typeof HAIRS)[number];
export type Outfit = (typeof OUTFITS)[number];
export type Extra = (typeof EXTRAS)[number];
export type Emotion = (typeof EMOTIONS)[number];
export type Status = (typeof STATUSES)[number];

/** Tối đa 2 phụ kiện; hai loại kính, hai loại mũ không đeo cùng lúc. */
export const MAX_EXTRAS = 2;
const CLASH: Extra[][] = [
  ["Kính", "Kính râm"],
  ["Mũ lưỡi trai", "Mũ len"],
];

/** Bật hoặc tắt một phụ kiện, giữ đúng luật: món cùng nhóm thay nhau, quá 2 món thì bỏ món chọn sớm nhất. */
export function toggleExtra(list: Extra[], e: Extra): Extra[] {
  if (list.includes(e)) return list.filter((x) => x !== e);
  const group = CLASH.find((g) => g.includes(e)) ?? [];
  const next = [...list.filter((x) => !group.includes(x)), e];
  return next.slice(-MAX_EXTRAS);
}

export const SKINS = ["#fbe0cc", "#f3c6a3", "#dfa77f", "#bb7f57", "#8c5a3c"];
export const HAIR_COLORS = ["#1d1a17", "#4a2f1f", "#8a5a2b", "#e0b04e", "#a3a8ad", "#1d6b1d"];
export const OUTFIT_COLORS = ["#06110a", "#5bd13a", "#1d6b1d", "#f4f6f1", "#6bb3e8", "#e8875f", "#a491ee", "#f2c13a"];
export const BACKGROUNDS = ["#dcf6cf", "#f2f5ef", "#5bd13a", "#06110a", "#fff1c2", "#ddeffb", "#fde4ec", "#ebe6fd"];

export interface Character {
  style: CharacterStyle;
  skin: number;
  hair: Hair;
  hairColor: number;
  outfit: Outfit;
  outfitColor: number;
  extras: Extra[];
  emotion: Emotion;
  bg: number;
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function picker(seed: number) {
  let a = seed;
  return <T>(list: readonly T[]) => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return list[a % list.length];
  };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Nhân vật sinh cố định theo một chuỗi (tên tài khoản), dùng khi người đó chưa tự phối. */
export function characterFor(seed: string): Character {
  const pick = picker(hash(seed));
  const extra = pick<Extra | null>([null, null, "Kính", "Mũ lưỡi trai", "Tai nghe", "Khuyên tai", "Mũ len"]);
  return {
    style: "cartoon",
    skin: pick(range(SKINS.length)),
    hair: pick(HAIRS),
    hairColor: pick([0, 0, 1, 1, 2, 3, 4]),
    outfit: pick(OUTFITS),
    outfitColor: pick(range(OUTFIT_COLORS.length)),
    extras: extra ? [extra] : [],
    emotion: pick(["Cười nhe răng", "Cười nhe răng", "Mỉm cười", "Nháy mắt", "Tự tin"] as const),
    bg: pick([0, 1, 4, 5, 6, 7]),
  };
}

/** Phối ngẫu nhiên, giữ nguyên kiểu vẽ đang chọn. */
export function randomCharacter(style: CharacterStyle, seed: string): Character {
  return { ...characterFor(seed), style };
}

/** Nhân vật và trạng thái của những người có sẵn trong bản dùng thử. */
export const PRESETS: Record<string, { character: Character; status: Status }> = {
  giahuy: {
    character: { style: "cartoon", skin: 1, hair: "Ngắn", hairColor: 0, outfit: "Hoodie", outfitColor: 0, extras: ["Tai nghe"], emotion: "Cười nhe răng", bg: 0 },
    status: "Không hiện",
  },
  thuha: {
    character: { style: "cartoon", skin: 0, hair: "Tóc dài", hairColor: 1, outfit: "Blazer", outfitColor: 6, extras: ["Khuyên tai"], emotion: "Mỉm cười", bg: 6 },
    status: "Sẵn sàng nhận việc",
  },
  quocbao: {
    character: { style: "cartoon", skin: 2, hair: "Đầu đinh", hairColor: 0, outfit: "Sơ mi", outfitColor: 4, extras: ["Kính"], emotion: "Tự tin", bg: 5 },
    status: "Đang làm việc",
  },
  minhkhoa: {
    character: { style: "cartoon", skin: 1, hair: "Mái dài", hairColor: 2, outfit: "Áo thun", outfitColor: 1, extras: [], emotion: "Nháy mắt", bg: 1 },
    status: "Đang học",
  },
  ngocanh: {
    character: { style: "cartoon", skin: 1, hair: "Búi", hairColor: 0, outfit: "Áo len", outfitColor: 7, extras: [], emotion: "Suy nghĩ", bg: 4 },
    status: "Tìm cộng sự",
  },
  hoanglong: {
    character: { style: "pixel", skin: 3, hair: "Xoăn", hairColor: 0, outfit: "Áo thun", outfitColor: 5, extras: ["Mũ lưỡi trai", "Kính"], emotion: "Cười nhe răng", bg: 7 },
    status: "Nghỉ giải lao",
  },
};

/** Làm tối hoặc sáng một màu hex theo tỉ lệ (âm là tối đi). */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Màu áo sáng thì chi tiết vẽ tối đi, màu áo tối thì chi tiết sáng lên. */
export function detailOf(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 140 ? shade(hex, -0.25) : shade(hex, 0.3);
}

/** Đọc bản lưu cũ (một phụ kiện `extra`, không có cảm xúc) mà không làm hỏng trang. */
export function normalize(c: Partial<Character> & { extra?: string }, fallback: Character): Character {
  const extras = Array.isArray(c.extras) ? c.extras : c.extra && c.extra !== "Không" ? [c.extra as Extra] : fallback.extras;
  return {
    ...fallback,
    ...c,
    extras: extras.filter((e): e is Extra => (EXTRAS as readonly string[]).includes(e)).slice(0, MAX_EXTRAS),
    emotion: (EMOTIONS as readonly string[]).includes(c.emotion ?? "") ? (c.emotion as Emotion) : fallback.emotion,
  };
}

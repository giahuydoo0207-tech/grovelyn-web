"use client";

import { useSyncExternalStore } from "react";
import { ME, userOf, type CoverTone } from "./data";
import { PRESETS, characterFor, normalize, type Character, type Status } from "./character";
import { persisted } from "./persist";

/**
 * Diện mạo trên hồ sơ: ảnh đại diện (nhân vật, ảnh thật hoặc chữ cái đầu), trạng thái và ảnh bìa.
 * Của bạn thì lưu trên trình duyệt; người khác trong bản dùng thử dùng nhân vật có sẵn.
 */
export type AvatarMode = "character" | "photo" | "initials";
export type Cover = { kind: "garden"; seed: number } | { kind: "photo"; src: string; original?: string };

export interface SavedOutfit {
  id: string;
  name: string;
  character: Character;
}

export const MAX_OUTFITS = 6;

export interface Look {
  mode: AvatarMode;
  character: Character;
  /** Ảnh đã cắt khung tròn (data URL) và ảnh gốc để căn lại. */
  photo?: string;
  photoOriginal?: string;
  initialsTone: CoverTone;
  /** null: luống vườn mặc định theo tên tài khoản. */
  cover: Cover | null;
  status: Status;
  /** Mốc tự tắt trạng thái (ms). null: không tự tắt. */
  statusUntil: number | null;
  /** Bộ phối đã lưu để đổi nhanh. */
  outfits: SavedOutfit[];
}

/** Ba bộ phối mẫu cho tài khoản dùng thử. */
const SAMPLE_OUTFITS = (base: Character): SavedOutfit[] => [
  { id: "di-hoc", name: "Đi học", character: { ...base, outfit: "Áo thun", outfitColor: 1, extras: ["Tai nghe"], emotion: "Cười nhe răng", bg: 0 } },
  { id: "di-lam", name: "Đi làm", character: { ...base, outfit: "Blazer", outfitColor: 0, extras: ["Kính"], emotion: "Tự tin", bg: 5 } },
  { id: "di-choi", name: "Đi chơi", character: { ...base, outfit: "Hoodie", outfitColor: 5, extras: ["Mũ lưỡi trai", "Kính râm"], emotion: "Nháy mắt", bg: 4 } },
];

export const STATUS_KEEP: Status[] = ["Sẵn sàng nhận việc", "Tìm cộng sự"];

export function lookFor(handle: string): Look {
  const preset = PRESETS[handle];
  return {
    mode: "character",
    character: preset?.character ?? characterFor(handle),
    initialsTone: userOf(handle)?.tone ?? "sap",
    cover: null,
    status: preset?.status ?? "Không hiện",
    statusUntil: null,
    outfits: handle === ME ? SAMPLE_OUTFITS(preset?.character ?? characterFor(handle)) : [],
  };
}

export const lookStore = persisted<Look>("look", lookFor(ME));

/** Đồng hồ phút, để trạng thái tự tắt đúng giờ mà không phải tải lại trang. */
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const ticks = new Set<() => void>();
function subscribeClock(fn: () => void) {
  ticks.add(fn);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      ticks.forEach((t) => t());
    }, 60_000);
  }
  return () => {
    ticks.delete(fn);
    if (!ticks.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => now,
    () => 0,
  );
}

/** Diện mạo của một người, đã tính trạng thái hết hạn. */
export function useLook(handle: string): Look {
  const mine = lookStore.use();
  const time = useNow();
  if (handle !== ME) return lookFor(handle);
  const base = lookFor(ME);
  const look: Look = {
    ...base,
    ...mine,
    character: normalize(mine.character ?? {}, base.character),
    outfits: (mine.outfits ?? base.outfits).map((o) => ({ ...o, character: normalize(o.character, base.character) })),
  };
  if (look.statusUntil && time && time > look.statusUntil) return { ...look, status: "Không hiện", statusUntil: null };
  return look;
}

export const setLook = (patch: Partial<Look>) => lookStore.set((cur) => ({ ...cur, ...patch }));

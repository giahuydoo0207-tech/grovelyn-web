"use client";

import { useSyncExternalStore } from "react";

/**
 * Kho dữ liệu lưu trong localStorage của trình duyệt. Mọi thứ người dùng làm trong bản dùng thử
 * (bài đăng, trao đổi, tin nhắn, dự án mới, lượt thích…) nằm ở đây, tải lại trang vẫn còn.
 *
 * Server không có localStorage nên luôn trả về dữ liệu mẫu; trình duyệt đọc bản đã lưu ngay sau khi hydrate.
 * Đổi `VERSION` khi cấu trúc dữ liệu đổi, để bản lưu cũ không làm hỏng trang.
 */
const VERSION = 1;
const PREFIX = `grovelyn:v${VERSION}:`;

export interface Store<T> {
  get(): T;
  set(next: T | ((cur: T) => T)): void;
  use(): T;
  reset(): void;
}

const stores: Store<unknown>[] = [];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Hết dung lượng hoặc trình duyệt chặn lưu: vẫn chạy bình thường trong phiên này.
  }
}

export function persisted<T>(key: string, initial: T): Store<T> {
  let state: T | undefined;
  const listeners = new Set<() => void>();
  const load = () => (state === undefined ? (state = typeof window === "undefined" ? initial : read(key, initial)) : state);
  const emit = () => listeners.forEach((fn) => fn());
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  // Tab khác đổi dữ liệu thì tab này cập nhật theo.
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === PREFIX + key) {
        state = read(key, initial);
        emit();
      }
    });
  }

  const store: Store<T> = {
    get: load,
    set(next) {
      state = typeof next === "function" ? (next as (cur: T) => T)(load()) : next;
      write(key, state);
      emit();
    },
    use: () => useSyncExternalStore(subscribe, load, () => initial),
    reset() {
      try {
        window.localStorage.removeItem(PREFIX + key);
      } catch {}
      state = initial;
      emit();
    },
  };
  stores.push(store as Store<unknown>);
  return store;
}

/** Xoá mọi dữ liệu bản dùng thử trên trình duyệt này, quay về nội dung mẫu. */
export function resetAll() {
  stores.forEach((s) => s.reset());
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("grovelyn:") || k.startsWith("grovelyn-journey"))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {}
}

/** Tập hợp id dạng bật/tắt (đã thích, đã lưu, đang theo dõi…). */
export function persistedSet(key: string, initial: string[] = []) {
  const s = persisted<string[]>(key, initial);
  return {
    ...s,
    has: (id: string) => s.get().includes(id),
    toggle: (id: string) => s.set((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    add: (id: string) => s.set((cur) => (cur.includes(id) ? cur : [...cur, id])),
  };
}

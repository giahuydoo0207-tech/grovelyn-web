"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Ảnh và video của bản dùng thử, lưu ngay trên trình duyệt:
 * - Ảnh: thu nhỏ còn tối đa 1600px rồi lưu dạng data URL cùng bài đăng (localStorage).
 * - Video: quá lớn cho localStorage nên lưu vào IndexedDB, bài đăng chỉ giữ mã `idb:<id>`.
 */

export async function compressImage(file: Blob, max = 1600, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = fail;
      i.src = url;
    });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * k));
    c.height = Math.max(1, Math.round(img.naturalHeight * k));
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const DB = "grovelyn-media";
const STORE = "files";

function db(): Promise<IDBDatabase> {
  return new Promise((ok, fail) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => ok(req.result);
    req.onerror = () => fail(req.error);
  });
}

export async function saveBlob(blob: Blob): Promise<string> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const d = await db();
  await new Promise<void>((ok, fail) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => ok();
    tx.onerror = () => fail(tx.error);
  });
  const key = `idb:${id}`;
  urls.set(key, URL.createObjectURL(blob));
  emit();
  return key;
}

async function loadBlob(id: string): Promise<Blob | undefined> {
  const d = await db();
  return new Promise((ok) => {
    const req = d.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => ok(req.result as Blob | undefined);
    req.onerror = () => ok(undefined);
  });
}

export async function clearMedia() {
  try {
    const d = await db();
    d.transaction(STORE, "readwrite").objectStore(STORE).clear();
  } catch {}
  urls.clear();
  emit();
}

const urls = new Map<string, string>();
const pending = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Đổi `idb:<id>` thành đường dẫn phát được; đường dẫn thường thì trả lại nguyên. */
export function useMediaSrc(src: string | undefined): string | undefined {
  const local = !!src && src.startsWith("idb:");
  const url = useSyncExternalStore(
    subscribe,
    () => (local ? urls.get(src!) : src),
    () => (local ? undefined : src),
  );
  useEffect(() => {
    if (!local || urls.has(src!) || pending.has(src!)) return;
    pending.add(src!);
    loadBlob(src!.slice(4)).then((b) => {
      pending.delete(src!);
      if (b) {
        urls.set(src!, URL.createObjectURL(b));
        emit();
      }
    });
  }, [local, src]);
  return url;
}

"use client";

import { useSyncExternalStore } from "react";
import { TOPICS, type Topic } from "./exchange";

/**
 * Một bản ghi trao đổi dùng chung cho tab Trao đổi, trang chi tiết và trang dự án, để góp ý gửi ở chỗ này
 * hiện ngay ở chỗ kia. Bản giao diện: chỉ giữ trong phiên, tải lại trang là về dữ liệu mẫu.
 */
let state: Topic[] = TOPICS;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = () => listeners.forEach((fn) => fn());

export const useTopics = () => useSyncExternalStore(subscribe, () => state, () => TOPICS);

export function updateTopic(id: string, fn: (t: Topic) => Topic) {
  state = state.map((t) => (t.id === id ? fn(t) : t));
  emit();
}

export function addTopic(t: Topic) {
  state = [t, ...state];
  emit();
}

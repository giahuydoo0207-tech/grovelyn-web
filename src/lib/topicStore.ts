"use client";

import { TOPICS, type Topic } from "./exchange";
import { persisted } from "./persist";

/**
 * Một bản ghi trao đổi dùng chung cho tab Trao đổi, trang chi tiết và trang dự án, để góp ý gửi ở chỗ này
 * hiện ngay ở chỗ kia. Lưu trong localStorage: tải lại trang vẫn còn.
 */
const store = persisted<Topic[]>("topics", TOPICS);

export const useTopics = store.use;

export function updateTopic(id: string, fn: (t: Topic) => Topic) {
  store.set((all) => all.map((t) => (t.id === id ? fn(t) : t)));
}

export function addTopic(t: Topic) {
  store.set((all) => [t, ...all]);
}

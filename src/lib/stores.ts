"use client";

import { ME, POSTS, groupOf, projectOf, projectsBy, userOf, type Group, type Post, type Project, type User } from "./data";
import { eventOf, type CommunityEvent } from "./events";
import { persisted, persistedSet } from "./persist";

/**
 * Các kho dữ liệu của bản dùng thử, lưu trong localStorage. Mỗi kho bắt đầu từ dữ liệu mẫu;
 * những gì người dùng thêm, sửa, bấm sẽ được lưu lại trên trình duyệt này.
 */

/** Bài đăng ở Trang chủ và trong nhóm, kèm bình luận. */
export const postsStore = persisted<Post[]>("posts", POSTS);
export const updatePost = (id: string, fn: (p: Post) => Post) => postsStore.set((all) => all.map((p) => (p.id === id ? fn(p) : p)));

/** Cảm xúc bạn đã bấm cho từng bài. */
export const reactionsStore = persisted<Record<string, string>>("reactions", {});
export const setReaction = (postId: string, key: string | null) =>
  reactionsStore.set((cur) => {
    const next = { ...cur };
    if (key) next[postId] = key;
    else delete next[postId];
    return next;
  });

/** Bài Tìm cộng sự bạn đã xin tham gia. */
export const joinRequests = persistedSet("join-requests");

/** Dự án bạn tạo trong bản dùng thử. */
export const myProjectsStore = persisted<Project[]>("projects", []);

/** Tìm dự án ở cả dữ liệu mẫu lẫn dự án bạn vừa tạo. */
export function useProject(slug: string | undefined): Project | undefined {
  const mine = myProjectsStore.use();
  if (!slug) return undefined;
  return projectOf(slug) ?? mine.find((p) => p.slug === slug);
}

/** Dự án bạn tham gia, gồm cả dự án vừa tạo. */
export function useMyProjects(): Project[] {
  return [...myProjectsStore.use(), ...projectsBy(ME)];
}

/** Nhóm và sự kiện bạn tạo. */
export const myGroupsStore = persisted<Group[]>("groups", []);
export const myEventsStore = persisted<CommunityEvent[]>("events", []);
export function useGroup(slug: string): Group | undefined {
  const mine = myGroupsStore.use();
  return groupOf(slug) ?? mine.find((g) => g.slug === slug);
}
export function useEvent(slug: string): CommunityEvent | undefined {
  const mine = myEventsStore.use();
  return eventOf(slug) ?? mine.find((e) => e.slug === slug);
}

/** Dự án đã thích, đã lưu; người đang theo dõi. */
export const likedProjects = persistedSet("liked-projects");
export const savedProjects = persistedSet("saved-projects", ["nha-pho-thong-gio", "chuoi-cung-ung-ca-phe", "robot-phan-loai-rac"]);
export const following = persistedSet("following");

/** Thông báo đã đọc. */
export const readNotices = persistedSet("read-notices");

/** Nhóm: đã tham gia, đã xin vào; sự kiện: quan tâm, đã đăng ký. */
export const joinedGroups = persistedSet("joined-groups");
export const askedGroups = persistedSet("asked-groups");
export const leftGroups = persistedSet("left-groups");
export const interestedEvents = persistedSet("interested-events", ["portfolio-trai-nganh"]);
export const registeredEvents = persistedSet("registered-events");

export type GroupStatus = "member" | "none" | "asked";

/** Trạng thái của bạn với một nhóm, dùng chung cho trang Nhóm và trang chi tiết nhóm. */
export function useGroupStatus(slug: string, joinedByDefault: boolean): [GroupStatus, (s: GroupStatus) => void] {
  const joined = joinedGroups.use();
  const asked = askedGroups.use();
  const left = leftGroups.use();
  const status: GroupStatus = asked.includes(slug) ? "asked" : joined.includes(slug) || (joinedByDefault && !left.includes(slug)) ? "member" : "none";
  const set = (next: GroupStatus) => {
    joinedGroups.set((l) => l.filter((x) => x !== slug));
    askedGroups.set((l) => l.filter((x) => x !== slug));
    leftGroups.set((l) => l.filter((x) => x !== slug));
    if (next === "member") joinedGroups.add(slug);
    if (next === "asked") askedGroups.add(slug);
    if (next === "none" && joinedByDefault) leftGroups.add(slug);
  };
  return [status, set];
}

/** Toàn bộ lựa chọn trong Cài đặt, gồm tên, dòng giới thiệu và nơi sống hiện trên hồ sơ. */
export interface Prefs {
  name: string;
  headline: string;
  location: string;
  language: "vi" | "en";
  theme: "light" | "system";
  twoStep: boolean;
  profileAudience: "everyone" | "members" | "followers";
  showOnline: boolean;
  findableByEmail: boolean;
  whoCanMessage: "everyone" | "following" | "nobody";
  readReceipts: boolean;
  notify: Record<string, boolean>;
  digest: "daily" | "weekly" | "off";
}

const me = userOf(ME)!;

export const PREF_DEFAULTS: Prefs = {
  name: me.name,
  headline: me.headline,
  location: me.location,
  language: "vi",
  theme: "light",
  twoStep: false,
  profileAudience: "everyone",
  showOnline: true,
  findableByEmail: false,
  whoCanMessage: "everyone",
  readReceipts: true,
  notify: { messages: true, comments: true, groups: true, events: true, partners: false },
  digest: "weekly",
};

export const prefsStore = persisted<Prefs>("prefs", PREF_DEFAULTS);

/** Người dùng theo handle; với tài khoản đang dùng thì áp tên, giới thiệu, nơi sống đã sửa trong Cài đặt. */
export function useUser(handle: string): User | undefined {
  const prefs = prefsStore.use();
  const u = userOf(handle);
  if (!u || handle !== ME) return u;
  return { ...u, name: prefs.name, headline: prefs.headline, location: prefs.location };
}

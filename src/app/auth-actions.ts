"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PROTECTED, SESSION_COOKIE } from "@/lib/session";

/** Chỉ cho quay về đường dẫn nội bộ thuộc khu cần đăng nhập, tránh chuyển hướng ra trang ngoài. */
function safeNext(next: unknown) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/community";
  return PROTECTED.some((p) => next === p || next.startsWith(`${p}/`)) ? next : "/community";
}

export async function signIn(next?: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(safeNext(next));
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/?da-dang-xuat=1");
}

/** Mở bản demo từ trang giới thiệu công khai: vào bằng tài khoản mẫu, đi thẳng tới trang được chọn. */
export async function enterDemo(form: FormData) {
  const next = form.get("next");
  await signIn(typeof next === "string" ? next : "/community");
}

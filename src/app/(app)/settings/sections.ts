/** Các mục trong trang Cài đặt. Không có mục dữ liệu quảng cáo vì Grovelyn không chạy quảng cáo. */
export const SECTIONS = [
  { slug: "account", label: "Tài khoản", desc: "Hồ sơ, ngôn ngữ và giao diện" },
  { slug: "security", label: "Đăng nhập và bảo mật", desc: "Email, xác minh 2 bước, thiết bị" },
  { slug: "visibility", label: "Hiển thị hồ sơ", desc: "Ai thấy bạn và những gì họ thấy" },
  { slug: "privacy", label: "Quyền riêng tư dữ liệu", desc: "Tin nhắn, tải dữ liệu, xoá tài khoản" },
  { slug: "notifications", label: "Thông báo", desc: "Báo gì, báo qua đâu" },
  { slug: "help", label: "Trợ giúp", desc: "Câu hỏi thường gặp và góp ý" },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];

export const sectionOf = (slug: string) => SECTIONS.find((s) => s.slug === slug);

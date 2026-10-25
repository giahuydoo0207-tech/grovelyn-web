/** Đường dẫn ngắn từ tên tiếng Việt, kèm đuôi ngẫu nhiên để không trùng. */
export const slugify = (t: string) =>
  `${
    t
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "moi"
  }-${Date.now().toString(36).slice(-4)}`;

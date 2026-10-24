import type { Phase } from "./showcase";

/**
 * Mô hình nội dung chung cho mọi ngành. Một dự án có bốn trường độc lập:
 * lĩnh vực (để lọc), dạng đầu ra (người dùng đang công bố thứ gì), bối cảnh (làm trong hoàn cảnh nào)
 * và mẫu trình bày (tự gợi ý theo dạng đầu ra, người dùng đổi được).
 */

export type Layout = "visual" | "case" | "report";

export const OUTPUTS = [
  { id: "Bản thiết kế", layout: "visual", examples: "kiến trúc, giao diện, nhận diện, sản phẩm" },
  { id: "Phần mềm hoặc công cụ", layout: "case", examples: "website, ứng dụng, tiện ích" },
  { id: "Sản phẩm kỹ thuật", layout: "case", examples: "thiết bị, mô hình, nguyên mẫu" },
  { id: "Chiến dịch hoặc chương trình", layout: "case", examples: "marketing, truyền thông, cộng đồng" },
  { id: "Kế hoạch hoặc đề án", layout: "case", examples: "kinh doanh, vận hành, đề xuất cải tiến" },
  { id: "Báo cáo hoặc phân tích", layout: "report", examples: "nghiên cứu, thị trường, tài chính" },
  { id: "Nội dung hoặc ấn phẩm", layout: "visual", examples: "bài viết, video, tài liệu hướng dẫn" },
  { id: "Khác", layout: "case", examples: "ghi rõ ở phần giới thiệu" },
] as const satisfies readonly { id: string; layout: Layout; examples: string }[];

export type Output = (typeof OUTPUTS)[number]["id"];

/** Bối cảnh rộng để lọc; chi tiết như "Đồ án tốt nghiệp" ghi ở `contextNote`. */
export const CONTEXTS = ["Học tập", "Công việc", "Cuộc thi hoặc sự kiện", "Dự án cá nhân", "Cộng đồng hoặc tình nguyện"] as const;
export type Context = (typeof CONTEXTS)[number];

/** Tình hình áp dụng: tách khỏi tiến độ, vì một ứng dụng đã chạy thật vẫn có thể đang làm tiếp. Không bắt buộc. */
export const USAGES = ["Chưa triển khai", "Đang dùng thử", "Đã dùng thực tế"] as const;
export type Usage = (typeof USAGES)[number];

export const layoutOf = (o: Output): Layout => OUTPUTS.find((x) => x.id === o)?.layout ?? "case";

/** Ba mẫu trình bày dùng chung khối nội dung; chỉ khác thứ tự và đề mục gợi ý. Đề mục nào cũng không bắt buộc. */
export const LAYOUTS: Record<Layout, { name: string; hint: string; sections: { heading: string; prompt: string }[] }> = {
  visual: {
    name: "Trưng bày trực quan",
    hint: "Ảnh lớn đi trước, chữ giải thích các quyết định",
    sections: [
      { heading: "Bối cảnh và bài toán", prompt: "Khu đất, khách hàng hoặc yêu cầu ban đầu ra sao?" },
      { heading: "Ý tưởng", prompt: "Hướng đi chính và vì sao chọn nó." },
      { heading: "Quyết định chính", prompt: "Hai, ba quyết định quan trọng nhất, mỗi quyết định gắn với một ảnh." },
      { heading: "Nếu làm lại", prompt: "Bạn sẽ sửa gì nếu làm lại?" },
    ],
  },
  case: {
    name: "Hồ sơ dự án",
    hint: "Bài toán, cách làm, đầu ra và kết quả",
    sections: [
      { heading: "Bài toán", prompt: "Ai đang gặp khó gì, vì sao đáng làm?" },
      { heading: "Cách làm", prompt: "Bạn đã thử những gì, chọn hướng nào." },
      { heading: "Đầu ra", prompt: "Sản phẩm, ấn phẩm hoặc kế hoạch cụ thể." },
      { heading: "Kết quả", prompt: "Ghi rõ là số liệu thực tế hay dự kiến." },
      { heading: "Nếu làm lại", prompt: "Bạn sẽ sửa gì nếu làm lại?" },
    ],
  },
  report: {
    name: "Báo cáo",
    hint: "Nội dung theo mục, có phương pháp và hạn chế",
    sections: [
      { heading: "Câu hỏi", prompt: "Bạn muốn trả lời câu hỏi gì?" },
      { heading: "Phạm vi và phương pháp", prompt: "Nghiên cứu ở đâu, bao lâu, bằng cách nào." },
      { heading: "Nguồn dữ liệu", prompt: "Dữ liệu lấy từ đâu, bao nhiêu mẫu." },
      { heading: "Phát hiện chính", prompt: "Dữ liệu cho thấy điều gì." },
      { heading: "Đề xuất và hạn chế", prompt: "Đề xuất gì, và kết luận này chưa áp dụng được ở đâu." },
    ],
  },
};

/** Giải thích tiến độ theo dạng đầu ra. */
export function levelHint(o: Output, p: Phase): string {
  if (p === "paused") return "Đang tạm dừng";
  if (o === "Bản thiết kế") return { concept: "Đang phác thảo", draft: "Đang triển khai hồ sơ", final: "Xong hồ sơ thiết kế" }[p];
  if (layoutOf(o) === "report") return { concept: "Đang xác định câu hỏi", draft: "Đang thu thập, phân tích", final: "Đã hoàn tất báo cáo" }[p];
  if (o === "Chiến dịch hoặc chương trình" || o === "Kế hoạch hoặc đề án") return { concept: "Đang lên ý tưởng", draft: "Đang chuẩn bị", final: "Xong kế hoạch" }[p];
  return { concept: "Đang lên ý tưởng", draft: "Đang làm", final: "Xong bản dùng được" }[p];
}

/** Được công bố lên Trang chủ khi đã Hoàn tất, hoặc đã có người dùng thật dù vẫn đang làm tiếp. */
export const canAnnounce = (phase: Phase, usage?: Usage) => phase === "final" || usage === "Đã dùng thực tế";

/** Câu cuối của mẫu trình bày đổi theo tiến độ: dự án đang làm chưa thể "làm lại". */
export const sectionsFor = (layout: Layout, phase: Phase) =>
  LAYOUTS[layout].sections.map((s) =>
    s.heading === "Nếu làm lại" && phase !== "final" ? { heading: "Muốn cải thiện điều gì", prompt: "Bạn đang muốn làm tốt hơn ở chỗ nào?" } : s,
  );

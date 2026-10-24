import type { Phase } from "./showcase";

/**
 * Mô hình nội dung chung cho mọi ngành. Một dự án có bốn trường độc lập:
 * lĩnh vực (để lọc), dạng đầu ra (người dùng đang công bố thứ gì), bối cảnh (làm trong hoàn cảnh nào)
 * và mẫu trình bày (tự gợi ý theo dạng đầu ra, người dùng đổi được).
 */

export type Layout = "visual" | "case" | "report";

export const OUTPUTS = [
  { id: "Đồ án kiến trúc", layout: "visual" },
  { id: "Bộ nhận diện", layout: "visual" },
  { id: "Thiết kế giao diện", layout: "visual" },
  { id: "Ứng dụng hoặc website", layout: "case" },
  { id: "Nguyên mẫu kỹ thuật", layout: "case" },
  { id: "Chiến dịch", layout: "case" },
  { id: "Kế hoạch kinh doanh", layout: "case" },
  { id: "Báo cáo nghiên cứu", layout: "report" },
  { id: "Bài phân tích", layout: "report" },
  { id: "Khác", layout: "case" },
] as const satisfies readonly { id: string; layout: Layout }[];

export type Output = (typeof OUTPUTS)[number]["id"];

export const CONTEXTS = ["Học phần", "Đồ án tốt nghiệp", "Công việc", "Dự án cá nhân", "Cuộc thi hoặc sự kiện"] as const;
export type Context = (typeof CONTEXTS)[number];

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

/** Mẫu Báo cáo không có mức "Đã triển khai". */
export const levelsFor = (o: Output): Phase[] => (layoutOf(o) === "report" ? ["concept", "draft", "final"] : ["concept", "draft", "final", "shipped"]);

/** Giải thích mức thực hiện theo dạng đầu ra, để "Hoàn tất" không bị hiểu là "đã xây" hay "đã chạy". */
export function levelHint(o: Output, p: Phase): string {
  if (o === "Đồ án kiến trúc") return { concept: "Đang phác thảo", draft: "Đang triển khai hồ sơ", final: "Xong hồ sơ thiết kế, chưa thi công", shipped: "Đã thi công" }[p];
  if (o === "Chiến dịch") return { concept: "Đang lên ý tưởng", draft: "Đang chuẩn bị", final: "Xong kế hoạch, chưa chạy", shipped: "Đã chạy chiến dịch" }[p];
  if (o === "Kế hoạch kinh doanh") return { concept: "Đang lên ý tưởng", draft: "Đang viết", final: "Xong kế hoạch", shipped: "Đã bắt đầu kinh doanh" }[p];
  if (layoutOf(o) === "report") return { concept: "Đang xác định câu hỏi", draft: "Đang thu thập, phân tích", final: "Đã hoàn tất báo cáo", shipped: "Đã hoàn tất báo cáo" }[p];
  return { concept: "Đang lên ý tưởng", draft: "Đang làm", final: "Xong bản dùng được", shipped: "Đã đưa vào dùng thật" }[p];
}

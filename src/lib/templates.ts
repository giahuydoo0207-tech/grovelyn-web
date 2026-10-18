import type { Field } from "./data";

/**
 * Khung trình bày theo ngành: vài thông số chính và các phần nên kể. Người mới chỉ cần điền theo khung là trang dự
 * án đã đủ ý; người quen tay có thể bỏ qua phần không cần.
 */
export interface FactSlot {
  key: string;
  label: string;
  placeholder: string;
}

export interface FieldTemplate {
  facts: FactSlot[];
  sections: { heading: string; prompt: string }[];
  /** Ngành hay có ảnh trước/sau (cải tạo, thi công). */
  beforeAfter?: boolean;
}

export const TEMPLATES: Record<Field, FieldTemplate> = {
  "Kiến trúc": {
    facts: [
      { key: "area", label: "Diện tích", placeholder: "64 m² đất, 160 m² sàn" },
      { key: "location", label: "Địa điểm", placeholder: "Bình Thạnh, TP.HCM" },
      { key: "cost", label: "Chi phí dự kiến", placeholder: "1,8 tỷ đồng" },
      { key: "time", label: "Thời gian", placeholder: "12 tuần" },
    ],
    sections: [
      { heading: "Hiện trạng", prompt: "Khu đất, công trình cũ hoặc yêu cầu ban đầu ra sao?" },
      { heading: "Giải pháp", prompt: "Bạn xử lý không gian, ánh sáng, vật liệu thế nào?" },
      { heading: "Kết quả", prompt: "Công trình khác trước ở điểm nào? Có số đo, phản hồi nào không?" },
    ],
    beforeAfter: true,
  },
  "Thiết kế": {
    facts: [
      { key: "client", label: "Khách hàng", placeholder: "Quán trà Mây, Đà Nẵng" },
      { key: "role", label: "Vai trò", placeholder: "Thiết kế chính" },
      { key: "time", label: "Thời gian", placeholder: "3 tuần" },
      { key: "deliverables", label: "Bàn giao", placeholder: "Logo, bảng màu, bao bì" },
    ],
    sections: [
      { heading: "Vấn đề", prompt: "Khách hàng hoặc người dùng đang gặp chuyện gì?" },
      { heading: "Quá trình", prompt: "Bạn đã thử những hướng nào, vì sao bỏ, vì sao chọn?" },
      { heading: "Kết quả", prompt: "Bản cuối giải quyết vấn đề ra sao?" },
    ],
  },
  Marketing: {
    facts: [
      { key: "goal", label: "Mục tiêu", placeholder: "10.000 lượt dùng thử trong 6 tuần" },
      { key: "budget", label: "Ngân sách", placeholder: "45 triệu đồng" },
      { key: "kpi", label: "KPI", placeholder: "CPA dưới 15.000đ" },
      { key: "result", label: "Kết quả", placeholder: "12.400 lượt, CPA 11.200đ" },
    ],
    sections: [
      { heading: "Bối cảnh", prompt: "Thương hiệu, thị trường và khách hàng mục tiêu." },
      { heading: "Chiến lược", prompt: "Thông điệp, kênh, lịch triển khai." },
      { heading: "Kết quả", prompt: "Số liệu đạt được so với KPI và điều rút ra." },
    ],
  },
  "Công nghệ thông tin": {
    facts: [
      { key: "stack", label: "Công nghệ", placeholder: "Next.js, PostgreSQL" },
      { key: "users", label: "Người dùng", placeholder: "Chủ quán và khách đặt bàn" },
      { key: "status", label: "Trạng thái", placeholder: "Chạy thử tại 1 quán" },
      { key: "role", label: "Vai trò", placeholder: "Giao diện" },
    ],
    sections: [
      { heading: "Vấn đề", prompt: "Ai đang gặp khó gì, hiện họ xoay xở thế nào?" },
      { heading: "Giải pháp", prompt: "Sản phẩm làm được gì, kiến trúc ra sao?" },
      { heading: "Kết quả", prompt: "Đã chạy thử chưa, số liệu hoặc phản hồi thế nào?" },
    ],
  },
  "Kinh tế": {
    facts: [
      { key: "scope", label: "Phạm vi", placeholder: "Đắk Lắk, 2024–2026" },
      { key: "data", label: "Dữ liệu", placeholder: "32 phỏng vấn, số liệu giá" },
      { key: "method", label: "Phương pháp", placeholder: "Phân tích chuỗi giá trị" },
    ],
    sections: [
      { heading: "Câu hỏi", prompt: "Bạn muốn trả lời câu hỏi gì?" },
      { heading: "Phân tích", prompt: "Dữ liệu cho thấy điều gì?" },
      { heading: "Kết luận", prompt: "Kết luận và đề xuất." },
    ],
  },
  "Kỹ thuật": {
    facts: [
      { key: "parts", label: "Linh kiện chính", placeholder: "Arduino Uno, servo MG996R, camera" },
      { key: "spec", label: "Thông số", placeholder: "Gắp đúng 92% trong 200 lần thử" },
      { key: "cost", label: "Chi phí", placeholder: "1,2 triệu đồng" },
    ],
    sections: [
      { heading: "Bài toán", prompt: "Cần giải quyết chuyện gì, ràng buộc ra sao?" },
      { heading: "Thiết kế", prompt: "Cơ khí, mạch, phần mềm." },
      { heading: "Thử nghiệm", prompt: "Cách đo, kết quả và lỗi còn lại." },
    ],
  },
  "Truyền thông": {
    facts: [
      { key: "channel", label: "Kênh", placeholder: "TikTok, Facebook" },
      { key: "audience", label: "Đối tượng", placeholder: "Sinh viên năm nhất" },
      { key: "reach", label: "Lượt tiếp cận", placeholder: "120.000" },
    ],
    sections: [
      { heading: "Ý tưởng", prompt: "Câu chuyện muốn kể là gì?" },
      { heading: "Sản xuất", prompt: "Kịch bản, quay, dựng." },
      { heading: "Kết quả", prompt: "Lượt xem, phản hồi, điều rút ra." },
    ],
  },
};

import { ME, projectOf } from "./data";

/** Kiểu trao đổi chủ dự án muốn nhận. */
export type TopicKind = "Xin ý kiến" | "Dùng thử" | "Cùng chỉnh" | "Cùng làm";
export type TopicStatus = "open" | "active" | "done";
export type TopicTime = "5 phút" | "15 phút" | "Một buổi";

export const TOPIC_KINDS: { kind: TopicKind; hint: string }[] = [
  { kind: "Xin ý kiến", hint: "Nhận xét, chọn phương án" },
  { kind: "Dùng thử", hint: "Dùng rồi báo lại chỗ vướng" },
  { kind: "Cùng chỉnh", hint: "Cùng sửa một chỗ cụ thể" },
  { kind: "Cùng làm", hint: "Nhận một phần việc nhỏ" },
];
export const TOPIC_TIMES: TopicTime[] = ["5 phút", "15 phút", "Một buổi"];

export const STATUS_LABEL: Record<TopicStatus, string> = {
  open: "Đang mở",
  active: "Đang trao đổi",
  done: "Đã giải quyết",
};

/** Mỗi dự án mở được tối đa chừng này chủ đề cùng lúc; chủ đề tự đóng sau 7 ngày. */
export const MAX_OPEN_TOPICS = 2;
export const TOPIC_DAYS = 7;

export interface Reply {
  id: string;
  author: string;
  text: string;
  when: string;
  /** Phiên bản dự án đã áp dụng góp ý này (chủ dự án xác nhận). */
  applied?: string;
  /** Người góp ý đồng ý ghi tên vào Người đóng góp và Hành trình. */
  credit: boolean;
}

export interface Topic {
  id: string;
  project: string;
  kind: TopicKind;
  time: TopicTime;
  version: string;
  question: string;
  detail: string;
  opened: string;
  /** Số ngày còn lại trước khi tự đóng; không dùng khi đã giải quyết. */
  daysLeft: number;
  status: TopicStatus;
  replies: Reply[];
}

export const TOPICS: Topic[] = [
  {
    id: "t1",
    project: "dat-ban-ca-phe",
    kind: "Xin ý kiến",
    time: "15 phút",
    version: "v3",
    question: "Màn chọn bàn nên là sơ đồ quán hay danh sách giờ còn trống?",
    detail:
      "Bản v3 đang dùng sơ đồ quán, khách thấy được vị trí bàn nhưng trên điện thoại hơi chật. Danh sách giờ trống thì nhanh hơn nhưng mất cảm giác chọn chỗ ngồi. Mình muốn nghe từ người hay đặt bàn.",
    opened: "2 giờ trước",
    daysLeft: 6,
    status: "active",
    replies: [
      {
        id: "r1",
        author: "thuha",
        text: "Giữ sơ đồ nhưng mở mặc định ở chế độ danh sách trên điện thoại, có nút chuyển qua sơ đồ. Người đặt nhanh không phải zoom, ai thích chọn chỗ vẫn chọn được.",
        when: "1 giờ trước",
        credit: true,
      },
    ],
  },
  {
    id: "t2",
    project: "robot-phan-loai-rac",
    kind: "Dùng thử",
    time: "Một buổi",
    version: "v3",
    question: "Thử cho robot phân loại 20 món rác bất kỳ, ghi lại món nào nhận sai.",
    detail: "Robot đặt ở căng tin khu B từ 11 giờ đến 13 giờ. Mang theo rác thật càng tốt: hộp sữa, ly nhựa có nắp, giấy dính dầu.",
    opened: "5 giờ trước",
    daysLeft: 6,
    status: "active",
    replies: [{ id: "r2", author: "minhkhoa", text: "Chiều mai mình ghé thử với 20 món, sẽ gửi bảng kết quả kèm ảnh.", when: "3 giờ trước", credit: true }],
  },
  {
    id: "t3",
    project: "ra-mat-nuoc-ep",
    kind: "Cùng làm",
    time: "Một buổi",
    version: "v1",
    question: "Cần một bạn vẽ 3 phương án nhãn chai để khảo sát khách ở trường.",
    detail: "Chai nhựa 350 ml, nhãn quấn quanh thân. Màu chủ đạo cam và xanh lá. Chỉ cần bản phác, mình sẽ in thử và hỏi khoảng 50 bạn.",
    opened: "hôm qua",
    daysLeft: 5,
    status: "open",
    replies: [],
  },
  {
    id: "t4",
    project: "nova-replyn",
    kind: "Dùng thử",
    time: "15 phút",
    version: "v3",
    question: "Dùng thử luồng tạo hợp đồng và giữ tiền trên điện thoại, chỗ nào khó hiểu thì ghi lại.",
    detail: "Bản demo dùng ví thử, không mất tiền thật. Mình muốn biết người chưa quen ví điện tử có làm hết luồng được không.",
    opened: "3 ngày trước",
    daysLeft: 4,
    status: "open",
    replies: [],
  },
  {
    id: "t5",
    project: "nha-pho-thong-gio",
    kind: "Xin ý kiến",
    time: "15 phút",
    version: "v4",
    question: "Giếng trời nên đặt giữa nhà hay cuối nhà để gió đi xuyên tốt hơn?",
    detail: "Phương án A đặt giữa, chia nhà thành hai khối. Phương án B đặt cuối nhà, gần cầu thang. A làm tối phòng khách, B thì gió có thể không tới phòng ngủ giữa.",
    opened: "3 tuần trước",
    daysLeft: 0,
    status: "done",
    replies: [
      {
        id: "r3",
        author: "thuha",
        text: "Giữ B nhưng lùi giếng trời về giữa một nhịp cột, rồi mở ô thoáng phía trên cửa phòng ngủ giữa. Gió vẫn kéo xuyên mà phòng khách không bị tối.",
        when: "3 tuần trước",
        applied: "v5",
        credit: true,
      },
      { id: "r4", author: "hoanglong", text: "Bên mình có mô phỏng gió nhanh được, nếu cần mình chạy thử hai phương án.", when: "3 tuần trước", credit: true },
    ],
  },
  {
    id: "t6",
    project: "nhan-dien-tra-may",
    kind: "Xin ý kiến",
    time: "5 phút",
    version: "v1",
    question: "Chọn 1 trong 3 bảng màu cho bao bì trà.",
    detail: "Ba bảng màu lấy từ lá trà non, gốm men lam và đất nung. Bao bì giấy kraft nên màu sẽ trầm hơn trên màn hình.",
    opened: "tháng 9",
    daysLeft: 0,
    status: "done",
    replies: [
      {
        id: "r5",
        author: "giahuy",
        text: "Bảng lá trà non kết hợp một điểm men lam cho logo. Trên giấy kraft, màu đất nung bị chìm.",
        when: "tháng 9",
        applied: "v2",
        credit: true,
      },
    ],
  },
];

export const topicsOf = (slug: string) => TOPICS.filter((t) => t.project === slug);
export const ownerOf = (t: Topic) => projectOf(t.project)?.owner;
/** Chủ đề còn mở (chưa giải quyết) của người khác — số này hiện trên icon Trao đổi. */
export const openForMe = TOPICS.filter((t) => t.status !== "done" && ownerOf(t) !== ME).length;

export interface Contribution {
  topic: Topic;
  reply: Reply;
}

/** Góp ý đã được áp dụng của một người, chỉ tính khi người đó đồng ý ghi tên. */
export const contributionsBy = (handle: string): Contribution[] =>
  TOPICS.flatMap((topic) => topic.replies.filter((r) => r.author === handle && r.applied && r.credit).map((reply) => ({ topic, reply })));

/** Người có góp ý được áp dụng trong một dự án. */
export const contributorsOf = (slug: string) => [
  ...new Set(topicsOf(slug).flatMap((t) => t.replies.filter((r) => r.applied && r.credit).map((r) => r.author))),
];

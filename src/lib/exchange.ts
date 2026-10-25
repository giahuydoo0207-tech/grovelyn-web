import { ME, projectOf, userOf, type Lens } from "./data";
import { MEDIA, type Media } from "./media";

/**
 * Trao đổi: chủ dự án hỏi một câu cụ thể, có thời hạn, có kết quả. Khác bình luận (nhận xét tự do về bản đã công bố)
 * và khác tìm cộng sự (để sau, cùng trang Business). Dữ liệu mẫu.
 */
export type TopicKind = "Xin góp ý" | "Nhờ dùng thử";
export type TopicStatus = "open" | "closed";
export type CloseReason = "Đã giải quyết" | "Tạm dừng" | "Hết hạn";

export const TOPIC_KINDS: { kind: TopicKind; hint: string }[] = [
  { kind: "Xin góp ý", hint: "Nhận xét, chọn giữa các phương án" },
  { kind: "Nhờ dùng thử", hint: "Dùng hoặc đọc thử rồi báo lại chỗ vướng" },
];

export const CLOSE_REASONS: CloseReason[] = ["Đã giải quyết", "Tạm dừng"];

/** Mỗi dự án mở tối đa chừng này trao đổi cùng lúc; trao đổi tự đóng sau 14 ngày; người phụ trách mở lại được. */
export const MAX_OPEN_TOPICS = 2;
export const TOPIC_DAYS = 14;
export const MAX_LENSES = 2;

export interface Answer {
  author: string;
  text: string;
  when: string;
}

export interface Reply {
  id: string;
  author: string;
  text: string;
  when: string;
  /** Ảnh hoặc video minh hoạ cho góp ý. */
  media?: Media[];
  /** Phiên bản đã áp dụng góp ý này, do chủ dự án hoặc người phụ trách đánh dấu. */
  applied?: string;
  /** Người góp ý đồng ý ghi tên khi góp ý được áp dụng; rút lại được. */
  credit: boolean;
  /** Trả lời một cấp dưới góp ý. */
  answers: Answer[];
}

export interface Topic {
  id: string;
  project: string;
  kind: TopicKind;
  /** Góc nhìn cần nhận, tối đa 2. */
  lenses: Lens[];
  /** Lời mời nghe thêm góc nhìn ngoài ngành. Không phải điều kiện: ai cũng góp ý được. */
  outsider: boolean;
  version: string;
  question: string;
  detail: string;
  /** Ảnh, video của bản đang hỏi: để người góp ý xem trực tiếp. */
  media: Media[];
  /** Người phụ trách: người mở trao đổi, là chủ dự án hoặc thành viên. */
  lead: string;
  opened: string;
  daysLeft: number;
  status: TopicStatus;
  closeReason?: CloseReason;
  replies: Reply[];
}

export const TOPICS: Topic[] = [
  {
    id: "t1",
    project: "dat-ban-ca-phe",
    kind: "Xin góp ý",
    lenses: ["Trải nghiệm sử dụng"],
    outsider: true,
    version: "v3",
    question: "Màn chọn bàn nên là sơ đồ quán hay danh sách giờ còn trống?",
    detail:
      "Bản v3 dùng sơ đồ quán: khách thấy vị trí bàn nhưng trên điện thoại hơi chật. Danh sách giờ trống thì nhanh hơn nhưng mất cảm giác chọn chỗ. Mình muốn nghe từ người hay đặt bàn, không cần biết code.",
    media: [MEDIA.datBanVideo, MEDIA.datBanManHinh, MEDIA.datBanWireframe],
    lead: "minhkhoa",
    opened: "2 giờ trước",
    daysLeft: 14,
    status: "open",
    replies: [
      {
        id: "r1",
        author: "thuha",
        text: "Giữ sơ đồ nhưng mở mặc định ở chế độ danh sách trên điện thoại, có nút chuyển qua sơ đồ. Người đặt nhanh không phải phóng to, ai thích chọn chỗ vẫn chọn được.",
        when: "1 giờ trước",
        credit: true,
        answers: [{ author: "minhkhoa", text: "Ý này hay. Nút chuyển nên để trên cùng hay cạnh nút đặt?", when: "40 phút trước" }],
      },
    ],
  },
  {
    id: "t2",
    project: "robot-phan-loai-rac",
    kind: "Nhờ dùng thử",
    lenses: ["Phương pháp và dữ liệu"],
    outsider: true,
    version: "v3",
    question: "Thử cho robot phân loại 20 món rác bất kỳ, ghi lại món nào nhận sai.",
    detail: "Robot đặt ở căng tin khu B từ 11 giờ đến 13 giờ. Mang theo rác thật càng tốt: hộp sữa, ly nhựa có nắp, giấy dính dầu.",
    media: [],
    lead: "hoanglong",
    opened: "5 giờ trước",
    daysLeft: 13,
    status: "open",
    replies: [{ id: "r2", author: "minhkhoa", text: "Chiều mai mình ghé thử với 20 món, sẽ gửi bảng kết quả kèm ảnh.", when: "3 giờ trước", credit: true, answers: [] }],
  },
  {
    id: "t3",
    project: "ra-mat-nuoc-ep",
    kind: "Xin góp ý",
    lenses: ["Cách trình bày"],
    outsider: false,
    version: "v1",
    question: "Ba phương án nhãn chai, phương án nào dễ đọc nhất khi đặt trên quầy?",
    detail: "Chai nhựa 350 ml, nhãn quấn quanh thân. Màu chủ đạo cam và xanh lá. Mình sẽ in thử phương án được chọn và hỏi khoảng 50 khách.",
    media: [MEDIA.nuocEpMoodboard],
    lead: "ngocanh",
    opened: "hôm qua",
    daysLeft: 12,
    status: "open",
    replies: [],
  },
  {
    id: "t4",
    project: "nova-replyn",
    kind: "Nhờ dùng thử",
    lenses: ["Trải nghiệm sử dụng", "Nội dung và lập luận"],
    outsider: true,
    version: "v3",
    question: "Dùng thử luồng tạo hợp đồng và giữ tiền trên điện thoại, chỗ nào khó hiểu thì ghi lại.",
    detail: "Bản demo dùng ví thử, không mất tiền thật. Mình muốn biết người chưa quen ví điện tử có làm hết luồng được không.",
    media: [],
    lead: "giahuy",
    opened: "3 ngày trước",
    daysLeft: 11,
    status: "open",
    replies: [],
  },
  {
    id: "t5",
    project: "nha-pho-thong-gio",
    kind: "Xin góp ý",
    lenses: ["Giải pháp và tính khả thi", "Cách trình bày"],
    outsider: false,
    version: "v4",
    question: "Giếng trời nên đặt giữa nhà hay cuối nhà để gió đi xuyên tốt hơn?",
    detail: "Phương án A đặt giữa, chia nhà thành hai khối. Phương án B đặt cuối nhà, gần cầu thang. A làm tối phòng khách, B thì gió có thể không tới phòng ngủ giữa.",
    media: [MEDIA.nhaPhoMatBang, MEDIA.nhaPhoMatCat],
    lead: "quocbao",
    opened: "3 tuần trước",
    daysLeft: 0,
    status: "closed",
    closeReason: "Đã giải quyết",
    replies: [
      {
        id: "r3",
        author: "thuha",
        text: "Giữ B nhưng lùi giếng trời về giữa một nhịp cột, rồi mở ô thoáng phía trên cửa phòng ngủ giữa. Gió vẫn kéo xuyên mà phòng khách không bị tối.",
        when: "3 tuần trước",
        applied: "v5",
        credit: true,
        answers: [],
      },
      {
        id: "r4",
        author: "hoanglong",
        text: "Bên mình mô phỏng gió nhanh được. Chạy thử hai phương án thì B lùi một nhịp cột cho lưu lượng gió tầng 2 tốt hơn khoảng một phần ba.",
        media: [MEDIA.nhaPhoMatCat],
        when: "3 tuần trước",
        applied: "v5",
        credit: true,
        answers: [],
      },
    ],
  },
  {
    id: "t6",
    project: "nhan-dien-tra-may",
    kind: "Xin góp ý",
    lenses: ["Cách trình bày"],
    outsider: true,
    version: "v1",
    question: "Chọn 1 trong 3 bảng màu cho bao bì trà.",
    detail: "Ba bảng màu lấy từ lá trà non, gốm men lam và đất nung. Bao bì giấy kraft nên màu sẽ trầm hơn trên màn hình.",
    media: [MEDIA.traMayBaHuong],
    lead: "thuha",
    opened: "tháng 9",
    daysLeft: 0,
    status: "closed",
    closeReason: "Đã giải quyết",
    replies: [
      {
        id: "r5",
        author: "giahuy",
        text: "Bảng lá trà non kết hợp một điểm men lam cho logo. Trên giấy kraft, màu đất nung bị chìm.",
        when: "tháng 9",
        applied: "v2",
        credit: true,
        answers: [],
      },
    ],
  },
];

export const topicOf = (id: string) => TOPICS.find((t) => t.id === id);
export const topicsOf = (slug: string) => TOPICS.filter((t) => t.project === slug);
export const ownerOf = (t: Topic) => projectOf(t.project)?.owner;
/** Chủ dự án và người phụ trách được áp dụng góp ý, trả lời và đóng trao đổi. */
export const canManage = (t: Topic, who = ME) => who === ownerOf(t) || who === t.lead;
/** Trao đổi cần đúng góc nhìn mà người này ghi là góp ý được. */
export const fitsMe = (t: Topic, who = ME) => {
  const mine = userOf(who)?.lenses ?? [];
  return t.lenses.some((l) => mine.includes(l));
};

export interface Contribution {
  topic: Topic;
  reply: Reply;
}

/** Góp ý đã được áp dụng của một người, chỉ tính khi người đó đồng ý ghi tên. */
export const contributionsBy = (handle: string, topics: Topic[] = TOPICS): Contribution[] =>
  topics.flatMap((topic) => topic.replies.filter((r) => r.author === handle && r.applied && r.credit).map((reply) => ({ topic, reply })));

/** Người có góp ý được áp dụng trong một dự án. */
export const contributorsOf = (slug: string, topics: Topic[] = TOPICS) => [
  ...new Set(topics.filter((t) => t.project === slug).flatMap((t) => t.replies.filter((r) => r.applied && r.credit).map((r) => r.author))),
];

import { ME, type CoverTone } from "./data";

/**
 * Tin nhắn trong sản phẩm: chat riêng 1-1 và chat nhóm. Dữ liệu mẫu, chưa có backend.
 * `from` là handle người gửi (ME là chính mình).
 */
export interface ChatMessage {
  id: string;
  from: string;
  /** Giờ hiển thị, ví dụ "14:20". */
  at: string;
  text?: string;
  /** Slug dự án được chia sẻ. */
  project?: string;
  file?: { name: string; size: string };
  /** Ảnh gửi kèm (đường dẫn hoặc data URL). Bản cũ chỉ có một ảnh. */
  image?: string;
  /** Cụm ảnh gửi cùng lúc, tối đa 10. */
  images?: string[];
  /** Số lượt thả tim. */
  hearts?: number;
  /** Bạn đã thả tim tin này chưa. */
  liked?: boolean;
  /** Tin đang trả lời (id). */
  replyTo?: string;
  /** Tin được ghim lên đầu cuộc trò chuyện. */
  pinned?: boolean;
}

/** Mọi ảnh trong một tin, gộp kiểu cũ và kiểu mới. */
export const imagesOf = (m: ChatMessage) => [...(m.image ? [m.image] : []), ...(m.images ?? [])];

/** Tối đa ảnh mỗi lần gửi. */
export const MAX_IMAGES = 10;

export interface Conversation {
  id: string;
  kind: "direct" | "group";
  /** Chat riêng: handle người kia. */
  with?: string;
  /** Chat nhóm: tên, chữ viết tắt, màu và danh sách thành viên. */
  name?: string;
  mark?: string;
  tone?: CoverTone;
  members?: string[];
  /** Nhóm chat gắn với một Nhóm trên Grovelyn. */
  groupSlug?: string;
  /** Mô tả ngắn dưới tên nhóm. */
  about?: string;
  /** Số tin chưa đọc lúc mở trang. */
  unread: number;
  /** Cuộc trò chuyện được ghim lên đầu danh sách. */
  pinned?: boolean;
  /** Dự án gắn với nhóm chat. */
  project?: string;
  /** Sự kiện cả hai cùng quan tâm hoặc nhóm sắp tham gia. */
  event?: string;
  /** Ai đang soạn tin. */
  typing?: string;
  /** Lần cuối hoạt động khi không online. */
  lastSeen?: string;
  /** Nhãn thời gian ở danh sách. */
  when: string;
  messages: ChatMessage[];
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "do-an-ktx",
    kind: "group",
    name: "Đồ án ký túc xá",
    mark: "KT",
    tone: "leaf",
    members: ["ngocanh", "quocbao", "minhkhoa", ME],
    about: "Nhóm chat của dự án · 4 thành viên",
    unread: 5,
    pinned: true,
    project: "nha-pho-thong-gio",
    event: "gop-y-mat-cat-nha-pho",
    typing: "minhkhoa",
    when: "14:20",
    messages: [
      { id: "k0", from: "ngocanh", at: "09:02", text: "Hạn nộp bản mặt cắt thứ sáu 17:00, gửi PDF vào tài nguyên dự án", pinned: true },
      { id: "k1", from: "ngocanh", at: "13:58", text: "Mọi người ơi, mình vừa up bản mặt cắt v2" },
      { id: "k2", from: "ngocanh", at: "13:58", file: { name: "MatCat_v2.pdf", size: "4,2 MB" } },
      { id: "k3", from: "quocbao", at: "14:05", text: "Giếng trời đẩy lên tầng 3 thì gió chéo tốt hơn đó", hearts: 2 },
      { id: "k4", from: ME, at: "14:12", text: "Mình dựng lại 3D theo góp ý của Bảo nhé", replyTo: "k3" },
      { id: "k5", from: ME, at: "14:16", text: "Phối cảnh đêm và mặt cắt thông gió, mọi người xem thử", images: ["/demo/chat/nha-1.svg", "/demo/chat/nha-2.svg", "/demo/chat/nha-3.svg", "/demo/chat/nha-4.svg"] },
      { id: "k6", from: "minhkhoa", at: "14:20", text: "Ok, tối nay mình ghép vào slide" },
    ],
  },
  {
    id: "thuha",
    kind: "direct",
    with: "thuha",
    unread: 2,
    pinned: true,
    event: "portfolio-trai-nganh",
    when: "14:12",
    messages: [
      { id: "t1", from: "thuha", at: "14:02", text: "Chào Huy, chị xem hồ sơ của em rồi" },
      { id: "t2", from: "thuha", at: "14:03", text: "Buổi portfolio Chủ nhật em lên chia sẻ 5 phút về dự án của em được không?", pinned: true },
      { id: "t3", from: ME, at: "14:10", text: "Dạ được chị, em chuẩn bị slide ngắn nhé", replyTo: "t2" },
      { id: "t4", from: ME, at: "14:10", project: "dat-ban-ca-phe" },
      { id: "t6", from: "thuha", at: "14:11", text: "Mẫu bìa portfolio năm ngoái, em tham khảo nha", images: ["/demo/chat/bia-1.svg", "/demo/chat/bia-2.svg", "/demo/chat/bia-3.svg", "/demo/chat/bia-4.svg", "/demo/chat/bia-5.svg"] },
      { id: "t5", from: "thuha", at: "14:12", text: "Hay đó. Gửi chị trước thứ bảy nha", hearts: 1 },
    ],
  },
  {
    id: "quocbao",
    kind: "direct",
    with: "quocbao",
    unread: 0,
    when: "11:40",
    messages: [
      { id: "b1", from: "quocbao", at: "11:38", text: "Huy xem giúp mặt cắt v5 nhé" },
      { id: "b2", from: "quocbao", at: "11:38", project: "nha-pho-thong-gio" },
      { id: "b3", from: ME, at: "11:40", text: "Để chiều mình xem kỹ rồi góp ý" },
    ],
  },
  {
    id: "kien-truc-nha-pho",
    kind: "group",
    name: "Kiến trúc nhà phố",
    mark: "KT",
    tone: "ink",
    groupSlug: "kien-truc-nha-pho",
    members: ["quocbao", ME, "thuha", "hoanglong"],
    about: "Chat của nhóm, 128 thành viên",
    unread: 0,
    when: "Hôm qua",
    messages: [
      { id: "n1", from: "hoanglong", at: "20:10", text: "Ai có file mẫu thuyết minh đồ án không?" },
      { id: "n2", from: "quocbao", at: "20:14", text: "Có, mình ghim trong mục Ảnh và file của nhóm rồi" },
      { id: "n3", from: "quocbao", at: "20:14", file: { name: "ThuyetMinh_mau.docx", size: "820 KB" } },
    ],
  },
  {
    id: "minhkhoa",
    kind: "direct",
    with: "minhkhoa",
    unread: 0,
    lastSeen: "Hoạt động 2 giờ trước",
    when: "Hôm qua",
    messages: [
      { id: "m1", from: "minhkhoa", at: "21:02", text: "Chiều mai họp nhóm nhé" },
      { id: "m2", from: ME, at: "21:05", text: "Ok, 3 giờ ở thư viện" },
    ],
  },
  {
    id: "ngocanh",
    kind: "direct",
    with: "ngocanh",
    unread: 0,
    lastSeen: "Hoạt động hôm qua",
    when: "Thứ hai",
    messages: [{ id: "a1", from: "ngocanh", at: "09:15", text: "Cảm ơn Huy, mình gửi brief qua mail rồi nha" }],
  },
];

/** Bỏ dấu để tìm "thu ha" vẫn ra "Thu Hà". */
export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export const nowLabel = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

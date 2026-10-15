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
  /** Ảnh gửi kèm (đường dẫn hoặc object URL). */
  image?: string;
  /** Số lượt thả tim. */
  hearts?: number;
}

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
    about: "Nhóm chat 4 thành viên",
    unread: 5,
    typing: "quocbao",
    when: "14:20",
    messages: [
      { id: "k1", from: "ngocanh", at: "13:58", text: "Mọi người ơi, mình vừa up bản mặt cắt v2" },
      { id: "k2", from: "ngocanh", at: "13:58", file: { name: "MatCat_v2.pdf", size: "4,2 MB" } },
      { id: "k3", from: "quocbao", at: "14:05", text: "Giếng trời đẩy lên tầng 3 thì gió chéo tốt hơn đó", hearts: 2 },
      { id: "k4", from: ME, at: "14:12", text: "Mình dựng lại 3D theo góp ý của Bảo nhé" },
      { id: "k5", from: ME, at: "14:12", project: "nha-pho-thong-gio" },
      { id: "k6", from: "minhkhoa", at: "14:20", text: "Ok, tối nay mình ghép vào slide" },
    ],
  },
  {
    id: "thuha",
    kind: "direct",
    with: "thuha",
    unread: 2,
    when: "14:12",
    messages: [
      { id: "t1", from: "thuha", at: "14:02", text: "Chào Huy, chị xem hồ sơ của em rồi" },
      { id: "t2", from: "thuha", at: "14:03", text: "Buổi portfolio Chủ nhật em lên chia sẻ 5 phút về dự án của em được không?" },
      { id: "t3", from: ME, at: "14:10", text: "Dạ được chị, em chuẩn bị slide ngắn nhé" },
      { id: "t4", from: ME, at: "14:10", project: "dat-ban-ca-phe" },
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

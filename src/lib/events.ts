import type { CoverTone } from "./data";

/**
 * Sự kiện của cộng đồng (dữ liệu mẫu cho bản giao diện, chưa nối Supabase).
 * Một sự kiện gồm nội dung chính, speaker, lịch trình và địa điểm, đúng thứ tự trang chi tiết hiện ra.
 */

export type EventMode = "Tại chỗ" | "Trực tuyến" | "Kết hợp";
export const EVENT_MODES: EventMode[] = ["Tại chỗ", "Trực tuyến", "Kết hợp"];

export const SESSION_KINDS = ["Đón khách", "Mở đầu", "Chia sẻ chính", "Chủ đề", "Thảo luận", "Giải lao", "Kết thúc"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const SPEAKER_ROLES = ["Chia sẻ chính", "Chủ đề", "Khách mời thảo luận", "Dẫn chương trình"] as const;

export interface Speaker {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  tone: CoverTone;
  /** Hồ sơ Grovelyn nếu speaker là thành viên. */
  handle?: string;
  /** Ảnh đã cắt tròn (data URL khi vừa tạo, đường dẫn R2 khi có máy chủ). */
  photo?: string;
}

export interface Session {
  id: string;
  from: string;
  to: string;
  kind: SessionKind;
  title: string;
  note: string;
  speakers: string[];
}

export interface Venue {
  name: string;
  address: string;
  directions?: string;
  photos: { src: string; alt: string }[];
}

export interface RegistrationAsks {
  fields: boolean;
  question: boolean;
  profile: boolean;
  approve: boolean;
}

export interface CommunityEvent {
  slug: string;
  title: string;
  /** Cụm chữ trong tên được tô xanh trên trang chi tiết. */
  accent?: string;
  description: string;
  date: string;
  from: string;
  to: string;
  mode: EventMode;
  venue?: Venue;
  seats: number;
  registered: number;
  interested: number;
  fee: string;
  language: string;
  host: string;
  group?: { name: string; mark: string; tone: CoverTone };
  cover?: string;
  coverSeed: number;
  coverTone: CoverTone;
  speakers: Speaker[];
  agenda: Session[];
  asks: RegistrationAsks;
  featured?: boolean;
}

/** Ngày "hôm nay" của bản mẫu, để lịch và nhãn Sắp diễn ra ổn định. */
export const TODAY = "2026-10-15";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return {
    tag: `TH${mm}`,
    day: dd,
    weekday: WEEKDAYS[d.getUTCDay()],
    short: `${dd}/${mm}`,
    long: `${WEEKDAYS[d.getUTCDay()]} ${dd}/${mm}/${year}`,
    monthName: `tháng ${month}`,
  };
}

export function placeLine(e: Pick<CommunityEvent, "mode" | "venue">) {
  if (e.mode === "Trực tuyến" || !e.venue) return "Trực tuyến";
  return e.mode === "Kết hợp" ? `${e.venue.name} và trực tuyến` : e.venue.name;
}

export const speakerInitials = (name: string) => {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "?";
  return (w.length > 1 ? w[w.length - 2][0] + w[w.length - 1][0] : w[0].slice(0, 2)).toUpperCase();
};

const ALL_ASKS: RegistrationAsks = { fields: true, question: true, profile: true, approve: false };

export const EVENTS: CommunityEvent[] = [
  {
    slug: "portfolio-trai-nganh",
    title: "Làm portfolio cho người trái ngành",
    accent: "trái ngành",
    description:
      "Ai chuyển ngành cũng gặp cùng một câu hỏi: không có kinh nghiệm thì khoe gì. Buổi này chỉ cách chọn ba dự án nhỏ mà trọn vẹn, kể quá trình bằng các phiên bản trên Grovelyn, và xem góp ý trực tiếp trên hồ sơ của người tham gia.",
    date: "2026-10-18",
    from: "19:00",
    to: "21:15",
    mode: "Tại chỗ",
    venue: {
      name: "Xưởng Lá Coworking",
      address: "12 Đường số 3, Phường Tân Định, TP. Hồ Chí Minh",
      directions: "Phòng hội thảo tầng 2, đi thang bên trái quầy cà phê. Có chỗ gửi xe máy miễn phí phía sau.",
      photos: [
        { src: "/demo/venue-1.svg", alt: "Mặt tiền có cây xanh" },
        { src: "/demo/venue-2.svg", alt: "Khu bàn ngồi trong nhà" },
        { src: "/demo/venue-3.svg", alt: "Phòng hội thảo có bảng trắng" },
        { src: "/demo/venue-4.svg", alt: "Góc ngồi có sofa và cây" },
      ],
    },
    seats: 60,
    registered: 18,
    interested: 42,
    fee: "Miễn phí",
    language: "Tiếng Việt",
    host: "thuha",
    group: { name: "Freelance thiết kế", mark: "FL", tone: "sap" },
    cover: "/demo/event-cover.svg",
    coverSeed: 31,
    coverTone: "ink",
    asks: ALL_ASKS,
    speakers: [
      {
        id: "sp-thuha",
        name: "Nguyễn Thu Hà",
        role: "Chia sẻ chính",
        title: "Thiết kế nhận diện, nhóm Freelance thiết kế",
        bio: "Thu Hà làm kế toán ba năm trước khi chuyển sang thiết kế nhận diện. Chị tự đặt đề bài cho những quán nhỏ quanh nhà, đăng từng phiên bản lên Grovelyn và nhận khách đầu tiên sau bốn tháng.",
        tone: "ink",
        handle: "thuha",
      },
      {
        id: "sp-minhkhoa",
        name: "Lê Minh Khoa",
        role: "Chủ đề",
        title: "Sinh viên Công nghệ thông tin, làm web tự do",
        bio: "Minh Khoa học kế toán một năm rồi chuyển sang công nghệ thông tin. Bạn ghi lại mọi dự án theo phiên bản, kể cả bản lỗi, và dùng chính lịch sử đó để thuyết phục khách freelance đầu tiên.",
        tone: "leaf",
        handle: "minhkhoa",
      },
      {
        id: "sp-quocbao",
        name: "Trần Quốc Bảo",
        role: "Khách mời thảo luận",
        title: "Sinh viên năm cuối Kiến trúc",
        bio: "Quốc Bảo là người được doanh nghiệp liên hệ nhiều nhất trong nhóm Kiến trúc nhờ cách trình bày đồ án theo từng bước. Bạn góp góc nhìn của người đọc hồ sơ.",
        tone: "sap",
        handle: "quocbao",
      },
    ],
    agenda: [
      { id: "a1", from: "19:00", to: "19:30", kind: "Đón khách", title: "Check-in và làm quen", note: "Trà và bánh nhẹ. Mỗi người viết một dòng về ngành cũ và ngành muốn sang lên bảng.", speakers: [] },
      { id: "a2", from: "19:30", to: "19:40", kind: "Mở đầu", title: "Giới thiệu lịch trình và speaker", note: "Nhóm Freelance thiết kế nói nhanh về buổi hôm nay và cách gửi câu hỏi.", speakers: [] },
      { id: "a3", from: "19:40", to: "20:10", kind: "Chia sẻ chính", title: "Chọn 3 dự án để khoe khi chưa có kinh nghiệm", note: "Vì sao dự án nhỏ mà trọn vẹn đáng giá hơn dự án lớn dang dở, và cách tự đặt đề bài sao cho người tuyển dụng tin.", speakers: ["sp-thuha"] },
      { id: "a4", from: "20:10", to: "20:35", kind: "Chủ đề", title: "Kể quá trình bằng các phiên bản", note: "Dùng v1, v2, v3 trên Grovelyn để cho thấy bạn học nhanh, kể cả những bản chưa tốt.", speakers: ["sp-minhkhoa"] },
      { id: "a5", from: "20:35", to: "21:00", kind: "Thảo luận", title: "Xem trực tiếp hồ sơ người tham gia", note: "Năm hồ sơ được chọn từ người đăng ký sớm có gửi kèm đường dẫn hồ sơ.", speakers: ["sp-thuha", "sp-minhkhoa", "sp-quocbao"] },
      { id: "a6", from: "21:00", to: "21:15", kind: "Kết thúc", title: "Chụp ảnh nhóm và giao lưu", note: "Bản ghi và slide gửi lại cho người đăng ký trong 2 ngày.", speakers: [] },
    ],
  },
  {
    slug: "ngay-hoi-do-an-tot-nghiep",
    title: "Ngày hội đồ án tốt nghiệp",
    accent: "đồ án",
    description:
      "Sinh viên năm cuối mọi ngành trưng bày đồ án, doanh nghiệp đi xem và trò chuyện trực tiếp. Mỗi gian có mã QR mở thẳng dự án trên Grovelyn.",
    date: "2026-10-24",
    from: "08:30",
    to: "17:00",
    mode: "Tại chỗ",
    venue: { name: "Hội trường Đại học Văn Hiến", address: "665 Điện Biên Phủ, Phường Bàn Cờ, TP. Hồ Chí Minh", photos: [] },
    seats: 400,
    registered: 186,
    interested: 117,
    fee: "Miễn phí",
    language: "Tiếng Việt",
    host: "giahuy",
    group: { name: "Sinh viên VHU làm dự án", mark: "VH", tone: "leaf" },
    coverSeed: 12,
    coverTone: "leaf",
    featured: true,
    asks: { fields: true, question: false, profile: true, approve: false },
    speakers: [
      { id: "sp-giahuy", name: "Đỗ Gia Huy", role: "Dẫn chương trình", title: "Sinh viên lập trình web, nhóm Sinh viên VHU làm dự án", bio: "Gia Huy điều phối ngày hội và hướng dẫn doanh nghiệp cách xem hồ sơ trên Grovelyn.", tone: "leaf", handle: "giahuy" },
    ],
    agenda: [
      { id: "b1", from: "08:30", to: "09:00", kind: "Đón khách", title: "Mở cửa các gian trưng bày", note: "Doanh nghiệp nhận bản đồ gian và danh sách dự án.", speakers: [] },
      { id: "b2", from: "09:00", to: "11:30", kind: "Chủ đề", title: "Doanh nghiệp đi xem đồ án", note: "Mỗi gian có 5 phút giới thiệu, phần còn lại là hỏi đáp.", speakers: ["sp-giahuy"] },
      { id: "b3", from: "13:30", to: "16:30", kind: "Thảo luận", title: "Gặp riêng doanh nghiệp", note: "Doanh nghiệp đặt lịch gặp sinh viên qua Grovelyn.", speakers: [] },
      { id: "b4", from: "16:30", to: "17:00", kind: "Kết thúc", title: "Trao giải đồ án được quan tâm nhất", note: "", speakers: [] },
    ],
  },
  {
    slug: "gop-y-mat-cat-nha-pho",
    title: "Góp ý mặt cắt và phối cảnh nhà phố",
    accent: "mặt cắt",
    description: "Mỗi người mang một bản vẽ đang làm, cả nhóm góp ý thẳng vào bản vẽ trong 10 phút. Mang laptop hoặc bản in A3.",
    date: "2026-10-29",
    from: "18:00",
    to: "20:00",
    mode: "Tại chỗ",
    venue: { name: "Thư viện Khoa Kiến trúc", address: "196 Pasteur, Phường Xuân Hòa, TP. Hồ Chí Minh", directions: "Phòng đọc nhóm tầng 3.", photos: [] },
    seats: 30,
    registered: 18,
    interested: 18,
    fee: "Miễn phí",
    language: "Tiếng Việt",
    host: "quocbao",
    group: { name: "Kiến trúc nhà phố", mark: "KT", tone: "ink" },
    coverSeed: 47,
    coverTone: "ink",
    asks: { fields: false, question: true, profile: true, approve: true },
    speakers: [
      { id: "sp-qb", name: "Trần Quốc Bảo", role: "Dẫn chương trình", title: "Sinh viên năm cuối Kiến trúc", bio: "Quốc Bảo giữ nhịp buổi góp ý và chia nhóm theo loại bản vẽ.", tone: "leaf", handle: "quocbao" },
    ],
    agenda: [
      { id: "c1", from: "18:00", to: "18:15", kind: "Mở đầu", title: "Chia nhóm theo bản vẽ", note: "", speakers: ["sp-qb"] },
      { id: "c2", from: "18:15", to: "19:45", kind: "Thảo luận", title: "Góp ý xoay vòng, mỗi bản 10 phút", note: "", speakers: ["sp-qb"] },
      { id: "c3", from: "19:45", to: "20:00", kind: "Kết thúc", title: "Tổng kết lỗi hay gặp", note: "", speakers: [] },
    ],
  },
  {
    slug: "cham-thu-thach-tuan-42",
    title: "Chấm Thử thách tuần 42",
    description: "Ban chấm xem trực tiếp các bài nộp cho thử thách thiết kế bao bì đặc sản quê bạn, giải thích vì sao bài thắng.",
    date: "2026-11-02",
    from: "20:00",
    to: "21:00",
    mode: "Trực tuyến",
    seats: 200,
    registered: 23,
    interested: 23,
    fee: "Miễn phí",
    language: "Tiếng Việt",
    host: "thuha",
    coverSeed: 5,
    coverTone: "sap",
    asks: { fields: false, question: true, profile: false, approve: false },
    speakers: [
      { id: "sp-th", name: "Nguyễn Thu Hà", role: "Chia sẻ chính", title: "Thiết kế nhận diện", bio: "Thu Hà chấm chính và nhận xét từng bài vào chung kết.", tone: "ink", handle: "thuha" },
    ],
    agenda: [
      { id: "d1", from: "20:00", to: "20:45", kind: "Chủ đề", title: "Chấm 8 bài vào chung kết", note: "", speakers: ["sp-th"] },
      { id: "d2", from: "20:45", to: "21:00", kind: "Kết thúc", title: "Công bố bài thắng", note: "", speakers: [] },
    ],
  },
  {
    slug: "lap-thu-canh-tay-robot",
    title: "Lắp thử cánh tay robot cùng nhau",
    accent: "cánh tay robot",
    description: "Buổi lắp ráp mở: mang linh kiện hoặc dùng bộ có sẵn, cùng nạp code và thử phân loại rác. Người ở xa xem qua livestream.",
    date: "2026-11-07",
    from: "09:00",
    to: "12:00",
    mode: "Kết hợp",
    venue: { name: "Phòng Lab Robot", address: "475A Điện Biên Phủ, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh", photos: [] },
    seats: 15,
    registered: 9,
    interested: 9,
    fee: "Miễn phí",
    language: "Tiếng Việt",
    host: "hoanglong",
    group: { name: "Robot và vi điều khiển", mark: "RB", tone: "ink" },
    coverSeed: 88,
    coverTone: "ink",
    asks: { fields: true, question: true, profile: false, approve: true },
    speakers: [
      { id: "sp-hl", name: "Võ Hoàng Long", role: "Chia sẻ chính", title: "Sinh viên Kỹ thuật cơ điện tử", bio: "Hoàng Long là chủ dự án cánh tay robot phân loại rác mini.", tone: "ink", handle: "hoanglong" },
    ],
    agenda: [
      { id: "e1", from: "09:00", to: "10:30", kind: "Chủ đề", title: "Lắp khung và động cơ", note: "", speakers: ["sp-hl"] },
      { id: "e2", from: "10:30", to: "11:45", kind: "Chủ đề", title: "Nạp code nhận diện", note: "", speakers: ["sp-hl"] },
      { id: "e3", from: "11:45", to: "12:00", kind: "Kết thúc", title: "Chạy thử", note: "", speakers: [] },
    ],
  },
];

export const eventOf = (slug: string) => EVENTS.find((e) => e.slug === slug);

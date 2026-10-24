import type { Context, Output, Usage } from "./model";
import { MEDIA, type Media } from "./media";
/**
 * Dữ liệu mẫu cho bản giao diện. Chưa nối Supabase: mọi tên người, dự án và con số ở đây chỉ để minh họa.
 */

export const FIELDS = [
  "Tất cả",
  "Công nghệ thông tin",
  "Thiết kế",
  "Kiến trúc",
  "Marketing",
  "Kinh doanh và tài chính",
  "Kỹ thuật",
  "Truyền thông",
] as const;

export type Field = Exclude<(typeof FIELDS)[number], "Tất cả">;
export type CoverTone = "ink" | "leaf" | "sap";
/** Góc nhìn khi góp ý trong Trao đổi; người dùng chọn những góc mình góp ý được trên hồ sơ. */
export const LENSES = ["Nội dung và lập luận", "Cách trình bày", "Giải pháp và tính khả thi", "Trải nghiệm sử dụng", "Phương pháp và dữ liệu"] as const;
export type Lens = (typeof LENSES)[number];
/** Mỗi góc nhìn một câu hỏi, để người chọn phân biệt được các góc nhìn gần nhau. */
export const LENS_HINT: Record<Lens, string> = {
  "Nội dung và lập luận": "Ý có rõ, có thuyết phục không?",
  "Cách trình bày": "Bố cục, hình ảnh và cách diễn đạt có dễ hiểu không?",
  "Giải pháp và tính khả thi": "Cách giải quyết có phù hợp và làm được không?",
  "Trải nghiệm sử dụng": "Người dùng có làm xong việc cần làm không?",
  "Phương pháp và dữ liệu": "Cách thu thập, phân tích và kết luận có hợp lý không?",
};

export interface ProjectFile {
  name: string;
  kind: "folder" | "pdf" | "image" | "video" | "doc" | "model";
  size?: string;
  updated: string;
}

export interface ProjectVersion {
  tag: string;
  note: string;
  when: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  field: Field;
  /** Dạng đầu ra: người dùng đang công bố thứ gì. Quyết định mẫu trình bày. */
  output: Output;
  /** Bối cảnh: làm trong hoàn cảnh nào. */
  context: Context;
  /** Chi tiết bối cảnh, ví dụ "Đồ án tốt nghiệp". */
  contextNote?: string;
  usage?: Usage;
  owner: string;
  members: { handle: string; part: string }[];
  tools: string[];
  files: ProjectFile[];
  versions: ProjectVersion[];
  likes: number;
  comments: number;
  tone: CoverTone;
  seed: number;
  updated: string;
  readme: { heading: string; body: string }[];
}

export interface User {
  handle: string;
  name: string;
  initials: string;
  /** Dòng tự giới thiệu ngắn, hiện dưới tên ở bài đăng và bình luận. */
  intro: string;
  headline: string;
  location: string;
  /** "Mình có thể góp ý về…" dùng để gửi chủ đề Trao đổi đúng người. */
  lenses: Lens[];
  about: string;
  skills: string[];
  experience: { title: string; where: string; when: string; note?: string }[];
  education: { title: string; where: string; when: string; note?: string }[];
  followers: number;
  following: number;
  pinned: string[];
  tone: CoverTone;
}

export const USERS: User[] = [
  {
    handle: "quocbao",
    name: "Trần Quốc Bảo",
    initials: "QB",
    intro: "Sinh viên Kiến trúc năm cuối",
    headline: "Sinh viên năm cuối ngành Kiến trúc, mê nhà ở tiết kiệm năng lượng",
    location: "TP. Hồ Chí Minh",
    lenses: ["Cách trình bày", "Giải pháp và tính khả thi"],
    about:
      "Mình thích những ngôi nhà vừa túi tiền mà vẫn mát. Đang tìm chỗ thực tập ở văn phòng kiến trúc làm nhà ở đô thị.",
    skills: ["Revit", "SketchUp", "Lumion", "AutoCAD", "Diễn họa 3D", "Thiết kế bền vững"],
    experience: [
      { title: "Diễn họa tự do", where: "Freelance", when: "2025 đến nay" },
      { title: "Trợ lý thiết kế", where: "Văn phòng kiến trúc", when: "Hè 2025" },
    ],
    education: [{ title: "Cử nhân Kiến trúc", where: "[Tên trường]", when: "2022 – 2027" }],
    followers: 412,
    following: 96,
    pinned: ["nha-pho-thong-gio", "cai-tao-chung-cu-cu", "quan-ca-phe-vuon"],
    tone: "leaf",
  },
  {
    handle: "thuha",
    name: "Nguyễn Thu Hà",
    initials: "TH",
    intro: "Thiết kế nhận diện, làm tự do 3 năm",
    headline: "Thiết kế nhận diện thương hiệu cho quán nhỏ và thương hiệu Việt",
    location: "Đà Nẵng",
    lenses: ["Cách trình bày", "Trải nghiệm sử dụng"],
    about: "Làm logo, bao bì và bộ nhận diện. Thích làm việc với chủ quán trực tiếp.",
    skills: ["Illustrator", "Figma", "Bao bì", "Typography"],
    experience: [{ title: "Thiết kế tự do", where: "Freelance", when: "2023 đến nay" }],
    education: [{ title: "Cử nhân Thiết kế đồ họa", where: "[Tên trường]", when: "2019 – 2023" }],
    followers: 1280,
    following: 210,
    pinned: ["nhan-dien-tra-may"],
    tone: "ink",
  },
  {
    handle: "minhkhoa",
    name: "Lê Minh Khoa",
    initials: "MK",
    intro: "Sinh viên Công nghệ thông tin",
    headline: "Sinh viên CNTT, làm web và app cho quán cà phê",
    location: "TP. Hồ Chí Minh",
    lenses: ["Trải nghiệm sử dụng", "Giải pháp và tính khả thi"],
    about: "Đang làm đồ án đặt bàn cho quán cà phê và học thêm về thiết kế giao diện.",
    skills: ["Next.js", "Flutter", "PostgreSQL", "UI"],
    experience: [],
    education: [{ title: "Kỹ sư Công nghệ thông tin", where: "[Tên trường]", when: "2023 – 2027" }],
    followers: 186,
    following: 140,
    pinned: ["dat-ban-ca-phe"],
    tone: "sap",
  },
  {
    handle: "ngocanh",
    name: "Phạm Ngọc Anh",
    initials: "NA",
    intro: "Marketing tại một chuỗi đồ uống",
    headline: "Làm marketing cho chuỗi đồ uống, thích ra mắt thương hiệu nhỏ",
    location: "Hà Nội",
    lenses: ["Nội dung và lập luận", "Phương pháp và dữ liệu"],
    about: "Lên kế hoạch ra mắt sản phẩm và viết nội dung mạng xã hội. Ngoài giờ làm, tự thử các ý tưởng thương hiệu nhỏ.",
    skills: ["Lập kế hoạch", "Viết nội dung", "Canva", "Nghiên cứu thị trường"],
    experience: [{ title: "Chuyên viên marketing", where: "Chuỗi đồ uống tại Hà Nội", when: "2024 đến nay" }],
    education: [{ title: "Cử nhân Marketing", where: "[Tên trường]", when: "2019 – 2023" }],
    followers: 240,
    following: 310,
    pinned: ["ra-mat-nuoc-ep"],
    tone: "sap",
  },
  {
    handle: "hoanglong",
    name: "Võ Hoàng Long",
    initials: "HL",
    intro: "Kỹ sư cơ điện tử",
    headline: "Kỹ sư cơ điện tử, làm robot nhỏ phục vụ đời sống",
    location: "Cần Thơ",
    lenses: ["Giải pháp và tính khả thi", "Phương pháp và dữ liệu"],
    about: "Thích làm ra thứ chạy được thật. Đang tìm người cùng làm phần vỏ và điện.",
    skills: ["Arduino", "SolidWorks", "Python", "In 3D"],
    experience: [],
    education: [{ title: "Kỹ sư Cơ điện tử", where: "[Tên trường]", when: "2017 – 2022" }],
    followers: 530,
    following: 88,
    pinned: ["robot-phan-loai-rac"],
    tone: "ink",
  },
  {
    handle: "giahuy",
    name: "Gia Huy",
    initials: "GH",
    intro: "Sinh viên Khoa học máy tính",
    headline: "Sinh viên Khoa học máy tính, tự xây sản phẩm web từ ý tưởng đến bản chạy được",
    location: "TP. Hồ Chí Minh",
    lenses: ["Trải nghiệm sử dụng", "Giải pháp và tính khả thi"],
    about:
      "Sinh viên Khoa học máy tính, Đại học Văn Hiến. Tự lên kế hoạch và làm trọn vẹn sản phẩm web cá nhân, từ phân tích nghiệp vụ, thiết kế giao diện đến front-end và back-end. Đang xây Grovelyn.",
    skills: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Flutter", "Dart", "Java", "Spring Boot", "PostgreSQL", "Supabase", "Solana", "Git"],
    experience: [{ title: "Thiết kế đồ họa (bán thời gian)", where: "Chrome Room", when: "07/2026 – nay", note: "Thiết kế logo và bảng hiệu, tư vấn khách hàng và bán hàng." }],
    education: [{ title: "Cử nhân Khoa học máy tính", where: "Đại học Văn Hiến", when: "2023 – nay" }],
    followers: 0,
    following: 0,
    pinned: ["nova-replyn"],
    tone: "leaf",
  },
];

const f = (name: string, kind: ProjectFile["kind"], size: string | undefined, updated: string): ProjectFile => ({
  name,
  kind,
  size,
  updated,
});

export const PROJECTS: Project[] = [
  {
    slug: "nova-replyn",
    title: "Nova × Replyn: từ kết nối nghề nghiệp đến hợp tác có thể kiểm chứng",
    summary:
      "Nova gom hồ sơ, portfolio, việc làm, cộng đồng, nhắn tin và thanh toán về một chỗ. Replyn là lớp niềm tin giúp hai bên chốt thỏa thuận, theo dõi tiến độ và giữ bằng chứng.",
    field: "Công nghệ thông tin",
    output: "Phần mềm hoặc công cụ",
    context: "Cuộc thi hoặc sự kiện",
    contextNote: "UniHackFest 2026",
    usage: "Đang dùng thử",
    owner: "giahuy",
    members: [{ handle: "giahuy", part: "Chủ dự án, sản phẩm và lập trình" }],
    tools: ["TypeScript", "React", "Flutter", "Dart", "Java", "Spring Boot", "PostgreSQL", "Solana", "Docker", "Git"],
    files: [
      f("nova-business", "folder", undefined, "5 thg 10"),
      f("nova-mobile", "folder", undefined, "5 thg 10"),
      f("nova-backend", "folder", undefined, "5 thg 10"),
      f("slide-thuyet-trinh.pdf", "pdf", undefined, "5 thg 10"),
    ],
    versions: [
      { tag: "v3", note: "Bản demo nộp UniHackFest 2026", when: "5 thg 10, 2026" },
      { tag: "v2", note: "Bổ sung Replyn, lớp niềm tin khi hợp tác", when: "3 thg 10, 2026" },
      { tag: "v1", note: "Nova Mobile và Nova Business", when: "20 thg 9, 2026" },
    ],
    likes: 0,
    comments: 0,
    tone: "ink",
    seed: 27,
    updated: "5 thg 10, 2026",
    readme: [
      {
        heading: "Vấn đề",
        body: "Freelancer phải dùng nhiều nền tảng rời rạc để xây hồ sơ, chia sẻ portfolio, tìm việc, nhắn tin và theo dõi thanh toán, nên thành quả nghề nghiệp bị phân tán và khó tích lũy uy tín. Doanh nghiệp thì thường phải quyết định từ một hồ sơ ngắn, vài đường dẫn và những thông tin khó kiểm chứng. Và tìm được đúng người mới chỉ là bước đầu: phạm vi đã chốt chưa, ai được đổi deadline, sản phẩm nào là bản cuối, bằng chứng nằm ở đâu nếu có tranh chấp?",
      },
      {
        heading: "Giải pháp",
        body: "Nova gồm ứng dụng di động cho freelancer (Flutter) và web cho doanh nghiệp (Next.js), dùng chung một backend Spring Boot: hồ sơ, portfolio, cơ hội việc làm, cộng đồng, nhắn tin và thanh toán USDC trên Solana Devnet. Khi hai bên bắt đầu làm việc, Replyn giúp chốt thỏa thuận, chia giai đoạn, nộp sản phẩm, yêu cầu sửa và giữ nhật ký bằng chứng.",
      },
      {
        heading: "Kết quả",
        body: "Bản demo chạy trọn luồng trên Solana Devnet, chưa xử lý tiền thật: doanh nghiệp đăng việc, freelancer ứng tuyển, trao đổi, lập hóa đơn và nhận thanh toán thử. Dự án nộp UniHackFest 2026, hạng mục Best Product & Business.",
      },
    ],
  },
  {
    slug: "nha-pho-thong-gio",
    title: "Nhà phố 4x16m thông gió tự nhiên",
    summary:
      "Nhà ống 3 tầng dùng giếng trời và cửa so le giữa các tầng để gió đi xuyên nhà, giảm phụ thuộc máy lạnh.",
    field: "Kiến trúc",
    output: "Thiết kế",
    context: "Học tập",
    contextNote: "Đồ án tốt nghiệp",
    usage: "Chưa triển khai",
    owner: "quocbao",
    members: [
      { handle: "quocbao", part: "Chủ dự án, thiết kế" },
      { handle: "thuha", part: "Bố cục bản trình bày" },
    ],
    tools: ["Revit", "SketchUp", "Lumion"],
    files: [
      f("ban-ve", "folder", undefined, "2 ngày trước"),
      f("phoi-canh", "folder", undefined, "2 ngày trước"),
      f("mo-hinh-3d", "folder", undefined, "1 tuần trước"),
      f("thuyet-minh-thong-gio.pdf", "pdf", "3,2 MB", "2 ngày trước"),
      f("mat-cat-A-A.pdf", "pdf", "1,8 MB", "2 ngày trước"),
      f("phoi-canh-ban-dem.webp", "image", "420 KB", "2 ngày trước"),
      f("dien-hoa-60-giay.mp4", "video", "11,6 MB", "1 tuần trước"),
    ],
    versions: [
      { tag: "v5", note: "Thêm mặt cắt và phối cảnh ban đêm", when: "2 ngày trước" },
      { tag: "v4", note: "Mở rộng giếng trời theo góp ý", when: "1 tuần trước" },
      { tag: "v3", note: "Thêm video diễn họa", when: "2 tuần trước" },
      { tag: "v2", note: "Hoàn thiện mặt bằng tầng 2, 3", when: "1 tháng trước" },
    ],
    likes: 210,
    comments: 14,
    tone: "ink",
    seed: 3,
    updated: "2 ngày trước",
    readme: [
      {
        heading: "Bài toán",
        body: "Nhà phố hẹp ở TP.HCM thường bí và nóng vì chỉ có mặt tiền và mặt sau tiếp xúc với gió. Dự án thử tìm cách đưa gió vào giữa nhà mà không tốn thêm diện tích.",
      },
      {
        heading: "Cách làm",
        body: "Đặt giếng trời ở giữa nhà, cửa sổ các tầng lệch nhau để khí nóng thoát lên trên và kéo gió mát từ dưới vào. Kiểm tra bằng mô phỏng hướng gió trong mô hình 3D.",
      },
      {
        heading: "Trong dự án có gì",
        body: "Bản vẽ mặt bằng, mặt đứng, mặt cắt dạng PDF, mô hình SketchUp, ảnh phối cảnh và một video diễn họa 60 giây.",
      },
    ],
  },
  {
    slug: "nhan-dien-tra-may",
    title: "Bộ nhận diện thương hiệu Trà Mây",
    summary: "Logo, bảng màu và bao bì cho một quán trà nhỏ ở Đà Nẵng, lấy cảm hứng từ mây chiều trên biển.",
    field: "Thiết kế",
    output: "Thiết kế",
    context: "Công việc",
    usage: "Đã dùng thực tế",
    owner: "thuha",
    members: [{ handle: "thuha", part: "Thiết kế chính" }],
    tools: ["Illustrator", "Figma"],
    files: [
      f("logo", "folder", undefined, "3 ngày trước"),
      f("bao-bi", "folder", undefined, "3 ngày trước"),
      f("brand-guideline.pdf", "pdf", "6,4 MB", "3 ngày trước"),
      f("mockup-ly-tra.webp", "image", "380 KB", "3 ngày trước"),
    ],
    versions: [
      { tag: "v2", note: "Chốt bao bì theo phản hồi của quán", when: "3 ngày trước" },
      { tag: "v1", note: "Ba hướng logo ban đầu", when: "3 tuần trước" },
    ],
    likes: 96,
    comments: 8,
    tone: "sap",
    seed: 7,
    updated: "3 ngày trước",
    readme: [
      { heading: "Khách hàng", body: "Một quán trà nhỏ cần nhận diện đơn giản, in được trên ly giấy và túi mang đi." },
      { heading: "Kết quả", body: "Logo một nét, hai màu chính và bộ tem nhãn in được bằng máy in nhiệt của quán." },
    ],
  },
  {
    slug: "dat-ban-ca-phe",
    title: "Ứng dụng đặt bàn cho quán cà phê",
    summary: "Web đặt bàn và gọi món trước cho quán cà phê nhỏ, có trang quản lý cho chủ quán.",
    field: "Công nghệ thông tin",
    output: "Phần mềm hoặc công cụ",
    context: "Học tập",
    contextNote: "Học phần",
    owner: "minhkhoa",
    members: [
      { handle: "minhkhoa", part: "Lập trình" },
      { handle: "giahuy", part: "Giao diện" },
    ],
    tools: ["Next.js", "PostgreSQL", "Figma"],
    files: [
      f("src", "folder", undefined, "hôm qua"),
      f("thiet-ke", "folder", undefined, "4 ngày trước"),
      f("bao-cao-do-an.pdf", "pdf", "2,1 MB", "hôm qua"),
      f("demo-dat-ban.mp4", "video", "8,9 MB", "4 ngày trước"),
    ],
    versions: [
      { tag: "v3", note: "Thêm trang quản lý cho chủ quán", when: "hôm qua" },
      { tag: "v2", note: "Gọi món trước khi đến", when: "2 tuần trước" },
    ],
    likes: 128,
    comments: 11,
    tone: "ink",
    seed: 11,
    updated: "hôm qua",
    readme: [{ heading: "Mục tiêu", body: "Giúp quán nhỏ nhận đặt bàn mà không cần gọi điện, giảm bàn trống giờ cao điểm." }],
  },
  {
    slug: "ra-mat-nuoc-ep",
    title: "Kế hoạch ra mắt nước ép mùa hè",
    summary: "Chiến dịch 6 tuần cho một thương hiệu nước ép mới, từ nghiên cứu khách hàng đến lịch đăng bài.",
    field: "Marketing",
    output: "Chiến dịch hoặc chương trình",
    context: "Dự án cá nhân",
    owner: "ngocanh",
    members: [{ handle: "ngocanh", part: "Trưởng nhóm" }],
    tools: ["Canva", "Google Sheets"],
    files: [
      f("ke-hoach-chien-dich.pdf", "pdf", "4,0 MB", "5 ngày trước"),
      f("lich-dang-bai.xlsx", "doc", "120 KB", "5 ngày trước"),
      f("bo-anh-quang-cao", "folder", undefined, "1 tuần trước"),
    ],
    versions: [{ tag: "v1", note: "Bản nộp giữa kỳ", when: "5 ngày trước" }],
    likes: 54,
    comments: 6,
    tone: "leaf",
    seed: 5,
    updated: "5 ngày trước",
    readme: [{ heading: "Tóm tắt", body: "Nhắm tới dân văn phòng 22–30 tuổi, kênh chính là TikTok và cửa hàng tiện lợi." }],
  },
  {
    slug: "robot-phan-loai-rac",
    title: "Cánh tay robot phân loại rác mini",
    summary: "Robot nhận diện chai nhựa, lon và giấy bằng camera rồi gắp vào đúng thùng.",
    field: "Kỹ thuật",
    output: "Sản phẩm kỹ thuật",
    context: "Dự án cá nhân",
    usage: "Đang dùng thử",
    owner: "hoanglong",
    members: [{ handle: "hoanglong", part: "Cơ khí và lập trình" }],
    tools: ["Arduino", "SolidWorks", "Python"],
    files: [
      f("ban-ve-co-khi", "folder", undefined, "6 ngày trước"),
      f("ma-nguon", "folder", undefined, "6 ngày trước"),
      f("mo-hinh-canh-tay.step", "model", "14,2 MB", "6 ngày trước"),
      f("chay-thu.mp4", "video", "12,4 MB", "6 ngày trước"),
    ],
    versions: [
      { tag: "v4", note: "Gắp chính xác hơn với lon bẹp", when: "6 ngày trước" },
      { tag: "v3", note: "Đổi sang camera rẻ hơn", when: "3 tuần trước" },
    ],
    likes: 187,
    comments: 19,
    tone: "leaf",
    seed: 9,
    updated: "6 ngày trước",
    readme: [{ heading: "Vì sao làm", body: "Ký túc xá có thùng phân loại nhưng ít ai bỏ đúng. Robot làm việc đó thay." }],
  },
  {
    slug: "chuoi-cung-ung-ca-phe",
    title: "Chuỗi cung ứng cà phê Tây Nguyên",
    summary: "Phân tích đường đi của hạt cà phê từ nông hộ đến quán, chỉ ra chỗ người trồng bị ép giá.",
    field: "Kinh doanh và tài chính",
    output: "Báo cáo hoặc phân tích",
    context: "Học tập",
    contextNote: "Học phần",
    owner: "hoanglong",
    members: [{ handle: "hoanglong", part: "Tác giả" }],
    tools: ["Excel", "Phỏng vấn"],
    files: [f("tieu-luan.pdf", "pdf", "1,6 MB", "1 tuần trước"), f("so-lieu.xlsx", "doc", "240 KB", "1 tuần trước")],
    versions: [{ tag: "v2", note: "Bổ sung phỏng vấn thương lái", when: "1 tuần trước" }],
    likes: 73,
    comments: 5,
    tone: "sap",
    seed: 13,
    updated: "1 tuần trước",
    readme: [{ heading: "Câu hỏi", body: "Một ly cà phê 30 nghìn, người trồng nhận được bao nhiêu?" }],
  },
  {
    slug: "cai-tao-chung-cu-cu",
    title: "Cải tạo chung cư cũ quận 3",
    summary: "Đề xuất cải tạo hành lang và sân chung của một chung cư 40 năm tuổi.",
    field: "Kiến trúc",
    output: "Thiết kế",
    context: "Học tập",
    contextNote: "Học phần",
    owner: "quocbao",
    members: [{ handle: "quocbao", part: "Thiết kế" }],
    tools: ["SketchUp"],
    files: [f("ban-ve.pdf", "pdf", "5,1 MB", "1 tháng trước")],
    versions: [{ tag: "v2", note: "Thêm khảo sát cư dân", when: "1 tháng trước" }],
    likes: 88,
    comments: 4,
    tone: "leaf",
    seed: 17,
    updated: "1 tháng trước",
    readme: [{ heading: "Ý tưởng", body: "Biến hành lang tối thành chỗ ngồi chung có cây xanh." }],
  },
  {
    slug: "quan-ca-phe-vuon",
    title: "Quán cà phê vườn 120m²",
    summary: "Thiết kế nội thất quán cà phê có vườn trong nhà cho mặt bằng thuê.",
    field: "Kiến trúc",
    output: "Thiết kế",
    context: "Công việc",
    owner: "quocbao",
    members: [{ handle: "quocbao", part: "Nội thất" }],
    tools: ["SketchUp", "Lumion"],
    files: [f("phoi-canh", "folder", undefined, "2 tháng trước")],
    versions: [{ tag: "v3", note: "Đổi vật liệu sàn", when: "2 tháng trước" }],
    likes: 64,
    comments: 3,
    tone: "sap",
    seed: 21,
    updated: "2 tháng trước",
    readme: [{ heading: "Yêu cầu", body: "Chi phí thấp, tháo lắp được khi hết hợp đồng thuê." }],
  },
];

/** Trang chủ là bảng tin chung. "Công bố" là một loại bài, chỉ dành cho bản đã Hoàn tất hoặc Đã triển khai. */
export type PostKind = "Chia sẻ" | "Công bố" | "Tìm cộng sự";
export const POST_KINDS: PostKind[] = ["Chia sẻ", "Công bố", "Tìm cộng sự"];

export interface Post {
  id: string;
  author: string;
  kind: PostKind;
  when: string;
  text: string;
  project?: string;
  /** Phiên bản được công bố, với bài Công bố. */
  version?: string;
  needs?: string[];
  media?: Media[];
  likes: number;
  comments: { author: string; text: string; when: string }[];
  reposts: number;
}

export const POSTS: Post[] = [
  {
    id: "p6",
    author: "minhkhoa",
    kind: "Chia sẻ",
    when: "40 phút trước",
    text: "Quay lại cảnh bạn mình đặt bàn trên bản v3. Sơ đồ quán phải phóng to mới bấm trúng bàn, nên mình đang mở trao đổi để chọn giữa sơ đồ và danh sách giờ trống.",
    project: "dat-ban-ca-phe",
    media: [MEDIA.datBanVideo],
    likes: 18,
    comments: [{ author: "thuha", text: "Đoạn phóng to ở giây thứ hai thấy rõ vấn đề luôn.", when: "20 phút trước" }],
    reposts: 0,
  },
  {
    id: "p5",
    author: "thuha",
    kind: "Công bố",
    version: "v2",
    when: "1 giờ trước",
    text: "Bàn giao xong bộ nhận diện cho Trà Mây: logo, bảng màu lấy từ lá trà non và gói bao bì giấy kraft cho ba dòng trà.",
    project: "nhan-dien-tra-may",
    media: [MEDIA.traMayBaoBi, MEDIA.traMayLogo],
    likes: 96,
    comments: [{ author: "ngocanh", text: "Bảng màu lên giấy kraft đẹp hơn mình nghĩ. Có ảnh chụp thật ở quán không?", when: "30 phút trước" }],
    reposts: 4,
  },
  {
    id: "p1",
    author: "quocbao",
    kind: "Công bố",
    version: "v5",
    when: "2 giờ trước",
    text: "Đồ án nhà phố đã bảo vệ xong. Bản v5 có thêm mặt cắt thông gió và phối cảnh ban đêm, giếng trời lùi về giữa một nhịp cột.",
    project: "nha-pho-thong-gio",
    media: [MEDIA.nhaPhoBanDem, MEDIA.nhaPhoMatCat, MEDIA.nhaPhoMatBang],
    likes: 210,
    comments: [
      { author: "thuha", text: "Phối cảnh ban đêm đẹp quá. Giếng trời có lưới chắn mưa không?", when: "1 giờ trước" },
      { author: "hoanglong", text: "Thử đặt thêm quạt hút nhỏ trên đỉnh giếng xem.", when: "40 phút trước" },
    ],
    reposts: 3,
  },
  {
    id: "p2",
    author: "ngocanh",
    kind: "Tìm cộng sự",
    when: "5 giờ trước",
    text: "Mình đang làm kế hoạch ra mắt một thương hiệu nước ép, cần một bạn thiết kế bao bì và một bạn quay dựng video ngắn. Làm trong 3 tuần, ghi tên đầy đủ vào dự án.",
    needs: ["Thiết kế bao bì", "Quay dựng video"],
    likes: 42,
    comments: [],
    reposts: 5,
  },
  {
    id: "p4",
    author: "giahuy",
    kind: "Công bố",
    version: "v3",
    when: "3 ngày trước",
    text: "Bản demo Nova × Replyn nộp UniHackFest 2026: hồ sơ, việc làm và hợp đồng có giữ tiền chạy trọn luồng trên mạng thử.",
    project: "nova-replyn",
    likes: 31,
    comments: [],
    reposts: 1,
  },
  {
    id: "p3",
    author: "hoanglong",
    kind: "Chia sẻ",
    when: "hôm qua",
    text: "Mẹo nhỏ: in 3D khớp nối bằng PETG thay vì PLA, cánh tay robot của mình bớt gãy hẳn khi gắp lon.",
    likes: 67,
    comments: [{ author: "minhkhoa", text: "Ghi lại vào phần giới thiệu dự án luôn đi bạn.", when: "hôm qua" }],
    reposts: 2,
  },
];

export type NoticeKind = "like" | "comment" | "follow" | "mention" | "milestone" | "view" | "event" | "exchange";

/** Không có `actor` là thông báo từ Grovelyn (sự kiện, lượt xem hồ sơ, cột mốc). */
export interface Notice {
  id: string;
  kind: NoticeKind;
  actor?: string;
  others?: number;
  text: string;
  /** Dự án liên quan; tên dự án được chèn in đậm vào chỗ {p} trong `text`. */
  project?: string;
  /** Trích đoạn bình luận hoặc bài viết. */
  quote?: string;
  when: string;
  day: "today" | "week" | "earlier";
  unread: boolean;
  href: string;
}

export const NOTICES: Notice[] = [
  { id: "n1", kind: "like", actor: "thuha", others: 5, text: "đã thích dự án {p}", project: "dat-ban-ca-phe", when: "10 phút", day: "today", unread: true, href: "/p/dat-ban-ca-phe" },
  { id: "n2", kind: "comment", actor: "quocbao", text: "đã bình luận về dự án {p}", project: "dat-ban-ca-phe", quote: "Giao diện đặt bàn gọn quá, có bản điện thoại chưa?", when: "1 giờ", day: "today", unread: true, href: "/p/dat-ban-ca-phe#thao-luan" },
  { id: "n3", kind: "milestone", actor: "minhkhoa", text: "vừa đăng bản mới cho dự án {p} mà bạn đang theo dõi", project: "robot-phan-loai-rac", when: "3 giờ", day: "today", unread: true, href: "/p/robot-phan-loai-rac#hanh-trinh" },
  { id: "n11", kind: "exchange", actor: "minhkhoa", text: "mở trao đổi ở dự án {p}, cùng ngành Công nghệ thông tin với bạn", project: "dat-ban-ca-phe", quote: "Màn chọn bàn nên là sơ đồ quán hay danh sách giờ còn trống?", when: "2 giờ", day: "today", unread: false, href: "/p/dat-ban-ca-phe#trao-doi" },
  { id: "n4", kind: "view", text: "Hồ sơ của bạn được 18 người xem trong tuần này. Thêm \"Mình có thể góp ý về\" để nhận chủ đề Trao đổi hợp với bạn.", when: "5 giờ", day: "today", unread: false, href: "/u/giahuy" },
  { id: "n5", kind: "follow", actor: "hoanglong", text: "đã bắt đầu theo dõi bạn", when: "hôm qua", day: "week", unread: false, href: "/u/hoanglong" },
  { id: "n6", kind: "mention", actor: "ngocanh", text: "đã nhắc đến bạn trong bài Tìm cộng sự", quote: "Cần thêm một bạn làm web đặt món, @giahuy có hứng không?", when: "2 ngày", day: "week", unread: false, href: "/community" },
  { id: "n7", kind: "event", text: "Sự kiện Làm portfolio cho người trái ngành bạn quan tâm sẽ diễn ra sau 2 ngày, 19:00 tại Xưởng Lá Coworking.", when: "3 ngày", day: "week", unread: false, href: "/events" },
  { id: "n8", kind: "like", actor: "minhkhoa", others: 1, text: "đã thích dự án {p}", project: "nova-replyn", when: "5 ngày", day: "week", unread: false, href: "/p/nova-replyn" },
  { id: "n9", kind: "milestone", text: "Dự án {p} đã đi từ Ý tưởng tới Hoàn tất qua 3 cột mốc.", project: "nova-replyn", when: "2 tuần", day: "earlier", unread: false, href: "/p/nova-replyn#hanh-trinh" },
  { id: "n10", kind: "comment", actor: "thuha", text: "đã trả lời bình luận của bạn trong dự án {p}", project: "nhan-dien-tra-may", quote: "Đúng rồi, bảng màu lấy từ lá trà non và gốm men lam.", when: "3 tuần", day: "earlier", unread: false, href: "/p/nhan-dien-tra-may#thao-luan" },
  { id: "n12", kind: "exchange", actor: "thuha", text: "đã áp dụng góp ý của bạn vào bản v2 của dự án {p}", project: "nhan-dien-tra-may", when: "tháng 9", day: "earlier", unread: false, href: "/p/nhan-dien-tra-may#trao-doi" },
];

export const ME = "giahuy";

export const userOf = (handle: string) => USERS.find((u) => u.handle === handle);
export const projectOf = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const projectsBy = (handle: string) => PROJECTS.filter((p) => p.owner === handle || p.members.some((m) => m.handle === handle));

/** Dung lượng mỗi tài khoản trong giai đoạn thử nghiệm. */
export const QUOTA_MB = 100;

/* Cộng đồng: nhóm và người đang online (sự kiện ở events.ts) (dữ liệu mẫu cho bản giao diện). */

export type GroupPrivacy = "Công khai" | "Riêng tư";

export interface GroupPerms {
  invite: boolean;
  approvePosts: boolean;
  attachProjects: boolean;
  createEvents: boolean;
}

export interface Group {
  slug: string;
  mark: string;
  name: string;
  members: number;
  /** Số bài mới kể từ lần cuối bạn vào nhóm. */
  fresh: number;
  tone: CoverTone;
  description: string;
  privacy: GroupPrivacy;
  fields: Field[];
  area: string;
  founded: string;
  admins: string[];
  rules: string[];
  coverSeed: number;
  coverTone: CoverTone;
  cover?: string;
  /** Bạn (ME) đã ở trong nhóm chưa. */
  joined: boolean;
  /** Lý do gợi ý, cho nhóm bạn chưa tham gia. */
  why?: string;
  perms: GroupPerms;
}

const DEFAULT_PERMS: GroupPerms = { invite: true, approvePosts: false, attachProjects: true, createEvents: true };

export const GROUPS: Group[] = [
  {
    slug: "kien-truc-nha-pho", mark: "KT", name: "Kiến trúc nhà phố", members: 128, fresh: 4, tone: "ink",
    description: "Chia sẻ đồ án, bản vẽ và giải pháp nhà ở tiết kiệm năng lượng cho khí hậu nóng ẩm.",
    privacy: "Công khai", fields: ["Kiến trúc"], area: "TP. Hồ Chí Minh", founded: "2026-10-02", admins: ["quocbao", "giahuy"],
    rules: ["Ghi nguồn khi dùng bản vẽ của người khác", "Góp ý vào dự án, không vào con người", "Tìm cộng sự thì ghi rõ thời gian và quyền lợi"],
    coverSeed: 47, coverTone: "ink", cover: "/demo/event-cover.svg", joined: true, perms: DEFAULT_PERMS,
  },
  {
    slug: "vhu-lam-du-an", mark: "VH", name: "Sinh viên VHU làm dự án", members: 312, fresh: 0, tone: "leaf",
    description: "Sinh viên Đại học Văn Hiến mọi ngành tìm nhau làm dự án, khoe đồ án và rủ nhau đi thi.",
    privacy: "Riêng tư", fields: ["Công nghệ thông tin", "Thiết kế", "Kinh doanh và tài chính"], area: "TP. Hồ Chí Minh", founded: "2026-09-12", admins: ["giahuy"],
    rules: ["Chỉ dành cho sinh viên và cựu sinh viên VHU", "Dự án nhóm thì ghi đủ tên thành viên"],
    coverSeed: 12, coverTone: "leaf", joined: true, perms: { ...DEFAULT_PERMS, approvePosts: true },
  },
  {
    slug: "freelance-thiet-ke", mark: "FL", name: "Freelance thiết kế", members: 86, fresh: 1, tone: "sap",
    description: "Người làm thiết kế tự do chia sẻ cách nhận việc, báo giá và giữ khách.",
    privacy: "Riêng tư", fields: ["Thiết kế", "Truyền thông"], area: "Toàn quốc, sinh hoạt trực tuyến", founded: "2026-08-20", admins: ["thuha"],
    rules: ["Không đăng việc trả công dưới mức thị trường", "Góp ý vào dự án, không vào con người"],
    coverSeed: 31, coverTone: "sap", joined: true, perms: DEFAULT_PERMS,
  },
  {
    slug: "robot-vi-dieu-khien", mark: "RB", name: "Robot và vi điều khiển", members: 204, fresh: 0, tone: "ink",
    description: "Lắp, nạp code và thử robot cùng nhau. Có buổi lắp ráp mở mỗi tháng.",
    privacy: "Công khai", fields: ["Kỹ thuật", "Công nghệ thông tin"], area: "TP. Hồ Chí Minh", founded: "2026-07-01", admins: ["hoanglong"],
    rules: ["Đăng sơ đồ mạch kèm code khi hỏi lỗi"], coverSeed: 88, coverTone: "ink", joined: false,
    why: "Võ Hoàng Long và 2 người bạn theo dõi đang ở đây", perms: DEFAULT_PERMS,
  },
  {
    slug: "dung-phim-ngan", mark: "DP", name: "Dựng phim ngắn", members: 97, fresh: 0, tone: "sap",
    description: "Quay, dựng và chấm phim ngắn cho thương hiệu nhỏ.", privacy: "Công khai", fields: ["Truyền thông", "Marketing"],
    area: "Toàn quốc, sinh hoạt trực tuyến", founded: "2026-06-15", admins: ["ngocanh"], rules: [], coverSeed: 5, coverTone: "sap", joined: false,
    why: "Hợp với kỹ năng Quay dựng trong hồ sơ", perms: DEFAULT_PERMS,
  },
  {
    slug: "react-nextjs-vn", mark: "RN", name: "React và Next.js Việt Nam", members: 1240, fresh: 0, tone: "leaf",
    description: "Hỏi đáp, chia sẻ dự án và cơ hội việc làm cho người làm React, Next.js.", privacy: "Riêng tư", fields: ["Công nghệ thông tin"],
    area: "Toàn quốc, sinh hoạt trực tuyến", founded: "2026-03-01", admins: ["minhkhoa"], rules: [], coverSeed: 64, coverTone: "leaf", joined: false,
    why: "Nhiều dự án Công nghệ thông tin bạn đã lưu", perms: { ...DEFAULT_PERMS, approvePosts: true },
  },
];

export const MY_GROUPS = GROUPS.filter((g) => g.joined);
export const groupOf = (slug: string) => GROUPS.find((g) => g.slug === slug);

/** Người đang online, hiện tối đa vài avatar và đếm phần còn lại. */
export const ONLINE = ["quocbao", "thuha", "minhkhoa", "ngocanh", "hoanglong"];
export const ONLINE_TOTAL = 14;

/** Nhãn bối cảnh ngắn để hiện trên thẻ: ưu tiên chi tiết ("Đồ án tốt nghiệp") hơn nhóm rộng ("Học tập"). */
export const contextLabel = (p: Pick<Project, "context" | "contextNote">) => p.contextNote || p.context;

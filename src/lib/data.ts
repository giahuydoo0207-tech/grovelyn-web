/**
 * Dữ liệu mẫu cho bản giao diện. Chưa nối Supabase: mọi tên người, dự án và con số ở đây chỉ để minh họa.
 */

export const FIELDS = [
  "Tất cả",
  "Công nghệ thông tin",
  "Thiết kế",
  "Kiến trúc",
  "Marketing",
  "Kinh tế",
  "Kỹ thuật",
  "Truyền thông",
] as const;

export type Field = Exclude<(typeof FIELDS)[number], "Tất cả">;
export type CoverTone = "ink" | "leaf" | "sap";
export type Role = "Sinh viên" | "Freelancer" | "Doanh nghiệp";

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
  kind: string;
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
  role: Role;
  headline: string;
  location: string;
  available: boolean;
  hoursPerWeek?: number;
  about: string;
  skills: string[];
  experience: { title: string; where: string; when: string }[];
  education: { title: string; where: string; when: string }[];
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
    role: "Sinh viên",
    headline: "Sinh viên năm cuối ngành Kiến trúc, mê nhà ở tiết kiệm năng lượng",
    location: "TP. Hồ Chí Minh",
    available: true,
    hoursPerWeek: 15,
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
    role: "Freelancer",
    headline: "Thiết kế nhận diện thương hiệu cho quán nhỏ và thương hiệu Việt",
    location: "Đà Nẵng",
    available: true,
    hoursPerWeek: 25,
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
    role: "Sinh viên",
    headline: "Sinh viên CNTT, làm web và app cho quán cà phê",
    location: "TP. Hồ Chí Minh",
    available: false,
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
    role: "Sinh viên",
    headline: "Sinh viên Marketing, thích làm chiến dịch cho thương hiệu nhỏ",
    location: "Hà Nội",
    available: true,
    hoursPerWeek: 10,
    about: "Lên kế hoạch ra mắt sản phẩm và viết nội dung mạng xã hội.",
    skills: ["Lập kế hoạch", "Viết nội dung", "Canva", "Nghiên cứu thị trường"],
    experience: [],
    education: [{ title: "Cử nhân Marketing", where: "[Tên trường]", when: "2023 – 2027" }],
    followers: 240,
    following: 310,
    pinned: ["ra-mat-nuoc-ep"],
    tone: "sap",
  },
  {
    handle: "hoanglong",
    name: "Võ Hoàng Long",
    initials: "HL",
    role: "Sinh viên",
    headline: "Sinh viên Cơ điện tử, làm robot nhỏ phục vụ đời sống",
    location: "Cần Thơ",
    available: true,
    hoursPerWeek: 12,
    about: "Thích làm ra thứ chạy được thật. Đang tìm người cùng làm phần vỏ và điện.",
    skills: ["Arduino", "SolidWorks", "Python", "In 3D"],
    experience: [],
    education: [{ title: "Kỹ sư Cơ điện tử", where: "[Tên trường]", when: "2022 – 2027" }],
    followers: 530,
    following: 88,
    pinned: ["robot-phan-loai-rac"],
    tone: "ink",
  },
  {
    handle: "giahuy",
    name: "Gia Huy",
    initials: "GH",
    role: "Sinh viên",
    headline: "Sinh viên lập trình web",
    location: "TP. Hồ Chí Minh",
    available: true,
    hoursPerWeek: 20,
    about: "Đang xây Grovelyn.",
    skills: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    experience: [],
    education: [{ title: "Lập trình web", where: "[Tên trường]", when: "2024 – nay" }],
    followers: 0,
    following: 0,
    pinned: [],
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
    slug: "nha-pho-thong-gio",
    title: "Nhà phố 4x16m thông gió tự nhiên",
    summary:
      "Nhà ống 3 tầng dùng giếng trời và cửa so le giữa các tầng để gió đi xuyên nhà, giảm phụ thuộc máy lạnh.",
    field: "Kiến trúc",
    kind: "Đồ án tốt nghiệp",
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
    kind: "Dự án khách hàng",
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
    kind: "Đồ án môn học",
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
    kind: "Bài tập nhóm",
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
    kind: "Nghiên cứu khoa học",
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
    field: "Kinh tế",
    kind: "Tiểu luận",
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
    kind: "Đồ án môn học",
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
    kind: "Dự án khách hàng",
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

export type PostKind = "Chia sẻ" | "Khoe dự án" | "Tìm cộng sự" | "Cơ hội";

export interface Post {
  id: string;
  author: string;
  kind: PostKind;
  when: string;
  text: string;
  project?: string;
  needs?: string[];
  likes: number;
  comments: { author: string; text: string; when: string }[];
  reposts: number;
}

export const POSTS: Post[] = [
  {
    id: "p1",
    author: "quocbao",
    kind: "Khoe dự án",
    when: "2 giờ trước",
    text: "Vừa lên v5 cho đồ án nhà phố: thêm mặt cắt và phối cảnh ban đêm. Mọi người góp ý giúp mình phần giếng trời nhé.",
    project: "nha-pho-thong-gio",
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

export interface Notice {
  id: string;
  actor: string;
  others?: number;
  text: string;
  when: string;
  unread: boolean;
  href: string;
}

export const NOTICES: Notice[] = [
  { id: "n1", actor: "thuha", others: 5, text: "đã thích dự án Ứng dụng đặt bàn cho quán cà phê", when: "10 phút trước", unread: true, href: "/p/dat-ban-ca-phe" },
  { id: "n2", actor: "quocbao", text: "đã bình luận: Giao diện đặt bàn gọn quá, có bản điện thoại chưa?", when: "1 giờ trước", unread: true, href: "/p/dat-ban-ca-phe" },
  { id: "n3", actor: "hoanglong", text: "đã bắt đầu theo dõi bạn", when: "hôm qua", unread: false, href: "/u/hoanglong" },
  { id: "n4", actor: "ngocanh", text: "đã nhắc đến bạn trong bài Tìm cộng sự", when: "2 ngày trước", unread: false, href: "/community" },
];

export const ME = "giahuy";

export const userOf = (handle: string) => USERS.find((u) => u.handle === handle);
export const projectOf = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const projectsBy = (handle: string) => PROJECTS.filter((p) => p.owner === handle || p.members.some((m) => m.handle === handle));

/** Dung lượng mỗi tài khoản trong giai đoạn thử nghiệm. */
export const QUOTA_MB = 100;

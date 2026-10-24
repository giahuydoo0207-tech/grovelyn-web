import type { Project } from "./data";
import type { LogoKey } from "@/components/project/ProjectLogo";

/**
 * Phần "sống" của trang dự án: bộ ảnh, thông số theo ngành, nội dung nhúng, liên kết và hành trình từ ý tưởng tới
 * bản cuối. Dữ liệu mẫu; dự án chưa có phần này thì dựng tạm từ lịch sử phiên bản.
 */

export type Phase = "concept" | "draft" | "final" | "shipped";

export const PHASES: { id: Phase; label: string; hint: string }[] = [
  { id: "concept", label: "Ý tưởng", hint: "Phác thảo, nghiên cứu, hướng đi" },
  { id: "draft", label: "Đang làm", hint: "Đang làm, nhận góp ý, chỉnh sửa" },
  { id: "final", label: "Hoàn tất", hint: "Xong bản trình bày hoặc bản dùng được" },
  { id: "shipped", label: "Đã triển khai", hint: "Đã thi công, đã chạy hoặc đã đưa vào dùng thật" },
];

export const phaseLabel = (p: Phase) => PHASES.find((x) => x.id === p)!.label;

/** Một ảnh trong dự án. `src` là ảnh thật (đường dẫn hoặc ảnh người dùng tải lên). */
export interface Shot {
  src: string;
  caption: string;
}

export interface Milestone {
  id: string;
  phase: Phase;
  title: string;
  note: string;
  when: string;
  /** Phiên bản tệp đi kèm cột mốc, nếu có. */
  version?: string;
  shots?: Shot[];
  /** Link nhúng (Figma, YouTube, Drive, PDF) cho cột mốc này. */
  embed?: string;
  /** Ai đăng cột mốc. */
  by?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  kind: "demo" | "file" | "repo" | "other";
}

/** Bốn tài nguyên chính, hiện thành nút ở cột phải trang dự án. */
export interface Resources {
  demo?: string;
  repo?: string;
  slides?: string;
  video?: string;
}

export interface Showcase {
  logo?: LogoKey;
  resources?: Resources;
  /** Chuyên môn (Blockchain & Web3, Phát triển Mobile…). */
  expertise?: string[];
  /** Hạng mục dự thi, nếu là dự án dự thi. */
  tracks?: string[];
  tags: string[];
  facts: Record<string, string>;
  gallery: Shot[];
  beforeAfter?: { before: Shot; after: Shot };
  embeds: { title: string; url: string }[];
  links: ProjectLink[];
  /** Mới nhất trước. */
  milestones: Milestone[];
}

const img = (name: string, caption: string): Shot => ({ src: `/demo/projects/${name}.svg`, caption });

const shot = (name: string, caption: string): Shot => ({ src: `/demo/projects/${name}.png`, caption });

const DATA: Record<string, Showcase> = {
  "nova-replyn": {
    logo: "nova",
    resources: {
      demo: "https://nivex-business.vercel.app/?lang=en",
      repo: "https://github.com/giahuydoo0207-tech/NIVEX-BUSINESS",
      video: "https://youtu.be/w0Qzx1Avk4g",
    },
    expertise: ["Blockchain & Web3", "Phát triển Full-stack", "Phát triển Mobile"],
    tracks: ["Best Product & Business"],
    tags: ["UniHackFest 2026", "Freelancer", "Thanh toán xuyên biên giới"],
    facts: {
      stack: "Flutter, Next.js, Spring Boot",
      users: "Freelancer và doanh nghiệp",
      status: "Prototype, Solana Devnet",
      role: "Chủ dự án, lập trình",
    },
    gallery: [
      shot("nova-tong-quan", "Tổng quan thanh toán (Business)"),
      shot("nova-hoa-don", "Tạo hóa đơn"),
      shot("nova-thanh-toan", "Xác nhận thanh toán USDC"),
      shot("nova-replyn-chat", "Replyn: chat và thỏa thuận"),
    ],
    embeds: [],
    links: [
      { label: "Repo ứng dụng di động", url: "https://github.com/giahuydoo0207-tech/NIVEX-FLUTTER", kind: "repo" },
    ],
    milestones: [
      {
        id: "nr-3",
        phase: "final",
        title: "Bản demo nộp UniHackFest 2026",
        note: "Chạy trọn luồng trên Solana Devnet: doanh nghiệp đăng việc, freelancer ứng tuyển, trao đổi, lập hóa đơn và nhận thanh toán thử.",
        when: "5 thg 10, 2026",
        version: "v3",
        shots: [shot("nova-thanh-toan", "Xác nhận thanh toán USDC")],
        embed: "https://youtu.be/w0Qzx1Avk4g",
        by: "giahuy",
      },
      {
        id: "nr-2",
        phase: "draft",
        title: "Bổ sung Replyn, lớp niềm tin khi hợp tác",
        note: "Chốt thỏa thuận, chia giai đoạn, nộp sản phẩm, yêu cầu sửa và giữ nhật ký bằng chứng khi hai bên làm việc.",
        when: "3 thg 10, 2026",
        version: "v2",
        shots: [shot("nova-replyn-chat", "Replyn: chat và thỏa thuận")],
        by: "giahuy",
      },
      {
        id: "nr-1",
        phase: "concept",
        title: "Nova Mobile và Nova Business",
        note: "Xác định hai nhóm người dùng chính và hành trình từ xây hồ sơ, tìm việc đến bắt đầu hợp tác.",
        when: "20 thg 9, 2026",
        version: "v1",
        shots: [shot("nova-tong-quan", "Tổng quan thanh toán (Business)")],
        by: "giahuy",
      },
    ],
  },
  "nha-pho-thong-gio": {
    logo: "nha",
    expertise: ["Kiến trúc nhà ở", "Thông gió tự nhiên"],
    tags: ["Nhà ở", "Thông gió tự nhiên", "Kiến trúc nhiệt đới", "Nhà phố"],
    facts: { area: "64 m² đất, 168 m² sàn", location: "Bình Thạnh, TP.HCM", cost: "1,8 tỷ đồng (ước tính)", time: "14 tuần" },
    gallery: [
      img("nha-pho-mat-bang", "Mặt bằng tầng trệt, giếng trời ở giữa nhà"),
      img("nha-pho-mat-cat", "Mặt cắt A-A, đường đi của gió"),
      img("nha-pho-ban-dem", "Phối cảnh ban đêm"),
      img("nha-pho-concept", "Phác thảo đầu tiên"),
    ],
    beforeAfter: {
      before: img("nha-pho-truoc", "Nhà ống hiện trạng"),
      after: img("nha-pho-sau", "Sau khi mở giếng trời"),
    },
    embeds: [{ title: "Thuyết minh thông gió", url: "/demo/projects/nha-pho-thuyet-minh.pdf" }],
    links: [
      { label: "Thuyết minh (PDF)", url: "/demo/projects/nha-pho-thuyet-minh.pdf", kind: "file" },
      { label: "Bộ bản vẽ", url: "#tep", kind: "file" },
    ],
    milestones: [
      {
        id: "np-5",
        phase: "final",
        title: "Hoàn thiện bộ trình bày",
        note: "Thêm mặt cắt A-A và phối cảnh ban đêm theo góp ý của thầy hướng dẫn. Bản này dùng để bảo vệ.",
        when: "2 ngày trước",
        version: "v5",
        shots: [img("nha-pho-mat-cat", "Mặt cắt A-A"), img("nha-pho-ban-dem", "Phối cảnh ban đêm")],
        embed: "/demo/projects/nha-pho-thuyet-minh.pdf",
        by: "quocbao",
      },
      {
        id: "np-4",
        phase: "draft",
        title: "Mở rộng giếng trời",
        note: "Mô phỏng cho thấy giếng trời 1,8 m chưa đủ kéo gió lên tầng 3. Nới lên 2,4 m và dời cầu thang ra sát tường.",
        when: "1 tuần trước",
        version: "v4",
        shots: [img("nha-pho-mat-bang", "Mặt bằng sau khi nới giếng trời")],
        by: "quocbao",
      },
      {
        id: "np-2",
        phase: "draft",
        title: "Mặt bằng tầng 2, 3",
        note: "Chốt bố cục phòng ngủ hai bên giếng trời, cửa sổ lệch tầng.",
        when: "1 tháng trước",
        version: "v2",
        by: "quocbao",
      },
      {
        id: "np-1",
        phase: "concept",
        title: "Phác thảo ý tưởng",
        note: "Bắt đầu từ câu hỏi: làm sao để gió đi xuyên một căn nhà chỉ hở hai đầu? Ba phác thảo tay, chọn hướng giếng trời giữa nhà.",
        when: "2 tháng trước",
        shots: [img("nha-pho-concept", "Phác thảo bút chì")],
        by: "quocbao",
      },
    ],
  },
  "nhan-dien-tra-may": {
    logo: "tra",
    expertise: ["Nhận diện thương hiệu", "Thiết kế bao bì"],
    tags: ["Nhận diện thương hiệu", "Bao bì", "F&B", "Đà Nẵng"],
    facts: { client: "Quán trà Mây, Đà Nẵng", role: "Thiết kế chính", time: "3 tuần", deliverables: "Logo, bảng màu, ly, túi, tem nhãn" },
    gallery: [
      img("tra-may-logo", "Logo bản cuối"),
      img("tra-may-bao-bi", "Ly giấy và túi mang đi"),
      img("tra-may-ba-huong", "Ba hướng ban đầu"),
    ],
    embeds: [],
    links: [{ label: "Brand guideline", url: "#tep", kind: "file" }],
    milestones: [
      {
        id: "tm-2",
        phase: "final",
        title: "Chốt bao bì",
        note: "Quán chọn hướng C, đổi màu xanh đậm hơn để in rõ trên ly giấy bằng máy in nhiệt.",
        when: "3 ngày trước",
        version: "v2",
        shots: [img("tra-may-logo", "Logo bản cuối"), img("tra-may-bao-bi", "Bao bì")],
        by: "thuha",
      },
      {
        id: "tm-1",
        phase: "concept",
        title: "Ba hướng logo",
        note: "Mây một nét, hoàng hôn và sóng biển. Đem cả ba tới quán để chủ quán và khách quen chọn.",
        when: "3 tuần trước",
        version: "v1",
        shots: [img("tra-may-ba-huong", "Ba hướng ban đầu")],
        by: "thuha",
      },
    ],
  },
  "dat-ban-ca-phe": {
    logo: "datban",
    expertise: ["Phát triển web", "UI/UX"],
    tags: ["Web app", "Đặt bàn", "F&B", "Quán nhỏ"],
    facts: { stack: "Next.js, PostgreSQL", users: "Chủ quán và khách đặt bàn", status: "Chạy thử tại 1 quán ở Thủ Đức", role: "Lập trình, giao diện" },
    gallery: [
      img("dat-ban-man-hinh", "Ba màn đặt bàn trên điện thoại"),
      img("dat-ban-quan-ly", "Trang quản lý cho chủ quán"),
      img("dat-ban-wireframe", "Wireframe ban đầu"),
    ],
    embeds: [],
    links: [
      { label: "Báo cáo đồ án", url: "#tep", kind: "file" },
      { label: "Mã nguồn", url: "#tep", kind: "repo" },
    ],
    milestones: [
      {
        id: "db-3",
        phase: "draft",
        title: "Trang quản lý cho chủ quán",
        note: "Chủ quán xem tối nay có bao nhiêu bàn đặt theo từng giờ. Đang chạy thử ở một quán, tuần sau chỉnh theo phản hồi.",
        when: "hôm qua",
        version: "v3",
        shots: [img("dat-ban-quan-ly", "Trang quản lý")],
        by: "minhkhoa",
      },
      {
        id: "db-2",
        phase: "draft",
        title: "Gọi món trước khi đến",
        note: "Thêm bước gọi món sau khi chọn bàn, quán chuẩn bị sẵn khi khách tới.",
        when: "2 tuần trước",
        version: "v2",
        shots: [img("dat-ban-man-hinh", "Giao diện v2")],
        by: "giahuy",
      },
      {
        id: "db-1",
        phase: "concept",
        title: "Wireframe luồng đặt bàn",
        note: "Phỏng vấn 3 chủ quán: họ mất khách giờ cao điểm vì không nghe máy kịp. Vẽ luồng 3 bước: giờ, bàn, món.",
        when: "1 tháng trước",
        shots: [img("dat-ban-wireframe", "Wireframe")],
        by: "giahuy",
      },
    ],
  },
  "ra-mat-nuoc-ep": {
    logo: "nuocep",
    expertise: ["Kế hoạch ra mắt", "Marketing mạng xã hội"],
    tags: ["Ra mắt sản phẩm", "TikTok", "Đồ uống", "Gen Z"],
    facts: {
      goal: "10.000 lượt dùng thử trong 6 tuần",
      budget: "45 triệu đồng (giả định)",
      kpi: "CPA dưới 15.000đ",
      result: "Đang chạy tuần 6",
    },
    gallery: [img("nuoc-ep-kpi", "Lượt dùng thử theo tuần"), img("nuoc-ep-moodboard", "Moodboard")],
    embeds: [],
    links: [{ label: "Kế hoạch chiến dịch", url: "#tep", kind: "file" }],
    milestones: [
      {
        id: "ne-2",
        phase: "draft",
        title: "Số liệu 6 tuần",
        note: "Từ tuần 5 lượt dùng thử vượt mục tiêu nhờ đổi sang video ngắn tại cửa hàng tiện lợi.",
        when: "5 ngày trước",
        version: "v1",
        shots: [img("nuoc-ep-kpi", "Biểu đồ KPI")],
        by: "ngocanh",
      },
      {
        id: "ne-1",
        phase: "concept",
        title: "Moodboard và thông điệp",
        note: "Chốt tông cam vàng, thông điệp \"ép mùa hè vào chai\".",
        when: "3 tuần trước",
        shots: [img("nuoc-ep-moodboard", "Moodboard")],
        by: "ngocanh",
      },
    ],
  },
};

/** Dự án chưa có dữ liệu riêng: hành trình dựng từ lịch sử phiên bản, cũ nhất là ý tưởng, mới nhất là bản nháp. */
function fallback(project: Project): Showcase {
  const n = project.versions.length;
  return {
    tags: [],
    facts: {},
    gallery: [],
    embeds: [],
    links: [],
    milestones: project.versions.map((v, i) => ({
      id: `${project.slug}-${v.tag}`,
      phase: i === n - 1 && n > 1 ? "concept" : "draft",
      title: v.note,
      note: "",
      when: v.when,
      version: v.tag,
      by: project.owner,
    })),
  };
}

export const showcaseOf = (project: Project): Showcase =>
  DATA[project.slug] ?? { ...fallback(project), logo: project.slug === "robot-phan-loai-rac" ? "robot" : undefined };

/** Giai đoạn hiện tại = giai đoạn của cột mốc mới nhất. */
export const currentPhase = (milestones: Milestone[]): Phase => milestones[0]?.phase ?? "concept";

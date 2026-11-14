/** Ảnh hoặc video đính kèm bài viết, trao đổi và góp ý. */
export interface Media {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Ảnh đại diện của video. */
  poster?: string;
  /** Kích thước gốc, để lưới tự chọn cách chia. Ảnh mẫu cũ không có. */
  w?: number;
  h?: number;
}

/**
 * Cách chia lưới khi có từ 3 ảnh:
 * - auto: tự chọn theo tỉ lệ ảnh đầu (ngang thì để trên, dọc thì để trái), không rõ thì đổi theo từng bài cho đỡ lặp.
 * - tall: một tấm to bên trái, các tấm còn lại xếp dọc bên phải.
 * - wide: một tấm to bên trên, các tấm còn lại xếp ngang bên dưới.
 * - even: chia đều.
 */
export type MediaLayout = "auto" | "tall" | "wide" | "even";
export const MEDIA_LAYOUTS: { id: MediaLayout; label: string }[] = [
  { id: "auto", label: "Tự chọn" },
  { id: "tall", label: "To bên trái" },
  { id: "wide", label: "To bên trên" },
  { id: "even", label: "Chia đều" },
];

/** Chốt kiểu lưới thật sự dùng. `seed` để kiểu auto đổi theo từng bài. */
export function resolveLayout(media: Media[], layout: MediaLayout | undefined, seed: string): Exclude<MediaLayout, "auto"> {
  if (layout && layout !== "auto") return layout;
  const f = media[0];
  if (f?.w && f?.h) {
    const r = f.w / f.h;
    if (r >= 1.25) return "wide";
    if (r <= 0.85) return "tall";
    return media.length === 3 ? "even" : "tall";
  }
  let x = 0;
  for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return (["tall", "wide", "even"] as const)[x % 3];
}

export const MAX_MEDIA = 6;
/** Video tải lên trong bản demo chỉ giữ trong phiên, giới hạn để trình duyệt không nặng. */
export const MAX_VIDEO_MB = 50;

const shot = (name: string, alt: string): Media => ({ type: "image", src: `/demo/projects/${name}.svg`, alt });
export const MEDIA = {
  datBanVideo: { type: "video", src: "/demo/projects/dat-ban-thu.mp4", poster: "/demo/projects/dat-ban-thu.jpg", alt: "Quay màn hình chọn bàn bản v3 trên điện thoại" } as Media,
  datBanManHinh: shot("dat-ban-man-hinh", "Giao diện chọn bàn bản v3"),
  datBanWireframe: shot("dat-ban-wireframe", "Khung phương án danh sách giờ trống"),
  nhaPhoMatBang: shot("nha-pho-mat-bang", "Mặt bằng hai phương án giếng trời"),
  nhaPhoMatCat: shot("nha-pho-mat-cat", "Mặt cắt thông gió"),
  nhaPhoBanDem: shot("nha-pho-ban-dem", "Phối cảnh ban đêm"),
  nuocEpMoodboard: shot("nuoc-ep-moodboard", "Moodboard nhãn chai"),
  traMayBaHuong: shot("tra-may-ba-huong", "Ba bảng màu cho bao bì"),
  traMayBaoBi: shot("tra-may-bao-bi", "Bao bì giấy kraft"),
  traMayLogo: shot("tra-may-logo", "Logo Trà Mây"),
};

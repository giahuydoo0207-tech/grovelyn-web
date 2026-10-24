/** Ảnh hoặc video đính kèm bài viết, trao đổi và góp ý. */
export interface Media {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Ảnh đại diện của video. */
  poster?: string;
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

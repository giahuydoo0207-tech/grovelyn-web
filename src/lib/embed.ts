/**
 * Nhận diện link nhúng được vào trang dự án: YouTube, Figma, Google Drive/Docs và file PDF.
 * Chỉ trả về địa chỉ iframe cho đúng các dịch vụ này; link khác hiện như link thường.
 */
export type EmbedProvider = "youtube" | "figma" | "drive" | "pdf";

export interface EmbedInfo {
  provider: EmbedProvider;
  /** Tên dịch vụ để hiện trên thẻ. */
  label: string;
  src: string;
  /** Tỉ lệ khung: video 16:9, bản thiết kế và tài liệu cao hơn. */
  ratio: "video" | "doc";
}

const LABEL: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  figma: "Figma",
  drive: "Google Drive",
  pdf: "PDF",
};

function parse(raw: string): URL | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    // Link nội bộ (/demo/x.pdf) được tính theo một gốc giả để đọc đường dẫn.
    const url = text.startsWith("/") && !text.startsWith("//") ? new URL(text, "https://grovelyn.local") : new URL(text);
    return url.protocol === "https:" || url.hostname === "grovelyn.local" ? url : null;
  } catch {
    return null;
  }
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export function toEmbed(raw: string): EmbedInfo | null {
  const url = parse(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const make = (provider: EmbedProvider, src: string, ratio: EmbedInfo["ratio"]): EmbedInfo => ({ provider, label: LABEL[provider], src, ratio });

  if (host === "youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : /^\/(shorts|embed|live)\/([^/]+)/.exec(url.pathname)?.[2];
    return id && YT_ID.test(id) ? make("youtube", `https://www.youtube-nocookie.com/embed/${id}`, "video") : null;
  }

  if (host === "figma.com" && /^\/(file|design|proto|board)\//.test(url.pathname)) {
    return make("figma", `https://www.figma.com/embed?embed_host=grovelyn&url=${encodeURIComponent(url.href)}`, "doc");
  }

  if (host === "drive.google.com") {
    const id = /^\/file\/d\/([A-Za-z0-9_-]+)/.exec(url.pathname)?.[1];
    return id ? make("drive", `https://drive.google.com/file/d/${id}/preview`, "doc") : null;
  }
  if (host === "docs.google.com") {
    const m = /^\/(document|presentation|spreadsheets)\/d\/([A-Za-z0-9_-]+)/.exec(url.pathname);
    return m ? make("drive", `https://docs.google.com/${m[1]}/d/${m[2]}/preview`, m[1] === "presentation" ? "video" : "doc") : null;
  }

  if (/\.pdf$/i.test(url.pathname)) {
    return make("pdf", url.hostname === "grovelyn.local" ? url.pathname : url.href, "doc");
  }
  return null;
}

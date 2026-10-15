# Grovelyn

Kho dự án và cộng đồng cho mọi ngành nghề. Sinh viên và freelancer lưu trữ, chia sẻ, trưng bày dự án; doanh nghiệp tìm người qua dự án thật.

Đây là bản giao diện: dữ liệu mẫu nằm trong `src/lib/data.ts`, chưa nối backend. Bước sau dùng Supabase (Auth, Postgres, RLS) và Cloudflare R2 cho tệp.

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## Các màn

| Đường dẫn | Màn |
|---|---|
| `/` | Giới thiệu và tham gia (email + mã mời, chọn vai trò) |
| `/explore` | Khám phá dự án, lọc theo ngành, tìm kiếm |
| `/p/[slug]` | Trang dự án: tổng quan, tệp, phiên bản, thảo luận |
| `/community` | Cộng đồng: đăng bài, 7 cảm xúc, bình luận, tìm cộng sự |
| `/u/[handle]` | Hồ sơ: dự án đã ghim, bài đăng, giới thiệu |
| `/new` | Tạo dự án, kéo thả tệp, giới hạn dung lượng |
| `/notifications` | Thông báo |

## Công nghệ

Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion, Lucide. Font Bricolage Grotesque và Be Vietnam Pro được đóng gói sẵn qua Fontsource, không cần tải từ Google Fonts khi build.

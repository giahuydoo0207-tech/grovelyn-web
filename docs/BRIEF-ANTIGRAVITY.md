# BRIEF CHO ANTIGRAVITY: GROVELYN

> Tài liệu bàn giao toàn bộ dự án Grovelyn: sản phẩm là gì, code đang ở đâu, cái gì đã xong, cái gì còn giả lập, quy tắc bắt buộc và việc tiếp theo.
> Viết ngày 28/10/2026, dựa trên lần đọc lại toàn bộ repo `giahuydoo0207-tech/grovelyn-web` ở commit `94343b8`.
> Người duyệt: Đỗ Gia Huy (product owner). **Mọi kế hoạch phải được Huy duyệt trước khi viết code.**

---

## 0. ĐỌC TRƯỚC: 10 ĐIỀU KHÔNG ĐƯỢC SAI

1. **Đây là Next.js 16.4.1, không phải Next.js bạn quen.** Trước khi viết code đụng tới routing, cache, proxy, server action, đọc tài liệu trong `node_modules/next/dist/docs/`. Middleware đã đổi tên thành `src/proxy.ts`. `next.config.ts` bật `cacheComponents` và `partialPrefetching`.
2. **Giao diện tiếng Việt, câu ngắn, rõ, không dùng từ tiếng Anh khi có từ Việt thông dụng.** Tên biến, hàm, type trong code bằng tiếng Anh; chú thích trong code đang viết tiếng Việt, giữ đúng kiểu đó.
3. **Không emoji, không icon trang trí.** Icon chỉ dùng khi có chức năng (nút, nhãn trạng thái), lấy từ `lucide-react`.
4. **Không viền trái màu (colored left border)** để đánh dấu mục đang chọn, ghi chú hay thẻ. Dùng nền, vòng `ring`, hoặc chữ đậm.
5. **Chuyển động (motion) chỉ ở 3 khu: Trang chủ, Trao đổi, Nhắn tin.** Các trang khác không thêm hiệu ứng trang trí.
6. **Chỉ dùng bảng màu có sẵn** (mục 6). Không tự thêm màu mới. Cần màu mới thì hỏi Huy.
7. **Thiết kế trước, code sau.** Khi Huy yêu cầu "thiết kế" hoặc "đưa bản design", chỉ đưa bản thiết kế để duyệt, chưa sửa code.
8. **Không bao giờ commit secret** (`.env*`, service role key, client secret, mật khẩu database). Không chạy `npm audit fix --force`.
9. **Không mở rộng phạm vi.** Làm đúng việc được giao. Thấy chỗ khác cần sửa thì ghi vào báo cáo, không tự sửa.
10. **Trước khi báo xong:** `npm run lint`, `npx tsc --noEmit`, `npm run build` đều phải sạch, và tự mở trang kiểm tra trên cả máy tính lẫn điện thoại (390px).

---

## 1. GROVELYN LÀ GÌ

**Một câu:** Grovelyn là nơi mọi người, ở mọi ngành, lưu trữ và trưng bày dự án thật của mình, nhận góp ý để làm tốt hơn, và gặp người cùng làm.

- **Khẩu hiệu trang đầu:** "Nơi dự án của bạn lớn lên."
- **Ẩn dụ chủ đạo: khu vườn.** Hồ sơ là một luống vườn, dự án là cây lớn dần qua các phiên bản, tương tác trong tuần là lá mọc trên cây. Đây là điểm để Grovelyn khác X, Facebook, LinkedIn. Mọi thiết kế mới nên giữ tinh thần này nhưng không sến, không trang trí thừa.
- **Không chỉ cho dân IT.** Kiến trúc, thiết kế, marketing, kinh doanh, kỹ thuật, truyền thông đều đăng được. Mô hình dự án vì vậy dùng "dạng đầu ra" (bản thiết kế, phần mềm, báo cáo, chiến dịch…) chứ không giả định ai cũng có repo code.
- **Người dùng:** chỉ có một loại tài khoản là "người dùng" (sinh viên hay người đi làm đều như nhau). Không có vai trò Sinh viên / Freelancer / Doanh nghiệp. Trang doanh nghiệp để sau, khi lượng người dùng ổn định.
- **Lộ trình ra mắt:** pilot khoảng 150–200 người, ngôn ngữ chính tiếng Việt. Dự định giới thiệu lần đầu ở cộng đồng Buildstuffs.
- **Lịch sử ngắn:** Grovelyn là bản làm lại của Nova (trước đây là sản phẩm web3 đi thi Uni-Hackfest, đã dừng). Grovelyn **không còn web3**, không blockchain, không USDC, không app điện thoại riêng: chỉ một web app dùng cho mọi người.

**Hai câu hỏi mà mọi màn hình phải trả lời được:**
1. Người này làm ra được gì? (dự án, phiên bản, sản phẩm thật)
2. Người này giúp được ai? (góp ý đã được áp dụng, ghi công)

---

## 2. TÌNH TRẠNG HIỆN TẠI

| Hạng mục | Tình trạng |
|---|---|
| Giao diện | Gần đủ mọi màn: Trang chủ, Sản phẩm, Dự án, Trao đổi, Nhóm, Sự kiện, Tin nhắn, Thông báo, Hồ sơ, Cài đặt, Đã lưu, trang giới thiệu, trang /demo |
| Dữ liệu | **Giả lập.** Dữ liệu mẫu trong `src/lib/*.ts`, thao tác của người dùng lưu ở `localStorage` (và video ở IndexedDB) của trình duyệt |
| Đăng nhập | **Giả lập.** Cookie `grovelyn_session` có giá trị `"1"`, mã 6 số nào cũng qua, ai đăng nhập cũng là tài khoản mẫu `giahuy` |
| Backend | **Chưa có.** Đã có bản thiết kế ERD và System Design cho Supabase (mục 9), đang chờ Huy chốt 4 quyết định |
| Hosting | Vercel, `https://grovelyn-web.vercel.app`, tự deploy khi push lên `main` |
| Repo | `https://github.com/giahuydoo0207-tech/grovelyn-web`, nhánh `main` (có nhánh `backup-truoc-doi-tac-gia`, không đụng) |
| Chất lượng | Lint sạch, TypeScript sạch, build sạch. Lần dò gần nhất: 53 route trên máy tính và điện thoại, không lỗi console, không link hỏng, không tràn ngang |

**Lưu ý: `README.md` đã cũ** (vẫn nhắc "chọn vai trò", Cloudflare R2, thiếu nhiều route). Tin vào brief này và code, không tin README. Cập nhật README chỉ khi được giao.

---

## 3. CÔNG NGHỆ

| Thành phần | Phiên bản, cách dùng |
|---|---|
| Next.js | 16.4.1, App Router, Turbopack, `cacheComponents: true`, `partialPrefetching: true` |
| React | 19.3, **React Compiler lint đang bật** (mục 7) |
| Tailwind CSS | v4, token khai báo bằng `@theme` trong `src/app/globals.css`, không có `tailwind.config` |
| Chuyển động | `motion` (import từ `motion/react`) |
| Icon | `lucide-react` |
| Font | Bricolage Grotesque Variable (tiêu đề, `font-display`), Be Vietnam Pro 400/500/600/700 (chữ thường). Đóng gói qua Fontsource, không gọi Google Fonts |
| Khác | `qrcode` (mã QR chia sẻ) |
| Kiểm thử | Chưa có bộ test tự động trong repo. Việc kiểm tra hiện làm bằng Playwright chạy ngoài repo và kiểm tra tay |

Lệnh:

```powershell
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
npx next start -p 3200   # chạy bản build để kiểm tra
```

---

## 4. CẤU TRÚC THƯ MỤC

```
src/
  proxy.ts                  chặn trang cần đăng nhập (thay cho middleware)
  app/
    layout.tsx              font, Providers
    page.tsx + JoinForm.tsx trang giới thiệu, tham gia, đăng nhập (công khai)
    demo/page.tsx           trang demo công khai, vào thẳng bằng tài khoản mẫu
    auth-actions.ts         signIn, signOut, enterDemo (server actions, đang giả lập)
    globals.css             token màu, bo góc, font, focus
    (app)/                  mọi trang cần đăng nhập
      layout.tsx            NavBar trên, AppRail trái (md trở lên), ChatProvider, ChatDock
      community/            Trang chủ: Feed, PostCard, HomeSide, reactions
      explore/              Sản phẩm: lưới dự án, lọc theo ngành, dạng đầu ra, tìm kiếm ?q=
      p/[slug]/             trang dự án (ProjectStory), LocalProject cho dự án tự tạo
      new/                  tạo dự án (NewProjectForm, 900 dòng)
      exchange/             Trao đổi: bảng chủ đề, [id] chi tiết chủ đề
      groups/               Nhóm: danh sách, [slug] trang nhóm, new tạo nhóm
      events/               Sự kiện: danh sách + lịch, [slug] chi tiết, new tạo sự kiện
      messages/             Tin nhắn: Inbox 3 cột
      notifications/        Thông báo + cây tương tác trong tuần
      saved/                Đã lưu: tab Bài đăng, Dự án
      settings/[section]/   Cài đặt 6 mục, LookEditor (ảnh đại diện, ảnh bìa)
      u/[handle]/           Hồ sơ
  components/               dùng chung (xem mục 5.12)
    chat/                   ChatProvider, ChatParts, ChatDock
    exchange/ project/ motion/
  lib/                      dữ liệu mẫu, kiểu dữ liệu, kho localStorage (xem mục 8)
public/demo/                ảnh, video mẫu (dự án, địa điểm, ảnh chat)
docs/                       tài liệu (brief này)
```

**Tìm nhanh code trên Windows** (PowerShell, đứng ở thư mục repo):

```powershell
Select-String -Path src\**\*.tsx,src\**\*.ts -Pattern "persisted\(|persistedSet\(" | Select-Object Path, LineNumber
Select-String -Path src\**\*.tsx -Pattern "export function PostCard|export function Feed"
Select-String -Path src\**\*.tsx -Pattern "useChat\(\)"
Select-String -Path src\**\*.ts* -Pattern "\bME\b" | Measure-Object   # chỗ còn gắn cứng tài khoản mẫu
```

---

## 5. TỪNG KHU CHỨC NĂNG

### 5.1 Trang giới thiệu `/` và đăng nhập

- Hai cột: bên trái là khẩu hiệu và cây mọc (`GrowingTree`); bên phải là khung trắng `JoinForm` trên nền tối có đường mạch (`CircuitBackdrop`).
- `JoinForm` có 2 chế độ:
  - **Tham gia:** email và mã mời, rồi mã 6 số, rồi tự giới thiệu ngắn và chọn "góc nhìn góp ý".
  - **Đăng nhập:** email, rồi mã 6 số.
- **Đang giả lập:** không gửi email, mã nào đủ 6 số cũng qua, `signIn()` chỉ đặt cookie.
- `proxy.ts`: chưa đăng nhập thì mọi trang trong `(app)` chuyển về `/` kèm `?next=`; đã đăng nhập mà vào `/` thì chuyển sang `/community`. Danh sách trang được bảo vệ phải khớp giữa `src/lib/session.ts` (`PROTECTED`) và `matcher` trong `proxy.ts`.
- `safeNext()` chỉ cho quay về đường dẫn nội bộ thuộc khu cần đăng nhập. **Giữ nguyên nguyên tắc này khi làm đăng nhập thật.**
- `/demo` là trang công khai giới thiệu sản phẩm. Nút "Mở bản demo" gọi `enterDemo` để vào bằng tài khoản mẫu.

### 5.2 Khung chung sau đăng nhập

- **NavBar** (trên cùng): logo, Trao đổi, ô tìm kiếm (Enter thì sang `/explore?q=`), các mục Trang chủ, Sản phẩm, Tạo dự án, Nhắn tin (có số chưa đọc), Thông báo (có số), menu Tôi (`UserMenu`). Trên điện thoại thành thanh tab ở đáy.
- **AppRail** (trái, cố định, rộng `w-24`, từ `md` trở lên): ảnh đại diện, Trang chủ, Đã lưu, Nhóm, Sự kiện, Trao đổi, rồi các nhóm của bạn dạng ô vuông. Nội dung chính lùi `md:pl-24`.
- **ChatDock:** hộp chat nổi góc phải dưới trên mọi trang trừ `/messages`, tối đa 2 cửa sổ (cửa sổ thứ 2 chỉ hiện từ `xl`).

### 5.3 Trang chủ `/community`

- Bảng tin một cột (`Feed`, tối đa 700px) cùng cột phải `HomeSide` (người online, sự kiện sắp tới, chủ đề được nói nhiều). Cột phải đứng yên, tự cuộn riêng, ẩn thanh cuộn. Trên điện thoại cột phải thành dải `HomeStrip`.
- **3 loại bài** (`PostKind`):
  - **Chia sẻ:** bài ngắn không ảnh thành thẻ "quote" chữ lớn nền xanh nhạt.
  - **Công bố:** chỉ cho dự án đã Hoàn tất hoặc đã dùng thực tế (`canAnnounce`); có ảnh thì ảnh tràn đầu thẻ.
  - **Tìm cộng sự:** thẻ đen, khối "Đang cần", nút xin tham gia.
- Tab: Dành cho bạn / Đang theo dõi / Nhóm của bạn. Sắp xếp: Mới nhất / Sôi nổi nhất. Lọc theo loại bài có đếm số.
- **7 cảm xúc** (`reactions.ts`, giữ từ Nova).
- Hàng nút: Thích (giữ để chọn cảm xúc), Bình luận, Đăng lại, Lưu. Menu "…": Chép liên kết, Lưu bài.
- **Bình luận dạng luồng** (`Thread` trong `PostCard`): đường chỉ nối các trả lời, hiện 2 trả lời mới nhất, có "Xem thêm", nhãn Chủ dự án / Người đăng.
- Ô đăng bài nền tối có lá (`Leaves`); đính kèm tối đa 6 ảnh hoặc video (`MAX_MEDIA`), video tối đa 50 MB.

### 5.4 Sản phẩm `/explore`

- Lưới dự án (mẫu cùng dự án bạn tạo), lọc theo ngành (`FIELDS`), dạng đầu ra (`OUTPUTS`), tìm theo `?q=` trong tên, mô tả, ngành, công cụ, thẻ, tên chủ dự án.
- **Thiếu:** ô tìm kiếm trên NavBar ghi "Tìm dự án, người, kỹ năng" nhưng hiện chỉ trả về dự án, chưa có kết quả người.

### 5.5 Dự án `/p/[slug]` và tạo dự án `/new`

**Mô hình dự án** (`src/lib/model.ts`): 4 trường độc lập.

| Trường | Giá trị |
|---|---|
| `field` (lĩnh vực) | 7 ngành |
| `output` (dạng đầu ra) | 8 dạng |
| `context` (bối cảnh) | 5 bối cảnh, kèm `contextNote` tự do |
| Mẫu trình bày | `visual` / `case` / `report`, tự gợi ý theo dạng đầu ra |

- **Tiến độ** `phase`: `concept | draft | final | paused`. Câu hiển thị đổi theo dạng đầu ra (`levelHint`).
- **Tình hình áp dụng** `usage`: Chưa triển khai / Đang dùng thử / Đã dùng thực tế (không bắt buộc).
- **Trang dự án** (`ProjectStory`) kể "theo chương":
  - Mục lục trái, câu chuyện giữa, tài nguyên và thông tin bên phải.
  - Có ảnh, ảnh trước và sau, nhúng YouTube / Figma / Google Drive / PDF (`lib/embed.ts`), các phiên bản (`Journey`), bình luận cuối trang.
  - Tab Trao đổi của dự án (`ProjectExchange`).
- **Bìa dự án** dạng thư mục (`FolderCover`); dùng được ảnh, có khung căn chỉnh.
- **Tạo dự án** (`NewProjectForm`) gồm 3 phần: Đây là gì / Nội dung / Bạn làm gì. Bản nháp tự lưu (`project-draft`). Dung lượng mỗi dự án 100 MB (`QUOTA_MB`).

### 5.6 Trao đổi `/exchange`

**Nhấn mạnh:** Trao đổi **khác** bình luận.

| | Trao đổi | Bình luận |
|---|---|---|
| Ai mở | Chủ dự án hoặc thành viên | Bất kỳ ai |
| Mục đích | Hỏi một câu cụ thể, trên một phiên bản cụ thể | Nhận xét tự do về bản đã công bố |
| Thời hạn | Có, 14 ngày | Không |
| Kết quả | Góp ý được áp dụng và ghi công | Không |

- 2 hình thức: Xin góp ý, Nhờ dùng thử. Chọn tối đa 2 góc nhìn (`LENSES`). Có thể mời người ngoài ngành (`outsider`).
- **Giới hạn:** tối đa 2 trao đổi mở cùng lúc mỗi dự án (`MAX_OPEN_TOPICS`), tự đóng sau 14 ngày (`TOPIC_DAYS`), người phụ trách mở lại được. Lý do đóng: Đã giải quyết / Tạm dừng / Hết hạn.
- **Góp ý** (`Reply`):
  - Kèm ảnh, video; trả lời một cấp (`answers`).
  - Chủ dự án đánh dấu "Đã áp dụng vào bản…" (`applied`).
  - Người góp đồng ý ghi tên (`credit`, rút lại được). Góp ý được áp dụng và ghi tên hiện ở tab Đóng góp trên hồ sơ của người góp.
- Một bản ghi chung (`lib/topicStore.ts`) cho tab Trao đổi, trang chi tiết và trang dự án.

### 5.7 Nhóm `/groups`

- Công khai hoặc Riêng tư (riêng tư phải xin vào). Quyền nhóm (`GroupPerms`): mời, duyệt bài, gắn dự án, tạo sự kiện.
- Tab trong nhóm: Thảo luận / Dự án của nhóm / Tìm cộng sự / Sự kiện / Thành viên / Ảnh và file.
- Bài trong nhóm dùng chung `Feed` với `group`; trong nhóm không có loại Công bố.
- Tạo nhóm (`GroupForm`): ảnh bìa có cắt khung, luật nhóm, ngành.

### 5.8 Sự kiện `/events`

- Danh sách gồm sự kiện nổi bật, bộ lọc (Sắp diễn ra / Tuần này / Trực tuyến / Tại chỗ / Bạn quan tâm), lưới thẻ và lịch tháng.
- Trang chi tiết: ảnh bìa, ô ngày, nội dung cạnh khung đăng ký, diễn giả (tab), lịch trình, địa điểm (ảnh, nút chép địa chỉ).
- Đăng ký (`RegisterForm`): luôn hỏi họ tên, email, điện thoại; câu hỏi thêm và duyệt bật theo `asks`. Đăng ký xong có nút thêm vào lịch (tải `.ics`, `lib/ics.ts`).
- Tạo sự kiện (`EventForm`, 767 dòng): điền theo đúng thứ tự trang chi tiết hiện ra, có xem trước.
- **Gắn cứng:** `TODAY = "2026-10-15"` trong `lib/events.ts` để nhãn "Sắp diễn ra" ổn định. Khi có backend phải đổi sang ngày thật.

### 5.9 Tin nhắn `/messages` (vừa làm lại, theo bản thiết kế D1 và D2 đã duyệt)

- **3 cột:**
  - **Danh sách (nền `mist`):** chia "Đã ghim" và "Gần đây"; bộ lọc dạng thanh chia (Tất cả / Cá nhân / Nhóm / Chưa đọc); cuộc đang mở có nền trắng và `ring-leaf`.
  - **Khung chat:** đầu khung (tắt báo, nút mở cột thông tin); **dải tin ghim** (màu `pin`; bấm để nhảy tới tin, bấm tiếp để lùi về tin ghim trước); danh sách tin; ô soạn tin nổi.
  - **Cột thông tin:** màn rộng (`xl`) mở sẵn; màn hẹp hơn trượt đè lên khung chat.
- **Thao tác trên tin:** rê chuột (điện thoại: chạm) hiện thanh Trả lời / Thả tim / Ghim / Chép. Tin trả lời có trích dẫn, bấm trích dẫn để nhảy tới tin gốc.
- **Gửi ảnh:**
  - Tối đa 10 ảnh mỗi lần (`MAX_IMAGES`); chọn, dán hoặc kéo thả.
  - Ảnh chờ gửi hiện thành hình nhỏ, có nút ×.
  - Trong chat, ảnh hiện thành cụm: 1 ảnh lớn / 2 ảnh cạnh nhau / 1 lớn và 2 nhỏ, ô cuối ghi "+N".
  - Bấm ảnh mở `Lightbox`, chuyển ảnh bằng phím mũi tên, Esc để đóng.
- **Lệnh gõ "/":** `/anh`, `/tep`, `/duan`, `/ghim`. Enter để gửi, Shift+Enter để xuống dòng.
- **Cột thông tin:**
  - Chat riêng: nhân vật của người kia, nút Hồ sơ / Tắt báo / Ghim chat, tin đã ghim, ảnh và tệp, dự án chung, sự kiện sắp tới.
  - Chat nhóm: dự án kèm dải phiên bản, thành viên kèm trạng thái, tin ghim, ảnh, tệp đã gửi.
- **Dữ liệu và code:**
  - Kho `conversations-v2`.
  - `ChatProvider`: `send`, `toggleHeart`, `togglePin`, `togglePinConv`, `toggleMute`, `markRead`, `startDirect`, cửa sổ dock.
  - `ChatParts`: `MessageList`, `Composer`, `Album`, `Lightbox`, `PinnedBar`, `jumpTo`.
  - `ChatDock` dùng chung các phần trên ở dạng `compact`.
- **Cố ý không có:** ghi âm, emoji picker, gọi điện, lệnh `/hop`.

### 5.10 Thông báo `/notifications`

- Bên trái là hồ sơ và cài đặt, giữa là danh sách (lọc theo loại, nhóm theo Hôm nay / Tuần này / Trước đó, đánh dấu đã đọc), bên phải là `WeekGarden`: cây tuần này, mỗi lượt tương tác là một chiếc lá.

### 5.11 Hồ sơ `/u/[handle]` và Cài đặt `/settings/[section]`

- **Hồ sơ:**
  - **Ảnh bìa:** mặc định là "luống vườn" riêng cho từng người; dùng ảnh thật được, tỉ lệ 3:1, bấm vào xem ảnh gốc.
  - **Ảnh đại diện:** 112px, kèm nhãn trạng thái cạnh tên.
  - **Tab:** Dự án (mặc định) / Đóng góp / Bài đăng / Giới thiệu.
  - **Cột phải:** đang làm gì, góp ý được về gì, kỹ năng, liên kết.
- **Ảnh đại diện có 3 chế độ** (`lib/look.ts`): nhân vật tự phối (mặc định, bảo vệ quyền riêng tư), ảnh thật, chữ cái đầu.
  - **Nhân vật** (`lib/character.ts`, `lib/characterSvg.ts`):
    - Kiểu Cartoon (nét mực, đổ bóng, cười nhe răng) hoặc Pixel 16×16.
    - Tùy chỉnh: 6 kiểu tóc, 5 trang phục, màu da / tóc / áo / nền.
    - Phụ kiện tối đa 2: Kính, Kính râm, Mũ lưỡi trai, Mũ len, Tai nghe, Khuyên tai (hai loại kính, hai loại mũ không đeo cùng lúc).
    - 6 cảm xúc: Cười nhe răng, Mỉm cười, Nháy mắt, Ngạc nhiên, Tự tin, Suy nghĩ.
  - **Trạng thái:** Đang làm việc / Đang học / Nghỉ giải lao / Tìm cộng sự / Sẵn sàng nhận việc. Có thể tự tắt sau 1 giờ / 4 giờ / hết hôm nay. Từ 96px trở lên, nhân vật cầm đồ vật theo trạng thái.
  - **Bộ phối đã lưu:** tối đa 6 (`MAX_OUTFITS`), bấm một lần là đổi.
  - SVG dựng bằng chuỗi rồi gắn bằng `dangerouslySetInnerHTML`, `useId` cho clipPath. Ảnh nhỏ (48px trở xuống) dùng khung cắt `close`.
- **Cài đặt** có 6 mục: Tài khoản (gồm thẻ Ảnh đại diện `#anh-dai-dien`, Ảnh bìa `#anh-bia`), Đăng nhập và bảo mật, Hiển thị hồ sơ, Quyền riêng tư dữ liệu (có nút "Xoá dữ liệu" để xoá toàn bộ bản dùng thử), Thông báo, Trợ giúp.

### 5.12 Component dùng chung đáng biết

| Component | Việc |
|---|---|
| `Avatar` | Truyền `handle` thì tự dùng `PersonAvatar` (nhân vật, ảnh, chữ cái). **Luôn truyền `handle` khi là người** |
| `PersonAvatar` | Vẽ theo `useLook(handle)`, có huy hiệu trạng thái (từ 28px), viền xanh khi "Sẵn sàng nhận việc" |
| `MediaGrid` | Lưới ảnh, video trong bài, có `bleed` để tràn mép thẻ |
| `ImageCropper` | Cắt ảnh theo tỉ lệ (ảnh đại diện 1:1, ảnh bìa 3:1) |
| `ProjectCard`, `ProjectCover`, `project/FolderCover` | Thẻ và bìa dự án |
| `GardenCover`, `Leaves`, `GrowingTree` | Hình khu vườn (seed cố định theo người) |
| `LikeButton`, `exchange/Modal`, `exchange/Dialogs` | Nút thích, hộp thoại |

---

## 6. HỆ THỐNG THIẾT KẾ (BẮT BUỘC DÙNG ĐÚNG)

**Màu** (`src/app/globals.css`, dùng qua class Tailwind như `bg-ink`, `text-leaf-deep`):

| Token | Mã | Dùng cho |
|---|---|---|
| `ink` | #06110a | Đen ngả xanh rừng: khối nhấn, nút tối, tin nhắn của mình |
| `ink-2`, `ink-line` | #12201a, #213328 | Nền tối phụ, đường kẻ trên nền tối |
| `paper` | #ffffff | Nền chính |
| `mist` | #f2f5ef | Nền xám lá: nền trang trong app, cột danh sách tin nhắn |
| `line` | #e2e7de | Đường viền |
| `leaf` | #5bd13a | **Chỉ** làm nền nút chính và điểm nhấn (chữ đen trên lá) |
| `leaf-deep` | #1d6b1d | Chữ, link xanh trên nền trắng (đạt tương phản 4.5:1) |
| `sap` | #dcf6cf | Nền xanh nhạt: nhãn, trạng thái được chọn |
| `moss`, `fog` | #56614f, #a8b5a6 | Chữ phụ; chữ phụ trên nền tối |
| `pin`, `pin-ink` | #e2f5ec, #0f7a55 | **Chỉ cho tin ghim trong chat** (xanh ngả ngọc, khác các màu lá) |

**Bảng màu khu vườn** (`lib/palette.ts`, gồm leaf, sun, clay, sky, lilac, rose, moss) chỉ dùng cho điểm nhấn nhỏ: màu theo ngành (`fieldColor`) và theo góc nhìn (`lensColor`). Không dùng làm nền lớn.

**Bo góc 4 cấp** (càng vào trong càng nhỏ): `rounded-lg` 6px, `rounded-xl` 8px (nút, ô nhập), `rounded-2xl` 12px (thẻ), `rounded-3xl` 16px (khối lớn). Nút dạng viên thuốc và ảnh đại diện dùng `rounded-full`. Code mới có thêm vài bo góc tuỳ chỉnh (`rounded-[18px]` cho bong bóng chat), chỉ dùng khi có lý do.

**Chữ:** tiêu đề dùng `font-display` với `tracking` âm nhẹ. Cỡ chữ đọc trong tin nhắn và bình luận là **17px** (đã tăng theo yêu cầu của Huy); khung chat nhỏ ở góc là 15px.

**Focus:** viền `leaf-deep` 2px đã đặt sẵn trong `@layer base`; ô nhập trong khung có viền riêng thì bỏ viền thứ hai. **Không xoá focus.**

**Responsive:** mọi màn phải dùng được ở 390px. Không để tràn ngang. Trên điện thoại, thanh tab đáy cao `4rem`, nhớ chừa chỗ (`bottom-[calc(4rem+env(safe-area-inset-bottom))]`).

**Khả năng truy cập:** mọi nút chỉ có icon phải có `aria-label`. Danh sách tin dùng `role="log"`. Hộp thoại dùng `role="dialog"` và `aria-modal`. Có link "Bỏ qua để tới nội dung".

---

## 7. QUY ƯỚC CODE

- **Server và Client:** `page.tsx` là Server Component; phần tương tác tách thành file `"use client"` riêng (ví dụ `Feed.tsx`, `Inbox.tsx`). Trang động của dữ liệu mẫu dùng `generateStaticParams`; dữ liệu người dùng tự tạo đọc từ trình duyệt qua `Local*.tsx` (`LocalProject`, `LocalGroup`, `LocalEvent`).
- **Kho dữ liệu trình duyệt:**
  - `persisted(key, initial)` dùng `useSyncExternalStore` và `localStorage`, tiền tố `grovelyn:v1:`. Server luôn trả dữ liệu mẫu, trình duyệt đọc bản đã lưu sau khi hydrate.
  - `persistedSet` thêm `has`, `toggle`, `add`.
  - Khi đổi cấu trúc một kho thì **đổi key** (ví dụ `conversations` thành `conversations-v2`) để bản lưu cũ không làm hỏng trang.
- **React Compiler lint:**
  - Không gán giá trị vào ref trong lúc render.
  - Không gọi `setState` đồng bộ trong `useEffect` chỉ để đồng bộ state; muốn đặt lại state khi prop đổi thì dùng mẫu "lưu prop trước đó trong state" (xem `Composer`: `lastConv`).
  - Form đơn giản dùng `FormData` cùng `form.reset()` thay vì ref.
- **Ảnh:**
  - Ảnh người dùng chọn được nén bằng `compressImage` (tối đa 1280–1600px, JPEG) rồi lưu dạng data URL.
  - Video lưu ở IndexedDB, bài chỉ giữ mã `idb:<id>`.
  - Ảnh động hoặc data URL dùng thẻ `<img>` kèm `eslint-disable-next-line @next/next/no-img-element`.
- **Chuỗi tiếng Việt có dấu:** tìm kiếm phải bỏ dấu (`fold` trong `lib/chat.ts`, `norm` trong Explore). Tạo slug bằng `slugify` trong `lib/slug.ts`.
- **Tài khoản đang dùng:** hằng `ME = "giahuy"` (92 chỗ). Khi nối backend, đây là chỗ phải thay bằng người dùng thật từ phiên đăng nhập.
- **Commit:**
  - Tác giả `Đỗ Gia Huy <giahuydoo.0207@gmail.com>`.
  - Thông điệp tiếng Việt, ngắn, nói việc đã làm.
  - Push lên `main`, Vercel tự deploy.

---

## 8. KHO DỮ LIỆU TRÌNH DUYỆT HIỆN CÓ

Mỗi kho dưới đây sẽ thành một hoặc vài bảng Supabase. **Khi chuyển một khu sang backend, xoá đúng kho đó, không để hai nguồn dữ liệu song song cho cùng một thứ.**

| Key | File | Nội dung | Thành bảng |
|---|---|---|---|
| `posts` | `lib/stores.ts` | Bài đăng kèm bình luận | `posts`, `post_media`, `post_comments` |
| `reactions` | `lib/stores.ts` | Cảm xúc bạn bấm | `post_reactions` |
| `saved-posts`, `reposted-posts`, `join-requests` | `lib/stores.ts` | Lưu, đăng lại, xin tham gia | `saved_posts`, `post_reposts`, `join_requests` |
| `projects`, `project-draft` | `lib/stores.ts`, `NewProjectForm` | Dự án tự tạo, bản nháp | `projects` và các bảng con |
| `liked-projects`, `saved-projects` | `lib/stores.ts` | Thích, lưu dự án | `project_likes`, `saved_projects` |
| `following` | `lib/stores.ts` | Đang theo dõi | `follows` |
| `topics` | `lib/topicStore.ts` | Trao đổi, góp ý | `topics`, `topic_replies`, `reply_answers` |
| `groups`, `joined-groups`, `asked-groups`, `left-groups` | `lib/stores.ts` | Nhóm | `groups`, `group_members` |
| `events`, `interested-events`, `registered-events` | `lib/stores.ts` | Sự kiện | `events`, `event_interests`, `event_registrations` |
| `conversations-v2`, `muted` | `ChatProvider` | Tin nhắn | `conversations`, `conversation_members`, `messages` |
| `read-notices` | `lib/stores.ts` | Thông báo đã đọc | `notifications.read_at` |
| `look` | `lib/look.ts` | Ảnh đại diện, ảnh bìa, trạng thái, bộ phối | `profile_looks`, `saved_outfits` |
| `prefs` | `lib/stores.ts` | Tên, giới thiệu, nơi sống, cài đặt | `profiles`, `user_settings` |

---

## 9. BACKEND: KẾ HOẠCH ĐÃ VẼ, CHƯA ĐƯỢC LÀM

Bản thiết kế đầy đủ (ERD 40 bảng trong 6 khu, sơ đồ kiến trúc, luồng đăng nhập, bảng RLS, kho tệp, lộ trình) đã được Huy xem dưới dạng trang "ERD và System Design". Tóm tắt các điểm đã chốt hướng:

**Kiến trúc:** Next.js 16 trên Vercel. Supabase vùng Singapore gồm Auth (Google), Postgres có RLS ở mọi bảng, Storage, Realtime, trigger và `pg_cron`. Trình duyệt chỉ dùng **publishable key**; quyền do RLS quyết định. **Secret key không bao giờ nằm ở trình duyệt, không nằm trong repo.**

**Đăng nhập:**
- Google OAuth qua Supabase, dùng `@supabase/ssr`.
- `proxy.ts` làm mới phiên mỗi lần mở trang. Route `/auth/callback` đổi mã lấy phiên.
- Trigger trên `auth.users` tạo sẵn `profiles`, `profile_looks` (nhân vật mặc định), `user_settings`.
- Trong giai đoạn thử, chỉ Gmail có trong danh sách Test users của Google Cloud mới vào được.
- **Không dùng Firebase.** Supabase đã có đăng nhập Google; thêm Firebase sẽ thành hai hệ tài khoản.

**Kho tệp (Storage):**

| Kho | Truy cập | Giới hạn mỗi tệp |
|---|---|---|
| `avatars` | Công khai | 2 MB |
| `covers` | Công khai | 5 MB |
| `post-media` | Công khai | Ảnh 5 MB, video 50 MB |
| `project-files` | Riêng, link có hạn | 50 MB |
| `message-files` | Riêng, link có hạn | 20 MB |

**Realtime:** tin nhắn mới theo cuộc trò chuyện; ai online và ai đang gõ (dùng Presence, không ghi bảng); thông báo mới; bình luận mới dưới bài đang mở.

**Trigger và lịch:** tạo hồ sơ khi có tài khoản mới; đếm thích, bình luận, đăng lại, người theo dõi; tạo thông báo. `pg_cron` đóng trao đổi quá 14 ngày (mỗi giờ) và tắt trạng thái quá giờ (mỗi 10 phút).

**Ràng buộc phải có ở database, không chỉ ở giao diện:** tối đa 2 trao đổi mở mỗi dự án, 6 bộ phối, 6 tệp mỗi bài, 10 ảnh mỗi tin nhắn, 2 phụ kiện nhân vật.

**Lộ trình 5 đợt** (xong đợt nào deploy đợt đó; phần chưa chuyển vẫn chạy bằng `localStorage`, web không lúc nào gãy):
1. **Đăng nhập và hồ sơ:** Google OAuth, trang "Chào bạn" (chọn @handle), hồ sơ, nhân vật, ảnh bìa, trạng thái, bộ phối, cài đặt, theo dõi.
2. **Bảng tin:** bài, ảnh, video, bình luận luồng, cảm xúc, đăng lại, lưu, xin tham gia.
3. **Dự án và Trao đổi:** tạo dự án, phiên bản, tài nguyên, thích, lưu, trao đổi, góp ý, ghi công.
4. **Nhóm và sự kiện.**
5. **Tin nhắn và thông báo** (realtime).

**Phải cập nhật ERD khu Tin nhắn trước đợt 5** (bản vẽ cũ có trước lần làm lại tin nhắn):
- `messages.reply_to_id` (tự tham chiếu), `messages.pinned_at`, `messages.pinned_by`.
- Bảng `message_images (message_id, storage_path, sort)` thay cho một cột `image_path`, tối đa 10.
- `conversation_members.pinned`, `conversation_members.muted`, `conversation_members.last_read_at`; số chưa đọc tính từ `last_read_at`, không lưu cột riêng.
- `message_hearts (message_id, profile_id)`.
- `conversations.project_id` (nhóm chat gắn dự án), `conversations.event_id` nếu giữ mục "Sắp tới".

### 4 QUYẾT ĐỊNH ĐANG CHỜ HUY CHỐT (không tự quyết)

| # | Câu hỏi | Đề xuất |
|---|---|---|
| 1 | Giữ dữ liệu mẫu (Thu Hà, Quốc Bảo…) không? | Giữ dưới dạng tài khoản mẫu trong database, gắn nhãn "Tài khoản mẫu" |
| 2 | Người chưa đăng nhập xem được gì? | Chỉ trang giới thiệu và `/demo` |
| 3 | Chọn @handle lúc nào? | Ở trang "Chào bạn" lần đầu, gợi ý từ Gmail, đổi tối đa 1 lần mỗi 30 ngày |
| 4 | Video tối đa bao nhiêu? | 50 MB; ảnh luôn nén trước khi tải lên |

**Việc Huy làm thủ công (Antigravity không làm thay, không xin secret):**
1. Tạo project Supabase (vùng Singapore); lấy Project URL và Publishable key.
2. Lấy Callback URL của Google provider.
3. Đặt Site URL `https://grovelyn-web.vercel.app` và Redirect `https://grovelyn-web.vercel.app/**`.
4. Trong Google Cloud: Branding; Audience External / Testing kèm Test users; tạo Web client với origin và redirect URI ở trên.
5. Dán Client ID và Client Secret vào Supabase.
6. Thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vào Vercel và `.env.local`.

---

## 10. VẤN ĐỀ VÀ NỢ KỸ THUẬT ĐÃ BIẾT

| # | Vấn đề | Mức | Ghi chú |
|---|---|---|---|
| 1 | Đăng nhập giả: cookie `"1"`, ai cũng là `giahuy` | Cao | Giải quyết ở đợt 1 backend |
| 2 | `localStorage` giới hạn khoảng 5 MB; ảnh chat và bài đăng lưu dạng data URL nên gửi nhiều ảnh có thể đầy kho, khi đó lưu thất bại trong im lặng | Trung bình | Chấp nhận trong bản thử; hết khi chuyển sang Storage |
| 3 | `TODAY` gắn cứng `2026-10-15` | Trung bình | Đổi sang ngày thật khi có dữ liệu thật |
| 4 | `ONLINE` là danh sách cứng | Thấp | Thay bằng Realtime Presence ở đợt 5 |
| 5 | Ô tìm kiếm hứa "người, kỹ năng" nhưng chỉ tìm dự án | Thấp | Cần quyết định: thêm kết quả người, hoặc đổi chữ gợi ý |
| 6 | `README.md` lỗi thời | Thấp | Cập nhật khi được giao |
| 7 | Chú thích trong `JoinForm` còn nói "chọn vai trò" dù vai trò đã bỏ | Thấp | Chỉ là chú thích |
| 8 | Chưa có bộ test tự động trong repo | Trung bình | Nên thêm Playwright cho luồng chính khi bắt đầu backend |
| 9 | Bản lưu cũ ở trình duyệt người dùng (`conversations`) không còn dùng sau khi đổi sang `conversations-v2` | Thấp | Không ảnh hưởng chức năng |

---

## 11. CÁCH LÀM VIỆC VỚI HUY

1. **Nhận việc, rồi đọc code liên quan.** Dùng `Select-String` (mục 4) để định vị file, không đoán.
2. **Gửi kế hoạch trước** gồm: file sẽ sửa, thay đổi dữ liệu (nếu có), bố cục (ASCII mockup nếu là giao diện), câu chữ chính xác của mọi nhãn, nút, thông báo lỗi, và những gì **không** làm. Chờ Huy duyệt.
3. **Làm đúng phạm vi đã duyệt.** Gặp chỗ mơ hồ thì hỏi, không tự chọn hướng lớn.
4. **Tự kiểm tra** (mục 12) rồi mới báo.
5. **Báo cáo ngắn:** đã làm gì, ở file nào, đã kiểm tra thế nào, còn gì chưa làm hoặc phát hiện thêm.

**Câu chữ giao diện:**
- Giọng thân thiện, xưng "bạn", câu ngắn.
- Nút là động từ: "Lưu ảnh đại diện", "Gửi góp ý", không phải "OK", "Submit".
- Lỗi nói cách sửa: "Nhập email đúng dạng, ví dụ ban@email.com."
- Không hứa điều web chưa làm được (ví dụ không viết "đã gửi email" khi chưa gửi thật).

---

## 12. KIỂM TRA TRƯỚC KHI BÁO XONG

```powershell
npm run lint
npx tsc --noEmit
npm run build
npx next start -p 3200
```

Kiểm tra tay trên `http://localhost:3200` (đăng nhập bằng mã 6 số bất kỳ):

- [ ] Trang vừa sửa mở được trên máy tính (1440px) và điện thoại (390px), không tràn ngang.
- [ ] Console trình duyệt không có lỗi đỏ.
- [ ] Tải lại trang: dữ liệu vừa thao tác vẫn còn (khi còn dùng `localStorage`).
- [ ] Bàn phím: Tab tới được mọi nút, thấy viền focus; Esc đóng hộp thoại.
- [ ] Không có emoji, icon trang trí, viền trái màu, màu ngoài bảng màu.
- [ ] Không thêm hiệu ứng chuyển động ngoài Trang chủ, Trao đổi, Nhắn tin.
- [ ] Mọi câu chữ mới là tiếng Việt có dấu, câu ngắn.
- [ ] Sau khi push, chờ Vercel báo deploy xong, mở `https://grovelyn-web.vercel.app` kiểm tra lại đúng trang đó.

**Khi làm backend thêm:**

- [ ] RLS bật ở mọi bảng mới; thử đọc và ghi bằng tài khoản không có quyền đều bị chặn.
- [ ] Hai tài khoản Gmail thật thấy dữ liệu của nhau đúng theo quyền.
- [ ] Không secret nào xuất hiện trong `git diff`, trong code client, hay trong log build.

---

## 13. ĐỊNH NGHĨA "XONG" CHO MỌI VIỆC

- [ ] Đúng phạm vi Huy đã duyệt, không hơn không kém.
- [ ] Lint, TypeScript, build đều sạch.
- [ ] Đã kiểm tra tay theo mục 12 trên máy tính và điện thoại.
- [ ] Không vi phạm 10 điều ở mục 0.
- [ ] Commit đúng tác giả, thông điệp tiếng Việt, đã push, Vercel deploy thành công.
- [ ] Báo cáo cho Huy: đã làm gì, kiểm tra thế nào, còn gì để ngỏ.

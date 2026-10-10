# Việt Phục Remix

**Khám phá văn hóa Việt, thử phối trang phục truyền thống và tạo ảnh minh họa bằng AI.**

Việt Phục Remix là ứng dụng web phối trang phục truyền thống Việt Nam theo phong cách Gen Z, được xây dựng cho bài dự thi AI Arena. Dự án kết hợp kiến thức văn hóa, quy tắc phối màu và AI để giúp người dùng khám phá những cách phối mới với áo dài, áo tứ thân và áo bà ba.

[Repository GitHub](https://github.com/phungdat24/Viet-phuc-remix) · [Demo đã dùng của nhóm](https://viet-phuc-remix-404.vercel.app/)

Demo trên là địa chỉ đã được nhóm sử dụng; cần kiểm tra lại trước khi nộp. Video giới thiệu chưa được cung cấp trong tài liệu hiện có, nhóm cần bổ sung đường dẫn video chính thức.

> Ảnh AI là hình ảnh minh họa, có thể sai chi tiết trang phục, màu sắc hoặc phụ kiện. Nội dung văn hóa có nguồn tham khảo và trạng thái kiểm chứng; không xem ảnh sinh ra là tư liệu lịch sử.

## Tính năng

- **Thử phối đồ:** chọn trang phục, màu chính, màu phụ, nhiều phụ kiện và dịp sử dụng.
- **Gợi ý văn hóa:** hiển thị cảnh báo theo lựa chọn hiện tại, dựa trên quy tắc của trang phục, phụ kiện và dịp sử dụng.
- **Chặn phụ kiện xung đột:** không cho chọn đồng thời nón và khăn đội đầu thuộc các nhóm xung đột.
- **Dịp mặc định:** khi chưa chọn dịp, dùng Tết để sinh ảnh nếu có trong danh mục, hoặc dùng dịp đầu tiên. Việc thẩm định văn hóa chỉ dùng dịp do người dùng chủ động chọn.
- **Đánh giá màu sắc:** phân loại màu tương đồng, bổ túc, trung tính hoặc lệch tông dựa trên góc Hue.
- **Tạo ảnh AI:** tạo ảnh minh họa toàn thân và nhận xét ngắn bằng tiếng Việt. Giao diện ẩn nhận xét AI khi bộ phối có cảnh báo văn hóa hoặc món chưa kiểm chứng.
- **Chia sẻ và tải ảnh:** sao chép link chứa lựa chọn bộ phối, tải ảnh về máy; nếu không tải trực tiếp được thì mở ảnh ở tab mới để lưu.
- **Tái sử dụng tổ hợp:** dùng `comboKey` để tra cứu kết quả đã có, hạn chế gọi lại AI tạo ảnh.
- **Lookbook cá nhân:** lưu bộ phối, đánh dấu yêu thích và quản lý bộ sưu tập trong trình duyệt.
- **Thư viện văn hóa:** tìm hiểu trang phục, phụ kiện, nguồn tham khảo và các nội dung chưa kiểm chứng.
- **Gợi ý theo thời tiết:** lấy thời tiết qua Open-Meteo để hỗ trợ lựa chọn trang phục.
- **Quản trị:** xem danh sách tổ hợp, duyệt hoặc từ chối ảnh tại `/admin`.
- **Nạp ảnh thủ công:** đưa ảnh đã chuẩn bị lên Supabase Storage và liên kết với tổ hợp trong cơ sở dữ liệu.

## Công nghệ

Các phiên bản dưới đây được khai báo trong `package.json`; `package-lock.json` khóa các phiên bản cài đặt cụ thể.

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Next.js 16.3.6, App Router |
| Giao diện | React 19.2.8, TypeScript 5, Tailwind CSS 4 |
| API | Next.js Route Handlers |
| Cơ sở dữ liệu | PostgreSQL, Prisma 6.19.3 |
| Lưu trữ ảnh | Supabase Storage, `@supabase/supabase-js` |
| Xử lý ảnh | Sharp: nén WebP, cạnh dài tối đa 1600 px |
| Sinh ảnh | Cloudflare Workers AI — `@cf/black-forest-labs/flux-1-schnell` |
| Sinh nhận xét | Cloudflare Workers AI — `@cf/meta/llama-3.1-8b-instruct` |
| Thời tiết | Open-Meteo |
| Lookbook | `localStorage` trên trình duyệt |

### Vai trò của Gemini / Google AI Studio

Tài liệu [D1](docs/AI/d1-ket-qua-test.md) ghi nhận nhóm đã thử nghiệm prompt tạo ảnh trong **Google AI Studio**, với model được báo cáo là **Nano Banana Pro — `gemini-3-pro-image`**. Prompt, các lượt thử và ảnh minh chứng nằm trong `docs/AI/`.

Luồng tạo ảnh trực tiếp trên web hiện gọi **Cloudflare Workers AI**, được triển khai tại `lib/aiSinhAnh.ts`. Các câu đánh giá màu trong `DanhGiaMauSac` được nạp từ chuỗi có sẵn trong `prisma/seed.ts`; mã nguồn không chứng minh nguồn tạo các câu này là Gemini. Một số chú thích cũ nhắc Gemini chưa khớp với lời gọi API hiện tại.

Script `nap-anh` có thể nạp ảnh đã tạo bên ngoài, nhưng không tự xác nhận ảnh đó do Gemini tạo. Nhóm cần ghi nguồn cho bộ ảnh demo và xác nhận với ban tổ chức việc sử dụng Gemini ở giai đoạn thử nghiệm hoặc tạo ảnh thủ công có đáp ứng yêu cầu cuộc thi hay không; README không khẳng định thay cho quyết định của ban tổ chức.

## Luồng tạo ảnh và duyệt

1. Người dùng chọn tổ hợp trang phục, màu, phụ kiện và sự kiện.
2. Ứng dụng cung cấp đánh giá theo quy tắc văn hóa và màu sắc.
3. Khi tạo ảnh, API chuẩn hóa tổ hợp thành `comboKey` rồi tra cứu cơ sở dữ liệu.
4. Nếu đã có kết quả, API trả lại bản ghi cũ; có thể gọi AI bổ sung nhận xét nếu còn thiếu.
5. Nếu cần ảnh mới, Cloudflare tạo ảnh và nhận xét. Ảnh được nén WebP, tải lên Supabase Storage; đường dẫn và thông tin tổ hợp được lưu qua Prisma với trạng thái `draft`.
6. Quản trị viên kiểm tra thủ công rồi chuyển tổ hợp sang `approved` hoặc `rejected`.

| Trạng thái | Ý nghĩa |
| --- | --- |
| `draft` | Chờ quản trị viên duyệt |
| `approved` | Đã được duyệt |
| `rejected` | Đã bị từ chối |

Yêu cầu `sinhLai: true` chỉ tạo lại ảnh cho tổ hợp chưa được duyệt. Tổ hợp `approved` được trả lại nguyên trạng. Lỗi sinh nhận xét không nhất thiết làm mất kết quả sinh ảnh.

## Cài đặt và chạy trên máy

### 1. Chuẩn bị

- Node.js **20.9 trở lên**, theo yêu cầu trong lockfile của Next.js và Sharp.
- npm và Git.
- PostgreSQL có thể kết nối từ máy chạy ứng dụng.
- Supabase project và bucket công khai để lưu ảnh.
- Cloudflare Account ID và API Token có quyền sử dụng Workers AI.

### 2. Lấy mã nguồn

```bash
git clone https://github.com/phungdat24/Viet-phuc-remix.git
cd Viet-phuc-remix
```

Nếu dùng bản ZIP, giải nén rồi mở terminal trong thư mục chứa `package.json`.

### 3. Tạo file `.env`

Tạo `.env` ở thư mục gốc dự án, cùng cấp `package.json`:

```dotenv
# PostgreSQL: điền chuỗi kết nối thật của môi trường đang dùng
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST:PORT/DATABASE?sslmode=require"

# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID="YOUR_CLOUDFLARE_ACCOUNT_ID"
CLOUDFLARE_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"

# Supabase Storage
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_SIDE_SERVICE_ROLE_KEY"
SUPABASE_BUCKET="Viet-Phuc-Anh"

# Khóa riêng cho giao diện và API quản trị, tối thiểu 32 ký tự
ADMIN_REVIEW_KEY="REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS"
```

Các giá trị trên chỉ là chỗ giữ chỗ. Thay toàn bộ bằng cấu hình của bạn trước khi chạy.

| Biến | Vai trò |
| --- | --- |
| `DATABASE_URL` | Kết nối PostgreSQL mà ứng dụng sử dụng |
| `DIRECT_URL` | Kết nối trực tiếp được Prisma khai báo để phục vụ thao tác cơ sở dữ liệu |
| `CLOUDFLARE_ACCOUNT_ID` | Tài khoản Cloudflare chạy các model AI |
| `CLOUDFLARE_API_TOKEN` | Token gọi Workers AI, chỉ dùng phía máy chủ |
| `SUPABASE_URL` | URL Supabase project, không phải chuỗi kết nối PostgreSQL |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa máy chủ dùng để upload/xóa ảnh |
| `SUPABASE_BUCKET` | Tên bucket chính xác, phân biệt chữ hoa/chữ thường; mặc định `Viet-Phuc-Anh` |
| `ADMIN_REVIEW_KEY` | Khóa quản trị, tối thiểu 32 ký tự |
| `HIEN_CHI_TIET_LOI` | Tùy chọn: đặt `1` để hiện thêm chi tiết lỗi sinh ảnh; bỏ sau khi gỡ lỗi |

`SUPABASE_URL` được ưu tiên; mã nguồn cũng hỗ trợ `NEXT_PUBLIC_SUPABASE_URL` làm giá trị dự phòng. Luồng lưu ảnh hiện tại không yêu cầu biến anon key. Không thêm tiền tố `NEXT_PUBLIC_` cho khóa service role, token AI hoặc khóa quản trị; không commit `.env` lên GitHub.

Bucket phải tồn tại và cho phép đọc ảnh công khai vì ứng dụng lưu URL từ `getPublicUrl()`. Upload được thực hiện phía máy chủ bằng khóa service role.

### 4. Cài thư viện

```bash
npm ci
```

Dùng các phiên bản đã khóa trong `package-lock.json`. Dự án đang dùng **Prisma 6**; không chạy `npm install prisma` không chỉ định phiên bản vì có thể nâng lên phiên bản lớn không tương thích.

Script `postinstall` sẽ chạy `prisma generate`. Nếu cần tạo lại Prisma Client:

```bash
npx prisma generate
```

### 5. Khởi tạo cơ sở dữ liệu mới

**Chỉ thực hiện bước seed trên cơ sở dữ liệu mới hoặc môi trường thử nghiệm có thể xóa dữ liệu.** `prisma/seed.ts` xóa dữ liệu hiện có, bao gồm các tổ hợp và trạng thái duyệt, trước khi tạo dữ liệu mẫu. Không chạy lại seed chỉ vì vừa pull code.

Áp dụng các migration có trong repository:

```bash
npx prisma migrate deploy
```

Nạp dữ liệu ban đầu, sau đó đồng bộ quy tắc và nội dung văn hóa:

```bash
npx tsx --env-file=.env prisma/seed.ts
npx tsx scripts/kiem-tra-dong-bo-van-hoa.ts
npx tsx --env-file=.env prisma/dong-bo-van-hoa.ts --ap-dung
```

Để xem trước thay đổi của script đồng bộ:

```bash
npx tsx --env-file=.env prisma/dong-bo-van-hoa.ts
```

**Sau mỗi lần seed lại, phải chạy lại bước đồng bộ văn hóa.** Không chạy `prisma/seed-quy-tac.ts` trong quy trình này: hướng dẫn cập nhật của nhóm xác định script cũ có quy tắc không còn phù hợp và có thể ghi đè dữ liệu đối chiếu.

Với database đã có dữ liệu, kiểm tra lịch sử migration và sao lưu trước khi cập nhật; không dùng lệnh reset hoặc seed để xử lý lỗi kết nối.

### 6. Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ, giới thiệu và gợi ý |
| `/phoi-do` | Thử phối đồ và tạo ảnh |
| `/lookbook` | Bộ sưu tập cá nhân |
| `/van-hoa` | Thư viện văn hóa |
| `/van-hoa/[slug]` | Chi tiết một nội dung văn hóa |
| `/admin` | Quản trị duyệt tổ hợp |

## Quản trị ảnh

1. Cấu hình `ADMIN_REVIEW_KEY` rồi khởi động lại ứng dụng.
2. Mở `/admin`, nhập khóa quản trị.
3. Xem danh sách chờ duyệt, kiểm tra đúng loại trang phục, màu, phụ kiện và chất lượng ảnh.
4. Chọn duyệt hoặc từ chối.

Các API đọc danh sách, đọc chi tiết và cập nhật trạng thái quản trị yêu cầu header:

```http
Authorization: Bearer <ADMIN_REVIEW_KEY>
```

API duyệt chỉ cho phép xử lý bản ghi đang ở trạng thái `draft`; không duyệt bản ghi chưa có đường dẫn ảnh. Khóa quản trị là cơ chế dùng chung của phiên bản hiện tại, chưa phải hệ thống tài khoản và phân quyền theo từng người dùng.

## Nạp ảnh thủ công

Dành cho ảnh đã chuẩn bị và kiểm tra chất lượng trước khi nhập. **Script nạp ảnh ghi trực tiếp trạng thái `approved`, không đưa vào hàng chờ duyệt.**

1. Xem danh sách tên hợp lệ trong database:

   ```bash
   npm run nap-anh -- --danh-sach
   ```

2. Tạo thư mục `anh-moi/` tại gốc dự án, đặt ảnh theo mẫu:

   ```text
   {trang-phuc}__{mau-chinh}__{mau-phu}__{phu-kien}__{su-kien}.png
   ```

   Ví dụ, nếu các tên tương ứng có trong dữ liệu:

   ```text
   ao-dai__do-son__trang-nga__tram-cai__tet.png
   ao-dai__do-son__trang-nga__non-la+tram-cai__tet.png
   ao-dai__do-son__trang-nga__khong-phu-kien__tet.png
   ```

Với nhiều phụ kiện, nối slug bằng dấu `+` và sắp xếp theo thứ tự chữ cái để thống nhất tên file của nhóm. Sao chép slug đúng từ `--danh-sach`, không tự đoán tên. Bộ ảnh demo nên dùng dịp `tet` để khớp dịp mặc định.

3. Kiểm tra trước khi ghi:

   ```bash
   npm run nap-anh -- --thu
   ```

4. Khi thông tin đúng, thực hiện nạp:

   ```bash
   npm run nap-anh
   ```

Ảnh được chuyển sang WebP, upload vào `manual/` trên bucket; file nguồn thành công được chuyển vào `anh-moi/da-xong/`. Mặc định, tổ hợp đã tồn tại sẽ được bỏ qua. Tùy chọn `--ghi-de` thay ảnh của tổ hợp cũ, đánh dấu `approved` và dọn ảnh cũ thuộc bucket; chỉ dùng khi chủ động muốn thay thế.

## Các lệnh thường dùng

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Tạo Prisma Client và build ứng dụng |
| `npm start` | Chạy bản đã build |
| `npm run lint` | Kiểm tra ESLint |
| `npx prisma studio` | Xem và quản lý dữ liệu qua Prisma Studio |
| `npx tsx scripts/kiem-tra-dong-bo-van-hoa.ts` | Kiểm tra tính nhất quán dữ liệu văn hóa, không cần database |
| `npm run nap-anh -- --thu` | Kiểm tra việc nạp ảnh, chưa ghi dữ liệu |

Để chạy bản production trên máy chủ hỗ trợ Node.js:

```bash
npm run build
npm start
```

Cấu hình các biến môi trường trên máy chủ tương ứng với `.env`. Lệnh build không tự áp dụng migration hoặc seed. API sinh ảnh khai báo `maxDuration = 60`; giới hạn thực tế còn phụ thuộc nền tảng triển khai. Ảnh mới được lưu trên Supabase Storage, không phụ thuộc việc ghi file vào `public/generated/` lúc chạy.

## Triển khai trên Vercel

1. Kiểm tra `npm run lint`, script đồng bộ văn hóa và `npm run build` ở môi trường đã cấu hình.
2. Import repository GitHub vào Vercel; chọn framework Next.js và thư mục gốc chứa `package.json`.
3. Dùng Install Command `npm ci` và Build Command `npm run build`.
4. Thêm các biến trong bảng cấu hình vào **Settings → Environment Variables**, chọn đúng môi trường Production hoặc Preview. Không đưa file `.env` vào repository.
5. Chuẩn bị database đúng môi trường bằng migration; chỉ seed database mới. Hoàn tất đồng bộ văn hóa trước khi demo.
6. Deploy, rồi kiểm tra `/api/danh-muc`, trang phối đồ, tạo ảnh, Storage và trang quản trị.
7. Khi đổi biến môi trường, triển khai lại để cấu hình mới có hiệu lực.

[Hướng dẫn Git integration của Vercel](https://vercel.com/docs/git) · [Biến môi trường](https://vercel.com/docs/environment-variables).

### Cron và keep-alive

Bản ZIP và nhánh `main` được đối chiếu khi viết README chưa có `vercel.json` hoặc `app/api/keep-alive/route.ts`. Vì vậy chưa có bằng chứng cron keep-alive đang được triển khai. Nếu nhóm bổ sung tính năng này ở nhánh khác, cần cập nhật README theo cấu hình đã merge và kiểm tra trên production.

Supabase Free có thể tạm dừng project khi hoạt động database thấp trong khoảng 7 ngày. Khi demo bị lỗi kết nối, kiểm tra trạng thái project trong Dashboard, chọn **Resume project** nếu đang paused, đợi khôi phục rồi thử lại. Không seed lại để xử lý việc project bị tạm dừng. Xem [tài liệu Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## Cấu trúc mã nguồn

| Thư mục / file | Vai trò |
| --- | --- |
| `app/` | Trang giao diện và API routes |
| `components/` | Các thành phần giao diện |
| `hooks/` | Hooks dùng chung |
| `lib/aiSinhAnh.ts` | Prompt và lời gọi Cloudflare Workers AI |
| `lib/luuAnhSupabase.ts` | Nén, upload và xóa ảnh |
| `lib/adminAuth.ts` | Kiểm tra khóa quản trị |
| `lib/comboKey.ts` | Chuẩn hóa khóa tổ hợp và danh sách phụ kiện |
| `lib/rules/` | Quy tắc văn hóa và màu sắc |
| `lib/vanHoa/` | Dữ liệu thư viện văn hóa và quy tắc đồng bộ |
| `lib/localLookbook.ts` | Lưu Lookbook trong trình duyệt |
| `prisma/` | Schema, migrations và scripts dữ liệu |
| `scripts/` | Nạp ảnh, thử prompt và kiểm tra dữ liệu |
| `types/` | Định nghĩa kiểu TypeScript |
| `public/` | Tài nguyên tĩnh và một số ảnh cũ |
| `docs/` | Tài liệu văn hóa, prompt và kết quả thử nghiệm |
| `notebooks/` | Notebook kiểm thử C4 |

## API chính

| Phương thức | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/danh-muc` | Danh mục phục vụ giao diện |
| GET | `/api/trang-phuc`, `/api/mau-sac`, `/api/phu-kien`, `/api/su-kien` | Dữ liệu lựa chọn |
| GET | `/api/noi-dung-van-hoa`, `/api/quy-tac-van-hoa` | Nội dung và quy tắc văn hóa |
| POST | `/api/kiem-tra-lop1` | Kiểm tra theo quy tắc văn hóa |
| POST | `/api/kiem-tra-lop2` | Đánh giá phối màu |
| POST | `/api/kiem-tra-phoi-do` | Kiểm tra phối đồ tổng hợp |
| GET | `/api/thoi-tiet?lat=...&lon=...` | Thời tiết tại tọa độ |
| POST | `/api/to-hop-duoc-duyet` | Tạo hoặc lấy lại tổ hợp có ảnh |
| GET | `/api/to-hop-duoc-duyet` | Danh sách quản trị, cần khóa |
| GET | `/api/to-hop-duoc-duyet/[id]` | Chi tiết quản trị, cần khóa |
| PATCH | `/api/to-hop-duoc-duyet/[id]` | Duyệt/từ chối, cần khóa |

`/api/keep-alive` chưa có trong mã nguồn được đối chiếu; không liệt kê là API đang hoạt động.

Danh sách quản trị hỗ trợ `status=draft|approved|rejected`, `take` từ 1–100 và `skip` không âm. Mặc định: `status=draft`, `take=50`, `skip=0`.

## Kiểm tra trước khi bàn giao

- Chạy lint, build và script kiểm tra đồng bộ văn hóa.
- Kiểm tra danh mục hiển thị và luồng chọn trang phục, màu, phụ kiện.
- Tạo một tổ hợp mới, kiểm tra ảnh trên Storage và trạng thái `draft` trong database.
- Gọi lại cùng tổ hợp để kiểm tra tái sử dụng kết quả.
- Kiểm tra cảnh báo cập nhật khi đổi phụ kiện, chặn nón/khăn xung đột, dịp mặc định Tết và ẩn nhận xét khi có lưu ý văn hóa.
- Sao chép link, mở ở cửa sổ khác để kiểm tra bộ phối; thử tải ảnh về máy.
- Duyệt/từ chối qua `/admin`; thử thiếu hoặc sai khóa quản trị.
- Lưu Lookbook rồi tải lại trang để kiểm tra dữ liệu cá nhân.

`package.json` chưa có lệnh `npm test`. Các tài liệu thử nghiệm trong `docs/AI/` là kết quả theo từng thời điểm, không thay thế việc kiểm tra phiên bản đang triển khai.

## Lỗi thường gặp

| Hiện tượng | Kiểm tra |
| --- | --- |
| Không kết nối database | `DATABASE_URL`, `DIRECT_URL`, mật khẩu, mạng và trạng thái database |
| `/api/danh-muc` trả 500, log báo `Can’t reach database server` | Kiểm tra Supabase Dashboard; nếu paused, chọn **Resume project**, đợi khôi phục rồi thử lại |
| Thiếu bảng hoặc danh mục rỗng | Migration và dữ liệu khởi tạo của đúng database |
| Thiếu `DanhGiaMauSac` | Kiểm tra dữ liệu đánh giá màu; tránh seed lại database đang dùng |
| Không sinh được ảnh | Cloudflare Account ID, API Token, quyền Workers AI và lỗi từ nhà cung cấp |
| Upload ảnh thất bại | Supabase URL, service role key và tên bucket |
| Có URL nhưng ảnh không tải | Bucket công khai, đường dẫn ảnh và cấu hình `next.config.ts` |
| Admin trả 401 | Khóa gửi lên thiếu hoặc không đúng |
| Admin trả 503 | `ADMIN_REVIEW_KEY` chưa đặt hoặc ngắn hơn 32 ký tự |
| Duyệt trả 409 | Bản ghi đã được xử lý/thay đổi; tải lại danh sách |
| Sửa `.env` nhưng chưa có hiệu lực | Khởi động lại dev server hoặc triển khai lại môi trường tương ứng |
| Đổi trình duyệt không thấy Lookbook | Lookbook nằm trong `localStorage`, chưa đồng bộ theo tài khoản |

## Tài liệu liên quan

- [Prompt thử nghiệm D1](docs/AI/d1-prompt-tao-anh.md)
- [Kết quả thử nghiệm D1](docs/AI/d1-ket-qua-test.md)
- [Kết quả thử nghiệm D2](docs/AI/d2-ket-qua-test.md)
- [Đối chiếu văn hóa E1](docs/E1-doi-chieu-van-hoa.md)
- [Notebook kiểm thử C4](notebooks/kiem-thu-c4.ipynb)

## Phạm vi và giới hạn

- Nội dung văn hóa là bản tổng hợp phục vụ demo; chưa có bằng chứng hoàn tất chuyên gia đọc lại toàn bộ nội dung (E1). Những mục chưa kiểm chứng phải tiếp tục được ghi nhãn rõ.
- **Khăn mỏ quạ** đang ở trạng thái chưa kiểm chứng trong thư viện. Không dùng nhận xét AI để kết luận nguồn gốc hoặc mức độ phù hợp của mục này.

- Prompt tạo ảnh hiện mô tả người mẫu nữ; dữ liệu danh mục có thể có trang phục dành cho cả nam và nữ.
- Đánh giá màu là quy tắc theo Hue, không phải AI phân tích thị giác trên ảnh đã sinh.
- Lookbook lưu cục bộ; xóa dữ liệu trình duyệt có thể làm mất bộ sưu tập.
- Endpoint tạo ảnh hiện không yêu cầu khóa quản trị và chưa có cơ chế giới hạn tần suất trong route; cần xem xét hạn mức trước khi mở rộng lượng người dùng.
- Chi phí, hạn mức và khả năng sử dụng dịch vụ AI phụ thuộc tài khoản nhà cung cấp; dự án không bảo đảm tạo ảnh miễn phí hoặc không giới hạn.
- Repository chưa kèm file `LICENSE`; cần thống nhất giấy phép trước khi phân phối lại mã nguồn.


## Chưa thực hiện trong phiên bản này

- Đăng nhập người dùng và đồng bộ Lookbook giữa các thiết bị.
- Bảng màu tự do cho phép chọn bất kỳ màu nào ngoài danh mục.
- Luồng phối đồ riêng cho trang phục của các dân tộc thiểu số.
- Cron keep-alive đã được kiểm chứng trên môi trường triển khai.

## Thông tin cần hoàn thiện trước khi nộp

- Xác nhận URL demo production và bổ sung video giới thiệu.
- Ghi rõ nguồn tạo của bộ ảnh demo, kết quả duyệt thủ công và số tổ hợp thực tế; chưa đủ bằng chứng để công bố đã hoàn thành 100–250 tổ hợp.
- Xác nhận yêu cầu sử dụng Gemini với ban tổ chức.
- Chạy lại quy trình cài đặt trên thư mục sạch và ghi nhận kết quả kiểm tra E2/E3.
- Thống nhất tên hiển thị **Việt Phục Remix** trong giao diện và tài liệu.

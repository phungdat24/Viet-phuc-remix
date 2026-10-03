# D2 — Báo cáo kết quả kiểm thử kết nối AI vào backend

## 1. Thông tin chung

| Nội dung         | Giá trị                                        |
| ---------------- | ---------------------------------------------- |
| Dự án            | Việt phục — Remix                              |
| Nhiệm vụ         | D2 — Lấy API key, nối vào backend              |
| Người thực hiện  | Khánh Duy — Nội dung & AI Lead                 |
| Ngày kiểm thử    | 03/10/2026                                     |
| Nhánh thực hiện  | `feat/d2-cloudflare-backend`                   |
| Repository       | https://github.com/phungdat24/Viet-phuc-remix  |
| Môi trường       | Windows, VS Code, chạy local                   |
| Địa chỉ backend  | `http://localhost:3000`                        |
| Next.js          | 16.3.6                                         |
| Prisma Client    | 6.19.3                                         |
| Công cụ kiểm thử | Thunder Client và trình duyệt Brave            |
| Provider AI      | Cloudflare Workers AI                          |
| Model tạo ảnh    | `@cf/black-forest-labs/flux-1-schnell`         |
| Model nhận xét   | `@cf/meta/llama-3.1-8b-instruct`               |
| Database         | PostgreSQL trên Supabase, project `viet_remix` |

**Điều chỉnh so với phân công ban đầu:** tài liệu giao việc đề cập
Gemini, nhưng backend hiện có đã chuyển sang Cloudflare Workers AI.
D2 được thực hiện theo provider đang sử dụng trong mã nguồn.

Báo cáo dựa trên kết quả request, log terminal và ảnh chụp màn hình
trong quá trình kiểm thử. Chưa ghi nhận mã commit cụ thể của phiên bản
đã chạy các request thành công.

## 2. Mục tiêu kiểm thử

Xác minh backend có thể:

1. Đọc cấu hình bí mật từ biến môi trường.
2. Kết nối database và lấy dữ liệu đầu vào.
3. Gọi Cloudflare để tạo ảnh.
4. Gọi model văn bản để tạo nhận xét tiếng Việt.
5. Lưu ảnh trên máy chạy backend.
6. Lưu thông tin tổ hợp vào database.
7. Đọc lại bản ghi đã lưu.
8. Trả lại tổ hợp đã tồn tại khi gửi lại cùng đầu vào.

Phạm vi của D2 là kết nối và kiểm thử kỹ thuật.
Chất lượng ảnh và việc phê duyệt tổ hợp được đánh giá riêng ở D1/D3/D4.

## 3. Cấu hình và thay đổi mã nguồn

### 3.1. Biến môi trường

Đã cấu hình trong `.env`:

```dotenv
DATABASE_URL="<không công bố>"
DIRECT_URL="<không công bố>"
CLOUDFLARE_ACCOUNT_ID="<không công bố>"
CLOUDFLARE_API_TOKEN="<không công bố>"
```

Token Cloudflare được cấp quyền:
- `Account → Workers AI → Read`.
- `Account → Workers AI → Edit`.
- Phạm vi tài khoản: tài khoản dùng để thử nghiệm dự án.

Backend tự đọc token và thêm header `Authorization: Bearer ...`
khi gọi Cloudflare. Request từ Thunder Client tới backend local
không chứa token Cloudflare.

Báo cáo không lưu giá trị token, mật khẩu hoặc connection string.

### 3.2. Mã nguồn liên quan

| File                                      | Vai trò                                         |
| ----------------------------------------- | ----------------------------------------------- |
| `lib/aiSinhAnh.ts`                        | Tạo prompt, gọi Cloudflare sinh ảnh và nhận xét |
| `app/api/to-hop-duoc-duyet/route.ts`      | Nhận tổ hợp, gọi AI, lưu ảnh và bản ghi         |
| `app/api/to-hop-duoc-duyet/[id]/route.ts` | Đọc chi tiết tổ hợp theo ID                     |
| `lib/prisma.ts`                           | Khởi tạo Prisma Client                          |
| `prisma/schema.prisma`                    | Khai báo cấu trúc dữ liệu                       |

Thay đổi thực hiện trong `lib/aiSinhAnh.ts`:
- Xóa các đoạn log chứa thông tin token.
- Thêm `.trim()` khi đọc `CLOUDFLARE_ACCOUNT_ID`
  và `CLOUDFLARE_API_TOKEN`.

Luồng gọi Cloudflare đã có trong code của nhóm; D2 sử dụng và
kiểm thử luồng đó, không xây lại toàn bộ backend.

## 4. Chuẩn bị môi trường và kiểm tra database

Các bước đã thực hiện:

```bash
npm ci
npx prisma generate
npm run dev
```

| Kiểm tra              | Kết quả quan sát              |
| --------------------- | ----------------------------- |
| Cài dependencies      | Thành công, thêm 396 packages |
| Tạo Prisma Client     | Thành công, phiên bản 6.19.3  |
| Khởi động Next.js     | Thành công, server báo Ready  |
| Mở trang chủ          | Giao diện hiển thị            |
| `GET /api/trang-phuc` | HTTP 200, trả 3 trang phục    |
| `GET /api/mau-sac`    | HTTP 200, trả 10 màu          |
| `GET /api/su-kien`    | HTTP 200, trả 5 sự kiện       |

Các API danh sách trả dữ liệu xác nhận kết nối đọc database
đã hoạt động ở thời điểm kiểm thử.

`prisma generate` chỉ tạo Prisma Client; bản thân lệnh này
không chứng minh kết nối database.

Không chạy lại migration hoặc seed database chung trong quá trình D2.

## 5. Đầu vào kiểm thử tạo ảnh

### 5.1. Tổ hợp

| Thành phần | Giá trị    |
| ---------- | ---------- |
| Trang phục | Áo dài     |
| Màu chính  | Hồng đào   |
| Màu phụ    | Trắng ngà  |
| Phụ kiện   | Không chọn |
| Sự kiện    | Tết        |

### 5.2. Request

**Method:** `POST`

**URL:** `http://localhost:3000/api/to-hop-duoc-duyet`

**Header:**

```http
Content-Type: application/json
```

**Body:**

```json
{
  "trangPhucId": "a89345d6-1043-4bdf-b49e-16a31dd280bf",
  "mauChinhId": "9875a070-6fc9-4017-80b1-febbd00ebdbe",
  "mauPhuId": "56653b70-698c-4aca-8417-d6ee1469c692",
  "phuKienId": null,
  "suKienId": "9d4d807b-55c1-4985-96f4-0a3f55d29103"
}
```

Các ID được lấy từ API danh sách của database đang sử dụng.
Chúng không được giả định là giống nhau ở môi trường khác.

## 6. Lịch sử các lần thử

### D2-T01 — Request thất bại khi mất kết nối mạng

| Nội dung                     | Kết quả                              |
| ---------------------------- | ------------------------------------ |
| API                          | `POST /api/to-hop-duoc-duyet`        |
| HTTP status                  | `500 Internal Server Error`          |
| Thời gian                    | Khoảng 12,90 giây                    |
| Lỗi trong terminal           | Prisma `P1001`                       |
| Model database đang truy vấn | `SuKien`                             |
| Kết luận                     | Backend không truy cập được database |

Response:

```json
{
  "error": "Không thể sinh ảnh AI cho tổ hợp này."
}
```

**Bối cảnh:** xảy ra mất điện đột ngột và mất kết nối mạng.
Log cho thấy lỗi kết nối Supabase ở cổng `6543`.

Thông báo response là lỗi tổng quát của route.
Nguyên nhân quan sát được trong terminal là lỗi kết nối database,
không phải bằng chứng token Cloudflare sai.

**Cách khắc phục đã thực hiện:**
1. Kết nối lại Wi-Fi.
2. Dừng backend.
3. Chạy lại `npm run dev`.
4. Kiểm tra lại API danh sách.
5. Gửi lại request sau khi database truy cập được.

Không ghi nhận ảnh hoặc bản ghi được tạo thành công trong lần thử này.

### D2-T02 — Tạo tổ hợp mới thành công

| Nội dung                     | Kết quả                       |
| ---------------------------- | ----------------------------- |
| API                          | `POST /api/to-hop-duoc-duyet` |
| HTTP status                  | `201 Created`                 |
| Thời gian                    | Khoảng 13,08 giây             |
| Kích thước response hiển thị | 1,02 KB                       |
| `daTonTai`                   | `false`                       |
| `status`                     | `draft`                       |
| `imageUrl`                   | Có đường dẫn ảnh              |
| `aiAssessment.nhanXetAI`     | Có nội dung tiếng Việt        |

ID bản ghi:

```text
68882521-8b84-4873-b6d5-187be8196756
```

Đường dẫn ảnh trong response:

```text
/generated/1568f2b39e0bacf57739ce57-murvqtxn.jpg
```

File ảnh tương ứng trên máy:

```text
public/generated/1568f2b39e0bacf57739ce57-murvqtxn.jpg
```

Thời điểm tạo được lưu trong bản ghi:

```text
2026-10-03T04:16:26.921Z
```

Tương đương `11:16:26.921`, ngày 03/10/2026, giờ Việt Nam.

Nhận xét AI trả về:

> Tổ hợp phối đồ này là một sự hài hòa hoàn hảo giữa áo dài truyền
> thống và màu sắc tinh tế, tạo nên một vẻ đẹp hiện đại và tinh tế
> cho dịp Tết. Áo dài hồng đào kết hợp với trắng ngà mang lại một
> cảm giác nhẹ nhàng và trang nhã.

**Kết luận:** luồng tạo mới đã nhận ảnh, nhận xét và lưu bản ghi
thành công sau khi kết nối mạng được phục hồi.

### D2-T03 — Mở ảnh đã lưu

Đã mở trong trình duyệt:

```text
http://localhost:3000/generated/1568f2b39e0bacf57739ce57-murvqtxn.jpg
```

| Nội dung                                      | Kết quả                                     |
| --------------------------------------------- | ------------------------------------------- |
| Truy cập đường dẫn ảnh                        | Thành công                                  |
| Định dạng                                     | JPG                                         |
| Kích thước hiển thị trong tiêu đề trình duyệt | 1024 × 1024                                 |
| Nội dung                                      | Người mẫu đứng toàn thân, nền sáng đơn giản |

**Kết luận:** ảnh đã được lưu và phục vụ qua server local.

### D2-T04 — Đọc lại bản ghi từ database

Đã truy cập:

```text
GET /api/to-hop-duoc-duyet/68882521-8b84-4873-b6d5-187be8196756
```

Kết quả:
- Trả JSON chứa bản ghi có đúng ID.
- Đầu vào tổ hợp khớp request tạo mới.
- Có đường dẫn ảnh đã mở thành công.
- Có model ảnh và nhận xét AI.
- Trạng thái vẫn là `draft`.
- Có thời điểm tạo bản ghi.

Backend lưu trường `phuKienId` thành `"khong-phu-kien"`
khi đầu vào là `null`, theo quy ước của code hiện tại.

**Kết luận:** dữ liệu đã lưu có thể được đọc lại qua request riêng.

### D2-T05 — Gửi lại cùng tổ hợp

Đã gửi lại cùng URL, header và Body của D2-T02.

| Nội dung                     | Kết quả           |
| ---------------------------- | ----------------- |
| HTTP status                  | `200 OK`          |
| Thời gian                    | Khoảng 1,66 giây  |
| Kích thước response hiển thị | 1,02 KB           |
| `daTonTai`                   | `true`            |
| Dữ liệu trả về               | Tổ hợp đã tồn tại |
| Trạng thái                   | `draft`           |

**Kết luận:** backend dùng lại tổ hợp đã lưu.

Theo nhánh xử lý trong mã nguồn, khi tìm thấy `comboKey`
và không yêu cầu sinh lại, backend trả bản ghi cũ trước bước gọi AI.
Kết quả này không phải phép kiểm thử hai request đồng thời.

## 7. Tổng hợp kết quả

| Hạng mục                                      | Đánh giá                      |
| --------------------------------------------- | ----------------------------- |
| Backend đọc cấu hình môi trường               | Đạt trong luồng thực tế       |
| Kết nối đọc dữ liệu Supabase                  | Đạt                           |
| Gọi Cloudflare tạo ảnh                        | Đạt                           |
| Gọi AI tạo nhận xét tiếng Việt                | Đạt                           |
| Lưu ảnh local                                 | Đạt                           |
| Lưu và đọc lại bản ghi database               | Đạt                           |
| Dùng lại tổ hợp khi gửi lần lượt cùng đầu vào | Đạt                           |
| Phục hồi sau sự cố mất mạng                   | Đạt trong lần thử đã ghi nhận |
| Bám đúng màu chính trong ảnh                  | Chưa đạt yêu cầu quan sát     |
| Duyệt chất lượng ảnh                          | Chưa thực hiện                |
| Kiểm thử môi trường triển khai                | Chưa thực hiện                |

## 8. Đánh giá chất lượng ảnh và nhận xét

### 8.1. Điểm quan sát được

- Ảnh hiển thị được.
- Người mẫu xuất hiện toàn thân, thấy đầu và giày.
- Nền sáng, đơn giản.
- Không thấy phụ kiện cầm tay hoặc đội đầu trong ảnh chụp.

### 8.2. Điểm cần cải thiện

Yêu cầu màu chính là **Hồng đào**, màu phụ là **Trắng ngà**.
Tuy nhiên, áo trong ảnh chủ yếu trắng/ngà;
màu hồng xuất hiện ở viền, phần bên và họa tiết.

Cần điều chỉnh prompt để mô tả rõ vị trí và tỷ lệ diện tích
của màu chính, màu phụ.

Nhận xét AI được tạo từ dữ liệu tổ hợp, không phân tích trực tiếp
ảnh đã sinh. Vì vậy, nhận xét “hài hòa hoàn hảo” không được dùng
làm bằng chứng ảnh đúng màu, đúng cấu trúc hoặc đạt chuẩn văn hóa.

Bản ghi được giữ ở trạng thái `draft`, chưa phê duyệt.
Không dùng kết quả kết nối thành công để thay cho kiểm duyệt ảnh.

## 9. Đồng bộ code và tài liệu D1

Sau các lần kiểm thử trên:

1. Lưu thay đổi code D2 bằng commit trên nhánh D2.
2. Chạy `git fetch origin`.
3. Merge `origin/main` vào `feat/d2-cloudflare-backend`.
4. Hoàn tất merge và xác nhận không còn trạng thái merge dang dở.
5. Tài liệu D1 trong `docs/AI/` xuất hiện trên nhánh D2.

Ảnh thử nghiệm còn là file untracked trong `public/generated/`
tại lần kiểm tra Git status sau merge.

**Chưa có bằng chứng kiểm thử lại sau merge trong dữ liệu
được tổng hợp cho báo cáo này.** Các kết quả tại mục 6 thuộc phiên bản
đã chạy trước merge.

Chưa ghi nhận việc push báo cáo D2 hoặc tạo Pull Request D2.

## 10. Giới hạn và phần cần tiếp tục

- Đã kiểm thử một tổ hợp tạo ảnh mới.
- Chưa chứng minh mọi trang phục, màu sắc và phụ kiện đều hoạt động.
- Chưa kiểm thử tải lớn hoặc request tạo trùng đồng thời.
- Chưa kiểm thử mất mạng giữa lúc gọi AI hoặc ghi dữ liệu.
- Chưa xác minh khả năng dọn ảnh dư nếu lưu database thất bại.
- Ảnh đang nằm trên máy chạy backend trong `public/generated/`.
- Supabase lưu thông tin tổ hợp và đường dẫn, chưa lưu file ảnh
  bằng Supabase Storage trong luồng này.
- Đường dẫn ảnh local không tự cung cấp ảnh cho máy khác hoặc
  môi trường triển khai.
- Chưa kiểm thử xác thực và phân quyền admin trong phạm vi D2.
- Cần kiểm tra lại phần liên quan sau merge trước khi bàn giao.

Các cảnh báo môi trường đã quan sát:
- Cảnh báo dependency ESLint ngừng hỗ trợ.
- `npm ci` báo 8 lỗ hổng mức high; chưa có kết quả phân tích
  hoặc khắc phục bằng `npm audit` trong báo cáo này.
- Cảnh báo install scripts chưa được bao phủ bởi allowScripts.
- Cảnh báo cấu hình `package.json#prisma` bị deprecated.

Các cảnh báo trên không ngăn các lần thử local thành công,
nhưng không được xem là đã xử lý xong.

## 11. Kết luận và bàn giao

**D2 đã được kiểm chứng thành công ở môi trường local
trước khi merge `origin/main`.**

Backend đã:
- Kết nối database.
- Gọi Cloudflare tạo ảnh và nhận xét.
- Lưu ảnh và thông tin tổ hợp.
- Đọc lại bản ghi.
- Trả lại tổ hợp đã tồn tại khi gửi lại cùng đầu vào.

Kết quả hiện có là **một tổ hợp draft**, chưa phải ảnh được duyệt
và chưa phải kết quả tạo hàng loạt của D4.

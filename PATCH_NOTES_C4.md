# Lớp C4 — Sinh ảnh AI + đánh giá tổng thể + duyệt

Tiếp nối sau commit "hoàn thành c1->c3". Không đổi schema Prisma (bảng
`ToHopDuocDuyet` đã có sẵn từ trước, chỉ chưa có API dùng tới).

**Provider ảnh: Cloudflare Workers AI (miễn phí, ~100.000 request/ngày)** —
đã đổi từ Gemini (`gemini-3-pro-image-preview`) sang vì model ảnh của Gemini
không có quota free tier (`limit: 0`, bắt buộc bật billing trả phí), trong
khi Cloudflare Workers AI free và gọi thẳng qua REST API, không cần deploy
Worker riêng.

## File mới / đã sửa

| File | Việc gì |
|---|---|
| `lib/comboKey.ts` | Quy ước `comboKey` (xem chi tiết trong comment đầu file) — không đổi. |
| `lib/aiSinhAnh.ts` | Gọi Cloudflare Workers AI: `@cf/black-forest-labs/flux-1-schnell` để sinh ảnh, `@cf/meta/llama-3.1-8b-instruct` để sinh nhận xét (2 lượt gọi riêng — Workers AI không có model gộp ảnh+text như Gemini). |
| `app/api/to-hop-duoc-duyet/route.ts` | `POST` sinh ảnh AI cho 1 tổ hợp (idempotent theo `comboKey`), `GET` liệt kê kèm tên. |
| `app/api/to-hop-duoc-duyet/[id]/route.ts` | `PATCH` đổi `status` → route duyệt. `GET` xem chi tiết 1 tổ hợp. |
| `notebooks/kiem-thu-c4.ipynb` | Notebook chạy thử 5 tổ hợp → duyệt thử → (gated) chạy hàng loạt. |

## Quy ước `comboKey`

```
${trangPhucId}:${mauChinhId}:${mauPhuId}:${phuKienId}:${suKienId}
```

Thứ tự cố định, không sort. Cả 5 trường bắt buộc (khớp schema — khác với
Lookbook cá nhân ở `localStorage` cho phép `phuKienId`/`suKienId` null).
`danhGiaMauId` không nằm trong key vì nó suy ra được từ `mauChinhId`+`mauPhuId`.

## Việc bạn cần làm trước khi chạy

1. Thêm vào `.env` (file thật của bạn — không đụng vào giá trị
   Supabase/Postgres hiện có, chỉ cần thêm 2 dòng mới):
   ```
   CLOUDFLARE_ACCOUNT_ID=<Account ID — dash.cloudflare.com, góc phải sidebar>
   CLOUDFLARE_API_TOKEN=<tạo tại My Profile -> API Tokens -> Create Token, quyền "Workers AI - Edit">
   ```
   (Nếu trước đó bạn đã thêm `GEMINI_API_KEY`, có thể xoá hoặc giữ lại — code
   không còn dùng biến này nữa, không ảnh hưởng gì nếu để lại.)
2. `npx prisma generate` (môi trường mình chạy code không gọi được
   `binaries.prisma.sh` nên chưa tự generate/type-check được — các lỗi TS
   bạn thấy nếu build ngay bây giờ là do thiếu Prisma Client, không phải
   lỗi trong code mới).
3. `npm run dev`.

## Thứ tự chạy đề nghị (đúng như bạn yêu cầu)

1. Mở `notebooks/kiem-thu-c4.ipynb`, chạy tuần tự tới hết mục "1. Chọn 5 tổ
   hợp thử nghiệm" — phát hiện lỗi cấu hình/prompt sớm, rẻ (miễn phí).
2. Chạy mục "2. Duyệt thử" — xác nhận route duyệt hoạt động.
3. Chỉ khi cả 2 bước trên ổn, đổi `CHAY_HANG_LOAT = True` ở mục 3 rồi chạy
   hàng loạt. Route đã idempotent theo `comboKey` nên chạy lại cell này
   nhiều lần là an toàn.

## Ghi chú / giới hạn đã biết

- **Chất lượng ảnh**: `flux-1-schnell` là model ảnh tổng quát, không chuyên
  trang phục Việt Nam — độ bám mô tả (đúng loại trang phục/phụ kiện) có thể
  kém ổn định hơn Gemini. Đây chính xác là lý do chạy thử 5 tổ hợp trước:
  xem ảnh ra có đúng ý không, chỉnh `taoPromptAnh()` trong `lib/aiSinhAnh.ts`
  nếu cần (mô tả kỹ hơn bằng tiếng Anh: dáng áo, chất liệu, độ dài...).
- Ảnh lưu tạm ở `public/generated/*.jpg` (local disk) — đủ cho demo/MVP.
- Batch cell trong notebook lọc bớt bằng `POST /api/kiem-tra-phoi-do`,
  bỏ qua tổ hợp bị cảnh báo không phù hợp văn hoá trước khi tốn lượt gọi ảnh
  (dù Cloudflare miễn phí, vẫn nên tránh gọi thừa vì có giới hạn request/ngày).
- Chưa có UI duyệt (trang `/duyet`) — hiện duyệt qua `PATCH` trực tiếp
  (notebook hoặc curl/Postman). Nói mình biết nếu muốn làm luôn trang UI.
- Nếu sau này bạn bật billing Gemini và muốn quay lại dùng
  `gemini-3-pro-image-preview` (chất lượng/độ bám prompt tốt hơn hẳn), file
  `lib/aiSinhAnh.ts` được viết tách riêng — chỉ cần thay nội dung file này,
  không cần sửa gì ở `route.ts` (interface `DauVaoSinhAnh`/`KetQuaSinhAnh`
  và tên hàm `sinhAnhVaDanhGia` giữ nguyên).

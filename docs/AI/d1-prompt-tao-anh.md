# D1 — Prompt tạo ảnh Việt phục – Remix

## 1. Thông tin tài liệu

- Dự án: Việt phục – Remix.
- Nhiệm vụ: D1 — Viết và thử nghiệm prompt tạo ảnh trong Google AI Studio.
- Ngày thử nghiệm: 01/10/2026.
- Ngày tổng hợp tài liệu: 03/10/2026.
- Công cụ thử nghiệm: Google AI Studio.
- Model thử nghiệm: Nano Banana Pro — `gemini-3-pro-image`.
- Báo cáo đánh giá: `d1-ket-qua-test.md`.
- Thư mục lưu ảnh thử nghiệm: `d1-tests/`, cùng cấp với tài liệu này.

Tài liệu này lưu các prompt đã sử dụng, cách thay đổi giữa các phiên bản và khuôn prompt đề xuất để tiếp tục phát triển.

Số phiên bản được quản lý riêng cho từng ca thử. Ví dụ, T04 v3 không phải là phiên bản thứ ba của toàn bộ hệ thống prompt.

## 2. Mục tiêu

Tạo ảnh thời trang cho dự án Việt phục – Remix theo các thông tin đầu vào:

- Loại trang phục.
- Vùng miền của trang phục, nếu có.
- Màu chính và mã màu tham chiếu.
- Màu phụ và mã màu tham chiếu.
- Phụ kiện hoặc thành phần được chọn.
- Sự kiện sử dụng.

Các ảnh thử nghiệm hướng đến:

- Một người mẫu nữ Việt Nam trưởng thành, khoảng 25 tuổi.
- Ảnh toàn thân theo bố cục dọc 2:3.
- Nền studio xám nhạt, ánh sáng mềm và đều.
- Cấu trúc trang phục được mô tả rõ.
- Màu chính và màu phụ được phân bổ có chủ đích.
- Phụ kiện đúng loại, đúng vị trí và không che các chi tiết cần đánh giá.
- Không có chữ, logo hoặc ảnh ghép.

Các mô tả cấu trúc trong prompt là yêu cầu thiết kế của ca thử. Kết quả tạo ảnh chưa thay thế việc thẩm định tính chính xác văn hóa hoặc lịch sử của trang phục.

## 3. Cấu hình thử nghiệm

| Thiết lập               | Giá trị                                            |
| ----------------------- | -------------------------------------------------- |
| Công cụ                 | Google AI Studio                                   |
| Model                   | Nano Banana Pro — `gemini-3-pro-image`             |
| Temperature             | 1                                                  |
| Aspect ratio            | 2:3                                                |
| Resolution              | 1K                                                 |
| Google Search grounding | Tắt                                                |
| System instructions     | Để trống                                           |
| Ngôn ngữ prompt         | Tiếng Anh, giữ tên Việt của trang phục và phụ kiện |
| Các thiết lập khác      | Giữ mặc định trong quá trình thử nghiệm            |

Mã màu trong prompt là màu tham chiếu gần đúng. Chưa có phép đo màu để xác nhận ảnh đầu ra khớp chính xác mã HEX.

## 4. Danh sách phiên bản và ảnh thử nghiệm

| Ca thử   | Tổ hợp chính                                                   | Phiên bản đã chạy hợp lệ       | Số ảnh |
| -------- | -------------------------------------------------------------- | ------------------------------ | -----: |
| T01      | Áo dài — Đỏ son — Vàng nhũ — Nón lá — Tết                      | v1: 2 lần                      |      2 |
| T02      | Áo tứ thân — Lam chàm — Trắng ngà — Nón quai thao — Lễ hội     | v1: 2 lần; v2: 1 lần           |      3 |
| T03      | Áo bà ba — Lục ngọc — Be pastel — Khăn rằn — Đi học, dạo phố   | v1: 2 lần; v2: 1 lần           |      3 |
| T04      | Áo dài — Tím Huế — Đen huyền — Quạt giấy — Chụp ảnh nghệ thuật | v2: 2 lần; v3: 2 lần           |      4 |
| T05      | Áo tứ thân — Hồng đào — Nâu non — Yếm đào — Cưới hỏi           | v1: 2 lần                      |      2 |
| T06      | Áo dài — Đỏ son — Vàng nhũ — Không phụ kiện — Tết              | v1: 2 lần                      |      2 |
| **Tổng** | **6 ca thử**                                                   | **9 phiên bản đã chạy hợp lệ** | **16** |

Lưu ý về hồ sơ:

- Không có đủ dữ liệu để lưu một prompt T04 v1 đã được xác nhận.
- Một lượt thử T04 ban đầu bị nhập thiếu hoặc sai prompt đã được làm lại. Ảnh từ lượt đó không được dùng để đánh giá T04 v3.
- T04 v4 từng được đề xuất nhưng chưa có lượt chạy được xác nhận. Không đưa v4 vào danh sách phiên bản đã thử.
- Khuôn prompt tại mục 5 là bản tổng hợp đề xuất, chưa được chạy trực tiếp như một phiên bản độc lập.

## 5. Khuôn prompt dùng lại — bản đề xuất

### 5.1. Quy tắc sử dụng

Thay toàn bộ biến `{{...}}` bằng nội dung cụ thể trước khi chạy.

Đối với trang phục hoặc phụ kiện có cấu trúc đặc biệt, cần mô tả bằng đặc điểm nhìn thấy được. Không chỉ ghi tên rồi yêu cầu model tự suy ra.

Đối với trường hợp không chọn phụ kiện, vẫn cần điền một đoạn mô tả rõ việc không thêm phụ kiện.

### 5.2. Khuôn prompt

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old.
Her torso, shoulders, and hips face directly toward the camera.
Use a relaxed upright standing pose.

Use a vertical 2:3 composition.
{{MO_TA_KHUNG_HINH}}
Use a plain light-gray studio background with soft, even lighting.

OUTFIT
The model wears {{TEN_TRANG_PHUC}}.
{{MO_TA_CAU_TRUC_TRANG_PHUC}}
Create a restrained modern remix through colors and fabric finish.

COLORS
Main color: {{TEN_MAU_CHINH}}, approximate reference {{HEX_MAU_CHINH}}.
{{VI_TRI_MAU_CHINH}}

Accent color: {{TEN_MAU_PHU}}, approximate reference {{HEX_MAU_PHU}}.
{{VI_TRI_MAU_PHU}}

{{MO_TA_TRANG_PHUC_DI_KEM}}

ACCESSORY OR SELECTED COMPONENT
{{MO_TA_PHU_KIEN_HOAC_THANH_PHAN}}
{{QUY_TAC_TAY_VA_PHU_KIEN_KHAC}}

OCCASION
{{TEN_SU_KIEN}}.
{{MO_TA_TINH_THAN_SU_KIEN}}
Keep the studio background plain.

QUALITY
Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.
Generate the image.
```

### 5.3. Giải thích các biến

| Biến                             | Nội dung cần điền                                                           |
| -------------------------------- | --------------------------------------------------------------------------- |
| `TEN_TRANG_PHUC`                 | Tên trang phục, ví dụ `a Vietnamese áo dài`                                 |
| `MO_TA_CAU_TRUC_TRANG_PHUC`      | Cổ áo, tay áo, thân áo, tà áo, cách mặc và các chi tiết cần thấy rõ         |
| `MO_TA_KHUNG_HINH`               | Yêu cầu thấy trọn người, bàn chân và phụ kiện; có khoảng trống trên và dưới |
| `TEN_MAU_CHINH`                  | Tên màu chính                                                               |
| `HEX_MAU_CHINH`                  | Mã HEX tham chiếu của màu chính                                             |
| `VI_TRI_MAU_CHINH`               | Bộ phận hoặc diện tích trang phục sử dụng màu chính                         |
| `TEN_MAU_PHU`                    | Tên màu phụ                                                                 |
| `HEX_MAU_PHU`                    | Mã HEX tham chiếu của màu phụ                                               |
| `VI_TRI_MAU_PHU`                 | Bộ phận sử dụng màu phụ, ví dụ viền cổ và viền túi                          |
| `MO_TA_TRANG_PHUC_DI_KEM`        | Quần, váy hoặc lớp mặc bên trong và màu tương ứng                           |
| `MO_TA_PHU_KIEN_HOAC_THANH_PHAN` | Loại, vật liệu, hình dạng, vị trí và cách sử dụng phụ kiện hoặc thành phần  |
| `QUY_TAC_TAY_VA_PHU_KIEN_KHAC`   | Tay nào cầm phụ kiện; tay còn lại làm gì; những phụ kiện không được thêm    |
| `TEN_SU_KIEN`                    | Tên sự kiện                                                                 |
| `MO_TA_TINH_THAN_SU_KIEN`        | Không khí cần thể hiện qua trang phục và cách trình bày                     |

Ví dụ cho trường hợp không chọn phụ kiện:

```text
No selected accessories.
Do not add a hat, headwear, hair ornaments, scarf, jewelry, bag,
fan, or any handheld item.
Keep both hands empty.
Use plain simple shoes.
```

Khuôn này cần được kiểm thử trước khi chọn làm prompt dùng chung. Không mặc định rằng nó đã đạt chỉ vì các phần riêng lẻ từng xuất hiện trong những ca thử trước.

## 6. T01 — Áo dài, Đỏ son, Vàng nhũ, Nón lá, Tết

### 6.1. Prompt T01 v1

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old,
standing naturally and facing the camera.

Use a vertical 2:3 composition.
Show the entire person from the top of the hat to both feet.
Leave empty space above the hat and below the feet.
Use a plain light-gray studio background with soft, even lighting.

The model wears a Vietnamese áo dài:
a high collar, long sleeves, and a long tunic with two flowing panels
over full-length trousers.
Keep these garment features clearly visible.
Create a restrained modern remix through colors and fabric finish.

Main color: Đỏ son, approximate reference #A73B2C.
Apply this red color to most of the outer tunic.

Accent color: Vàng nhũ, approximate reference #C9A227.
Use this golden color sparingly on narrow decorative trim.
Use plain ivory trousers as a supporting neutral garment.

Selected accessory:
one Vietnamese conical palm-leaf hat, “nón lá”, worn on the head.
Show the complete hat inside the image.
Keep both hands empty.
Do not add bags, fans, scarves, or jewelry.

Occasion: Tết.
Express a festive mood through the outfit.
Keep the background plain without additional decorations.

Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.

Generate the image.
```

### 6.2. Ảnh thử nghiệm

- `d1-tests/D1_T01_v1_lan1.jpg`
- `d1-tests/D1_T01_v1_lan2.jpg`

### 6.3. Ghi nhận

Hai ảnh đáp ứng các tiêu chí quan sát đã dùng trong báo cáo D1.

T01 v1 có thể được giữ làm bản tham chiếu cho tổ hợp này. Kết quả chưa xác nhận độ khớp HEX hoặc tính chính xác lịch sử của toàn bộ chi tiết trang phục.

## 7. T02 — Áo tứ thân, Lam chàm, Trắng ngà, Nón quai thao, Lễ hội

### 7.1. Prompt T02 v1

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old.
Her torso and shoulders face directly toward the camera.
Use a relaxed upright standing pose.

Use a vertical 2:3 composition.
Show the entire person, the complete hat, and both feet.
Leave empty space above the hat and below the feet.
Use a plain light-gray studio background with soft, even lighting.

OUTFIT
The model wears an áo tứ thân ensemble.

For this design, use a long-sleeved outer garment constructed
with two separate front panels and two joined back panels.
The front is open above the waist, showing an opaque yếm bodice.
Tie the two front panels together at the waist,
leaving their long ends visible.

Pair the outer garment with a plain long dark skirt.
Keep the separate outer panels and inner skirt visually distinct.
Create a restrained modern remix through colors and fabric finish.

COLORS
Main color: Lam chàm, approximate reference #33415C.
Apply this dark indigo-blue color to the outer garment.

Accent color: Trắng ngà, approximate reference #F1E7D2.
Apply this ivory color to the visible yếm bodice.
Use a plain near-black skirt as a supporting neutral garment.

ACCESSORY
One nón quai thao:
a broad, round, flat palm-leaf hat with long silk straps.
Wear it on the head and show the entire hat inside the image.
Keep the face visible.
Make the hat broad and flat, without a pointed conical crown.

Keep both hands relaxed and empty.
Do not add a fan, bag, scarf, hair ornaments, or jewelry.
Use plain simple shoes.

OCCASION
Lễ hội.
Create a composed festival fashion presentation.
Keep the studio background plain.

QUALITY
Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.
Generate the image.
```

### 7.2. Thay đổi để tạo T02 v2

Lấy toàn bộ T02 v1 ở trên.

Thay phần từ `OUTFIT` đến hết câu:

`Create a restrained modern remix through colors and fabric finish.`

ngay trước `COLORS` bằng đoạn sau. Giữ nguyên các phần còn lại; không thêm đoạn mới vào cuối prompt.

```text
OUTFIT
The model wears an áo tứ thân ensemble.

Use a long-sleeved outer garment with two separate front panels
and two joined back panels.
The outer garment remains open above the waist.
Tie its two front panels together at the waist,
leaving their long ends clearly visible.

Under the outer garment, show an opaque ivory yếm:
a separate traditional front bodice secured by narrow neck ties.
Its upper edge has a small V-shaped neckline.
It is not a round-neck shirt, T-shirt, or blouse.
Keep the chest fully covered by the yếm.
The outer garment covers the shoulders and arms.

Pair the outfit with a plain long near-black skirt.
Keep the outer panels and inner skirt visually distinct.
Create a restrained modern remix through colors and fabric finish.
```

Mục đích thay đổi: mô tả yếm rõ hơn để giảm việc model tạo một áo cổ tròn bên trong.

Cổ chữ V ở đây là yêu cầu thiết kế của ca thử, không phải kết luận rằng mọi loại yếm đều phải có cấu trúc này.

### 7.3. Ảnh thử nghiệm

- `d1-tests/D1_T02_v1_lan1.jpg`
- `d1-tests/D1_T02_v1_lan2.jpg`
- `d1-tests/D1_T02_v2_lan1.jpg`

### 7.4. Ghi nhận

- v1: phần bên trong có xu hướng giống áo cổ tròn, chưa thể hiện đúng yêu cầu về yếm.
- v2: phần cổ yếm tiến gần hơn đến yêu cầu nhưng hình dạng nón có chóp, chưa đáp ứng yêu cầu nón rộng và phẳng.
- v2 mới có một lượt chạy hợp lệ, chưa đủ để kết luận ổn định.
- T02 chưa được chốt là đạt toàn bộ tiêu chí.

## 8. T03 — Áo bà ba, Lục ngọc, Be pastel, Khăn rằn, Đi học và dạo phố

### 8.1. Prompt T03 v1

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old.
Her torso, shoulders, and hips face directly toward the camera.
Use a relaxed upright standing pose.

Use a vertical 2:3 composition.
Show the entire person from the top of the head to both feet.
Leave empty space above the head and below the feet.
Use a plain light-gray studio background with soft, even lighting.

OUTFIT
The model wears an áo bà ba outfit.
For this design, use a hip-length long-sleeved blouse,
a simple round neckline without a standing collar,
a vertical row of small buttons down the center front,
and two small lower-front pockets.
Pair it with separate full-length trousers.
Keep the blouse short enough to show the trousers clearly.

Create a restrained modern remix through colors and fabric finish.

COLORS
Main color: Lục ngọc, approximate reference #3F6B52.
Apply this muted green color to most of the blouse.

Accent color: Be pastel, approximate reference #E4D3B4.
Use it for narrow trim around the neckline and pocket edges.
Use plain dark trousers as a supporting neutral garment.

ACCESSORY
One khăn rằn: a soft black-and-white checkered woven scarf
draped loosely around the neck.
Show both scarf ends resting on the upper chest.
Keep the lower-front pockets visible.
Do not wrap the scarf around the head.

Keep both hands relaxed and empty.
Do not add hats, bags, fans, hair ornaments, or jewelry.
Use plain simple shoes.

OCCASION
Đi học, dạo phố.
Create a comfortable everyday fashion presentation.
Keep the studio background plain.

QUALITY
Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.
Generate the image.
```

### 8.2. Thay đổi để tạo T03 v2

Lấy toàn bộ T03 v1.

Thay phần từ `ACCESSORY` đến hết câu `Use plain simple shoes.` bằng đoạn sau. Giữ nguyên các phần còn lại.

```text
ACCESSORY
One short khăn rằn:
a soft black-and-white checkered woven scarf
draped loosely around the neck.

Both scarf ends stop at the upper chest,
clearly above the waist and above both pocket openings.
Keep both lower-front pockets and their beige trim fully visible.
Do not let the scarf extend down to the pockets or hips.
Do not wrap the scarf around the head.

Keep both hands relaxed and empty.
Do not add hats, bags, fans, hair ornaments, or jewelry.
Use plain simple shoes.
```

Mục đích thay đổi: làm khăn ngắn hơn và giữ hai túi trước cùng viền màu be nhìn thấy rõ.

### 8.3. Ảnh thử nghiệm

- `d1-tests/D1_T03_v1_lan1.jpg`
- `d1-tests/D1_T03_v1_lan2.jpg`
- `d1-tests/D1_T03_v2_lan1.jpg`

### 8.4. Ghi nhận

- v1: khăn kéo dài xuống vùng hông và che chi tiết túi.
- v2: hai túi nhìn thấy rõ hơn nhưng chưa thể hiện đầy đủ hai đầu khăn cùng dừng ở ngực trên.
- v2 mới có một lượt chạy hợp lệ.
- T03 cần tiếp tục kiểm tra cách rủ khăn và độ ổn định giữa các lần chạy.

## 9. T04 — Áo dài, Tím Huế, Đen huyền, Quạt giấy, Chụp ảnh nghệ thuật

### 9.1. Prompt T04 v2

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old.
Her torso, shoulders, and hips face directly toward the camera.
Use a relaxed upright standing pose without turning sideways.

Use a vertical 2:3 composition.
Show the entire person from the top of the head to both feet,
including the complete selected accessory.
Leave empty space above the head and below the feet.
Use a plain light-gray studio background with soft, even lighting.

The model wears a Vietnamese áo dài:
a high collar, long sleeves, and a long tunic with two flowing panels
over full-length trousers.
Preserve these garment features.
Create a restrained modern remix through colors and fabric finish.

Main color: Tím Huế, approximate reference #6B4C6E.
Apply this purple color to most of the outer tunic.

Accent color: Đen huyền, approximate reference #241F1B.
Use it sparingly on narrow decorative trim.
Use plain ivory trousers as a supporting neutral garment.

Selected accessory:
one open folding paper fan, “quạt giấy”.
Hold it in one hand beside the waist.
Show the complete fan clearly without covering the face
or the central front of the outfit.
Keep the other hand relaxed and empty.
Do not add hats, headwear, scarves, bags, or jewelry.
Use plain simple shoes.

Occasion: Chụp ảnh nghệ thuật.
Create an elegant fashion presentation while keeping the background plain.

Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.

Generate the image.
```

### 9.2. Thay đổi để tạo T04 v3

Lấy toàn bộ T04 v2.

Thay phần từ `Selected accessory:` đến hết câu `Use plain simple shoes.` bằng đoạn sau. Giữ nguyên các phần còn lại.

```text
Selected accessory:
one open folding paper fan, “quạt giấy”.

The fan has a continuous opaque ivory paper surface
attached to thin bamboo ribs.
The paper surface is solid, without holes or lace-like cutouts.

Hold the fan in the model's right hand,
on the viewer's left side, beside the right hip.
Keep the entire fan outside the outer silhouette of the torso.
The fan must not overlap the chest, abdomen, or central front panel
of the áo dài.
Show the entire fan inside the image.

Keep the other hand relaxed and empty.
Do not add hats, headwear, scarves, bags, or jewelry.
Use plain simple shoes.
```

Mục đích thay đổi:

- Mô tả mặt quạt bằng giấy kín để giảm việc tạo quạt dạng đục lỗ.
- Quy định tay phải của người mẫu, tương ứng phía trái của người xem.
- Đưa quạt ra ngoài đường bao thân người để tránh che áo.

### 9.3. Ảnh thử nghiệm hợp lệ

- `d1-tests/D1_T04_v2_lan1.jpg`
- `d1-tests/D1_T04_v2_lan2.jpg`
- `d1-tests/D1_T04_v3_lan1.jpg`
- `d1-tests/D1_T04_v3_lan2.jpg`

Ảnh `D1_T04_v3_lan1.jpg` trong bộ bàn giao phải là ảnh của lượt chạy lại bằng prompt đầy đủ.

Lượt chạy ban đầu bị nhập sai hoặc thiếu prompt không được dùng để kết luận chất lượng T04 v3.

### 9.4. Ghi nhận

- v2: có lượt tạo quạt che vùng giữa thân người; mặt quạt chưa thể hiện đúng yêu cầu giấy kín.
- v3: mặt quạt tiến gần hơn đến yêu cầu nhưng vị trí vẫn chồng lên một phần thân người.
- Một lượt v3 chưa tuân thủ đúng tay cầm quạt.
- T04 chưa đạt toàn bộ yêu cầu về vị trí và tay cầm.

### 9.5. T04 v4

v4 từng được đề xuất để tiếp tục làm rõ yêu cầu màu sắc và trang phục đi kèm.

Chưa có lượt chạy v4 được xác nhận trong bộ dữ liệu này. Vì vậy:

- Không ghi v4 là phiên bản đã thử.
- Không gán ảnh v3 cho v4.
- Không chọn v4 làm phiên bản đã đạt.
- Chỉ bổ sung prompt v4 và kết quả khi có nội dung đầu vào cùng ảnh đầu ra tương ứng.

## 10. T05 — Áo tứ thân, Hồng đào, Nâu non, Yếm đào, Cưới hỏi

### 10.1. Prompt T05 v1

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old.
Her torso and shoulders face directly toward the camera.
Use a relaxed upright standing pose.

Use a vertical 2:3 composition.
Show the entire person from the top of the head to both feet.
Leave empty space above the head and below the feet.
Use a plain light-gray studio background with soft, even lighting.

OUTFIT
The model wears an áo tứ thân ensemble.

For this design, use a long-sleeved outer garment
with two separate front panels and two joined back panels.
Keep the front open above the waist to show the yếm.
Tie the two front panels together at the waist,
leaving their long ends clearly visible.

Pair the outfit with a separate plain long near-black skirt.
Keep the outer panels and skirt visually distinct.

COLORS
Main color: Hồng đào, approximate reference #E3A2A0.
Apply this muted peach-pink color to most of the outer garment.

Accent color: Nâu non, approximate reference #8A6642.
Use this brown color sparingly on narrow outer-garment edging.

SELECTED COMPONENT
Yếm đào:
an opaque peach-pink front bodice worn under the outer garment,
with a small V-shaped neckline and narrow neck ties.
Keep its upper front clearly visible.
It is a separate bodice, not a round-neck shirt or blouse.
Keep the chest fully covered.
Use a slightly deeper peach-pink shade for the yếm
so it remains visually distinct from the outer garment.

Keep both hands relaxed and empty.
Do not add hats, headwear, scarves, fans, bags, or jewelry.
Use plain simple shoes.

OCCASION
Cưới hỏi.
Create a restrained, elegant fashion remix through fabric finish.
Keep the studio background plain without wedding decorations.

QUALITY
Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.
Generate the image.
```

### 10.2. Ảnh thử nghiệm

- `d1-tests/D1_T05_v1_lan1.jpg`
- `d1-tests/D1_T05_v1_lan2.jpg`

### 10.3. Ghi nhận

- Phần yếm có xu hướng thành cổ tròn, chưa theo thiết kế cổ chữ V đã yêu cầu.
- Chiều dài và cấu trúc áo ngoài khác nhau giữa hai lượt.
- T05 chưa đạt toàn bộ tiêu chí.
- Chưa có T05 v2 được xác nhận.
- Chưa thẩm định mức độ phù hợp văn hóa của thiết kế cho sự kiện cưới hỏi.

Trong ca thử này, yếm đào được mô tả là một thành phần mặc bên trong. Cần giữ rõ cách hiểu này khi ánh xạ sang dữ liệu ứng dụng.

## 11. T06 — Áo dài, Đỏ son, Vàng nhũ, Không phụ kiện, Tết

### 11.1. Prompt T06 v1

```text
Generate one photorealistic full-body fashion image for the project
“Việt phục – Remix”.

Show one adult Vietnamese female model, approximately 25 years old,
standing naturally and facing the camera.

Use a vertical 2:3 composition.
Show the entire person from the top of the head to both feet.
Leave empty space above the head and below the feet.
Use a plain light-gray studio background with soft, even lighting.

The model wears a Vietnamese áo dài:
a high collar, long sleeves, and a long tunic with two flowing panels
over full-length trousers.
Keep these garment features clearly visible.
Create a restrained modern remix through colors and fabric finish.

Main color: Đỏ son, approximate reference #A73B2C.
Apply this red color to most of the outer tunic.

Accent color: Vàng nhũ, approximate reference #C9A227.
Use this golden color sparingly on narrow decorative trim.
Use plain ivory trousers as a supporting neutral garment.

No selected accessories.
Do not add a hat, headwear, hair ornaments, scarf, jewelry, bag,
fan, or any handheld item.
Keep both hands empty.
Use plain simple shoes.

Occasion: Tết.
Express a festive mood through the outfit.
Keep the background plain without additional decorations.

Show realistic fabric and natural human anatomy.
Do not add captions, lettering, brand logos, or a collage.

Generate the image.
```

### 11.2. Ảnh thử nghiệm

- `d1-tests/D1_T06_v1_lan1.jpg`
- `d1-tests/D1_T06_v1_lan2.jpg`

### 11.3. Ghi nhận

- Một lượt có chi tiết quanh tai chưa đủ rõ để phân biệt tóc và phụ kiện.
- Một lượt tạo tư thế nghiêng dù prompt yêu cầu nhìn về phía camera.
- Không kết luận chắc chắn có trang sức chỉ từ chi tiết ảnh chưa rõ.
- T06 cần tiếp tục kiểm tra tư thế chính diện và việc không tự thêm phụ kiện.

## 12. Trạng thái chọn phiên bản

| Ca thử | Phiên bản tham chiếu cho lượt tiếp theo | Trạng thái                                                |
| ------ | --------------------------------------- | --------------------------------------------------------- |
| T01    | v1                                      | Đạt các tiêu chí quan sát đã dùng; giữ làm bản tham chiếu |
| T02    | v2                                      | Cần sửa hình dạng nón và kiểm tra lại yếm                 |
| T03    | v2                                      | Cần kiểm tra hai đầu khăn và độ ổn định                   |
| T04    | v3                                      | Cần sửa vị trí quạt và tuân thủ tay cầm                   |
| T05    | v1                                      | Cần sửa cấu trúc yếm và độ ổn định áo ngoài               |
| T06    | v1                                      | Cần làm rõ tư thế chính diện và không thêm phụ kiện       |

“Phiên bản tham chiếu” là điểm bắt đầu cho lần sửa tiếp theo, không đồng nghĩa với phiên bản đã đủ điều kiện dùng trong sản phẩm.

Chưa có một prompt dùng chung được xác nhận đạt cho toàn bộ sáu ca thử.

## 13. Cách chạy lại và quản lý phiên bản

1. Chọn đúng ca thử và phiên bản.
2. Với T02 v2, T03 v2 hoặc T04 v3, tạo prompt đầy đủ bằng cách thay đúng đoạn trong bản gốc.
3. Mở cuộc trò chuyện mới để kiểm tra độc lập.
4. Giữ cấu hình thử nghiệm giống mục 3.
5. Dán toàn bộ prompt; kiểm tra tên trang phục, màu, phụ kiện và sự kiện.
6. Không đính kèm ảnh đầu ra cũ nếu đang đánh giá tạo ảnh chỉ từ văn bản.
7. Chạy và lưu ảnh với tên tương ứng.
8. Ghi kết quả thực tế vào `d1-ket-qua-test.md`.
9. Khi sửa nội dung prompt, tăng phiên bản của riêng ca thử đó.
10. Giữ lại ảnh và prompt cũ để so sánh.

Quy tắc tên ảnh:

```text
D1_T{ma_ca_thu}_v{phien_ban}_lan{so_lan}.jpg
```

Ví dụ:

```text
D1_T02_v2_lan1.jpg
D1_T04_v3_lan2.jpg
```

Nếu chạy sai đầu vào:

- Ghi rõ lượt chạy sai.
- Không tính ảnh đó vào kết quả của phiên bản dự kiến.
- Chạy lại với prompt đầy đủ.
- Bảo đảm tên ảnh trong bộ bàn giao trỏ đến lượt chạy hợp lệ.

## 14. Bàn giao để tích hợp backend

### 14.1. Các trường đầu vào đã ghi nhận

| Trường              | Vai trò trong prompt                                      |
| ------------------- | --------------------------------------------------------- |
| `tenTrangPhuc`      | Chọn loại trang phục                                      |
| `vungMienTrangPhuc` | Bổ sung bối cảnh vùng miền khi có dữ liệu được kiểm duyệt |
| `tenMauChinh`       | Tên màu chính                                             |
| `hexMauChinh`       | Mã màu chính tham chiếu                                   |
| `tenMauPhu`         | Tên màu phụ                                               |
| `hexMauPhu`         | Mã màu phụ tham chiếu                                     |
| `tenPhuKien`        | Chọn phụ kiện hoặc xử lý trường hợp không có phụ kiện     |
| `tenSuKien`         | Chọn sự kiện                                              |

Các ca thử trong tài liệu này chưa kiểm tra riêng ảnh hưởng của trường `vungMienTrangPhuc`.

### 14.2. Các quy tắc cần ánh xạ thêm

Chỉ tên trang phục và tên phụ kiện chưa biểu đạt đầy đủ các yêu cầu đã dùng trong thử nghiệm.

Khi tích hợp, cần ánh xạ thêm:

- Mô tả cấu trúc của từng loại trang phục.
- Vị trí áp dụng màu chính và màu phụ.
- Quần, váy hoặc lớp mặc bên trong.
- Hình dạng và vật liệu của phụ kiện.
- Vị trí phụ kiện và tay cầm.
- Cách xử lý trường hợp không chọn phụ kiện.
- Cách phân biệt phụ kiện với thành phần mặc bên trong, như yếm.

Đây là các yêu cầu bàn giao, chưa phải xác nhận rằng backend đã triển khai đầy đủ.

### 14.3. Khác biệt model cần kiểm thử

Trong lần kiểm tra mã nguồn ngày 01/10/2026, `lib/aiSinhAnh.ts` sử dụng Cloudflare với:

- Model tạo ảnh: `@cf/black-forest-labs/flux-1-schnell`.
- Model văn bản: `@cf/meta/llama-3.1-8b-instruct`.

Các thử nghiệm D1 trong tài liệu này được thực hiện bằng `gemini-3-pro-image`.

Do đó, kết quả D1 xác nhận hành vi đã quan sát trên model thử nghiệm trong Google AI Studio. Cần chạy lại các tổ hợp trên model tạo ảnh thực tế của backend trước khi quyết định sử dụng trong sản phẩm.

## 15. Nội dung đã bàn giao

- Prompt gốc của sáu ca thử.
- Các đoạn thay thế để tái tạo T02 v2, T03 v2 và T04 v3.
- Cấu hình thử nghiệm.
- Danh sách 16 ảnh hợp lệ.
- Trạng thái và điểm cần sửa của từng ca.
- Khuôn prompt tổng hợp để tiếp tục thử nghiệm.
- Yêu cầu ánh xạ dữ liệu và kiểm thử trên backend.

Chi tiết chấm điểm, nhận xét từng ảnh và thống kê kết quả được lưu trong `d1-ket-qua-test.md`.
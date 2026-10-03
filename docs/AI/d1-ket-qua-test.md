# D1 — Báo cáo kết quả kiểm thử prompt tạo ảnh

## 1. Thông tin chung

- **Dự án:** Việt phục – Remix.
- **Nhiệm vụ:** D1 — Viết và kiểm thử prompt trong Google AI Studio.
- **Ngày chạy các lượt thử:** 01/10/2026.
- **Ngày tổng hợp báo cáo:** 03/10/2026.
- **Nền tảng:** Google AI Studio — Playground.
- **Model:** Nano Banana Pro — `gemini-3-pro-image`.
- **Phong cách đầu ra:** Ảnh thời trang chân thực, toàn thân, nền studio đơn giản.
- **Tài liệu prompt:** [d1-prompt-tao-anh.md](./d1-prompt-tao-anh.md).
- **Thư mục ảnh:** `./d1-tests/`.

### Thiết lập chạy

| Thiết lập                    | Giá trị                     |
| ---------------------------- | --------------------------- |
| Temperature                  | 1                           |
| Aspect ratio                 | 2:3                         |
| Resolution                   | 1K                          |
| Grounding with Google Search | Tắt                         |
| System instructions          | Để trống theo quy trình thử |
| Các thiết lập khác           | Giữ mặc định                |

Thiết lập được ghi theo quy trình thực hiện và các ảnh chụp màn hình đã cung cấp. Không phải mọi lượt đều có ảnh chụp màn hình riêng để đối chiếu toàn bộ tham số.

## 2. Mục tiêu và phương pháp

Kiểm tra khả năng model thực hiện các yêu cầu:

1. Thể hiện trang phục theo mô tả thiết kế.
2. Phân biệt màu chính, màu phụ và màu hỗ trợ.
3. Thể hiện đúng phụ kiện hoặc thành phần được chọn.
4. Giữ vị trí phụ kiện và không tự thêm phụ kiện.
5. Tạo ảnh toàn thân, tư thế chính diện, không cắt phần quan trọng.
6. Giữ hình thể tự nhiên, phong cách chân thực và nền đơn giản.

Mỗi ca được chạy trong prompt mới theo hướng dẫn, không đính kèm ảnh đầu ra cũ. Các phiên bản được giữ riêng để theo dõi thay đổi.

Các lượt cùng phiên bản được so sánh để quan sát mức nhất quán. Hai lượt thử chỉ cung cấp bằng chứng ban đầu, không đủ để xác định tỷ lệ thành công ổn định của model.

Đánh giá trong báo cáo dựa trên ảnh đã cung cấp và mức bám mô tả. Báo cáo không xác nhận độ chính xác lịch sử, cấu tạo may hoặc mức phù hợp văn hóa của toàn bộ trang phục.

## 3. Danh sách ca thử

| Mã  | Trang phục | Màu chính          | Màu phụ             | Phụ kiện/thành phần chọn | Dịp                 |
| --- | ---------- | ------------------ | ------------------- | ------------------------ | ------------------- |
| T01 | Áo dài     | Đỏ son `#A73B2C`   | Vàng nhũ `#C9A227`  | Nón lá                   | Tết                 |
| T02 | Áo tứ thân | Lam chàm `#33415C` | Trắng ngà `#F1E7D2` | Nón quai thao            | Lễ hội              |
| T03 | Áo bà ba   | Lục ngọc `#3F6B52` | Be pastel `#E4D3B4` | Khăn rằn                 | Đi học, dạo phố     |
| T04 | Áo dài     | Tím Huế `#6B4C6E`  | Đen huyền `#241F1B` | Quạt giấy                | Chụp ảnh nghệ thuật |
| T05 | Áo tứ thân | Hồng đào `#E3A2A0` | Nâu non `#8A6642`   | Yếm đào                  | Cưới hỏi            |
| T06 | Áo dài     | Đỏ son `#A73B2C`   | Vàng nhũ `#C9A227`  | Không có                 | Tết                 |

### Quy ước đầu vào

- Mã HEX là màu tham chiếu gần đúng; không đánh giá theo yêu cầu mọi pixel phải trùng HEX.
- Áo dài được yêu cầu phối quần trắng ngà.
- Áo bà ba được yêu cầu phối quần tối màu.
- Áo tứ thân được yêu cầu phối váy tối màu.
- Yếm được xem là thành phần mặc bên trong, dù danh mục ứng dụng có thể xếp vào phụ kiện.
- Việc chọn dịp trong ca thử không mặc nhiên xác nhận tổ hợp phù hợp văn hóa với dịp đó.

## 4. Tiêu chí đánh giá

### Thang điểm

| Mã  | Tiêu chí                 | 0 điểm                            | 1 điểm                                                     | 2 điểm                                       |
| --- | ------------------------ | --------------------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| TP  | Trang phục               | Sai rõ ràng                       | Đạt một phần hoặc chưa xác minh được chi tiết yêu cầu      | Bám các đặc điểm quan sát được               |
| MS  | Màu sắc                  | Sai rõ hoặc đảo màu               | Gần đúng nhưng thiếu điểm nhấn quan trọng                  | Phân biệt rõ màu chính và phụ                |
| PK  | Phụ kiện/thành phần chọn | Thiếu hoặc sai rõ                 | Đúng một phần; sai vị trí, cách thể hiện hoặc còn nghi vấn | Bám loại, vị trí và cách thể hiện yêu cầu    |
| KH  | Khung hình và tư thế     | Cắt phần quan trọng hoặc lệch lớn | Toàn thân nhưng chưa đúng tư thế                           | Toàn thân, chính diện, bố cục đúng           |
| HT  | Hình thể                 | Lỗi lớn rõ ràng                   | Có lỗi nhỏ hoặc chi tiết cần kiểm tra                      | Không thấy lỗi lớn rõ ràng                   |
| PC  | Phong cách và trình bày  | Lệch yêu cầu rõ                   | Đạt một phần                                               | Chân thực, nền đơn giản, không thấy chữ/logo |

Điểm trong bảng dưới được tổng hợp lại sau khi xem toàn bộ kết quả, theo cùng thang đánh giá. Đây là đánh giá định tính của người kiểm tra, không phải số đo tự động.

### Trạng thái kết quả

- **Đạt về thị giác:** Không phát hiện sai lệch rõ ở các yêu cầu chính quan sát được.
- **Đạt một phần:** Có yêu cầu chưa thực hiện đúng hoặc chi tiết chưa xác định chắc chắn.
- **Cần duyệt nội dung:** Cần đối chiếu tài liệu E1 và ảnh tham chiếu trước khi xác nhận trang phục.
- **Loại khỏi đánh giá prompt:** Đầu vào bị nhập sai hoặc thiếu, không đại diện cho phiên bản dự kiến.

Tổng điểm không thay thế việc kiểm tra từng yêu cầu. Ảnh có điểm cao vẫn có thể chỉ đạt một phần nếu sai yêu cầu cụ thể.

Điểm TP = 2 không đồng nghĩa với xác nhận chính xác lịch sử hoặc toàn bộ cấu trúc may.

## 5. Bảng kết quả tất cả lượt thử hợp lệ

|  STT | Ca  | Phiên bản | Lượt      |   TP |   MS |   PK |   KH |   HT |   PC |  Tổng | Kết luận                            |
| ---: | --- | --------- | --------- | ---: | ---: | ---: | ---: | ---: | ---: | ----: | ----------------------------------- |
|    1 | T01 | v1        | 1         |    2 |    2 |    2 |    2 |    2 |    2 | 12/12 | Đạt về thị giác                     |
|    2 | T01 | v1        | 2         |    2 |    2 |    2 |    2 |    2 |    2 | 12/12 | Đạt về thị giác                     |
|    3 | T02 | v1        | 1         |    1 |    2 |    1 |    2 |    2 |    2 | 10/12 | Đạt một phần; cần duyệt nội dung    |
|    4 | T02 | v1        | 2         |    1 |    2 |    1 |    2 |    2 |    2 | 10/12 | Đạt một phần; cần duyệt nội dung    |
|    5 | T02 | v2        | 1         |    1 |    2 |    1 |    2 |    2 |    2 | 10/12 | Đạt một phần; cần duyệt nội dung    |
|    6 | T03 | v1        | 1         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|    7 | T03 | v1        | 2         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|    8 | T03 | v2        | 1         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|    9 | T04 | v2        | 1         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần; còn nghi vấn vùng tai |
|   10 | T04 | v2        | 2         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|   11 | T04 | v3        | 1 làm lại |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|   12 | T04 | v3        | 2         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần                        |
|   13 | T05 | v1        | 1         |    1 |    2 |    1 |    2 |    2 |    2 | 10/12 | Đạt một phần; cần duyệt nội dung    |
|   14 | T05 | v1        | 2         |    1 |    2 |    1 |    2 |    2 |    2 | 10/12 | Đạt một phần; cần duyệt nội dung    |
|   15 | T06 | v1        | 1         |    2 |    2 |    1 |    2 |    2 |    2 | 11/12 | Đạt một phần; còn nghi vấn vùng tai |
|   16 | T06 | v1        | 2         |    2 |    2 |    2 |    1 |    2 |    2 | 11/12 | Đạt một phần do lệch tư thế         |

Không chấm điểm lượt T04 nhập sai prompt. Lượt này được ghi riêng tại mục 7.

## 6. Nhận xét chi tiết từng ca

### 6.1. T01 — Áo dài, nón lá

#### v1 — Lần 1

- Áo dài đỏ chủ đạo, cổ đứng, tay dài.
- Viền vàng ở cổ, cổ tay và tà áo.
- Quần trắng ngà đúng mô tả.
- Nón lá đội trên đầu, hiện đầy đủ.
- Toàn thân không bị cắt.
- Không thấy phụ kiện thừa hoặc lỗi hình thể lớn rõ ràng.
- Góc chính diện chưa cho thấy rõ cấu trúc hai tà.

**Kết luận:** Đạt về thị giác, 12/12.

**Ảnh:** [D1_T01_v1_lan1.jpg](./d1-tests/D1_T01_v1_lan1.jpg)

#### v1 — Lần 2

- Giữ áo đỏ, viền vàng, quần ngà và nón lá.
- Người mẫu lớn hơn trong khung hình so với lần 1.
- Khuôn mặt, chất liệu và nếp vải khác lần 1.
- Các yêu cầu thị giác chính vẫn được giữ.
- Không thấy lỗi hình thể lớn rõ ràng.

**Kết luận:** Đạt về thị giác, 12/12.

**Ảnh:** [D1_T01_v1_lan2.jpg](./d1-tests/D1_T01_v1_lan2.jpg)

**Kết luận ca T01:** Hai lượt nhất quán ở các yếu tố chính. Giữ v1 làm bản tham khảo cho ca áo dài có nón lá.

### 6.2. T02 — Áo tứ thân, nón quai thao

#### v1 — Lần 1

- Áo ngoài lam chàm, lớp trong ngà, váy tối.
- Hai vạt trước buộc eo và thả dài.
- Lớp trong giống áo cổ tròn, chưa thể hiện rõ yếm.
- Nón rộng, phẳng và có quai dài.
- Phần đen quanh đầu chưa phân biệt chắc chắn tóc hay khăn/mấn.
- Không kiểm tra được cấu trúc thân sau từ góc chính diện.

**Kết luận:** Đạt một phần; cần duyệt nội dung, 10/12.

**Ảnh:** [D1_T02_v1_lan1.jpg](./d1-tests/D1_T02_v1_lan1.jpg)

#### v1 — Lần 2

- Phối màu và bố cục tương tự lần 1.
- Lớp ngà vẫn có hình thức áo cổ tròn.
- Nón rộng, phẳng, quai dài.
- Chi tiết quanh đầu và cấu trúc áo vẫn cần đối chiếu tham chiếu.

**Kết luận:** Đạt một phần; cần duyệt nội dung, 10/12.

**Ảnh:** [D1_T02_v1_lan2.jpg](./d1-tests/D1_T02_v1_lan2.jpg)

#### v2 — Lần 1

- Đã bổ sung mô tả yếm riêng, dây cổ và cổ chữ V.
- Ảnh thể hiện cổ chữ V và dây cổ rõ hơn v1.
- Giữ phối màu lam chàm–ngà và váy tối.
- Nón xuất hiện chóp nhô lên, lệch yêu cầu nón phẳng.
- Có dây ngà buộc trước bụng không được chỉ định.
- Chưa xác nhận toàn bộ cấu trúc áo và nón đúng văn hóa.

**Kết luận:** Đạt một phần; cần duyệt nội dung, 10/12.

**Ảnh:** [D1_T02_v2_lan1.jpg](./d1-tests/D1_T02_v2_lan1.jpg)

**Kết luận ca T02:** v2 cụ thể hóa yếm tốt hơn, nhưng chưa đủ để duyệt toàn bộ ảnh. Giữ cả hai phiên bản làm bằng chứng; cần ảnh tham chiếu được nhóm duyệt.

### 6.3. T03 — Áo bà ba, khăn rằn

#### v1 — Lần 1

- Áo ngang hông, tay dài, cổ tròn, hàng nút giữa.
- Xanh chủ đạo, điểm nhấn be.
- Quần tối, hai ống rõ.
- Khăn caro đen–trắng quanh cổ.
- Hai đầu khăn quá dài, kéo xuống gần hông và che một phần hai túi.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh:** [D1_T03_v1_lan1.jpg](./d1-tests/D1_T03_v1_lan1.jpg)

#### v1 — Lần 2

- Giữ dáng áo, màu chính và quần tối.
- Khăn tiếp tục quá dài và che túi.
- Viền be cổ tay không rõ như lần 1; cổ và miệng túi vẫn có điểm nhấn be.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh:** [D1_T03_v1_lan2.jpg](./d1-tests/D1_T03_v1_lan2.jpg)

#### v2 — Lần 1

- Bổ sung yêu cầu khăn ngắn, đầu khăn dừng ở ngực trên và không che túi.
- Hai túi đã hiện đầy đủ.
- Chỉ thấy một đầu khăn buông xuống.
- Đầu khăn vẫn dài tới giữa thân áo, chưa đúng yêu cầu cả hai đầu dừng ở ngực trên.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh:** [D1_T03_v2_lan1.jpg](./d1-tests/D1_T03_v2_lan1.jpg)

**Kết luận ca T03:** Ưu tiên v2 làm bản tiếp tục chỉnh vì đã giải quyết việc che túi. Cách quàng và độ dài khăn chưa đạt đầy đủ.

### 6.4. T04 — Áo dài, quạt giấy

#### v2 — Lần 1

- Áo tím, viền đen, quần ngà đúng mô tả.
- Người mẫu chính diện.
- Quạt giấy mở, cầm bằng một tay ở cạnh eo–hông.
- Quạt che một phần áo bên cạnh, không che phần giữa.
- Đường mảnh cạnh tai chưa phân biệt chắc chắn tóc mai hay khuyên tai.

**Kết luận:** Đạt một phần; còn chi tiết cần kiểm tra, 11/12.

**Ảnh:** [D1_T04_v2_lan1.jpg](./d1-tests/D1_T04_v2_lan1.jpg)

#### v2 — Lần 2

- Giữ màu sắc, trang phục và chính diện.
- Quạt nằm trước bụng, che phần giữa thân áo.
- Bề mặt quạt giống nan gỗ có họa tiết đục lỗ, chưa thể hiện rõ mặt giấy.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh:** [D1_T04_v2_lan2.jpg](./d1-tests/D1_T04_v2_lan2.jpg)

#### v3 — Lần 1 làm lại với prompt đầy đủ

- Giữ đầy đủ phần trang phục và màu sắc.
- Thay riêng mô tả quạt: mặt giấy liền, tay phải, bên ngoài thân người.
- Áo tím trầm, viền đen, quần ngà đúng mô tả.
- Quạt giấy liền, cầm bằng tay phải của người mẫu.
- Quạt vẫn chồng lên phần áo bên hông.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh lưu trong bộ chính:** [D1_T04_v3_lan1.jpg](./d1-tests/D1_T04_v3_lan1.jpg)

**Lưu ý:** Liên kết trên phải trỏ tới ảnh làm lại đúng prompt, không phải ảnh áo hồng của lượt nhập sai. Ảnh làm lại từng được tải với tên `D1_T04_v3_lan1(1).jpg`.

#### v3 — Lần 2

- Áo tím, viền đen, quần ngà đúng yêu cầu.
- Quạt giấy mở, mặt liền.
- Cầm bằng tay trái của người mẫu, trái yêu cầu tay phải.
- Quạt vẫn chồng lên áo.
- Chính diện và toàn thân.

**Kết luận:** Đạt một phần, 11/12.

**Ảnh:** [D1_T04_v3_lan2.jpg](./d1-tests/D1_T04_v3_lan2.jpg)

**Kết luận ca T04:** Ưu tiên v3 về mô tả mặt giấy. Chưa kiểm soát ổn định tay cầm và vị trí quạt. v4 từng được đề xuất nhưng không có kết quả chạy được xác nhận.

### 6.5. T05 — Áo tứ thân, yếm đào

#### v1 — Lần 1

- Áo hồng đào, viền nâu, váy tối.
- Có hai vạt buộc eo và thả dài.
- Phần áo ngoài hai bên kết thúc gần hông.
- Lớp yếm hồng đậm hơn nhìn thấy riêng, có dây cổ nhưng cổ tròn.
- Không thấy phụ kiện thừa rõ ràng.
- Cấu trúc áo cần duyệt theo tài liệu E1.

**Kết luận:** Đạt một phần; cần duyệt nội dung, 10/12.

**Ảnh:** [D1_T05_v1_lan1.jpg](./d1-tests/D1_T05_v1_lan1.jpg)

#### v1 — Lần 2

- Giữ màu hồng–nâu, váy tối và toàn thân.
- Áo ngoài dài hơn đáng kể so với lần 1.
- Lớp yếm vẫn cổ tròn thay vì chữ V.
- Không thấy phụ kiện thừa rõ ràng.

**Kết luận:** Đạt một phần; cần duyệt nội dung, 10/12.

**Ảnh:** [D1_T05_v1_lan2.jpg](./d1-tests/D1_T05_v1_lan2.jpg)

**Kết luận ca T05:** Giữ v1 làm bản ghi thử nghiệm. Chưa chọn bản đạt để sử dụng vì cổ yếm sai yêu cầu và cấu trúc áo có biến động.

### 6.6. T06 — Áo dài, không phụ kiện

#### v1 — Lần 1

- Giữ áo đỏ, viền vàng, quần ngà.
- Không có nón, khăn, túi hoặc vật cầm tay.
- Toàn thân, chính diện.
- Có đường cong mảnh cạnh tai chưa phân biệt chắc chắn tóc mai hay khuyên tai.

**Kết luận:** Đạt một phần; chưa xác nhận hoàn toàn không trang sức, 11/12.

**Ảnh:** [D1_T06_v1_lan1.jpg](./d1-tests/D1_T06_v1_lan1.jpg)

#### v1 — Lần 2

- Không thấy phụ kiện thừa rõ ràng.
- Tai phía khuất không kiểm tra được đầy đủ.
- Giữ phối màu và toàn thân.
- Thân người xoay nghiêng, lệch yêu cầu chính diện.
- Góc nghiêng thể hiện phần xẻ bên rõ hơn.

**Kết luận:** Đạt một phần do lệch tư thế, 11/12.

**Ảnh:** [D1_T06_v1_lan2.jpg](./d1-tests/D1_T06_v1_lan2.jpg)

**Kết luận ca T06:** v1 bỏ được các phụ kiện lớn trong hai lượt, nhưng chưa giữ ổn định tư thế; chi tiết trang sức nhỏ còn cần kiểm tra.

## 7. Lượt nhập sai prompt — không dùng đánh giá v3

### T04 — Lượt đầu mang tên v3 nhưng đầu vào không đúng bản dự kiến

- File đã cung cấp: `D1_T04_v3_lan1.jpg` của lượt đầu.
- Ảnh có áo hồng sáng, các phần tím tương phản.
- Không thể hiện rõ viền đen và quần trắng ngà.
- Quạt có mặt giấy liền và nằm bên cạnh.
- Người thực hiện sau đó xác nhận sai sót khi làm theo hướng dẫn và đã chạy lại bằng prompt đầy đủ.

**Xử lý:**

- Không tính lượt này vào 16 lượt thử hợp lệ.
- Không quy lỗi màu sắc của ảnh này cho prompt v3 đầy đủ.
- Không chấm điểm vì đầu vào không đại diện cho bản cần kiểm thử.
- Nếu còn giữ ảnh, đặt tên riêng, ví dụ `D1_T04_nhap_sai_prompt.jpg`.
- Không để ảnh này ghi đè ảnh v3 làm lại đúng prompt.

## 8. Lịch sử chỉnh prompt

| Ca  | Thay đổi                                          | Lý do                                | Kết quả quan sát                                                                      |
| --- | ------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| T01 | Giữ v1                                            | Hai lượt bám yêu cầu chính           | Chưa cần chỉnh trong phạm vi ca này                                                   |
| T02 | v1 → v2: mô tả yếm riêng, dây cổ, cổ chữ V        | Lớp trong giống áo cổ tròn           | Yếm rõ hơn; nón có chóp và dây trước bụng phát sinh                                   |
| T03 | v1 → v2: khăn ngắn, đầu khăn trên túi             | Hai lượt khăn che túi                | Túi rõ; chưa đúng hai đầu khăn ở ngực trên                                            |
| T04 | v2: làm rõ chính diện                             | T06 trước đó có lượt xoay nghiêng    | Hai ảnh T04 v2 chính diện; chưa chứng minh riêng hiệu quả thay đổi vì ca đầu vào khác |
| T04 | v2 → v3: mặt giấy liền, tay phải, quạt ngoài thân | Quạt v2 che bụng, chất liệu không rõ | Mặt giấy rõ; vị trí và tay cầm vẫn sai                                                |
| T04 | Sửa thao tác nhập prompt                          | Lượt đầu v3 không dùng đầy đủ prompt | Lượt làm lại giữ đúng màu áo và quần                                                  |
| T04 | v4 được đề xuất, chưa chạy được xác nhận          | Lo ngại màu và trang phục lệch       | Không có dữ liệu để đánh giá v4                                                       |
| T05 | Giữ v1                                            | Hoàn thành hai lượt quan sát         | Cổ yếm sai, cấu trúc áo biến động                                                     |
| T06 | Giữ v1                                            | Kiểm tra không phụ kiện              | Bỏ được phụ kiện lớn; tư thế có biến động                                             |

Các số phiên bản được quản lý theo từng ca. `T02 v2` và `T03 v2` không phải cùng một phiên bản prompt chung.

## 9. Thống kê kết quả

| Chỉ số                                    | Số lượng |
| ----------------------------------------- | -------: |
| Ca thử                                    |        6 |
| Loại trang phục                           |        3 |
| Lượt hợp lệ đã đánh giá                   |       16 |
| Lượt nhập sai prompt ghi nhận riêng       |        1 |
| Tổng lượt có ảnh được xem trong quá trình |       17 |
| Lượt đạt về thị giác                      |        2 |
| Lượt đạt một phần/cần duyệt               |       14 |

### Tỷ lệ quan sát

- Đạt về thị giác: **2/16 = 12,5%**.
- Đạt một phần hoặc cần duyệt: **14/16 = 87,5%**.

Đây là tỷ lệ trong bộ thử nhỏ, có nhiều ca và nhiều phiên bản khác nhau. Không sử dụng tỷ lệ này làm ước lượng thành công của một prompt chốt hoặc của hệ thống sản xuất.

Có 12 lượt chạy lặp lại ban đầu:

- T01 v1: 2 lượt.
- T02 v1: 2 lượt.
- T03 v1: 2 lượt.
- T04 v2: 2 lượt.
- T05 v1: 2 lượt.
- T06 v1: 2 lượt.

Có thêm 4 lượt hợp lệ sau chỉnh sửa:

- T02 v2: 1 lượt.
- T03 v2: 1 lượt.
- T04 v3: 2 lượt nhập đúng.

Chưa có đủ hai lượt cho các bản T02 v2 và T03 v2. Chưa thực hiện một vòng kiểm thử chung với cùng phiên bản khuôn prompt đã chốt cho tất cả ca.

## 10. Phiên bản giữ lại và giới hạn

| Ca  | Phiên bản giữ lại | Mục đích                            | Giới hạn                             |
| --- | ----------------- | ----------------------------------- | ------------------------------------ |
| T01 | v1                | Bản tham khảo đạt về thị giác       | Chưa kiểm chứng toàn bộ cấu trúc may |
| T02 | v2, kèm v1        | Tiếp tục chỉnh và đối chiếu văn hóa | Nón, dây phát sinh, cấu trúc áo      |
| T03 | v2, kèm v1        | Tiếp tục chỉnh cách quàng khăn      | Chưa đúng độ dài và hai đầu khăn     |
| T04 | v3, kèm v2        | Mô tả quạt giấy rõ hơn              | Tay cầm và vị trí chưa ổn định       |
| T05 | v1                | Lưu kết quả và lỗi cần xử lý        | Yếm, cấu trúc áo                     |
| T06 | v1                | Bản thử trường hợp không phụ kiện   | Tư thế và chi tiết trang sức nhỏ     |

Không có một phiên bản chung đã được chứng minh đạt toàn bộ sáu ca. Các bản giữ lại là tài liệu thử nghiệm hoặc điểm xuất phát cho bước chỉnh tiếp, không phải tất cả đều đã được duyệt.

## 11. Kết luận D1

Đã viết và kiểm thử prompt trên Google AI Studio cho sáu tổ hợp thuộc ba loại trang phục, gồm:

- Phụ kiện đội đầu.
- Phụ kiện quanh cổ.
- Phụ kiện cầm tay.
- Thành phần mặc bên trong.
- Trường hợp không phụ kiện.

Model nhìn chung thực hiện tốt:

- Phối màu chính và phụ theo mô tả.
- Khung hình toàn thân.
- Nền studio đơn giản.
- Phong cách ảnh chân thực.

Các hạn chế đã quan sát:

- Vị trí phụ kiện và tay cầm thay đổi giữa các lượt.
- Độ dài và cách quàng khăn chưa bám đầy đủ yêu cầu.
- Hình thức yếm có thể bị chuyển thành áo cổ tròn.
- Hình dạng nón có thể thay đổi.
- Cấu trúc áo tứ thân có biến động và cần duyệt văn hóa.
- Tư thế chính diện chưa được giữ trong mọi lượt.
- Chi tiết nhỏ quanh tai có trường hợp chưa xác định chắc chắn.

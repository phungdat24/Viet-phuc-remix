# Đối chiếu văn hoá (bước E1)

Tạo tự động bởi `scripts/kiem-tra-dong-bo-van-hoa.ts --md`. Mọi thay đổi nên sửa ở `lib/vanHoa/quyTacDongBo.ts` rồi tạo lại file này.

## 1. Tóm tắt

- 27 cặp trang phục × phụ kiện. Cảnh báo "không phù hợp": **9 → 3**. Chưa có dữ liệu: 14 cặp.
- Nguyên nhân giảm: nhiều cảnh báo cũ dựa trên khăn mỏ quạ (chưa kiểm chứng) hoặc đoán vùng miền, không có nguồn.
- Giữ lại 3 cảnh báo vì cả hai món đều có nguồn và nguồn gắn chúng với vùng miền hoặc đối tượng khác nhau.

## 2. Bảng quy tắc

| Trang phục | Phụ kiện | Cũ | Mới | Căn cứ | Ghi chú hiển thị | Mục văn hoá |
|---|---|---|---|---|---|---|
| Áo dài | Nón lá | Phù hợp | Phù hợp | Trực tiếp | Nón lá là phụ kiện phổ biến, thường được phối cùng áo dài. | `ao-dai`, `non-la` |
| Áo dài | Khăn đóng | Phù hợp | Tuỳ dịp ⟵ đổi | Trực tiếp | Khăn đóng (khăn vấn) có thể đi cùng áo dài, nhưng truyền thống là khăn của nam giới đi cùng áo dài ngũ thân. Người mẫu trong ứng dụng là nữ nên bạn hãy cân nhắc dịp và đối tượng. | `khan-dong`, `ao-dai`, `ao-ngu-than` |
| Áo dài | Trâm cài | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối trâm cài với áo dài. Nguồn hiện có chỉ nói về trâm cung đình triều Nguyễn. | `tram-cai` |
| Áo dài | Quạt giấy | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối quạt giấy với áo dài. | `quat-giay` |
| Áo dài | Guốc mộc | Phù hợp | Phù hợp | Gián tiếp | Bảo tàng Hà Nội ghi nhận phụ nữ Hà Nội đầu thế kỷ XX mặc áo ngũ thân (tiền thân của áo dài) đi guốc mộc sơn đen. | `guoc-moc`, `ao-ngu-than` |
| Áo dài | Nón quai thao | **Không phù hợp (cảnh báo)** | Tuỳ dịp ⟵ đổi | Gián tiếp | Nón quai thao gắn với phụ nữ đồng bằng Bắc Bộ, nhất là dịp lễ hội, cưới hỏi. Áo dài là trang phục toàn quốc nên cặp này còn tuỳ dịp. | `non-quai-thao`, `ao-dai` |
| Áo dài | Khăn mỏ quạ | **Không phù hợp (cảnh báo)** | Chưa có dữ liệu ⟵ đổi | Không có | Khăn mỏ quạ chưa được kiểm chứng nguồn nên chưa thể kết luận mức độ phù hợp với áo dài. | `khan-mo-qua` |
| Áo dài | Khăn rằn | **Không phù hợp (cảnh báo)** | Tuỳ dịp ⟵ đổi | Gián tiếp | Khăn rằn gắn với Nam Bộ và áo bà ba (theo báo chí). Áo dài là trang phục toàn quốc nên cặp này còn tuỳ dịp. | `khan-ran`, `ao-dai` |
| Áo dài | Yếm đào | **Không phù hợp (cảnh báo)** | Tuỳ dịp ⟵ đổi | Gián tiếp | Yếm là đồ mặc trong, gắn với áo tứ thân. Theo truyền thuyết về cải cách trang phục Đàng Trong, áo ngũ thân cài khuy kín thay cho kiểu “phơi yếm”. Yếm mặc ngoài như “áo yếm” là cách làm mới hiện đại. | `yem`, `ao-ngu-than` |
| Áo tứ thân | Nón quai thao | Phù hợp | Phù hợp | Trực tiếp | Nón thượng như nón ba tầm, nón quai thao gắn với phụ nữ Bắc Bộ mặc áo tứ thân, nhất là dịp lễ hội. | `non-quai-thao`, `ao-tu-than` |
| Áo tứ thân | Khăn mỏ quạ | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Khăn mỏ quạ chưa được kiểm chứng nguồn. Nguồn đáng tin ghi nhận phụ nữ Hà Nội xưa vấn khăn nhung hoặc khăn the. | `khan-mo-qua` |
| Áo tứ thân | Yếm đào | Phù hợp | Phù hợp | Trực tiếp | Yếm là lớp mặc trong thấp thoáng dưới áo tứ thân (Bảo tàng Hà Nội). | `yem`, `ao-tu-than` |
| Áo tứ thân | Nón lá | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Nguồn hiện có ghi phụ nữ mặc áo tứ thân đội nón ba tầm; chưa có nguồn riêng về nón lá dáng chóp. | `non-la`, `ao-tu-than` |
| Áo tứ thân | Trâm cài | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối trâm cài với áo tứ thân. | `tram-cai` |
| Áo tứ thân | Quạt giấy | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối quạt giấy với áo tứ thân. | `quat-giay` |
| Áo tứ thân | Guốc mộc | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Guốc mộc là giày dép thông dụng của người Việt, nhưng chưa có nguồn riêng về việc đi cùng áo tứ thân. | `guoc-moc` |
| Áo tứ thân | Khăn đóng | **Không phù hợp (cảnh báo)** | **Không phù hợp (cảnh báo)** | Trực tiếp | Khăn đóng là khăn của nam giới đi cùng áo dài ngũ thân; áo tứ thân là áo của phụ nữ lao động Bắc Bộ. | `khan-dong`, `ao-tu-than` |
| Áo tứ thân | Khăn rằn | **Không phù hợp (cảnh báo)** | **Không phù hợp (cảnh báo)** | Gián tiếp | Khăn rằn gắn với Nam Bộ (báo chí), trong khi áo tứ thân là trang phục Bắc Bộ. Ghép hai món khác vùng là pha trộn vùng miền. | `khan-ran`, `ao-tu-than` |
| Áo bà ba | Nón lá | Phù hợp | Phù hợp | Trực tiếp | Nón lá và khăn rằn là hình ảnh quen thuộc đi cùng áo bà ba của người Nam Bộ (Báo Sài Gòn Giải Phóng). | `ao-ba-ba`, `non-la` |
| Áo bà ba | Khăn rằn | Phù hợp | Phù hợp | Trực tiếp | Khăn rằn đi cùng áo bà ba và nón lá là hình ảnh quen thuộc của người Nam Bộ (Báo Sài Gòn Giải Phóng, Báo Lào Cai). | `ao-ba-ba`, `khan-ran` |
| Áo bà ba | Khăn đóng | **Không phù hợp (cảnh báo)** | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối khăn đóng với áo bà ba. | `khan-dong` |
| Áo bà ba | Khăn mỏ quạ | **Không phù hợp (cảnh báo)** | Chưa có dữ liệu ⟵ đổi | Không có | Khăn mỏ quạ chưa được kiểm chứng nguồn nên chưa thể kết luận mức độ phù hợp với áo bà ba. | `khan-mo-qua` |
| Áo bà ba | Nón quai thao | **Không phù hợp (cảnh báo)** | **Không phù hợp (cảnh báo)** | Gián tiếp | Nón quai thao gắn với phụ nữ đồng bằng Bắc Bộ, trong khi áo bà ba là trang phục Nam Bộ. Ghép hai món khác vùng là pha trộn vùng miền. | `non-quai-thao`, `ao-ba-ba` |
| Áo bà ba | Quạt giấy | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối quạt giấy với áo bà ba. | `quat-giay` |
| Áo bà ba | Guốc mộc | Phù hợp | Chưa có dữ liệu ⟵ đổi | Không có | Guốc mộc là giày dép thông dụng ở nhiều nơi, kể cả đồng bằng sông Cửu Long; chưa có nguồn riêng về việc đi cùng áo bà ba. | `guoc-moc` |
| Áo bà ba | Trâm cài | Tuỳ dịp | Chưa có dữ liệu ⟵ đổi | Không có | Chưa có nguồn đáng tin về việc phối trâm cài với áo bà ba. | `tram-cai` |
| Áo bà ba | Yếm đào | Tuỳ dịp | Chưa có dữ liệu ⟵ đổi | Không có | Yếm là đồ mặc trong của phụ nữ Việt nhiều vùng; chưa có nguồn riêng về việc phối với áo bà ba. | `yem` |

## 3. Vùng miền (thẻ trên giao diện)

| Mục | Cũ (seed) | Mới | Thư viện văn hoá ghi |
|---|---|---|---|
| Áo dài | Toàn quốc | (giữ) | Toàn quốc |
| Áo tứ thân | Kinh Bắc | Bắc Bộ | Bắc Bộ (gắn nhiều với quan họ Kinh Bắc) |
| Áo bà ba | Nam Bộ | (giữ) | Nam Bộ (đồng bằng sông Cửu Long) |
| Nón lá | Toàn quốc | (giữ) | Toàn quốc, nổi tiếng ở Huế |
| Trâm cài | Toàn quốc | Cung đình Huế (nguồn hiện có) | Cung đình Huế (nguồn hiện có) |
| Khăn đóng | Huế | (giữ) | Huế, Đàng Trong xưa (khăn của nam giới) |
| Khăn mỏ quạ | Kinh Bắc | Bắc Bộ (chưa kiểm chứng) | Bắc Bộ (chưa kiểm chứng) |
| Nón quai thao | Kinh Bắc | Bắc Bộ | Đồng bằng Bắc Bộ |
| Quạt giấy | Toàn quốc | Nhiều vùng | Nhiều vùng (làng nghề: Chàng Sơn – Hà Nội, Hới – Quảng Bình, Ân Thi – Hải Dương) |
| Guốc mộc | Toàn quốc | Nhiều vùng | Nhiều vùng (Hà Nội, Vĩnh Long…) |
| Yếm đào | Kinh Bắc | Bắc Bộ và nhiều vùng | Bắc Bộ và nhiều vùng |
| Khăn rằn | Nam Bộ | (giữ) | Nam Bộ |

## 4. Nội dung văn hoá hiển thị ở trang phối đồ

Bản cũ có các chi tiết **chưa kiểm chứng được** và đã bị loại: mốc quốc phục "1837–1945", "ngũ luân", áo tứ thân "có thể bắt nguồn từ thời Lý – Trần", khăn mỏ quạ đi cùng áo tứ thân, ý "sống áo tượng trưng tình nghĩa vợ chồng", và tên nguồn chung chung như "Bảo tàng Áo dài / Nghiên cứu Văn hóa Việt Nam". Bản mới viết lại theo thư viện văn hoá và dẫn nguồn thật.

- **Áo dài — Nguồn gốc Áo dài**. Nguồn: Trịnh Bách, “Nguồn gốc áo dài Việt Nam”, Tạp chí Nghiên cứu và Phát triển, số 7 (161), 2020; Wikipedia: Áo dài. Chi tiết: /van-hoa/ao-dai
- **Áo dài — Sự hình thành Áo ngũ thân**. Nguồn: Phan Thanh Hải, Tạp chí Nghiên cứu và Phát triển (Huế), 2021; Trịnh Bách, 2020; Báo Văn hoá: “Lan toả Việt phục trong giới trẻ”; Báo Pháp luật Việt Nam, 07/03/2021. Chi tiết: /van-hoa/ao-ngu-than
- **Áo dài — Ý nghĩa văn hóa của Áo ngũ thân**. Nguồn: Báo Pháp luật Việt Nam, 07/03/2021; Báo Văn hoá: “Áo dài nam, vẻ đẹp truyền thống cần được phục hồi, tôn vinh”; Bảo tàng Hà Nội. Chi tiết: /van-hoa/ao-ngu-than
- **Áo tứ thân — Nguồn gốc Áo tứ thân**. Nguồn: Trịnh Bách, Tạp chí Nghiên cứu và Phát triển, số 7 (161), 2020; Wikipedia: Áo tứ thân. Chi tiết: /van-hoa/ao-tu-than
- **Áo tứ thân — Cấu tạo và đặc điểm**. Nguồn: Bảo tàng Hà Nội: “Phụ nữ Hà Nội trong trang phục truyền thống đầu thế kỉ 20”; Wikipedia: Áo tứ thân; Trịnh Bách, 2020. Chi tiết: /van-hoa/ao-tu-than
- **Áo tứ thân — Ý nghĩa biểu tượng**. Nguồn: Báo Văn hoá: “Áo dài nam, vẻ đẹp truyền thống cần được phục hồi, tôn vinh”; Bảo tàng Hà Nội. Chi tiết: /van-hoa/ao-tu-than
- **Áo bà ba — Nguồn gốc Áo bà ba**. Nguồn: Châu Thúy An, Tạp chí Giáo dục Nghệ thuật, số 55/2025; Tạp chí Dân tộc học: “Lịch sử chiếc áo Kebaya”. Chi tiết: /van-hoa/ao-ba-ba
- **Áo bà ba — Đặc điểm và tính ứng dụng**. Nguồn: Châu Thúy An, Tạp chí Giáo dục Nghệ thuật, số 55/2025. Chi tiết: /van-hoa/ao-ba-ba

## 5. Việc còn lại cần người

- Người am hiểu (thầy cô Sử/Văn, bảo tàng, câu lạc bộ áo dài) đọc lại cột "Ghi chú hiển thị" và các mục `da-doi-chieu`.
- Các tên nguồn do nhóm dịch/đặt theo nội dung bài: mở link và đối chiếu tên chính thức.
- Khăn mỏ quạ: tìm tài liệu chuyên khảo; khi có thể nâng khỏi mức đỏ rồi cập nhật ma trận.
- Chưa có người mẫu nam: bộ áo dài + khăn đóng chỉ mang tính tham khảo.

## 6. Mức độ xác minh của thư viện

- `ao-giao-linh` — Áo giao lĩnh: Đã đối chiếu nguồn
- `ao-tac` — Áo tấc: Đã đối chiếu nguồn
- `ao-nhat-binh` — Áo nhật bình: Còn tranh luận
- `ao-ngu-than` — Áo ngũ thân: Còn tranh luận
- `ao-tu-than` — Áo tứ thân: Còn tranh luận
- `ao-dai` — Áo dài: Còn tranh luận
- `ao-ba-ba` — Áo bà ba: Còn tranh luận
- `non-la` — Nón lá: Đã đối chiếu nguồn
- `non-quai-thao` — Nón quai thao: Còn tranh luận
- `yem` — Yếm: Đã đối chiếu nguồn
- `tram-cai` — Trâm cài: Đã đối chiếu nguồn
- `quat-giay` — Quạt giấy: Đã đối chiếu nguồn
- `guoc-moc` — Guốc mộc: Đã đối chiếu nguồn
- `khan-dong` — Khăn đóng: Đã đối chiếu nguồn
- `khan-ran` — Khăn rằn: Còn tranh luận
- `khan-mo-qua` — Khăn mỏ quạ: ⚠ Chưa kiểm chứng

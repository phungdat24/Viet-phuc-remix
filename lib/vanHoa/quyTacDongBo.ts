/**
 * ĐỒNG BỘ DATABASE <-> THƯ VIỆN VĂN HOÁ (lib/vanHoa/duLieu.ts)
 *
 * Đây là NGUỒN SỰ THẬT DUY NHẤT cho:
 *   1. Quy tắc phù hợp (trang phục × phụ kiện) hiển thị cảnh báo văn hoá;
 *   2. Cột "vùng miền" của trang phục và phụ kiện;
 *   3. Nội dung văn hoá hiển thị trong khung giới thiệu ở trang phối đồ.
 *
 * Dùng bởi:
 *   - prisma/dong-bo-van-hoa.ts          (ghi vào database)
 *   - scripts/kiem-tra-dong-bo-van-hoa.ts (kiểm tra, KHÔNG cần database)
 *
 * NGUYÊN TẮC CHỌN MỨC ĐỘ
 *   - phu_hop        : có nguồn nối TRỰC TIẾP hoặc GIÁN TIẾP (tiền thân/cùng ngữ cảnh) giữa hai món.
 *   - khong_phu_hop  : CHỈ khi cả hai món đều có nguồn không phải "chưa kiểm chứng" và nguồn gắn chúng
 *                      với hai vùng miền / đối tượng khác nhau. Đây là cảnh báo đỏ nên đòi hỏi cao nhất.
 *   - tuy_dip        : món gắn với bối cảnh khác nhưng chưa có nguồn nào nói là “không nên”.
 *   - chua_co_du_lieu: chưa có nguồn đáng tin. Giao diện nói thẳng “chưa có dữ liệu”, KHÔNG đoán.
 */

export type MucDo = 'phu_hop' | 'khong_phu_hop' | 'tuy_dip' | 'chua_co_du_lieu';
export type MucNguon = 'truc-tiep' | 'gian-tiep' | 'khong';

export const TRANG_PHUC = ['Áo dài', 'Áo tứ thân', 'Áo bà ba'] as const;
export const PHU_KIEN = [
  'Nón lá',
  'Nón quai thao',
  'Khăn đóng',
  'Khăn mỏ quạ',
  'Khăn rằn',
  'Yếm đào',
  'Trâm cài',
  'Quạt giấy',
  'Guốc mộc',
] as const;

export interface QuyTacDongBo {
  trangPhuc: (typeof TRANG_PHUC)[number];
  phuKien: (typeof PHU_KIEN)[number];
  mucDo: MucDo;
  /** Câu hiển thị cho người dùng. Ngắn gọn, không nói chuyện nội bộ. */
  ghiChu: string;
  /** Mức độ nguồn nối trực tiếp hai món. */
  nguonRieng: MucNguon;
  /** Slug các mục trong thư viện văn hoá chứa căn cứ. */
  slug: string[];
  /** Mức cũ trong prisma/seed.ts (+ seed-quy-tac.ts) để so sánh. */
  mucCu: MucDo;
}

const q = (
  trangPhuc: QuyTacDongBo['trangPhuc'],
  phuKien: QuyTacDongBo['phuKien'],
  mucCu: MucDo,
  mucDo: MucDo,
  nguonRieng: MucNguon,
  slug: string[],
  ghiChu: string,
): QuyTacDongBo => ({ trangPhuc, phuKien, mucDo, ghiChu, nguonRieng, slug, mucCu });

export const QUY_TAC: QuyTacDongBo[] = [
  // ============================ ÁO DÀI ============================
  q('Áo dài', 'Nón lá', 'phu_hop', 'phu_hop', 'truc-tiep', ['ao-dai', 'non-la'],
    'Nón lá là phụ kiện phổ biến, thường được phối cùng áo dài.'),
  q('Áo dài', 'Khăn đóng', 'phu_hop', 'tuy_dip', 'truc-tiep', ['khan-dong', 'ao-dai', 'ao-ngu-than'],
    'Khăn đóng (khăn vấn) có thể đi cùng áo dài, nhưng truyền thống là khăn của nam giới đi cùng áo dài ngũ thân. Người mẫu trong ứng dụng là nữ nên bạn hãy cân nhắc dịp và đối tượng.'),
  q('Áo dài', 'Trâm cài', 'phu_hop', 'chua_co_du_lieu', 'khong', ['tram-cai'],
    'Chưa có nguồn đáng tin về việc phối trâm cài với áo dài. Nguồn hiện có chỉ nói về trâm cung đình triều Nguyễn.'),
  q('Áo dài', 'Quạt giấy', 'phu_hop', 'chua_co_du_lieu', 'khong', ['quat-giay'],
    'Chưa có nguồn đáng tin về việc phối quạt giấy với áo dài.'),
  q('Áo dài', 'Guốc mộc', 'phu_hop', 'phu_hop', 'gian-tiep', ['guoc-moc', 'ao-ngu-than'],
    'Bảo tàng Hà Nội ghi nhận phụ nữ Hà Nội đầu thế kỷ XX mặc áo ngũ thân (tiền thân của áo dài) đi guốc mộc sơn đen.'),
  q('Áo dài', 'Nón quai thao', 'khong_phu_hop', 'tuy_dip', 'gian-tiep', ['non-quai-thao', 'ao-dai'],
    'Nón quai thao gắn với phụ nữ đồng bằng Bắc Bộ, nhất là dịp lễ hội, cưới hỏi. Áo dài là trang phục toàn quốc nên cặp này còn tuỳ dịp.'),
  q('Áo dài', 'Khăn mỏ quạ', 'khong_phu_hop', 'chua_co_du_lieu', 'khong', ['khan-mo-qua'],
    'Khăn mỏ quạ chưa được kiểm chứng nguồn nên chưa thể kết luận mức độ phù hợp với áo dài.'),
  q('Áo dài', 'Khăn rằn', 'khong_phu_hop', 'tuy_dip', 'gian-tiep', ['khan-ran', 'ao-dai'],
    'Khăn rằn gắn với Nam Bộ và áo bà ba (theo báo chí). Áo dài là trang phục toàn quốc nên cặp này còn tuỳ dịp.'),
  q('Áo dài', 'Yếm đào', 'khong_phu_hop', 'tuy_dip', 'gian-tiep', ['yem', 'ao-ngu-than'],
    'Yếm là đồ mặc trong, gắn với áo tứ thân. Theo truyền thuyết về cải cách trang phục Đàng Trong, áo ngũ thân cài khuy kín thay cho kiểu “phơi yếm”. Yếm mặc ngoài như “áo yếm” là cách làm mới hiện đại.'),

  // =========================== ÁO TỨ THÂN ==========================
  q('Áo tứ thân', 'Nón quai thao', 'phu_hop', 'phu_hop', 'truc-tiep', ['non-quai-thao', 'ao-tu-than'],
    'Nón thượng như nón ba tầm, nón quai thao gắn với phụ nữ Bắc Bộ mặc áo tứ thân, nhất là dịp lễ hội.'),
  q('Áo tứ thân', 'Khăn mỏ quạ', 'phu_hop', 'chua_co_du_lieu', 'khong', ['khan-mo-qua'],
    'Khăn mỏ quạ chưa được kiểm chứng nguồn. Nguồn đáng tin ghi nhận phụ nữ Hà Nội xưa vấn khăn nhung hoặc khăn the.'),
  q('Áo tứ thân', 'Yếm đào', 'phu_hop', 'phu_hop', 'truc-tiep', ['yem', 'ao-tu-than'],
    'Yếm là lớp mặc trong thấp thoáng dưới áo tứ thân (Bảo tàng Hà Nội).'),
  q('Áo tứ thân', 'Nón lá', 'phu_hop', 'chua_co_du_lieu', 'khong', ['non-la', 'ao-tu-than'],
    'Nguồn hiện có ghi phụ nữ mặc áo tứ thân đội nón ba tầm; chưa có nguồn riêng về nón lá dáng chóp.'),
  q('Áo tứ thân', 'Trâm cài', 'phu_hop', 'chua_co_du_lieu', 'khong', ['tram-cai'],
    'Chưa có nguồn đáng tin về việc phối trâm cài với áo tứ thân.'),
  q('Áo tứ thân', 'Quạt giấy', 'phu_hop', 'chua_co_du_lieu', 'khong', ['quat-giay'],
    'Chưa có nguồn đáng tin về việc phối quạt giấy với áo tứ thân.'),
  q('Áo tứ thân', 'Guốc mộc', 'phu_hop', 'chua_co_du_lieu', 'khong', ['guoc-moc'],
    'Guốc mộc là giày dép thông dụng của người Việt, nhưng chưa có nguồn riêng về việc đi cùng áo tứ thân.'),
  q('Áo tứ thân', 'Khăn đóng', 'khong_phu_hop', 'khong_phu_hop', 'truc-tiep', ['khan-dong', 'ao-tu-than'],
    'Khăn đóng là khăn của nam giới đi cùng áo dài ngũ thân; áo tứ thân là áo của phụ nữ lao động Bắc Bộ.'),
  q('Áo tứ thân', 'Khăn rằn', 'khong_phu_hop', 'khong_phu_hop', 'gian-tiep', ['khan-ran', 'ao-tu-than'],
    'Khăn rằn gắn với Nam Bộ (báo chí), trong khi áo tứ thân là trang phục Bắc Bộ. Ghép hai món khác vùng là pha trộn vùng miền.'),

  // ============================ ÁO BÀ BA ===========================
  q('Áo bà ba', 'Nón lá', 'phu_hop', 'phu_hop', 'truc-tiep', ['ao-ba-ba', 'non-la'],
    'Nón lá và khăn rằn là hình ảnh quen thuộc đi cùng áo bà ba của người Nam Bộ (Báo Sài Gòn Giải Phóng).'),
  q('Áo bà ba', 'Khăn rằn', 'phu_hop', 'phu_hop', 'truc-tiep', ['ao-ba-ba', 'khan-ran'],
    'Khăn rằn đi cùng áo bà ba và nón lá là hình ảnh quen thuộc của người Nam Bộ (Báo Sài Gòn Giải Phóng, Báo Lào Cai).'),
  q('Áo bà ba', 'Khăn đóng', 'khong_phu_hop', 'chua_co_du_lieu', 'khong', ['khan-dong'],
    'Chưa có nguồn đáng tin về việc phối khăn đóng với áo bà ba.'),
  q('Áo bà ba', 'Khăn mỏ quạ', 'khong_phu_hop', 'chua_co_du_lieu', 'khong', ['khan-mo-qua'],
    'Khăn mỏ quạ chưa được kiểm chứng nguồn nên chưa thể kết luận mức độ phù hợp với áo bà ba.'),
  q('Áo bà ba', 'Nón quai thao', 'khong_phu_hop', 'khong_phu_hop', 'gian-tiep', ['non-quai-thao', 'ao-ba-ba'],
    'Nón quai thao gắn với phụ nữ đồng bằng Bắc Bộ, trong khi áo bà ba là trang phục Nam Bộ. Ghép hai món khác vùng là pha trộn vùng miền.'),
  q('Áo bà ba', 'Quạt giấy', 'phu_hop', 'chua_co_du_lieu', 'khong', ['quat-giay'],
    'Chưa có nguồn đáng tin về việc phối quạt giấy với áo bà ba.'),
  q('Áo bà ba', 'Guốc mộc', 'phu_hop', 'chua_co_du_lieu', 'khong', ['guoc-moc'],
    'Guốc mộc là giày dép thông dụng ở nhiều nơi, kể cả đồng bằng sông Cửu Long; chưa có nguồn riêng về việc đi cùng áo bà ba.'),
  q('Áo bà ba', 'Trâm cài', 'tuy_dip', 'chua_co_du_lieu', 'khong', ['tram-cai'],
    'Chưa có nguồn đáng tin về việc phối trâm cài với áo bà ba.'),
  q('Áo bà ba', 'Yếm đào', 'tuy_dip', 'chua_co_du_lieu', 'khong', ['yem'],
    'Yếm là đồ mặc trong của phụ nữ Việt nhiều vùng; chưa có nguồn riêng về việc phối với áo bà ba.'),
];

/**
 * Cột "vùng miền". Giá trị mới bám theo thư viện văn hoá:
 *  - bỏ "Kinh Bắc" ở nơi các nguồn chỉ nói "Bắc Bộ";
 *  - bỏ "Toàn quốc" ở nơi nguồn chỉ nêu vài vùng cụ thể;
 *  - mục chưa kiểm chứng phải tự ghi "(chưa kiểm chứng)" để người dùng thấy ngay trên thẻ.
 */
export const VUNG_TRANG_PHUC: Record<string, { cu: string; moi: string }> = {
  'Áo dài': { cu: 'Toàn quốc', moi: 'Toàn quốc' },
  'Áo tứ thân': { cu: 'Kinh Bắc', moi: 'Bắc Bộ' },
  'Áo bà ba': { cu: 'Nam Bộ', moi: 'Nam Bộ' },
};

export const VUNG_PHU_KIEN: Record<string, { cu: string; moi: string }> = {
  'Nón lá': { cu: 'Toàn quốc', moi: 'Toàn quốc' },
  'Trâm cài': { cu: 'Toàn quốc', moi: 'Cung đình Huế (nguồn hiện có)' },
  'Khăn đóng': { cu: 'Huế', moi: 'Huế' },
  'Khăn mỏ quạ': { cu: 'Kinh Bắc', moi: 'Bắc Bộ (chưa kiểm chứng)' },
  'Nón quai thao': { cu: 'Kinh Bắc', moi: 'Bắc Bộ' },
  'Quạt giấy': { cu: 'Toàn quốc', moi: 'Nhiều vùng' },
  'Guốc mộc': { cu: 'Toàn quốc', moi: 'Nhiều vùng' },
  'Yếm đào': { cu: 'Kinh Bắc', moi: 'Bắc Bộ và nhiều vùng' },
  'Khăn rằn': { cu: 'Nam Bộ', moi: 'Nam Bộ' },
};

/**
 * Nội dung văn hoá hiển thị ở khung giới thiệu trang phối đồ (bảng NoiDungVanHoa).
 * Viết lại để khớp thư viện văn hoá: bỏ các chi tiết chưa kiểm chứng ở bản cũ
 * (mốc "1837–1945", "ngũ luân", "thời Lý – Trần", "khăn mỏ quạ đi cùng áo tứ thân"...) và
 * thay tên nguồn chung chung bằng nguồn thật.
 */
export interface NoiDungDongBo {
  trangPhuc: (typeof TRANG_PHUC)[number];
  tieuDe: string;
  noiDung: string;
  nguonThamKhao: string;
}

export const NOI_DUNG_VAN_HOA: NoiDungDongBo[] = [
  {
    trangPhuc: 'Áo dài',
    tieuDe: 'Nguồn gốc Áo dài',
    noiDung:
      '“Áo dài” có hai cách hiểu: kiểu hai thân ôm dáng hiện đại, hoặc tên chung cho cả họ áo truyền thống. Bản hai thân hiện đại có gốc từ áo ngũ thân: các hoạ sĩ thập niên 1930 (Cát Tường, Lê Phổ, Lê Thị Lựu) cải tiến cho ôm thân hơn, và áo vẫn mang dạng năm thân. Ngày 23/2/1934, Cát Tường trình bày ý tưởng cách tân trên báo Phong Hoá. Một số mốc (như năm của áo dài Le Mur hay kiểu cổ thuyền) được các nguồn ghi khác nhau.',
    nguonThamKhao:
      'Trịnh Bách, “Nguồn gốc áo dài Việt Nam”, Tạp chí Nghiên cứu và Phát triển, số 7 (161), 2020; Wikipedia: Áo dài. Chi tiết: /van-hoa/ao-dai',
  },
  {
    trangPhuc: 'Áo dài',
    tieuDe: 'Sự hình thành Áo ngũ thân',
    noiDung:
      'Quan điểm phổ biến lấy năm 1744 (chúa Nguyễn Phúc Khoát, theo Phủ biên tạp lục) làm mốc cải cách y phục Đàng Trong, đặt nền cho áo ngũ thân. Tuy nhiên một nghiên cứu (Trịnh Bách, 2020) cho rằng đoạn ghi chép ấy nói về áo ngắn hẹp tay và áo ngũ thân đã hình thành sớm hơn. Áo gồm năm thân: hai thân trước, hai thân sau và một thân con nằm bên trong. Sau năm 1802 triều Nguyễn thống nhất trang phục Bắc – Nam; đến giữa thế kỷ XIX áo ngũ thân phổ biến khắp cả nước.',
    nguonThamKhao:
      'Phan Thanh Hải, Tạp chí Nghiên cứu và Phát triển (Huế), 2021; Trịnh Bách, 2020; Báo Văn hoá: “Lan toả Việt phục trong giới trẻ”; Báo Pháp luật Việt Nam, 07/03/2021. Chi tiết: /van-hoa/ao-ngu-than',
  },
  {
    trangPhuc: 'Áo dài',
    tieuDe: 'Ý nghĩa văn hóa của Áo ngũ thân',
    noiDung:
      'Đây là cách lý giải biểu tượng được báo chí và Bảo tàng Hà Nội nhắc lại, không phải sử liệu kiểm chứng được: bốn thân gợi “tứ thân phụ mẫu”, thân con thứ năm là bản thân người mặc; năm khuy tượng trưng ngũ thường (nhân, lễ, nghĩa, trí, tín); cổ cao thẳng gợi sự chính trực.',
    nguonThamKhao:
      'Báo Pháp luật Việt Nam, 07/03/2021; Báo Văn hoá: “Áo dài nam, vẻ đẹp truyền thống cần được phục hồi, tôn vinh”; Bảo tàng Hà Nội. Chi tiết: /van-hoa/ao-ngu-than',
  },
  {
    trangPhuc: 'Áo tứ thân',
    tieuDe: 'Nguồn gốc Áo tứ thân',
    noiDung:
      'Áo tứ thân được phụ nữ mặc rộng rãi nhiều thế kỷ trước áo dài, dần gắn riêng với phụ nữ phía Bắc. Trịnh Bách so sánh với áo bối tử của Trung Hoa và suy luận áo có thể đã có từ rất lâu; đây là suy luận của một tác giả. Phụ nữ nông thôn Bắc Bộ giữ dạng không khuy đến giữa thế kỷ XX.',
    nguonThamKhao:
      'Trịnh Bách, Tạp chí Nghiên cứu và Phát triển, số 7 (161), 2020; Wikipedia: Áo tứ thân. Chi tiết: /van-hoa/ao-tu-than',
  },
  {
    trangPhuc: 'Áo tứ thân',
    tieuDe: 'Cấu tạo và đặc điểm',
    noiDung:
      'Hai thân sau khâu liền, hai thân trước để rời: buộc nút hoặc buông; không cài khuy. Mặc cùng yếm bên trong, váy đụp nâu sẫm dài đến mắt cá và thắt lưng lụa. Áo lao động thường bằng vải nâu, the hoặc lụa mộc; dịp lễ hội, cưới hỏi mới dùng màu rực rỡ.',
    nguonThamKhao:
      'Bảo tàng Hà Nội: “Phụ nữ Hà Nội trong trang phục truyền thống đầu thế kỉ 20”; Wikipedia: Áo tứ thân; Trịnh Bách, 2020. Chi tiết: /van-hoa/ao-tu-than',
  },
  {
    trangPhuc: 'Áo tứ thân',
    tieuDe: 'Ý nghĩa biểu tượng',
    noiDung:
      'Cách lý giải biểu tượng được báo chí nhắc lại: bốn mảnh vải gợi “tứ thân phụ mẫu”. Đây là cách hiểu văn hoá, không phải sử liệu. Áo gắn với hình ảnh người phụ nữ lao động tảo tần, với màu nâu non, nâu già, đen phù hợp nhịp sống ấy.',
    nguonThamKhao:
      'Báo Văn hoá: “Áo dài nam, vẻ đẹp truyền thống cần được phục hồi, tôn vinh”; Bảo tàng Hà Nội. Chi tiết: /van-hoa/ao-tu-than',
  },
  {
    trangPhuc: 'Áo bà ba',
    tieuDe: 'Nguồn gốc Áo bà ba',
    noiDung:
      'Nguồn gốc áo bà ba chưa có kết luận. Một giả thuyết liên hệ với kebaya của người Peranakan (Baba–Nyonya), du nhập khoảng giữa hoặc cuối thế kỷ XIX; giả thuyết khác cho rằng phát triển từ dạng áo ngắn đã có ở Đàng Trong từ cuối thế kỷ XVIII. Giai đoạn phổ biến mạnh nhất là cuối XIX – đầu XX.',
    nguonThamKhao:
      'Châu Thúy An, Tạp chí Giáo dục Nghệ thuật, số 55/2025; Tạp chí Dân tộc học: “Lịch sử chiếc áo Kebaya”. Chi tiết: /van-hoa/ao-ba-ba',
  },
  {
    trangPhuc: 'Áo bà ba',
    tieuDe: 'Đặc điểm và tính ứng dụng',
    noiDung:
      'Không cổ hoặc cổ tròn đơn giản; thân sau một mảnh nguyên, thân trước hai mảnh ghép giữa bằng hàng nút; hai tà xẻ hông, hai túi lớn dưới vạt trước. Chất liệu ban đầu là vải mộc bền, nhanh khô, nhuộm màu đen hoặc nâu; hợp lao động ngoài đồng, chèo xuồng. Trong kháng chiến, hình ảnh người phụ nữ Nam Bộ mặc áo bà ba trở thành biểu tượng yêu nước.',
    nguonThamKhao: 'Châu Thúy An, Tạp chí Giáo dục Nghệ thuật, số 55/2025. Chi tiết: /van-hoa/ao-ba-ba',
  },
];

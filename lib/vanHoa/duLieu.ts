/**
 * THƯ VIỆN VĂN HOÁ VIỆT PHỤC — dữ liệu tĩnh (không cần database, chạy được cả khi mất mạng).
 *
 * NGUYÊN TẮC BIÊN SOẠN
 *  1. Mỗi ý gắn SỐ NGUỒN (ví dụ [1][3]) trỏ tới danh sách "Nguồn tham khảo" của đúng mục đó.
 *  2. Phân biệt rõ: SỰ KIỆN LỊCH SỬ (niên đại, cấu tạo) với CÁCH LÝ GIẢI BIỂU TƯỢNG (ý nghĩa).
 *  3. Chỗ các nguồn ghi khác nhau thì viết ở mục "Các quan điểm khác nhau", không chọn bừa một bên.
 *  4. Mục chưa có nguồn học thuật / bảo tàng / báo chí chính thống thì trạng thái "chua-kiem-chung":
 *     hiện BANNER ĐỎ, chỉ giữ thông tin sơ bộ, KHÔNG viết thêm.
 *  5. Phần nào chưa có nguồn thì để trống, giao diện sẽ ghi "Chưa có đủ nguồn đáng tin" thay vì bịa.
 *
 * Tên tiêu đề nguồn đặt theo nội dung bài đã đọc; nếu bạn có bản in/bản gốc, hãy đối chiếu và sửa cho đúng tên chính thức.
 */

export type NhomVanHoa = 'trang-phuc' | 'phu-kien';
export type TrangThaiXacMinh = 'da-doi-chieu' | 'con-tranh-luan' | 'chua-kiem-chung';
export type LoaiNguon = 'hoc-thuat' | 'bao-tang' | 'bao-chi' | 'bach-khoa' | 'pho-thong';

export interface NguonThamKhao {
  tieuDe: string;
  donVi: string;
  url: string;
  loai: LoaiNguon;
}

/** Một ý kèm số thứ tự các nguồn (bắt đầu từ 1) trong danh sách nguồn của mục. */
export interface YCoNguon {
  n: string;
  s: number[];
}

export interface MocRieng {
  moc: string;
  y: YCoNguon;
}

export interface MucVanHoa {
  slug: string;
  ten: string;
  tenKhac?: string;
  nhom: NhomVanHoa;
  vung: string;
  thoiKy: string;
  tomTat: string;
  /** Có từ thời nào, nguồn gốc. */
  coTuThoiNao: YCoNguon[];
  /** Các mốc riêng của mục này. */
  hanhTrinh: MocRieng[];
  /** Cấu tạo, đặc điểm nhận biết. */
  nhanBiet: YCoNguon[];
  /** Ý nghĩa, biểu tượng (thường là cách lý giải văn hoá). */
  yNghia: YCoNguon[];
  /** Điểm độc đáo riêng. */
  diemDocDao: YCoNguon[];
  /** Ai mặc, dịp nào, chất liệu, màu. */
  nguoiMacDip: YCoNguon[];
  /** Các quan điểm khác nhau / điều chưa chắc. */
  conTranhLuan: YCoNguon[];
  trangThai: TrangThaiXacMinh;
  /** Có nội dung = hiện banner đỏ ở đầu trang. */
  canhBaoDo?: string;
  nguon: NguonThamKhao[];
  lienQuan: string[];
  phoiThu?: { trangPhuc: string; phuKien?: string[]; ghiChu?: string };
}

export const NHAN_TRANG_THAI: Record<TrangThaiXacMinh, { ten: string; moTa: string; mau: string }> = {
  'da-doi-chieu': {
    ten: 'Đã đối chiếu nguồn',
    moTa: 'Các ý chính được từ hai nguồn học thuật, bảo tàng, báo chí chính thống hoặc bách khoa trở lên nhắc đến thống nhất.',
    mau: 'bg-jade/15 text-jade border-jade/30',
  },
  'con-tranh-luan': {
    ten: 'Còn tranh luận',
    moTa: 'Có nguồn đáng tin nhưng các nguồn ghi khác nhau (mốc thời gian, nguồn gốc). Xem mục "Các quan điểm khác nhau".',
    mau: 'bg-gold/15 text-gold border-gold/40',
  },
  'chua-kiem-chung': {
    ten: '⚠ Chưa kiểm chứng',
    moTa: 'Chưa có nguồn học thuật, bảo tàng hay báo chí chính thống đủ để kiểm chứng. Chỉ nên xem là thông tin sơ bộ.',
    mau: 'bg-lacquer text-white border-lacquer',
  },
};

export const NHAN_LOAI_NGUON: Record<LoaiNguon, string> = {
  'hoc-thuat': 'Học thuật',
  'bao-tang': 'Bảo tàng',
  'bao-chi': 'Báo chí',
  'bach-khoa': 'Bách khoa',
  'pho-thong': 'Phổ thông',
};

const y = (n: string, ...s: number[]): YCoNguon => ({ n, s });
const moc = (m: string, n: string, ...s: number[]): MocRieng => ({ moc: m, y: y(n, ...s) });

// ===== Kho nguồn (mỗi nguồn khai báo một lần) =====
const N = {
  trinhBach: {
    tieuDe: 'Nguồn gốc áo dài Việt Nam',
    donVi: 'Trịnh Bách — Tạp chí Nghiên cứu và Phát triển, số 7 (161), 2020',
    url: 'https://vjol.info.vn/ncpt-hue/article/download/54470/45091/',
    loai: 'hoc-thuat',
  },
  hueVoVuong: {
    tieuDe: 'Từ cải cách trang phục dưới thời Võ vương Nguyễn Phúc Khoát và vua Minh Mạng nghĩ đến tư tưởng thống nhất, tự chủ về văn hoá',
    donVi: 'Phan Thanh Hải — Tạp chí Nghiên cứu và Phát triển (Huế), 2021',
    url: 'https://vjol.info.vn/ncpt-hue/article/view/54472',
    loai: 'hoc-thuat',
  },
  baBaChauThuyAn: {
    tieuDe: 'Áo bà ba xưa và nay: vẻ đẹp trường tồn của văn hoá trang phục người Việt Tây Nam Bộ',
    donVi: 'Châu Thúy An (ĐH Trà Vinh) — Tạp chí Giáo dục Nghệ thuật, số 55/2025',
    url: 'https://vjol.info.vn/tcgiaoducnghethuat/article/view/137388',
    loai: 'hoc-thuat',
  },
  kebaya: {
    tieuDe: 'Lịch sử chiếc áo Kebaya',
    donVi: 'Tạp chí Dân tộc học (VJOL)',
    url: 'https://vjol.info.vn/tapchiviendantochoc/article/download/127968/104973/',
    loai: 'hoc-thuat',
  },
  nhatBinhDoanHuy: {
    tieuDe: 'Nghiên cứu về áo Nhật Bình của Đoan Huy Hoàng thái hậu triều Nguyễn (hiện vật tại Bảo tàng Cổ vật Cung đình Huế)',
    donVi: 'Tạp chí Văn hoá Nghệ thuật (VJOL)',
    url: 'https://vjol.info.vn/tcvanhoanghethuat/article/download/138715/113380/',
    loai: 'hoc-thuat',
  },
  baoTangHaNoi: {
    tieuDe: 'Phụ nữ Hà Nội trong trang phục truyền thống đầu thế kỉ 20: Vẻ đẹp của sự giao thời',
    donVi: 'Bảo tàng Hà Nội (ảnh tư liệu 1914–1920, nguồn Bảo tàng Albert Kahn)',
    url: 'https://baotanghanoi.com.vn/en/phu-nu-ha-noi-trong-trang-phuc-truyen-thong-dau-the-ki-20-ve-dep-cua-su-giao-thoi/',
    loai: 'bao-tang',
  },
  wikiAoDai: {
    tieuDe: 'Áo dài',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/%C3%81o_d%C3%A0i',
    loai: 'bach-khoa',
  },
  wikiTuThan: {
    tieuDe: 'Áo tứ thân',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/%C3%81o_t%E1%BB%A9_th%C3%A2n',
    loai: 'bach-khoa',
  },
  wikiNhatBinh: {
    tieuDe: 'Áo nhật bình',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/%C3%81o_nh%E1%BA%ADt_b%C3%ACnh',
    loai: 'bach-khoa',
  },
  wikiYem: {
    tieuDe: 'Yếm',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/Y%E1%BA%BFm',
    loai: 'bach-khoa',
  },
  wikiNonLa: {
    tieuDe: 'Nón lá',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/N%C3%B3n_l%C3%A1',
    loai: 'bach-khoa',
  },
  wikiKhanVan: {
    tieuDe: 'Khăn vấn',
    donVi: 'Wikipedia (tiếng Anh)',
    url: 'https://en.wikipedia.org/wiki/Kh%C4%83n_v%E1%BA%A5n',
    loai: 'bach-khoa',
  },
  plvnNguThan: {
    tieuDe: 'Sự trở lại ngoạn mục của áo dài ngũ thân',
    donVi: 'Báo Pháp luật Việt Nam, 07/03/2021',
    url: 'https://baophapluat.vn/su-tro-lai-ngoan-muc-cua-ao-dai-ngu-than-post384250.html',
    loai: 'bao-chi',
  },
  baoVanHoaAoDaiNam: {
    tieuDe: 'Áo dài nam, vẻ đẹp truyền thống cần được phục hồi, tôn vinh',
    donVi: 'Báo Văn hoá',
    url: 'https://baovanhoa.vn/doi-song-van-hoa/ao-dai-nam-ve-dep-truyen-thong-can-duoc-phuc-hoi-ton-vinh-67530.html',
    loai: 'bao-chi',
  },
  baoVanHoaLanToa: {
    tieuDe: 'Lan toả Việt phục trong giới trẻ',
    donVi: 'Báo Văn hoá',
    url: 'https://baovanhoa.vn/thoi-trang/lan-toa-viet-phuc-trong-gioi-tre-68931.html',
    loai: 'bao-chi',
  },
  plvnCoPhuc: {
    tieuDe: '“Việt Cẩm Y Văn”: Bản sắc Việt trong cổ phục thời Lê Trung Hưng',
    donVi: 'Báo Pháp luật Việt Nam',
    url: 'https://baophapluat.vn/viet-cam-y-van-ban-sac-viet-trong-co-phuc-thoi-le-trung-hung.html',
    loai: 'bao-chi',
  },
  sggpVietPhuc: {
    tieuDe: 'Phúc Anh, Thúy Diễm, Đỗ Hà tung bộ ảnh Tết hoài niệm với Việt phục',
    donVi: 'Báo Sài Gòn Giải Phóng',
    url: 'https://www.sggp.org.vn/phuc-anh-thuy-diem-do-ha-tung-bo-anh-tet-hoai-niem-voi-viet-phuc-post726066.html',
    loai: 'bao-chi',
  },
  baoVanHoaNhatBinh: {
    tieuDe: 'Trưng bày cổ vật mũ quan triều Nguyễn phục vụ người dân tham quan miễn phí',
    donVi: 'Báo Văn hoá (áo Nhật Bình cung tần tại Bảo tàng Cổ vật Cung đình Huế)',
    url: 'https://baovanhoa.vn/di-san/trung-bay-co-vat-mu-quan-trieu-nguyen-phuc-vu-nguoi-dan-tham-quan-mien-phi-50683.html',
    loai: 'bao-chi',
  },
  vietnamNewsNonBaTam: {
    tieuDe: 'Nón ba tầm: ancient hats made from leaves',
    donVi: 'Vietnam News',
    url: 'https://vietnamnews.vn/sunday/features/343017/non-ba-tam-ancient-hats-made-from-leaves.html',
    loai: 'bao-chi',
  },
  anhKyUcNonQuaiThao: {
    tieuDe: 'Ảnh = Ký ức = Lịch sử (Kỳ 38): Cái nón quai thao',
    donVi: 'Chuyên mục báo chí (đăng lại trên Báo Mới)',
    url: 'https://baomoi.com/anh-ky-uc-lich-su-ky-38-cai-non-quai-thao-c43202393.epi',
    loai: 'bao-chi',
  },
  sggpKhanLuong: {
    tieuDe: 'Cái khăn lương',
    donVi: 'Báo Sài Gòn Giải Phóng',
    url: 'https://www.sggp.org.vn/cai-khan-luong-34406.html',
    loai: 'bao-chi',
  },
  baoLaoCaiKhanRan: {
    tieuDe: 'Đi tìm vẻ đẹp của chiếc khăn rằn (phỏng vấn soạn giả Nhâm Hùng)',
    donVi: 'Báo Lào Cai',
    url: 'https://baolaocai.vn/di-tim-ve-dep-cua-chiec-khan-ran-post392263.html',
    loai: 'bao-chi',
  },
  tatler: {
    tieuDe: 'Legacy 50: áo dài qua thời gian',
    donVi: 'Tatler Asia',
    url: 'https://www.tatlerasia.com/style/fashion/legacy-50-vietnam-ao-dai-over-time-vn',
    loai: 'bao-chi',
  },
  vietcetera: {
    tieuDe: 'Việt phục — những trang phục thanh lịch và giàu biểu tượng bên cạnh áo dài',
    donVi: 'Vietcetera',
    url: 'https://vietcetera.com/en/viet-phuc-elegant-and-symbolic-vietnamese-costumes-besides-ao-dai',
    loai: 'pho-thong',
  },
  vietnamTourism: {
    tieuDe: 'Trang phục truyền thống Việt Nam nam và nữ: cẩm nang du lịch',
    donVi: 'Vietnam Tourism',
    url: 'https://www.vietnamtourism.com/vi/trang-phuc-truyen-thong-viet-nam-nam-va-nu-cam-nang-du-lich-',
    loai: 'pho-thong',
  },
  hoaTieuNon: {
    tieuDe: 'Lịch sử chiếc nón lá',
    donVi: 'Hoatieu.vn',
    url: 'https://hoatieu.vn/lich-su-chiec-non-la-216198',
    loai: 'pho-thong',
  },
  miaKhanRan: {
    tieuDe: 'Chiếc khăn rằn Nam Bộ',
    donVi: 'MIA.vn',
    url: 'https://mia.vn/cam-nang-du-lich/chiec-khan-ran-nam-bo-16805',
    loai: 'pho-thong',
  },
  luatMinhKhue: {
    tieuDe: 'Trình bày ý kiến về việc bảo tồn một loại hình nghệ thuật, trang phục truyền thống',
    donVi: 'Luatminhkhue.vn (văn mẫu)',
    url: 'https://luatminhkhue.vn/trinh-bay-y-kien-ve-viec-bao-ton-mot-loai-hinh-nghe-thuat.aspx',
    loai: 'pho-thong',
  },
} satisfies Record<string, NguonThamKhao>;

// ===== Các mục văn hoá =====
export const CAC_MUC: MucVanHoa[] = [
  // ============================================================ ÁO GIAO LĨNH
  {
    slug: 'ao-giao-linh',
    ten: 'Áo giao lĩnh',
    tenKhac: 'áo cổ chéo',
    nhom: 'trang-phuc',
    vung: 'Đại Việt (nhiều vùng)',
    thoiKy: 'Thế kỷ XIV → XVIII',
    tomTat:
      'Áo cổ chéo, hai vạt trước bắt chéo ở ngực, không cài hàng khuy. Trang phục của quý tộc và nho sĩ, xuất hiện trong tranh thế kỷ XIV và nổi bật thời Lê Trung Hưng.',
    nguon: [N.wikiAoDai, N.plvnCoPhuc, N.vietcetera],
    coTuThoiNao: [
      y('Bức tranh thư pháp thế kỷ XIV “Trúc Lâm đại sĩ xuất sơn đồ” vẽ Trần Anh Tông mặc áo viên lĩnh (cổ tròn) ở trong và áo giao lĩnh phủ ngoài. Đây là một trong những hình ảnh sớm nhất giúp hình dung trang phục quý tộc Đại Việt.', 1),
      y('Theo diễn giả nghiên cứu cổ phục Bình Phan, đến thời Lê Trung Hưng giao lĩnh trở thành kiểu áo nổi bật, cùng các loại mũ đặc trưng như mũ bình đính, và dần thay thế áo viên lĩnh.', 2),
      y('Giao lĩnh được mô tả là phổ biến nhất ở thời Lê.', 3),
    ],
    hanhTrinh: [
      moc('Thế kỷ XIV', 'Giao lĩnh xuất hiện trong tranh vẽ vua Trần Anh Tông, mặc ngoài áo viên lĩnh.', 1),
      moc('Thời Lê Trung Hưng', 'Giao lĩnh “lên ngôi”, thay dần áo viên lĩnh.', 2),
      moc('Thế kỷ XVIII', 'Triều đình Đàng Ngoài của chúa Trịnh vẫn mặc giao lĩnh với váy dài; Đàng Trong chuyển sang áo cài khuy và quần.', 1),
    ],
    nhanBiet: [
      y('Cổ chéo: hai vạt trước giao nhau trên ngực, không cài hàng khuy như áo dài sau này.', 1, 3),
      y('Có hai dạng: vạt ngắn và vạt dài; khi mặc phải khép vạt đúng thứ tự.', 3),
    ],
    yNghia: [
      y('Trang phục này cho thấy trang phục còn là dấu hiệu phân biệt chính quyền và vùng miền: Đàng Ngoài mặc giao lĩnh với váy dài, trong khi triều đình Đàng Trong dùng áo cài khuy và quần để tách biệt.', 1),
    ],
    diemDocDao: [
      y('Đối lập rõ nhất với áo ngũ thân: một bên vạt chéo không khuy, một bên hàng khuy phía trước.', 1),
    ],
    nguoiMacDip: [
      y('Giới quý tộc ưa chuộng; ảnh minh hoạ trong tư liệu còn cho thấy nho sĩ, học trò mặc giao lĩnh.', 1),
    ],
    conTranhLuan: [
      y('Giao lĩnh ở Việt Nam có những nét tương đồng với giao lĩnh ở Trung Hoa và Triều Tiên cùng thời. Mức độ “bản địa hoá” là điều các nhà nghiên cứu còn trao đổi; trang này chỉ ghi nhận điểm tương đồng, không kết luận.', 3),
    ],
    trangThai: 'da-doi-chieu',
    lienQuan: ['ao-ngu-than', 'ao-tac', 'ao-dai'],
  },

  // ================================================================ ÁO TẤC
  {
    slug: 'ao-tac',
    ten: 'Áo tấc',
    tenKhac: 'áo ngũ thân tay thụng',
    nhom: 'trang-phuc',
    vung: 'Cung đình, quan lại, gia đình quý tộc',
    thoiKy: 'Triều Nguyễn',
    tomTat:
      'Dạng áo ngũ thân có tay rộng (“tay thụng”), dùng trong dịp lễ thời Nguyễn. Thông tin hiện còn ngắn vì tài liệu chuyên khảo chưa nhiều.',
    nguon: [N.sggpVietPhuc, N.vietcetera, N.wikiAoDai],
    coTuThoiNao: [
      y('Áo tấc được mô tả là áo ngũ thân tay thụng, thông dụng trong dịp lễ ở triều Nguyễn.', 1, 2),
    ],
    hanhTrinh: [],
    nhanBiet: [
      y('Dáng của áo ngũ thân nhưng tay áo rộng (tay thụng).', 1, 2),
    ],
    yNghia: [],
    diemDocDao: [
      y('Khác với áo ngũ thân tay chẽn (tay hẹp) vốn thông dụng hằng ngày, áo tấc có tay rộng và gắn với dịp lễ.', 1),
    ],
    nguoiMacDip: [
      y('Dùng trong dịp lễ lạt; ở gia đình quý tộc, áo tấc thường đi cùng nón ba tầm.', 1),
    ],
    conTranhLuan: [
      y('Một số bài phổ thông giải thích tên gọi “tấc” theo đơn vị đo chiều dài. Cách giải thích này chưa được đối chiếu với tài liệu chuyên khảo nên chưa dùng làm khẳng định.', 2),
      y('Wikipedia chỉ nhắc áo tấc như một tên trong họ áo truyền thống, không mô tả thêm.', 3),
    ],
    trangThai: 'da-doi-chieu',
    lienQuan: ['ao-ngu-than', 'ao-nhat-binh'],
  },

  // ========================================================== ÁO NHẬT BÌNH
  {
    slug: 'ao-nhat-binh',
    ten: 'Áo nhật bình',
    tenKhac: 'áo mệnh phụ',
    nhom: 'trang-phuc',
    vung: 'Cung đình Huế',
    thoiKy: 'Từ thời chúa Nguyễn; lễ phục triều Nguyễn (1802–1945)',
    tomTat:
      'Lễ phục cung đình của nữ giới thuộc tầng lớp cao triều Nguyễn, nổi bật với cổ áo hình chữ nhật thêu hoa văn đoàn phượng, đoàn loan.',
    nguon: [N.nhatBinhDoanHuy, N.wikiNhatBinh, N.trinhBach, N.sggpVietPhuc, N.baoVanHoaNhatBinh, N.vietcetera],
    coTuThoiNao: [
      y('Wikipedia ghi nhận áo nhật bình xuất hiện từ thời các chúa Nguyễn, nhưng hoa văn mang mô-típ chịu ảnh hưởng nhà Thanh (ví dụ hoa văn sóng nước).', 2),
      y('Nghiên cứu của Trịnh Bách cho rằng nguyên mẫu là áo “phi phong bối tử” của Trung Hoa (dạng áo có cổ chữ nhật). Triều đình Lê, Nguyễn dùng loại áo này và người Việt gọi nôm na là áo “nhật bình” hay áo “mệnh phụ”.', 3),
      y('Một bài nghiên cứu về hiện vật áo nhật bình của Đoan Huy Hoàng thái hậu (Bảo tàng Cổ vật Cung đình Huế) xác nhận đây là loại áo thuộc hệ thống trang phục cung đình của hậu phi triều Nguyễn.', 1),
    ],
    hanhTrinh: [
      moc('Thời các chúa Nguyễn', 'Áo nhật bình xuất hiện (theo Wikipedia).', 2),
      moc('Triều Nguyễn (1802–1945)', 'Được quy định trong trang phục cung đình; quy chế liệt kê áo nhật bình trong bộ y phục của cung tần các giai và mệnh phụ phu nhân.', 1, 2),
      moc('2022', 'Thừa Thiên Huế tiếp nhận hai áo nhật bình thời Nguyễn từ nhà sưu tập tư nhân; một áo nhật bình cung tần được trưng bày tại Bảo tàng Cổ vật Cung đình Huế.', 2, 5),
    ],
    nhanBiet: [
      y('Cổ áo hình chữ nhật, cạnh dưới cắt thẳng ngang (theo mô tả áo phi phong là nguyên mẫu); vùng cổ được thêu tay rất tinh xảo.', 3, 4),
      y('Mảng hoa văn quanh cổ tạo thành hình chữ nhật; tên gọi “nhật bình” được giải thích theo hình mảng này.', 6),
      y('Đi kèm khăn vành đặc trưng.', 4),
    ],
    yNghia: [
      y('Hoa văn đoàn phượng, đoàn loan cùng các đồ án và mỹ tự cát tường thể hiện phẩm cấp cao quý của người nữ, làm tăng sự trang trọng của lễ phục.', 4),
      y('Áo nhật bình được xếp vào loại áo đại triều: dùng trong những dịp trọng đại, không phải trang phục hằng ngày.', 1),
    ],
    diemDocDao: [
      y('Nay áo mệnh phụ (nhật bình) còn được dùng làm áo cưới của cô dâu và cũng được tăng, ni Phật giáo mặc.', 3),
      y('Các hiện vật còn lại rất quý: một chiếc áo nhật bình cung tần được mua đấu giá rồi hiến tặng cho Huế.', 5),
    ],
    nguoiMacDip: [
      y('Dành cho mệnh phụ trong hoàng tộc và gia đình quý tộc triều Nguyễn, cùng các bậc cung phi, hoàng hậu, thái hậu, vào những dịp lễ lớn.', 4),
    ],
    conTranhLuan: [
      y('Nguồn gốc: Wikipedia ghi nhận từ thời chúa Nguyễn với mô-típ nhà Thanh; Trịnh Bách truy về áo phi phong bối tử thời Tống – Minh. Hai hướng này chưa được hợp nhất trong các nguồn đã đọc.', 2, 3),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['ao-ngu-than', 'ao-tac'],
  },

  // ============================================================ ÁO NGŨ THÂN
  {
    slug: 'ao-ngu-than',
    ten: 'Áo ngũ thân',
    tenKhac: 'áo dài ngũ thân, áo năm tà, áo dài nam truyền thống',
    nhom: 'trang-phuc',
    vung: 'Thuận Hoá, Đàng Trong; sau lan ra toàn quốc',
    thoiKy: 'Hình thành khoảng thế kỷ XVI–XVIII (còn tranh luận); quốc phục thế kỷ XIX',
    tomTat:
      'Áo dài cài khuy bên phải, cấu tạo năm thân, cho cả nam và nữ; tiền thân trực tiếp của áo dài hiện đại. Mốc ra đời còn tranh luận giữa quan điểm “1744” và các nghiên cứu cho rằng đã có sớm hơn.',
    nguon: [
      N.trinhBach, // 1
      N.hueVoVuong, // 2
      N.baoTangHaNoi, // 3
      N.plvnNguThan, // 4
      N.baoVanHoaAoDaiNam, // 5
      N.baoVanHoaLanToa, // 6
      N.wikiAoDai, // 7
      N.tatler, // 8
    ],
    coTuThoiNao: [
      y('Quan điểm phổ biến: năm 1744 (Giáp Tý), khi xưng vương, chúa Nguyễn Phúc Khoát (Võ vương) ra lệnh đổi cách ăn mặc của dân Đàng Trong để khác với Bắc Hà, đặt nền cho áo ngũ thân. Căn cứ là ghi chép của Lê Quý Đôn trong “Phủ biên tạp lục”.', 2, 4, 7),
      y('Sau khi thống nhất đất nước (1802), triều Nguyễn thống nhất trang phục Bắc – Nam; đến giữa thế kỷ XIX áo ngũ thân đã là lễ phục và thường phục phổ biến khắp cả nước.', 6),
      y('Một nghiên cứu khác lập luận áo ngũ thân đã hình thành sớm hơn 1744: khoảng giữa thế kỷ XV – XVI ở Thuận Hoá, và phổ biến sâu rộng vào cuối thế kỷ XVI – đầu XVII. Xem mục “Các quan điểm khác nhau”.', 1),
    ],
    hanhTrinh: [
      moc('Thế kỷ XVII (tương truyền)', 'Theo sử gia Phan Khoang, Đào Duy Từ (1572–1634) khuyên chúa Nguyễn Phúc Nguyên đổi cách ăn mặc của dân Đàng Trong: bỏ nón thượng đội nón chóp, bỏ áo tứ thân phơi yếm mà mặc áo ngũ thân cài khuy, bỏ váy mặc quần.', 1),
      moc('1618–1623 (sách xuất bản 1631)', 'Giáo sĩ Cristoforo Borri tả cái áo dài màu thâm phổ biến của nam giới Thuận Quảng, trông giống áo chùng thâm của giáo sĩ Công giáo.', 1),
      moc('1744', 'Mốc cải cách y phục Đàng Trong theo Phủ biên tạp lục.', 2, 4),
      moc('Thế kỷ XIX', 'Triều Nguyễn thống nhất trang phục; áo ngũ thân thành quốc phục.', 6, 8),
      moc('1914–1920', 'Ảnh tư liệu Hà Nội: phụ nữ trung lưu mặc áo ngũ thân trong dịp lễ Tết, cưới hỏi.', 3),
      moc('Thập niên 1930', 'Áo ngũ thân nữ được cải biến thành áo dài gọn hơn, có đường nét cơ thể rõ hơn.', 1, 3),
      moc('2017 → nay', 'Câu lạc bộ Áo dài nam truyền thống (2017); các hoạt động kỷ niệm 280 năm cải cách 1744 vào năm 2024.', 6),
    ],
    nhanBiet: [
      y('Năm thân: hai thân trước, hai thân sau và một thân con (vạt con, vạt hò) nằm bên trong thân trước bên phải; vạt thứ năm gắn bằng dải vải và nút dưới vạt cả.', 1, 5),
      y('Cổ đứng (cổ “xây”) cắt hẹp bản và ôm cổ; cài khuy bên phải.', 1, 3),
      y('Khuy tròn bằng kim loại, ngọc, ngà, san hô hoặc thuỷ tinh; khác khuy “Tàu” tết con bướm.', 1),
      y('Dáng rộng rãi, càng xuống càng xoè; áo nam có hai vạt dài quá gối.', 3, 4),
    ],
    yNghia: [
      y('Lưu ý: các ý nghĩa dưới đây là cách lý giải biểu tượng được nhiều bài báo và bảo tàng nhắc lại. Chúng mang tính văn hoá, không phải sử liệu kiểm chứng được như niên đại.', 3, 4, 5),
      y('Bốn mảnh vải (hai thân trước, hai thân sau) gợi “tứ thân phụ mẫu”: cha mẹ đẻ và cha mẹ vợ; mảnh thứ năm nhỏ nhất, nằm bên trong, là bản thân người mặc, nhắc đạo hiếu.', 4, 5),
      y('Năm khuy cài tượng trưng ngũ thường của Nho giáo: nhân, lễ, nghĩa, trí, tín.', 3, 4, 5),
      y('Cổ cao, thẳng, vuông của áo nam gợi sự chính trực của người quân tử.', 4),
      y('Áo thường mặc kèm lớp áo lót trắng, thể hiện quan niệm “cái gì đẹp thì nên giấu vào trong”.', 4),
    ],
    diemDocDao: [
      y('Cổ đứng ôm cổ và khuy tròn là những nét giúp phân biệt áo Việt với áo cùng dáng ở Trung Hoa: có khi chỉ nhờ cổ đứng mà phân biệt được áo bào “mã quái” của Việt và Hoa cùng thời.', 1),
      y('Vạt con (thân thứ năm) được giấu kín bên trong, theo lối kín đáo của người Việt.', 1),
      y('Áo dài ngũ thân của nam gần như không đổi suốt nhiều thế kỷ; áo dài hai thân của nữ ngày nay vẫn “mang dạng” năm thân.', 1),
      y('Dù không được nêu thành văn bản chính thức, tà áo ngũ thân suốt thời hoàng triều được ngầm hiểu là quốc phục.', 8),
    ],
    nguoiMacDip: [
      y('Cả nam và nữ; thời xưa từ chức sắc đến dân thường, từ thầy đồ làng đến học trò nhỏ.', 4),
      y('Phụ nữ trung lưu Hà Nội đầu thế kỷ XX mặc áo ngũ thân trong dịp lễ Tết, cưới hỏi; kèm váy lĩnh, vấn khăn nhung hoặc khăn the, đi guốc mộc sơn đen.', 3),
      y('Chất liệu theo tầng lớp: gấm cho thượng lưu, sa hoặc the mỏng cho trung lưu; màu áo nam (trừ gấm) thường là đen, trắng, xanh lam.', 4),
      y('Các vua cuối triều Nguyễn (từ Hàm Nghi đến Bảo Đại) vẫn mặc áo dài khăn đóng.', 4),
    ],
    conTranhLuan: [
      y('Mốc 1744: Phủ biên tạp lục chép Nguyễn Phúc Khoát ra lệnh cho trai gái đổi sang dùng áo quần “Bắc quốc” và nói phụ nữ mặc “áo ngắn hẹp tay như áo đàn ông”.', 1, 2),
      y('Theo Trịnh Bách, nguyên văn Hán tự trong đoạn ấy là “trách tụ đoản y” (áo ngắn hẹp tay), không phải áo dài. Vì thế ông cho rằng đoạn ghi chép chưa chứng minh 1744 là năm ra đời của áo dài ngũ thân; ông dẫn thêm ghi chép của Borri (1618–1623) về áo dài của nam giới Thuận Quảng đầu thế kỷ XVII.', 1),
      y('Cũng theo giả thuyết của riêng tác giả này, áo ngũ thân có thể hình thành từ sự kết hợp áo kameez Ấn – Hồi (qua người Chăm) với cổ đứng và cách cài khuy bên phải của người Việt. Đây là một giả thuyết, chưa phải kết luận chung.', 1),
      y('Phan Thanh Hải (Huế) lại nhấn mạnh vai trò của Võ vương năm 1744 và của vua Minh Mạng trong việc đưa áo ngũ thân thành quốc phục, coi Huế là “chiếc nôi” của áo dài.', 2),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['ao-dai', 'ao-tac', 'ao-giao-linh', 'ao-tu-than', 'khan-dong'],
    phoiThu: {
      trangPhuc: 'Áo dài',
      ghiChu: 'Ứng dụng chưa có áo ngũ thân. Áo dài là hậu duệ gần nhất để bạn thử phối.',
    },
  },

  // ============================================================= ÁO TỨ THÂN
  {
    slug: 'ao-tu-than',
    ten: 'Áo tứ thân',
    nhom: 'trang-phuc',
    vung: 'Bắc Bộ (Kinh Bắc)',
    thoiKy: 'Nhiều thế kỷ trước áo dài; còn phổ biến ở nông thôn Bắc Bộ đến giữa thế kỷ XX',
    tomTat:
      'Áo dài không khuy, mở dọc phía trước, hai tà trước buộc lại ở eo. Áo của phụ nữ lao động Bắc Bộ, mặc cùng váy, yếm và thắt lưng lụa.',
    nguon: [N.trinhBach, N.baoTangHaNoi, N.wikiTuThan, N.baoVanHoaAoDaiNam],
    coTuThoiNao: [
      y('Áo tứ thân được phụ nữ mặc rộng rãi nhiều thế kỷ trước áo dài; khi người Việt mở rộng về phía Nam, áo dần gắn riêng với phụ nữ phía Bắc.', 3),
      y('Trịnh Bách cho rằng áo thuộc dạng “trực lĩnh” (mở dọc giữa thân trước), tay ngắn hẹp, rất giống áo “bối tử” tứ thân của Trung Hoa cả về hình dạng lẫn cách mặc cùng váy. Từ đó ông suy luận loại áo này có thể đã có ở Việt Nam từ rất lâu, không muộn hơn thời Đường. Đây là suy luận của một tác giả.', 1),
    ],
    hanhTrinh: [
      moc('Trước năm 1744', 'Áo tứ thân là áo phổ biến của phụ nữ Bắc Bộ; truyền thuyết Đàng Trong kể việc “bỏ áo tứ thân phơi yếm” để mặc áo ngũ thân cài khuy.', 1),
      moc('1914–1920', 'Ảnh tư liệu: phụ nữ Hà Nội mặc áo tứ thân ở chợ Đồng Xuân, Hàng Đào, Hàng Ngang.', 2),
      moc('Giữa thế kỷ XX', 'Phụ nữ nông thôn Bắc Bộ vẫn giữ dạng tứ thân nguyên sơ không khuy, vạt phải khoác lên vạt trái rồi quấn dây lưng.', 1),
      moc('Ngày nay', 'Chủ yếu thấy ở dạng cải biên nhiều màu trong lễ hội, trình diễn.', 1, 3),
    ],
    nhanBiet: [
      y('Hai thân sau khâu liền, hai thân trước để rời: có thể buộc nút hoặc buông.', 2, 3),
      y('Không cài khuy; hai vạt khép lại rồi giữ bằng dây lưng.', 1),
      y('Mặc cùng váy (váy đụp nâu sẫm dài đến mắt cá), yếm bên trong và thắt lưng lụa.', 2, 3),
      y('Về sau áo tứ thân Việt có thêm cổ đứng (cổ xây); tác giả cho đây là điểm khác với áo tứ thân không cổ của Trung Hoa.', 1),
    ],
    yNghia: [
      y('Cách lý giải biểu tượng được báo chí nhắc lại: bốn mảnh vải gợi “tứ thân phụ mẫu” (cha mẹ hai bên). Đây là cách hiểu văn hoá, không phải sử liệu.', 4),
      y('Áo gắn với hình ảnh người phụ nữ lao động tảo tần; màu nâu non, nâu già, đen phù hợp nhịp sống ấy.', 2),
    ],
    diemDocDao: [
      y('Điểm đặc biệt: không có khuy. Trước khi khuy áo phổ biến, người ta khép vạt rồi buộc bằng dây lưng; áo tứ thân giữ lại cách mặc cổ xưa đó đến giữa thế kỷ XX.', 1),
      y('Hai tà trước có thể thắt gọn (khi làm việc) hoặc buông (khi đẹp).', 1),
      y('Dù màu giản dị, người Hà Nội vẫn tinh tế phối màu: yếm có thể hồng cánh sen, vàng nhạt hay xanh thiên thanh; thắt lưng lụa chọn sao cho hài hoà với áo.', 2),
    ],
    nguoiMacDip: [
      y('Phụ nữ lao động, tiểu thương, người làm nghề thủ công; chất liệu thường vải nâu, the hoặc lụa mộc.', 2),
      y('Vải thường sẫm màu; chỉ dịp lễ hội, cưới hỏi mới dùng màu rực rỡ.', 3),
    ],
    conTranhLuan: [
      y('Quan hệ giữa áo tứ thân Việt Nam và áo bối tử của Trung Hoa là điều được thảo luận: Trịnh Bách nêu cả điểm giống (hình dạng, cách mặc với váy) lẫn điểm khác (cổ đứng, độ dài vạt ngắn hơn để tiện lao động).', 1),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['yem', 'non-quai-thao', 'ao-ngu-than', 'khan-mo-qua'],
    phoiThu: { trangPhuc: 'Áo tứ thân', phuKien: ['Nón quai thao', 'Yếm đào'] },
  },

  // ================================================================== ÁO DÀI
  {
    slug: 'ao-dai',
    ten: 'Áo dài',
    tenKhac: 'áo dài hai thân, áo dài Le Mur và các bản cách tân',
    nhom: 'trang-phuc',
    vung: 'Toàn quốc',
    thoiKy: 'Định hình từ thập niên 1930, tiếp tục cách tân đến nay',
    tomTat:
      'Kiểu áo hai thân ôm dáng, kế thừa dạng năm thân; được cách tân liên tục từ thập niên 1930 đến nay.',
    nguon: [N.trinhBach, N.wikiAoDai, N.baoTangHaNoi, N.plvnNguThan],
    coTuThoiNao: [
      y('“Áo dài” có hai cách hiểu: (a) kiểu hai thân ôm dáng phổ biến hiện nay, thường gắn với áo dài Le Mur; (b) tên chung cho cả họ áo truyền thống như ngũ thân, tứ thân, giao lĩnh. Vì thế các nguồn khó thống nhất mốc “áo dài ra đời”.', 2),
      y('Bản hai thân hiện đại có gốc từ áo ngũ thân: các hoạ sĩ thập niên 1930 chỉ cải tiến cho ôm thân hơn, và áo vẫn “mang dạng” năm thân.', 1, 3),
    ],
    hanhTrinh: [
      moc('Thập niên 1930', 'Lê Phổ, Lê Thị Lựu, Cát Tường cải tiến áo ngũ thân: ôm thân hơn, bỏ nối sống giữa (vì có vải khổ rộng nhập từ châu Âu), bỏ nửa dưới vạt con, nên áo thành 3 thân nhưng vẫn gọi là năm thân.', 1),
      moc('23/2/1934', 'Hoạ sĩ Cát Tường (Le Mur) trình bày ý tưởng cách tân trên báo Phong Hoá: ông cho rằng cổ áo là phần thừa và tay áo bất tiện.', 1),
      moc('Sau 1934', 'Áo Le Mur rất Âu hoá (cổ cắt đa dạng, vai bồng, quần loe), chỉ một bộ phận nhỏ phụ nữ cấp tiến đón nhận và gần như biến mất sau khi ông biệt tích năm 1949. Áo Lê Phổ nhẹ nhàng hơn, giữ cổ xây thấp.', 1),
      moc('1947', 'Hồ Chí Minh phát động tiết kiệm, khuyên bỏ áo dài để mặc áo vắn; áo dài không còn thông dụng ở miền Bắc trong thời gian dài.', 1),
      moc('1958 hoặc 1961', 'Kiểu không cổ / cổ thuyền gắn với bà Trần Lệ Xuân (Nhu). Wikipedia ghi 1958; Trịnh Bách ghi năm 1961, với thiết kế của Michiko Uyemura.', 1, 2),
      moc('Thập niên 1950–1960', 'Sài Gòn thu eo, tạo dáng “lưng ong” (xếp li từ khoảng 1960–1962) và tay raglan.', 1, 2),
      moc('1967–1971', 'Áo dài mini và áo dài “hippy” nhiều màu; mini raglan năm 1971.', 1, 2),
      moc('1988', 'Áo dài raglan phi bóng quần đũi.', 1),
    ],
    nhanBiet: [
      y('Hai thân (tà trước, tà sau) cài khuy, vẫn mang dạng năm thân.', 1, 2),
      y('Mặc cùng quần ống rộng.', 1),
    ],
    yNghia: [
      y('Trong một hội thảo lấy ý kiến về quốc phục, lễ phục nữ, 100% đại biểu thống nhất chọn áo dài nữ hiện nay làm nguyên gốc để sáng tạo.', 4),
      y('Trịnh Bách nhận định áo dài truyền thống trải qua năm thế kỷ đã in sâu vào tâm hồn người Việt, có chỗ đứng đặc biệt trong thế giới thời trang quốc tế, ngang với kimono Nhật Bản và salwar kameez Ấn – Hồi.', 1),
    ],
    diemDocDao: [
      y('Áo dài luôn được cách tân: nhiều mẫu cách tân thế kỷ XXI chỉ lặp lại điều hoạ sĩ Cát Tường đã làm gần 90 năm trước.', 1),
      y('Mỗi lần cách tân đều giữ cấu trúc cũ: dù thành hai thân, áo vẫn giữ dạng năm thân.', 1),
      y('Áo Le Mur gần như không còn hiện vật nào, nhưng dấu vết của nó xuất hiện lại nhiều lần trong các cách tân sau này.', 1),
    ],
    nguoiMacDip: [
      y('Chủ yếu nữ giới; áo dài ngũ thân của nam là hệ riêng.', 4),
      y('Từ tháng 9/2020, Sở Văn hoá – Thể thao Thừa Thiên Huế cho cán bộ mặc áo dài vào thứ Hai đầu mỗi tháng, một ví dụ về việc đưa áo dài vào đời sống công sở.', 4),
    ],
    conTranhLuan: [
      y('Hai cách hiểu chữ “áo dài” (chỉ kiểu hai thân hiện đại, hay cả họ áo truyền thống) khiến mốc ra đời thay đổi theo cách hiểu.', 2),
      y('Các mốc khác nhau giữa nguồn: áo dài Le Mur được Wikipedia ghi là năm 1930, còn Trịnh Bách dẫn bài viết của Cát Tường trên báo Phong Hoá ngày 23/2/1934; raglan được ghi là thập niên 1950 (Wikipedia) hoặc khoảng 1960 (Trịnh Bách); kiểu cổ thuyền gắn với năm 1958 (Wikipedia) hoặc 1961 (Trịnh Bách).', 1, 2),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['ao-ngu-than', 'ao-tu-than', 'non-la'],
    phoiThu: { trangPhuc: 'Áo dài', phuKien: ['Nón lá'] },
  },

  // ================================================================ ÁO BÀ BA
  {
    slug: 'ao-ba-ba',
    ten: 'Áo bà ba',
    nhom: 'trang-phuc',
    vung: 'Nam Bộ (đồng bằng sông Cửu Long)',
    thoiKy: 'Phổ biến mạnh cuối thế kỷ XIX – đầu thế kỷ XX',
    tomTat:
      'Bộ áo ngắn và quần của người Nam Bộ: gọn, thoáng, hợp sông nước. Nguồn gốc vẫn là chủ đề tranh luận.',
    nguon: [N.baBaChauThuyAn, N.kebaya, N.vietnamTourism],
    coTuThoiNao: [
      y('Nghiên cứu mới nhất đã đọc nhấn mạnh việc tìm nguồn gốc áo bà ba là hành trình phức tạp, với nhiều giả thuyết đan xen; rất có thể là kết quả của giao thoa văn hoá và quá trình thích ứng lâu dài.', 1),
      y('Giai đoạn phát triển mạnh và phổ biến nhất là cuối thế kỷ XIX đến đầu thế kỷ XX; khi ấy áo gần như không thể thiếu của người Nam Bộ, nhất là nông dân đồng bằng sông Cửu Long.', 1),
    ],
    hanhTrinh: [
      moc('Cuối thế kỷ XVIII', 'Theo “Ngàn năm áo mũ” (Trần Quang Đức): đã có áo vạt ngắn, không cổ, thân trước xẻ giữa và cài cúc ở Đàng Trong.', 1),
      moc('Giữa đến cuối thế kỷ XIX', 'Thời điểm kiểu áo được cho là du nhập qua giao thương với thương nhân gốc Hoa ở Đông Nam Á (các nguồn ghi giữa hoặc cuối thế kỷ XIX).', 1, 2),
      moc('Cuối XIX – đầu XX', 'Áo bà ba phổ biến mạnh, ban đầu may bằng vải mộc màu đen hoặc nâu.', 1),
      moc('Thời kháng chiến', 'Hình ảnh người phụ nữ Nam Bộ mặc áo bà ba trở thành biểu tượng yêu nước, kiên cường.', 1),
    ],
    nhanBiet: [
      y('Không cổ, hoặc (về sau) cổ tròn đơn giản.', 1),
      y('Thân sau may bằng một mảnh vải nguyên; thân trước gồm hai mảnh ghép giữa bằng hàng nút chạy dọc.', 1),
      y('Hai tà xẻ hai bên hông, độ dài thường trùm qua mông; tay áo truyền thống dài.', 1),
      y('Áo nữ chít eo nhẹ hai bên, áo nam suôn thẳng hơn.', 1),
      y('Hai túi lớn ở phía dưới hai vạt trước.', 1),
    ],
    yNghia: [
      y('Vẻ đẹp nằm ở sự giản dị, kín đáo mà vẫn tôn dáng người mặc, hợp tính cách ngay thẳng, bộc trực, không ưa phô trương của người Nam Bộ.', 1),
      y('Trong kháng chiến, hình ảnh người phụ nữ Nam Bộ mặc áo bà ba, tay ôm súng, đã trở thành biểu tượng của tinh thần yêu nước và ý chí bất khuất.', 1),
      y('Áo là “chứng nhân” của văn hoá lúa nước và sông nước: mặc ngoài đồng, trong vườn cây, trên xuồng ba lá, ghe tam bản.', 1),
    ],
    diemDocDao: [
      y('Chất liệu ban đầu là vải mộc bền, nhanh khô (vải gai, vải ú, vải sơn đầm, vải một); màu đen hoặc nâu nhuộm bằng nguyên liệu tự nhiên như lá bàng, vỏ trâm bầu, trái mặc nưa, rồi phủ bùn non để giữ màu.', 1),
      y('Đi vào đời sống nghệ thuật: ca khúc “Chiếc áo bà ba” của Trần Thiện Thanh, cải lương, thơ văn; có Festival Áo bà ba ở Hậu Giang.', 1),
      y('Dạng hiện đại ôm eo hơn, nhiều kiểu cổ, tay raglan, màu pastel và hoạ tiết thêu, in.', 1),
    ],
    nguoiMacDip: [
      y('Cả nam lẫn nữ ở đồng bằng sông Cửu Long, chủ yếu nông dân; áo mặc đi chơi, đi lễ hội hoặc của nhà khá giả có thể bằng lụa tơ tằm.', 1, 3),
    ],
    conTranhLuan: [
      y('Giả thuyết 1: liên hệ với kebaya của người Peranakan (Baba–Nyonya). Nhà văn Sơn Nam ghi người Nam Kỳ xưa chuộng áo vải đen của người “Bà-ba”, từ đó có tên “áo bà ba”; thời điểm du nhập ghi là cuối thế kỷ XIX (nghiên cứu này) hoặc giữa thế kỷ XIX (nguồn Tạp chí Dân tộc học).', 1, 2),
      y('Giả thuyết 2: phát triển từ dạng áo ngắn đã có ở Đàng Trong từ cuối thế kỷ XVIII, tức sớm hơn mốc du nhập nói trên.', 1),
      y('Giả thuyết 3: người Việt đầu tiên vào Nam ban đầu mặc áo dài quần dài kiểu phía ngoài, rồi dần cải biên cho hợp khí hậu nóng ẩm và lao động nặng.', 1),
      y('Còn ý kiến liên hệ với trang phục người Chăm, hoặc với “cái áo đàn ông cổ tròn, cửa ống, tay hẹp” mà Lê Quý Đôn mô tả.', 1),
      y('Học giả Trương Vĩnh Ký (1837–1898) thường được cho là người “cách tân” áo của người đảo Penang cho hợp người Việt, nhưng nghiên cứu lưu ý ông có thể chỉ là người hệ thống hoá và phổ biến một kiểu áo đã manh nha.', 1),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['ao-ngu-than', 'non-la', 'khan-ran'],
    phoiThu: { trangPhuc: 'Áo bà ba', phuKien: ['Nón lá'] },
  },

  // =================================================================== NÓN LÁ
  {
    slug: 'non-la',
    ten: 'Nón lá',
    tenKhac: 'nón bài thơ (Huế), nón cụ, nón Gò Găng…',
    nhom: 'phu-kien',
    vung: 'Toàn quốc, nổi tiếng ở Huế',
    thoiKy: 'Lâu đời (chưa xác định mốc cụ thể)',
    tomTat:
      'Chiếc nón dáng chóp bằng lá, che nắng mưa và làm quạt; mỗi vùng một kiểu, tinh tế nhất là nón bài thơ Huế.',
    nguon: [N.wikiNonLa, N.hoaTieuNon, N.baoTangHaNoi, N.trinhBach],
    coTuThoiNao: [
      y('Chưa tìm được nguồn xác định chính xác nón lá có từ bao giờ. Một số tài liệu phổ thông cho rằng hình ảnh nón đã có trên đồ đồng Đông Sơn; nhóm chưa thấy nguồn khảo cổ xác nhận nên không dùng làm khẳng định.', 2),
      y('Theo truyền thuyết lịch sử do sử gia Phan Khoang ghi lại, Đào Duy Từ (1572–1634) khuyên chúa Nguyễn Phúc Nguyên cho dân Đàng Trong “bỏ nón thượng đội nón chóp” để khác với Đàng Ngoài. Nón lá thuộc nhóm nón chóp.', 4),
    ],
    hanhTrinh: [
      moc('Thế kỷ XVII (tương truyền)', 'Đàng Trong chuyển sang đội nón chóp (nhóm nón lá) thay nón thượng.', 4),
      moc('1914–1920', 'Ảnh Hà Nội cho thấy phụ nữ Bắc Bộ phần nhiều đội nón ba tầm cùng áo tứ thân, ngũ thân.', 3),
    ],
    nhanBiet: [
      y('Nón làm từ lá (như lá cọ), dáng chóp, có quai giữ dưới cằm.', 1, 2),
      y('Nón bài thơ Huế: lá mỏng, trắng, giữa hai lớp lá lồng hình hoặc câu thơ, soi lên ánh sáng mới thấy.', 1, 2),
    ],
    yNghia: [
      y('Công năng thực tế: che nắng, che mưa, và có thể dùng như quạt.', 1),
      y('Nón lá đi vào thơ ca, nhạc hoạ và múa; trong nghệ thuật sân khấu, nón lá xuất hiện trong các tiết mục múa của các cô gái.', 1),
    ],
    diemDocDao: [
      y('Nón bài thơ được xem là tác phẩm nghệ thuật độc đáo nhất của nón lá Huế; Huế có các làng nón như Dạ Lê, Phú Cam, Đốc Sơ.', 2),
      y('Mỗi vùng một kiểu: nón Gò Găng (Bình Định), nón cụ (thường thấy trong đám cưới Nam Bộ), nón dấu (nón chóp nhọn của lính thời phong kiến), nón ba tầm (phổ biến ở Bắc Bộ), nón bài thơ (Huế).', 1, 2),
    ],
    nguoiMacDip: [
      y('Dùng rộng rãi trong đời sống thường ngày; nón cụ gắn với đám cưới Nam Bộ.', 1, 2),
    ],
    conTranhLuan: [
      y('Mốc xuất hiện của nón lá và quan hệ của nó với hình ảnh trên đồ đồng Đông Sơn chưa có nguồn khảo cổ xác nhận.', 2),
    ],
    trangThai: 'da-doi-chieu',
    lienQuan: ['non-quai-thao', 'ao-dai', 'ao-ba-ba'],
    phoiThu: { trangPhuc: 'Áo dài', phuKien: ['Nón lá'] },
  },

  // =========================================================== NÓN QUAI THAO
  {
    slug: 'non-quai-thao',
    ten: 'Nón quai thao',
    tenKhac: 'nón thượng gắn quai thao; liên quan nón ba tầm, nón thúng',
    nhom: 'phu-kien',
    vung: 'Đồng bằng Bắc Bộ',
    thoiKy: 'Truyền thống; nay chủ yếu xuất hiện ở lễ hội',
    tomTat:
      'Nón quai thao không phải một loại nón riêng: đó là cách gọi chiếc nón thượng (phẳng, vành rộng) khi gắn quai thao bằng tơ. Gắn với phụ nữ Bắc Bộ trong ngày hội.',
    nguon: [N.anhKyUcNonQuaiThao, N.vietnamNewsNonBaTam, N.baoTangHaNoi, N.trinhBach, N.wikiNonLa],
    coTuThoiNao: [
      y('“Nón quai thao” là cách gọi chung. Chiếc nón thượng chỉ khi gắn quai thao mới được gọi là nón quai thao; nón thượng có quai nhưng không dùng thao thì không được gọi như vậy và thuộc lớp bình dân.', 1, 2),
      y('Quai thao là dải tơ đặc biệt do thợ làng Đơ Thao (xã Triều Khúc, phía tây Hà Nội ngày nay) làm, được dùng với nhiều loại nón sang trọng: nón cưới, nón thầy tu (màu đen), nón ba tầm, nón thúng của nhà khá giả hoặc phụ nữ trong dịp hội hè, cưới hỏi.', 2),
      y('Theo sử gia Phan Khoang ghi lại truyền thuyết, Đào Duy Từ khuyên Đàng Trong bỏ nón thượng, đội nón chóp để khác Đàng Ngoài; qua đó nón thượng gắn với phía Bắc.', 4),
    ],
    hanhTrinh: [
      moc('1914–1920', 'Ảnh Hà Nội: nón ba tầm, nón tầm là hình ảnh đặc trưng của phụ nữ Bắc Bộ đầu thế kỷ XX.', 3),
    ],
    nhanBiet: [
      y('Nón ba tầm (một loại nón thượng): vành rộng, thân phẳng, kết từ nhiều lớp lá cọ khô trên khung tre, chóp thấp ở giữa; vành xoè che gần hết vai.', 3),
      y('Nón ba tầm đường kính lớn tới khoảng 70 cm được gọi là nón “mười”.', 2),
      y('Nón thượng gồm các loại như nón quai thao, nón thúng, nón chân tượng, khác nhóm nón chóp (nón lá, nón bài thơ).', 4),
    ],
    yNghia: [
      y('Quai thao như một thứ trang sức: nón quai thao trở thành khái niệm chỉ chiếc nón quý, nón ngày hội trong văn học dân gian.', 2),
      y('Chiếc nón thượng có quai thao thường xuất hiện như vật trang trí, thể hiện sự sang trọng, trang trọng nhiều hơn là để che nắng, che mưa.', 1),
      y('Nón không chỉ che nắng mưa mà còn góp phần định hình phong thái: dáng nền nã, kín đáo của phụ nữ Bắc Bộ.', 3),
    ],
    diemDocDao: [
      y('Nón ba tầm thường dùng cho phụ nữ lớn tuổi khi lao động; nón thúng quai thao thường của phụ nữ trẻ trong dịp lễ hội.', 2),
    ],
    nguoiMacDip: [
      y('Phụ nữ Bắc Bộ; nhà khá giả hoặc dịp hội hè, cưới hỏi dùng nón có quai thao.', 2),
      y('Ngày nay nón quai thao chủ yếu xuất hiện ở lễ hội.', 5),
    ],
    conTranhLuan: [
      y('Các tên “nón quai thao”, “nón thúng”, “nón ba tầm” bị dùng lẫn lộn trong dân gian và trên mạng. Các nguồn trên cố gắng phân biệt nhưng cách gọi chưa thống nhất hoàn toàn.', 1, 2),
    ],
    trangThai: 'con-tranh-luan',
    lienQuan: ['non-la', 'ao-tu-than', 'yem'],
    phoiThu: { trangPhuc: 'Áo tứ thân', phuKien: ['Nón quai thao'] },
  },

  // ======================================================================= YẾM
  {
    slug: 'yem',
    ten: 'Yếm',
    tenKhac: 'yếm đào',
    nhom: 'phu-kien',
    vung: 'Bắc Bộ và nhiều vùng',
    thoiKy: 'Nhiều thế kỷ; giảm dần từ thế kỷ XX',
    tomTat:
      'Món đồ mặc trong của phụ nữ Việt thuộc mọi tầng lớp, nổi tiếng nhất là yếm đào; thường thấp thoáng dưới áo tứ thân.',
    nguon: [N.wikiYem, N.baoTangHaNoi, N.trinhBach, N.wikiAoDai],
    coTuThoiNao: [
      y('Yếm là món đồ mặc trong mà phụ nữ Việt thuộc mọi tầng lớp từng mặc; nhiều thế kỷ nay phụ nữ nông thôn mặc yếm bên trong áo ngoài, cùng váy.', 1, 4),
      y('Năm 1407 nhà Minh ép phụ nữ Đại Việt mặc quần kiểu Hán. Nhà Lê sau đó chê trách phụ nữ vi phạm lễ giáo nhưng thực thi không đều, nên váy và yếm vẫn là trang phục phổ biến.', 4),
    ],
    hanhTrinh: [
      moc('1407', 'Nhà Minh ép phụ nữ mặc quần; váy và yếm vẫn bền bỉ.', 4),
      moc('1914–1920', 'Ảnh Hà Nội: yếm thấp thoáng dưới áo tứ thân; phụ nữ cũng mặc “áo yếm” với nón ba tầm.', 2),
      moc('Thế kỷ XX', 'Cùng quá trình Tây hoá, phụ nữ dần bỏ yếm để dùng áo ngực kiểu phương Tây.', 1),
      moc('Gần đây', 'Các nhà thiết kế làm lại dưới tên “áo yếm”, một dạng áo hiện đại được giới trẻ ưa chuộng.', 1),
    ],
    nhanBiet: [
      y('Mặc bên trong, dưới áo ngoài; váy mặc cùng yếm gọi là váy đụp.', 1),
      y('Một số kiểu yếm có túi nhỏ bên trong để đựng xạ hương hoặc chút hương thơm.', 1),
    ],
    yNghia: [
      y('Yếm đào xuất hiện nhiều trong thơ ca ca ngợi vẻ đẹp người con gái.', 1),
      y('Trong câu chuyện cải cách trang phục Đàng Trong, việc “bỏ áo tứ thân phơi yếm” để mặc áo ngũ thân cài khuy được kể như một cách tách khỏi lối ăn mặc phía Bắc.', 3),
    ],
    diemDocDao: [
      y('Chất liệu và màu sắc yếm thay đổi theo địa vị và dịp mặc.', 1),
      y('Ở Hà Nội đầu thế kỷ XX, yếm có thể hồng cánh sen, vàng nhạt hay xanh thiên thanh, được chọn sao cho hài hoà với áo và thắt lưng lụa.', 2),
    ],
    nguoiMacDip: [
      y('Phụ nữ mọi tầng lớp; gắn nhiều với áo tứ thân của phụ nữ lao động, tiểu thương.', 1, 2),
    ],
    conTranhLuan: [
      y('Có ý kiến cho rằng yếm có thể bắt nguồn từ dudou của Trung Hoa. Nguồn dùng chữ “có thể”, chưa phải kết luận chắc chắn.', 1),
    ],
    trangThai: 'da-doi-chieu',
    lienQuan: ['ao-tu-than', 'non-quai-thao'],
    phoiThu: { trangPhuc: 'Áo tứ thân', phuKien: ['Yếm đào'] },
  },

  // ================================================================ KHĂN ĐÓNG
  {
    slug: 'khan-dong',
    ten: 'Khăn đóng',
    tenKhac: 'khăn xếp, khăn vấn',
    nhom: 'phu-kien',
    vung: 'Huế và Trung Bộ (nam giới); nhiều vùng',
    thoiKy: 'Phổ biến từ thời các chúa Nguyễn',
    tomTat:
      'Khăn đội đầu của nam giới đi cùng áo dài ngũ thân; có hai kiểu quấn phổ biến là chữ nhân và chữ nhất.',
    nguon: [N.wikiKhanVan, N.sggpKhanLuong, N.plvnNguThan, N.trinhBach],
    coTuThoiNao: [
      y('Khăn vấn (còn gọi khăn đóng, khăn xếp) là kiểu khăn quấn đầu của người Việt, trở nên phổ biến từ thời các chúa Nguyễn.', 1),
      y('Ghi chép của Borri (thế kỷ XVII) cho biết đàn ông Nam Hà để tóc dài và quấn khăn như phụ nữ.', 4),
    ],
    hanhTrinh: [
      moc('Thế kỷ XVII', 'Đàn ông Nam Hà để tóc dài và quấn khăn.', 4),
      moc('Thời Nguyễn', 'Khăn đội cùng áo ngũ thân; các vua cuối triều Nguyễn vẫn đội khăn đóng.', 1, 3),
      moc('Thời Bảo Đại và Ngô Đình Diệm', 'Bộ khăn đóng áo dài gần như là quốc phục của nam giới khi tiếp khách nước ngoài.', 3),
    ],
    nhanBiet: [
      y('Hai kiểu quấn phổ biến của nam: chữ nhân (nếp gấp trên trán giống chữ 人) và chữ nhất (一), thường bảy vòng.', 1),
      y('Về sau người ta làm sẵn khăn (gọi khăn xếp hay khăn đóng), xếp bảy tầng vải chồng lên nhau, tầng dưới cùng bắt chéo để thành chữ “nhân”.', 2),
      y('Khăn xếp thường may bằng vải đen; có thể thay bằng khăn quấn bằng nhiễu.', 3),
    ],
    yNghia: [
      y('Lưu ý: đây là cách lý giải văn hoá của bài báo, không phải sử liệu.', 2, 3),
      y('Khăn “lương” gợi lương thiện, lương tâm; vòng khăn đầu tiên xếp thành chữ “nhân” nhắc người đội giữ nhân cách.', 2),
      y('Khăn vấn chữ nhân, chữ nhất được xem là biểu tượng của việc coi trọng tính Người, lòng cương trực, thẳng thắn, nhất tâm của người đàn ông.', 3),
    ],
    diemDocDao: [
      y('Đàn ông mặc áo dài phải kèm khăn đóng mới đủ “lệ bộ”.', 3),
      y('Nữ cũng có dạng khăn vấn riêng (khăn rí, khăn lương) và khăn vành dây, khăn vành hay mũ mấn dành cho giới quý tộc, hoàng thất trong dịp trang trọng.', 1),
    ],
    nguoiMacDip: [
      y('Nam giới đi cùng áo dài ngũ thân; ngày nay thường thấy trong nghi lễ, ngoại giao và các hoạt động văn hoá.', 3),
    ],
    conTranhLuan: [
      y('Các nguồn dùng các tên khăn đóng, khăn xếp, khăn vấn, khăn lương gần nhau và chưa phân biệt thống nhất cách làm, cách đội.', 1, 2),
    ],
    trangThai: 'da-doi-chieu',
    lienQuan: ['ao-ngu-than', 'ao-tac'],
    phoiThu: { trangPhuc: 'Áo dài', phuKien: ['Khăn đóng'] },
  },

  // ================================================== MỤC CHƯA KIỂM CHỨNG (ĐỎ)
  {
    slug: 'khan-ran',
    ten: 'Khăn rằn',
    nhom: 'phu-kien',
    vung: 'Nam Bộ',
    thoiKy: 'Chưa xác định',
    tomTat:
      'Chiếc khăn kẻ ô quen thuộc của người Nam Bộ, đi cùng áo bà ba và nón lá. Hiện chưa đủ nguồn để viết sâu hơn.',
    canhBaoDo:
      'CHƯA KIỂM CHỨNG ĐỦ NGUỒN. Hiện chỉ có một bài phỏng vấn trên báo và một trang du lịch phổ thông; chưa có nghiên cứu học thuật hay tư liệu bảo tàng về khăn rằn của Việt Nam. Các ý dưới đây chỉ là thông tin sơ bộ, chưa nên trích dẫn.',
    nguon: [N.baoLaoCaiKhanRan, N.miaKhanRan],
    coTuThoiNao: [
      y('Trang phổ thông cho biết chưa có nhà nghiên cứu nào xác định được chính xác khăn rằn có từ bao giờ; có giả thuyết cho rằng nó có nguồn gốc từ khăn krama của người Khmer.', 2),
    ],
    hanhTrinh: [],
    nhanBiet: [],
    yNghia: [
      y('Soạn giả Nhâm Hùng (tác giả cuốn “Văn hoá khăn rằn”) nói khăn rằn cùng áo bà ba và nón lá gắn bó với người phương Nam hàng trăm năm, biểu trưng cho sự nồng hậu, nghĩa tình, chất phác.', 1),
      y('Trang phổ thông ghi khăn dùng che nắng, che sương, thấm mồ hôi khi lao động và đã đi cùng các cuộc kháng chiến.', 2),
    ],
    diemDocDao: [],
    nguoiMacDip: [],
    conTranhLuan: [
      y('Giả thuyết liên hệ với krama của người Khmer mới là giả thuyết, chưa có nguồn nghiên cứu để kiểm chứng. Krama là biểu tượng riêng của văn hoá Campuchia (đã được UNESCO ghi danh năm 2024), nên không nên suy ra quan hệ khi chưa có tài liệu.', 2),
    ],
    trangThai: 'chua-kiem-chung',
    lienQuan: ['ao-ba-ba', 'non-la'],
    phoiThu: {
      trangPhuc: 'Áo bà ba',
      phuKien: ['Khăn rằn'],
      ghiChu: 'Phụ kiện này chưa được kiểm chứng nguồn. Hãy xem kết quả phối với sự thận trọng.',
    },
  },
  {
    slug: 'khan-mo-qua',
    ten: 'Khăn mỏ quạ',
    nhom: 'phu-kien',
    vung: 'Bắc Bộ (theo nguồn phổ thông)',
    thoiKy: 'Chưa xác định',
    tomTat:
      'Khăn đội đầu được nhắc đến cùng áo tứ thân, yếm và nón quai thao. Chưa có nguồn đủ tin cậy để mô tả riêng.',
    canhBaoDo:
      'CHƯA CÓ NGUỒN KIỂM CHỨNG. Nhóm chưa tìm được tài liệu học thuật, bảo tàng hay báo chí chính thống mô tả riêng về khăn mỏ quạ (cách vấn, chất liệu, niên đại, vùng dùng). Thông tin duy nhất tìm thấy là tên gọi được nhắc trong một trang văn mẫu. Vì vậy trang này cố ý để trống, không viết thêm.',
    nguon: [N.luatMinhKhue, N.baoTangHaNoi, N.wikiTuThan],
    coTuThoiNao: [],
    hanhTrinh: [],
    nhanBiet: [],
    yNghia: [],
    diemDocDao: [],
    nguoiMacDip: [
      y('Một trang phổ thông nhắc khăn mỏ quạ như phụ kiện thường đi cùng áo tứ thân, yếm và nón quai thao. Đây là thông tin duy nhất, chưa kiểm chứng.', 1),
    ],
    conTranhLuan: [
      y('Các nguồn đáng tin ghi nhận khăn đội đầu của phụ nữ Bắc Bộ xưa là khăn nhung, khăn the (Bảo tàng Hà Nội) và khăn vấn (Wikipedia, ảnh minh hoạ áo tứ thân). Nhóm chưa tìm được nguồn nối các loại khăn này với tên “khăn mỏ quạ”.', 2, 3),
    ],
    trangThai: 'chua-kiem-chung',
    lienQuan: ['ao-tu-than', 'non-quai-thao', 'yem'],
    phoiThu: {
      trangPhuc: 'Áo tứ thân',
      phuKien: ['Khăn mỏ quạ'],
      ghiChu: 'Phụ kiện này chưa được kiểm chứng nguồn. Hãy xem kết quả phối với sự thận trọng.',
    },
  },
];

// ===== Dòng thời gian chung =====
export interface MocLichSu {
  moc: string;
  tieuDe: string;
  moTa: string;
  slug: string;
  tranhLuan?: boolean;
}

export const DONG_THOI_GIAN: MocLichSu[] = [
  {
    moc: 'Thế kỷ XIV',
    tieuDe: 'Giao lĩnh trong tranh vua Trần',
    moTa: 'Tranh vẽ Trần Anh Tông mặc áo viên lĩnh bên trong, giao lĩnh phủ ngoài.',
    slug: 'ao-giao-linh',
  },
  {
    moc: '1407',
    tieuDe: 'Áp lực “quần Hán” và sức bền của váy – yếm',
    moTa: 'Nhà Minh ép phụ nữ mặc quần kiểu Hán. Nhà Lê sau đó chê trách nhưng thực thi không đều, nên váy và yếm vẫn phổ biến.',
    slug: 'yem',
  },
  {
    moc: 'Thời Lê Trung Hưng',
    tieuDe: 'Giao lĩnh lên ngôi',
    moTa: 'Giao lĩnh trở thành kiểu áo nổi bật, cùng mũ bình đính, dần thay áo viên lĩnh.',
    slug: 'ao-giao-linh',
  },
  {
    moc: 'Thế kỷ XVII (tương truyền)',
    tieuDe: 'Lời khuyên đổi trang phục Đàng Trong',
    moTa: 'Theo sử gia Phan Khoang, Đào Duy Từ khuyên chúa Nguyễn đổi cách ăn mặc: bỏ nón thượng, bỏ áo tứ thân phơi yếm, mặc áo ngũ thân cài khuy.',
    slug: 'ao-ngu-than',
    tranhLuan: true,
  },
  {
    moc: '1744',
    tieuDe: 'Cải cách y phục Đàng Trong',
    moTa: 'Mốc phổ biến cho áo ngũ thân theo Phủ biên tạp lục. Một nghiên cứu cho rằng đoạn ghi chép này nói về áo ngắn hẹp tay, không phải áo dài.',
    slug: 'ao-ngu-than',
    tranhLuan: true,
  },
  {
    moc: 'Thế kỷ XIX',
    tieuDe: 'Ngũ thân thành quốc phục',
    moTa: 'Triều Nguyễn thống nhất trang phục Bắc – Nam. Phụ nữ lao động Bắc Bộ vẫn mặc tứ thân; triều đình dùng áo nhật bình làm lễ phục.',
    slug: 'ao-nhat-binh',
  },
  {
    moc: 'Cuối XIX – đầu XX',
    tieuDe: 'Áo bà ba phổ biến ở Nam Bộ',
    moTa: 'Nguồn gốc có nhiều giả thuyết (liên hệ kebaya Baba–Nyonya, hoặc từ dạng áo ngắn Đàng Trong); giai đoạn phổ biến mạnh là cuối XIX – đầu XX.',
    slug: 'ao-ba-ba',
    tranhLuan: true,
  },
  {
    moc: '1914–1920',
    tieuDe: 'Hà Nội giao thời',
    moTa: 'Ảnh tư liệu cho thấy tiểu thương mặc tứ thân đội nón ba tầm, còn phụ nữ trung lưu mặc ngũ thân dịp lễ Tết, cưới hỏi.',
    slug: 'ao-tu-than',
  },
  {
    moc: 'Thập niên 1930',
    tieuDe: 'Le Mur và Lê Phổ cách tân áo ngũ thân',
    moTa: 'Áo ôm thân hơn, bỏ nối sống giữa; ngày 23/2/1934 Cát Tường trình bày ý tưởng trên báo Phong Hoá.',
    slug: 'ao-dai',
    tranhLuan: true,
  },
  {
    moc: '1947',
    tieuDe: 'Kêu gọi mặc áo vắn tiết kiệm',
    moTa: 'Áo dài không còn thông dụng ở miền Bắc trong thời gian dài.',
    slug: 'ao-dai',
  },
  {
    moc: 'Thập niên 1950–1960',
    tieuDe: 'Lưng ong, raglan và áo dài bà Nhu',
    moTa: 'Sài Gòn thu eo, tạo tay raglan; kiểu cổ thuyền gắn với năm 1958 hoặc 1961 tuỳ nguồn.',
    slug: 'ao-dai',
    tranhLuan: true,
  },
  {
    moc: '1967–1971',
    tieuDe: 'Áo dài mini và “hippy”',
    moTa: 'Bằng chứng rằng việc làm mới áo dài đã diễn ra từ lâu trước thời Gen Z.',
    slug: 'ao-dai',
  },
  {
    moc: '2017 → nay',
    tieuDe: 'Phong trào Việt phục của giới trẻ',
    moTa: 'Câu lạc bộ Áo dài nam truyền thống (2017); các hoạt động kỷ niệm 280 năm cải cách 1744 vào năm 2024.',
    slug: 'ao-ngu-than',
  },
];

// ===== So sánh nhanh =====
export const BANG_SO_SANH = {
  cot: ['Trang phục', 'Vùng / thời kỳ', 'Ai mặc', 'Cách cài', 'Nhận diện'],
  hang: [
    ['Áo giao lĩnh', 'Đại Việt, thế kỷ XIV – XVIII', 'Quý tộc, nho sĩ', 'Vạt chéo, không khuy', 'Cổ chéo'],
    ['Áo ngũ thân', 'Thuận Hoá → cả nước (mốc ra đời còn tranh luận)', 'Nam và nữ', 'Khuy bên phải', 'Năm thân, cổ đứng thấp, vạt con ở trong'],
    ['Áo tứ thân', 'Bắc Bộ', 'Nữ lao động, tiểu thương', 'Không khuy; buộc hoặc buông hai tà trước', 'Bốn thân + yếm + váy'],
    ['Áo dài hiện đại', 'Toàn quốc, từ thập niên 1930', 'Chủ yếu nữ', 'Khuy bên hông', 'Hai thân ôm dáng, vẫn mang dạng năm thân'],
    ['Áo bà ba', 'Nam Bộ, cuối XIX – đầu XX', 'Nam và nữ (nông dân)', 'Nút giữa thân trước', 'Áo ngắn trùm mông + quần; hai túi lớn dưới vạt trước'],
    ['Áo nhật bình', 'Cung đình triều Nguyễn', 'Mệnh phụ, cung tần', 'Lễ phục đại triều', 'Cổ hình chữ nhật thêu đoàn phượng, đoàn loan'],
  ],
};

// ===== Đố vui (chỉ dùng nội dung đã có nguồn; không hỏi về mục chưa kiểm chứng) =====
export interface CauDoVui {
  hoi: string;
  luaChon: string[];
  dapAn: number;
  giaiThich: string;
  slug: string;
}

export const DO_VUI: CauDoVui[] = [
  {
    hoi: 'Theo Phủ biên tạp lục, chúa Nguyễn Phúc Khoát ban cải cách y phục Đàng Trong vào năm nào?',
    luaChon: ['1644', '1744', '1844', '1930'],
    dapAn: 1,
    giaiThich: 'Đó là năm 1744 (Giáp Tý). Tuy nhiên một nghiên cứu cho rằng đoạn ghi chép này nói về áo ngắn hẹp tay, và áo ngũ thân có thể đã hình thành sớm hơn.',
    slug: 'ao-ngu-than',
  },
  {
    hoi: 'Áo nào KHÔNG cài khuy phía trước mà hai vạt được khép lại và giữ bằng dây lưng?',
    luaChon: ['Áo ngũ thân', 'Áo tứ thân', 'Áo bà ba', 'Áo dài hai thân'],
    dapAn: 1,
    giaiThich: 'Áo tứ thân không có khuy; phụ nữ nông thôn Bắc Bộ giữ cách mặc này đến giữa thế kỷ XX.',
    slug: 'ao-tu-than',
  },
  {
    hoi: 'Ngày 23/2/1934, hoạ sĩ Cát Tường (Le Mur) trình bày ý tưởng cách tân áo dài trên tờ báo nào?',
    luaChon: ['Phong Hoá', 'Nam Phong', 'Phụ nữ tân văn', 'Tri Tân'],
    dapAn: 0,
    giaiThich: 'Ông viết trên báo Phong Hoá, cho rằng cổ áo là phần thừa và tay áo bất tiện.',
    slug: 'ao-dai',
  },
  {
    hoi: 'Nón bài thơ nổi tiếng với vùng đất nào?',
    luaChon: ['Huế', 'Cần Thơ', 'Bắc Ninh', 'Đà Lạt'],
    dapAn: 0,
    giaiThich: 'Nón bài thơ Huế có lá mỏng trắng, giữa hai lớp lá lồng hình hoặc câu thơ, soi lên ánh sáng mới thấy.',
    slug: 'non-la',
  },
  {
    hoi: 'Theo cách lý giải phổ biến, năm khuy cài của áo ngũ thân tượng trưng cho điều gì?',
    luaChon: ['Năm vị vua đầu triều Nguyễn', 'Năm thành phố lớn', 'Ngũ thường: nhân, lễ, nghĩa, trí, tín', 'Năm đời chúa Nguyễn'],
    dapAn: 2,
    giaiThich: 'Nhiều bài báo và Bảo tàng Hà Nội nhắc cách lý giải này. Đây là ý nghĩa biểu tượng văn hoá, không phải sử liệu.',
    slug: 'ao-ngu-than',
  },
  {
    hoi: 'Ngày nay áo nhật bình (áo mệnh phụ) còn được dùng làm gì?',
    luaChon: ['Áo cưới của cô dâu, và tăng ni Phật giáo mặc', 'Đồng phục học sinh', 'Áo lao động ngoài đồng', 'Áo mưa'],
    dapAn: 0,
    giaiThich: 'Theo Trịnh Bách, ở Việt Nam ngày nay áo mệnh phụ chủ yếu còn được dùng làm áo cưới, và tăng ni cũng mặc áo nhật bình.',
    slug: 'ao-nhat-binh',
  },
];

// ===== Tiện ích =====
export function layMucTheoSlug(slug: string): MucVanHoa | undefined {
  return CAC_MUC.find((m) => m.slug === slug);
}

export function layCacMucLienQuan(muc: MucVanHoa): MucVanHoa[] {
  return muc.lienQuan.map((s) => layMucTheoSlug(s)).filter((m): m is MucVanHoa => Boolean(m));
}

/** Tên trang phục / phụ kiện trong database -> slug trang văn hoá tương ứng. */
export const SLUG_THEO_TEN: Record<string, string> = {
  'Áo dài': 'ao-dai',
  'Áo tứ thân': 'ao-tu-than',
  'Áo bà ba': 'ao-ba-ba',
  'Nón lá': 'non-la',
  'Nón quai thao': 'non-quai-thao',
  'Yếm đào': 'yem',
  'Khăn rằn': 'khan-ran',
  'Khăn mỏ quạ': 'khan-mo-qua',
  'Khăn đóng': 'khan-dong',
};

export function laySlugTheoTen(ten: string): string | null {
  const khoa = ten.normalize('NFC').trim();
  const tim = Object.keys(SLUG_THEO_TEN).find((k) => k.normalize('NFC') === khoa);
  return tim ? SLUG_THEO_TEN[tim] : null;
}

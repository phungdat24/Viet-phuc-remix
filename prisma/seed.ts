import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ trước, để chạy lại seed nhiều lần không bị trùng
  await prisma.toHopDuocDuyet.deleteMany();
  await prisma.quyTacPhuHop.deleteMany();
  await prisma.danhGiaMauSac.deleteMany();
  await prisma.noiDungVanHoa.deleteMany();
  await prisma.suKien.deleteMany();
  await prisma.phuKien.deleteMany();
  await prisma.mauSac.deleteMany();
  await prisma.trangPhuc.deleteMany();

  // 1. Trang phục
  const aoDai = await prisma.trangPhuc.create({
    data: { ten: 'Áo dài', vungMien: 'Toàn quốc', doiTuong: 'Nam & Nữ' },
  });
  const aoTuThan = await prisma.trangPhuc.create({
    data: { ten: 'Áo tứ thân', vungMien: 'Kinh Bắc', doiTuong: 'Nữ' },
  });
  const aoBaBa = await prisma.trangPhuc.create({
    data: { ten: 'Áo bà ba', vungMien: 'Nam Bộ', doiTuong: 'Nam & Nữ' },
  });

  // 2. Nội dung văn hóa (E1 - nguồn: tài liệu "Việt phục - Remix", TRẠNG THÁI: chờ rà soát nội bộ)
  // TODO(E1): các mục có ghi "cần tra cứu link" phải xác nhận nguồn thật trước khi nộp bài.
  await prisma.noiDungVanHoa.createMany({
    data: [
      // ----- Áo dài -----
      {
        trangPhucId: aoDai.id,
        tieuDe: 'Nguồn gốc Áo dài',
        noiDung:
          'Tiền thân của áo dài Việt Nam được nhiều nhà nghiên cứu đồng thuận là chiếc áo tứ thân, trang phục quen thuộc của phụ nữ nông thôn Bắc Bộ xưa. Theo nhà nghiên cứu Trịnh Bách, áo tứ thân (mở dọc giữa hai vạt trước) có sự tương đồng với áo "Bối tử" từ triều Minh (Trung Quốc), nhưng đã được phụ nữ Việt cải biên vạt ngắn hơn để tiện lao động và thêm cổ đứng che tóc. Tuy nhiên, ông cũng nhấn mạnh rằng người Việt không dễ dàng tiếp nhận văn hóa ngoại lai trong thời kỳ kháng chiến, và chiếc áo dài đã được người Việt sáng tạo với những nét độc đáo riêng, đưa nó vươn tầm quốc tế.',
        nguonThamKhao:
          'Cổng TTĐT Hội Liên hiệp Phụ nữ Việt Nam (Nghiên cứu của Trịnh Bách) / Tạp chí Nghiên cứu và Phát triển',
      },
      {
        trangPhucId: aoDai.id,
        tieuDe: 'Sự hình thành Áo ngũ thân',
        noiDung:
          'Áo ngũ thân xuất hiện từ năm 1744 gắn liền với cuộc cải cách trang phục ở Đàng Trong do chúa Nguyễn Phúc Khoát khởi xướng, nhằm tạo sự phân biệt với Đàng Ngoài. Trang phục này được may từ 5 mảnh vải, với 2 thân trước, 2 thân sau và 1 thân con ẩn bên phải. Đến đầu thế kỷ 19, dưới thời Hoàng đế Minh Mạng, áo ngũ thân tiếp tục được chọn làm trang phục chung và trở thành Quốc phục phổ biến trên cả nước từ năm 1837 đến 1945.',
        nguonThamKhao: 'Nghiên cứu Lịch sử Áo dài (Đại học Văn Hiến) / Kỷ yếu áo dài ngũ thân',
      },
      {
        trangPhucId: aoDai.id,
        tieuDe: 'Ý nghĩa văn hóa của Áo ngũ thân',
        noiDung:
          'Áo ngũ thân mang đậm triết lý sống của người Việt, trong đó bốn thân ngoài tượng trưng cho "tứ thân phụ mẫu" (cha mẹ ruột và cha mẹ chồng/vợ), còn thân áo nhỏ bên trong đại diện cho chính bản thân người mặc. Đặc biệt, chiếc áo luôn có 5 khuy cài tượng trưng cho "ngũ luân" (vua tôi, cha con, vợ chồng, anh em, bạn bè) và "ngũ thường" (Nhân - Lễ - Nghĩa - Trí - Tín) trong đạo đức Á Đông. Mặc áo ngũ thân được xem như mang trên mình đạo làm người và giữ gìn sự nền nã, chuẩn mực.',
        nguonThamKhao: 'Bảo tàng Áo dài / Nghiên cứu Văn hóa Việt Nam',
      },

      // ----- Áo tứ thân -----
      {
        trangPhucId: aoTuThan.id,
        tieuDe: 'Nguồn gốc Áo tứ thân',
        noiDung:
          'Áo tứ thân là trang phục gắn liền với đời sống của người phụ nữ nông thôn Bắc Bộ xưa, đặc biệt phổ biến trước thế kỷ 20. Theo nhiều nhà nghiên cứu, chiếc áo này có thể bắt nguồn từ trang phục của phụ nữ thời Lý – Trần, nhưng được cải tiến qua thời gian để phù hợp hơn với việc đồng áng. Tuy không có tài liệu ghi chép chính xác mốc thời gian xuất hiện, áo tứ thân luôn được công nhận là biểu tượng của vẻ đẹp mộc mạc, chất phác, phản ánh đậm nét văn hóa lúa nước của vùng Kinh Bắc.',
        nguonThamKhao:
          'Sách "Ngàn năm áo mũ" (Trần Quang Đức) / Trung tâm Bảo tồn Di sản Quan họ Bắc Ninh',
      },
      {
        trangPhucId: aoTuThan.id,
        tieuDe: 'Cấu tạo và đặc điểm',
        noiDung:
          'Về thiết kế, áo tứ thân không có khuy cài, gồm hai vạt trước để buông thõng hoặc buộc chéo trước bụng, và hai vạt sau may liền lại với nhau tạo thành một sống áo chạy dọc lưng. Thiết kế xẻ tà mở ở phía trước kết hợp cùng chiếc yếm đào bên trong, váy đụp đen và thắt lưng lụa không chỉ tạo sự thoải mái khi làm việc mà còn tôn lên vẻ duyên dáng kín đáo. Trang phục này thường đi kèm với khăn mỏ quạ và nón quai thao trong các dịp lễ hội.',
        nguonThamKhao: 'Bảo tàng Phụ nữ Việt Nam / Tạp chí Di sản Văn hóa',
      },
      {
        trangPhucId: aoTuThan.id,
        tieuDe: 'Ý nghĩa biểu tượng',
        noiDung:
          'Ngoài giá trị thẩm mỹ, áo tứ thân mang nhiều tầng ý nghĩa đạo lý sâu sắc. Bốn tà áo được cho là tượng trưng cho tứ thân phụ mẫu (cha mẹ ruột và cha mẹ chồng), thể hiện đạo hiếu của người phụ nữ. Sống áo phía sau được ghép từ hai vạt áo tượng trưng cho sự gắn bó sắt son của tình nghĩa vợ chồng. Một số biến thể về sau có hàng khuy, thường là 5 chiếc, đại diện cho ngũ thường: Nhân, Nghĩa, Lễ, Trí, Tín.',
        nguonThamKhao: 'Báo Văn hóa / Viện Nghiên cứu Văn hóa',
      },

      // ----- Áo bà ba -----
      {
        trangPhucId: aoBaBa.id,
        tieuDe: 'Nguồn gốc Áo bà ba',
        noiDung:
          'Áo bà ba là trang phục mang đậm dấu ấn văn hóa của người dân Nam Bộ. Về xuất xứ, hiện chưa có tài liệu nói rõ nguồn gốc chính xác của áo bà ba xuất hiện vào thời điểm nào, và đây chỉ là một trong các giả thuyết được ghi nhận. Một số nhà nghiên cứu, tiêu biểu như nhà văn Sơn Nam, cho rằng kiểu áo này có thể được du nhập từ đảo Penang (Malaysia) vào khoảng nửa cuối thế kỷ 19, sau đó được người Việt cách tân, xẻ tà, thêm túi để phù hợp với điều kiện lao động và khí hậu miền sông nước.',
        nguonThamKhao: 'Sách "Đất Gia Định xưa" (Sơn Nam) / Tạp chí Nghiên cứu Lịch sử',
      },
      {
        trangPhucId: aoBaBa.id,
        tieuDe: 'Đặc điểm và tính ứng dụng',
        noiDung:
          'Khác với sự cầu kỳ của nhiều trang phục truyền thống khác, áo bà ba được thiết kế tối giản: không có cổ áo, thân áo may bằng vải mềm, xẻ tà hai bên hông và thường có hai túi to ở vạt trước. Thiết kế mở này đặc biệt tiện lợi cho việc đồng áng, chèo xuồng và sinh hoạt hàng ngày của người nông dân. Qua thời gian, chiếc áo bà ba không chỉ là món đồ mặc thường ngày mà đã trở thành biểu tượng cho vẻ đẹp mộc mạc, đôn hậu và kiên cường của người phụ nữ Nam Bộ.',
        nguonThamKhao: 'Bảo tàng Phụ nữ Nam Bộ / Cổng thông tin điện tử Sở Văn hóa',
      },
    ],
  });

  // 3. Màu sắc truyền thống (kèm góc hue đã tính ở Lớp 2)
  await prisma.mauSac.createMany({
    data: [
      { ten: 'Đỏ son', maHex: '#A73B2C', gocHue: 7, laTrungTinh: false },
      { ten: 'Vàng nhũ', maHex: '#C9A227', gocHue: 46, laTrungTinh: false },
      { ten: 'Lam chàm', maHex: '#33415C', gocHue: 220, laTrungTinh: false },
      { ten: 'Nâu non', maHex: '#8A6642', gocHue: 30, laTrungTinh: true },
      { ten: 'Trắng ngà', maHex: '#F1E7D2', gocHue: 40, laTrungTinh: true },
      { ten: 'Đen huyền', maHex: '#241F1B', gocHue: 20, laTrungTinh: true },
      { ten: 'Hồng đào', maHex: '#E3A2A0', gocHue: 2, laTrungTinh: false },
      { ten: 'Lục ngọc', maHex: '#3F6B52', gocHue: 146, laTrungTinh: false },
      { ten: 'Tím Huế', maHex: '#6B4C6E', gocHue: 295, laTrungTinh: false },
      { ten: 'Be pastel', maHex: '#E4D3B4', gocHue: 35, laTrungTinh: true },
    ],
  });

  // 4. Phụ kiện (lưu lại biến để dùng nối quy tắc phù hợp bên dưới)
  const nonLa = await prisma.phuKien.create({ data: { ten: 'Nón lá', vungMien: 'Toàn quốc' } });
  const tramCai = await prisma.phuKien.create({ data: { ten: 'Trâm cài', vungMien: 'Toàn quốc' } });
  const khanDong = await prisma.phuKien.create({ data: { ten: 'Khăn đóng', vungMien: 'Huế' } });
  const khanMoQua = await prisma.phuKien.create({ data: { ten: 'Khăn mỏ quạ', vungMien: 'Kinh Bắc' } });
  const nonQuaiThao = await prisma.phuKien.create({ data: { ten: 'Nón quai thao', vungMien: 'Kinh Bắc' } });
  const quatGiay = await prisma.phuKien.create({ data: { ten: 'Quạt giấy', vungMien: 'Toàn quốc' } });
  const guocMoc = await prisma.phuKien.create({ data: { ten: 'Guốc mộc', vungMien: 'Toàn quốc' } });
  const yemDao = await prisma.phuKien.create({ data: { ten: 'Yếm đào', vungMien: 'Kinh Bắc' } });
  const khanRan = await prisma.phuKien.create({ data: { ten: 'Khăn rằn', vungMien: 'Nam Bộ' } });

  // 5. Sự kiện / dịp
  await prisma.suKien.createMany({
    data: [
      { ten: 'Tết' },
      { ten: 'Lễ hội' },
      { ten: 'Đi học, dạo phố' },
      { ten: 'Cưới hỏi' },
      { ten: 'Chụp ảnh nghệ thuật' },
    ],
  });

  // 6. Quy tắc phù hợp (Lớp 1 - dữ liệu cốt lõi cho tính năng cảnh báo văn hóa)
  await prisma.quyTacPhuHop.createMany({
    data: [
      { trangPhucId: aoDai.id, phuKienId: nonLa.id, mucDo: 'phu_hop', ghiChu: 'Nón lá phổ biến, hợp với áo dài mọi vùng miền.' },
      { trangPhucId: aoDai.id, phuKienId: tramCai.id, mucDo: 'phu_hop', ghiChu: 'Trâm cài thường đi cùng áo dài hiện đại.' },
      { trangPhucId: aoDai.id, phuKienId: quatGiay.id, mucDo: 'phu_hop', ghiChu: 'Quạt giấy hợp áo dài trong dịp lễ hội.' },
      { trangPhucId: aoDai.id, phuKienId: guocMoc.id, mucDo: 'phu_hop', ghiChu: 'Guốc mộc phù hợp với hầu hết trang phục truyền thống.' },
      { trangPhucId: aoDai.id, phuKienId: khanMoQua.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn mỏ quạ là đặc trưng riêng của áo tứ thân, không phải áo dài.' },
      { trangPhucId: aoDai.id, phuKienId: khanRan.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn rằn gắn với áo bà ba Nam Bộ, không phải áo dài.' },

      { trangPhucId: aoTuThan.id, phuKienId: khanMoQua.id, mucDo: 'phu_hop', ghiChu: 'Khăn mỏ quạ là đặc trưng riêng của áo tứ thân vùng Kinh Bắc.' },
      { trangPhucId: aoTuThan.id, phuKienId: nonQuaiThao.id, mucDo: 'phu_hop', ghiChu: 'Nón quai thao đi cùng áo tứ thân trong hội quan họ.' },
      { trangPhucId: aoTuThan.id, phuKienId: yemDao.id, mucDo: 'phu_hop', ghiChu: 'Yếm đào là lớp trong đặc trưng của áo tứ thân.' },
      { trangPhucId: aoTuThan.id, phuKienId: nonLa.id, mucDo: 'phu_hop', ghiChu: 'Nón lá cũng thường thấy khi mặc áo tứ thân.' },
      { trangPhucId: aoTuThan.id, phuKienId: guocMoc.id, mucDo: 'phu_hop', ghiChu: 'Guốc mộc phù hợp với hầu hết trang phục truyền thống.' },
      { trangPhucId: aoTuThan.id, phuKienId: khanDong.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn đóng gắn với lễ phục miền Trung, không phải áo tứ thân.' },
      { trangPhucId: aoTuThan.id, phuKienId: khanRan.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn rằn gắn với áo bà ba Nam Bộ, không phải áo tứ thân.' },

      { trangPhucId: aoBaBa.id, phuKienId: khanRan.id, mucDo: 'phu_hop', ghiChu: 'Khăn rằn là phụ kiện biểu tượng đi cùng áo bà ba Nam Bộ.' },
      { trangPhucId: aoBaBa.id, phuKienId: nonLa.id, mucDo: 'phu_hop', ghiChu: 'Nón lá rất phổ biến khi mặc áo bà ba.' },
      { trangPhucId: aoBaBa.id, phuKienId: guocMoc.id, mucDo: 'phu_hop', ghiChu: 'Guốc mộc phù hợp với hầu hết trang phục truyền thống.' },
      { trangPhucId: aoBaBa.id, phuKienId: khanMoQua.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn mỏ quạ là đặc trưng riêng của áo tứ thân, không phải áo bà ba.' },
      { trangPhucId: aoBaBa.id, phuKienId: nonQuaiThao.id, mucDo: 'khong_phu_hop', ghiChu: 'Nón quai thao gắn với áo tứ thân Kinh Bắc, không phải áo bà ba.' },
      { trangPhucId: aoBaBa.id, phuKienId: khanDong.id, mucDo: 'khong_phu_hop', ghiChu: 'Khăn đóng gắn với lễ phục miền Trung, không phải áo bà ba.' },
    ],
  });

  // 7. Đánh giá màu sắc (Lớp 2 - chỉ 4 câu mẫu, AI chỉ cần sinh 1 lần duy nhất)
  await prisma.danhGiaMauSac.createMany({
    data: [
      { mucDo: 'tuong_dong', noiDungAiSinh: 'Hai tông màu gần nhau tạo cảm giác nhẹ nhàng, hài hoà, dễ mặc trong nhiều dịp.' },
      { mucDo: 'bo_tuc', noiDungAiSinh: 'Hai màu gần như đối lập tạo điểm nhấn mạnh mẽ, nổi bật, phù hợp dịp trang trọng.' },
      { mucDo: 'trung_tinh', noiDungAiSinh: 'Phối cùng một tông trung tính luôn an toàn, dễ mặc mọi hoàn cảnh.' },
      { mucDo: 'lech_tong', noiDungAiSinh: 'Hai màu có phần lệch tông, nên cân nhắc thêm một chi tiết trung tính để cân bằng.' },
    ],
  });

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
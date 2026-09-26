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

  // 2. Nội dung văn hóa (kèm nguồn tham khảo)
  await prisma.noiDungVanHoa.createMany({
    data: [
      {
        trangPhucId: aoDai.id,
        tieuDe: 'Nguồn gốc Áo dài',
        noiDung: 'Áo dài hiện đại định hình từ thế kỷ 20, biến hoá từ áo ngũ thân, hai tà xẻ dài đến gót.',
        nguonThamKhao: 'Bảo tàng Phụ nữ Việt Nam',
      },
      {
        trangPhucId: aoTuThan.id,
        tieuDe: 'Nguồn gốc Áo tứ thân',
        noiDung: 'Gồm hai tà trước buông thả, hai tà sau may liền, gắn liền với hát quan họ Kinh Bắc.',
        nguonThamKhao: 'Trung tâm Bảo tồn Di sản Quan họ Bắc Ninh',
      },
      {
        trangPhucId: aoBaBa.id,
        tieuDe: 'Nguồn gốc Áo bà ba',
        noiDung: 'Trang phục đặc trưng Nam Bộ, form dáng đơn giản, thoáng mát, phù hợp khí hậu sông nước.',
        nguonThamKhao: 'Bảo tàng Lịch sử Việt Nam - TP.HCM',
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
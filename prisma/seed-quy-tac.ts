import { PrismaClient } from '@prisma/client';
import { PHU_KIEN_THEO_TRANG_PHUC, chuanHoaTenPhuKien } from '../lib/phuKienTheoTrangPhuc';

const prisma = new PrismaClient();

/**
 * ĐỒNG BỘ quy tắc phụ kiện (Lớp 1) với thư viện văn hoá lib/vanHoa/duLieu.ts.
 *
 *   npx tsx prisma/seed-quy-tac.ts --thu    chỉ in những gì SẼ đổi, không ghi database
 *   npx tsx prisma/seed-quy-tac.ts          ghi thật (tạo mới + cập nhật quy tắc chung)
 *
 * NGUYÊN TẮC: ghiChu chỉ được nói điều mà duLieu.ts có nguồn. Mục "chua-kiem-chung"
 * (Khăn rằn, Khăn mỏ quạ) thì ghiChu phải nói rõ là chưa kiểm chứng.
 * Giọng: hướng dẫn ("thường gắn với…"), không phán xét ("sai", "lệch").
 */

type MucDo = 'phu_hop' | 'khong_phu_hop' | 'tuy_dip';

/** Các cặp NGOÀI danh sách phù hợp. Khoá: "Trang phục|Phụ kiện". Ghi đè cả mucDo lẫn ghiChu. */
const CAP_IT_PHU_HOP: Record<string, { mucDo: MucDo; ghiChu: string }> = {
  'Áo dài|Nón quai thao': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Nón quai thao thường gắn với phụ nữ đồng bằng Bắc Bộ trong ngày hội, nên quen thấy hơn với áo tứ thân. Nhóm chưa tìm thấy tư liệu về việc đội cùng áo dài.',
  },
  'Áo dài|Khăn mỏ quạ': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Khăn mỏ quạ thường được nhắc cùng áo tứ thân Bắc Bộ. Mục này chưa có nguồn kiểm chứng nên đây chỉ là gợi ý thận trọng.',
  },
  'Áo dài|Khăn rằn': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Khăn rằn thường được nhắc cùng áo bà ba và nón lá ở Nam Bộ. Mục này chưa kiểm chứng đủ nguồn nên đây chỉ là gợi ý thận trọng.',
  },
  'Áo dài|Yếm đào': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Yếm là món mặc bên trong và thường thấy thấp thoáng dưới áo tứ thân (theo ảnh tư liệu của Bảo tàng Hà Nội). Nhóm chưa tìm thấy tư liệu về yếm dưới áo dài.',
  },
  'Áo tứ thân|Khăn đóng': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Trong tư liệu của nhóm, khăn đóng gắn với nam giới và áo dài ngũ thân ở Huế. Nhóm chưa thấy tư liệu nối khăn đóng với áo tứ thân Bắc Bộ.',
  },
  'Áo tứ thân|Khăn rằn': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Khăn rằn thường được nhắc cùng áo bà ba ở Nam Bộ. Mục này chưa kiểm chứng đủ nguồn nên đây chỉ là gợi ý thận trọng.',
  },
  'Áo bà ba|Nón quai thao': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Nón quai thao gắn với phụ nữ đồng bằng Bắc Bộ. Nhóm chưa tìm thấy tư liệu về việc đội cùng áo bà ba Nam Bộ.',
  },
  'Áo bà ba|Khăn đóng': {
    mucDo: 'tuy_dip',
    ghiChu:
      'Khăn đóng gắn với Huế và áo dài ngũ thân. Với áo bà ba nhóm chưa có tư liệu, nên tạm xếp là tuỳ dịp.',
  },
  'Áo bà ba|Khăn mỏ quạ': {
    mucDo: 'khong_phu_hop',
    ghiChu:
      'Khăn mỏ quạ thường được nhắc cùng áo tứ thân Bắc Bộ. Mục này chưa có nguồn kiểm chứng nên đây chỉ là gợi ý thận trọng.',
  },
  'Áo bà ba|Trâm cài': {
    mucDo: 'tuy_dip',
    ghiChu: 'Nhóm chưa có tư liệu về trâm cài với áo bà ba, nên tạm xếp là tuỳ dịp.',
  },
  'Áo bà ba|Yếm đào': {
    mucDo: 'tuy_dip',
    ghiChu:
      'Yếm thường thấy dưới áo tứ thân. Với áo bà ba nhóm chưa có tư liệu, nên tạm xếp là tuỳ dịp.',
  },
};

/**
 * Các cặp PHÙ HỢP mà duLieu.ts có gì để nói. Chỉ ghi đè ghiChu.
 * Cặp phù hợp không có trong bảng này thì ghiChu hiện có trong DB được giữ nguyên.
 */
const GHI_CHU_PHU_HOP: Record<string, string> = {
  'Áo dài|Nón lá': 'Nón lá được dùng rộng rãi ở nhiều vùng trong đời sống thường ngày.',
  'Áo bà ba|Nón lá': 'Nón lá được dùng rộng rãi ở nhiều vùng trong đời sống thường ngày.',
  'Áo tứ thân|Nón lá':
    'Nón lá được dùng rộng rãi ở nhiều vùng. Ở Bắc Bộ đầu thế kỷ XX, phụ nữ phần nhiều đội nón ba tầm cùng áo tứ thân.',
  'Áo tứ thân|Nón quai thao':
    'Nón quai thao thường gắn với phụ nữ Bắc Bộ trong ngày hội và cưới hỏi, nên hợp với áo tứ thân.',
  'Áo tứ thân|Yếm đào':
    'Yếm là món mặc bên trong và thường thấy thấp thoáng dưới áo tứ thân (theo ảnh tư liệu của Bảo tàng Hà Nội).',
  'Áo tứ thân|Khăn mỏ quạ':
    'Một trang phổ thông nhắc khăn mỏ quạ đi cùng áo tứ thân. Mục này chưa có nguồn kiểm chứng nên nhóm chưa thể khẳng định thêm.',
  'Áo dài|Khăn đóng':
    'Trong tư liệu của nhóm, khăn đóng gắn với nam giới và áo dài ngũ thân; áo dài hiện đại là hậu duệ gần nhất của áo ngũ thân.',
  'Áo bà ba|Khăn rằn':
    'Khăn rằn thường được nhắc cùng áo bà ba và nón lá ở Nam Bộ. Mục này chưa kiểm chứng đủ nguồn nên nhóm chưa thể khẳng định thêm.',
};

const CHI_XEM_THU = process.argv.includes('--thu');

async function main() {
  const [cacTrangPhuc, cacPhuKien] = await Promise.all([
    prisma.trangPhuc.findMany(),
    prisma.phuKien.findMany(),
  ]);

  let daTao = 0;
  let daCapNhat = 0;
  let giuNguyen = 0;
  const chiTiet: string[] = [];
  const thieu: string[] = [];

  for (const tp of cacTrangPhuc) {
    const tenTp = chuanHoaTenPhuKien(tp.ten);
    const phuHop = (PHU_KIEN_THEO_TRANG_PHUC[tenTp] ?? []).map(chuanHoaTenPhuKien);

    for (const pk of cacPhuKien) {
      const tenPk = chuanHoaTenPhuKien(pk.ten);
      const khoa = `${tenTp}|${tenPk}`;

      let mucDo: MucDo;
      // undefined = không đụng tới ghiChu hiện có
      let ghiChu: string | undefined;
      if (phuHop.includes(tenPk)) {
        mucDo = 'phu_hop';
        ghiChu = GHI_CHU_PHU_HOP[khoa];
      } else {
        const cap = CAP_IT_PHU_HOP[khoa];
        if (!cap) {
          thieu.push(khoa);
          continue;
        }
        mucDo = cap.mucDo;
        ghiChu = cap.ghiChu;
      }

      const hienCo = await prisma.quyTacPhuHop.findFirst({
        where: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null },
      });

      if (!hienCo) {
        chiTiet.push(`+ TẠO     ${khoa} -> ${mucDo}`);
        if (!CHI_XEM_THU) {
          await prisma.quyTacPhuHop.create({
            data: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null, mucDo, ghiChu: ghiChu ?? null },
          });
        }
        daTao++;
        continue;
      }

      const doiMuc = hienCo.mucDo !== mucDo;
      const doiGhiChu = ghiChu !== undefined && hienCo.ghiChu !== ghiChu;
      if (!doiMuc && !doiGhiChu) {
        giuNguyen++;
        continue;
      }

      chiTiet.push(
        `~ CẬP NHẬT ${khoa}` +
          (doiMuc ? `  mức: ${hienCo.mucDo} -> ${mucDo}` : '') +
          (doiGhiChu ? '  (ghiChu mới)' : ''),
      );
      if (!CHI_XEM_THU) {
        await prisma.quyTacPhuHop.update({
          where: { id: hienCo.id },
          data: { mucDo, ...(ghiChu !== undefined ? { ghiChu } : {}) },
        });
      }
      daCapNhat++;
    }
  }

  console.log(chiTiet.join('\n'));
  console.log(
    `\n${CHI_XEM_THU ? '[XEM THỬ, CHƯA GHI] ' : ''}Tạo mới ${daTao}, cập nhật ${daCapNhat}, giữ nguyên ${giuNguyen}.`,
  );
  if (thieu.length > 0) console.log('Cặp chưa có mô tả (cần bổ sung):', thieu);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
import { PrismaClient } from '@prisma/client';
import { PHU_KIEN_THEO_TRANG_PHUC, chuanHoaTenPhuKien } from '../lib/phuKienTheoTrangPhuc';

const prisma = new PrismaClient();

type MucDo = 'phu_hop' | 'khong_phu_hop' | 'tuy_dip';

/** Các cặp ngoài danh sách gợi ý. Khoá: "Trang phục|Phụ kiện". BẢN NHÁP, cần đối chiếu nguồn ở E1. */
const CAP_IT_PHU_HOP: Record<string, { mucDo: MucDo; ghiChu: string }> = {
  'Áo dài|Nón quai thao': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Nón quai thao gắn với trang phục dân gian Bắc Bộ (áo tứ thân, hội Quan họ), ít khi đi cùng áo dài.',
  },
  'Áo dài|Khăn mỏ quạ': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Khăn mỏ quạ là kiểu vấn khăn của phụ nữ Bắc Bộ với áo tứ thân; đi với áo dài sẽ lệch phong cách gốc.',
  },
  'Áo dài|Khăn rằn': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Khăn rằn là nét đặc trưng của Nam Bộ, thường đi cùng áo bà ba hơn là áo dài.',
  },
  'Áo dài|Yếm đào': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Yếm đào là lớp mặc bên trong áo tứ thân, không mặc kèm áo dài.',
  },
  'Áo tứ thân|Khăn đóng': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Khăn đóng thuộc phong cách Huế/cung đình, không đi cùng áo tứ thân Kinh Bắc.',
  },
  'Áo tứ thân|Khăn rằn': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Khăn rằn là nét đặc trưng của Nam Bộ, không thuộc phong cách áo tứ thân Bắc Bộ.',
  },
  'Áo bà ba|Nón quai thao': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Nón quai thao gắn với trang phục Bắc Bộ, không thuộc phong cách áo bà ba Nam Bộ.',
  },
  'Áo bà ba|Khăn đóng': {
    mucDo: 'tuy_dip',
    ghiChu: 'Khăn đóng gắn với Huế và áo dài; đi với áo bà ba chỉ hợp ở một số dịp.',
  },
  'Áo bà ba|Khăn mỏ quạ': {
    mucDo: 'khong_phu_hop',
    ghiChu: 'Khăn mỏ quạ là kiểu vấn khăn Bắc Bộ, không thuộc phong cách áo bà ba Nam Bộ.',
  },
  'Áo bà ba|Trâm cài': {
    mucDo: 'tuy_dip',
    ghiChu: 'Trâm cài không phải nét đặc trưng của áo bà ba; cần cân nhắc theo dịp sử dụng.',
  },
  'Áo bà ba|Yếm đào': {
    mucDo: 'tuy_dip',
    ghiChu: 'Yếm đào gắn với áo tứ thân; đi với áo bà ba cần cân nhắc theo dịp.',
  },
};

async function main() {
  const [cacTrangPhuc, cacPhuKien] = await Promise.all([
    prisma.trangPhuc.findMany(),
    prisma.phuKien.findMany(),
  ]);

  let daTao = 0;
  let daCo = 0;
  const thieu: string[] = [];

  for (const tp of cacTrangPhuc) {
    const tenTp = chuanHoaTenPhuKien(tp.ten);
    const phuHop = (PHU_KIEN_THEO_TRANG_PHUC[tenTp] ?? []).map(chuanHoaTenPhuKien);

    for (const pk of cacPhuKien) {
      const tenPk = chuanHoaTenPhuKien(pk.ten);

      const daTonTai = await prisma.quyTacPhuHop.findFirst({
        where: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null },
      });
      if (daTonTai) {
        daCo++;
        continue;
      }

      let mucDo: MucDo;
      let ghiChu: string | null;
      if (phuHop.includes(tenPk)) {
        mucDo = 'phu_hop';
        ghiChu = null;
      } else {
        const cap = CAP_IT_PHU_HOP[`${tenTp}|${tenPk}`];
        if (!cap) {
          thieu.push(`${tenTp}|${tenPk}`);
          continue;
        }
        mucDo = cap.mucDo;
        ghiChu = cap.ghiChu;
      }

      await prisma.quyTacPhuHop.create({
        data: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null, mucDo, ghiChu },
      });
      daTao++;
    }
  }

  console.log(`Đã tạo ${daTao} quy tắc mới, giữ nguyên ${daCo} quy tắc đã có.`);
  if (thieu.length > 0) console.log('Cặp chưa có mô tả (cần bổ sung):', thieu);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
/**
 * ĐỒNG BỘ DATABASE VỚI THƯ VIỆN VĂN HOÁ (lib/vanHoa/quyTacDongBo.ts)
 *
 * Chạy SAU khi đã seed:
 *   npx tsx --env-file=.env prisma/seed.ts
 *   npx tsx --env-file=.env prisma/seed-quy-tac.ts
 *   npx tsx --env-file=.env prisma/dong-bo-van-hoa.ts              <- chỉ IN thay đổi (xem trước)
 *   npx tsx --env-file=.env prisma/dong-bo-van-hoa.ts --ap-dung    <- ghi vào database
 *
 * Việc script làm (an toàn chạy lại nhiều lần):
 *  1. Cập nhật cột "vùng miền" của trang phục và phụ kiện.
 *  2. Với 27 cặp trang phục × phụ kiện: tạo hoặc cập nhật quy tắc CHUNG (suKienId = null).
 *     Quy tắc riêng theo dịp (suKienId khác null) KHÔNG bị đụng tới.
 *  3. Cập nhật nội dung văn hoá hiển thị ở trang phối đồ (bảng NoiDungVanHoa) theo tiêu đề.
 *
 * Vì seed.ts xoá và tạo lại toàn bộ dữ liệu, mỗi lần seed lại bạn phải chạy lại script này.
 */
import { PrismaClient } from '@prisma/client';
import { NOI_DUNG_VAN_HOA, QUY_TAC, VUNG_PHU_KIEN, VUNG_TRANG_PHUC } from '../lib/vanHoa/quyTacDongBo';

const prisma = new PrismaClient();
const apDung = process.argv.includes('--ap-dung');
const chuan = (t: string) => t.normalize('NFC').trim();

async function main() {
  console.log(apDung ? '== CHẾ ĐỘ GHI ==' : '== XEM TRƯỚC (thêm --ap-dung để ghi) ==');

  const [cacTrangPhuc, cacPhuKien] = await Promise.all([prisma.trangPhuc.findMany(), prisma.phuKien.findMany()]);
  const tpTheoTen = new Map(cacTrangPhuc.map((t) => [chuan(t.ten), t]));
  const pkTheoTen = new Map(cacPhuKien.map((p) => [chuan(p.ten), p]));

  let doi = 0;
  const canhBao: string[] = [];

  // ---- 1. Vùng miền ----
  for (const [ten, v] of Object.entries(VUNG_TRANG_PHUC)) {
    const tp = tpTheoTen.get(chuan(ten));
    if (!tp) { canhBao.push(`Không thấy trang phục "${ten}" trong database`); continue; }
    if (tp.vungMien !== v.moi) {
      console.log(`vùng  | Trang phục ${ten}: "${tp.vungMien}" -> "${v.moi}"`);
      if (apDung) await prisma.trangPhuc.update({ where: { id: tp.id }, data: { vungMien: v.moi } });
      doi++;
    }
  }
  for (const [ten, v] of Object.entries(VUNG_PHU_KIEN)) {
    const pk = pkTheoTen.get(chuan(ten));
    if (!pk) { canhBao.push(`Không thấy phụ kiện "${ten}" trong database`); continue; }
    if (pk.vungMien !== v.moi) {
      console.log(`vùng  | Phụ kiện ${ten}: "${pk.vungMien}" -> "${v.moi}"`);
      if (apDung) await prisma.phuKien.update({ where: { id: pk.id }, data: { vungMien: v.moi } });
      doi++;
    }
  }

  // ---- 2. Quy tắc chung ----
  for (const r of QUY_TAC) {
    const tp = tpTheoTen.get(chuan(r.trangPhuc));
    const pk = pkTheoTen.get(chuan(r.phuKien));
    if (!tp || !pk) { canhBao.push(`Thiếu dữ liệu cho cặp ${r.trangPhuc} × ${r.phuKien}`); continue; }

    const cu = await prisma.quyTacPhuHop.findFirst({
      where: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null },
    });
    if (!cu) {
      console.log(`luật  | + ${r.trangPhuc} × ${r.phuKien}: (chưa có) -> ${r.mucDo}`);
      if (apDung) {
        await prisma.quyTacPhuHop.create({
          data: { trangPhucId: tp.id, phuKienId: pk.id, suKienId: null, mucDo: r.mucDo, ghiChu: r.ghiChu },
        });
      }
      doi++;
    } else if (cu.mucDo !== r.mucDo || (cu.ghiChu ?? '') !== r.ghiChu) {
      const nhan = cu.mucDo === r.mucDo ? `${r.mucDo} (đổi ghi chú)` : `${cu.mucDo} -> ${r.mucDo}`;
      console.log(`luật  | ~ ${r.trangPhuc} × ${r.phuKien}: ${nhan}`);
      if (apDung) {
        await prisma.quyTacPhuHop.update({ where: { id: cu.id }, data: { mucDo: r.mucDo, ghiChu: r.ghiChu } });
      }
      doi++;
    }
  }

  // ---- 3. Nội dung văn hoá ----
  for (const n of NOI_DUNG_VAN_HOA) {
    const tp = tpTheoTen.get(chuan(n.trangPhuc));
    if (!tp) { canhBao.push(`Thiếu trang phục "${n.trangPhuc}" cho nội dung "${n.tieuDe}"`); continue; }
    const cu = await prisma.noiDungVanHoa.findFirst({ where: { trangPhucId: tp.id, tieuDe: n.tieuDe } });
    if (!cu) {
      console.log(`nội dung | + ${n.trangPhuc} / ${n.tieuDe}`);
      if (apDung) {
        await prisma.noiDungVanHoa.create({
          data: { trangPhucId: tp.id, tieuDe: n.tieuDe, noiDung: n.noiDung, nguonThamKhao: n.nguonThamKhao },
        });
      }
      doi++;
    } else if (cu.noiDung !== n.noiDung || cu.nguonThamKhao !== n.nguonThamKhao) {
      console.log(`nội dung | ~ ${n.trangPhuc} / ${n.tieuDe}`);
      if (apDung) {
        await prisma.noiDungVanHoa.update({
          where: { id: cu.id },
          data: { noiDung: n.noiDung, nguonThamKhao: n.nguonThamKhao },
        });
      }
      doi++;
    }
  }

  console.log(`\n${apDung ? 'Đã ghi' : 'Sẽ ghi'} ${doi} thay đổi.`);
  if (canhBao.length > 0) {
    console.log('\nCẢNH BÁO (cần xem lại):');
    canhBao.forEach((c) => console.log(' -', c));
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * NẠP ẢNH TỰ TẠO HÀNG LOẠT — thả ảnh vào thư mục anh-moi/ rồi chạy:
 *
 *   npm run nap-anh                  nạp ảnh (tổ hợp CHƯA có -> tạo mới; đã có -> BỎ QUA, không đụng ảnh cũ)
 *   npm run nap-anh -- --thu         chạy thử, chỉ báo kết quả, KHÔNG upload, KHÔNG ghi DB
 *   npm run nap-anh -- --ghi-de      tổ hợp đã có -> thay bằng ảnh mới (ảnh cũ trong bucket bị xoá)
 *   npm run nap-anh -- --danh-sach   in ra các tên hợp lệ để đặt tên file
 *
 * Mẫu tên file:  {trang-phuc}__{mau-chinh}__{mau-phu}__{phu-kien}__{su-kien}.png
 * Ví dụ:         ao-dai__do-son__trang-nga__tram-cai__cuoi-hoi.png
 *                ao-dai__do-son__trang-nga__tram-cai+non-la__cuoi-hoi.png   (nhiều phụ kiện: nối bằng dấu +)
 *                ao-dai__do-son__trang-nga__khong-phu-kien__cuoi-hoi.png
 */
import { readdir, readFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import prisma from "../lib/prisma";
import { taoComboKey, gopPhuKienId } from "../lib/comboKey";
import { sinhNhanXet } from "../lib/aiSinhAnh";
import { tinhMucDoHoaHop } from "../lib/rules/hoaHopMauSac";
import { nenWebp, taoSlug, uploadAnh, xoaAnh } from "../lib/luuAnhSupabase";
import { DUOI_ANH, tachTenFile } from "./nap-anh-ten";

const THU_MUC = path.join(process.cwd(), "anh-moi");
const THU_MUC_XONG = path.join(THU_MUC, "da-xong");

const args = new Set(process.argv.slice(2));
const CHI_THU = args.has("--thu");
const GHI_DE = args.has("--ghi-de");
const IN_DANH_SACH = args.has("--danh-sach");

type Dong = { id: string; ten: string };
function lapBang<T extends Dong>(ds: T[], tenNhom: string): Map<string, T> {
  const m = new Map<string, T>();
  for (const x of ds) {
    const s = taoSlug(x.ten, 100);
    if (m.has(s)) console.warn(`⚠ ${tenNhom}: hai tên trùng slug "${s}" ("${m.get(s)!.ten}" và "${x.ten}") — chỉ dùng được cái đầu.`);
    else m.set(s, x);
  }
  return m;
}

function goiY(bang: Map<string, Dong>) {
  return [...bang.keys()].join(", ");
}

function ngayYmd() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const [dsTrangPhuc, dsMau, dsPhuKien, dsSuKien] = await Promise.all([
    prisma.trangPhuc.findMany(),
    prisma.mauSac.findMany(),
    prisma.phuKien.findMany(),
    prisma.suKien.findMany(),
  ]);
  const bTrangPhuc = lapBang(dsTrangPhuc, "Trang phục");
  const bMau = lapBang(dsMau, "Màu");
  const bPhuKien = lapBang(dsPhuKien, "Phụ kiện");
  const bSuKien = lapBang(dsSuKien, "Sự kiện");

  if (IN_DANH_SACH) {
    console.log("\nTên hợp lệ để đặt tên file (đúng từng ký tự):\n");
    console.log("Trang phục :", goiY(bTrangPhuc));
    console.log("Màu        :", goiY(bMau));
    console.log("Phụ kiện   :", goiY(bPhuKien), `, ${"khong-phu-kien"}`);
    console.log("Sự kiện    :", goiY(bSuKien), "\n");
    await prisma.$disconnect();
    return;
  }

  await mkdir(THU_MUC, { recursive: true });
  const tatCa = await readdir(THU_MUC, { withFileTypes: true });
  const dsFile = tatCa
    .filter((f) => f.isFile() && DUOI_ANH.includes(path.extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort();

  if (dsFile.length === 0) {
    console.log(`Không có ảnh nào trong ${THU_MUC}. Thả ảnh vào đó rồi chạy lại.`);
    await prisma.$disconnect();
    return;
  }
  console.log(`${CHI_THU ? "[CHẠY THỬ] " : ""}Tìm thấy ${dsFile.length} ảnh.\n`);

  let taoMoi = 0, ghiDe = 0, boQua = 0, loi = 0;

  for (const tenFile of dsFile) {
    const nhan = `• ${tenFile}`;
    try {
      // 1. Đọc tên file
      const kq = tachTenFile(tenFile);
      if (!kq.ok) throw new Error(kq.loi);
      const p = kq.phan;

      // 2. Khớp tên với DB
      const loiKhop: string[] = [];
      const tp = bTrangPhuc.get(p.trangPhuc);
      const mc = bMau.get(p.mauChinh);
      const mp = bMau.get(p.mauPhu);
      const sk = bSuKien.get(p.suKien);
      // Phụ kiện: "khong-phu-kien" hoặc 1 hay nhiều món nối bằng "+" (vd tram-cai+non-la).
      const slugPhuKien = p.phuKien === "khong-phu-kien" ? [] : p.phuKien.split("+").filter(Boolean);
      const cacPk = slugPhuKien.map((sl) => bPhuKien.get(sl));
      if (!tp) loiKhop.push(`trang phục "${p.trangPhuc}" (hợp lệ: ${goiY(bTrangPhuc)})`);
      if (!mc) loiKhop.push(`màu chính "${p.mauChinh}" (hợp lệ: ${goiY(bMau)})`);
      if (!mp) loiKhop.push(`màu phụ "${p.mauPhu}" (hợp lệ: ${goiY(bMau)})`);
      slugPhuKien.forEach((sl, i) => {
        if (!cacPk[i]) loiKhop.push(`phụ kiện "${sl}" (hợp lệ: ${goiY(bPhuKien)}, khong-phu-kien)`);
      });
      if (!sk) loiKhop.push(`sự kiện "${p.suKien}" (hợp lệ: ${goiY(bSuKien)})`);
      if (loiKhop.length) throw new Error(`Không khớp DB: ${loiKhop.join("; ")}`);

      const dsPk = cacPk.filter((x): x is NonNullable<(typeof cacPk)[number]> => Boolean(x));
      // Cùng cách gộp với API sinh ảnh AI (sắp xếp id + nối "+") nên comboKey luôn khớp.
      const phuKienId = gopPhuKienId(dsPk.map((x) => x.id));
      const tenPhuKienHienThi = dsPk.length ? dsPk.map((x) => x.ten).join(" + ") : "không phụ kiện";
      const comboKey = taoComboKey({
        trangPhucId: tp!.id,
        mauChinhId: mc!.id,
        mauPhuId: mp!.id,
        phuKienId,
        suKienId: sk!.id,
      });

      // 3. Tổ hợp đã có chưa?
      const daCo = await prisma.toHopDuocDuyet.findUnique({ where: { comboKey } });
      if (daCo && !GHI_DE) {
        console.log(`${nhan} → BỎ QUA (tổ hợp đã có, trạng thái ${daCo.status}). Muốn thay bằng ảnh này: thêm --ghi-de`);
        boQua++;
        continue;
      }

      // 4. Mức hài hoà màu -> danhGiaMauId (giống cách API sinh ảnh AI đang làm)
      const mauChinhDb = dsMau.find((m) => m.id === mc!.id)!;
      const mauPhuDb = dsMau.find((m) => m.id === mp!.id)!;
      const { mucDo } = tinhMucDoHoaHop(mauChinhDb, mauPhuDb);
      const danhGia = await prisma.danhGiaMauSac.findFirst({ where: { mucDo } });
      if (!danhGia) throw new Error(`Thiếu dữ liệu DanhGiaMauSac cho mucDo "${mucDo}" (kiểm tra seed).`);

      // 5. Tên file trên bucket (xem QUY-TAC-DAT-TEN-ANH.md, mục 4b)
      const sl = (s: string) => taoSlug(s, 20);
      const tpSlug = taoSlug(tp!.ten);
      const hash6 = crypto.createHash("sha256").update(comboKey).digest("hex").slice(0, 6);
      const tenMoi = [tpSlug, sl(mc!.ten), sl(mp!.ten), dsPk.length ? dsPk.map((x) => sl(x.ten)).join("-") : "khong-phu-kien", sl(sk!.ten), ngayYmd(), hash6, Date.now().toString(36)].join("_");
      // Tên file trên bucket KHÔNG được chứa "+": URL công khai có dấu + hay bị Supabase trả 404 NoSuchKey.
      const duongDan = `manual/${tpSlug}/${tenMoi}.webp`;

      if (CHI_THU) {
        console.log(`${nhan} → OK (${daCo ? "sẽ GHI ĐÈ" : "sẽ TẠO MỚI"}) · ${tp!.ten} + ${mc!.ten}/${mp!.ten} + ${tenPhuKienHienThi} + ${sk!.ten} · hài hoà: ${mucDo}\n    → ${duongDan}`);
        continue;
      }

      // 6. Nén WebP + upload (file mới, không bao giờ ghi đè file cũ trên bucket)
      const webp = await nenWebp(await readFile(path.join(THU_MUC, tenFile)));
      const url = await uploadAnh(duongDan, webp, "image/webp");

      // 6b. Nhận xét AI (cùng kiểu với ảnh AI sinh). Lỗi thì bỏ qua, ảnh vẫn được nạp.
      const nhanXetAI = await sinhNhanXet({
        tenTrangPhuc: tp!.ten,
        vungMienTrangPhuc: "",
        tenMauChinh: mc!.ten,
        hexMauChinh: mauChinhDb.maHex,
        tenMauPhu: mp!.ten,
        hexMauPhu: mauPhuDb.maHex,
        tenCacPhuKien: dsPk.map((x) => x.ten),
        tenSuKien: sk!.ten,
      });
      const aiAssessment = { nguon: "tu-tao", nhanXetAI };

      // 7. Ghi DB
      if (daCo) {
        await prisma.toHopDuocDuyet.update({
          where: { id: daCo.id },
          data: { imageUrl: url, status: "approved", aiAssessment },
        });
        await xoaAnh(daCo.imageUrl); // dọn ảnh cũ (chỉ xoá nếu nằm trong bucket này)
        ghiDe++;
        console.log(`${nhan} → ĐÃ GHI ĐÈ tổ hợp cũ · ${url}`);
      } else {
        await prisma.toHopDuocDuyet.create({
          data: {
            comboKey,
            trangPhucId: tp!.id,
            mauChinhId: mc!.id,
            mauPhuId: mp!.id,
            phuKienId,
            suKienId: sk!.id,
            danhGiaMauId: danhGia.id,
            imageUrl: url,
            aiAssessment,
            status: "approved",
          },
        });
        taoMoi++;
        console.log(`${nhan} → ĐÃ TẠO MỚI · ${url}`);
      }

      // 8. Chuyển file đã xong sang da-xong/ (không bị nạp lại)
      await mkdir(THU_MUC_XONG, { recursive: true });
      await rename(path.join(THU_MUC, tenFile), path.join(THU_MUC_XONG, tenFile));
    } catch (e) {
      loi++;
      console.error(`${nhan} → LỖI: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\nXong. Tạo mới: ${taoMoi} · Ghi đè: ${ghiDe} · Bỏ qua: ${boQua} · Lỗi: ${loi}${CHI_THU ? " (chạy thử, chưa ghi gì)" : ""}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

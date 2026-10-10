/**
 * KIỂM TRA + SỬA ẢNH BỊ 404 ("NoSuchKey") TRONG BẢNG ToHopDuocDuyet
 *
 *   npx tsx --env-file=.env scripts/sua-url-anh.ts              chỉ KIỂM TRA, in danh sách ảnh hỏng
 *   npx tsx --env-file=.env scripts/sua-url-anh.ts --ap-dung    sửa các ảnh có dấu "+" trong đường dẫn
 *   npx tsx --env-file=.env scripts/sua-url-anh.ts --don-dep    xử lý ảnh MẤT KHỎI bucket:
 *        - ảnh AI (ai/...)      -> xoá bản ghi trong DB; lần bấm nhận ảnh sau hệ thống tự sinh ảnh mới
 *        - ảnh tự tạo (manual/...) -> nếu còn file gốc trong anh-moi/da-xong thì chuyển lại anh-moi/ và xoá bản ghi,
 *                                     sau đó chạy: npm run nap-anh   (nạp lại)
 *
 * Nguyên nhân hay gặp: tên file trên bucket có dấu "+" (do nối nhiều phụ kiện) -> URL công khai trả 404.
 * Cách sửa: đổi tên file trên bucket (move) thay "+" bằng "-", rồi cập nhật imageUrl trong DB.
 * Ảnh thật sự không còn trong bucket thì script chỉ báo; nạp lại bằng: npm run nap-anh -- --ghi-de
 */
import { access, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import prisma from "../lib/prisma";
import { TEN_BUCKET, layClientSupabase } from "../lib/luuAnhSupabase";

const AP_DUNG = process.argv.includes("--ap-dung");
const DON_DEP = process.argv.includes("--don-dep");
const MARKER = `/storage/v1/object/public/${TEN_BUCKET}/`;

async function taiDuoc(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log(AP_DUNG ? "== CHẾ ĐỘ SỬA ==" : "== CHỈ KIỂM TRA (thêm --ap-dung để sửa) ==");
  const sb = layClientSupabase();
  const ds = await prisma.toHopDuocDuyet.findMany({ where: { imageUrl: { not: null } } });
  console.log(`Kiểm tra ${ds.length} ảnh...\n`);

  let ok = 0, daSua = 0, hong = 0;
  const matTep: { id: string; duongDan: string }[] = [];
  for (const b of ds) {
    const url = b.imageUrl as string;
    if (await taiDuoc(url)) { ok++; continue; }

    const i = url.indexOf(MARKER);
    if (i < 0) { hong++; console.log(`✗ ${b.comboKey}\n    URL ngoài bucket "${TEN_BUCKET}", không tự sửa được: ${url}`); continue; }
    const duongDan = decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);

    if (!duongDan.includes("+")) {
      hong++;
      matTep.push({ id: b.id, duongDan });
      console.log(`✗ MẤT FILE ${duongDan}`);
      continue;
    }

    const duongDanMoi = duongDan.replaceAll("+", "-");
    if (!AP_DUNG) { hong++; console.log(`✗ ${b.comboKey}\n    sẽ đổi tên: ${duongDan}\n             -> ${duongDanMoi}`); continue; }

    const { error } = await sb.storage.from(TEN_BUCKET).move(duongDan, duongDanMoi);
    if (error) { hong++; matTep.push({ id: b.id, duongDan }); console.log(`✗ MẤT FILE ${duongDan} (${error.message})`); continue; }
    const urlMoi = sb.storage.from(TEN_BUCKET).getPublicUrl(duongDanMoi).data.publicUrl;
    if (!(await taiDuoc(urlMoi))) { hong++; console.log(`✗ ${b.comboKey}\n    đã đổi tên nhưng URL mới vẫn không tải được: ${urlMoi}`); continue; }
    await prisma.toHopDuocDuyet.update({ where: { id: b.id }, data: { imageUrl: urlMoi } });
    daSua++;
    console.log(`✓ ĐÃ SỬA ${b.comboKey}\n    ${urlMoi}`);
  }

  if (matTep.length > 0) {
    console.log(`\n${matTep.length} ảnh không còn trong bucket "${TEN_BUCKET}".`);
    if (!DON_DEP) console.log("Thêm --don-dep để xử lý (xoá bản ghi hỏng / chuyển file gốc về anh-moi để nạp lại).");
  }
  if (DON_DEP) {
    const thuMuc = path.join(process.cwd(), "anh-moi");
    const thuMucXong = path.join(thuMuc, "da-xong");
    const tonTai = (p: string) => access(p).then(() => true, () => false);
    for (const m of matTep) {
      if (m.duongDan.startsWith("ai/")) {
        await prisma.toHopDuocDuyet.delete({ where: { id: m.id } });
        console.log(`✓ ảnh AI: đã xoá bản ghi, sẽ tự sinh lại khi bấm nhận ảnh · ${m.duongDan}`);
        continue;
      }
      // manual/{tp}/{tp}_{mauChinh}_{mauPhu}_{phuKien}_{suKien}_{ngay}_{hash}_{tg}.webp -> {tp}__{mc}__{mp}__{pk}__{sk}.png
      const phan = path.basename(m.duongDan, ".webp").split("_");
      let daXuLy = false;
      if (phan.length >= 5) {
        const tenGoc = phan.slice(0, 5).join("__");
        for (const duoi of [".png", ".jpg", ".jpeg", ".webp"]) {
          const nguon = path.join(thuMucXong, tenGoc + duoi);
          if (await tonTai(nguon)) {
            await mkdir(thuMuc, { recursive: true });
            await rename(nguon, path.join(thuMuc, tenGoc + duoi));
            await prisma.toHopDuocDuyet.delete({ where: { id: m.id } });
            console.log(`✓ ảnh tự tạo: đã chuyển ${tenGoc + duoi} về anh-moi/ và xoá bản ghi hỏng`);
            daXuLy = true;
            break;
          }
        }
        if (!daXuLy) console.log(`? không thấy file gốc "${tenGoc}.(png/jpg/webp)" trong anh-moi/da-xong -> tự đặt lại ảnh vào anh-moi/ rồi chạy: npm run nap-anh -- --ghi-de`);
      }
    }
    console.log("\nXong bước dọn dẹp. Nếu có ảnh tự tạo được chuyển về anh-moi/, chạy: npm run nap-anh");
  }

  console.log(`\nXong. Tải được: ${ok} · Đã sửa: ${daSua} · Còn hỏng/cần xử lý: ${hong}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

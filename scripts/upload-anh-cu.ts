/**
 * Chuyển các ảnh cũ trong public/generated/ lên Supabase và cập nhật imageUrl trong DB.
 * Chạy 1 lần:   npx tsx --env-file=.env scripts/upload-anh-cu.ts
 * (an toàn chạy lại: bản ghi đã có URL Supabase sẽ bị bỏ qua)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import prisma from "../lib/prisma";
import { nenWebp, taoDuongDanAnhAI, uploadAnh } from "../lib/luuAnhSupabase";

async function main() {
  const dsCu = await prisma.toHopDuocDuyet.findMany({ where: { imageUrl: { startsWith: "/generated/" } } });
  console.log(`Có ${dsCu.length} ảnh cần chuyển.`);

  for (const b of dsCu) {
    try {
      const [tp, mc, mp, sk] = await Promise.all([
        prisma.trangPhuc.findUnique({ where: { id: b.trangPhucId } }),
        prisma.mauSac.findUnique({ where: { id: b.mauChinhId } }),
        prisma.mauSac.findUnique({ where: { id: b.mauPhuId } }),
        prisma.suKien.findUnique({ where: { id: b.suKienId } }),
      ]);
      const file = path.join(process.cwd(), "public", "generated", path.basename(b.imageUrl!));
      const webp = await nenWebp(await readFile(file));
      const duongDan = taoDuongDanAnhAI({
        comboKey: b.comboKey,
        tenTrangPhuc: tp?.ten ?? "khac",
        tenMauChinh: mc?.ten ?? "khac",
        tenMauPhu: mp?.ten ?? "khac",
        tenSuKien: sk?.ten ?? "khac",
      });
      const url = await uploadAnh(duongDan, webp);
      await prisma.toHopDuocDuyet.update({ where: { id: b.id }, data: { imageUrl: url } });
      console.log("OK  ", b.imageUrl, "->", duongDan);
    } catch (e) {
      console.error("LỖI ", b.imageUrl, e instanceof Error ? e.message : e);
    }
  }
  await prisma.$disconnect();
}

main();

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { taoComboKey, PHU_KIEN_KHONG_CHON } from "@/lib/comboKey";
import { tinhMucDoHoaHop } from "@/lib/rules/hoaHopMauSac";
import { sinhAnhVaDanhGia, AiLoiCauHinh, AiLoiApi } from "@/lib/aiSinhAnh";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * LỚP C4 — Sinh ảnh AI + đánh giá tổng thể cho 1 tổ hợp phối đồ.
 *
 * POST /api/to-hop-duoc-duyet
 *
 * Body JSON (khớp comboKey, xem lib/comboKey.ts):
 *  {
 *    "trangPhucId": string,
 *    "mauChinhId":  string,
 *    "mauPhuId":    string,
 *    "phuKienId":   string | null,   // null/thiếu = không chọn phụ kiện → ảnh không kèm phụ kiện
 *    "suKienId":    string           // giao diện tự bốc ngẫu nhiên nếu người dùng chưa chọn dịp
 *  }
 *
 * QUAN TRỌNG — idempotent theo comboKey: nếu tổ hợp đã có trong DB (dù
 * status draft/approved/rejected), API trả về bản ghi CŨ ngay lập tức,
 * KHÔNG gọi lại Gemini image API. Điều này để test/chạy hàng loạt nhiều
 * lần không tốn thêm lượt gọi ảnh cho tổ hợp đã sinh rồi. Muốn sinh lại,
 * xoá bản ghi cũ trước (hoặc thêm route riêng — chưa làm ở bước này).
 *
 * Tuỳ chọn: "sinhLai": true -> bỏ bản ghi cũ (nếu chưa "approved") và sinh ảnh
 * mới. Dùng cho nút "Sinh ảnh khác" sau khi người dùng không duyệt ảnh. Tổ hợp
 * đã "approved" thì KHÔNG bị ghi đè — vẫn trả về bản cũ.
 *
 * Response 200 (đã có sẵn): { data: ToHopDuocDuyet, daTonTai: true }
 * Response 201 (mới tạo):   { data: ToHopDuocDuyet, daTonTai: false }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request phải là JSON hợp lệ." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const batBuoc = ["trangPhucId", "mauChinhId", "mauPhuId", "suKienId"] as const;
  for (const key of batBuoc) {
    if (typeof b[key] !== "string" || !b[key]) {
      return NextResponse.json({ error: `Thiếu hoặc sai kiểu dữ liệu: ${key}.` }, { status: 400 });
    }
  }

  const trangPhucId = b.trangPhucId as string;
  const mauChinhId = b.mauChinhId as string;
  const mauPhuId = b.mauPhuId as string;
  if (b.phuKienId != null && typeof b.phuKienId !== "string") {
    return NextResponse.json({ error: "Sai kiểu dữ liệu: phuKienId phải là string hoặc null." }, { status: 400 });
  }
  // Không chọn phụ kiện → dùng hằng thay thế để vẫn khớp cột NOT NULL và comboKey.
  const phuKienId = typeof b.phuKienId === "string" && b.phuKienId ? b.phuKienId : PHU_KIEN_KHONG_CHON;
  const coPhuKien = phuKienId !== PHU_KIEN_KHONG_CHON;
  const suKienId = b.suKienId as string;
  const sinhLai = b.sinhLai === true;

  let comboKey: string;
  try {
    comboKey = taoComboKey({ trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "comboKey không hợp lệ." },
      { status: 400 }
    );
  }

  try {
    // 1. Idempotent: đã có tổ hợp này chưa? Nếu có -> trả về luôn, không gọi AI.
    const daCo = await prisma.toHopDuocDuyet.findUnique({ where: { comboKey } });
    const choPhepSinhLai = sinhLai && daCo !== null && daCo.status !== "approved";
    if (daCo && !choPhepSinhLai) {
      return NextResponse.json({ data: daCo, daTonTai: true }, { status: 200 });
    }

    // 2. Tra cứu đủ 4 thực thể liên quan — bắt buộc tồn tại hết mới sinh ảnh.
    const [trangPhuc, mauChinh, mauPhu, phuKien, suKien] = await Promise.all([
      prisma.trangPhuc.findUnique({ where: { id: trangPhucId } }),
      prisma.mauSac.findUnique({ where: { id: mauChinhId } }),
      prisma.mauSac.findUnique({ where: { id: mauPhuId } }),
      coPhuKien ? prisma.phuKien.findUnique({ where: { id: phuKienId } }) : Promise.resolve(null),
      prisma.suKien.findUnique({ where: { id: suKienId } }),
    ]);
    if (!trangPhuc) return notFound("trang phục", trangPhucId);
    if (!mauChinh) return notFound("màu chính", mauChinhId);
    if (!mauPhu) return notFound("màu phụ", mauPhuId);
    if (coPhuKien && !phuKien) return notFound("phụ kiện", phuKienId);
    if (!suKien) return notFound("sự kiện", suKienId);

    // 3. Suy ra đánh giá màu (Lớp 2) để lấy danhGiaMauId — không tính lại logic,
    //    dùng đúng hàm thuần tinhMucDoHoaHop() đã có ở Lớp 2.
    const { mucDo } = tinhMucDoHoaHop(mauChinh, mauPhu);
    const danhGiaMau = await prisma.danhGiaMauSac.findFirst({ where: { mucDo } });
    if (!danhGiaMau) {
      return NextResponse.json(
        { error: `Thiếu dữ liệu DanhGiaMauSac cho mucDo "${mucDo}" — kiểm tra lại seed.` },
        { status: 500 }
      );
    }

    // 4. Gọi Gemini: sinh ảnh + nhận xét trong 1 lượt gọi duy nhất.
    const ketQuaAI = await sinhAnhVaDanhGia({
      tenTrangPhuc: trangPhuc.ten,
      vungMienTrangPhuc: trangPhuc.vungMien,
      tenMauChinh: mauChinh.ten,
      hexMauChinh: mauChinh.maHex,
      tenMauPhu: mauPhu.ten,
      hexMauPhu: mauPhu.maHex,
      tenPhuKien: phuKien?.ten ?? null,
      tenSuKien: suKien.ten,
    });

    // 5. Lưu ảnh ra public/generated/ (MVP local disk; đổi sang Supabase
    //    Storage sau nếu deploy production — TODO).
    const imageUrl = await luuAnhRaDisk(comboKey, ketQuaAI.anhDataUri);

    // 5b. Sinh lại: chỉ xoá bản ghi cũ SAU KHI ảnh mới đã sinh xong (lỗi AI thì giữ nguyên bản cũ).
    if (daCo && choPhepSinhLai) {
      await prisma.toHopDuocDuyet.delete({ where: { id: daCo.id } });
      await xoaAnhCu(daCo.imageUrl);
    }

    // 6. Ghi bản ghi draft, chờ duyệt qua PATCH /api/to-hop-duoc-duyet/[id].
    const banGhi = await prisma.toHopDuocDuyet.create({
      data: {
        comboKey,
        trangPhucId,
        mauChinhId,
        mauPhuId,
        phuKienId,
        suKienId,
        danhGiaMauId: danhGiaMau.id,
        imageUrl,
        aiAssessment: { nhanXetAI: ketQuaAI.nhanXetAI, model: ketQuaAI.model },
        status: "draft",
      },
    });

    return NextResponse.json({ data: banGhi, daTonTai: false }, { status: 201 });
  } catch (error) {
    if (error instanceof AiLoiCauHinh) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof AiLoiApi) {
      return NextResponse.json({ error: error.message, chiTiet: error.chiTiet }, { status: 502 });
    }
    console.error("[POST /api/to-hop-duoc-duyet]", error);
    return NextResponse.json({ error: "Không thể sinh ảnh AI cho tổ hợp này." }, { status: 500 });
  }
}

/**
 * GET /api/to-hop-duoc-duyet
 *
 * Query params (đều optional):
 *  - status: "draft" | "approved" | "rejected" -> lọc theo trạng thái
 *            (mặc định trả tất cả nếu không truyền)
 *  - take: số lượng tối đa trả về (mặc định 50)
 *
 * Dùng cho trang/route duyệt: liệt kê các tổ hợp đang chờ duyệt, kèm tên
 * (không chỉ id) để hiển thị cho người duyệt dễ đọc.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const takeParam = Number(searchParams.get("take") ?? "50");
    const take = Number.isFinite(takeParam) && takeParam > 0 ? Math.min(takeParam, 200) : 50;

    const danhSach = await prisma.toHopDuocDuyet.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take,
    });

    const duLieuHienThi = await gomTenLienQuan(danhSach);

    return NextResponse.json({ data: duLieuHienThi, total: duLieuHienThi.length });
  } catch (error) {
    console.error("[GET /api/to-hop-duoc-duyet]", error);
    return NextResponse.json({ error: "Không thể lấy danh sách tổ hợp." }, { status: 500 });
  }
}

// ---- helpers nội bộ ----

function notFound(nhan: string, id: string) {
  return NextResponse.json({ error: `Không tìm thấy ${nhan} với id "${id}".` }, { status: 404 });
}

async function luuAnhRaDisk(comboKey: string, anhDataUri: string): Promise<string> {
  const match = anhDataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Dữ liệu ảnh trả về từ Gemini không đúng định dạng data URI.");
  const [, mimeType, base64Data] = match;
  const duoi = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";

  // Thêm hậu tố thời gian để ảnh sinh lại không bị trình duyệt cache theo tên file cũ.
  const tenFile = `${crypto.createHash("sha256").update(comboKey).digest("hex").slice(0, 24)}-${Date.now().toString(36)}.${duoi}`;
  const thuMuc = path.join(process.cwd(), "public", "generated");
  await mkdir(thuMuc, { recursive: true });
  await writeFile(path.join(thuMuc, tenFile), Buffer.from(base64Data, "base64"));

  return `/generated/${tenFile}`;
}

/** Xoá file ảnh cũ trong public/generated (best-effort, chỉ trong đúng thư mục này). */
async function xoaAnhCu(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/generated/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", "generated", path.basename(imageUrl)));
  } catch {
    // file không còn thì bỏ qua
  }
}

type ToHopDuocDuyetRow = Awaited<ReturnType<typeof prisma.toHopDuocDuyet.findMany>>[number];

/** Gom tên trangPhuc/mauChinh/mauPhu/phuKien/suKien theo id, để trang duyệt không phải tự tra. */
async function gomTenLienQuan(danhSach: ToHopDuocDuyetRow[]) {
  const idTrangPhuc = [...new Set(danhSach.map((d) => d.trangPhucId))];
  const idMau = [...new Set(danhSach.flatMap((d) => [d.mauChinhId, d.mauPhuId]))];
  const idPhuKien = [...new Set(danhSach.map((d) => d.phuKienId))];
  const idSuKien = [...new Set(danhSach.map((d) => d.suKienId))];

  const [trangPhucList, mauList, phuKienList, suKienList] = await Promise.all([
    prisma.trangPhuc.findMany({ where: { id: { in: idTrangPhuc } } }),
    prisma.mauSac.findMany({ where: { id: { in: idMau } } }),
    prisma.phuKien.findMany({ where: { id: { in: idPhuKien } } }),
    prisma.suKien.findMany({ where: { id: { in: idSuKien } } }),
  ]);

  const mapTrangPhuc = new Map(trangPhucList.map((t) => [t.id, t.ten]));
  const mapMau = new Map(mauList.map((m) => [m.id, { ten: m.ten, maHex: m.maHex }]));
  const mapPhuKien = new Map(phuKienList.map((p) => [p.id, p.ten]));
  const mapSuKien = new Map(suKienList.map((s) => [s.id, s.ten]));

  return danhSach.map((d) => ({
    ...d,
    ten: {
      trangPhuc: mapTrangPhuc.get(d.trangPhucId) ?? null,
      mauChinh: mapMau.get(d.mauChinhId) ?? null,
      mauPhu: mapMau.get(d.mauPhuId) ?? null,
      phuKien: mapPhuKien.get(d.phuKienId) ?? null,
      suKien: mapSuKien.get(d.suKienId) ?? null,
    },
  }));
}

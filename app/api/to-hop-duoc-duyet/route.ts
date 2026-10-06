import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { taoComboKey, gopPhuKienId, tachPhuKienId } from "@/lib/comboKey";
import { tinhMucDoHoaHop } from "@/lib/rules/hoaHopMauSac";
import { sinhAnhVaDanhGia, sinhNhanXet, AiLoiCauHinh, AiLoiApi } from "@/lib/aiSinhAnh";
import { luuAnhAI, xoaAnh } from "@/lib/luuAnhSupabase";
import { kiemTraQuyenAdmin } from "@/lib/adminAuth";

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
 *    "phuKienIds":  string[],        // nhiều phụ kiện (rỗng = không chọn → ảnh không kèm phụ kiện)
 *    "phuKienId":   string | null,   // bản cũ: 1 phụ kiện, vẫn được chấp nhận
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
// Vercel: mặc định hàm chỉ chạy ~10 giây, trong khi sinh ảnh + nhận xét + upload mất 10–30 giây.
export const maxDuration = 60;

const TOI_DA_PHU_KIEN = 10;

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
  let cacPhuKienId: string[] = [];
  if (b.phuKienIds != null) {
    if (!Array.isArray(b.phuKienIds) || !b.phuKienIds.every((x) => typeof x === "string")) {
      return NextResponse.json({ error: "Sai kiểu dữ liệu: phuKienIds phải là mảng string." }, { status: 400 });
    }
    if (b.phuKienIds.length > TOI_DA_PHU_KIEN) {
      return NextResponse.json({ error: `Chỉ được chọn tối đa ${TOI_DA_PHU_KIEN} phụ kiện.` }, { status: 400 });
    }
    cacPhuKienId = b.phuKienIds as string[];
  } else if (typeof b.phuKienId === "string" && b.phuKienId) {
    cacPhuKienId = [b.phuKienId];
  }
  // Gộp TẤT CẢ phụ kiện (đã sắp xếp) vào comboKey: "trâm cài" và "trâm cài + nón lá" là 2 tổ hợp khác nhau.
  const phuKienId = gopPhuKienId(cacPhuKienId);
  const idsPhuKien = tachPhuKienId(phuKienId);
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
    // 1. Tra cứu đủ các thực thể liên quan — bắt buộc tồn tại hết mới tiếp tục.
    const [trangPhuc, mauChinh, mauPhu, cacPhuKien, suKien] = await Promise.all([
      prisma.trangPhuc.findUnique({ where: { id: trangPhucId } }),
      prisma.mauSac.findUnique({ where: { id: mauChinhId } }),
      prisma.mauSac.findUnique({ where: { id: mauPhuId } }),
      idsPhuKien.length > 0
        ? prisma.phuKien.findMany({ where: { id: { in: idsPhuKien } } })
        : Promise.resolve([]),
      prisma.suKien.findUnique({ where: { id: suKienId } }),
    ]);
    if (!trangPhuc) return notFound("trang phục", trangPhucId);
    if (!mauChinh) return notFound("màu chính", mauChinhId);
    if (!mauPhu) return notFound("màu phụ", mauPhuId);
    if (!suKien) return notFound("sự kiện", suKienId);
    // Giữ thứ tự theo id đã sắp xếp (ổn định) để prompt luôn giống nhau cho cùng 1 tổ hợp.
    const phuKienTheoId = new Map(cacPhuKien.map((p) => [p.id, p]));
    const dsPhuKien = idsPhuKien.map((id) => phuKienTheoId.get(id));
    const thieu = idsPhuKien.find((id) => !phuKienTheoId.has(id));
    if (thieu) return notFound("phụ kiện", thieu);
    const tenCacPhuKien = dsPhuKien.map((p) => p!.ten);

    const dauVaoAI = {
      tenTrangPhuc: trangPhuc.ten,
      vungMienTrangPhuc: trangPhuc.vungMien,
      tenMauChinh: mauChinh.ten,
      hexMauChinh: mauChinh.maHex,
      tenMauPhu: mauPhu.ten,
      hexMauPhu: mauPhu.maHex,
      tenCacPhuKien,
      tenSuKien: suKien.ten,
    };

    // 2. Idempotent: đã có tổ hợp này chưa? Nếu có -> trả về luôn, không gọi AI sinh ảnh.
    const daCo = await prisma.toHopDuocDuyet.findUnique({ where: { comboKey } });
    const choPhepSinhLai = sinhLai && daCo !== null && daCo.status !== "approved";
    if (daCo && !choPhepSinhLai) {
      // Ảnh tự tạo (nạp tay) hoặc bản ghi cũ chưa có nhận xét -> bổ sung 1 lần rồi lưu lại.
      const cu = (daCo.aiAssessment ?? {}) as Record<string, unknown>;
      if (!cu.nhanXetAI && daCo.imageUrl) {
        const nhanXetAI = await sinhNhanXet(dauVaoAI);
        if (nhanXetAI) {
          const moi = await prisma.toHopDuocDuyet.update({
            where: { id: daCo.id },
            data: { aiAssessment: { ...cu, nhanXetAI } },
          });
          return NextResponse.json({ data: moi, daTonTai: true }, { status: 200 });
        }
      }
      return NextResponse.json({ data: daCo, daTonTai: true }, { status: 200 });
    }

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
    const ketQuaAI = await sinhAnhVaDanhGia(dauVaoAI);

    // 5. Nén WebP + lưu ảnh lên Supabase Storage, imageUrl là URL công khai.
    const imageUrl = await luuAnhAI(
      {
        comboKey,
        tenTrangPhuc: trangPhuc.ten,
        tenMauChinh: mauChinh.ten,
        tenMauPhu: mauPhu.ten,
        tenSuKien: suKien.ten,
      },
      ketQuaAI.anhDataUri
    );

    // 5b. Sinh lại: chỉ xoá bản ghi cũ SAU KHI ảnh mới đã sinh xong (lỗi AI thì giữ nguyên bản cũ).
    if (daCo && choPhepSinhLai) {
      await prisma.toHopDuocDuyet.delete({ where: { id: daCo.id } });
      await xoaAnh(daCo.imageUrl);
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
    return NextResponse.json(
      {
        error: "Không thể sinh ảnh AI cho tổ hợp này.",
        // Lộ chi tiết khi chạy dev, hoặc khi đặt biến môi trường HIEN_CHI_TIET_LOI=1 (gỡ lỗi trên Vercel, xong nên xoá).
        chiTiet:
          (process.env.NODE_ENV !== "production" || process.env.HIEN_CHI_TIET_LOI === "1") && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
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
  const loiQuyen = kiemTraQuyenAdmin(request);
  if (loiQuyen) return loiQuyen;

  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") ?? "draft";
    const cacTrangThai = ["draft", "approved", "rejected"];

    if (!cacTrangThai.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ." },
        { status: 400 },
      );
    }

    const take = Number(searchParams.get("take") ?? "50");
    const skip = Number(searchParams.get("skip") ?? "0");

    if (
      !Number.isSafeInteger(take) ||
      take < 1 ||
      take > 100 ||
      !Number.isSafeInteger(skip) ||
      skip < 0
    ) {
      return NextResponse.json(
        { error: "take phải từ 1–100; skip phải là số nguyên không âm." },
        { status: 400 },
      );
    }

    const [danhSach, total] = await prisma.$transaction([
      prisma.toHopDuocDuyet.findMany({
        where: { status },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
        skip,
      }),
      prisma.toHopDuocDuyet.count({
        where: { status },
      }),
    ]);

    const duLieuHienThi = await gomTenLienQuan(danhSach);

    return NextResponse.json(
      {
        data: duLieuHienThi,
        total,
        take,
        skip,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[GET danh sách duyệt]", error);

    return NextResponse.json(
      { error: "Không thể lấy danh sách tổ hợp." },
      { status: 500 },
    );
  }
}

// ---- helpers nội bộ ----

function notFound(nhan: string, id: string) {
  return NextResponse.json({ error: `Không tìm thấy ${nhan} với id "${id}".` }, { status: 404 });
}

type ToHopDuocDuyetRow = Awaited<ReturnType<typeof prisma.toHopDuocDuyet.findMany>>[number];

/** Gom tên trangPhuc/mauChinh/mauPhu/phuKien/suKien theo id, để trang duyệt không phải tự tra. */
async function gomTenLienQuan(danhSach: ToHopDuocDuyetRow[]) {
  const idTrangPhuc = [...new Set(danhSach.map((d) => d.trangPhucId))];
  const idMau = [...new Set(danhSach.flatMap((d) => [d.mauChinhId, d.mauPhuId]))];
  const idPhuKien = [...new Set(danhSach.flatMap((d) => tachPhuKienId(d.phuKienId)))];
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
      phuKien:
        tachPhuKienId(d.phuKienId)
          .map((id) => mapPhuKien.get(id))
          .filter((t): t is string => Boolean(t))
          .join(", ") || null,
      suKien: mapSuKien.get(d.suKienId) ?? null,
    },
  }));
}

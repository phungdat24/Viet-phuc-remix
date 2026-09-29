import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const TRANG_THAI_HOP_LE = ["draft", "approved", "rejected"] as const;
type TrangThai = (typeof TRANG_THAI_HOP_LE)[number];

/**
 * PATCH /api/to-hop-duoc-duyet/[id]
 *
 * ROUTE DUYỆT — người duyệt (chuyên gia văn hoá / admin) chấp nhận hoặc từ
 * chối 1 tổ hợp đã được C4 sinh ảnh AI (đang ở status "draft").
 *
 * Body JSON:
 *  {
 *    "status": "approved" | "rejected" | "draft"   (bắt buộc)
 *  }
 *
 * Chỉ đổi status — không sinh lại ảnh, không đổi comboKey. Muốn sinh lại ảnh
 * cho 1 tổ hợp bị "rejected", xoá bản ghi rồi gọi lại POST /api/to-hop-duoc-duyet
 * (comboKey không còn tồn tại nữa nên sẽ gọi AI sinh ảnh mới).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request phải là JSON hợp lệ." }, { status: 400 });
  }

  const { status } = (body ?? {}) as { status?: unknown };
  if (typeof status !== "string" || !TRANG_THAI_HOP_LE.includes(status as TrangThai)) {
    return NextResponse.json(
      { error: `status phải là 1 trong: ${TRANG_THAI_HOP_LE.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const banGhi = await prisma.toHopDuocDuyet.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ data: banGhi });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: `Không tìm thấy tổ hợp với id "${id}".` }, { status: 404 });
    }
    console.error("[PATCH /api/to-hop-duoc-duyet/[id]]", error);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái duyệt." }, { status: 500 });
  }
}

/**
 * GET /api/to-hop-duoc-duyet/[id]
 * Xem chi tiết 1 tổ hợp — tiện cho trang duyệt khi mở 1 item cụ thể.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const banGhi = await prisma.toHopDuocDuyet.findUnique({ where: { id } });
    if (!banGhi) {
      return NextResponse.json({ error: `Không tìm thấy tổ hợp với id "${id}".` }, { status: 404 });
    }
    return NextResponse.json({ data: banGhi });
  } catch (error) {
    console.error("[GET /api/to-hop-duoc-duyet/[id]]", error);
    return NextResponse.json({ error: "Không thể lấy chi tiết tổ hợp." }, { status: 500 });
  }
}

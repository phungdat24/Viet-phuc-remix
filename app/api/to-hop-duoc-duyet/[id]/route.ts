import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { kiemTraQuyenAdmin } from "@/lib/adminAuth";

/**
 * PATCH /api/to-hop-duoc-duyet/[id]
 *
 * Quản trị viên duyệt hoặc từ chối tổ hợp đang chờ duyệt.
 *
 * Header:
 * Authorization: Bearer <khóa quản trị>
 *
 * Body:
 * { "status": "approved" | "rejected" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Kiểm tra quyền quản trị.
  const loiQuyen = kiemTraQuyenAdmin(request);
  if (loiQuyen) return loiQuyen;

  const { id } = await params;

  // 2. Đọc và kiểm tra body JSON.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Body phải là một object." },
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;
  const status = b.status;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status phải là approved hoặc rejected." },
      { status: 400 },
    );
  }

  try {
    // 3. Kiểm tra tổ hợp có tồn tại không.
    const hienTai = await prisma.toHopDuocDuyet.findUnique({
      where: { id },
    });

    if (!hienTai) {
      return NextResponse.json(
        { error: "Không tìm thấy tổ hợp." },
        { status: 404 },
      );
    }

    // 4. Chỉ xử lý tổ hợp đang chờ duyệt.
    if (hienTai.status !== "draft") {
      return NextResponse.json(
        { error: "Tổ hợp đã được xử lý. Hãy tải lại danh sách." },
        { status: 409 },
      );
    }

    // 5. Không duyệt tổ hợp chưa có đường dẫn ảnh.
    if (status === "approved" && !hienTai.imageUrl) {
      return NextResponse.json(
        { error: "Không thể duyệt tổ hợp chưa có ảnh." },
        { status: 400 },
      );
    }

    // 6. Kiểm tra trạng thái ngay tại bước cập nhật,
    // tránh hai yêu cầu đồng thời ghi đè quyết định của nhau.
    const ketQua = await prisma.toHopDuocDuyet.updateMany({
      where: {
        id,
        status: "draft",
        ...(status === "approved" ? { imageUrl: { not: null } } : {}),
      },
      data: { status },
    });

    if (ketQua.count !== 1) {
      return NextResponse.json(
        { error: "Tổ hợp đã thay đổi. Hãy tải lại danh sách." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { data: { id, status } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[PATCH duyệt tổ hợp]", error);

    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/to-hop-duoc-duyet/[id]
 *
 * Quản trị viên xem chi tiết một tổ hợp.
 *
 * Header:
 * Authorization: Bearer <khóa quản trị>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Kiểm tra quyền quản trị.
  const loiQuyen = kiemTraQuyenAdmin(request);
  if (loiQuyen) return loiQuyen;

  const { id } = await params;

  try {
    // 2. Lấy tổ hợp theo ID.
    const banGhi = await prisma.toHopDuocDuyet.findUnique({
      where: { id },
    });

    if (!banGhi) {
      return NextResponse.json(
        { error: "Không tìm thấy tổ hợp." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data: banGhi },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET chi tiết tổ hợp]", error);

    return NextResponse.json(
      { error: "Không thể lấy chi tiết tổ hợp." },
      { status: 500 },
    );
  }
}

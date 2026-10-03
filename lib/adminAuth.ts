import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function kiemTraQuyenAdmin(request: Request): NextResponse | null {
  const khoaDung = process.env.ADMIN_REVIEW_KEY;

  if (!khoaDung || khoaDung.length < 32) {
    return NextResponse.json(
      { error: "Máy chủ chưa cấu hình khóa quản trị hợp lệ." },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");
  const khoaGui = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  const hashDung = createHash("sha256").update(khoaDung).digest();
  const hashGui = createHash("sha256").update(khoaGui).digest();

  if (!khoaGui || !timingSafeEqual(hashDung, hashGui)) {
    return NextResponse.json(
      { error: "Khóa quản trị không đúng hoặc chưa được cung cấp." },
      { status: 401 },
    );
  }

  return null;
}

/**
 * Lưu / xoá ảnh trên Supabase Storage (thay cho lưu ra public/generated).
 * Quy tắc đặt tên: xem QUY-TAC-DAT-TEN-ANH.md
 *
 * Cần: npm i @supabase/supabase-js sharp
 * Biến môi trường (CHỈ chạy phía server):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET
 */
import crypto from "node:crypto";
import sharp from "sharp";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tên bucket phải KHỚP CHÍNH XÁC (phân biệt hoa/thường) với tên trên Supabase.
const BUCKET = process.env.SUPABASE_BUCKET ?? "Viet-Phuc-Anh";

let client: SupabaseClient | null = null;
function layClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** "Áo dài Hà Nội" -> "ao-dai-ha-noi" (chữ thường, không dấu, nối bằng "-"). */
export function taoSlug(s: string, toiDa = 30): string {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, toiDa)
      .replace(/-+$/g, "") || "khac"
  );
}

export interface ThongTinAnhAI {
  comboKey: string;
  tenTrangPhuc: string;
  tenMauChinh: string;
  tenMauPhu: string;
  tenSuKien: string;
}

/**
 * ai/{trang-phuc}/{trang-phuc}_{mau-chinh}_{mau-phu}_{su-kien}_{hash10}_{thoigian}.webp
 * - hash10: 10 ký tự đầu của sha256(comboKey) -> cùng tổ hợp luôn cùng hash, không trùng tổ hợp khác.
 * - thoigian: base36 của Date.now() -> ảnh "sinh lại" là file MỚI, không ghi đè, không dính cache.
 */
export function taoDuongDanAnhAI(t: ThongTinAnhAI): string {
  const tp = taoSlug(t.tenTrangPhuc);
  const hash10 = crypto.createHash("sha256").update(t.comboKey).digest("hex").slice(0, 10);
  const ten = [tp, taoSlug(t.tenMauChinh, 20), taoSlug(t.tenMauPhu, 20), taoSlug(t.tenSuKien, 20), hash10, Date.now().toString(36)].join("_");
  return `ai/${tp}/${ten}.webp`;
}

/** Thu nhỏ (cạnh dài tối đa 1600px) + chuyển WebP chất lượng 80 để tiết kiệm dung lượng free. */
async function nenWebp(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

/** Upload buffer lên đúng đường dẫn, trả về URL công khai. Không ghi đè file cũ. */
export async function uploadAnh(duongDan: string, buffer: Buffer, contentType = "image/webp"): Promise<string> {
  const sb = layClient();
  const { error } = await sb.storage.from(BUCKET).upload(duongDan, buffer, {
    contentType,
    upsert: false,
    cacheControl: "31536000", // tên file là duy nhất nên cache 1 năm được
  });
  if (error) throw new Error(`Upload Supabase thất bại: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(duongDan).data.publicUrl;
}

/** Nhận data URI từ Gemini -> nén WebP -> upload -> trả về URL công khai (lưu vào cột imageUrl). */
export async function luuAnhAI(thongTin: ThongTinAnhAI, anhDataUri: string): Promise<string> {
  const match = anhDataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Dữ liệu ảnh trả về từ Gemini không đúng định dạng data URI.");
  const goc = Buffer.from(match[2], "base64");
  const webp = await nenWebp(goc);
  return uploadAnh(taoDuongDanAnhAI(thongTin), webp, "image/webp");
}

/** Xoá ảnh theo URL công khai (best-effort). URL không thuộc bucket này thì bỏ qua. */
export async function xoaAnh(imageUrl: string | null): Promise<void> {
  if (!imageUrl) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = imageUrl.indexOf(marker);
  if (i < 0) return;
  const duongDan = decodeURIComponent(imageUrl.slice(i + marker.length).split("?")[0]);
  try {
    await layClient().storage.from(BUCKET).remove([duongDan]);
  } catch {
    // file không còn thì bỏ qua
  }
}

export { nenWebp };

/**
 * THỬ PROMPT FLUX — sinh ảnh cho một bộ tổ hợp cố định để so sánh trước/sau khi chỉnh prompt.
 * KHÔNG ghi database, KHÔNG upload Supabase. Ảnh lưu vào thư mục anh-thu/.
 *
 *   npx tsx --env-file=.env scripts/thu-prompt-flux.ts                  in prompt (không gọi API)
 *   npx tsx --env-file=.env scripts/thu-prompt-flux.ts --sinh           sinh ảnh, mỗi tổ hợp 3 lần
 *   npx tsx --env-file=.env scripts/thu-prompt-flux.ts --sinh --lan=5
 *
 * Sau khi sinh: mở anh-thu/ và chấm vào bảng KET-QUA.md (4 tiêu chí: đúng loại áo,
 * đúng màu, chính diện toàn thân, đúng phụ kiện).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { taoPromptAnh, type DauVaoSinhAnh } from "../lib/aiSinhAnh";

const args = process.argv.slice(2);
const SINH = args.includes("--sinh");
const LAN = Number(args.find((a) => a.startsWith("--lan="))?.split("=")[1] ?? 3);

const goc = { vungMienTrangPhuc: "", hexMauChinh: "", hexMauPhu: "", tenSuKien: "Tết" };

// Sửa danh sách này thành các tổ hợp bạn sẽ dùng khi quay demo.
const TO_HOP: Array<{ ten: string; input: DauVaoSinhAnh }> = [
  { ten: "ao-dai_do-son_trang-nga_tram+non-la", input: { ...goc, tenTrangPhuc: "Áo dài", tenMauChinh: "Đỏ son", tenMauPhu: "Trắng ngà", tenCacPhuKien: ["Trâm cài", "Nón lá"] } },
  { ten: "ao-dai_lam-cham_den-huyen_khong-pk", input: { ...goc, tenTrangPhuc: "Áo dài", tenMauChinh: "Lam chàm", tenMauPhu: "Đen huyền", tenCacPhuKien: [] } },
  { ten: "ao-tu-than_nau-non_den-huyen_non-quai-thao+yem", input: { ...goc, tenTrangPhuc: "Áo tứ thân", tenMauChinh: "Nâu non", tenMauPhu: "Đen huyền", tenCacPhuKien: ["Nón quai thao", "Yếm đào"] } },
  { ten: "ao-tu-than_hong-dao_den-huyen_khan-mo-qua", input: { ...goc, tenTrangPhuc: "Áo tứ thân", tenMauChinh: "Hồng đào", tenMauPhu: "Đen huyền", tenCacPhuKien: ["Khăn mỏ quạ"] } },
  { ten: "ao-ba-ba_hong-dao_den-huyen_non-la+khan-ran", input: { ...goc, tenTrangPhuc: "Áo bà ba", tenMauChinh: "Hồng đào", tenMauPhu: "Đen huyền", tenCacPhuKien: ["Nón lá", "Khăn rằn"] } },
  { ten: "ao-ba-ba_luc-ngoc_trang-nga_khong-pk", input: { ...goc, tenTrangPhuc: "Áo bà ba", tenMauChinh: "Lục ngọc", tenMauPhu: "Trắng ngà", tenCacPhuKien: [] } },
];

async function sinhMotAnh(prompt: string): Promise<Buffer> {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!id || !token) throw new Error("Thiếu CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN trong .env");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, steps: 6 }),
  });
  const json = (await res.json()) as { success?: boolean; result?: { image: string }; errors?: unknown };
  if (!res.ok || !json.success || !json.result) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json.errors)}`);
  return Buffer.from(json.result.image, "base64");
}

async function main() {
  const thuMuc = path.join(process.cwd(), "anh-thu");
  if (SINH) await mkdir(thuMuc, { recursive: true });

  const bang: string[] = [
    "| Tổ hợp | Lần | Đúng loại áo | Đúng màu | Chính diện, toàn thân | Đúng phụ kiện |",
    "|---|---|---|---|---|---|",
  ];

  for (const { ten, input } of TO_HOP) {
    const prompt = taoPromptAnh(input);
    if (!SINH) {
      console.log(`\n=== ${ten} (${prompt.length} ký tự) ===\n${prompt}`);
      continue;
    }
    for (let i = 1; i <= LAN; i++) {
      const file = `${ten}__${i}.jpg`;
      try {
        await writeFile(path.join(thuMuc, file), await sinhMotAnh(prompt));
        console.log(`✔ ${file}`);
        bang.push(`| ${ten} | ${i} |  |  |  |  |`);
      } catch (e) {
        console.error(`✘ ${file}:`, (e as Error).message);
      }
    }
  }
  if (SINH) {
    await writeFile(path.join(thuMuc, "KET-QUA.md"), bang.join("\n") + "\n\nĐiền ✔ / ✘ vào mỗi ô rồi đếm tỉ lệ đạt.\n");
    console.log("\nXong. Mở anh-thu/ và chấm theo KET-QUA.md");
  }
}
main();

/**
 * LỚP C4 — Sinh ảnh AI + đánh giá tổng thể cho 1 tổ hợp phối đồ.
 *
 * Dùng Cloudflare Workers AI qua REST API trực tiếp (KHÔNG cần deploy Worker
 * riêng — chỉ cần Account ID + API Token, gọi thẳng từ server Next.js).
 * Miễn phí, giới hạn ~100.000 request/ngày (tính đến thời điểm viết code này).
 *
 * 2 model dùng:
 *  - "@cf/black-forest-labs/flux-1-schnell"  -> sinh ảnh từ prompt.
 *  - "@cf/meta/llama-3.1-8b-instruct"        -> sinh 1-2 câu nhận xét tiếng Việt.
 *    (Workers AI không có model nào trả ảnh + text cùng lúc trong 1 lượt gọi
 *    như Gemini, nên đây là 2 lượt gọi riêng — vẫn miễn phí, chỉ chậm hơn
 *    ~1-2s so với gọi gộp.)
 *
 * Cần 2 biến môi trường trong .env:
 *   CLOUDFLARE_ACCOUNT_ID=...
 *   CLOUDFLARE_API_TOKEN=...   (tạo ở dash.cloudflare.com -> My Profile ->
 *                                API Tokens -> Create Token -> quyền
 *                                "Workers AI - Edit" cho account của bạn)
 *
 * LƯU Ý CHẤT LƯỢNG: flux-1-schnell là model ảnh tổng quát (không chuyên về
 * trang phục Việt Nam), độ bám mô tả tiếng Việt (tên trang phục, đúng loại
 * phụ kiện...) có thể kém ổn định hơn Gemini. Đây chính là lý do chạy thử
 * 5 tổ hợp trước (notebook) để tinh chỉnh prompt trước khi chạy hàng loạt.
 */

const MODEL_ANH = "@cf/black-forest-labs/flux-1-schnell";
const MODEL_VAN_BAN = "@cf/meta/llama-3.1-8b-instruct";
const id = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const tk = process.env.CLOUDFLARE_API_TOKEN?.trim();
console.log("[CF DEBUG] account:", id, "| len:", id?.length);
console.log("[CF DEBUG] token :", tk?.slice(0, 8) + "..." + tk?.slice(-4), "| len:", tk?.length);

export interface DauVaoSinhAnh {
  tenTrangPhuc: string;
  vungMienTrangPhuc: string;
  tenMauChinh: string;
  hexMauChinh: string;
  tenMauPhu: string;
  hexMauPhu: string;
  /** null = người dùng không chọn phụ kiện → ảnh không kèm phụ kiện. */
  tenPhuKien: string | null;
  tenSuKien: string;
}

export interface KetQuaSinhAnh {
  /** Ảnh dạng data URI (base64), sẵn sàng lưu file hoặc render trực tiếp. */
  anhDataUri: string;
  mimeType: string;
  /** Nhận xét tổng thể do AI sinh (có thể null nếu lượt gọi text lỗi — không chặn việc lưu ảnh). */
  nhanXetAI: string | null;
  model: string;
}

export class AiLoiCauHinh extends Error {}
export class AiLoiApi extends Error {
  constructor(
    message: string,
    public status: number,
    public chiTiet?: unknown
  ) {
    super(message);
    this.name = "AiLoiApi";
  }
}

/**
 * Mô tả tiếng Anh + VỊ TRÍ đeo/cầm của từng phụ kiện, để model vẽ đúng chỗ và
 * (quan trọng) để phụ kiện nằm trong khung hình toàn thân — ví dụ guốc mộc ở chân.
 */
const MO_TA_PHU_KIEN: Record<string, string> = {
  "Nón lá": "a traditional Vietnamese conical palm-leaf hat (nón lá) worn on the head",
  "Trâm cài": "an ornate traditional hairpin (trâm cài) fixed in the hair bun",
  "Khăn đóng": "a traditional Huế turban headwear (khăn đóng) worn on the head",
  "Khăn mỏ quạ": "a black crow-beak shaped headscarf (khăn mỏ quạ) worn on the head",
  "Nón quai thao": "a wide flat-brimmed palm hat with silk tassel straps (nón quai thao) worn on the head",
  "Quạt giấy": "an open folding paper fan (quạt giấy) held in one hand",
  "Guốc mộc": "traditional wooden clogs (guốc mộc) worn on the feet, clearly visible",
  "Yếm đào": "a peach-pink traditional halter bodice (yếm đào) visible under the outer robe",
  "Khăn rằn": "a checkered Southern Vietnamese scarf (khăn rằn) worn around the neck",
};

function moTaPhuKien(ten: string | null): string {
  if (!ten) {
    return "No accessories at all: no hat, no headwear, no scarf, nothing held in the hands, plain simple footwear.";
  }
  const moTa = MO_TA_PHU_KIEN[ten] ?? `the accessory "${ten}" worn or held in a natural way`;
  return `Accessory that MUST be clearly visible: ${moTa}.`;
}

function taoPromptAnh(input: DauVaoSinhAnh): string {
  // Prompt tiếng Anh cho model ảnh gốc (flux-1-schnell hiểu tiếng Anh ổn định
  // hơn tiếng Việt) — giữ nguyên tên riêng tiếng Việt của trang phục/phụ kiện
  // để không mất bản sắc, kèm mô tả tiếng Anh bổ trợ cho model dễ hình dung.
  // Đoạn đầu (toàn thân) đặt lên trước vì model chú ý phần đầu prompt nhiều nhất.
  return [
    `Full-length head-to-toe fashion photograph of one young Vietnamese model standing upright,`,
    `the ENTIRE body visible from the top of the head down to the shoes and feet on the floor,`,
    `shot from a distance with wide framing, empty space above the head and below the feet, nothing cropped.`,
    `The model wears "${input.tenTrangPhuc}" (a traditional Vietnamese outfit, ${input.vungMienTrangPhuc} region),`,
    `styled as a modern Gen Z remix while respecting the original silhouette.`,
    `Main color: ${input.tenMauChinh} (${input.hexMauChinh}).`,
    `Accent color: ${input.tenMauPhu} (${input.hexMauPhu}).`,
    moTaPhuKien(input.tenPhuKien),
    `Setting mood for the occasion: ${input.tenSuKien}.`,
    `Soft natural studio lighting, plain minimal background, outfit as the clear focal point,`,
    `no text or logo in the image, photorealistic.`,
  ].join(" ");
}

function taoPromptDanhGia(input: DauVaoSinhAnh): string {
  return [
    `Bạn là chuyên gia thời trang. Viết đúng 1-2 câu nhận xét ngắn gọn bằng`,
    `tiếng Việt về sự hài hòa của tổ hợp phối đồ sau, theo phong cách Gen Z`,
    `remix trang phục truyền thống Việt Nam: trang phục "${input.tenTrangPhuc}",`,
    `màu chính "${input.tenMauChinh}", màu phụ "${input.tenMauPhu}",`,
    input.tenPhuKien ? `phụ kiện "${input.tenPhuKien}",` : `không dùng phụ kiện,`,
    `dịp "${input.tenSuKien}". Chỉ trả về đúng đoạn nhận`,
    `xét, không thêm lời dẫn hay giải thích.`,
  ].join(" ");
}

async function goiCloudflareAI<T>(model: string, body: unknown): Promise<T> {
  // Đọc process.env NGAY LÚC GỌI (không cache ở module-level) — tránh dính
  // giá trị cũ nếu Next.js dev server tái sử dụng module đã compile từ trước
  // khi .env có giá trị đúng.
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new AiLoiCauHinh(
      "Thiếu CLOUDFLARE_ACCOUNT_ID hoặc CLOUDFLARE_API_TOKEN trong .env. " +
        "Tạo token tại dash.cloudflare.com -> My Profile -> API Tokens, quyền \"Workers AI - Edit\"."
    );
  }

  const CF_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run`;

  // LOG TẠM — xoá dòng này sau khi hết lỗi 401. In ra terminal chạy `npm run dev`.
  console.log(
    `[goiCloudflareAI] model=${model} accountId=${CF_ACCOUNT_ID.slice(0, 6)}...${CF_ACCOUNT_ID.slice(-4)} ` +
      `tokenLen=${CF_API_TOKEN.length} tokenEnd=...${CF_API_TOKEN.slice(-4)}`
  );

  const res = await fetch(`${CF_BASE_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    result?: T;
    errors?: unknown;
  } | null;

  if (!res.ok || !json?.success) {
    throw new AiLoiApi(
      `Cloudflare Workers AI trả lỗi (HTTP ${res.status}) khi gọi model "${model}". ` +
        `Kiểm tra lại CLOUDFLARE_API_TOKEN có đủ quyền "Workers AI - Edit" chưa.`,
      res.status,
      json?.errors ?? json
    );
  }

  return json.result as T;
}

export async function sinhAnhVaDanhGia(input: DauVaoSinhAnh): Promise<KetQuaSinhAnh> {
  // 1. Sinh ảnh — bắt buộc phải thành công, lỗi thì ném ra ngay.
  const ketQuaAnh = await goiCloudflareAI<{ image: string }>(MODEL_ANH, {
    prompt: taoPromptAnh(input),
  });

  // 2. Sinh nhận xét — không bắt buộc, lỗi thì bỏ qua (vẫn giữ ảnh đã sinh),
  //    tránh lãng phí 1 lượt gọi ảnh chỉ vì lượt gọi text bị lỗi vặt.
  let nhanXetAI: string | null = null;
  try {
    const ketQuaVanBan = await goiCloudflareAI<{ response: string }>(MODEL_VAN_BAN, {
      messages: [{ role: "user", content: taoPromptDanhGia(input) }],
    });
    nhanXetAI = ketQuaVanBan.response?.trim() || null;
  } catch (err) {
    console.error("[sinhAnhVaDanhGia] Lượt gọi đánh giá text lỗi (bỏ qua, vẫn giữ ảnh):", err);
  }

  return {
    anhDataUri: `data:image/jpeg;base64,${ketQuaAnh.image}`,
    mimeType: "image/jpeg",
    nhanXetAI,
    model: MODEL_ANH,
  };
}

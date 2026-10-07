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

export interface DauVaoSinhAnh {
  tenTrangPhuc: string;
  vungMienTrangPhuc: string;
  tenMauChinh: string;
  hexMauChinh: string;
  tenMauPhu: string;
  hexMauPhu: string;
   /** Rỗng = người dùng không chọn phụ kiện → ảnh không kèm phụ kiện. */
  tenCacPhuKien: string[];
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
 * ===== PROMPT ẢNH CHO FLUX-1-SCHNELL =====
 *
 * Ba lỗi hay gặp và cách xử lý (flux-1-schnell KHÔNG hỗ trợ negative prompt,
 * nên mọi ràng buộc đều viết dạng KHẲNG ĐỊNH):
 *
 * 1) SAI MÀU  -> model không hiểu tên màu tiếng Việt và hay lờ mã hex. Ta đổi sang
 *    từ màu tiếng Anh đơn giản, GẮN TRỰC TIẾP vào từng món đồ ("the tunic is entirely X,
 *    the trousers are entirely Y"), yêu cầu vải trơn không hoa văn, và nhắc lại ở câu cuối.
 * 2) SAI TRANG PHỤC -> không dùng tên riêng ("áo tứ thân"...) làm mô tả duy nhất. Mỗi
 *    trang phục có mô tả hình dáng: cổ, tay, độ dài, cách cài/thắt, phần dưới.
 * 3) SAI GÓC ẢNH -> đặt câu "chính diện, nhìn thẳng ống kính, đối xứng, tay buông thả"
 *    lên đầu prompt (model chú ý phần đầu nhất). Ảnh Cloudflare luôn vuông nên kèm câu
 *    "đứng xa, người chiếm ~75% chiều cao khung" để không bị cắt ngang đùi.
 *
 * Giới hạn của API (theo tài liệu Cloudflare): prompt tối đa 2048 ký tự, steps tối đa 8.
 * Mọi mô tả hình dáng trang phục dưới đây NÊN được đối chiếu lại với nguồn đã duyệt.
 */

/** Tên màu trong DB -> từ màu tiếng Anh dễ hiểu cho model ảnh. */
const MAU_TIENG_ANH: Record<string, string> = {
  "Đỏ son": "vivid vermilion red",
  "Vàng nhũ": "warm golden yellow",
  "Lam chàm": "deep indigo blue",
  "Hồng đào": "soft peach pink",
  "Tím Huế": "soft violet purple",
  "Trắng ngà": "ivory white",
  "Đen huyền": "jet black",
  "Nâu non": "light warm tan brown",
  "Lục ngọc": "jade green",
  "Be pastel": "pastel beige",
};

function mauTiengAnh(tenMau: string): string {
  const khoa = tenMau.normalize("NFC").trim();
  const tim = Object.keys(MAU_TIENG_ANH).find((k) => k.normalize("NFC") === khoa);
  return tim ? MAU_TIENG_ANH[tim] : tenMau;
}

interface MoTaTrangPhuc {
  /** Tên món trên (dùng trong câu quy định màu). */
  tenMonTren: string;
  /** Tên món dưới. */
  tenMonDuoi: string;
  /** Mô tả hình dáng món trên. coYem = người dùng có chọn phụ kiện Yếm đào. */
  monTren: (coYem: boolean) => string;
  /** Mô tả hình dáng món dưới. */
  monDuoi: string;
}

const MO_TA_TRANG_PHUC: Record<string, MoTaTrangPhuc> = {
  "Áo dài": {
    tenMonTren: "ao dai tunic",
    tenMonDuoi: "wide-leg trousers",
    monTren: () =>
      "a Vietnamese ao dai: a long fitted silk tunic with a high stand-up mandarin collar, long sleeves, " +
      "a snug bodice and a long front panel and back panel that fall down to the ankles, " +
      "with the two sides split open from the waist down",
    monDuoi:
      "worn over loose full-length wide-leg trousers that reach the floor and cover the ankles",
  },
  "Áo tứ thân": {
    tenMonTren: "ao tu than tunic",
    tenMonDuoi: "long skirt",
    monTren: (coYem) =>
      "a Vietnamese ao tu than: a long loose open-front tunic with no collar and no buttons, " +
      "long wide sleeves, reaching just below the knees, " +
      "the two front panels are pulled together and tied in a knot at the waist, " +
      `and the open front shows ${coYem ? "a peach-pink" : "a plain pale cream"} inner chest cloth underneath`,
    monDuoi: "worn over a plain long skirt that reaches the ankles",
  },
  "Áo bà ba": {
    tenMonTren: "ao ba ba blouse",
    tenMonDuoi: "wide-leg trousers",
    monTren: () =>
      "a Southern Vietnamese ao ba ba: a simple loose-fitting button-front blouse with a plain rounded neckline, " +
      "long sleeves, hem falling to the hips with small slits at both sides",
    monDuoi:
      "worn with loose full-length wide-leg trousers that reach the ankles",
  },
};

const MO_TA_MAC_DINH: MoTaTrangPhuc = {
  tenMonTren: "traditional tunic",
  tenMonDuoi: "trousers or skirt",
  monTren: () => "a traditional Vietnamese outfit",
  monDuoi: "with matching bottoms",
};

function layMoTaTrangPhuc(ten: string): MoTaTrangPhuc {
  const khoa = ten.normalize("NFC").trim();
  const tim = Object.keys(MO_TA_TRANG_PHUC).find((k) => k.normalize("NFC") === khoa);
  return tim ? MO_TA_TRANG_PHUC[tim] : MO_TA_MAC_DINH;
}

/**
 * Mô tả tiếng Anh + VỊ TRÍ đeo/cầm của từng phụ kiện, để model vẽ đúng chỗ và
 * để phụ kiện nằm trong khung hình toàn thân (ví dụ guốc mộc ở chân).
 * Lưu ý: tránh từ nhạy cảm (bộ lọc NSFW của Cloudflare hay báo nhầm), nên Yếm đào
 * được mô tả là "inner chest cloth" chứ không dùng "halter/bodice".
 */
const MO_TA_PHU_KIEN: Record<string, string> = {
  "Nón lá": "a wide conical palm-leaf hat worn on the head, face still clearly visible",
  "Trâm cài": "a small ornate hairpin fixed in the hair bun at the back of the head",
  "Khăn đóng": "a dark, tightly wrapped Hue-style turban sitting on top of the head",
  "Khăn mỏ quạ": "a black headscarf folded into a crow-beak point at the front of the head and tied at the nape",
  "Nón quai thao":
    "a very wide, flat, round palm-leaf hat with a shallow crown and long silk tassel straps hanging down on both sides of the face",
  "Quạt giấy": "an open folding paper fan held in her right hand in front of the waist",
  "Guốc mộc": "simple wooden clogs on her feet, both clearly visible",
  "Yếm đào": "a peach-pink diamond-shaped inner chest cloth visible at the front opening under the outer garment",
  "Khăn rằn": "an off-white and dark checkered cotton scarf draped loosely around the neck",
};

function moTaPhuKien(cacTen: string[]): string {
  if (cacTen.length === 0) {
    return "No hat, no headwear, no scarf, no jewelry, nothing held in the hands, plain simple flat shoes.";
  }
  const cacMoTa = cacTen.map((ten) => MO_TA_PHU_KIEN[ten] ?? `the accessory "${ten}" worn or held in a natural way`);
  return cacMoTa.length === 1
    ? `One accessory that MUST be clearly visible: ${cacMoTa[0]}. No other accessories.`
    : `Exactly ${cacMoTa.length} accessories, ALL clearly visible at the same time: ${cacMoTa.join("; ")}. No other accessories.`;
}

export function taoPromptAnh(input: DauVaoSinhAnh): string {
  const mo = layMoTaTrangPhuc(input.tenTrangPhuc);
  const mauChinh = mauTiengAnh(input.tenMauChinh);
  const mauPhu = mauTiengAnh(input.tenMauPhu);
  const coYem = input.tenCacPhuKien.some((t) => t.normalize("NFC").trim() === "Yếm đào");
  const camQuat = input.tenCacPhuKien.some((t) => t.normalize("NFC").trim() === "Quạt giấy");
  // Áo tứ thân đã mô tả sẵn yếm ở phần áo -> không liệt kê lại như một phụ kiện riêng.
  const laTuThan = input.tenTrangPhuc.normalize("NFC").trim() === "Áo tứ thân";
  const phuKienCanLiet = laTuThan
    ? input.tenCacPhuKien.filter((t) => t.normalize("NFC").trim() !== "Yếm đào")
    : input.tenCacPhuKien;

  return [
    // 1. GÓC ẢNH + KHUNG HÌNH (đặt đầu tiên)
    `Straight-on FRONT VIEW fashion photograph, camera at eye level pointing directly at the subject.`,
    `One young Vietnamese woman stands upright facing the camera, shoulders level, perfectly symmetrical pose,`,
    camQuat
      ? `her left arm relaxed straight at her side and her body still facing the camera.`
      : `both arms relaxed straight down at her sides.`,
    `Wide full-length shot: the ENTIRE body is visible from the top of the head to the shoes on the floor,`,
    `she stands far from the camera so the figure fills about 75 percent of the image height,`,
    `with clear empty space above the head and below the feet, nothing cropped.`,

    // 2. TRANG PHỤC (hình dáng cụ thể)
    `She wears ${mo.monTren(coYem)}, ${mo.monDuoi}.`,

    // 3. MÀU GẮN VÀO TỪNG MÓN
    `COLORS: the ${mo.tenMonTren} is entirely ${mauChinh}, solid plain fabric, no print, no embroidery, no pattern.`,
    `The lower garment (${mo.tenMonDuoi}) is entirely ${mauPhu}, solid plain fabric, no print, no pattern.`,

    // 4. PHỤ KIỆN
    moTaPhuKien(phuKienCanLiet),

    // 5. BỐI CẢNH (cố định để không làm lệch màu)
    `Plain light grey studio backdrop, soft even natural lighting, no decorations, no props, no text, photorealistic.`,
    `Occasion mood only (do not add scenery): ${input.tenSuKien}.`,

    // 6. NHẮC LẠI ĐIỀU QUAN TRỌNG NHẤT
    `Reminder: front view, full body head to toe, ${mo.tenMonTren} in ${mauChinh}, ${mo.tenMonDuoi} in ${mauPhu}.`,
  ].join(" ");
}

function taoPromptDanhGia(input: DauVaoSinhAnh): string {
  return [
    `Bạn là chuyên gia thời trang. Viết đúng 1-2 câu nhận xét ngắn gọn bằng`,
    `tiếng Việt về sự hài hòa của tổ hợp phối đồ sau, theo phong cách Gen Z`,
    `remix trang phục truyền thống Việt Nam: trang phục "${input.tenTrangPhuc}",`,
    `màu chính "${input.tenMauChinh}", màu phụ "${input.tenMauPhu}",`,
    input.tenCacPhuKien.length > 0
      ? `phụ kiện ${input.tenCacPhuKien.map((t) => `"${t}"`).join(", ")},`
      : `không dùng phụ kiện,`,
    `dịp "${input.tenSuKien}". Chỉ trả về đúng đoạn nhận`,
    `xét, không thêm lời dẫn hay giải thích.`,
  ].join(" ");
}

async function goiCloudflareAI<T>(model: string, body: unknown): Promise<T> {
  // Đọc process.env NGAY LÚC GỌI (không cache ở module-level) — tránh dính
  // giá trị cũ nếu Next.js dev server tái sử dụng module đã compile từ trước
  // khi .env có giá trị đúng.
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new AiLoiCauHinh(
      "Thiếu CLOUDFLARE_ACCOUNT_ID hoặc CLOUDFLARE_API_TOKEN trong .env. " +
        "Tạo token tại dash.cloudflare.com -> My Profile -> API Tokens, quyền \"Workers AI - Edit\"."
    );
  }

  const CF_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run`;

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

/**
 * Chỉ sinh nhận xét (không sinh ảnh). Dùng cho ảnh tự tạo (nạp qua scripts/nap-anh.ts)
 * và để bổ sung nhận xét cho các bản ghi cũ còn thiếu. Trả về null nếu lượt gọi lỗi.
 */
export async function sinhNhanXet(input: DauVaoSinhAnh): Promise<string | null> {
  try {
    const ketQuaVanBan = await goiCloudflareAI<{ response: string }>(MODEL_VAN_BAN, {
      messages: [{ role: "user", content: taoPromptDanhGia(input) }],
    });
    return ketQuaVanBan.response?.trim() || null;
  } catch (err) {
    console.error("[sinhNhanXet] Lượt gọi đánh giá text lỗi (bỏ qua):", err);
    return null;
  }
}

export async function sinhAnhVaDanhGia(input: DauVaoSinhAnh): Promise<KetQuaSinhAnh> {
  // 1. Sinh ảnh — bắt buộc phải thành công, lỗi thì ném ra ngay.
  const ketQuaAnh = await goiCloudflareAI<{ image: string }>(MODEL_ANH, {
    prompt: taoPromptAnh(input),
    steps: 6, // mặc định 4, tối đa 8 (tài liệu Cloudflare); tăng nhẹ để bám prompt hơn
  });

  // 2. Sinh nhận xét — không bắt buộc, lỗi thì bỏ qua (vẫn giữ ảnh đã sinh).
  const nhanXetAI = await sinhNhanXet(input);

  return {
    anhDataUri: `data:image/jpeg;base64,${ketQuaAnh.image}`,
    mimeType: "image/jpeg",
    nhanXetAI,
    model: MODEL_ANH,
  };
}

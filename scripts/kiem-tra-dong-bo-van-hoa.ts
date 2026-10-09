/**
 * KIỂM TRA ĐỒNG BỘ VĂN HOÁ — KHÔNG cần database, chạy trong vài giây.
 *
 *   npx tsx scripts/kiem-tra-dong-bo-van-hoa.ts          kiểm tra, in lỗi
 *   npx tsx scripts/kiem-tra-dong-bo-van-hoa.ts --md     kiểm tra + ghi docs/E1-doi-chieu-van-hoa.md
 *
 * Bắt các lỗi mà bản nháp trước dễ mắc:
 *  - cảnh báo "không phù hợp" dựa trên mục CHƯA KIỂM CHỨNG;
 *  - quy tắc "phù hợp" không có nguồn nào;
 *  - phụ kiện/trang phục trong app nhưng chưa có mục trong thư viện văn hoá;
 *  - thiếu cặp, trùng cặp;
 *  - mục chưa kiểm chứng mà thẻ "vùng miền" không ghi rõ;
 *  - các chi tiết đã biết là chưa kiểm chứng quay lại trong nội dung hiển thị.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CAC_MUC, NHAN_TRANG_THAI, SLUG_THEO_TEN, layMucTheoSlug, laySlugTheoTen } from '../lib/vanHoa/duLieu';
import {
  NOI_DUNG_VAN_HOA,
  PHU_KIEN,
  QUY_TAC,
  TRANG_PHUC,
  VUNG_PHU_KIEN,
  VUNG_TRANG_PHUC,
} from '../lib/vanHoa/quyTacDongBo';

const loi: string[] = [];
const kiemTra = (dieuKien: boolean, thongBao: string) => {
  if (!dieuKien) loi.push(thongBao);
};

// 1. Đủ 27 cặp, không trùng
const cap = new Set<string>();
for (const r of QUY_TAC) {
  const k = `${r.trangPhuc}|${r.phuKien}`;
  kiemTra(!cap.has(k), `Trùng cặp ${k}`);
  cap.add(k);
}
for (const tp of TRANG_PHUC) for (const pk of PHU_KIEN) kiemTra(cap.has(`${tp}|${pk}`), `Thiếu cặp ${tp} × ${pk}`);

// 2. Mỗi trang phục / phụ kiện có mục văn hoá
for (const ten of [...TRANG_PHUC, ...PHU_KIEN]) {
  const slug = laySlugTheoTen(ten);
  kiemTra(Boolean(slug && layMucTheoSlug(slug)), `"${ten}" chưa có mục trong thư viện văn hoá`);
}

// 3. Ràng buộc theo mức độ
for (const r of QUY_TAC) {
  const nhan = `${r.trangPhuc} × ${r.phuKien}`;
  kiemTra(r.ghiChu.trim().length > 0, `${nhan}: ghi chú rỗng`);
  const cacMuc = r.slug.map((s) => layMucTheoSlug(s));
  r.slug.forEach((s, i) => kiemTra(Boolean(cacMuc[i]), `${nhan}: slug "${s}" không tồn tại`));
  const mucTrangPhuc = layMucTheoSlug(laySlugTheoTen(r.trangPhuc) ?? '');
  const mucPhuKien = layMucTheoSlug(laySlugTheoTen(r.phuKien) ?? '');
  const doMotMon = [mucTrangPhuc, mucPhuKien].some((m) => m?.trangThai === 'chua-kiem-chung');

  if (r.mucDo === 'khong_phu_hop') {
    kiemTra(!doMotMon, `${nhan}: cảnh báo "không phù hợp" nhưng một món CHƯA KIỂM CHỨNG`);
    kiemTra(r.nguonRieng !== 'khong', `${nhan}: cảnh báo "không phù hợp" nhưng không có nguồn`);
  }
  if (r.mucDo === 'phu_hop') kiemTra(r.nguonRieng !== 'khong', `${nhan}: "phù hợp" nhưng không có nguồn (phải là chua_co_du_lieu)`);
  if (r.mucDo === 'tuy_dip') kiemTra(!doMotMon, `${nhan}: "tuỳ dịp" dựa trên mục chưa kiểm chứng (nên là chua_co_du_lieu)`);
  if (doMotMon) kiemTra(r.mucDo === 'chua_co_du_lieu', `${nhan}: có món chưa kiểm chứng nhưng mức độ là ${r.mucDo}`);
}

// 4. Thẻ vùng miền: mục đỏ phải tự ghi rõ
for (const [ten, v] of Object.entries({ ...VUNG_TRANG_PHUC, ...VUNG_PHU_KIEN })) {
  const muc = layMucTheoSlug(laySlugTheoTen(ten) ?? '');
  if (muc?.trangThai === 'chua-kiem-chung') {
    kiemTra(/chưa kiểm chứng/i.test(v.moi), `Vùng miền của "${ten}" phải ghi "(chưa kiểm chứng)" vì mục này đang bị cảnh báo đỏ`);
  }
}

// 5. Chi tiết đã bị loại không được quay lại
const CAM = ['1837', 'ngũ luân', 'Lý – Trần', 'Lý-Trần', 'Bảo tàng Áo dài / Nghiên cứu'];
for (const n of NOI_DUNG_VAN_HOA) {
  for (const tu of CAM) {
    kiemTra(!`${n.noiDung} ${n.nguonThamKhao}`.includes(tu), `Nội dung "${n.tieuDe}" chứa chi tiết chưa kiểm chứng: "${tu}"`);
  }
}

// ---- báo cáo ----
const demDo = QUY_TAC.filter((r) => r.mucDo === 'khong_phu_hop').length;
const demCu = QUY_TAC.filter((r) => r.mucCu === 'khong_phu_hop').length;
const dem = (m: string) => QUY_TAC.filter((r) => r.mucDo === m).length;
console.log(`Quy tắc: ${QUY_TAC.length} cặp | phù hợp ${dem('phu_hop')} | hợp có điều kiện ${dem('tuy_dip')} | không phù hợp ${demDo} (trước: ${demCu}) | chưa có dữ liệu ${dem('chua_co_du_lieu')}`);
console.log(`Thư viện: ${CAC_MUC.length} mục | đỏ: ${CAC_MUC.filter((m) => m.trangThai === 'chua-kiem-chung').map((m) => m.slug).join(', ') || '(không)'}`);
if (loi.length === 0) console.log('\nHỢP LỆ: không có mâu thuẫn giữa quy tắc, vùng miền và thư viện văn hoá.');
else {
  console.log(`\n${loi.length} LỖI:`);
  loi.forEach((l) => console.log(' ✘', l));
}

// ---- tài liệu E1 ----
if (process.argv.includes('--md')) {
  const TEN_MUC: Record<string, string> = {
    phu_hop: 'Phù hợp',
    tuy_dip: 'Hợp có điều kiện',
    khong_phu_hop: '**Không phù hợp (cảnh báo)**',
    chua_co_du_lieu: 'Chưa có dữ liệu',
  };
  const TEN_NGUON: Record<string, string> = { 'truc-tiep': 'Trực tiếp', 'gian-tiep': 'Gián tiếp', khong: 'Không có' };
  const dong: string[] = [];
  dong.push('# Đối chiếu văn hoá (bước E1)', '');
  dong.push('Tạo tự động bởi `scripts/kiem-tra-dong-bo-van-hoa.ts --md`. Mọi thay đổi nên sửa ở `lib/vanHoa/quyTacDongBo.ts` rồi tạo lại file này.', '');
  dong.push('## 1. Tóm tắt', '');
  dong.push(`- 27 cặp trang phục × phụ kiện. Cảnh báo "không phù hợp": **${demCu} → ${demDo}**. Chưa có dữ liệu: ${dem('chua_co_du_lieu')} cặp.`);
  dong.push('- Nguyên nhân giảm: nhiều cảnh báo cũ dựa trên khăn mỏ quạ (chưa kiểm chứng) hoặc đoán vùng miền, không có nguồn.');
  dong.push('- Giữ lại 3 cảnh báo vì cả hai món đều có nguồn và nguồn gắn chúng với vùng miền hoặc đối tượng khác nhau.', '');
  dong.push('## 2. Bảng quy tắc', '');
  dong.push('| Trang phục | Phụ kiện | Cũ | Mới | Căn cứ | Ghi chú hiển thị | Mục văn hoá |', '|---|---|---|---|---|---|---|');
  for (const r of QUY_TAC) {
    const doi = r.mucCu === r.mucDo ? '' : ' ⟵ đổi';
    dong.push(
      `| ${r.trangPhuc} | ${r.phuKien} | ${TEN_MUC[r.mucCu]} | ${TEN_MUC[r.mucDo]}${doi} | ${TEN_NGUON[r.nguonRieng]} | ${r.ghiChu} | ${r.slug.map((s) => `\`${s}\``).join(', ')} |`,
    );
  }
  dong.push('', '## 3. Vùng miền (thẻ trên giao diện)', '');
  dong.push('| Mục | Cũ (seed) | Mới | Thư viện văn hoá ghi |', '|---|---|---|---|');
  for (const [ten, v] of Object.entries({ ...VUNG_TRANG_PHUC, ...VUNG_PHU_KIEN })) {
    const m = layMucTheoSlug(SLUG_THEO_TEN[ten] ?? '');
    dong.push(`| ${ten} | ${v.cu} | ${v.cu === v.moi ? '(giữ)' : v.moi} | ${m?.vung ?? '—'} |`);
  }
  dong.push('', '## 4. Nội dung văn hoá hiển thị ở trang phối đồ', '');
  dong.push('Bản cũ có các chi tiết **chưa kiểm chứng được** và đã bị loại: mốc quốc phục "1837–1945", "ngũ luân", áo tứ thân "có thể bắt nguồn từ thời Lý – Trần", khăn mỏ quạ đi cùng áo tứ thân, ý "sống áo tượng trưng tình nghĩa vợ chồng", và tên nguồn chung chung như "Bảo tàng Áo dài / Nghiên cứu Văn hóa Việt Nam". Bản mới viết lại theo thư viện văn hoá và dẫn nguồn thật.', '');
  for (const n of NOI_DUNG_VAN_HOA) dong.push(`- **${n.trangPhuc} — ${n.tieuDe}**. Nguồn: ${n.nguonThamKhao}`);
  dong.push('', '## 5. Việc còn lại cần người', '');
  dong.push('- Người am hiểu (thầy cô Sử/Văn, bảo tàng, câu lạc bộ áo dài) đọc lại cột "Ghi chú hiển thị" và các mục `da-doi-chieu`.');
  dong.push('- Các tên nguồn do nhóm dịch/đặt theo nội dung bài: mở link và đối chiếu tên chính thức.');
  dong.push('- Khăn mỏ quạ: tìm tài liệu chuyên khảo; khi có thể nâng khỏi mức đỏ rồi cập nhật ma trận.');
  dong.push('- Chưa có người mẫu nam: bộ áo dài + khăn đóng chỉ mang tính tham khảo.', '');
  dong.push('## 6. Mức độ xác minh của thư viện', '');
  for (const m of CAC_MUC) dong.push(`- \`${m.slug}\` — ${m.ten}: ${NHAN_TRANG_THAI[m.trangThai].ten}`);
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/E1-doi-chieu-van-hoa.md', dong.join('\n') + '\n', 'utf-8');
  console.log('\nĐã ghi docs/E1-doi-chieu-van-hoa.md');
}

process.exit(loi.length === 0 ? 0 : 1);

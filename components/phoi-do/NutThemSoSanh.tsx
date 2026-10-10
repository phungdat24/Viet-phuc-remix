'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MauSac, PhuKien, TrangPhuc } from '@/types/phoi-do';
import { useNganSoSanh } from '@/hooks/useNganSoSanh';
import { TOI_DA_BO_SO_SANH, khoaBo, type BoMoi, type BoSoSanh } from '@/lib/soSanh';

interface Props {
  /** Bộ đang phối (null khi chưa chọn đủ trang phục + 2 màu). */
  boHienTai: BoMoi | null;
  /** id bộ đang được sửa (đi từ nút "Sửa bộ này" ở trang so sánh); null = thêm bộ mới. */
  idDangSua?: string | null;
  tatCaTrangPhuc: TrangPhuc[];
  tatCaMau: MauSac[];
  tatCaPhuKien: PhuKien[];
}

const NHAN_SLOT = ['Bộ A', 'Bộ B'];

function moTa(bo: BoSoSanh, p: Pick<Props, 'tatCaTrangPhuc' | 'tatCaMau' | 'tatCaPhuKien'>): string {
  const tp = p.tatCaTrangPhuc.find((x) => x.id === bo.trangPhucId)?.ten ?? 'Trang phục';
  const mc = p.tatCaMau.find((x) => x.id === bo.mauChinhId)?.ten ?? '?';
  const mp = p.tatCaMau.find((x) => x.id === bo.mauPhuId)?.ten ?? '?';
  const pk = bo.phuKienIds.length;
  return `${tp} · ${mc} / ${mp}${pk > 0 ? ` · ${pk} phụ kiện` : ''}`;
}

/** Nút "Thêm vào so sánh" + ngăn chứa tối đa 2 bộ ở khung xem trước. */
export default function NutThemSoSanh({ boHienTai, idDangSua = null, tatCaTrangPhuc, tatCaMau, tatCaPhuKien }: Props) {
  const { cacBo, them, xoa, thay } = useNganSoSanh();
  const [thongBao, setThongBao] = useState<string | null>(null);
  const day = cacBo.length >= TOI_DA_BO_SO_SANH;

  // Bộ đang sửa còn trong ngăn không? (người dùng có thể đã xoá nó ở tab khác)
  const chiSoDangSua = idDangSua ? cacBo.findIndex((b) => b.id === idDangSua) : -1;
  const boDangSua = chiSoDangSua >= 0 ? cacBo[chiSoDangSua] : null;
  const giongBoDangSua = Boolean(boHienTai && boDangSua && khoaBo(boHienTai) === khoaBo(boDangSua));

  function xuLyCapNhat() {
    if (!boHienTai || !boDangSua) return;
    // Không cho hai bộ trong ngăn trở nên giống hệt nhau.
    const trungBoKhac = cacBo.some((b) => b.id !== boDangSua.id && khoaBo(b) === khoaBo(boHienTai));
    if (trungBoKhac) {
      setThongBao('Bộ này đang giống hệt bộ còn lại trong ngăn. Hãy đổi một thứ (màu, phụ kiện...) rồi cập nhật.');
      return;
    }
    thay(boDangSua.id, boHienTai);
    setThongBao(`Đã cập nhật ${NHAN_SLOT[chiSoDangSua]}.`);
  }

  function xuLyThem() {
    if (!boHienTai) return;
    const kq = them(boHienTai);
    if (kq.ok) {
      setThongBao(null);
    } else if (kq.lyDo === 'trung') {
      setThongBao('Bộ này đã có trong ngăn. Hãy đổi một thứ (màu, phụ kiện...) rồi thêm lại.');
    } else {
      setThongBao('Ngăn đã đủ 2 bộ. Xoá một bộ để thêm bộ mới.');
    }
  }

  return (
    <div className="rounded-md border border-ink-soft/20 bg-paper p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          Ngăn so sánh{' '}
          <span className="font-normal text-ink-soft">
            · {cacBo.length}/{TOI_DA_BO_SO_SANH}
          </span>
        </p>
        {cacBo.length === TOI_DA_BO_SO_SANH && (
          <Link href="/phoi-do/so-sanh" className="font-medium text-lacquer hover:underline">
            Mở so sánh →
          </Link>
        )}
      </div>

      {cacBo.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {cacBo.map((bo, i) => (
            <li
              key={bo.id}
              className="flex items-center justify-between gap-2 rounded bg-paper-raised/60 px-2.5 py-1.5"
            >
              <span className="min-w-0 text-xs">
                <b className="font-semibold">{NHAN_SLOT[i]}</b>{' '}
                <span className="text-ink-soft">{moTa(bo, { tatCaTrangPhuc, tatCaMau, tatCaPhuKien })}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  xoa(bo.id);
                  setThongBao(null);
                }}
                aria-label={`Xoá ${NHAN_SLOT[i]} khỏi ngăn so sánh`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink-soft hover:text-lacquer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {boDangSua && (
        <button
          type="button"
          onClick={xuLyCapNhat}
          disabled={!boHienTai || giongBoDangSua}
          className="mt-2 w-full rounded-md bg-lacquer py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {giongBoDangSua
            ? `${NHAN_SLOT[chiSoDangSua]} chưa có thay đổi`
            : `Cập nhật ${NHAN_SLOT[chiSoDangSua]} trong so sánh`}
        </button>
      )}

      <button
        type="button"
        onClick={xuLyThem}
        disabled={!boHienTai || day}
        className={`mt-2 w-full rounded-md border py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
          boDangSua
            ? 'border-ink-soft/30 text-ink-soft hover:border-gold'
            : 'border-lacquer text-lacquer hover:bg-lacquer/5'
        }`}
      >
        {day ? 'Ngăn đã đủ 2 bộ' : boDangSua ? 'Hoặc thêm thành bộ mới' : 'Thêm bộ này vào so sánh'}
      </button>

      {cacBo.length === 1 && !thongBao && !boDangSua && (
        <p className="mt-1.5 text-xs text-ink-soft">Đổi một thứ (màu, phụ kiện...) rồi thêm bộ thứ hai.</p>
      )}
      {thongBao && (
        <p role="status" className="mt-1.5 text-xs text-lacquer">
          {thongBao}
        </p>
      )}
    </div>
  );
}

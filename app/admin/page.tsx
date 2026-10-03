"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

type TrangThai = "draft" | "approved" | "rejected";

type ToHop = {
  id: string;
  comboKey: string;
  imageUrl: string | null;
  status: TrangThai;
  createdAt: string;
  aiAssessment: {
    nhanXetAI?: string;
    model?: string;
  } | null;
  ten: {
    trangPhuc: string | null;
    mauChinh: { ten: string; maHex: string } | null;
    mauPhu: { ten: string; maHex: string } | null;
    phuKien: string | null;
    suKien: string | null;
  };
};

const KICH_THUOC_TRANG = 50;

const CAC_TAB: { value: TrangThai; label: string }[] = [
  { value: "draft", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

export default function AdminPage() {
  const [khoa, setKhoa] = useState("");
  const [daMo, setDaMo] = useState(false);
  const [trangThai, setTrangThai] = useState<TrangThai>("draft");
  const [danhSach, setDanhSach] = useState<ToHop[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  async function layDanhSach(
    status: TrangThai,
    offset: number
  ) {
    const query = new URLSearchParams({
      status,
      take: String(KICH_THUOC_TRANG),
      skip: String(offset),
    });

    const res = await fetch(`/api/to-hop-duoc-duyet?${query}`, {
      headers: {
        Authorization: `Bearer ${khoa}`,
      },
      cache: "no-store",
    });

    const body = await res.json();

    if (!res.ok) {
      throw new Error(body.error ?? `Lỗi HTTP ${res.status}`);
    }

    setDanhSach(body.data);
    setTotal(body.total);
    setTrangThai(status);
    setSkip(offset);
    setDaMo(true);
  }

  async function taiDanhSach(
    status: TrangThai,
    offset: number
  ) {
    setDangXuLy(true);
    setLoi("");
    setThongBao("");

    try {
      await layDanhSach(status, offset);
    } catch (error) {
      setLoi(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách."
      );
    } finally {
      setDangXuLy(false);
    }
  }

  function moTrangQuanTri(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void taiDanhSach("draft", 0);
  }

  async function xuLy(
    item: ToHop,
    status: "approved" | "rejected"
  ) {
    const dongY = window.confirm(
      status === "approved"
        ? "Bạn đã kiểm tra ảnh và muốn duyệt tổ hợp này?"
        : "Bạn muốn từ chối tổ hợp này?"
    );

    if (!dongY) return;

    setDangXuLy(true);
    setLoi("");
    setThongBao("");

    let daCapNhat = false;

    try {
      const res = await fetch(
        `/api/to-hop-duoc-duyet/${encodeURIComponent(item.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${khoa}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Lỗi HTTP ${res.status}`);
      }

      daCapNhat = true;

      // Khi xử lý item cuối của trang cuối,
      // trở về trang trước nếu cần.
      const offsetMoi =
        danhSach.length === 1 && skip > 0
          ? Math.max(0, skip - KICH_THUOC_TRANG)
          : skip;

      await layDanhSach(trangThai, offsetMoi);

      setThongBao(
        status === "approved"
          ? "Đã duyệt tổ hợp."
          : "Đã từ chối tổ hợp."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể xử lý tổ hợp.";

      setLoi(
        daCapNhat
          ? `Đã lưu quyết định, nhưng tải lại danh sách thất bại: ${message}`
          : message
      );
    } finally {
      setDangXuLy(false);
    }
  }

  function dongTrangQuanTri() {
    setKhoa("");
    setDaMo(false);
    setDanhSach([]);
    setTotal(0);
    setSkip(0);
    setLoi("");
    setThongBao("");
  }

  const nhanTrangThai = CAC_TAB.find(
    (tab) => tab.value === trangThai
  )?.label;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">
        Quản trị — Duyệt tổ hợp
      </h1>

      <p className="mt-2 mb-6 text-sm">
        Kiểm tra ảnh, cấu trúc trang phục và bối cảnh
        trước khi duyệt.
      </p>

      {!daMo ? (
        <form
          onSubmit={moTrangQuanTri}
          className="max-w-md space-y-4 rounded-lg border p-5"
        >
          <label className="block">
            <span className="mb-2 block font-medium">
              Khóa quản trị
            </span>

            <input
              type="password"
              value={khoa}
              onChange={(event) => setKhoa(event.target.value)}
              autoComplete="off"
              required
              disabled={dangXuLy}
              className="w-full rounded border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={dangXuLy || !khoa}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {dangXuLy ? "Đang kiểm tra..." : "Mở danh sách duyệt"}
          </button>
        </form>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {CAC_TAB.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={trangThai === tab.value}
                disabled={dangXuLy}
                onClick={() => void taiDanhSach(tab.value, 0)}
                className={`rounded border px-4 py-2 disabled:opacity-50 ${
                  trangThai === tab.value
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              disabled={dangXuLy}
              onClick={() => void taiDanhSach(trangThai, skip)}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Tải lại
            </button>

            <button
              type="button"
              disabled={dangXuLy}
              onClick={dongTrangQuanTri}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Đóng phiên
            </button>
          </div>

          <p className="mb-4 text-sm">
            {nhanTrangThai}: {total} tổ hợp.
            {danhSach.length > 0 &&
              ` Đang xem ${skip + 1}–${skip + danhSach.length}.`}
          </p>

          {dangXuLy && (
            <p role="status" className="mb-4">
              Đang xử lý...
            </p>
          )}

          {danhSach.length === 0 && !dangXuLy && (
            <p className="rounded border border-dashed p-8 text-center">
              Không có tổ hợp trong mục này.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {danhSach.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border"
              >
                {item.imageUrl ? (
                  <div className="relative h-80 bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={`Ảnh AI: ${item.ten.trangPhuc ?? "Việt phục"}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-80 items-center justify-center bg-gray-100">
                    Chưa có ảnh
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <h2 className="text-lg font-semibold">
                    {item.ten.trangPhuc ?? "Chưa rõ trang phục"}
                  </h2>

                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">
                        Màu chính:{" "}
                      </dt>
                      <dd className="inline">
                        {item.ten.mauChinh?.ten ?? "—"}
                        {" "}
                        {item.ten.mauChinh?.maHex ?? ""}
                      </dd>
                    </div>

                    <div>
                      <dt className="inline font-medium">
                        Màu phụ:{" "}
                      </dt>
                      <dd className="inline">
                        {item.ten.mauPhu?.ten ?? "—"}
                        {" "}
                        {item.ten.mauPhu?.maHex ?? ""}
                      </dd>
                    </div>

                    <div>
                      <dt className="inline font-medium">
                        Phụ kiện:{" "}
                      </dt>
                      <dd className="inline">
                        {item.ten.phuKien ?? "Không chọn"}
                      </dd>
                    </div>

                    <div>
                      <dt className="inline font-medium">
                        Sự kiện:{" "}
                      </dt>
                      <dd className="inline">
                        {item.ten.suKien ?? "—"}
                      </dd>
                    </div>
                  </dl>

                  <p className="text-sm">
                    {item.aiAssessment?.nhanXetAI ??
                      "Chưa có nhận xét AI."}
                  </p>

                  <details className="text-xs">
                    <summary className="cursor-pointer">
                      Thông tin kỹ thuật
                    </summary>
                    <p className="mt-2 break-all">ID: {item.id}</p>
                    <p className="break-all">
                      Combo: {item.comboKey}
                    </p>
                  </details>

                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm underline"
                    >
                      Mở ảnh để kiểm tra chi tiết
                    </a>
                  )}

                  {item.status === "draft" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={dangXuLy || !item.imageUrl}
                        onClick={() => void xuLy(item, "approved")}
                        className="flex-1 rounded bg-green-700 px-3 py-2 text-white disabled:opacity-50"
                      >
                        Duyệt
                      </button>

                      <button
                        type="button"
                        disabled={dangXuLy}
                        onClick={() => void xuLy(item, "rejected")}
                        className="flex-1 rounded bg-red-700 px-3 py-2 text-white disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      {item.status === "approved"
                        ? "Đã duyệt"
                        : "Đã từ chối"}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={dangXuLy || skip === 0}
              onClick={() =>
                void taiDanhSach(
                  trangThai,
                  Math.max(0, skip - KICH_THUOC_TRANG)
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Trang trước
            </button>

            <span>
              Trang {Math.floor(skip / KICH_THUOC_TRANG) + 1}
            </span>

            <button
              type="button"
              disabled={
                dangXuLy ||
                skip + KICH_THUOC_TRANG >= total
              }
              onClick={() =>
                void taiDanhSach(
                  trangThai,
                  skip + KICH_THUOC_TRANG
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </>
      )}

      {loi && (
        <p role="alert" className="mt-4 text-red-700">
          {loi}
        </p>
      )}

      {thongBao && (
        <p role="status" className="mt-4 text-green-700">
          {thongBao}
        </p>
      )}
    </main>
  );
}
import { BANG_SO_SANH } from '@/lib/vanHoa/duLieu';

export default function BangSoSanh() {
  return (
    <div className="overflow-x-auto rounded-md border border-ink-soft/15">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">So sánh nhanh năm kiểu áo truyền thống</caption>
        <thead className="bg-paper-raised">
          <tr>
            {BANG_SO_SANH.cot.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 font-semibold text-ink">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BANG_SO_SANH.hang.map((h) => (
            <tr key={h[0]} className="border-t border-ink-soft/15">
              {h.map((o, i) =>
                i === 0 ? (
                  <th key={o} scope="row" className="px-3 py-2 font-medium text-ink">
                    {o}
                  </th>
                ) : (
                  <td key={o} className="px-3 py-2 text-ink-soft">
                    {o}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

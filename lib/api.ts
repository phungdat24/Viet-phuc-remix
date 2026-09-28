export async function layDanhSach<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lỗi API ${url}: ${res.status}`);
  const json = await res.json();
  return json.data as T[];
}
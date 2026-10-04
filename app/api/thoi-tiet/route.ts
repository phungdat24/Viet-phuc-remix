import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/thoi-tiet?lat=21.03&lon=105.85
 * Lấy thời tiết hiện tại từ Open-Meteo (miễn phí, không cần API key).
 * Response 200: { data: { nhietDo, camGiac, doAm, luongMua, maThoiTiet, tocDoGio, thoiGian } }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (
    !searchParams.get('lat') ||
    !searchParams.get('lon') ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json({ error: 'Toạ độ không hợp lệ.' }, { status: 400 });
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  // Làm tròn 2 chữ số: đủ chính xác cho thời tiết và giúp cache dùng chung được.
  url.searchParams.set('latitude', lat.toFixed(2));
  url.searchParams.set('longitude', lon.toFixed(2));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
  );
  url.searchParams.set('timezone', 'auto');

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Open-Meteo trả về ${res.status}`);
    const json = await res.json();
    const c = json.current;
    if (!c) throw new Error('Thiếu dữ liệu current');

    return NextResponse.json(
      {
        data: {
          nhietDo: c.temperature_2m,
          camGiac: c.apparent_temperature,
          doAm: c.relative_humidity_2m,
          luongMua: c.precipitation,
          maThoiTiet: c.weather_code,
          tocDoGio: c.wind_speed_10m,
          thoiGian: c.time, // giờ địa phương, dạng "2026-10-04T14:15"
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } },
    );
  } catch (error) {
    console.error('[GET /api/thoi-tiet]', error);
    return NextResponse.json({ error: 'Không lấy được dữ liệu thời tiết lúc này.' }, { status: 502 });
  }
}
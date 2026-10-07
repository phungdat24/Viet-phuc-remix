import type { Metadata } from "next";
import { Fraunces, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Sidebar, { TieuDeDiDong } from '@/components/Sidebar';
import TaiTruocDanhMuc from '@/components/TaiTruocDanhMuc';

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Việt Phục Remix",
  description: "Phối trang phục truyền thống Việt Nam theo phong cách Gen Z",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex">
        <Sidebar />
        {/* pb: chừa chỗ cho thanh tab dưới cùng trên điện thoại */}
        <div className="flex-1 min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <TieuDeDiDong />
          {children}
        </div>
        <TaiTruocDanhMuc />
      </body>
    </html>
  );
}
/** Template (khác layout) được dựng lại mỗi lần đổi trang -> có hiệu ứng vào nhẹ giữa các trang. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="trang-vao">{children}</div>;
}

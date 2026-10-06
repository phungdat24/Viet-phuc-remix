# Cài script nạp ảnh (nap-anh)

Yêu cầu: đã cài gói supabase-storage-patch (có lib/luuAnhSupabase.ts), đã bật Public cho bucket, Node 20.6 trở lên.

1. Chép vào dự án (giữ đúng thư mục):
   - scripts/nap-anh.ts
   - scripts/nap-anh-ten.ts
   - anh-moi/HUONG-DAN.txt
2. Mở package.json, thêm 1 dòng vào "scripts":
       "nap-anh": "tsx --env-file=.env scripts/nap-anh.ts"
   (nhớ dấu phẩy ở dòng trước nó)
3. Mở .gitignore, thêm dòng:   /anh-moi/
4. Chạy thử:
       npm run nap-anh -- --danh-sach     (xem tên hợp lệ)
       Thả ảnh vào anh-moi/ rồi:  npm run nap-anh -- --thu   (kiểm tra, chưa ghi gì)
       Đúng rồi thì:               npm run nap-anh

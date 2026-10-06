# Cài Supabase Storage vào dự án

1. Giải nén, chép đè các file vào dự án (giữ đúng thư mục):
   - lib/luuAnhSupabase.ts            (file mới)
   - scripts/upload-anh-cu.ts         (file mới)
   - app/api/to-hop-duoc-duyet/route.ts  (thay file cũ)
   - next.config.ts                   (thay file cũ)
2. Cài thư viện:   npm i @supabase/supabase-js sharp
3. Mở .env.supabase.example, copy 2 dòng vào .env, điền SUPABASE_SERVICE_ROLE_KEY
   (Supabase -> Project Settings -> API Keys -> service_role / secret).
4. Chuyển 11 ảnh cũ lên bucket:   npx tsx --env-file=.env scripts/upload-anh-cu.ts
5. Chạy thử:  npm run dev -> sinh 1 ảnh AI -> kiểm tra file xuất hiện trong bucket ai/...
6. Khi deploy Vercel: thêm SUPABASE_SERVICE_ROLE_KEY và SUPABASE_BUCKET vào Environment Variables.

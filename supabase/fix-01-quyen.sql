-- Vá quyền cho project đã chạy schema.sql trước ngày 29/10/2026.
-- Cách chạy: Supabase → SQL Editor → New query → dán toàn bộ → Run. Chạy lại nhiều lần cũng không sao.

-- 1) Cho phép mọi vai trò gọi hàm kiểm tra quản trị (các điều kiện phân quyền đều gọi hàm này).
--    Một số project mới không tự cấp quyền chạy hàm cho anon / authenticated.
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Tải ảnh có ghi đè (nút "Nhập 11 món mẫu" dùng kiểu này) cần thêm quyền ĐỌC trong kho ảnh.
--    Chỉ quản trị viên được đọc danh sách file; khách xem ảnh qua đường dẫn công khai nên không bị ảnh hưởng.
drop policy if exists "ảnh: admin xem" on storage.objects;
create policy "ảnh: admin xem" on storage.objects for select to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- 3) Kiểm tra nhanh: dòng kết quả phải có is_admin = true khi chạy bằng tài khoản quản trị.
--    (Trong SQL Editor bạn chạy với quyền chủ project nên dòng này chỉ để xem bảng admins có đúng email chưa.)
select u.email, a.user_id is not null as co_trong_bang_admins
from auth.users u left join public.admins a on a.user_id = u.id;

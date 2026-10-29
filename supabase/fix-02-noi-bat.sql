-- Thêm "món nổi bật" (đặt trên đảo giữa tiệm). Chạy một lần: Supabase → SQL Editor → dán → Run.
-- Chạy lại nhiều lần cũng không sao.
alter table public.products add column if not exists featured boolean not null default false;

-- Mỗi lúc chỉ có tối đa một món nổi bật (chọn món mới thì món cũ phải được bỏ chọn trước; trang admin tự làm việc này)
create unique index if not exists products_one_featured on public.products (featured) where featured;

-- 15 Xóm Lẻ: bảng sản phẩm, kho ảnh và phân quyền.
-- Cách chạy: Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần cũng không sao (không xoá dữ liệu đã có).

-- 1) Danh sách quản trị viên: chỉ tài khoản có tên ở đây mới được thêm/sửa/xoá sản phẩm
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- quản trị viên được xem danh sách quản trị (để trang admin biết mình có quyền)
drop policy if exists "admins: tự xem" on public.admins;
create policy "admins: tự xem" on public.admins for select to authenticated using (user_id = auth.uid());

-- 2) Bảng sản phẩm (cột trùng tên với các trường trong src/config/products.js)
create table if not exists public.products (
  id          text primary key,                                   -- mã ngắn không dấu, ví dụ 'thun-hong'
  zone        text not null check (zone in ('hoodie', 'skate', 'shoes')),
  type        text check (type in ('tee', 'hoodie', 'dress')),    -- khu hoodie: quyết định chiều dài, độ phồng
  slot        integer,                                            -- thứ tự trên kệ (số nhỏ ở phía cửa)
  name        text not null,
  kind        text,                                               -- dòng nhỏ phía trên tên, ví dụ 'Áo thun · oversize'
  brand       text,
  price       integer not null check (price >= 0),                -- đơn vị đồng
  sizes       text[] not null default '{}',
  material    text,
  color       text,
  fit         text,
  description text,
  meta        text,
  image       text,                                               -- đường dẫn ảnh chính trong kho 'products'
  images      jsonb not null default '[]',                        -- nhiều mặt: [{ "src": "...", "label": "Mặt sau" }]
  look        jsonb,                                              -- màu dựng mô hình giày
  published   boolean not null default true,                      -- false = ẩn khỏi cửa tiệm, vẫn giữ trong admin
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_zone_slot on public.products (zone, slot);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- 3) Phân quyền bảng sản phẩm
alter table public.products enable row level security;

-- ai cũng xem được món đang bày bán; quản trị viên xem được cả món đang ẩn
drop policy if exists "products: xem" on public.products;
create policy "products: xem" on public.products for select
  using (published or public.is_admin());

drop policy if exists "products: admin thêm" on public.products;
create policy "products: admin thêm" on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "products: admin sửa" on public.products;
create policy "products: admin sửa" on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: admin xoá" on public.products;
create policy "products: admin xoá" on public.products for delete to authenticated
  using (public.is_admin());

-- 4) Kho ảnh 'products': ai cũng xem được, chỉ quản trị viên được tải lên / thay / xoá.
--    Giới hạn 5 MB mỗi ảnh, chỉ nhận WebP / PNG / JPEG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ảnh: admin tải lên" on storage.objects;
create policy "ảnh: admin tải lên" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "ảnh: admin thay" on storage.objects;
create policy "ảnh: admin thay" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "ảnh: admin xoá" on storage.objects;
create policy "ảnh: admin xoá" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- 5) SAU KHI tạo tài khoản quản trị (Authentication → Users → Add user), chạy riêng dòng dưới,
--    thay email bằng email bạn vừa tạo:
-- insert into public.admins (user_id) select id from auth.users where email = 'email-cua-ban@gmail.com';

// Kết nối Supabase (cơ sở dữ liệu + kho ảnh sản phẩm).
// Publishable key được phép nằm công khai trong trang web: quyền đọc/ghi do phân quyền (RLS)
// trong supabase/schema.sql quyết định, không phải do giữ bí mật key này.
// Muốn đổi sang project khác: đặt VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY
// trong file .env.local (máy mình) hoặc Environment Variables trên Vercel.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zpieaofkwsxqdkbjgomc.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_eWWpZRKyQB4V3YrtqoOyqg_ftFDxZy8';

// Kho ảnh sản phẩm (tạo trong schema.sql)
export const BUCKET = 'products';

// Khu trưng bày đã chuyển hẳn sang cơ sở dữ liệu: kể cả khi trống cũng không dùng dữ liệu mẫu trong code.
// Các khu khác (ván, giày) vẫn dùng src/config/products.js cho tới khi được chuyển.
export const MANAGED_ZONES = ['hoodie'];

// Đường dẫn ảnh công khai của một file trong kho
export const publicUrl = path =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;

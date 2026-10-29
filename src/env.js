// Thông tin môi trường đọc một lần khi tải trang.
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const small = Math.min(innerWidth, innerHeight) < 700;
export const $ = id => document.getElementById(id);

// Đường dẫn file: ảnh trên Supabase (https://…) giữ nguyên, file trong public/ thì thêm đường gốc của trang
export const assetUrl = src => (/^(https?:|data:|blob:)/.test(src) ? src : import.meta.env.BASE_URL + src);

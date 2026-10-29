// Tải danh sách sản phẩm cho cửa tiệm từ Supabase.
// - Khu đã chuyển sang cơ sở dữ liệu (MANAGED_ZONES): luôn lấy từ Supabase.
// - Khu chưa chuyển: lấy từ Supabase nếu có món, không thì dùng danh sách mẫu trong src/config/products.js.
// - Không kết nối được (mất mạng, Supabase lỗi): dùng toàn bộ danh sách mẫu để cửa tiệm vẫn có hàng.
import { PRODUCTS, setActiveProducts } from '../config/products.js';
import { SUPABASE_URL, SUPABASE_KEY, MANAGED_ZONES, publicUrl } from '../config/supabase.js';

const isUrl = s => /^(https?:|data:|blob:)/.test(s);
const fileUrl = s => (!s ? s : isUrl(s) ? s : publicUrl(s));

// Một dòng trong bảng products → đối tượng sản phẩm như trong products.js
export function rowToProduct(r) {
  const p = {};
  for (const [k, v] of Object.entries(r)) if (v !== null) p[k] = v;   // bỏ ô trống để giữ đúng giá trị mặc định
  p.image = fileUrl(r.image);
  p.images = (r.images || []).map(v => ({ ...v, src: fileUrl(v.src) }));
  p.sizes = r.sizes || [];
  return p;
}

export async function fetchPublishedProducts({ timeout = 6000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const q = 'select=*&published=eq.true&order=zone.asc,slot.asc.nullslast,created_at.asc';
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${q}`, { headers: { apikey: SUPABASE_KEY }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Supabase trả về ${res.status}: ${await res.text()}`);
    return (await res.json()).map(rowToProduct);
  } finally {
    clearTimeout(timer);
  }
}

export async function loadCatalog() {
  try {
    const rows = await fetchPublishedProducts();
    const fromDb = new Set([...MANAGED_ZONES, ...rows.map(p => p.zone)]);
    setActiveProducts([...PRODUCTS.filter(p => !fromDb.has(p.zone)), ...rows]);
    return { source: 'supabase', count: rows.length };
  } catch (e) {
    console.warn('Không tải được sản phẩm từ Supabase, dùng danh sách mẫu.', e);
    return { source: 'fallback', error: e };
  }
}

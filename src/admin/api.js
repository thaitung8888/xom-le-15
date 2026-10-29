// Làm việc với Supabase cho trang quản trị: đăng nhập, đọc/ghi bảng products, tải ảnh lên kho.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, BUCKET, publicUrl } from '../config/supabase.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

const isUrl = s => /^(https?:|data:|blob:)/.test(s || '');
export const fileUrl = path => (!path ? '' : isUrl(path) ? path : publicUrl(path));

// Lỗi từ Supabase → câu tiếng Việt dễ hiểu
export function explain(err) {
  const m = (err && (err.message || err.error_description || String(err))) || 'Lỗi không rõ';
  if (/Invalid login credentials/i.test(m)) return 'Sai email hoặc mật khẩu.';
  if (/Email not confirmed/i.test(m)) return 'Email chưa được xác nhận. Vào Supabase → Authentication → Users để xác nhận tài khoản.';
  if (/row-level security|permission denied|Unauthorized|403/i.test(m)) return 'Tài khoản này chưa có quyền quản trị (chưa có tên trong bảng admins).';
  if (/duplicate key/i.test(m)) return 'Mã sản phẩm bị trùng, hãy đổi tên một chút.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Không kết nối được Supabase. Kiểm tra mạng rồi thử lại.';
  if (/exceeded the maximum allowed size|Payload too large/i.test(m)) return 'Ảnh quá lớn (tối đa 5 MB).';
  return m;
}
const check = ({ data, error }) => { if (error) throw error; return data; };

// ----- tài khoản -----
export const signIn = (email, password) => sb.auth.signInWithPassword({ email, password }).then(check);
export const signOut = () => sb.auth.signOut();
export const currentUser = async () => (await sb.auth.getSession()).data.session?.user || null;
export const onAuthChange = fn => sb.auth.onAuthStateChange((_e, session) => fn(session?.user || null));
export async function isAdmin(user) {
  const data = check(await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle());
  return !!data;
}

// ----- sản phẩm -----
export async function listProducts(zone) {
  return check(await sb.from('products').select('*').eq('zone', zone)
    .order('slot', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }));
}
export const insertProduct = async row => check(await sb.from('products').insert(row).select().single());
export const updateProduct = async (id, patch) => check(await sb.from('products').update(patch).eq('id', id).select().single());
export const upsertProduct = async row => check(await sb.from('products').upsert(row).select().single());
export async function deleteProduct(row) {
  check(await sb.from('products').delete().eq('id', row.id));
  await removeFiles(filesOf(row));
}

// Các file trong kho mà một sản phẩm đang dùng
export const filesOf = row => [row.image, ...(row.images || []).map(v => v.src)].filter(p => p && !isUrl(p));

// ----- ảnh -----
// Mỗi lần tải lên dùng tên file mới để trình duyệt không hiện ảnh cũ còn lưu trong bộ nhớ đệm
export async function uploadImage(productId, blob, name = Date.now().toString(36), upsert = false) {
  const path = `${productId}/${name}.webp`;
  check(await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert }));
  return path;
}
export async function removeFiles(paths) {
  if (!paths.length) return;
  const { error } = await sb.storage.from(BUCKET).remove(paths);
  if (error) console.warn('Không xoá được ảnh cũ trong kho:', paths, error);
}

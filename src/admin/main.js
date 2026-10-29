// Trang quản trị 15 Xóm Lẻ: đăng nhập, xem / thêm / sửa / xoá / ẩn hiện / đổi thứ tự sản phẩm trên kệ áo.
import './admin.css';
import { PRODUCTS, formatPrice } from '../config/products.js';
import { assetUrl } from '../env.js';
import {
  signIn, signOut, currentUser, onAuthChange, isAdmin, explain,
  listProducts, insertProduct, updateProduct, upsertProduct, deleteProduct,
  uploadImage, removeFiles, filesOf, fileUrl
} from './api.js';
import { prepareGarmentImage } from './image.js';

const ZONE = 'hoodie';
const RACK_MAX = 25;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const TYPE_LABEL = { tee: 'Áo thun', hoodie: 'Hoodie', dress: 'Váy' };

const $ = id => document.getElementById(id);
const show = (id, on = true) => { $(id).hidden = !on; };
let rows = [];          // sản phẩm khu kệ áo, theo thứ tự slot
let user = null;

// ---------------- đăng nhập ----------------
async function boot() {
  try { user = await currentUser(); } catch { user = null; }
  await route();
  onAuthChange(async u => { if ((u?.id || null) !== (user?.id || null)) { user = u; await route(); } });
}

async function route() {
  show('boot', false);
  ['login', 'denied', 'panel'].forEach(id => show(id, false));
  $('who').hidden = $('logout').hidden = !user;
  if (!user) { show('login'); $('loginForm').email.focus(); return; }
  $('who').textContent = user.email;
  let ok = false;
  try { ok = await isAdmin(user); } catch (e) { toast(explain(e), true); }
  if (!ok) {
    $('deniedSql').textContent = `insert into public.admins (user_id) select id from auth.users where email = '${user.email}';`;
    show('denied'); return;
  }
  show('panel');
  await refresh();
}

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget, btn = f.querySelector('button');
  $('loginErr').textContent = '';
  if (!f.email.value || !f.password.value) { $('loginErr').textContent = 'Nhập email và mật khẩu.'; return; }
  btn.disabled = true; btn.textContent = 'Đang đăng nhập…';
  try { const { user: u } = await signIn(f.email.value.trim(), f.password.value); user = u; f.password.value = ''; await route(); }
  catch (err) { $('loginErr').textContent = explain(err); }
  finally { btn.disabled = false; btn.textContent = 'Đăng nhập'; }
});
$('logout').addEventListener('click', async () => { await signOut(); user = null; route(); });
$('deniedRetry').addEventListener('click', route);

// ---------------- danh sách ----------------
async function refresh() {
  try { rows = await listProducts(ZONE); }
  catch (e) { toast(explain(e), true); rows = []; }
  renderList();
}

function renderList() {
  const live = rows.filter(r => r.published).length;
  $('count').textContent = `${rows.length} món · ${live} đang bày${live > RACK_MAX ? ` · kệ chỉ treo ${RACK_MAX} món đầu, các món sau sẽ không hiện` : ''}`;
  show('seedBox', rows.length === 0);
  const list = $('list'); list.replaceChildren();
  rows.forEach((r, i) => list.append(rowEl(r, i)));
}

function rowEl(r, i) {
  const li = el('li', 'item' + (r.published ? '' : ' off'));
  // tay nắm: kéo để đổi chỗ (chuột hoặc ngón tay), hoặc bấm vào rồi dùng phím ↑ ↓
  const num = el('button', 'grip');
  num.type = 'button'; num.title = 'Kéo để đổi chỗ'; num.setAttribute('aria-label', `Vị trí ${i + 1}: ${r.name}. Kéo hoặc dùng phím mũi tên lên xuống để đổi chỗ`);
  num.append(el('span', 'dots', '⋮⋮'), el('span', 'num', String(i + 1).padStart(2, '0')));
  num.addEventListener('pointerdown', e => startDrag(e, li, i));
  num.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const j = i + (e.key === 'ArrowUp' ? -1 : 1);
    if (j < 0 || j >= rows.length) return;
    reorder(i, j);
    $('list').children[j]?.querySelector('.grip')?.focus();
  });
  const th = el('span', 'thumb'); if (r.image) { const im = el('img'); im.src = fileUrl(r.image); im.alt = ''; im.loading = 'lazy'; th.append(im); }
  const info = el('div', 'info');
  const t = TYPE_LABEL[r.type] || r.type || '';
  const sub = !r.kind ? t : r.kind.toLowerCase().startsWith(t.toLowerCase()) ? r.kind : `${t} · ${r.kind}`;
  info.append(el('strong', 'name', r.name), el('span', 'sub', sub));
  const price = el('span', 'price', formatPrice(r.price));
  const status = el('button', 'pill' + (r.published ? ' on' : ''), r.published ? 'Đang bày' : 'Đang ẩn');
  status.type = 'button'; status.title = r.published ? 'Bấm để ẩn khỏi cửa tiệm' : 'Bấm để bày lên kệ';
  status.addEventListener('click', () => togglePublished(r, status));
  const act = el('div', 'act');
  const edit = el('button', 'btn small', 'Sửa'); edit.type = 'button'; edit.addEventListener('click', () => openEditor(r));
  // ★ món nổi bật trên đảo giữa tiệm (chỉ một món; chọn món khác thì món cũ tự bỏ)
  const star = el('button', 'star' + (r.featured ? ' on' : ''), '★');
  star.type = 'button'; star.title = r.featured ? 'Đang là món nổi bật · bấm để bỏ' : 'Chọn làm món nổi bật trên đảo giữa tiệm';
  star.setAttribute('aria-pressed', !!r.featured); star.setAttribute('aria-label', star.title);
  star.addEventListener('click', () => toggleFeatured(r, star));
  act.append(star, edit);
  li.append(num, th, info, price, status, act);
  return li;
}

async function toggleFeatured(r, btn) {
  btn.disabled = true;
  const on = !r.featured;
  try {
    // bỏ chọn món đang nổi bật trước (cơ sở dữ liệu chỉ cho phép một món), rồi chọn món này
    for (const o of rows.filter(o => o.featured && o.id !== r.id)) { await updateProduct(o.id, { featured: false }); o.featured = false; }
    Object.assign(r, await updateProduct(r.id, { featured: on }));
    renderList();
    toast(on ? `"${r.name}" là món nổi bật trên đảo giữa tiệm.` : 'Đã bỏ món nổi bật.');
  } catch (e) {
    const m = explain(e);
    toast(/featured/.test(m) ? 'Supabase chưa có cột "featured": chạy file supabase/fix-02-noi-bat.sql trong SQL Editor.' : m, true);
    btn.disabled = false;
  }
}

async function togglePublished(r, btn) {
  btn.disabled = true;
  try { Object.assign(r, await updateProduct(r.id, { published: !r.published })); renderList(); toast(r.published ? 'Đã bày lên kệ.' : 'Đã ẩn khỏi cửa tiệm.'); }
  catch (e) { toast(explain(e), true); btn.disabled = false; }
}

// Chuyển món ở vị trí `from` tới vị trí `to`, rồi lưu lại thứ tự (chỉ ghi các món đổi chỗ)
let saving = Promise.resolve();
function reorder(from, to) {
  if (from === to) return;
  const [m] = rows.splice(from, 1); rows.splice(to, 0, m);
  renderList();
  saving = saving.then(renumber).then(() => toast('Đã lưu thứ tự trên kệ.'))
    .catch(async e => { toast(explain(e), true); await refresh(); });
}

// Kéo thả bằng Pointer Events: chạy được cả chuột lẫn cảm ứng (kéo thả HTML5 không chạy trên điện thoại).
// Món đang kéo đi theo con trỏ, các món khác trượt nhường chỗ; thả tay mới đổi thứ tự và lưu.
function startDrag(e, li, from) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  const list = $('list'), items = [...list.children], grip = e.currentTarget;
  const gapPx = parseFloat(getComputedStyle(list).rowGap) || 8;
  const tops = items.map(n => n.getBoundingClientRect().top + scrollY);
  const mids = items.map((n, k) => tops[k] + n.offsetHeight / 2);
  const step = li.offsetHeight + gapPx;
  const startY = e.clientY + scrollY;
  let to = from, lastY = e.clientY, raf = 0, moved = false;
  grip.setPointerCapture(e.pointerId);
  li.classList.add('dragging'); list.classList.add('sorting'); document.body.classList.add('dragging-now');

  function layout() {
    const dy = lastY + scrollY - startY;
    if (Math.abs(dy) > 3) moved = true;
    li.style.transform = `translateY(${dy}px)`;
    const center = mids[from] + dy;
    to = from;
    for (let k = from + 1; k < items.length; k++) if (center > mids[k]) to = k;
    for (let k = from - 1; k >= 0; k--) if (center < mids[k]) to = k;
    items.forEach((n, k) => {
      if (k === from) return;
      const shift = from < to && k > from && k <= to ? -step : from > to && k < from && k >= to ? step : 0;
      n.style.transform = shift ? `translateY(${shift}px)` : '';
    });
  }
  // kéo sát mép trên / dưới màn hình thì trang tự cuộn
  function tick() {
    const edge = 70, v = lastY < edge ? -(edge - lastY) / 4 : lastY > innerHeight - edge ? (lastY - innerHeight + edge) / 4 : 0;
    if (v) { scrollBy(0, v); layout(); }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  const onMove = ev => { lastY = ev.clientY; layout(); };
  const onUp = () => {
    cancelAnimationFrame(raf);
    grip.removeEventListener('pointermove', onMove); grip.removeEventListener('pointerup', onUp); grip.removeEventListener('pointercancel', onUp);
    list.classList.remove('sorting'); document.body.classList.remove('dragging-now');
    items.forEach(n => { n.style.transform = ''; n.classList.remove('dragging'); });
    if (moved) reorder(from, to);
  };
  grip.addEventListener('pointermove', onMove);
  grip.addEventListener('pointerup', onUp);
  grip.addEventListener('pointercancel', onUp);
}

async function renumber() {
  // đánh số lại slot 0, 1, 2… theo thứ tự hiện tại
  const changed = rows.map((r, k) => [r, k]).filter(([r, k]) => r.slot !== k);
  await Promise.all(changed.map(async ([r, k]) => { await updateProduct(r.id, { slot: k }); r.slot = k; }));
}

// ---------------- nhập 11 món mẫu ----------------
$('seedBtn').addEventListener('click', async () => {
  const btn = $('seedBtn'), samples = PRODUCTS.filter(p => p.zone === ZONE && p.image);
  if (!confirm(`Nhập ${samples.length} món mẫu (kèm ảnh) lên Supabase?`)) return;
  btn.disabled = true;
  let done = 0;
  try {
    for (const p of samples) {
      btn.textContent = `Đang nhập ${done + 1}/${samples.length}…`;
      const blob = await (await fetch(assetUrl(p.image))).blob();
      const path = await uploadImage(p.id, blob, 'mau', true);
      const { zone, type, slot, name, kind, brand, price, sizes, material, color, fit, description, meta } = p;
      await upsertProduct(clean({ id: p.id, zone, type, slot, name, kind, brand, price, sizes, material, color, fit, description, meta, image: path, images: [], published: true, featured: !!p.featured }));
      done++;
    }
    toast(`Đã nhập ${done} món mẫu.`);
  } catch (e) { toast(`Dừng ở món thứ ${done + 1}: ${explain(e)}`, true); }
  btn.disabled = false; btn.textContent = 'Nhập 11 món mẫu';
  await refresh();
});

// ---------------- thêm / sửa ----------------
const dlg = $('editor'), form = $('form');
let editing = null;       // dòng đang sửa (null = thêm mới)
let mainImg = null;       // { path } ảnh đã có, hoặc { blob, url, info } ảnh mới chưa tải lên
let views = [];           // ảnh các mặt khác: { path, label } hoặc { blob, url, label }

SIZES.forEach(s => {
  const l = el('label', 'chip'); const c = el('input'); c.type = 'checkbox'; c.value = s; c.name = 'size';
  l.append(c, el('span', '', s)); $('sizeChips').append(l);
});

$('addBtn').addEventListener('click', () => openEditor(null));
dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeEditor));
dlg.addEventListener('cancel', e => { if (form.dataset.busy) e.preventDefault(); });
form.price.addEventListener('input', () => { const n = parsePrice(form.price.value); $('pricePreview').textContent = n === null ? '' : formatPrice(n); });

function openEditor(r) {
  editing = r; form.reset(); $('formErr').textContent = '';
  $('edTitle').textContent = r ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
  show('delBtn', !!r);
  mainImg = r?.image ? { path: r.image } : null;
  views = (r?.images || []).map(v => ({ path: v.src, label: v.label || '' }));
  if (r) {
    for (const k of ['name', 'kind', 'brand', 'material', 'color', 'fit', 'description']) form[k].value = r[k] || '';
    form.type.value = r.type || 'tee';
    form.price.value = r.price ?? '';
    form.published.checked = !!r.published;
    const extra = [];
    (r.sizes || []).forEach(s => { const c = form.querySelector(`input[name=size][value="${CSS.escape(s)}"]`); if (c) c.checked = true; else extra.push(s); });
    form.sizesExtra.value = extra.join(', ');
  }
  form.price.dispatchEvent(new Event('input'));
  renderMain(); renderViews();
  dlg.showModal();
  form.name.focus();
}
function closeEditor() { if (!form.dataset.busy) dlg.close(); }

function renderMain(info = '') {
  const pv = $('mainPreview');
  const src = mainImg?.url || (mainImg?.path && fileUrl(mainImg.path));
  pv.hidden = !src; if (src) pv.src = src;
  $('dropHint').hidden = !!src;
  $('drop').classList.toggle('has', !!src);
  $('mainInfo').textContent = info;
}

async function pickImage(file) {
  const r = await prepareGarmentImage(file);
  const notes = [`${r.width}×${r.height}px, ${(r.blob.size / 1024).toFixed(0)} KB`];
  if (r.removedBackground) notes.push('đã tự xoá nền, kiểm tra lại viền áo');
  if (r.lowRes) notes.push('ảnh gốc hơi nhỏ, lên web có thể mờ (nên dùng ảnh cao từ 1000px)');
  return { ...r, note: notes.join(' · ') };
}

$('mainFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  $('mainInfo').textContent = 'Đang xử lý ảnh…';
  try { const r = await pickImage(file); mainImg = { blob: r.blob, url: r.url }; renderMain(r.note); }
  catch (err) { renderMain(); $('mainInfo').textContent = explain(err); }
});
const drop = $('drop');
['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => {
  const f = e.dataTransfer.files[0]; if (!f) return;
  const dt = new DataTransfer(); dt.items.add(f); $('mainFile').files = dt.files; $('mainFile').dispatchEvent(new Event('change'));
});

$('viewFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try { const r = await pickImage(file); views.push({ blob: r.blob, url: r.url, label: views.length ? `Mặt ${views.length + 2}` : 'Mặt sau' }); renderViews(); }
  catch (err) { toast(explain(err), true); }
});
function renderViews() {
  const box = $('views'); box.replaceChildren();
  views.forEach((v, i) => {
    const d = el('div', 'view');
    const im = el('img'); im.alt = ''; im.src = v.url || fileUrl(v.path);
    const inp = el('input'); inp.value = v.label; inp.placeholder = 'Tên mặt (ví dụ Mặt sau)'; inp.maxLength = 30;
    inp.addEventListener('input', () => { v.label = inp.value; });
    const rm = iconBtn('×', 'Bỏ ảnh này', () => { views.splice(i, 1); renderViews(); });
    d.append(im, inp, rm); box.append(d);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (form.dataset.busy) return;
  const err = msg => { $('formErr').textContent = msg; };
  const name = form.name.value.trim(), price = parsePrice(form.price.value);
  if (!name) return err('Nhập tên sản phẩm.');
  if (price === null) return err('Giá phải là số, ví dụ 250000.');
  if (!mainImg) return err('Chọn ảnh chính cho sản phẩm.');
  err('');
  busy(true);
  const uploaded = [];
  try {
    const id = editing ? editing.id : uniqueId(slugify(name));
    let image = mainImg.path;
    if (mainImg.blob) { image = await uploadImage(id, mainImg.blob); uploaded.push(image); }
    const images = [];
    for (const v of views) {
      let src = v.path;
      if (v.blob) { src = await uploadImage(id, v.blob); uploaded.push(src); }
      images.push({ src, label: v.label.trim() || 'Mặt khác' });
    }
    const sizes = [...form.querySelectorAll('input[name=size]:checked')].map(c => c.value)
      .concat(form.sizesExtra.value.split(',').map(s => s.trim()).filter(Boolean));
    const row = clean({
      zone: ZONE, type: form.type.value, name, price,
      kind: form.kind.value, brand: form.brand.value, sizes,
      material: form.material.value, color: form.color.value, fit: form.fit.value,
      description: form.description.value, image, images, published: form.published.checked
    });
    let saved;
    if (editing) {
      saved = await updateProduct(id, row);
      // xoá các ảnh cũ không còn dùng
      const keep = new Set(filesOf(saved));
      await removeFiles(filesOf(editing).filter(p => !keep.has(p)));
    } else {
      row.id = id;
      row.slot = rows.reduce((m, r) => Math.max(m, r.slot ?? -1), -1) + 1;   // thêm vào cuối kệ
      saved = await insertProduct(row);
    }
    busy(false); dlg.close();
    toast(editing ? 'Đã lưu thay đổi.' : 'Đã thêm sản phẩm. Tải lại cửa tiệm để thấy trên kệ.');
    await refresh();
  } catch (ex) {
    await removeFiles(uploaded);   // lưu lỗi thì dọn ảnh vừa tải lên
    busy(false); err(explain(ex));
  }
});

$('delBtn').addEventListener('click', async () => {
  if (!editing || !confirm(`Xoá hẳn "${editing.name}"? Ảnh của món này cũng bị xoá, không lấy lại được.`)) return;
  busy(true);
  try { await deleteProduct(editing); rows = rows.filter(r => r.id !== editing.id); await renumber(); busy(false); dlg.close(); toast('Đã xoá sản phẩm.'); renderList(); }
  catch (e) { busy(false); $('formErr').textContent = explain(e); }
});

function busy(on) {
  if (on) form.dataset.busy = '1'; else delete form.dataset.busy;
  form.querySelectorAll('button, input, select, textarea').forEach(n => { n.disabled = on; });
  $('saveBtn').textContent = on ? 'Đang lưu…' : 'Lưu';
}

// ---------------- tiện ích ----------------
function el(tag, cls = '', text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function iconBtn(txt, label, fn) { const b = el('button', 'icon', txt); b.type = 'button'; b.title = label; b.setAttribute('aria-label', label); b.addEventListener('click', fn); return b; }
function parsePrice(v) { const s = String(v).replace(/[.,\s₫đ]/gi, ''); return /^\d{1,10}$/.test(s) ? Number(s) : null; }
// ô bỏ trống → null (cơ sở dữ liệu lưu là "không có")
function clean(o) { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = (typeof v === 'string' ? v.trim() : v) === '' ? null : (typeof v === 'string' ? v.trim() : v); return r; }
function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'san-pham';
}
function uniqueId(base) { let id = base, n = 2; const ids = new Set(rows.map(r => r.id)); while (ids.has(id)) id = `${base}-${n++}`; return id; }

let toastTimer = 0;
function toast(msg, isErr = false) {
  const t = $('toast'); t.textContent = msg; t.classList.toggle('err', isErr); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, isErr ? 7000 : 3500);
}

boot();

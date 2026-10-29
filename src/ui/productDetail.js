// Chi tiết sản phẩm: lớp phủ toàn màn hình, mở khi bấm vào món đồ hoặc chấm giá.
// Bên trái là ảnh lớn treo trên thanh (các món kế tiếp mờ phía sau), bên phải là thông tin.
// Dùng ← → để xem món trước / sau trong cùng khu, Esc để đóng. Trang không cuộn khi đang mở.
import { $, assetUrl as url } from '../env.js';
import { formatPrice } from '../config/products.js';
import { SETTINGS } from '../config/settings.js';

const ZONE_TITLES = { hoodie: 'Kệ áo', skate: 'Góc skate', shoes: 'Tường giày' };
const SPEC_ROWS = [['material', 'Chất liệu'], ['color', 'Màu'], ['fit', 'Form']];
const GHOSTS = 3;   // số món kế tiếp hiện mờ phía sau
const touch = matchMedia('(hover: none)').matches;

const el = id => $(id);
const root = el('detail');
const img = el('dImg');
let list = [], idx = 0, view = 0, lastFocus = null, swapTimer = 0;
const listeners = new Set();

// Báo cho phần khác (chấm giá, cảnh 3D) biết món nào đang mở
export const onDetailChange = fn => listeners.add(fn);
export const detailProduct = () => (root.hidden ? null : list[idx]?.product || null);
const emit = () => listeners.forEach(fn => fn(detailProduct()));

// items: [{ product, preview? }] theo đúng thứ tự trên kệ; product: món được bấm
export function openDetail(product, items) {
  list = items.length ? items : [{ product }];
  idx = Math.max(0, list.findIndex(it => it.product === product));
  if (root.hidden) {
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('detail-open');
    root.classList.add('opening');
    setTimeout(() => root.classList.remove('opening'), 450);
  }
  render(false);
  el('dClose').focus({ preventScroll: true });
  emit();
}

export function closeDetail() {
  if (root.hidden) return;
  root.classList.remove('opening');
  root.hidden = true;
  document.documentElement.classList.remove('detail-open');
  lastFocus?.focus?.({ preventScroll: true });
  emit();
}

function go(step) {
  const n = idx + step;
  if (n < 0 || n >= list.length) return;
  idx = n; render(true); emit();
}

function viewsOf(p) {
  if (p.images?.length) return p.images;
  return p.image ? [{ src: p.image, label: 'Mặt trước' }] : [];
}
const pad = n => String(n).padStart(2, '0');

function render(animate) {
  const { product: p, preview } = list[idx];
  view = 0;

  el('dZone').textContent = ZONE_TITLES[p.zone] || 'Cửa tiệm';
  el('dSub').textContent = list.length > 1 ? `${list.length} món · ${touch ? 'vuốt ngang ảnh' : 'dùng phím ← →'} hoặc bấm mũi tên để xem món khác` : '';
  el('dCount').textContent = `${pad(idx + 1)} / ${pad(list.length)}`;
  el('dPrev').disabled = idx === 0;
  el('dNext').disabled = idx === list.length - 1;
  el('dPrev').hidden = el('dNext').hidden = list.length < 2;

  // Thông tin
  el('dKind').textContent = [p.brand, p.kind].filter(Boolean).join(' · ');
  el('dName').textContent = p.name;
  el('dPrice').textContent = formatPrice(p.price);
  const specs = el('dSpecs'); specs.replaceChildren();
  if (p.sizes?.length) {
    const dd = row(specs, 'Size');
    p.sizes.forEach(s => { const c = document.createElement('span'); c.className = 'd-chip'; c.textContent = s; dd.append(c); });
  }
  SPEC_ROWS.forEach(([k, label]) => { if (p[k]) row(specs, label).textContent = p[k]; });
  if (!specs.children.length && p.meta) row(specs, 'Ghi chú').textContent = p.meta;
  el('dDesc').textContent = p.description || 'Chưa có mô tả cho món này.';
  el('dDesc').classList.toggle('empty', !p.description);
  const cta = el('dCta');
  cta.hidden = !SETTINGS.contactUrl;
  if (SETTINGS.contactUrl) cta.href = SETTINGS.contactUrl;

  // Ảnh các mặt
  const views = viewsOf(p), box = el('dViews'); box.replaceChildren();
  box.hidden = views.length < 2;
  views.forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'd-view'; b.setAttribute('aria-pressed', i === 0);
    const t = document.createElement('img'); t.alt = ''; t.src = url(v.src);
    const s = document.createElement('span'); s.textContent = v.label || 'Mặt ' + (i + 1);
    b.append(t, s);
    b.addEventListener('click', () => showView(i));
    box.append(b);
  });

  // Ảnh lớn (hoặc hình thay thế nếu món chưa có ảnh)
  const main = el('dMain'), fb = el('dFallback');
  if (animate) {
    for (const n of [main, el('dInfo')]) { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); }
    // gỡ hiệu ứng sau khi chạy xong; nếu máy bận không kịp chạy thì nội dung vẫn hiện đầy đủ
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => { main.classList.remove('swap'); el('dInfo').classList.remove('swap'); }, 600);
  }
  if (views.length) {
    img.hidden = false; fb.hidden = true;
    img.src = url(views[0].src); img.alt = p.name;
  } else {
    img.hidden = true; fb.hidden = false;
    fallback(fb, p, preview);
  }

  // Các món kế tiếp treo mờ phía sau
  const ghosts = el('dGhosts'); ghosts.replaceChildren();
  list.slice(idx + 1, idx + 1 + GHOSTS).forEach((it, i) => {
    const src = viewsOf(it.product)[0]?.src;
    if (!src) return;
    const g = document.createElement('img');
    g.src = url(src); g.alt = ''; g.style.setProperty('--i', i);
    ghosts.append(g);
  });
  // tải sẵn ảnh món trước / sau cho lúc bấm chuyển
  [list[idx - 1], list[idx + 1]].forEach(it => { const s = it && viewsOf(it.product)[0]?.src; if (s) new Image().src = url(s); });
}

function showView(i) {
  const views = viewsOf(list[idx].product);
  if (!views[i]) return;
  view = i; img.src = url(views[i].src);
  [...el('dViews').children].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
}

function row(dl, label) {
  const dt = document.createElement('dt'), dd = document.createElement('dd');
  dt.textContent = label; dl.append(dt, dd); return dd;
}

// Món chưa có ảnh: mặt ván dùng chính hình in trong cảnh 3D; giày vẽ mẫu màu
function fallback(box, p, preview) {
  box.replaceChildren(); box.className = 'd-fallback';
  if (preview) {
    const c = document.createElement('canvas'); c.width = preview.width; c.height = preview.height;
    c.getContext('2d').drawImage(preview, 0, 0);
    box.classList.add('deck'); box.append(c);
  } else if (p.look) {
    box.classList.add('swatch');
    box.style.setProperty('--upper', p.look.upper); box.style.setProperty('--sole', p.look.sole); box.style.setProperty('--accent', p.look.accent);
    box.innerHTML = '<i class="u"></i><i class="a"></i><i class="s"></i>';
  }
}

// ----- điều khiển -----
el('dClose').addEventListener('click', closeDetail);
el('dBack').addEventListener('click', closeDetail);
el('dPrev').addEventListener('click', () => go(-1));
el('dNext').addEventListener('click', () => go(1));
addEventListener('keydown', e => {
  if (root.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeDetail(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  else if (e.key === 'Tab') trapFocus(e);
});
// vuốt ngang trên điện thoại để chuyển món
let sx = null, sy = 0;
el('dMain').addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
el('dMain').addEventListener('touchend', e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
});

function trapFocus(e) {
  const f = [...root.querySelectorAll('button:not([disabled]):not([hidden]), a[href]:not([hidden])')].filter(n => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

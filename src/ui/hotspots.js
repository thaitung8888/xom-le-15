// Chấm giá + chọn sản phẩm bằng chuột.
// - Mỗi điểm 3D được chiếu ra màn hình, chỉ hiện khi camera đang dừng ở đúng trạm.
// - Bấm thẳng vào món đồ trong cảnh 3D (không cần trúng chấm) cũng mở chi tiết.
// - Rê chuột lên món đồ thì món đó được đánh dấu hover (cảnh 3D tự làm hiệu ứng nhích ra).
import * as THREE from 'three';
import { formatPrice } from '../config/products.js';
import { openDetail, onDetailChange, detailProduct } from './productDetail.js';

const NEAR = 0.12;   // camera cách trạm bao nhiêu thì coi là đang dừng ở trạm

export function createHotspots(list, camera) {
  const v = new THREE.Vector3();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let cur = 0, pointer = null, hovered = null;

  // Món đồ trong cảnh 3D → chấm giá tương ứng
  const owner = new Map();
  list.forEach(hs => {
    hs.object?.traverse(o => owner.set(o, hs));
    if (hs.object?.userData.pick) owner.set(hs.object.userData.pick, hs);
  });

  const open = hs => openDetail(hs.product, list.filter(h => h.stop === hs.stop).map(h => ({ product: h.product, preview: h.preview })));

  const els = list.map(hs => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs'; b.tabIndex = -1;
    b.setAttribute('aria-label', `${hs.product.name}, ${formatPrice(hs.product.price)}. Xem chi tiết`);
    b.addEventListener('click', e => { e.stopPropagation(); open(hs); });
    b.addEventListener('pointerenter', () => setHover(hs));
    b.addEventListener('pointerleave', () => setHover(null));
    document.body.appendChild(b);
    return b;
  });

  function setHover(hs) {
    if (hovered === hs) return;
    if (hovered) { hovered.hover = false; els[list.indexOf(hovered)].classList.remove('hot'); }
    hovered = hs;
    if (hs) { hs.hover = true; els[list.indexOf(hs)].classList.add('hot'); }
    document.body.classList.toggle('pick', !!hs);
  }

  // Tìm món đồ dưới con trỏ. Áo 2.5D là tấm phẳng có phần trong suốt quanh viền:
  // bỏ qua chỗ trong suốt để bấm xuyên tới áo phía sau.
  function pick(x, y) {
    const objs = list.filter(hs => hs.object && Math.abs(cur - hs.stop) < NEAR).map(hs => hs.object.userData.pick || hs.object);
    if (!objs.length) return null;
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const hit of ray.intersectObjects(objs, true)) {
      let o = hit.object; while (o && !owner.has(o)) o = o.parent;
      const hs = owner.get(o);
      if (!hs) continue;
      const alphaAt = hs.object.userData.alphaAt;
      if (alphaAt && hit.uv && !alphaAt(hit.uv.x, 1 - hit.uv.y)) continue;
      return hs;
    }
    return null;
  }

  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY, target: e.target }; });
  addEventListener('pointerleave', () => { pointer = null; });
  addEventListener('click', e => {
    if (detailProduct() || e.target.closest('button, a, .rail, .detail')) return;
    const hs = pick(e.clientX, e.clientY);
    if (hs) open(hs);
  });
  // Khi đang xem chi tiết thì ẩn chấm giá và bỏ hover
  onDetailChange(p => { document.body.classList.toggle('viewing', !!p); if (p) setHover(null); });

  function update(c, cam) {
    cur = c;
    list.forEach((hs, i) => {
      const el = els[i];
      if (Math.abs(cur - hs.stop) < NEAR) {
        v.copy(hs.pos).project(cam);
        const vis = v.z < 1 && Math.abs(v.x) < 0.96 && Math.abs(v.y) < 0.92;
        if (vis) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
        el.classList.toggle('on', vis); el.tabIndex = vis ? 0 : -1;
      } else if (el.classList.contains('on')) {
        el.classList.remove('on'); el.tabIndex = -1;
      }
    });
    // hover theo con trỏ chuột (bỏ qua khi con trỏ đang nằm trên chấm giá hoặc nút)
    if (!detailProduct() && pointer && !pointer.target?.closest?.('.hs, button, a, .rail')) setHover(pick(pointer.x, pointer.y));
    else if (!pointer && hovered && !els[list.indexOf(hovered)].matches(':hover')) setHover(null);
  }

  return { update };
}

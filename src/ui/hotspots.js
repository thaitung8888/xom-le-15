// Chấm giá: mỗi điểm 3D được chiếu ra màn hình, chỉ hiện khi camera đang dừng ở đúng trạm.
import * as THREE from 'three';
import { formatPrice } from '../config/products.js';
import { openCard, closeCard, openProduct } from './productCard.js';

export function createHotspots(list) {
  const v = new THREE.Vector3();
  const els = list.map(hs => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs'; b.tabIndex = -1;
    b.setAttribute('aria-label', `${hs.product.name}, ${formatPrice(hs.product.price)}`);
    b.addEventListener('click', e => {
      e.stopPropagation();
      const r = b.getBoundingClientRect();
      openCard(hs.product, r.left + r.width / 2, r.top + r.height / 2);
    });
    document.body.appendChild(b);
    return b;
  });

  function update(cur, camera) {
    list.forEach((hs, i) => {
      const el = els[i];
      if (Math.abs(cur - hs.stop) < 0.12) {
        v.copy(hs.pos).project(camera);
        const vis = v.z < 1 && Math.abs(v.x) < 0.96 && Math.abs(v.y) < 0.92;
        if (vis) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
        el.classList.toggle('on', vis); el.tabIndex = vis ? 0 : -1;
      } else if (el.classList.contains('on')) {
        el.classList.remove('on'); el.tabIndex = -1;
      }
    });
    // Đóng thẻ khi camera rời khỏi trạm của sản phẩm đang mở
    const open = openProduct();
    if (open) {
      const hs = list.find(h => h.product === open);
      if (hs && Math.abs(cur - hs.stop) > 0.15) closeCard();
    }
  }

  return { update };
}

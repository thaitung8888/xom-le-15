// Màn hình tải: logo, thanh tiến độ, phần trăm.
import { $ } from '../env.js';
import { BR } from '../config/brand.js';
import { drawBadge } from '../brand/logo.js';

export function setLoad(v) {
  v = Math.max(0, Math.min(1, v));
  $('loadbar').style.transform = `scaleX(${v})`;
  $('loadpct').textContent = Math.round(v * 100) + '%';
}

export function finishLoad() {
  setLoad(1);
  setTimeout(() => $('loader').classList.add('done'), 300);
}

export function paintLoaderBadge() {
  const c = $('loaderBadge'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  drawBadge(g, c.width / 2, 2, c.width - 4, { p: BR.ink });
}

// Chờ phông chữ tải xong (tối đa 2.5 giây) trước khi vẽ chữ lên texture
export function fontsReady(list) {
  if (!document.fonts) return Promise.resolve();
  return Promise.race([
    Promise.all(list.map(f => document.fonts.load(f))),
    new Promise(r => setTimeout(r, 2500))
  ]);
}

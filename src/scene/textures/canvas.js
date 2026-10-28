// Vẽ texture bằng canvas 2D và các nét "bẩn" (vết loang, vệt chảy) dùng chung.
import { T, maxAniso } from '../core.js';
import { R, rr } from '../random.js';

export function canvasTex(w, h, draw, opt = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new T.CanvasTexture(c);
  if (!opt.linear) t.encoding = T.sRGBEncoding;
  t.anisotropy = maxAniso;
  if (opt.repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(opt.repeat[0], opt.repeat[1]); }
  return t;
}
export function grime(g, w, h, n, light = 0.05, dark = 0.08, maxR = 0.03) {
  for (let i = 0; i < n; i++) {
    const r = R() * R() * w * maxR + 0.6;
    g.fillStyle = R() < 0.5 ? `rgba(255,255,255,${R() * light})` : `rgba(0,0,0,${R() * dark})`;
    g.beginPath(); g.arc(R() * w, R() * h, r, 0, 7); g.fill();
  }
}
export function streaks(g, w, h, n, alpha = 0.12) {
  for (let i = 0; i < n; i++) {
    const x = R() * w, y = R() * h * 0.6, len = rr(h * 0.1, h * 0.5);
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, `rgba(30,24,15,${alpha})`); gr.addColorStop(1, 'rgba(30,24,15,0)');
    g.fillStyle = gr; g.fillRect(x, y, rr(2, 10), len);
  }
}
export function radialTex(inner, outer = 'rgba(0,0,0,0)') {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

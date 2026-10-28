// Logo chính 15 Xóm Lẻ (khung vòm + cổng xóm). Hàm vẽ thuần canvas 2D, dùng cho màn tải, texture và poster.
import { BR } from '../config/brand.js';

export function drawBadge(g, cx, top, W, c = {}) {
  const P = c.p || BR.purple, Y = c.y || BR.yellow, I = c.i || BR.ivory;
  const H = W * 1.3, r = W / 2;
  const arch = inset => { const q = r - inset; g.beginPath(); g.moveTo(cx - q, top + H - inset); g.lineTo(cx - q, top + r); g.arc(cx, top + r, q, Math.PI, 0); g.lineTo(cx + q, top + H - inset); g.closePath(); };
  g.save();
  arch(0); g.fillStyle = P; g.fill();
  arch(W * 0.05); g.lineWidth = W * 0.018; g.strokeStyle = Y; g.stroke();
  const gy = top + W * 0.25, gw = W * 0.56, pw = W * 0.075, ph = W * 0.42;
  g.fillStyle = Y;
  g.beginPath();
  g.moveTo(cx - gw / 2 - W * 0.07, gy + W * 0.075);
  g.quadraticCurveTo(cx - gw / 4, gy + W * 0.045, cx - W * 0.1, gy - W * 0.035);
  g.lineTo(cx + W * 0.1, gy - W * 0.035);
  g.quadraticCurveTo(cx + gw / 4, gy + W * 0.045, cx + gw / 2 + W * 0.07, gy + W * 0.075);
  g.lineTo(cx + gw / 2, gy + W * 0.1); g.lineTo(cx - gw / 2, gy + W * 0.1); g.closePath(); g.fill();
  g.fillRect(cx - gw / 2, gy + W * 0.12, gw, W * 0.045);
  g.fillRect(cx - gw / 2 + W * 0.02, gy + W * 0.12, pw, ph);
  g.fillRect(cx + gw / 2 - W * 0.02 - pw, gy + W * 0.12, pw, ph);
  g.fillRect(cx - gw / 2 - W * 0.03, gy + W * 0.12 + ph, gw + W * 0.06, W * 0.03);
  g.fillStyle = I; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `900 ${W * 0.25}px Montserrat, "Be Vietnam Pro", sans-serif`;
  g.fillText('15', cx, gy + W * 0.12 + ph - W * 0.08);
  g.font = `900 ${W * 0.16}px Montserrat, "Be Vietnam Pro", sans-serif`;
  g.fillText('XÓM LẺ', cx, top + H * 0.855);
  g.fillStyle = Y; g.font = `700 ${W * 0.048}px Montserrat, "Be Vietnam Pro", sans-serif`;
  g.fillText('H À   N Ộ I   ·   2 0 2 6', cx, top + H * 0.935);
  g.restore();
}

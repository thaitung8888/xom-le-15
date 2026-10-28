// Hình in trên mặt ván skate (8 mẫu, chọn theo số thứ tự).
import { BR } from '../../config/brand.js';
import { canvasTex } from './canvas.js';

export function deckTex(k) {
  return canvasTex(256, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.save();
    const r = w / 2 - 6;
    const outline = () => { g.beginPath(); g.moveTo(6, r + 6); g.arc(w / 2, r + 6, r, Math.PI, 0); g.lineTo(w - 6, h - r - 6); g.arc(w / 2, h - r - 6, r, 0, Math.PI); g.closePath(); };
    outline(); g.fillStyle = BR.ivory; g.fill(); g.clip();
    const P = [BR.purple, BR.yellow, BR.ivory, BR.ink, BR.lilac, '#e8e2ff', '#ffe27a', '#2a2533'];
    const pal = [P[k % 8], P[(k + 1) % 8], P[(k + 3) % 8]];
    g.fillStyle = pal[0]; g.fillRect(0, 0, w, h);
    if (k === 0) { g.fillStyle = pal[1]; for (let y = -w; y < h; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w); g.lineTo(w, y + w + 34); g.lineTo(0, y + 34); g.fill(); } }
    if (k === 1) { g.fillStyle = BR.purple; g.font = '900 250px Montserrat'; g.textAlign = 'center'; g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); g.fillText('15', 0, 88); g.restore(); }
    if (k === 2) { g.fillStyle = pal[1]; for (let y = 0; y < h; y += 48) for (let x = (y / 48 % 2) * 48; x < w; x += 96) g.fillRect(x, y, 48, 48); }
    if (k === 3) { g.fillStyle = BR.purple; g.fillRect(0, h * 0.55, w, h); g.fillStyle = BR.yellow; g.beginPath(); g.arc(w / 2, h * 0.55, 100, Math.PI, 0); g.fill(); for (let i = 0; i < 6; i++) g.fillRect(0, h * 0.6 + i * 40, w, 10); }
    if (k === 4) { g.fillStyle = '#c8742f'; g.beginPath(); g.arc(w / 2, h / 2, 90, 0, 7); g.fill(); g.beginPath(); g.moveTo(w / 2 - 85, h / 2 - 30); g.lineTo(w / 2 - 70, h / 2 - 140); g.lineTo(w / 2 - 20, h / 2 - 80); g.fill(); g.beginPath(); g.moveTo(w / 2 + 85, h / 2 - 30); g.lineTo(w / 2 + 70, h / 2 - 140); g.lineTo(w / 2 + 20, h / 2 - 80); g.fill(); g.fillStyle = BR.ink; g.fillRect(w / 2 - 45, h / 2 - 10, 22, 10); g.fillRect(w / 2 + 23, h / 2 - 10, 22, 10); }
    if (k === 5) { g.fillStyle = BR.yellow; g.font = '900 170px Montserrat'; g.textAlign = 'center'; ['X', 'Ó', 'M'].forEach((ch, i) => g.fillText(ch, w / 2, 330 + i * 220)); }
    if (k === 6) { g.fillStyle = '#e88aa0'; for (let i = 0; i < 8; i++) { g.save(); g.translate(w / 2, h / 2); g.rotate(i * Math.PI / 4); g.beginPath(); g.ellipse(0, -70, 34, 80, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = BR.yellow; g.beginPath(); g.arc(w / 2, h / 2, 30, 0, 7); g.fill(); }
    if (k === 7) { g.fillStyle = pal[1]; for (let y = 20; y < h; y += 36) for (let x = 18 + (y % 72 ? 18 : 0); x < w; x += 36) { g.beginPath(); g.arc(x, y, 6 + 8 * (y / h), 0, 7); g.fill(); } }
    g.fillStyle = 'rgba(0,0,0,.6)'; for (const y of [150, 205, h - 205, h - 150]) for (const x of [w / 2 - 28, w / 2 + 28]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    g.restore();
    g.lineWidth = 8; g.strokeStyle = '#2a2018'; outline(); g.stroke();
  });
}

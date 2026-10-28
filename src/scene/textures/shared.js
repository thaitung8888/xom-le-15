// Texture dùng ở nhiều khu: sàn ngõ, bê tông, terrazzo, mặt tiền, logo.
import { drawBadge } from '../../brand/logo.js';
import { TX } from '../core.js';
import { R, rr, pick } from '../random.js';
import { canvasTex, grime, streaks } from './canvas.js';

export function buildSharedTextures() {
  TX.alleyFloor = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = '#23232a'; g.fillRect(0, 0, w, h);
    grime(g, w, h, 2600, 0.04, 0.1, 0.02);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y + rr(-2, 2)); g.lineTo(w, y + rr(-2, 2)); g.stroke(); }
  }, { repeat: [1, 6] });
  TX.alleyRough = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = '#c4c4c4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) {
      const x = rr(0.2, 0.8) * w, y = R() * h, rx = rr(20, 90), ry = rx * rr(0.4, 1.4);
      const gr = g.createRadialGradient(x, y, 0, x, y, rx);
      gr.addColorStop(0, '#5a5a5a'); gr.addColorStop(0.6, '#7a7a7a'); gr.addColorStop(1, 'rgba(196,196,196,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, R() * 3, 0, 7); g.fill();
    }
  }, { repeat: [1, 6], linear: true });

  // bê tông đổ cốp pha gỗ, có lỗ ty (1 lần lặp = 2.4 m x 1.2 m)
  TX.concrete = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#8c8984'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '0,0,0'},${R() * 0.05})`; g.fillRect(0, y, w, 32); }
    grime(g, w, h, 1800, 0.05, 0.07, 0.02);
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2;
    g.strokeRect(1, 1, w - 2, h - 2);
    g.fillStyle = 'rgba(30,30,30,.5)';
    for (const fx of [0.25, 0.75]) for (const fy of [0.25, 0.75]) { g.beginPath(); g.arc(fx * w, fy * h, 9, 0, 7); g.fill(); }
    streaks(g, w, h, 6, 0.05);
  }, { repeat: [1, 1] });

  // terrazzo sàn: nền ngà, hạt đá tím, vàng, xám
  TX.floor = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#b9b2a6'; g.fillRect(0, 0, w, h);
    const chips = ['#4b3fae', '#ffc700', '#6d6a72', '#e9e2d4', '#2a2533', '#8f86c9'];
    for (let i = 0; i < 5200; i++) {
      g.fillStyle = pick(chips); g.globalAlpha = rr(0.6, 1);
      g.beginPath(); const x = R() * w, y = R() * h, r = R() * R() * 9 + 1.2;
      g.moveTo(x + r, y); for (let k = 1; k < 6; k++) { const a = k / 6 * 6.283, rq = r * rr(0.6, 1.2); g.lineTo(x + Math.cos(a) * rq, y + Math.sin(a) * rq); } g.fill();
    }
    g.globalAlpha = 1;
    grime(g, w, h, 900, 0.05, 0.05, 0.02);
    g.strokeStyle = 'rgba(40,36,48,.55)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  }, { repeat: [4, 10] });

  TX.facade = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#27243a'; g.fillRect(0, 0, w, h); grime(g, w, h, 1400, 0.04, 0.12, 0.02); streaks(g, w, h, 10, 0.25);
  }, { repeat: [3, 3] });

  TX.badge = canvasTex(512, 666, (g, w, h) => { g.clearRect(0, 0, w, h); drawBadge(g, w / 2, 0, w); });
}

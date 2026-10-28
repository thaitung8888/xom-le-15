// Tường ngõ: vữa vàng, cửa chớp xanh, cửa sổ sáng đèn, quảng cáo phun sơn.
import { T } from '../core.js';
import { R, rr } from '../random.js';
import { canvasTex, grime, streaks } from './canvas.js';

/* ===== alley walls (vàng ochre, cửa chớp xanh, quảng cáo phun sơn) ===== */
export function alleyWall(seed, len, ht) {
  const PX = 72, W = Math.round(len * PX), H = Math.round(ht * PX);
  const lit = [];
  const color = canvasTex(W, H, (g) => {
    const base = ['#c49a45', '#b88d3d', '#c8a457'][seed % 3];
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(${R() < .5 ? '255,236,190' : '120,90,40'},${rr(.05, .18)})`; g.fillRect(R() * W, R() * H, rr(60, 380), rr(40, 260)); }
    grime(g, W, H, 4500, 0.06, 0.12, 0.012);
    streaks(g, W, H, 60, 0.18);
    const band = 1.1 * PX;
    const gr = g.createLinearGradient(0, H - band, 0, H);
    gr.addColorStop(0, 'rgba(40,52,40,.35)'); gr.addColorStop(1, 'rgba(25,30,25,.9)');
    g.fillStyle = gr; g.fillRect(0, H - band, W, band);
    for (let x = rr(1.2, 2.5); x < len - 1.5; x += rr(3.2, 4.4)) {
      for (const row of [3.6, 6.6]) {
        if (row > ht - 1.2) continue;
        const wx = x * PX, wy = (ht - row - 0.75) * PX, ww = 1.1 * PX, wh = 1.5 * PX;
        g.fillStyle = '#5a4a32'; g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
        if (R() < 0.45) { g.fillStyle = '#3a2a18'; g.fillRect(wx, wy, ww, wh); lit.push([wx, wy, ww, wh]); }
        else {
          g.fillStyle = '#2f5a4b'; g.fillRect(wx, wy, ww, wh);
          g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2;
          for (let ly = wy + 6; ly < wy + wh; ly += 7) { g.beginPath(); g.moveTo(wx + 3, ly); g.lineTo(wx + ww / 2 - 2, ly); g.moveTo(wx + ww / 2 + 2, ly); g.lineTo(wx + ww - 3, ly); g.stroke(); }
          g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(wx + ww / 2 - 1, wy, 2, wh);
        }
      }
      if (R() < 0.55) {
        const dx = (x + rr(-0.3, 0.6)) * PX, dw = 1.0 * PX, dh = 2.1 * PX;
        g.fillStyle = R() < .5 ? '#3d4a55' : '#4b3626'; g.fillRect(dx, H - dh, dw, dh);
        g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; g.strokeRect(dx + 6, H - dh + 6, dw - 12, dh - 12);
        if (R() < 0.5) { g.fillStyle = '#1e4f9c'; g.fillRect(dx + dw + 8, H - 2.3 * PX, 24, 16); g.fillStyle = '#fff'; g.font = '700 11px "Be Vietnam Pro",sans-serif'; g.fillText(String(Math.floor(rr(3, 40))), dx + dw + 12, H - 2.3 * PX + 12); }
      }
    }
    g.fillStyle = 'rgba(25,25,25,.78)';
    for (let i = 0; i < 7; i++) {
      g.save(); g.translate(R() * W, H - rr(1.3, 2.6) * PX); g.rotate(rr(-0.04, 0.04));
      g.font = '700 15px "Be Vietnam Pro",sans-serif';
      g.fillText(['KHOAN CẮT BÊ TÔNG', 'THÔNG CỐNG', 'SỬA ĐIỆN NƯỚC', 'HÚT BỂ PHỐT'][i % 4], 0, 0);
      g.font = '700 17px "IBM Plex Mono",monospace'; g.fillText('0000.15.15.15', 0, 20);
      g.restore();
    }
  });
  const emissive = canvasTex(W, H, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (const [x, y, w, h] of lit) {
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, '#ffcf86'); gr.addColorStop(1, '#c97a2c');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.45, w, 3);
    }
  });
  return new T.MeshStandardMaterial({ color: '#a4977f', map: color, emissiveMap: emissive, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.92 });
}

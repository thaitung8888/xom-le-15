// Bức graffiti "XÓM LẺ": chữ ký, sticker, logo phun sơn, chữ wildstyle.
import { drawBadge } from '../../brand/logo.js';
import { BR } from '../../config/brand.js';
import { R, rr, pick } from '../random.js';
import { canvasTex, grime, streaks } from './canvas.js';

export function muralTex() {
  return canvasTex(2048, 922, (g, w, h) => {
    // bê tông cũ, loang lổ
    g.fillStyle = '#8e8a85'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '40,36,32'},${rr(.04, .12)})`; g.fillRect(R() * w, R() * h, rr(120, 520), rr(80, 360)); }
    grime(g, w, h, 3200, 0.06, 0.12, 0.01);
    streaks(g, w, h, 120, 0.22);
    g.strokeStyle = 'rgba(25,22,20,.55)'; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { let x = R() * w, y = R() * h * 0.4; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 14; k++) { x += rr(-30, 30); y += rr(10, 40); g.lineTo(x, y); } g.stroke(); }
    const C = [BR.purple, BR.ink, BR.yellow, BR.ivory, '#5b4ae0', '#141018'];
    // lớp 1: chữ ký (tags) chồng chéo
    const words = ['15', 'XL', 'xóm', 'lẻ', 'HN', 'ngõ', '2026', 'XÓM', '15XL', 'đi chậm', 'phố', 'X.L', 'hẻm', '15!'];
    for (let i = 0; i < 95; i++) {
      g.save(); g.translate(R() * w, rr(40, h - 20)); g.rotate(rr(-0.4, 0.25)); g.transform(1, 0, rr(-0.5, -0.1), 1, 0, 0);
      const size = rr(24, 74), col = pick(C);
      g.font = `italic ${R() < .5 ? 900 : 800} ${size}px Montserrat, sans-serif`;
      const t = pick(words);
      if (R() < 0.35) { g.lineWidth = Math.max(2, size * 0.07); g.strokeStyle = col; g.strokeText(t, 0, 0); }
      else { if (R() < 0.4) { g.lineWidth = size * 0.16; g.strokeStyle = col === BR.ivory ? BR.ink : BR.ivory; g.lineJoin = 'round'; g.strokeText(t, 0, 0); } g.fillStyle = col; g.fillText(t, 0, 0); }
      if (R() < 0.5) { const tw = g.measureText(t).width; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, 8); g.quadraticCurveTo(tw / 2, 22 + R() * 14, tw + 18, rr(-10, 6)); g.stroke(); }
      g.restore();
    }
    // nét ký tự do (handstyle)
    for (let i = 0; i < 55; i++) {
      g.strokeStyle = pick(C); g.lineWidth = rr(2.5, 5); g.lineCap = 'round';
      let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { const nx = x + rr(10, 34), ny = y + rr(-26, 26); g.bezierCurveTo(x + rr(-14, 24), y - rr(10, 40), nx + rr(-14, 14), ny + rr(-30, 30), nx, ny); x = nx; y = ny; }
      g.stroke();
    }
    // sticker logo dán lung tung
    for (let i = 0; i < 16; i++) {
      g.save(); const sx = R() * w, sy = rr(60, h - 60); g.translate(sx, sy); g.rotate(rr(-0.4, 0.4));
      const s = rr(46, 78);
      if (R() < 0.55) { g.fillStyle = BR.ivory; g.fillRect(-s * 0.6, -s * 0.72, s * 1.2, s * 1.48); drawBadge(g, 0, -s * 0.62, s); }
      else { g.fillStyle = R() < .5 ? BR.yellow : BR.ivory; g.fillRect(-s * 0.9, -s * 0.35, s * 1.8, s * 0.7); g.fillStyle = BR.ink; g.font = `900 ${s * 0.36}px Montserrat, sans-serif`; g.textAlign = 'center'; g.fillText('15 XÓM LẺ', 0, s * 0.13); }
      if (R() < 0.4) { g.fillStyle = '#8e8a85'; g.beginPath(); g.moveTo(s * 0.2, s * 0.8); g.lineTo(s, s * 0.1); g.lineTo(s, s * 0.8); g.fill(); }
      g.restore();
    }
    // logo lớn phun sơn, bên phải
    g.save(); g.globalAlpha = 0.96; drawBadge(g, w * 0.83, h * 0.16, 360); g.restore();
    // drips cho logo
    for (let i = 0; i < 9; i++) { const x = w * 0.83 + rr(-160, 160), y0 = h * 0.16 + 468 - 20, l = rr(30, 120); g.fillStyle = BR.purple; g.fillRect(x, y0, 7, l); g.beginPath(); g.arc(x + 3.5, y0 + l, 6, 0, 7); g.fill(); }
    // mảng chính: XÓM LẺ kiểu wildstyle
    const off = document.createElement('canvas'); off.width = w; off.height = h; const o = off.getContext('2d');
    const size = 300, letters = [...'XÓM LẺ'];
    g.font = o.font = `italic 900 ${size}px Montserrat, sans-serif`;
    const widths = letters.map(ch => ch === ' ' ? size * 0.22 : g.measureText(ch).width * 0.86);
    let x = w * 0.43 - widths.reduce((a, b) => a + b, 0) / 2;
    const base = h * 0.6, placed = [];
    letters.forEach((ch, i) => {
      if (ch !== ' ') placed.push({ ch, x: x + widths[i] / 2, y: base + rr(-26, 26), rot: rr(-0.13, 0.13), sk: rr(-0.18, 0.05) });
      x += widths[i];
    });
    const at = (ctx, p, fn) => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.transform(1, 0, p.sk, 1, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; fn(ctx); ctx.restore(); };
    placed.forEach(p => at(g, p, c => { c.font = `italic 900 ${size}px Montserrat, sans-serif`; for (let k = 20; k > 0; k--) { c.fillStyle = '#120f22'; c.fillText(p.ch, k * 1.5, k * 1.3); } }));
    placed.forEach(p => at(g, p, c => { c.font = `italic 900 ${size}px Montserrat, sans-serif`; c.lineWidth = 40; c.strokeStyle = BR.ivory; c.strokeText(p.ch, 0, 0); }));
    placed.forEach(p => at(g, p, c => { c.font = `italic 900 ${size}px Montserrat, sans-serif`; c.lineWidth = 20; c.strokeStyle = '#120f22'; c.strokeText(p.ch, 0, 0); }));
    // mũi tên trang trí
    [[placed[0], -1], [placed[placed.length - 1], 1]].forEach(([p, s]) => {
      const ax = p.x + s * 140, ay = p.y - 210;
      g.lineCap = 'round';
      for (const [lw, col] of [[34, BR.ivory], [24, '#120f22'], [14, BR.yellow]]) {
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(p.x + s * 40, p.y - 120); g.quadraticCurveTo(ax, ay + 40, ax + s * 60, ay - 20); g.stroke();
      }
      g.fillStyle = BR.yellow; g.strokeStyle = '#120f22'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(ax + s * 100, ay - 45); g.lineTo(ax + s * 30, ay - 60); g.lineTo(ax + s * 60, ay + 10); g.closePath(); g.stroke(); g.fill();
    });
    placed.forEach(p => at(o, p, c => {
      c.font = `italic 900 ${size}px Montserrat, sans-serif`;
      const gr = c.createLinearGradient(0, -size * 0.75, 0, 0); gr.addColorStop(0, '#7a68ff'); gr.addColorStop(0.55, BR.purple); gr.addColorStop(1, '#241a7a');
      c.fillStyle = gr; c.fillText(p.ch, 0, 0);
    }));
    o.globalCompositeOperation = 'source-atop';
    o.fillStyle = BR.yellow; o.globalAlpha = 0.95;
    for (let i = 0; i < 9; i++) { const yy = base - 70 + i * 4; o.fillRect(0, yy + Math.sin(i) * 4, w, 2.5); }
    o.globalAlpha = 1; o.fillStyle = BR.yellow; o.beginPath(); o.moveTo(0, base - 30); for (let xx = 0; xx <= w; xx += 40) o.lineTo(xx, base - 30 + Math.sin(xx * 0.02) * 12); o.lineTo(w, h); o.lineTo(0, h); o.fill();
    o.strokeStyle = 'rgba(255,255,255,.85)'; o.lineWidth = 9; o.lineCap = 'round';
    placed.forEach(p => { o.beginPath(); o.moveTo(p.x - 50, p.y - size * 0.55); o.lineTo(p.x - 20, p.y - size * 0.62); o.stroke(); });
    g.drawImage(off, 0, 0);
    // drips từ chân chữ
    placed.forEach(p => { for (let k = 0; k < 4; k++) { const dx = p.x + rr(-70, 70), dy = p.y + rr(-4, 10), l = rr(30, 170); g.fillStyle = R() < .6 ? BR.yellow : BR.purple; g.fillRect(dx, dy, 9, l); g.beginPath(); g.arc(dx + 4.5, dy + l, 8, 0, 7); g.fill(); } });
    // tia sáng ✦
    g.fillStyle = BR.ivory;
    for (let i = 0; i < 8; i++) { const sx = w * 0.15 + R() * w * 0.6, sy = h * 0.18 + R() * h * 0.5, s = rr(14, 30); g.beginPath(); g.moveTo(sx, sy - s); g.quadraticCurveTo(sx, sy, sx + s, sy); g.quadraticCurveTo(sx, sy, sx, sy + s); g.quadraticCurveTo(sx, sy, sx - s, sy); g.quadraticCurveTo(sx, sy, sx, sy - s); g.fill(); }
    // số 15 kiểu bong bóng, góc trái dưới
    g.save(); g.translate(w * 0.1, h * 0.93); g.rotate(-0.08);
    g.font = '900 250px Montserrat, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round';
    g.lineWidth = 46; g.strokeStyle = '#120f22'; g.strokeText('15', 0, 0);
    g.lineWidth = 30; g.strokeStyle = BR.purple; g.strokeText('15', 0, 0);
    g.fillStyle = BR.yellow; g.fillText('15', 0, 0);
    g.restore();
    // bụi sơn
    for (let i = 0; i < 3200; i++) { g.fillStyle = pick([BR.purple, BR.yellow, BR.ivory]); g.globalAlpha = 0.22; g.fillRect(R() * w, R() * h, 2, 2); }
    g.globalAlpha = 1;
    // mép tường bẩn ở chân
    const gb = g.createLinearGradient(0, h * 0.85, 0, h); gb.addColorStop(0, 'rgba(20,18,16,0)'); gb.addColorStop(1, 'rgba(20,18,16,.55)'); g.fillStyle = gb; g.fillRect(0, h * 0.85, w, h * 0.15);
  });
}

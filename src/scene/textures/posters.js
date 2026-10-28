// Poster thể thao của tiệm (đồ hoạ vẽ bằng code, không dùng ảnh).
import { BR } from '../../config/brand.js';
import { T } from '../core.js';
import { canvasTex } from './canvas.js';

export function sportPoster(kind) {
  return canvasTex(560, 800, (g, w, h) => {
    const P = {
      run:   { bg: BR.ink,    fg: BR.ivory, ac: BR.yellow, t1: 'CHẠY ĐÊM', t2: 'QUANH HỒ · 5 KM', t3: 'THỨ BA · 21:00' },
      ball:  { bg: BR.purple, fg: BR.ivory, ac: BR.yellow, t1: 'BÓNG RỔ', t2: 'SÂN XÓM · 3×3', t3: 'CHỦ NHẬT · 16:00' },
      cau:   { bg: BR.yellow, fg: BR.ink,   ac: BR.purple, t1: 'ĐÁ CẦU', t2: 'GIỮ CẦU KHÔNG RƠI', t3: 'SÁNG SỚM · VỈA HÈ' },
      skate: { bg: BR.ivory,  fg: BR.ink,   ac: BR.purple, t1: 'TRƯỢT VÁN', t2: 'CÔNG VIÊN · SÁNG SỚM', t3: 'MANG VÁN RA ĐÂY' }
    }[kind];
    g.fillStyle = P.bg; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.4;
    g.strokeStyle = P.ac; g.fillStyle = P.ac; g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'run') {
      g.lineWidth = 10; g.setLineDash([22, 16]); g.beginPath();
      for (let i = 0; i <= 60; i++) { const a = i / 60 * 6.283, r = 150 + 30 * Math.sin(a * 3) + 18 * Math.cos(a * 5); const x = cx + Math.cos(a) * r * 0.8, y = cy + Math.sin(a) * r * 1.15; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(cx + 0.8 * 168, cy, 16, 0, 7); g.fill();
      g.fillStyle = P.fg; g.font = '700 26px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillText('XUẤT PHÁT', cx + 0.8 * 168, cy - 30);
    }
    if (kind === 'ball') {
      g.lineWidth = 6; g.strokeStyle = 'rgba(247,241,230,.35)';
      g.strokeRect(60, cy - 210, w - 120, 420); g.beginPath(); g.arc(cx, cy + 210, 120, Math.PI, 0); g.stroke();
      g.fillStyle = '#f28c28'; g.beginPath(); g.arc(cx, cy, 130, 0, 7); g.fill();
      g.strokeStyle = BR.ink; g.lineWidth = 7;
      g.beginPath(); g.arc(cx, cy, 130, 0, 7); g.moveTo(cx - 130, cy); g.lineTo(cx + 130, cy); g.moveTo(cx, cy - 130); g.lineTo(cx, cy + 130); g.stroke();
      g.beginPath(); g.arc(cx - 190, cy, 140, -0.75, 0.75); g.stroke(); g.beginPath(); g.arc(cx + 190, cy, 140, Math.PI - 0.75, Math.PI + 0.75); g.stroke();
    }
    if (kind === 'cau') {
      for (let i = -3; i <= 3; i++) { g.save(); g.translate(cx, cy + 90); g.rotate(i * 0.17); g.beginPath(); g.ellipse(0, -130, 30, 120, 0, 0, 7); g.fill(); g.restore(); }
      g.fillStyle = BR.ink; g.fillRect(cx - 70, cy + 80, 140, 26); g.fillRect(cx - 60, cy + 106, 120, 20); g.fillRect(cx - 70, cy + 126, 140, 22);
      g.strokeStyle = P.bg; g.lineWidth = 4; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(cx, cy + 80); g.lineTo(cx + Math.sin(i * 0.17) * 230, cy + 90 - Math.cos(i * 0.17) * 230); g.stroke(); }
    }
    if (kind === 'skate') {
      g.save(); g.translate(cx, cy); g.rotate(-0.5);
      g.beginPath(); g.moveTo(-230, -40); g.arc(-190, 0, 40, Math.PI * 1.5, Math.PI * 0.5, true); g.lineTo(190, 40); g.arc(190, 0, 40, Math.PI * 0.5, Math.PI * 1.5, true); g.closePath(); g.fill();
      g.fillStyle = BR.yellow; for (const x of [-130, 130]) for (const y of [70]) { g.beginPath(); g.arc(x - 30, y, 26, 0, 7); g.arc(x + 30, y, 26, 0, 7); g.fill(); }
      g.restore();
    }
    g.fillStyle = P.fg; g.textAlign = 'left';
    g.font = 'italic 900 92px Montserrat, sans-serif'; g.fillText(P.t1, 36, h - 150);
    g.fillStyle = P.ac; g.fillRect(36, h - 128, 120, 8);
    g.fillStyle = P.fg; g.font = '800 30px Montserrat, sans-serif'; g.fillText(P.t2, 36, h - 78);
    g.font = '500 22px "IBM Plex Mono", monospace'; g.globalAlpha = 0.75; g.fillText(P.t3, 36, h - 42); g.globalAlpha = 1;
    g.font = '900 24px Montserrat, sans-serif'; g.textAlign = 'right'; g.fillText('15 XÓM LẺ', w - 30, 50);
  });
}
export const posterMatOf = tex => new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.18, roughness: 0.55 });

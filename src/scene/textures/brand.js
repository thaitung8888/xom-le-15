// Texture thương hiệu: chữ neon, biển chữ, thẻ nhỏ, logo tròn trên cửa kính.
import { BR } from '../../config/brand.js';
import { canvasTex, grime } from './canvas.js';

// Neon: chữ dạng ống (viền phát sáng) trên nền trong suốt
export function neonTube(g, text, x, y, font, glowC, core) {
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  for (const [blur, a, lw] of [[70, 0.45, 24], [32, 0.75, 15], [12, 1, 8]]) {
    g.shadowColor = glowC; g.shadowBlur = blur; g.globalAlpha = a; g.strokeStyle = glowC; g.lineWidth = lw; g.strokeText(text, x, y);
  }
  g.globalAlpha = 1; g.shadowBlur = 6; g.shadowColor = glowC; g.strokeStyle = core; g.lineWidth = 3.5; g.strokeText(text, x, y);
  g.shadowBlur = 0;
}
export function signTex(lines, bg, fg, w = 512, h = 192, font = '"Be Vietnam Pro"') {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    grime(g, w, h, 300, 0.05, 0.12, 0.02);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach(([t, size, y, weight = 700]) => { g.font = `${weight} ${size}px ${font},sans-serif`; g.fillText(t, w / 2, y); });
  });
}
export function cardTex(title, sub, w = 512, h = 300) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = BR.ivory; g.fillRect(0, 0, w, h);
    g.fillStyle = BR.purple; g.fillRect(0, 0, w, 14);
    g.textAlign = 'center'; g.fillStyle = BR.ink;
    g.font = '900 78px Montserrat, sans-serif'; g.fillText(title, w / 2, h * 0.52);
    g.fillStyle = BR.purple; g.font = '600 34px Montserrat, sans-serif'; g.fillText(sub, w / 2, h * 0.78);
  });
}
/* ===== logo tròn cho cửa kính (khác logo trong tiệm) ===== */
export function roundelTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    g.strokeStyle = g.fillStyle = '#ffffff';
    g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, 496, 0, 7); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 426, 0, 7); g.stroke();
    // chữ chạy vòng quanh, liền một vòng
    g.font = '800 44px Montserrat, "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const chars = [...'ĐI CHẬM · NHÌN QUANH · 15 XÓM LẺ · HÀ NỘI · '], R0 = 461;
    const widths = chars.map(c => g.measureText(c).width + 7), total = widths.reduce((x, y) => x + y, 0);
    const reps = Math.max(1, Math.floor(2 * Math.PI * R0 / total)), k = 2 * Math.PI * R0 / (total * reps);
    let ang = -Math.PI / 2;
    for (let r = 0; r < reps; r++) chars.forEach((ch, i) => {
      const a = widths[i] * k / R0;
      g.save(); g.translate(cx + Math.cos(ang + a / 2) * R0, cy + Math.sin(ang + a / 2) * R0); g.rotate(ang + a / 2 + Math.PI / 2); g.fillText(ch, 0, 0); g.restore();
      ang += a;
    });
    // mái cổng xóm
    const ry = cy - 262;
    g.beginPath();
    g.moveTo(cx - 180, ry + 52); g.quadraticCurveTo(cx - 90, ry + 30, cx - 60, ry - 18); g.lineTo(cx + 60, ry - 18);
    g.quadraticCurveTo(cx + 90, ry + 30, cx + 180, ry + 52); g.lineTo(cx + 150, ry + 66); g.lineTo(cx - 150, ry + 66); g.closePath(); g.fill();
    g.fillRect(cx - 150, ry + 78, 300, 16);
    g.fillRect(cx - 132, ry + 94, 22, 34); g.fillRect(cx + 110, ry + 94, 22, 34);
    // số 15
    g.textBaseline = 'alphabetic';
    g.font = '900 330px Montserrat, "Be Vietnam Pro", sans-serif'; g.fillText('15', cx, cy + 100);
    // gạch ngang + chấm
    g.fillRect(cx - 190, cy + 134, 150, 6); g.fillRect(cx + 40, cy + 134, 150, 6);
    g.beginPath(); g.arc(cx, cy + 137, 9, 0, 7); g.fill();
    g.font = '900 112px Montserrat, "Be Vietnam Pro", sans-serif'; g.fillText('XÓM LẺ', cx, cy + 278);
  });
}

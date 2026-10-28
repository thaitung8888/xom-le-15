// Khu quầy thu ngân: quầy liền khối, POS, tủ thấp, kệ nổi, hộp đèn logo.
import { BR } from '../../config/brand.js';
import { T, scene, TX } from '../core.js';
import { std, glow, box, plane, pool } from '../helpers.js';
import { R, rr } from '../random.js';
import { canvasTex } from '../textures/canvas.js';

export function buildCounter() {
  const CX = 3.45, CZ = -40.6, CL = 2.4, ivory = std('#efeae1', 0.35);
  // thân quầy: mặt trước ốp lam dọc màu tím, hai đầu và mặt trên liền khối màu ngà
  box(0.74, 0.9, CL, std('#2b2178', 0.6), CX, 0.53, CZ);
  const flG = new T.BoxGeometry(0.03, 0.86, 0.035), flM = std(BR.purple, 0.5), n = Math.floor(CL / 0.06);
  const fl = new T.InstancedMesh(flG, flM, n), m4 = new T.Matrix4();
  for (let i = 0; i < n; i++) { m4.makeTranslation(CX - 0.375, 0.53, CZ - CL / 2 + 0.03 + i * 0.06); fl.setMatrixAt(i, m4); }
  scene.add(fl);
  box(0.9, 0.05, CL + 0.1, ivory, CX, 1.005, CZ);
  [-1, 1].forEach(s => box(0.9, 0.98, 0.05, ivory, CX, 0.49, CZ + s * (CL / 2 + 0.025)));
  // chân quầy lõm + đèn hắt vàng
  box(0.6, 0.08, CL, std('#141218', 0.6), CX + 0.04, 0.04, CZ);
  box(0.015, 0.015, CL - 0.06, glow('#ffc700', 2.2), CX - 0.29, 0.03, CZ);
  pool(CX - 0.45, 0.014, CZ, 0, 0.9, CL + 0.4, 0.28, 'rgba(255,199,0,1)').rotation.x = -Math.PI / 2;
  // logo nhỏ trên mặt trước
  box(0.01, 0.46, 0.36, std('#efeae1', 0.4), CX - 0.4, 0.62, CZ);
  plane(0.3, 0.39, new T.MeshStandardMaterial({ map: TX.badge, transparent: true, alphaTest: 0.3, roughness: 0.6 }), CX - 0.407, 0.62, CZ, -Math.PI / 2);
  // máy POS dạng tablet, máy quẹt thẻ, kệ QR, lọ hoa
  const posScreen = canvasTex(256, 176, (g, w, h) => { g.fillStyle = BR.ink; g.fillRect(0, 0, w, h); g.fillStyle = BR.purple; g.fillRect(0, 0, w, 30); g.fillStyle = BR.ivory; g.font = '800 16px Montserrat, sans-serif'; g.fillText('15 XÓM LẺ · POS', 10, 21); g.fillStyle = 'rgba(247,241,230,.6)'; for (let i = 0; i < 4; i++) g.fillRect(14, 48 + i * 22, 140, 8); g.fillStyle = BR.yellow; g.fillRect(170, 120, 70, 40); });
  const stand = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.12, 14), std('#d8d6d2', 0.3, 0.8)); stand.position.set(CX + 0.12, 1.09, CZ + 0.55); scene.add(stand);
  const tab = new T.Group(); box(0.016, 0.18, 0.26, std('#111', 0.3), 0, 0, 0, tab);
  plane(0.24, 0.165, new T.MeshStandardMaterial({ map: posScreen, emissiveMap: posScreen, emissive: '#fff', emissiveIntensity: 0.7 }), -0.009, 0, 0, -Math.PI / 2, tab);
  tab.position.set(CX + 0.1, 1.24, CZ + 0.55); tab.rotation.z = -0.35; scene.add(tab);
  const term = box(0.09, 0.03, 0.16, std('#161616', 0.4), CX - 0.15, 1.045, CZ + 0.05); term.rotation.z = 0.25;
  const qr = canvasTex(128, 160, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#111';
    const cell = 5, ox = 14, oy = 14;
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) if (R() < 0.5) g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    for (const [fx, fy] of [[0, 0], [13, 0], [0, 13]]) { g.fillStyle = '#111'; g.fillRect(ox + fx * cell, oy + fy * cell, 35, 35); g.fillStyle = '#fff'; g.fillRect(ox + fx * cell + 5, oy + fy * cell + 5, 25, 25); g.fillStyle = '#111'; g.fillRect(ox + fx * cell + 10, oy + fy * cell + 10, 15, 15); }
    g.fillStyle = BR.purple; g.font = '800 13px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('QUÉT ĐỂ TRẢ', w / 2, 140);
  });
  const qs = plane(0.12, 0.15, new T.MeshStandardMaterial({ map: qr, roughness: 0.6 }), CX - 0.2, 1.11, CZ - 0.5, -Math.PI / 2 + 0.4); qs.rotation.x = -0.15;
  const vase = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.2, 16), std(BR.yellow, 0.35)); vase.position.set(CX + 0.15, 1.13, CZ - 0.85); scene.add(vase);
  for (let i = 0; i < 4; i++) { const s = new T.Mesh(new T.CylinderGeometry(0.005, 0.005, 0.4, 5), std('#4c6b35', 0.8)); s.position.set(CX + 0.15 + rr(-.03, .03), 1.4, CZ - 0.85 + rr(-.03, .03)); s.rotation.set(rr(-.2, .2), 0, rr(-.2, .2)); scene.add(s); }
  // phía sau quầy: tủ thấp ngà không tay nắm, kệ gỗ nổi, hộp đèn logo
  box(0.45, 0.86, 2.6, std('#e7e1d6', 0.5), 4.72, 0.43, CZ);
  for (let i = 1; i < 4; i++) box(0.005, 0.8, 0.006, std('#b9b2a6', 0.6), 4.495, 0.43, CZ - 1.3 + i * 0.65);
  box(0.46, 0.03, 2.62, std('#a77b4f', 0.55), 4.72, 0.875, CZ);
  box(0.28, 0.035, 2.4, std('#a77b4f', 0.55), 4.81, 1.42, CZ);
  [[BR.purple, -0.85, 0.26], [BR.purple, -0.85, 0.42], [BR.ivory, -0.45, 0.26], [BR.yellow, 0.75, 0.26]].forEach(([c, dz, y]) => box(0.22, 0.14, 0.3, std(c, 0.7), 4.81, 1.42 + y - 0.18, CZ + dz));
  const bag = box(0.1, 0.3, 0.26, std(BR.purple, 0.85), 4.84, 1.59, CZ + 0.15); bag.rotation.y = 0.1;
  box(0.08, 1.24, 0.98, std(BR.ink, 0.5, 0.3), 4.94, 2.45, CZ);
  plane(0.9, 1.17, new T.MeshStandardMaterial({ map: TX.badge, emissiveMap: TX.badge, emissive: '#ffffff', emissiveIntensity: 0.8, transparent: true, alphaTest: 0.3, roughness: 0.5 }), 4.89, 2.45, CZ, -Math.PI / 2);
  pool(4.9, 2.45, CZ, -Math.PI / 2, 2.6, 2.6, 0.3, 'rgba(130,100,255,1)');
  const cl = new T.PointLight('#fff1dc', 0.7, 4, 1.6); cl.position.set(3.4, 2.4, CZ); scene.add(cl);
}

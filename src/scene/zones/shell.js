// Vỏ tiệm: sàn terrazzo, tường bê tông, trần lam gỗ, ray đèn, đèn chính.
import { BR } from '../../config/brand.js';
import { T, scene, TX } from '../core.js';
import { std, glow, box, plane, pool } from '../helpers.js';
import { plant } from '../props/plant.js';
import { canvasTex, grime } from '../textures/canvas.js';

export function buildShell() {
  const X = 5, Z0 = -20, Z1 = -44, H = 4.2, L = Z0 - Z1, zc = (Z0 + Z1) / 2;
  const wallTex = TX.concrete.clone(); wallTex.needsUpdate = true; wallTex.repeat.set(L / 2.4, H / 1.2);
  const wm = new T.MeshStandardMaterial({ map: wallTex, roughness: 0.92, color: '#e6e1da' });
  plane(L, H, wm, -X, H / 2, zc, Math.PI / 2);
  plane(L, H, wm, X, H / 2, zc, -Math.PI / 2);
  const bt = TX.concrete.clone(); bt.needsUpdate = true; bt.repeat.set(10 / 2.4, H / 1.2);
  plane(10, H, new T.MeshStandardMaterial({ map: bt, roughness: 0.9, color: '#6a58f0' }), 0, H / 2, Z1, 0);
  const f = new T.Mesh(new T.PlaneGeometry(10, L), new T.MeshStandardMaterial({ map: TX.floor, roughness: 0.35, metalness: 0.05 }));
  f.rotation.x = -Math.PI / 2; f.position.set(0, 0.005, zc); scene.add(f);
  const c = new T.Mesh(new T.PlaneGeometry(10, L), std('#1b1820', 0.95)); c.rotation.x = Math.PI / 2; c.position.set(0, H, zc); scene.add(c);
  // trần lam gỗ (instanced)
  const slats = Math.floor(9.8 / 0.14), sg = new T.BoxGeometry(0.05, 0.08, L - 0.2);
  const si = new T.InstancedMesh(sg, std('#8a6040', 0.65), slats), m4 = new T.Matrix4();
  for (let i = 0; i < slats; i++) { m4.makeTranslation(-4.9 + i * 0.14, H - 0.12, zc); si.setMatrixAt(i, m4); }
  scene.add(si);
  // chân tường gỗ + khe đèn hắt dọc mép trần
  const cove = glow('#ffd58a', 1.6);
  for (const s of [-1, 1]) {
    box(0.03, 0.03, L - 0.4, cove, s * 4.96, H - 0.24, zc);
    box(0.04, 0.12, L - 0.2, std('#3a2d22', 0.6), s * 4.97, 0.06, zc);
  }
  // ray đèn rọi
  const railM = std('#121212', 0.4, 0.6), headM = std('#1b1b1b', 0.35, 0.7), lens = glow('#ffe2b5', 2.2);
  for (const x of [-2.6, 2.6]) {
    box(0.06, 0.05, L - 1, railM, x, H - 0.2, zc);
    for (let z = Z0 - 1.5; z > Z1 + 0.5; z -= 2) {
      const hd = new T.Group(); hd.position.set(x, H - 0.33, z);
      const cyl = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.2, 14), headM); hd.add(cyl);
      const ln = new T.Mesh(new T.CircleGeometry(0.055, 14), lens); ln.rotation.x = Math.PI / 2; ln.position.y = -0.101; hd.add(ln);
      hd.rotation.z = x < 0 ? 0.65 : -0.65; scene.add(hd);
    }
  }
  scene.add(new T.HemisphereLight('#6d6aa0', '#20180f', 0.28));
  const warm = '#ffd8a6';
  [[0, 3.6, -24.5, 1.25], [0, 3.6, -32, 1.2], [0, 3.6, -39.5, 1.1]].forEach(([x, y, z, i]) => { const l = new T.PointLight(warm, i, 13, 1.4); l.position.set(x, y, z); scene.add(l); });
  for (let z = -23.5; z > -35; z -= 3.6) pool(-4.97, 2.5, z, Math.PI / 2, 2.6, 3.2, 0.26);
  for (let z = -23.5; z > -38; z -= 3.6) pool(4.97, 2.5, z, -Math.PI / 2, 2.6, 3.2, 0.22);
  pool(0, 2.4, -43.97, 0, 7, 3.8, 0.2, 'rgba(255,214,120,1)');
  // thảm chùi chân trong cửa
  const mat = canvasTex(512, 288, (g, w, h) => { g.fillStyle = BR.ink; g.fillRect(0, 0, w, h); grime(g, w, h, 900, 0.06, 0.1, 0.01); g.fillStyle = BR.yellow; g.font = '900 64px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('15 XÓM LẺ', w / 2, h / 2 + 22); });
  const mm = new T.Mesh(new T.PlaneGeometry(1.6, 0.9), new T.MeshStandardMaterial({ map: mat, roughness: 1 })); mm.rotation.x = -Math.PI / 2; mm.rotation.z = Math.PI; mm.position.set(0, 0.012, -20.9); scene.add(mm);
  // cây xanh trong tiệm
  plant(-4.3, -21.0, 1.25); plant(4.35, -21.1, 1.05); plant(3.4, -43.4, 0.85);
}

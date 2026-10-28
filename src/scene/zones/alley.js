// Khu 1 — con ngõ dẫn vào tiệm.
import { BR } from '../../config/brand.js';
import { small } from '../../env.js';
import { T, scene, TX } from '../core.js';
import { std, glow, box, plane, halo } from '../helpers.js';
import { wire } from '../props/wire.js';
import { rr } from '../random.js';
import { alleyWall } from '../textures/alleyWall.js';

export function buildAlley() {
  // Tường, nền ngõ
  const LEN = 28, HT = 9, zc = 8 - LEN / 2;
  plane(LEN, HT, alleyWall(1, LEN, HT), -2, HT / 2, zc, Math.PI / 2);
  plane(LEN, HT, alleyWall(2, LEN, HT), 2, HT / 2, zc, -Math.PI / 2);
  const floor = new T.Mesh(new T.PlaneGeometry(4, 30), new T.MeshStandardMaterial({ map: TX.alleyFloor, roughnessMap: TX.alleyRough, roughness: 1, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 8 - 15); scene.add(floor);
  plane(4, HT, std('#1a1b1f', 1), 0, HT / 2, 8.2, Math.PI);

  // Đèn đường, máy lạnh, dây điện, dây phơi, trăng
  const arm = std('#2b2c2e', 0.5, 0.6);
  box(0.9, 0.06, 0.06, arm, -1.55, 4.2, -7);
  const bulb = new T.Mesh(new T.SphereGeometry(0.11, 14, 10), glow('#ffb35c', 3)); bulb.position.set(-1.12, 4.05, -7); scene.add(bulb);
  halo('rgba(255,170,80,1)', 2.6, -1.12, 4.05, -7, 0.55);
  const sod = new T.PointLight('#ffa24a', 2.6, 20, 1.6); sod.position.set(-1.1, 3.9, -7); scene.add(sod);
  box(0.9, 0.06, 0.06, arm, 1.55, 4.4, 2);
  const bulb2 = new T.Mesh(new T.SphereGeometry(0.1, 14, 10), glow('#ffc070', 2.5)); bulb2.position.set(1.12, 4.25, 2); scene.add(bulb2);
  halo('rgba(255,180,90,1)', 2.2, 1.12, 4.25, 2, 0.45);
  if (!small) { const sod2 = new T.PointLight('#ffb060', 1.4, 14, 1.6); sod2.position.set(1.1, 4.1, 2); scene.add(sod2); }

  const ac = std('#c9c7bf', 0.6), grille = std('#3a3a3a', 0.8);
  [[-1.82, 3.0, -4.5], [-1.82, 5.6, 0.5], [1.82, 4.4, -8.5], [1.82, 6.8, -16], [-1.82, 6.3, -12], [1.82, 3.4, -13.6]].forEach(([x, y, z]) => {
    box(0.32, 0.5, 0.75, ac, x, y, z);
    const f = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.02, 16), grille); f.rotation.z = Math.PI / 2; f.position.set(x + (x < 0 ? 0.17 : -0.17), y, z); scene.add(f);
  });

  for (let k = 0; k < 8; k++) {
    const z = 4 - k * 3.1 + rr(-0.6, 0.6), y1 = rr(4.6, 6.4), y2 = rr(4.6, 6.4);
    wire([[-2, y1, z], [0, Math.min(y1, y2) - rr(0.3, 0.8), z + rr(-0.4, 0.4)], [2, y2, z + rr(-0.6, 0.6)]]);
  }
  for (const [x, y] of [[-1.7, 5.2], [-1.6, 5.35], [1.65, 5.6], [1.75, 5.45]]) {
    const pts = []; for (let z = 8; z >= -20; z -= 3.5) pts.push([x + rr(-0.05, 0.05), y - ((z % 7 + 7) % 7 > 3 ? 0.35 : 0), z]);
    wire(pts, 0.014);
  }
  wire([[-2, 4.3, -9.4], [0, 4.0, -9.5], [2, 4.3, -9.6]], 0.008);
  ['#d8d2c3', BR.purple, '#3c5c86', BR.yellow].forEach((c, i) => {
    const x = -1.3 + i * 0.75, cl = plane(0.5, 0.65, std(c, 0.95, 0, { side: T.DoubleSide }), x, 3.72 + Math.abs(x) * 0.06, -9.5);
    cl.rotation.z = rr(-0.05, 0.05);
  });

  halo('rgba(255,236,200,1)', 3.2, 1.6, 15, -40, 0.85);
  halo('rgba(255,220,170,1)', 9, 1.6, 15, -40, 0.18);
}

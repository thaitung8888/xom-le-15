// Khu kệ hoodie (tường trái): thanh treo, móc gỗ, chữ thương hiệu trên tường.
import { BR } from '../../config/brand.js';
import { T, scene } from '../core.js';
import { std, box, plane } from '../helpers.js';
import { rr } from '../random.js';
import { cardTex } from '../textures/brand.js';
import { canvasTex } from '../textures/canvas.js';

export function buildHoodieRail() {
  const metal = std('#b6a46a', 0.3, 1);
  const railX = -4.55;
  const rail = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 12.4, 10), metal); rail.rotation.x = Math.PI / 2; rail.position.set(railX, 2.08, -28.2); scene.add(rail);
  for (const z of [-22.1, -28.2, -34.3]) box(0.45, 0.03, 0.03, metal, -4.78, 2.08, z);
  // vài móc gỗ treo sẵn
  const wood = std('#b9875a', 0.6), hookG = new T.TorusGeometry(0.035, 0.006, 6, 14, Math.PI * 1.4), barG = new T.BoxGeometry(0.42, 0.025, 0.02);
  for (const z of [-24.0, -24.12, -24.24, -29.6, -29.72, -32.8]) {
    const g = new T.Group();
    const hk = new T.Mesh(hookG, metal); hk.position.y = 0.04; hk.rotation.z = -0.4; g.add(hk);
    const l = new T.Mesh(barG, wood); l.position.set(-0.1, -0.07, 0); l.rotation.z = 0.42; g.add(l);
    const r = new T.Mesh(barG, wood); r.position.set(0.1, -0.07, 0); r.rotation.z = -0.42; g.add(r);
    g.position.set(railX + 0.04, 2.02, z); g.rotation.y = Math.PI / 2; scene.add(g);
  }
  // thẻ "sắp lên kệ" treo trên thanh
  const tag = plane(0.42, 0.25, new T.MeshStandardMaterial({ map: cardTex('SẮP LÊN KỆ', 'Hoodie · lô đầu tiên'), roughness: 0.8, side: T.DoubleSide }), railX + 0.03, 1.86, -27.0, Math.PI / 2);
  tag.rotation.z = -0.03;
  // kệ trên + đồ trang trí
  box(0.42, 0.04, 11.5, std('#3a2d22', 0.6), -4.78, 2.62, -28.2);
  for (const z of [-23.2, -31.6]) {
    const pot = new T.Mesh(new T.CylinderGeometry(0.09, 0.07, 0.16, 14), std(BR.purple, 0.6)); pot.position.set(-4.76, 2.72, z); scene.add(pot);
    for (let i = 0; i < 6; i++) { const lf = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), std('#3e6e34', 0.8)); lf.scale.set(0.5, 1.7, 0.5); lf.position.set(-4.76 + rr(-.05, .05), 2.9 + rr(0, 0.07), z + rr(-.05, .05)); lf.rotation.set(rr(-.5, .5), 0, rr(-.5, .5)); scene.add(lf); }
  }
  box(0.3, 0.3, 0.3, std(BR.yellow, 0.7), -4.76, 2.79, -27.2);
  box(0.26, 0.18, 0.36, std(BR.ivory, 0.7), -4.76, 2.73, -28.1);
  // chữ thương hiệu sơn lên tường
  const word = canvasTex(1024, 220, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = BR.purple; g.font = '900 170px Montserrat, sans-serif'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillText('XÓM LẺ', 210, 190);
    g.fillStyle = BR.yellow; g.fillRect(0, 50, 180, 150); g.fillStyle = BR.ink; g.textAlign = 'center'; g.font = '900 120px Montserrat, sans-serif'; g.fillText('15', 90, 170);
  });
  plane(4.6, 0.99, new T.MeshStandardMaterial({ map: word, transparent: true, roughness: 0.85 }), -4.98, 3.42, -27.8, Math.PI / 2);
}

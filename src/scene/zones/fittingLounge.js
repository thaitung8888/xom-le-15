// Khu phòng thử (góc trái phía sau) và góc sofa ngồi chờ.
import { BR } from '../../config/brand.js';
import { small } from '../../env.js';
import { T, scene } from '../core.js';
import { std, glow, box, plane } from '../helpers.js';
import { curtain } from '../props/curtain.js';
import { plant } from '../props/plant.js';
import { stool } from '../props/stool.js';
import { canvasTex, grime } from '../textures/canvas.js';
import { sportPoster, posterMatOf } from '../textures/posters.js';

export function buildFittingLounge() {
  const velvet = '#2b2178', wall = std(BR.ivory, 0.9), brass = std('#c9a54a', 0.3, 1);
  // hai phòng thử 1.3 m, nép vào góc trái phía sau
  const X0 = -5, X1 = -3.75, Z1 = -41.35, Z2 = -42.65, Z3 = -43.93;
  [Z1, Z2].forEach(z => box(X1 - X0, 2.45, 0.08, wall, (X0 + X1) / 2, 1.225, z));
  box(0.08, 0.26, Z1 - Z3 + 0.08, std(BR.purple, 0.7), X1, 2.58, (Z1 + Z3) / 2);
  const sign = canvasTex(1024, 96, (g, w, h) => { g.fillStyle = BR.yellow; g.font = '800 54px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('THỬ · 01', w * 0.25, 68); g.fillText('THỬ · 02', w * 0.75, 68); });
  plane(Z1 - Z3, 0.22, new T.MeshBasicMaterial({ map: sign, transparent: true }), X1 + 0.042, 2.58, (Z1 + Z3) / 2, Math.PI / 2);
  const rod = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, Z1 - Z3, 8), brass); rod.rotation.x = Math.PI / 2; rod.position.set(X1 + 0.05, 2.4, (Z1 + Z3) / 2); scene.add(rod);
  const c1 = curtain(1.28, 2.25, velvet); c1.rotation.y = Math.PI / 2; c1.position.set(X1 + 0.05, 1.27, (Z1 + Z2) / 2); scene.add(c1);
  const c2 = curtain(0.5, 2.25, velvet); c2.rotation.y = Math.PI / 2; c2.position.set(X1 + 0.05, 1.27, Z3 + 0.3); scene.add(c2);
  // trong phòng 02: gương, ghế, đèn
  box(0.04, 1.8, 0.55, brass, -4.97, 1.15, -42.95);
  const mirTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d8dde0'); gr.addColorStop(0.5, '#8e979c'); gr.addColorStop(1, '#c9cfd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const mirM = new T.MeshStandardMaterial({ map: mirTex, roughness: 0.08, metalness: 0.7, emissive: '#2a2e31', emissiveIntensity: 0.4 });
  plane(0.48, 1.72, mirM, -4.945, 1.15, -42.95, Math.PI / 2);
  stool(BR.yellow, -4.45, -43.55);
  const pend = new T.Mesh(new T.SphereGeometry(0.06, 14, 10), glow('#ffd59a', 2.2)); pend.position.set(-4.35, 2.3, -43.3); scene.add(pend);
  if (!small) { const pl = new T.PointLight('#ffcf8f', 0.6, 3, 1.6); pl.position.set(-4.35, 2.15, -43.3); scene.add(pl); }
  // gương toàn thân đứng ngoài, cạnh phòng thử
  box(0.05, 1.95, 0.72, brass, -4.96, 1.1, -40.45);
  plane(0.64, 1.86, mirM, -4.93, 1.1, -40.45, Math.PI / 2);

  // góc sofa: thảm, sofa nhung tím, bàn tròn, đèn cây, poster
  const rugT = canvasTex(512, 640, (g, w, h) => {
    g.fillStyle = '#d9cfbb'; g.fillRect(0, 0, w, h); grime(g, w, h, 1500, 0.05, 0.08, 0.006);
    g.strokeStyle = BR.purple; g.lineWidth = 16; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = BR.yellow; for (let i = 0; i < 5; i++) g.fillRect(70 + i * 82, h / 2 - 6, 40, 12);
  });
  const rug = new T.Mesh(new T.PlaneGeometry(2.0, 2.8), new T.MeshStandardMaterial({ map: rugT, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.rotation.z = Math.PI / 2; rug.position.set(-3.75, 0.012, -37.9); scene.add(rug);
  const sofa = new T.Group(), vel = std(velvet, 0.95), velD = std('#221a63', 0.95), leg = std('#c9a54a', 0.35, 1);
  box(0.9, 0.24, 2.4, velD, 0, 0.22, 0, sofa);
  box(0.24, 0.5, 2.4, vel, -0.33, 0.55, 0, sofa);
  [-0.56, 0.56].forEach(z => box(0.62, 0.14, 1.08, vel, 0.1, 0.41, z, sofa));
  [-1.12, 1.12].forEach(z => box(0.9, 0.36, 0.18, vel, 0, 0.44, z, sofa));
  for (const [x, z] of [[-0.38, -1.1], [0.38, -1.1], [-0.38, 1.1], [0.38, 1.1]]) box(0.04, 0.1, 0.04, leg, x, 0.05, z, sofa);
  const pil = box(0.12, 0.34, 0.34, std(BR.yellow, 0.9), -0.12, 0.62, 0.72, sofa); pil.rotation.set(0.15, 0, -0.25);
  const pil2 = box(0.12, 0.3, 0.3, std(BR.ivory, 0.9), -0.12, 0.6, -0.7, sofa); pil2.rotation.set(-0.1, 0, -0.2);
  sofa.position.set(-4.5, 0, -37.9); scene.add(sofa);
  const tTop = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.03, 32), std(BR.ivory, 0.4)); tTop.position.set(-3.45, 0.46, -37.2); scene.add(tTop);
  const tLeg = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.44, 10), leg); tLeg.position.set(-3.45, 0.23, -37.2); scene.add(tLeg);
  const tBase = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.02, 20), leg); tBase.position.set(-3.45, 0.01, -37.2); scene.add(tBase);
  box(0.26, 0.03, 0.2, std(BR.purple, 0.8), -3.48, 0.49, -37.25); box(0.24, 0.02, 0.18, std(BR.yellow, 0.8), -3.46, 0.515, -37.2);
  const pole = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 1.55, 8), leg); pole.position.set(-4.6, 0.78, -36.35); scene.add(pole);
  const shade = new T.Mesh(new T.SphereGeometry(0.17, 20, 12, 0, 6.283, 0, Math.PI / 2), std(BR.ivory, 0.6, 0, { side: T.DoubleSide })); shade.position.set(-4.6, 1.6, -36.35); scene.add(shade);
  const lb = new T.Mesh(new T.CircleGeometry(0.15, 20), glow('#ffd59a', 2.4)); lb.rotation.x = Math.PI / 2; lb.position.set(-4.6, 1.59, -36.35); scene.add(lb);
  const ll = new T.PointLight('#ffcf8f', 0.7, 3.5, 1.6); ll.position.set(-4.4, 1.4, -36.5); scene.add(ll);
  // poster trượt ván phía trên sofa
  box(0.04, 1.07, 0.76, std('#111014', 0.5), -4.98, 2.05, -37.9);
  plane(0.72, 1.03, posterMatOf(sportPoster('skate')), -4.955, 2.05, -37.9, Math.PI / 2);
  plant(-4.5, -35.85, 0.8);
}

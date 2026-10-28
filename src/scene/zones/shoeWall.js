// Khu tường giày: panel xám lỗ chốt, giày trên giá đỡ, poster thể thao, neon.
import { BR } from '../../config/brand.js';
import { T, scene, addHotspot } from '../core.js';
import { productsIn } from '../../config/products.js';
import { stationIndex } from '../../config/stations.js';
import { SETTINGS } from '../../config/settings.js';
import { std, box, plane, halo, pool, neonMaterial } from '../helpers.js';
import { shoeMesh } from '../props/shoe.js';
import { R, pick } from '../random.js';
import { neonTube } from '../textures/brand.js';
import { canvasTex, grime } from '../textures/canvas.js';
import { sportPoster, posterMatOf } from '../textures/posters.js';

export function buildShoeWall() {
  const z = -43.93, W = 6, H = 2.9, Y0 = 0.15;
  const panelTex = canvasTex(1024, 496, (g, w, h) => {
    const ppm = w / W;
    g.fillStyle = '#bebcb7'; g.fillRect(0, 0, w, h); grime(g, w, h, 700, 0.04, 0.04, 0.01);
    g.strokeStyle = 'rgba(60,58,64,.55)'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 1.2 * ppm) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = h; y >= 0; y -= 1.0 * ppm) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let y = 0.15 * ppm; y < h; y += 0.3 * ppm) for (let x = 0.12 * ppm; x < w; x += 0.24 * ppm) {
      g.fillStyle = '#4a4850'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 1, y - 1, 1.6, 0, 7); g.fill();
    }
  });
  plane(W, H, new T.MeshStandardMaterial({ map: panelTex, roughness: 0.75 }), 0, Y0 + H / 2, z);
  box(W + 0.04, 0.04, 0.06, std('#2a2533', 0.5), 0, Y0 + H + 0.02, z + 0.02);
  // poster thể thao
  const posters = [['run', -1.68, 1.95], ['ball', 0.24, 1.15], ['cau', 1.92, 2.05]];
  const PWd = 0.72, PHt = 1.03;
  posters.forEach(([k, x, y]) => {
    box(PWd + 0.04, PHt + 0.04, 0.02, std('#111014', 0.5), x, y, z + 0.012);
    plane(PWd, PHt, posterMatOf(sportPoster(k)), x, y, z + 0.024);
  });
  const blocked = (x, y) => posters.some(([, px, py]) => Math.abs(x - px) < PWd / 2 + 0.22 && y > py - PHt / 2 - 0.22 && y < py + PHt / 2 + 0.05);
  // giày trên giá đỡ đen
  const ups = ['#f2efe6', '#f2efe6', '#e6e2d8', '#1d1e22', '#9a9da3', '#5b5e66', BR.purple, '#efe6c8', '#2a2533'];
  const accents = [BR.purple, BR.yellow, BR.ink, '#f2efe6', '#ff6b4a', '#3a8fd8'];
  const bracket = std('#121115', 0.4, 0.6), plateG = new T.BoxGeometry(0.24, 0.012, 0.11), stemG = new T.BoxGeometry(0.03, 0.07, 0.03);
  const slots = [];
  const bySlot = new Map(productsIn('shoes').map(p => [p.slot, p]));
  for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) {
    const x = -2.64 + c * 0.48 + (r % 2 ? 0.06 : 0), y = 0.45 + r * 0.4;
    if (blocked(x, y)) continue;
    const pl = new T.Mesh(plateG, bracket); pl.position.set(x, y, z + 0.075); scene.add(pl);
    const st = new T.Mesh(stemG, bracket); st.position.set(x - 0.06, y - 0.03, z + 0.02); scene.add(st);
    const slot = slots.length;
    slots.push([x, y]);
    // Giày thật lấy màu từ danh sách sản phẩm; chỗ trống lấp bằng giày mẫu nếu bật SETTINGS.fillDemoShoes
    const product = bySlot.get(slot);
    const look = product?.look || (SETTINGS.fillDemoShoes ? {
      upper: pick(ups), sole: R() < 0.2 ? '#b77b40' : R() < 0.15 ? '#1d1e22' : '#f6f4ee', accent: pick(accents)
    } : null);
    if (!look) continue;
    const sh = shoeMesh(look.upper, look.sole, look.accent);
    sh.scale.setScalar(1.12); sh.position.set(x, y + 0.008, z + 0.085); sh.rotation.set(0, 0.32, 0.1); scene.add(sh);
    if (product) addHotspot({ stop: stationIndex('tuong-giay'), pos: new T.Vector3(x, y + 0.26, z + 0.12), product });
  }
  // đèn rọi tường giày + neon phía trên
  pool(0, 1.6, -43.9, 0, 7, 3.4, 0.2, 'rgba(255,240,215,1)');
  const l = new T.PointLight('#f6f2ff', 1.0, 6.5, 1.5); l.position.set(0, 2.1, -41.8); scene.add(l);
  const nm = neonMaterial(canvasTex(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); neonTube(g, 'ghé xóm chơi', w / 2, 175, 'italic 800 120px Montserrat, sans-serif', '#ffc700', '#fff6cf'); }));
  plane(2.8, 0.7, nm, 0, 3.58, -43.9);
  halo('rgba(255,199,0,1)', 4, 0, 3.58, -43.7, 0.2);
}

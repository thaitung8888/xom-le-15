// Khu kệ treo đồ (tường trái): thanh treo, áo 2.5D xếp đè lên nhau, móc gỗ, chữ thương hiệu trên tường.
import { BR } from '../../config/brand.js';
import { T, scene, addHotspot, onFrame, SHADOWS } from '../core.js';
import { std, box, plane } from '../helpers.js';
import { productsIn } from '../../config/products.js';
import { stationIndex } from '../../config/stations.js';
import { SETTINGS } from '../../config/settings.js';
import { reduce, assetUrl } from '../../env.js';
import { loadGarment, SHADOW_PAD } from '../props/garment.js';
import { rr } from '../random.js';
import { cardTex } from '../textures/brand.js';
import { canvasTex } from '../textures/canvas.js';

// Thanh treo chạy dọc tường trái (trục z). Áo treo xéo một góc và đè lên nhau như kệ thật:
// mỗi áo che một phần bên trái của áo kế tiếp. Vị trí tự tính theo bề rộng từng món,
// cả dãy được căn giữa quanh điểm camera của trạm "Kệ hoodie" nhìn vào.
export const RAIL_X = -4.55, RAIL_Y = 2.08;
const RACK = {
  center: -27.8,   // tâm dãy áo (z)
  yaw: 0.62,       // góc xoay áo so với mặt tường (rad, ~35°): mặt áo hướng về phía cửa tiệm
  show: 0.6,       // mỗi áo lộ ra khoảng 60% bề ngang, phần còn lại nằm dưới áo bên cạnh
  gap: 0.015,      // khe hở tối thiểu giữa hai áo (m) để vải không xuyên vào nhau
  max: 15          // số món tối đa trên thanh
};
const TYPE_ORDER = { tee: 0, hoodie: 1, dress: 2 };

export function buildHoodieRail() {
  const metal = std('#b6a46a', 0.3, 1);
  const railX = RAIL_X;
  const rail = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 12.4, 10), metal); rail.rotation.x = Math.PI / 2; rail.position.set(railX, 2.08, -28.2); scene.add(rail);
  for (const z of [-22.1, -28.2, -34.3]) box(0.45, 0.03, 0.03, metal, -4.78, 2.08, z);
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

  return buildRack(metal);
}

// Sắp các sản phẩm lên thanh: tải hết ảnh, tính bề rộng, xếp đè lên nhau rồi treo.
async function buildRack(metal) {
  // Thứ tự: theo slot nếu có; không có thì áo thun → hoodie → váy (ngắn trước, dài sau)
  let items = productsIn('hoodie').filter(p => p.image)
    .map((p, i) => ({ p, i, type: SETTINGS.garmentLengths[p.type] ? p.type : 'tee' }))
    .sort((a, b) => (a.p.slot ?? 1e3 + TYPE_ORDER[a.type] * 100 + a.i) - (b.p.slot ?? 1e3 + TYPE_ORDER[b.type] * 100 + b.i));
  if (items.length > RACK.max) { console.warn(`Kệ chỉ treo được ${RACK.max} món, bỏ bớt ${items.length - RACK.max} món cuối.`); items = items.slice(0, RACK.max); }

  const loaded = await Promise.all(items.map(it =>
    loadGarment(assetUrl(it.p.image), it.type, SETTINGS.garmentLengths[it.type])
      .then(g => ({ ...it, g }))
      .catch(e => { console.warn(e); return null; })));
  const hung = loaded.filter(Boolean);

  // Khoảng cách giữa hai áo liền nhau: đủ để áo trước chỉ che một phần áo sau,
  // và đủ xa theo phương vuông góc để mặt sau áo này không chạm mặt trước áo kia.
  const cos = Math.cos(RACK.yaw), sin = Math.sin(RACK.yaw);
  const zs = [0];
  for (let i = 1; i < hung.length; i++) {
    const a = hung[i - 1].g.userData, b = hung[i].g.userData;
    const byWidth = RACK.show * (a.width + b.width) / 2 * cos;
    const byDepth = (a.back + b.front + RACK.gap) / sin;
    zs.push(zs[i - 1] - Math.max(byWidth, byDepth));
  }
  const shift = RACK.center - (zs[0] + zs[zs.length - 1]) / 2;
  hung.forEach((it, i) => hangGarment(it, RAIL_X, zs[i] + shift, i, metal));

  addEmptyHangers(metal, hung.length ? [zs[0] + shift + 0.5, zs[zs.length - 1] + shift - 0.5] : null);
  if (!hung.length) {
    const tag = plane(0.42, 0.25, new T.MeshStandardMaterial({ map: cardTex('SẮP LÊN KỆ', 'Hoodie · lô đầu tiên'), roughness: 0.8, side: T.DoubleSide }), RAIL_X + 0.03, 1.86, -27.0, Math.PI / 2);
    tag.rotation.z = -0.03;
  }
  if (hung.length) addRackLight(zs[0] - zs[zs.length - 1]);
}

// Móc trống treo ở hai đầu thanh, ngoài khoảng đang có áo
function addEmptyHangers(metal, range) {
  const wood = std('#b9875a', 0.6), hookG = new T.TorusGeometry(0.035, 0.006, 6, 14, Math.PI * 1.4), barG = new T.BoxGeometry(0.42, 0.025, 0.02);
  for (const z of [-23.4, -23.52, -23.64, -24.3, -31.9, -32.02, -32.8]) {
    if (range && z < range[0] && z > range[1]) continue;
    const g = new T.Group();
    const hk = new T.Mesh(hookG, metal); hk.position.y = 0.04; hk.rotation.z = -0.4; g.add(hk);
    const l = new T.Mesh(barG, wood); l.position.set(-0.1, -0.07, 0); l.rotation.z = 0.42; g.add(l);
    const r = new T.Mesh(barG, wood); r.position.set(0.1, -0.07, 0); r.rotation.z = -0.42; g.add(r);
    g.position.set(RAIL_X + 0.04, 2.02, z); g.rotation.y = Math.PI / 2; scene.add(g);
  }
}

// Đèn rọi từ ray trần xuống dãy áo; trên máy tính có đổ bóng thật (áo đổ bóng lên nhau và lên tường)
function addRackLight(span) {
  const spot = new T.SpotLight('#fff0da', 1.5, 9, Math.atan((span / 2 + 0.7) / 3.2), 0.6, 1.3);
  spot.position.set(-2.6, 3.86, RACK.center);
  spot.target.position.set(-4.8, 1.25, RACK.center);
  scene.add(spot, spot.target);
  if (SHADOWS) {
    spot.castShadow = true;
    spot.shadow.mapSize.set(2048, 2048);
    spot.shadow.camera.near = 0.8; spot.shadow.camera.far = 7;
    spot.shadow.bias = -0.0004; spot.shadow.normalBias = 0.015;
  }
}

// Một món trên móc: móc kim loại vòng qua thanh, vai gỗ, xoay xéo theo dãy.
function hangGarment({ p: product, g: shirt }, x, z, index, metal) {
  const { width, length, hanger, shadowMap, depthAt } = shirt.userData;

  // Điểm treo nằm đúng tâm thanh, cả món đồ đung đưa quanh điểm này
  const pivot = new T.Group(); pivot.position.set(x, RAIL_Y, z); scene.add(pivot);
  const hook = new T.Mesh(new T.TorusGeometry(0.03, 0.004, 6, 18, Math.PI * 1.4), metal);
  hook.rotation.z = -Math.PI / 2; pivot.add(hook);   // vòng móc vuông góc với thanh, chỗ hở quay xuống
  const stemL = hanger.topDrop + hanger.barY - 0.03;
  const stem = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, stemL, 6), metal); stem.position.y = -0.03 - stemL / 2; pivot.add(stem);

  const body = new T.Group(); body.position.y = -hanger.topDrop; body.rotation.y = Math.PI / 2 - RACK.yaw; pivot.add(body);
  body.add(shirt);
  // vai móc gỗ: áo/hoodie giấu bên trong; váy hai dây thì lộ ra ở cổ váy, dây vắt lên hai đầu
  const wood = std('#b9875a', 0.6), half = hanger.half, slope = hanger.strap ? 0.08 : 0.18;
  for (const s of [-1, 1]) {
    const bar = new T.Mesh(new T.BoxGeometry(half, 0.02, 0.014), wood);
    bar.position.set(s * half / 2, -hanger.barY - half / 2 * Math.sin(slope), 0); bar.rotation.z = -s * slope; body.add(bar);
  }

  // máy yếu không đổ bóng thật: dùng tấm bóng mờ trên tường
  if (!SHADOWS) {
    const k = 1 + SHADOW_PAD * 2;
    const sh = new T.Mesh(new T.PlaneGeometry(width * k * Math.cos(RACK.yaw), length * k),
      new T.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.3, depthWrite: false }));
    sh.position.set(-4.985, RAIL_Y - hanger.topDrop - length / 2 - 0.08, z); sh.rotation.y = Math.PI / 2; scene.add(sh);
  }

  // chấm giá: cùng một độ cao cho cả dãy, nằm ở nửa phải (phần không bị áo bên cạnh che)
  const v = Math.min(0.85, (0.6 - hanger.topDrop) / length);
  let u = 0.7; if (depthAt(u, v) <= 0) u = 0.6;
  pivot.updateMatrixWorld(true);
  const pos = shirt.localToWorld(new T.Vector3((u - 0.5) * width, -v * length, depthAt(u, v) + 0.012));
  // tấm bắt chuột giữ nguyên ở tư thế đứng yên (không lật theo hiệu ứng hover),
  // nếu không áo vừa lật ra sẽ "giật" hover sang áo bên cạnh rồi lật lại, nhấp nháy liên tục
  scene.attach(shirt.userData.pick);
  const hs = { stop: stationIndex('hoodie'), pos, product, object: shirt, hover: false };
  addHotspot(hs);

  // Mỗi khung hình: đung đưa rất nhẹ (mỗi món một nhịp, biên độ nhỏ để các áo đè nhau không chạm nhau);
  // khi rê chuột vào thì món đồ lật nhẹ ra phía trước và xoay về phía người xem, như được kéo ra khỏi dãy.
  const ph = index * 1.7, baseYaw = body.rotation.y;
  let lift = 0;
  onFrame((t, dt) => {
    lift += ((hs.hover ? 1 : 0) - lift) * (reduce ? 1 : Math.min(1, dt * 9));
    const s = reduce ? 0 : t / 1000;
    pivot.rotation.z = 0.006 * Math.sin(s * 0.9 + ph) + lift * 0.11;
    pivot.rotation.y = 0.01 * Math.sin(s * 0.55 + ph * 0.6);
    body.rotation.y = baseYaw + lift * 0.12;
  });
}

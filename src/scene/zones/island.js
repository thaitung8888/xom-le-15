// Khu đảo giữa tiệm: sàn in, bục khối, khung lưới + poster, đèn tuýp,
// và MÓN NỔI BẬT (chọn bằng nút ★ trong admin) đứng trên giá xoay ở bục chính.
import { drawBadge } from '../../brand/logo.js';
import { BR } from '../../config/brand.js';
import { T, scene, TX, addHotspot, onFrame } from '../core.js';
import { featuredProduct } from '../../config/products.js';
import { SETTINGS } from '../../config/settings.js';
import { stationIndex } from '../../config/stations.js';
import { assetUrl, reduce } from '../../env.js';
import { loadGarment } from '../props/garment.js';
import { std, glow, box, plane, pool } from '../helpers.js';
import { cardTex } from '../textures/brand.js';
import { canvasTex, grime } from '../textures/canvas.js';
import { deckTex } from '../textures/deck.js';

export const ISL = { x: -0.9, z: -31.5 };

export function buildIsland() {
  const { x: IX, z: IZ } = ISL;
  // tấm sàn in: hình tròn tia tím + chữ chạy vòng + chữ lớn "ĐI CHẬM"
  const PW = 3.2, PD = 3.4;
  const print = canvasTex(1024, 1088, (g, w, h) => {
    g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); grime(g, w, h, 900, 0.04, 0.05, 0.01);
    const cx = w / 2, cy = h * 0.43, R1 = w * 0.4;
    g.fillStyle = BR.purple; g.beginPath(); g.arc(cx, cy, R1, 0, 7); g.fill();
    const rays = 36;
    for (let i = 0; i < rays; i++) {
      const a0 = i / rays * 6.283, a1 = (i + 0.5) / rays * 6.283;
      g.fillStyle = '#24197a'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R1 * 0.78, a0, a1); g.closePath(); g.fill();
    }
    g.fillStyle = BR.yellow; g.beginPath(); g.arc(cx, cy, R1 * 0.2, 0, 7); g.fill();
    g.fillStyle = BR.purple; g.font = '900 64px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('15', cx, cy + 4);
    g.strokeStyle = BR.yellow; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R1 * 0.79, 0, 7); g.stroke();
    g.fillStyle = BR.ivory; g.font = '800 30px Montserrat, sans-serif';
    const chars = [...'HÀNG MỚI · SÁNG THỨ SÁU · 15 XÓM LẺ · '], Rt = R1 * 0.89;
    const ws = chars.map(c => g.measureText(c).width + 5), tot = ws.reduce((x, y) => x + y, 0);
    const reps = Math.max(1, Math.floor(6.283 * Rt / tot)), k = 6.283 * Rt / (tot * reps);
    let ang = -Math.PI / 2;
    for (let r = 0; r < reps; r++) chars.forEach((ch, i) => { const a = ws[i] * k / Rt; g.save(); g.translate(cx + Math.cos(ang + a / 2) * Rt, cy + Math.sin(ang + a / 2) * Rt); g.rotate(ang + a / 2 + Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); ang += a; });
    // chữ lớn sát mép trước, viền tím, bị cắt bởi mép tấm sàn
    g.save(); g.translate(-30, h + 34); g.transform(1, 0, -0.25, 1, 0, 0);
    g.font = 'italic 900 230px Montserrat, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.lineWidth = 7; g.strokeStyle = BR.purple; g.strokeText('ĐI CHẬM', 0, 0);
    g.restore();
    g.fillStyle = BR.yellow; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
  });
  box(PW, 0.06, PD, std('#2a2533', 0.6), IX, 0.03, IZ);
  const top = new T.Mesh(new T.PlaneGeometry(PW, PD), new T.MeshStandardMaterial({ map: print, roughness: 0.55 }));
  top.rotation.x = -Math.PI / 2; top.position.set(IX, 0.061, IZ); scene.add(top);

  // bục khối
  const perf = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c9c6c0'; g.fillRect(0, 0, w, h); grime(g, w, h, 300, .04, .06, .02); g.fillStyle = 'rgba(30,28,34,.75)'; for (let y = 16; y < h; y += 32) for (let x = 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, { repeat: [2, 1] });
  const perfM = new T.MeshStandardMaterial({ map: perf, roughness: 0.7 });
  const oak = std('#a77b4f', 0.6), dark = std('#3a3540', 0.6);
  box(0.95, 0.44, 0.95, perfM, IX + 0.35, 0.06 + 0.22, IZ - 0.05);
  const p1t = box(0.62, 0.34, 0.62, oak, IX + 0.35, 0.5 + 0.17, IZ - 0.05); p1t.rotation.y = 0.26;
  box(0.75, 0.38, 0.52, dark, IX - 0.6, 0.06 + 0.19, IZ + 0.55);
  box(0.46, 0.86, 0.46, std(BR.purple, 0.55), IX + 1.05, 0.06 + 0.43, IZ - 0.75);
  box(0.46, 0.02, 0.46, std(BR.yellow, 0.4), IX + 1.05, 0.93, IZ - 0.75);
  // món nổi bật đứng trên bục chính (bục gỗ trên khối lỗ); chưa chọn món nào thì đặt thẻ "nổi bật" như cũ
  const hero = featuredProduct();
  let heroP = Promise.resolve();
  if (hero) heroP = buildFeatured(hero, IX + 0.35, 0.84, IZ - 0.05).catch(e => console.warn(e));
  else {
    const card = plane(0.46, 0.27, new T.MeshStandardMaterial({ map: cardTex('NỔI BẬT', 'Sắp lên đảo'), roughness: 0.8 }), IX + 0.35, 1.0, IZ + 0.1, 0.26);
    card.rotation.x = -0.25;
  }
  const deck = plane(0.21, 0.84, new T.MeshStandardMaterial({ map: deckTex(3), transparent: true, alphaTest: 0.5, roughness: 0.55, side: T.DoubleSide }), IX - 0.25, 0.47, IZ + 0.5, 0.35);
  deck.rotation.x = -0.32;
  box(0.3, 0.2, 0.22, std(BR.yellow, 0.7), IX - 0.72, 0.54, IZ + 0.55);
  box(0.26, 0.12, 0.2, std(BR.ivory, 0.7), IX - 0.42, 0.5, IZ + 0.6);

  // khung sắt + lưới mắt cáo + poster
  const meshTex = canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = '#b7b9bd'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w / 2, 0); g.lineTo(w, h / 2); g.lineTo(w / 2, h); g.closePath(); g.stroke();
  });
  const metal = std('#111014', 0.4, 0.6);
  const posterMat = tex => new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.22, roughness: 0.6 });
  function panel(w, hgt, x, z, ry, posterTex, pw, ph, px) {
    const g = new T.Group(), t = 0.05;
    box(t, hgt, t, metal, -w / 2, hgt / 2, 0, g); box(t, hgt, t, metal, w / 2, hgt / 2, 0, g);
    box(w, t, t, metal, 0, hgt, 0, g); box(w, t, t, metal, 0, 0.28, 0, g);
    box(t, t, 0.75, metal, -w / 2, t / 2, 0, g); box(t, t, 0.75, metal, w / 2, t / 2, 0, g);
    const mt = meshTex.clone(); mt.needsUpdate = true; mt.wrapS = mt.wrapT = T.RepeatWrapping; mt.repeat.set((w - t) / 0.11, (hgt - 0.3) / 0.11);
    plane(w - t, hgt - 0.3, new T.MeshStandardMaterial({ map: mt, transparent: true, alphaTest: 0.4, metalness: 0.6, roughness: 0.4, side: T.DoubleSide }), 0, 0.28 + (hgt - 0.28) / 2, 0, 0, g);
    plane(pw, ph, posterMat(posterTex), px, 0.28 + (hgt - 0.28) / 2 + 0.08, 0.035, 0, g);
    plane(pw, ph, std('#1a181f', 0.9), px, 0.28 + (hgt - 0.28) / 2 + 0.08, 0.03, Math.PI, g);
    for (const yy of [0.28 + (hgt - 0.28) / 2 + 0.08 + ph / 2]) for (const xx of [px - pw / 2 + 0.05, px + pw / 2 - 0.05]) box(0.012, hgt - yy, 0.012, metal, xx, yy + (hgt - yy) / 2, 0.035, g);
    g.position.set(x, 0.06, z); g.rotation.y = ry; scene.add(g);
  }
  // poster 1: cắt từ bức graffiti
  const p1 = canvasTex(560, 840, (g, w, h) => {
    g.fillStyle = BR.ivory; g.fillRect(0, 0, w, h);
    const mc = TX.muralCanvas, sh = mc.height * 0.82, sw = sh * (w - 40) / (h - 130);
    g.drawImage(mc, mc.width * 0.19, mc.height * 0.1, sw, sh, 20, 20, w - 40, h - 130);
    g.fillStyle = BR.ink; g.font = '900 44px Montserrat, sans-serif'; g.textAlign = 'left'; g.fillText('BỨC TƯỜNG', 24, h - 62);
    g.fillStyle = BR.purple; g.font = '600 22px "IBM Plex Mono", monospace'; g.fillText('15 XÓM LẺ · VẼ TAY · 2026', 26, h - 28);
    g.fillStyle = BR.yellow; g.fillRect(w - 90, h - 92, 66, 66); g.fillStyle = BR.ink; g.font = '900 40px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('05', w - 57, h - 45);
  });
  // poster 2: logo trên nền tím, chấm halftone
  const p2 = canvasTex(560, 840, (g, w, h) => {
    g.fillStyle = BR.purple; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 18) for (let x = 0; x < w; x += 18) { const r = 1 + 5 * (y / h) * (y / h); g.fillStyle = 'rgba(255,199,0,.55)'; g.beginPath(); g.arc(x + (y / 18 % 2) * 9, y, r, 0, 7); g.fill(); }
    g.fillStyle = BR.ink; g.fillRect(0, 0, w, 90);
    g.fillStyle = BR.yellow; g.font = '900 40px Montserrat, sans-serif'; g.textAlign = 'center'; g.fillText('MỞ CỬA 2026', w / 2, 60);
    drawBadge(g, w / 2, 150, 320, { p: BR.ink });
    g.fillStyle = BR.ivory; g.font = 'italic 900 64px Montserrat, sans-serif'; g.fillText('ghé xóm chơi', w / 2, h - 60);
  });
  panel(1.45, 2.35, IX - 1.45, IZ + 0.15, Math.PI / 2, p1, 0.86, 1.29, 0.12);
  panel(1.55, 2.35, IX - 0.35, IZ - 1.62, 0, p2, 0.86, 1.29, -0.1);

  // khung treo + 3 đèn tuýp trắng
  const hz = [IZ + 0.65, IZ - 0.05, IZ - 0.75];
  box(2.6, 0.04, 0.04, metal, IX, 3.32, IZ + 0.95); box(2.6, 0.04, 0.04, metal, IX, 3.32, IZ - 1.05);
  box(0.04, 0.04, 2.0, metal, IX - 1.3, 3.32, IZ - 0.05); box(0.04, 0.04, 2.0, metal, IX + 1.3, 3.32, IZ - 0.05);
  for (const [xx, zz] of [[-1.3, 0.95], [1.3, 0.95], [-1.3, -1.05], [1.3, -1.05]]) box(0.008, 0.72, 0.008, metal, IX + xx, 3.7, IZ + zz);
  const tubeM = glow('#f5f3ff', 2.6);
  hz.forEach(zz => {
    const tb = new T.Mesh(new T.CylinderGeometry(0.028, 0.028, 1.9, 12), tubeM); tb.rotation.z = Math.PI / 2; tb.position.set(IX, 3.26, zz); scene.add(tb);
    box(1.94, 0.03, 0.06, metal, IX, 3.3, zz);
  });
  const il = new T.PointLight('#f1efff', 1.25, 6.5, 1.5); il.position.set(IX, 2.9, IZ); scene.add(il);
  pool(IX, 0.075, IZ, 0, 3.4, 3.4, 0.12, 'rgba(255,255,255,1)').rotation.x = -Math.PI / 2;
  return heroP;
}

// Món nổi bật: mâm xoay đen trên bục, giá đứng inox, áo 2.5D treo trên giá, đèn rọi riêng.
// Áo chỉ có ảnh mặt trước nên mâm lắc qua lại (±30°) quanh hướng nhìn của camera, không quay hết vòng.
async function buildFeatured(p, x, topY, z) {
  const type = SETTINGS.garmentLengths[p.type] ? p.type : 'tee';
  const shirt = await loadGarment(assetUrl(p.image), type, SETTINGS.garmentLengths[type]);
  const { length, hanger } = shirt.userData;
  const chrome = std('#d9dbe0', 0.18, 1);

  const turn = new T.Group(); turn.position.set(x, topY, z); scene.add(turn);
  const disc = new T.Mesh(new T.CylinderGeometry(0.29, 0.3, 0.035, 48), std('#141217', 0.35, 0.3)); disc.position.y = 0.0175; turn.add(disc);
  const ring = new T.Mesh(new T.TorusGeometry(0.295, 0.006, 6, 48), glow(BR.yellow, 1.2)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.036; turn.add(ring);
  const base = new T.Mesh(new T.CylinderGeometry(0.15, 0.16, 0.02, 32), chrome); base.position.y = 0.045; turn.add(base);
  // áo đặt sao cho gấu cách mâm ít nhất 12 cm; giá cao theo áo
  const shirtTop = 0.055 + 0.12 + length + hanger.topDrop * 0.3;
  const poleTop = shirtTop - hanger.barY;
  const pole = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, poleTop - 0.055, 12), chrome); pole.position.y = 0.055 + (poleTop - 0.055) / 2; turn.add(pole);
  const bar = new T.Mesh(new T.CylinderGeometry(0.009, 0.009, hanger.half * 2, 10), chrome); bar.rotation.z = Math.PI / 2; bar.position.y = poleTop; turn.add(bar);
  shirt.position.y = shirtTop; turn.add(shirt);

  // đèn rọi từ trên xuống món nổi bật
  const spot = new T.SpotLight('#fff3e0', 2.4, 6, 0.38, 0.55, 1.2);
  spot.position.set(x + 0.6, 3.2, z + 0.9); spot.target = shirt; scene.add(spot);

  // hướng nhìn từ camera trạm "Món nổi bật" tới bục → mặt áo quay về phía đó, rồi lắc qua lại
  const cam = new T.Vector3(1.15, 1.85, -28.45);
  const face = Math.atan2(cam.x - x, cam.z - z);
  turn.rotation.y = face;
  if (!reduce) onFrame(t => { turn.rotation.y = face + 0.52 * Math.sin(t / 1000 * 0.35); });

  turn.updateMatrixWorld(true);
  addHotspot({
    stop: stationIndex('hang-moi'),
    pos: new T.Vector3(x, topY + shirtTop - length * 0.62, z).add(new T.Vector3(Math.sin(face), 0, Math.cos(face)).multiplyScalar(0.1)),
    product: { ...p, zone: 'featured' }, object: shirt
  });
}

// Góc sưu tầm (tường phải, phía trước) — đồ trưng bày, không bán:
//   bên trái: 5 ván trượt treo dọc, dưới là kệ gỗ với các quả bóng lưu niệm trong hộp mica + bảng đồng
//   bên phải: các khung áo đấu có chữ ký (hộp sâu, kính, đèn rọi tranh), băng ghế + máy đĩa bên dưới
// Bấm vào bóng hoặc khung áo để mở khung chi tiết (câu chuyện, giải đấu…). Nội dung: src/config/collection.js
import { BR } from '../../config/brand.js';
import { T, scene, addHotspot, maxAniso } from '../core.js';
import { stationIndex } from '../../config/stations.js';
import { COLLECTION_DECKS, BALLS, BALL_DIAMETER, FRAMES, FRAME_HEIGHT, JERSEY_FRAME_RATIO } from '../../config/collection.js';
import { assetUrl } from '../../env.js';
import { std, box, plane, pool } from '../helpers.js';
import { rr } from '../random.js';
import { deckTex } from '../textures/deck.js';
import { canvasTex } from '../textures/canvas.js';
import { loadGarment } from '../props/garment.js';

const WALL = 5;                 // mặt tường phải (x)
const FACE = -Math.PI / 2;      // xoay mặt phẳng để quay ra giữa tiệm
const CENTER = -24.8;           // z giữa khung hình của trạm

export function buildCollectionCorner() {
  const stop = stationIndex('skate');

  // ---- 5 ván trượt treo dọc (nhóm bên trái, phía trong tiệm) ----
  const deckGap = 0.42, deckMid = -26.2;
  COLLECTION_DECKS.forEach((k, i) => {
    const z = deckMid + (i - (COLLECTION_DECKS.length - 1) / 2) * deckGap;
    const m = new T.MeshStandardMaterial({ map: deckTex(k), transparent: true, alphaTest: 0.5, roughness: 0.55, side: T.DoubleSide });
    const d = plane(0.21, 0.84, m, 4.93, 1.85, z, FACE); d.rotation.z = rr(-0.015, 0.015);
    box(0.06, 0.03, 0.05, std('#999', 0.3, 1), 4.97, 1.42, z);
  });

  // ---- kệ bóng ----
  const shelfY = 0.98, shelfD = 0.26, shelfW = 2.1;
  box(shelfD, 0.035, shelfW, std('#6d4a2e', 0.55), WALL - shelfD / 2, shelfY, deckMid);
  for (const dz of [-0.8, 0.8]) box(0.2, 0.08, 0.03, std('#1b1b1b', 0.4, 0.7), WALL - 0.1, shelfY - 0.055, deckMid + dz);
  const ballGap = shelfW / (BALLS.length + 0.2);
  // (trái → phải khi nhìn từ giữa tiệm là chiều z tăng dần)
  const ballsP = Promise.all(BALLS.map((b, i) => {
    const z = deckMid + (i - (BALLS.length - 1) / 2) * ballGap;
    return buildBall(b, z, shelfY + 0.0175, shelfD)
      .then(obj => ({ stop, pos: new T.Vector3(WALL - shelfD + 0.02, shelfY - 0.1, z), product: asItem(b), object: obj }))
      .catch(e => { console.warn(e); return null; });
  }));

  // ---- khung áo đấu (nhóm bên phải, phía cửa) ----
  const frameTop = 2.3, gap = 0.25;
  // mỗi khung: tải trước (ảnh khung hoặc áo) để biết bề ngang, rồi mới xếp hàng
  const framesP = Promise.all(FRAMES.map(f => (f.jersey ? prepJerseyFrame(f) : prepPhotoFrame(f))))
    .then(list => {
      // khung tự dựng: cùng một bề ngang, đủ cho áo rộng nhất (tối thiểu theo JERSEY_FRAME_RATIO)
      const jw = Math.max(FRAME_HEIGHT * JERSEY_FRAME_RATIO, ...list.filter(x => x.needW).map(x => x.needW));
      list.forEach(x => { if (x.needW) x.setWidth(jw); });
      const total = list.reduce((s, x) => s + x.w, 0) + gap * (list.length - 1);
      let z = -23.45 - total / 2;                    // căn giữa nhóm khung quanh z = -23.45, trái → phải
      return list.map(item => {
        const { f, w } = item, cz = z + w / 2;
        const obj = item.build(cz, frameTop - FRAME_HEIGHT / 2);
        z += w + gap;
        return { stop, pos: new T.Vector3(WALL - 0.08, frameTop - FRAME_HEIGHT - 0.06, cz), product: asItem(f), object: obj };
      });
    })
    .catch(e => { console.warn(e); return []; });

  // ---- băng ghế + máy đĩa dưới hai khung ----
  const bz = -23.45, wood = std('#6d4a2e', 0.6);
  box(0.46, 0.08, 2.3, wood, 4.45, 0.46, bz);
  for (const dz of [-0.9, 0.9]) box(0.4, 0.42, 0.06, std('#1b1b1b', 0.5, 0.6), 4.45, 0.21, bz + dz);
  box(0.42, 0.1, 0.36, std('#2a2a2c', 0.4, 0.3), 4.45, 0.55, bz + 0.75);
  const rec = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.01, 30), std('#0c0c0c', 0.25)); rec.position.set(4.45, 0.61, bz + 0.75); scene.add(rec);
  const lab = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.012, 20), std(BR.yellow, 0.6)); lab.position.set(4.45, 0.612, bz + 0.75); scene.add(lab);
  const cush = box(0.4, 0.08, 0.6, std(BR.purple, 0.95), 4.45, 0.54, bz - 0.35); cush.rotation.y = 0.1;

  // đèn rọi từ ray trần xuống cả góc tường
  const spot = new T.SpotLight('#fff1dc', 1.1, 8, 0.75, 0.7, 1.4);
  spot.position.set(2.6, 3.86, CENTER); spot.target.position.set(4.9, 1.45, CENTER);
  scene.add(spot, spot.target);

  // chấm giá đăng ký theo đúng thứ tự trên tường (bóng trái → phải, rồi khung) để nút trước / sau đi đúng thứ tự
  return Promise.all([ballsP, framesP]).then(([balls, frames]) => [...balls, ...frames].filter(Boolean).forEach(addHotspot));
}

// Đồ sưu tầm → dạng "sản phẩm" cho khung chi tiết (không có giá)
const asItem = x => ({ ...x, image: x.image || x.jersey, zone: 'collection', price: null });

function loadTex(src) {
  return new Promise((res, rej) => {
    new T.TextureLoader().setCrossOrigin('anonymous').load(assetUrl(src), t => {
      t.encoding = T.sRGBEncoding; t.anisotropy = maxAniso; res(t);
    }, undefined, () => rej(new Error('Không tải được ảnh: ' + src)));
  });
}

// Quả bóng: hình cầu thật, ảnh chụp chính diện được chiếu thẳng lên mặt cầu (giống ống kính nhìn thẳng),
// đặt trên đế đen trong hộp mica, bảng đồng ở mép kệ.
async function buildBall(b, z, baseY, shelfD) {
  const r = BALL_DIAMETER / 2, s = BALL_DIAMETER + 0.06, cx = WALL - 0.03 - s / 2;
  // đế + hộp mica
  box(s, 0.03, s, std('#141217', 0.45), cx, baseY + 0.015, z);
  const cubeY = baseY + 0.03 + s / 2;
  const cubeG = new T.BoxGeometry(s, s, s);
  const glass = new T.Mesh(cubeG, new T.MeshStandardMaterial({ color: '#e6f6ff', transparent: true, opacity: 0.08, roughness: 0.05, depthWrite: false }));
  glass.position.set(cx, cubeY, z); scene.add(glass);
  const edges = new T.LineSegments(new T.EdgesGeometry(cubeG), new T.LineBasicMaterial({ color: '#f2fbff', transparent: true, opacity: 0.55 }));
  edges.position.copy(glass.position); scene.add(edges);
  // vòng đỡ bóng
  const ring = new T.Mesh(new T.TorusGeometry(0.045, 0.008, 8, 24), std('#b6a46a', 0.3, 1));
  ring.rotation.x = Math.PI / 2; ring.position.set(cx, baseY + 0.038, z); scene.add(ring);
  // bảng đồng khắc chữ ở mép kệ
  const [l1, l2] = b.plaque || [b.name, ''];
  const plaqueTex = canvasTex(512, 96, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e3c77e'); gr.addColorStop(0.5, '#b8934a'); gr.addColorStop(1, '#8a6a2c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(60,40,10,.6)'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#3a2810'; g.textAlign = 'center';
    g.font = '700 30px Montserrat, sans-serif'; g.fillText(l1, w / 2, 44);
    g.font = '500 24px "Be Vietnam Pro", sans-serif'; g.fillText(l2, w / 2, 78);
  });
  plane(0.2, 0.038, new T.MeshStandardMaterial({ map: plaqueTex, roughness: 0.35, metalness: 0.6 }), WALL - shelfD - 0.002, baseY - 0.0175, z, FACE);

  // quả bóng
  const tex = await loadTex(b.image);
  const geo = new T.SphereGeometry(r, 48, 32), pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (2 * r) * 0.985, 0.5 + pos.getY(i) / (2 * r) * 0.985);
  const ball = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, roughness: 0.42 }));
  ball.position.set(cx, baseY + 0.03 + 0.012 + r, z);
  ball.rotation.y = FACE + rr(-0.15, 0.15);       // mặt trước của ảnh quay ra giữa tiệm
  scene.add(ball);
  return ball;
}

// Kiểu 1 — ảnh chụp cả khung: hộp sâu màu đen sát tường, mặt trước là ảnh thật của khung.
async function prepPhotoFrame(f) {
  const tex = await loadTex(f.image);
  const h = FRAME_HEIGHT, w = h * tex.image.width / tex.image.height;
  return {
    f, w,
    build: (z, y) => {
      const depth = 0.06;
      box(depth, h, w, std('#0d0c10', 0.5), WALL - depth / 2, y, z);
      frameExtras(w, h, z, y, depth);
      return plane(w, h, new T.MeshStandardMaterial({ map: tex, roughness: 0.75 }), WALL - depth - 0.001, y, z, FACE);
    }
  };
}

// Kiểu 2 — ảnh áo đã xoá nền: tự dựng khung hộp sâu, nền vải tối viền giấy trắng,
// áo 2.5D ép phẳng sau kính, bảng đồng khắc tên ở dưới.
async function prepJerseyFrame(f) {
  // mọi khung tự dựng cùng một cỡ; áo thu nhỏ cho vừa vùng bên trong (áo ngang thì vừa theo chiều ngang)
  const h = FRAME_HEIGHT, border = 0.045, depth = 0.075;
  const top = 0.07, bottom = 0.16, side = 0.06;                        // lề tối thiểu quanh áo
  // mọi áo cùng một chiều dài (cùng cỡ); khung rộng theo áo rộng nhất để mọi khung bằng nhau
  const maxL = h - 2 * border - top - bottom;
  const shirt = await loadGarment(assetUrl(f.jersey), 'tee', maxL);
  const k = 1, jl = maxL, jw = shirt.userData.width;
  return {
    f, needW: jw + 2 * (border + side),
    setWidth(w) { this.w = w; },
    build(z, y) {
      const w = this.w;
      const frameM = std('#0d0c10', 0.45), innerW = w - 2 * border, innerH = h - 2 * border;
      // 4 thanh khung + đáy hộp
      box(depth, border, w, frameM, WALL - depth / 2, y + h / 2 - border / 2, z);
      box(depth, border, w, frameM, WALL - depth / 2, y - h / 2 + border / 2, z);
      box(depth, innerH, border, frameM, WALL - depth / 2, y, z - w / 2 + border / 2);
      box(depth, innerH, border, frameM, WALL - depth / 2, y, z + w / 2 - border / 2);
      // nền vải tối + viền giấy trắng quanh áo + bảng đồng
      const jy = y + h / 2 - border - top;                              // mép trên của áo
      const back = canvasTex(512, Math.round(512 * innerH / innerW), (g, cw, ch) => {
        g.fillStyle = '#18161d'; g.fillRect(0, 0, cw, ch);
        for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`; g.fillRect(Math.random() * cw, Math.random() * ch, 1, 2); }
        const px = cw / innerW, m = 0.025 * px;
        const sx = (innerW - jw) / 2, sy = top + (maxL - jl) / 2;        // vị trí áo trong nền
        g.strokeStyle = '#f2efe8'; g.lineWidth = 0.012 * px;
        g.strokeRect((sx - 0.025) * px, (sy - 0.025) * px, (jw + 0.05) * px, (jl + 0.05) * px);
        g.lineWidth = 0.004 * px; g.strokeStyle = 'rgba(242,239,232,.5)';
        g.strokeRect(m * 0.6, m * 0.6, cw - m * 1.2, ch - m * 1.2);
      });
      plane(innerW, innerH, new T.MeshStandardMaterial({ map: back, roughness: 0.95 }), WALL - 0.006, y, z, FACE);
      const [l1, l2] = f.plaque || [f.name, ''];
      const plaqueTex = canvasTex(640, 120, (g, cw, ch) => {
        const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, '#e9cf88'); gr.addColorStop(0.5, '#bf9a50'); gr.addColorStop(1, '#8c6c2e');
        g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
        g.strokeStyle = 'rgba(60,40,10,.55)'; g.lineWidth = 4; g.strokeRect(7, 7, cw - 14, ch - 14);
        g.fillStyle = '#3a2810'; g.textAlign = 'center';
        g.font = '800 40px Montserrat, sans-serif'; g.fillText(l1, cw / 2, 56);
        g.font = '500 28px "Be Vietnam Pro", sans-serif'; g.fillText(l2, cw / 2, 96);
      });
      plane(Math.min(0.3, innerW * 0.55), 0.056, new T.MeshStandardMaterial({ map: plaqueTex, roughness: 0.3, metalness: 0.65 }),
        WALL - 0.009, y - h / 2 + border + bottom * 0.5, z, FACE);
      // áo: ép phẳng (độ phồng còn 35%), áp sát nền, căn giữa vùng phía trên bảng đồng
      shirt.scale.set(k, k, 0.35 * k);
      shirt.rotation.y = FACE;
      shirt.position.set(WALL - 0.008 - shirt.userData.back * 0.35 * k, jy - (maxL - jl) / 2, z);
      scene.add(shirt);
      frameExtras(w, h, z, y, depth);
      // tấm vô hình phủ mặt khung để bấm vào cả khung
      const pick = plane(w, h, new T.MeshBasicMaterial(), WALL - depth, y, z, FACE); pick.visible = false;
      return pick;
    }
  };
}

// Phần chung của hai kiểu khung: kính có vệt sáng chéo, bóng đổ mờ trên tường, đèn rọi tranh bằng đồng
function frameExtras(w, h, z, y, depth) {
  const sh = canvasTex(128, 160, (g, cw, ch) => { g.filter = 'blur(10px)'; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(18, 22, cw - 36, ch - 36); }, { linear: true });
  plane(w * 1.25, h * 1.22, new T.MeshBasicMaterial({ map: sh, transparent: true, depthWrite: false }), WALL - 0.004, y - 0.05, z, FACE);
  const streak = canvasTex(256, 320, (g, cw, ch) => {
    const gr = g.createLinearGradient(0, 0, cw, ch);
    gr.addColorStop(0.25, 'rgba(255,255,255,0)'); gr.addColorStop(0.38, 'rgba(255,255,255,.55)');
    gr.addColorStop(0.46, 'rgba(255,255,255,0)'); gr.addColorStop(0.62, 'rgba(255,255,255,.18)'); gr.addColorStop(0.7, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
  }, { linear: true });
  plane(w * 0.86, h * 0.9, new T.MeshBasicMaterial({ map: streak, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false }), WALL - depth - 0.004, y, z, FACE);
  const brass = std('#b6a46a', 0.3, 1), top = y + h / 2;
  box(0.12, 0.012, 0.012, brass, WALL - 0.06, top + 0.1, z);
  const lamp = new T.Mesh(new T.CylinderGeometry(0.018, 0.022, w * 0.5, 16), brass);
  lamp.rotation.x = Math.PI / 2; lamp.position.set(WALL - 0.12, top + 0.1, z); scene.add(lamp);
  pool(WALL - 0.003, y + h * 0.12, z, FACE, w * 1.5, h * 1.25, 0.2, 'rgba(255,236,200,1)');
}

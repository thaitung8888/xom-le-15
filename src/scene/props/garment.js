// Áo 2.5D từ một ảnh chụp chính diện đã xoá nền (PNG/WebP có kênh trong suốt).
// Không cần mô hình 3D: ảnh được dán lên một lưới dày rồi "phồng" ra theo khoảng cách tới viền áo,
// nên giữa thân dày, sát mép mỏng dần về 0 (giống áo treo trên móc).
//
//   loadGarment(src, type, length) → Promise<THREE.Group>
//     type   : 'tee' | 'hoodie' | 'dress' — chọn độ phồng và cách treo (xem GARMENT_TYPES)
//     length : chiều dài (mét, từ điểm cao nhất tới gấu). Mọi món cùng length sẽ dài bằng nhau
//              dù ảnh gốc to nhỏ, nhiều hay ít khoảng trống khác nhau.
//   Group trả về có gốc toạ độ ở giữa mép trên, mặt trước hướng +z.
//   group.userData: width, length, front/back (độ phồng lớn nhất), hanger, depthAt(u, v), shadowMap
import { T, maxAniso } from '../core.js';
import { small as smallScreen } from '../../env.js';

const ALPHA_CUT = 24;                       // điểm ảnh có độ đục dưới mức này coi như nền
const DF_H = 220;                           // độ phân giải lưới tính khoảng cách tới viền
const MAX_TEX = smallScreen ? 640 : 1024;   // chiều cao texture tối đa (điện thoại dùng nhỏ hơn cho nhẹ)

// Mỗi loại: độ phồng (mét) và cách treo.
//   edge        : từ mép vào bao xa thì đạt độ phồng tối đa
//   sleeveDepth : độ phồng ở tay áo / vùng gần mép
//   chestDepth  : độ phồng thêm ở giữa thân
//   flare       : váy xoè dần về gấu (0 = không)
//   topDrop     : mép trên của món đồ thấp hơn tâm thanh treo bao nhiêu
//   barY        : vai móc nằm thấp hơn mép trên bao nhiêu
//   barRow      : đo bề rộng vai ở hàng nào (tỉ lệ từ trên xuống) để móc không thò ra ngoài
export const GARMENT_TYPES = {
  tee:    { edge: 0.10, sleeveDepth: 0.028, chestDepth: 0.058, flare: 0,   topDrop: 0.085, barY: 0.05,  barRow: 0.22 },
  hoodie: { edge: 0.12, sleeveDepth: 0.036, chestDepth: 0.064, flare: 0,   topDrop: 0.06,  barY: 0.14,  barRow: 0.24 },
  dress:  { edge: 0.08, sleeveDepth: 0.022, chestDepth: 0.045, flare: 0.7, topDrop: 0.11,  barY: 0.012, barRow: 0.02, strap: true }
};
const BACK_RATIO = 0.6;    // mặt sau phồng bằng bao nhiêu phần mặt trước
const DETAIL = 0.35;       // độ nổi của nếp vải lấy từ sáng tối trong ảnh (0 = tắt)
const SEG_Y = 150;         // số ô lưới theo chiều dọc

export async function loadGarment(src, type = 'tee', length = 0.72) {
  const o = GARMENT_TYPES[type] || GARMENT_TYPES.tee;
  const img = await loadImage(src);
  const crop = cropToAlpha(img);                       // cắt sát viền, thu nhỏ nếu ảnh quá to
  const W = crop.width, H = crop.height;
  const width = length * W / H;                        // ép đúng chiều dài, chiều rộng theo tỉ lệ ảnh

  // 1) Khoảng cách tới viền (tính trên ảnh thu nhỏ cho nhanh)
  const dh = DF_H, dw = Math.max(8, Math.round(DF_H * W / H));
  const sm = document.createElement('canvas'); sm.width = dw; sm.height = dh;
  const sg = sm.getContext('2d', { willReadFrequently: true }); sg.drawImage(crop, 0, 0, dw, dh);
  const sa = sg.getImageData(0, 0, dw, dh).data;
  const mask = new Uint8Array(dw * dh);
  for (let i = 0; i < mask.length; i++) mask[i] = sa[i * 4 + 3] > ALPHA_CUT ? 1 : 0;
  const dist = distanceField(mask, dw, dh);
  const dpx = length / dh;                             // mét trên mỗi ô lưới nhỏ

  // 2) Độ phồng: hồ sơ tròn ở mép + khối ở giữa thân (+ xoè ở gấu váy)
  const depth = new Float32Array(dw * dh);
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const i = y * dw + x;
    if (!mask[i]) continue;
    const t = Math.min(1, dist[i] * dpx / o.edge);
    const rim = Math.sin(t * Math.PI / 2);             // 0 ở mép, 1 khi vào sâu
    const xn = (x / dw - 0.5) / 0.3;                   // thân chiếm khoảng 60% chiều rộng
    const yn = y / dh;
    const chest = Math.max(0, 1 - xn * xn) * (0.75 + 0.25 * Math.sin(Math.min(1, yn * 1.6) * Math.PI / 2)) * (1 - 0.35 * yn * (1 - o.flare));
    depth[i] = rim * (o.sleeveDepth + o.chestDepth * chest) * (1 + o.flare * yn * yn);
  }
  blur(depth, dw, dh, 2);
  for (let i = 0; i < depth.length; i++) if (!mask[i]) depth[i] = 0;   // mép về đúng 0 để mặt trước và sau khép kín
  let maxD = 0; for (const d of depth) if (d > maxD) maxD = d;

  // 3) Lưới mặt trước và mặt sau
  const segX = Math.max(8, Math.round(SEG_Y * W / H));
  const front = new T.PlaneGeometry(width, length, segX, SEG_Y);
  front.translate(0, -length / 2, 0);                 // gốc ở mép trên
  const pos = front.attributes.position, uv = front.attributes.uv;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, sample(depth, dw, dh, uv.getX(i), 1 - uv.getY(i)));
  front.computeVertexNormals();
  const back = front.clone();
  const bpos = back.attributes.position;
  for (let i = 0; i < bpos.count; i++) bpos.setZ(i, -pos.getZ(i) * BACK_RATIO);
  flipWinding(back);
  back.computeVertexNormals();

  // 4) Vật liệu: mặt trước là ảnh thật; mặt sau là màu chủ đạo, giữ dáng các viền
  const map = tex(crop);
  const frontMat = new T.MeshStandardMaterial({ map, alphaTest: 0.5, roughness: 0.88, metalness: 0 });
  if (DETAIL > 0) {
    frontMat.normalMap = tex(normalFromLuma(crop), true);
    frontMat.normalScale = new T.Vector2(DETAIL, DETAIL);
  }
  const backMap = tex(backCanvas(crop));
  const backMat = new T.MeshStandardMaterial({ map: backMap, alphaTest: 0.5, roughness: 0.92 });

  const g = new T.Group();
  for (const [geo, mat] of [[front, frontMat], [back, backMat]]) {
    const m = new T.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    // bóng đổ theo đúng hình dáng áo (bỏ phần nền trong suốt)
    m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: mat.map, alphaTest: 0.5 });
    g.add(m);
  }

  // Tấm vô hình để bắt chuột (2 tam giác thay vì hàng chục nghìn của lưới phồng)
  const pickGeo = new T.PlaneGeometry(width, length); pickGeo.translate(0, -length / 2, 0);
  const pickMesh = new T.Mesh(pickGeo, new T.MeshBasicMaterial()); pickMesh.visible = false; g.add(pickMesh);

  // Vai móc: dài bằng bề rộng vai đo được trong ảnh, để không thò ra ngoài (váy hai dây: bằng khoảng cách hai dây)
  const span = rowSpan(mask, dw, dh, o.barRow);
  const shoulder = (span[1] - span[0]) * width;
  const half = o.strap ? shoulder / 2 : Math.min(width * 0.34, shoulder * 0.45);

  g.userData = {
    width, length, type,
    front: maxD, back: maxD * BACK_RATIO,
    hanger: { topDrop: o.topDrop, barY: o.barY, half, strap: !!o.strap },
    depthAt: (u, v) => sample(depth, dw, dh, u, v),
    alphaAt: (u, v) => mask[Math.min(dh - 1, v * dh | 0) * dw + Math.min(dw - 1, u * dw | 0)],
    pick: pickMesh,
    shadowMap: tex(shadowCanvas(crop), true)
  };
  return g;
}

// Khoảng [trái, phải] (tỉ lệ 0..1 theo chiều rộng) của phần có vải ở một hàng
function rowSpan(mask, w, h, v) {
  const y = Math.min(h - 1, Math.round(v * (h - 1)));
  let x0 = w, x1 = -1;
  for (let x = 0; x < w; x++) if (mask[y * w + x]) { if (x < x0) x0 = x; x1 = x; }
  return x1 < 0 ? [0.3, 0.7] : [x0 / w, (x1 + 1) / w];
}

// ---------- xử lý ảnh ----------

function loadImage(src) {
  return new Promise((res, rej) => {
    const im = new Image(); im.decoding = 'async';
    im.crossOrigin = 'anonymous';   // ảnh trên Supabase khác tên miền: cần để đọc được điểm ảnh
    im.onload = () => res(im); im.onerror = () => rej(new Error('Không tải được ảnh áo: ' + src));
    im.src = src;
  });
}

// Cắt ảnh sát vùng có áo (bỏ nền trong suốt thừa xung quanh)
function cropToAlpha(img) {
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const a = g.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (a[(y * c.width + x) * 4 + 3] > ALPHA_CUT) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return c;
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, k = Math.min(1, MAX_TEX / ch);
  const out = document.createElement('canvas'); out.width = Math.round(cw * k); out.height = Math.round(ch * k);
  out.getContext('2d', { willReadFrequently: true }).drawImage(c, x0, y0, cw, ch, 0, 0, out.width, out.height);
  return out;
}

// Khoảng cách (xấp xỉ Euclid) từ mỗi điểm trong áo tới điểm nền gần nhất: chamfer 2 lượt
function distanceField(mask, w, h) {
  const INF = 1e9, d = new Float32Array(w * h), A = 1, B = Math.SQRT2;
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? INF : 0;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : d[y * w + x];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!d[i]) continue;
    d[i] = Math.min(d[i], at(x - 1, y) + A, at(x, y - 1) + A, at(x - 1, y - 1) + B, at(x + 1, y - 1) + B);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; if (!d[i]) continue;
    d[i] = Math.min(d[i], at(x + 1, y) + A, at(x, y + 1) + A, at(x + 1, y + 1) + B, at(x - 1, y + 1) + B);
  }
  return d;
}

function blur(arr, w, h, r) {
  const tmp = new Float32Array(arr.length);
  for (let pass = 0; pass < 2; pass++) {
    const src = pass ? tmp : arr, dst = pass ? arr : tmp;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = pass ? x : x + k, yy = pass ? y + k : y;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        s += src[yy * w + xx]; n++;
      }
      dst[y * w + x] = s / n;
    }
  }
  return arr;
}

function sample(arr, w, h, u, v) {
  const x = Math.min(w - 1.001, Math.max(0, u * (w - 1))), y = Math.min(h - 1.001, Math.max(0, v * (h - 1)));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * w + x0;
  return (arr[i] * (1 - fx) + arr[i + 1] * fx) * (1 - fy) + (arr[i + w] * (1 - fx) + arr[i + w + 1] * fx) * fy;
}

function flipWinding(geo) {
  const idx = geo.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  geo.index.needsUpdate = true;
}

function tex(canvas, linear = false) {
  const t = new T.CanvasTexture(canvas);
  if (!linear) t.encoding = T.sRGBEncoding;
  t.anisotropy = maxAniso;
  return t;
}

// Bản đồ pháp tuyến từ độ sáng: chỉ giữ chi tiết nhỏ (nếp vải, đường may), bỏ mảng sáng tối lớn
function normalFromLuma(full) {
  const src = document.createElement('canvas');            // nửa độ phân giải là đủ cho nếp vải
  src.width = Math.max(8, full.width >> 1); src.height = Math.max(8, full.height >> 1);
  src.getContext('2d', { willReadFrequently: true }).drawImage(full, 0, 0, src.width, src.height);
  const w = src.width, h = src.height, r = 2;
  const d = src.getContext('2d').getImageData(0, 0, w, h).data;
  const L = new Float32Array(w * h), Lb = new Float32Array(w * h);
  for (let i = 0; i < L.length; i++) L[i] = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255;
  Lb.set(L); blur(Lb, w, h, r * 4);
  const hgt = new Float32Array(w * h);
  for (let i = 0; i < L.length; i++) hgt[i] = L[i] - Lb[i];
  blur(hgt, w, h, 1);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), out = g.createImageData(w, h), o = out.data, S = 6;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const dx = (hgt[y * w + Math.min(w - 1, x + 1)] - hgt[y * w + Math.max(0, x - 1)]) * S;
    const dy = (hgt[Math.min(h - 1, y + 1) * w + x] - hgt[Math.max(0, y - 1) * w + x]) * S;
    const len = Math.hypot(dx, dy, 1);
    o[i * 4] = (-dx / len * 0.5 + 0.5) * 255;
    o[i * 4 + 1] = (dy / len * 0.5 + 0.5) * 255;
    o[i * 4 + 2] = (1 / len * 0.5 + 0.5) * 255;
    o[i * 4 + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  return c;
}

// Mặt sau: ảnh mờ nhoè phủ màu chủ đạo, giữ hình dáng và các viền màu, không lộ logo/chữ
function backCanvas(full) {
  const src = document.createElement('canvas');            // mặt sau bị làm mờ nên chỉ cần ảnh nhỏ
  src.height = Math.min(256, full.height); src.width = Math.max(8, Math.round(full.width * src.height / full.height));
  src.getContext('2d', { willReadFrequently: true }).drawImage(full, 0, 0, src.width, src.height);
  const w = src.width, h = src.height;
  const d = src.getContext('2d').getImageData(0, 0, w, h).data;
  let r = 0, gg = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
  const avg = `rgb(${r / n | 0},${gg / n | 0},${b / n | 0})`;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.filter = `blur(${Math.round(w / 40)}px)`; g.drawImage(src, 0, 0); g.filter = 'none';
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.8; g.fillStyle = avg; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.18; g.fillStyle = '#000'; g.fillRect(0, 0, w, h);          // mặt sau tối hơn một chút
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(src, 0, 0);
  return c;
}

// Bóng đổ: hình dáng áo tô đen, làm nhoè, dùng cho tấm bóng trên tường
function shadowCanvas(src) {
  const pad = SHADOW_PAD, w = 256, h = Math.round(256 * src.height / src.width);
  const c = document.createElement('canvas'); c.width = Math.round(w * (1 + pad * 2)); c.height = Math.round(h * (1 + pad * 2));
  const g = c.getContext('2d');
  g.filter = `blur(${Math.round(w / 22)}px)`;
  g.drawImage(src, w * pad, h * pad, w, h);
  g.filter = 'none';
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  return c;
}
// Phần lề thêm quanh bóng đổ (tỉ lệ theo kích thước áo) để vệt nhoè không bị cắt
export const SHADOW_PAD = 0.12;

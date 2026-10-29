// Chuẩn bị ảnh sản phẩm ngay trong trình duyệt trước khi tải lên (thay cho scripts/prepare_image.py):
// 1) ảnh còn nền trơn (trắng, xám… như ảnh JPG) → xoá nền bằng cách loang từ mép ảnh vào
// 2) cắt sát viền áo   3) thu nhỏ còn tối đa 1024px chiều cao   4) lưu WebP có nền trong suốt
const MAX_H = 1024;        // chiều cao ảnh lưu lại
const WORK_H = 2048;       // ảnh quá lớn được thu về cỡ này trước khi xử lý cho nhanh
const TOL = 28;            // độ lệch màu tối đa so với nền vẫn coi là nền
const ALPHA_CUT = 24;

export async function prepareGarmentImage(file) {
  const bmp = await loadBitmap(file);
  const k = Math.min(1, WORK_H / bmp.height);
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(bmp, 0, 0, w, h);
  const img = g.getImageData(0, 0, w, h), d = img.data;

  let removed = false;
  if (!hasTransparency(d)) { removeFlatBackground(d, w, h); removed = true; g.putImageData(img, 0, 0); }

  const box = alphaBox(d, w, h);
  if (!box) throw new Error('Không tìm thấy sản phẩm trong ảnh (ảnh trống hoặc trùng màu nền).');
  const cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1, s = Math.min(1, MAX_H / ch), pad = 6;
  const out = canvas(Math.round(cw * s) + pad * 2, Math.round(ch * s) + pad * 2);
  const og = out.getContext('2d');
  og.imageSmoothingQuality = 'high';
  og.drawImage(c, box.x0, box.y0, cw, ch, pad, pad, out.width - pad * 2, out.height - pad * 2);

  const blob = await new Promise((res, rej) => out.toBlob(b => (b ? res(b) : rej(new Error('Trình duyệt không xuất được WebP'))), 'image/webp', 0.88));
  if (blob.type !== 'image/webp') throw new Error('Trình duyệt này không hỗ trợ lưu ảnh WebP, hãy dùng Chrome, Edge hoặc Firefox bản mới.');
  return {
    blob, width: out.width, height: out.height, removedBackground: removed,
    lowRes: ch < 700,                              // ảnh gốc nhỏ, lên web sẽ hơi mờ
    url: URL.createObjectURL(blob)
  };
}

async function loadBitmap(file) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Chỉ nhận ảnh PNG, JPG hoặc WebP.');
  try { return await createImageBitmap(file); }
  catch {
    return await new Promise((res, rej) => {
      const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('Không đọc được ảnh.'));
      im.src = URL.createObjectURL(file);
    });
  }
}

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function hasTransparency(d) {
  for (let i = 3; i < d.length; i += 4 * 7) if (d[i] < 250) return true;
  return false;
}

// Loang từ mép ảnh: điểm nào gần màu nền và nối liền với mép thì là nền
function removeFlatBackground(d, w, h) {
  const border = [];
  for (let x = 0; x < w; x += 2) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 2) border.push(y * w, y * w + w - 1);
  const med = ch => { const v = border.map(i => d[i * 4 + ch]).sort((a, b) => a - b); return v[v.length >> 1]; };
  const bg = [med(0), med(1), med(2)];
  const near = i => Math.abs(d[i * 4] - bg[0]) <= TOL && Math.abs(d[i * 4 + 1] - bg[1]) <= TOL && Math.abs(d[i * 4 + 2] - bg[2]) <= TOL;

  const seen = new Uint8Array(w * h), stack = new Int32Array(w * h);
  let top = 0;
  for (const i of border) if (!seen[i] && near(i)) { seen[i] = 1; stack[top++] = i; }
  while (top) {
    const i = stack[--top], x = i % w;
    const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
    for (const j of nb) if (j >= 0 && j < w * h && !seen[j] && near(j)) { seen[j] = 1; stack[top++] = j; }
  }
  // viền mềm: độ đục = tỉ lệ điểm không phải nền trong ô 3×3
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (seen[i]) { d[i * 4 + 3] = 0; continue; }
    let bgN = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && seen[yy * w + xx]) bgN++;
    }
    if (bgN) d[i * 4 + 3] = Math.round(255 * (1 - bgN / 9) * 0.9 + 25);
  }
}

function alphaBox(d, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > ALPHA_CUT) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

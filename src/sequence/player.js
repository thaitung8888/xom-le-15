// Chế độ chạy chuỗi ảnh render sẵn (từ Blender) thay cho cảnh Three.js.
// Bật bằng SETTINGS.sequence trong src/config/settings.js.
import { reduce } from '../env.js';

export function startSequence({ canvas, sequence, scroll, hud, onProgress, onReady }) {
  const ctx = canvas.getContext('2d');
  const N = scroll.N;
  const imgs = new Array(sequence.count);
  let loaded = 0, lastF = -1;

  function size() {
    canvas.width = innerWidth * Math.min(devicePixelRatio, 2);
    canvas.height = innerHeight * Math.min(devicePixelRatio, 2);
    lastF = -1;
  }
  addEventListener('resize', size); size();

  // Vẽ ảnh phủ kín màn hình (giống background-size: cover)
  function draw(i) {
    const im = imgs[i]; if (!im || !im.complete || !im.naturalWidth) return;
    const s = Math.max(canvas.width / im.naturalWidth, canvas.height / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }

  for (let i = 0; i < sequence.count; i++) {
    const im = new Image(); im.decoding = 'async';
    im.onload = im.onerror = () => {
      loaded++; onProgress(loaded / sequence.count);
      if (loaded === sequence.count) onReady();
    };
    im.src = sequence.src(i); imgs[i] = im;
  }

  let p = 0;
  (function tick() {
    requestAnimationFrame(tick);
    const target = scroll.target(); p += (target - p) * (reduce ? 1 : 0.1);
    const f = Math.round(p / (N - 1) * (sequence.count - 1));
    if (f !== lastF) { draw(f); lastF = f; }
    hud.update(p);
  })();
}

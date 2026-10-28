// Khởi động cảnh Three.js: dựng từng khu (có thanh tải), rồi chạy vòng lặp vẽ.
import { initCore, renderer, scene, camera, hotspots, runFrame } from './core.js';
import { BUILD_STEPS } from './zones/index.js';
import { createCameraRig } from './cameraRig.js';
import { createHotspots } from '../ui/hotspots.js';
import { reduce } from '../env.js';

export function startScene({ canvas, stations, scroll, hud, onProgress, onReady }) {
  initCore(canvas);
  const rig = createCameraRig(stations);
  let cur = 0, last = 0, hs;

  return new Promise(resolve => {
    let i = 0;
    // Dựng mỗi khu ở một khung hình riêng để thanh tải kịp cập nhật
    (function next() {
      if (i < BUILD_STEPS.length) {
        BUILD_STEPS[i++]();
        onProgress(0.1 + 0.85 * i / BUILD_STEPS.length);
        requestAnimationFrame(next);
        return;
      }
      hs = createHotspots(hotspots);
      rig.fit(); scroll.measure();
      cur = scroll.target(); rig.place(cur);
      renderer.compile(scene, camera);
      onReady();
      requestAnimationFrame(loop);
      resolve();
    })();
  });

  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, (t - (last || t)) / 1000); last = t;
    const target = scroll.target();
    cur += (target - cur) * (reduce ? 1 : 1 - Math.exp(-dt * 4.2));
    if (Math.abs(target - cur) < 1e-4) cur = target;
    rig.place(cur);
    hud.update(cur);
    runFrame(t, dt);
    hs.update(cur, camera);
    renderer.render(scene, camera);
  }
}

// Kiểm tra trình duyệt có WebGL không
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

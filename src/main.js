// Điểm vào của trang: dựng đường cuộn và giao diện, rồi chọn cách vẽ nền
// (cảnh Three.js, chuỗi ảnh render, hoặc chỉ giao diện nếu máy không có WebGL).
import './styles/main.css';
import { $ } from './env.js';
import { STATIONS } from './config/stations.js';
import { SETTINGS } from './config/settings.js';
import { FONTS_TO_LOAD } from './config/brand.js';
import { renderTrack } from './ui/sections.js';
import { createScroll } from './ui/scroll.js';
import { createHud } from './ui/hud.js';
import { setLoad, finishLoad, paintLoaderBadge, fontsReady } from './ui/loader.js';
import { loadCatalog } from './data/catalog.js';

const sections = renderTrack(STATIONS, $('track'));
const scroll = createScroll(sections);
const hud = createHud(STATIONS, scroll);
const canvas = $('scene');

paintLoaderBadge();
setLoad(0.04);

// Chỉ giao diện, không có nền 3D
function runUIOnly() {
  document.body.classList.add('no-webgl');
  finishLoad();
  (function tick() { requestAnimationFrame(tick); hud.update(scroll.target()); })();
}

// Chờ phông chữ và danh sách sản phẩm (Supabase) cùng lúc rồi mới dựng cảnh
Promise.all([fontsReady(FONTS_TO_LOAD), loadCatalog()]).then(async () => {
  paintLoaderBadge();
  if (SETTINGS.sequence) {
    const { startSequence } = await import('./sequence/player.js');
    startSequence({ canvas, sequence: SETTINGS.sequence, scroll, hud, onProgress: setLoad, onReady: finishLoad });
    return;
  }
  // Tải phần 3D riêng để màn hình tải hiện ngay, không phải chờ Three.js
  const { startScene, hasWebGL } = await import('./scene/index.js');
  if (!hasWebGL()) return runUIOnly();
  try {
    await startScene({ canvas, stations: STATIONS, scroll, hud, onProgress: setLoad, onReady: finishLoad });
  } catch (err) {
    console.error(err);
    runUIOnly();
  }
});

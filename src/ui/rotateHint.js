// Gợi ý xoay ngang khi xem bằng điện thoại cầm dọc.
// - Tự ẩn khi người xem xoay ngang; đã xoay ngang một lần hoặc bấm "Vẫn xem màn dọc" thì không hiện lại trong phiên này.
// - Trình duyệt hỗ trợ (Chrome Android): thêm nút mở toàn màn hình và khoá chiều ngang. iPhone không hỗ trợ nên nút ẩn đi.
import { $ } from '../env.js';

const KEY = 'xomle-rotate-hint';
const box = $('rotate');
const portrait = matchMedia('(orientation: portrait)');
const touch = matchMedia('(pointer: coarse)');

const isPhoneSize = () => Math.max(screen.width, screen.height) < 1100;
const done = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const markDone = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* chế độ ẩn danh: bỏ qua */ } };

function update() {
  const want = touch.matches && isPhoneSize() && portrait.matches && !done();
  if (!portrait.matches && !box.hidden) markDone();       // đã xoay ngang → coi như xong
  if (want === !box.hidden) return;
  box.hidden = !want;
  document.documentElement.classList.toggle('rotate-open', want);
  if (want) $('rotSkip').focus({ preventScroll: true });
}

const canLock = !!(document.documentElement.requestFullscreen && screen.orientation && 'lock' in screen.orientation);
$('rotFull').hidden = !canLock;
$('rotFull').addEventListener('click', async () => {
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    await screen.orientation.lock('landscape');
  } catch { /* trình duyệt từ chối: người xem tự xoay tay */ }
  update();
});
$('rotSkip').addEventListener('click', () => { markDone(); update(); });

export function initRotateHint() {
  portrait.addEventListener?.('change', update);
  addEventListener('resize', update);
  update();
}

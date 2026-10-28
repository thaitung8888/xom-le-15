// Đổi vị trí cuộn trang thành "tiến độ" p từ 0 đến N-1 (mỗi số nguyên là một trạm).
import { reduce } from '../env.js';

export function createScroll(sections) {
  const N = sections.length;
  let centers = [];

  function measure() {
    centers = sections.map(s => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2);
  }

  // Tiến độ thô: tâm màn hình đang nằm giữa trạm nào
  function rawProgress() {
    const ref = scrollY + innerHeight / 2;
    if (ref <= centers[0]) return 0;
    for (let i = 0; i < N - 1; i++) {
      if (ref < centers[i + 1]) return i + (ref - centers[i]) / (centers[i + 1] - centers[i]);
    }
    return N - 1;
  }

  // Giữ camera đứng lại quanh mỗi trạm, chỉ di chuyển ở khoảng giữa hai trạm
  function dwell(p) {
    const i = Math.floor(p), f = p - i;
    const g = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
    return Math.min(N - 1, i + g * g * (3 - 2 * g));
  }

  const target = () => dwell(rawProgress());

  function goTo(i) {
    const s = sections[i];
    const top = s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2;
    scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }

  addEventListener('resize', measure);
  measure();
  return { N, measure, target, goTo };
}

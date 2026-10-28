// Phần giao diện chạy theo tiến độ cuộn: phần trăm, thanh trạm, chú thích ở góc.
import { $, reduce } from '../env.js';
import { captionHtml } from './sections.js';

export function createHud(stations, scroll) {
  const N = stations.length;
  const meter = $('meter'), rail = $('rail'), caption = $('caption');

  // Thanh trạm bên phải
  const railBtns = stations.map((st, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    const num = i && i < N - 1 ? String(i).padStart(2, '0') + ' · ' : '';
    b.innerHTML = `<span class="lbl">${num}${st.label}</span><span class="tick"></span>`;
    b.setAttribute('aria-label', st.label);
    b.addEventListener('click', () => scroll.goTo(i));
    li.appendChild(b); rail.appendChild(li);
    return b;
  });

  // Nút "Đi lại từ đầu ngõ" nằm trong chú thích nên bắt sự kiện ở document
  document.addEventListener('click', e => { if (e.target.closest('[data-action="top"]')) scroll.goTo(0); });

  // Chú thích: giữ nguyên cho tới khi trạm tiếp theo thay chữ
  let capTimer = 0;
  function swapCaption(i) {
    clearTimeout(capTimer);
    caption.classList.remove('show');
    const html = captionHtml(stations[i], i);
    if (!html) return;
    capTimer = setTimeout(() => {
      caption.innerHTML = html;
      caption.classList.toggle('right', stations[i].side === 'right');
      void caption.offsetWidth;
      caption.classList.add('show');
    }, reduce ? 0 : 260);
  }

  let active = -1;
  function update(p) {
    meter.textContent = String(Math.round(p / (N - 1) * 100)).padStart(2, '0') + '%';
    const a = Math.round(p);
    if (a === active) return;
    active = a;
    railBtns.forEach((b, i) => { b.classList.toggle('on', i === a); b.setAttribute('aria-current', i === a ? 'step' : 'false'); });
    swapCaption(a);
  }

  return { update };
}

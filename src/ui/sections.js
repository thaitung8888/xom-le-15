// Tạo các <section> của đường cuộn từ cấu hình trạm, và HTML cho chú thích ở góc.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderTrack(stations, track) {
  track.innerHTML = '';
  return stations.map(st => {
    const s = document.createElement('section');
    s.className = 'stop' + (st.kind ? ' ' + st.kind : '');
    s.id = st.id;
    s.dataset.label = st.label;
    if (st.kind === 'hero') {
      const h = st.hero;
      // titleHtml là nội dung tự viết trong cấu hình (cho phép thẻ <em>), các trường khác được thoát ký tự
      s.innerHTML = `
        <div class="hero-copy">
          <p class="eyebrow">${h.eyebrow.map(t => `<span>${esc(t)}</span>`).join('')}</p>
          <h1>${h.titleHtml}</h1>
          <p class="lede">${esc(h.lede)}</p>
          <p class="hint"><i></i>${esc(h.hint)}</p>
        </div>`;
    }
    track.appendChild(s);
    return s;
  });
}

// Số thứ tự 01, 02… chỉ đánh cho các trạm thường (bỏ màn mở đầu và màn kết)
export function captionHtml(st, index) {
  if (st.kind === 'hero') return '';
  if (st.kind === 'outro') {
    return `
      <p class="eyebrow"><span>${esc(st.eyebrow)}</span></p>
      <h2>${esc(st.title)}</h2>
      <dl class="hours">${st.hours.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <button class="btn" data-action="top" type="button">${esc(st.cta)}</button>
      <p class="fine">${esc(st.fine)}</p>`;
  }
  return `
    <p class="eyebrow"><span class="num">${String(index).padStart(2, '0')}</span><span>${esc(st.label)}</span></p>
    <h2>${esc(st.title)}</h2>
    <p>${esc(st.body)}</p>`;
}

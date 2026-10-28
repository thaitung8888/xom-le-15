// Thông tin môi trường đọc một lần khi tải trang.
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const small = Math.min(innerWidth, innerHeight) < 700;
export const $ = id => document.getElementById(id);

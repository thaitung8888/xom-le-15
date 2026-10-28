// Thẻ thông tin sản phẩm hiện cạnh chấm giá.
import { $ } from '../env.js';
import { formatPrice } from '../config/products.js';

const card = $('card');
let current = null;

export function openCard(product, x, y) {
  current = product;
  $('cardk').textContent = product.kind;
  $('cardn').textContent = product.name;
  $('cardp').textContent = formatPrice(product.price);
  $('cardm').textContent = product.meta || '';
  card.hidden = false;
  const w = card.offsetWidth, h = card.offsetHeight;
  let cx = x + 22, cy = y - h / 2;
  if (cx + w > innerWidth - 16) cx = x - w - 22;
  cx = Math.max(16, Math.min(cx, innerWidth - w - 16));
  cy = Math.max(64, Math.min(cy, innerHeight - h - 16));
  card.style.transform = `translate(${cx}px,${cy}px)`;
}

export function closeCard() { card.hidden = true; current = null; }
export const openProduct = () => current;

$('cardx').addEventListener('click', closeCard);
addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });

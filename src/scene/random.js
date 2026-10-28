// Số ngẫu nhiên có hạt giống: cảnh lần nào tải cũng giống nhau.
import { SETTINGS } from '../config/settings.js';

export function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const R = rng(SETTINGS.seed);
export const rr = (a, b) => a + R() * (b - a);
export const pick = arr => arr[Math.floor(R() * arr.length)];

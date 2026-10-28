// Hàm dựng nhanh: vật liệu, khối hộp, mặt phẳng, quầng sáng, vệt sáng hắt.
import { T, scene } from './core.js';
import { radialTex } from './textures/canvas.js';

const mats = {};
export function std(color, rough = 0.8, metal = 0, extra = {}) {
  const plain = !Object.keys(extra).length, key = color + '|' + rough + '|' + metal;
  if (plain && mats[key]) return mats[key];
  const m = new T.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
  if (plain) mats[key] = m;
  return m;
}
export function glow(color, intensity = 1.6) { return new T.MeshStandardMaterial({ color: '#000', emissive: color, emissiveIntensity: intensity }); }
export function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m;
}
export function plane(w, h, mat, x, y, z, ry = 0, parent = scene) {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m;
}
export function halo(color, size, x, y, z, opacity = 0.6) {
  const s = new T.Sprite(new T.SpriteMaterial({ map: radialTex(color), blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.set(size, size, 1); s.position.set(x, y, z); scene.add(s); return s;
}
export function pool(x, y, z, ry, w = 2.4, h = 2.6, opacity = 0.32, color = 'rgba(255,214,160,1)') {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: radialTex(color), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity }));
  m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
}
export const neonMaterial = map => new T.MeshBasicMaterial({ map, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });

// Mô hình giày đơn giản: đế, thân, mũi, cổ, sọc hai bên, dây.
import { T } from '../core.js';
import { std } from '../helpers.js';

export const SHOE_G = {
  sole: new T.BoxGeometry(0.3, 0.045, 0.11), up: new T.BoxGeometry(0.19, 0.085, 0.1), toe: new T.SphereGeometry(0.06, 14, 10),
  col: new T.BoxGeometry(0.1, 0.035, 0.092), str: new T.BoxGeometry(0.15, 0.025, 0.004), lace: new T.BoxGeometry(0.09, 0.012, 0.06)
};
export function shoeMesh(up, sole, accent) {
  const g = new T.Group();
  const s = new T.Mesh(SHOE_G.sole, std(sole, 0.7)); s.position.y = 0.022; g.add(s);
  const u = new T.Mesh(SHOE_G.up, std(up, 0.75)); u.position.set(-0.045, 0.085, 0); g.add(u);
  const t = new T.Mesh(SHOE_G.toe, std(up, 0.75)); t.scale.set(1.45, 0.72, 0.85); t.position.set(0.075, 0.065, 0); g.add(t);
  const c = new T.Mesh(SHOE_G.col, std('#' + new T.Color(up).offsetHSL(0, 0, -0.12).getHexString(), 0.8)); c.position.set(-0.08, 0.135, 0); g.add(c);
  for (const z of [0.051, -0.051]) { const sr = new T.Mesh(SHOE_G.str, std(accent, 0.6)); sr.position.set(0, 0.075, z); sr.rotation.z = 0.22; g.add(sr); }
  const l = new T.Mesh(SHOE_G.lace, std('#f2efe6', 0.8)); l.position.set(0.02, 0.13, 0); l.rotation.z = -0.25; g.add(l);
  return g;
}

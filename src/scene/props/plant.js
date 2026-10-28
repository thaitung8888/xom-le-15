// Chậu cây lá to.
import { BR } from '../../config/brand.js';
import { T, scene } from '../core.js';
import { std } from '../helpers.js';
import { R, rr, pick } from '../random.js';

export function plant(x, z, s = 1) {
  const pot = new T.Mesh(new T.CylinderGeometry(0.22 * s, 0.17 * s, 0.42 * s, 20), std(BR.ivory, 0.6));
  pot.position.set(x, 0.21 * s, z); scene.add(pot);
  const soil = new T.Mesh(new T.CircleGeometry(0.2 * s, 16), std('#2b2118', 1)); soil.rotation.x = -Math.PI / 2; soil.position.set(x, 0.41 * s, z); scene.add(soil);
  const leaf = new T.SphereGeometry(0.14 * s, 10, 8), stem = std('#3d5a2a', 0.8);
  const greens = ['#2f5a2a', '#3e6e34', '#264d24', '#4a7a3a'];
  for (let i = 0; i < 16; i++) {
    const a = R() * 6.283, h = rr(0.55, 1.35) * s, d = rr(0.08, 0.32) * s;
    const st = new T.Mesh(new T.CylinderGeometry(0.008, 0.01, h - 0.4 * s, 5), stem);
    st.position.set(x + Math.cos(a) * d / 2, 0.4 * s + (h - 0.4 * s) / 2, z + Math.sin(a) * d / 2); st.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); scene.add(st);
    const l = new T.Mesh(leaf, std(pick(greens), 0.7, 0, { side: T.DoubleSide }));
    l.scale.set(1.5, 0.18, 1.0); l.position.set(x + Math.cos(a) * d, h, z + Math.sin(a) * d);
    l.rotation.set(rr(-0.6, 0.6), a, rr(-0.5, 0.5)); scene.add(l);
  }
}

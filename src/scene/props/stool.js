// Ghế đẩu nhựa thấp.
import { T, scene } from '../core.js';
import { std } from '../helpers.js';

export function stool(color, x, z, y = 0) {
  const s = new T.Mesh(new T.CylinderGeometry(0.15, 0.19, 0.27, 14, 1, true), std(color, 0.5, 0, { side: T.DoubleSide }));
  s.position.set(x, y + 0.135, z); scene.add(s);
  const top = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.02, 14), std(color, 0.5)); top.position.set(x, y + 0.27, z); scene.add(top);
}

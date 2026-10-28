// Rèm vải gợn sóng.
import { T } from '../core.js';
import { std } from '../helpers.js';

export function curtain(width, height, color) {
  const geo = new T.PlaneGeometry(width, height, Math.max(8, Math.round(width * 34)), 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 26) * 0.045 + Math.sin(p.getX(i) * 7.3) * 0.02);
  geo.computeVertexNormals();
  return new T.Mesh(geo, std(color, 1, 0, { side: T.DoubleSide }));
}

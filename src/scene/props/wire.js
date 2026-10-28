// Dây điện võng giữa các điểm.
import { T, scene } from '../core.js';
import { std } from '../helpers.js';

export function wire(points, r = 0.012) {
  const c = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  scene.add(new T.Mesh(new T.TubeGeometry(c, 40, r, 5, false), std('#0b0b0c', 0.6)));
}
